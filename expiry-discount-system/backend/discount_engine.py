import mysql.connector
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DiscountEngine:
    def __init__(self, db_config):
        """Initialize the discount engine with database configuration"""
        self.db_config = db_config

    def _get_connection(self):
        """Create and return a database connection"""
        try:
            conn = mysql.connector.connect(**self.db_config)
            return conn
        except mysql.connector.Error as err:
            logger.error(f"Database connection failed: {err}")
            raise

    def get_expiring_products(self):
        """Get all products with their expiration dates"""
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT
            p.product_id,
            p.name,
            p.base_price,
            p.current_price,
            p.category,
            i.inventory_id,
            i.batch_id,
            i.quantity,
            i.expiration_date
        FROM
            Products p
        JOIN
            Inventory i ON p.product_id = i.product_id
        ORDER BY
            i.expiration_date
        """

        cursor.execute(query)
        products = cursor.fetchall()
        cursor.close()
        conn.close()

        return products

    def get_applicable_discount_rules(self):
        """Get all active discount rules"""
        conn = self._get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT
            rule_id,
            name,
            days_before_expiry,
            discount_percentage,
            category,
            priority
        FROM
            DiscountRules
        WHERE
            is_active = 1
        ORDER BY
            priority DESC
        """

        cursor.execute(query)
        rules = cursor.fetchall()
        cursor.close()
        conn.close()

        return rules

    def calculate_discounts(self):
        """Calculate discounts for products based on expiration dates"""
        today = datetime.now().date()
        products = self.get_expiring_products()
        rules = self.get_applicable_discount_rules()

        discounts_to_apply = []

        for product in products:
            expiry_date = product['expiration_date']
            days_until_expiry = (expiry_date - today).days

            # Skip if already expired
            if days_until_expiry < 0:
                continue

            # Find applicable rule with highest priority
            applicable_rule = None

            for rule in rules:
                # Check if rule applies to this category or is a general rule
                category_match = (rule['category'] is None or rule['category'] == product['category'])

                # Check if within the expiry window
                within_window = days_until_expiry <= rule['days_before_expiry']

                if category_match and within_window:
                    if applicable_rule is None or rule['priority'] > applicable_rule['priority']:
                        applicable_rule = rule

            # Calculate discount if applicable rule found
            if applicable_rule:
                discount_percentage = applicable_rule['discount_percentage']
                original_price = product['base_price']
                discounted_price = round(original_price * (1 - discount_percentage / 100), 2)

                discounts_to_apply.append({
                    'product_id': product['product_id'],
                    'inventory_id': product['inventory_id'],
                    'rule_id': applicable_rule['rule_id'],
                    'original_price': original_price,
                    'discounted_price': discounted_price,
                    'discount_percentage': discount_percentage,
                    'expires_at': expiry_date,
                    'days_until_expiry': days_until_expiry
                })

        return discounts_to_apply

    def apply_discounts(self, discounts):
        """Apply calculated discounts to products"""
        if not discounts:
            logger.info("No discounts to apply")
            return

        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            conn.start_transaction()

            for discount in discounts:
                # Insert into AppliedDiscounts table
                insert_discount_query = """
                INSERT INTO AppliedDiscounts (
                    product_id,
                    inventory_id,
                    rule_id,
                    original_price,
                    discounted_price,
                    discount_percentage,
                    expires_at,
                    is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

                discount_values = (
                    discount['product_id'],
                    discount['inventory_id'],
                    discount['rule_id'],
                    discount['original_price'],
                    discount['discounted_price'],
                    discount['discount_percentage'],
                    discount['expires_at'],
                    True
                )

                cursor.execute(insert_discount_query, discount_values)
                discount_id = cursor.lastrowid

                # Update product price
                update_product_query = """
                UPDATE Products
                SET current_price = %s, discount_id = %s, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = %s
                """

                product_values = (
                    discount['discounted_price'],
                    discount_id,
                    discount['product_id']
                )

                cursor.execute(update_product_query, product_values)

                # Insert into discount history
                history_query = """
                INSERT INTO DiscountHistory (
                    discount_id,
                    product_id,
                    previous_price,
                    new_price
                ) VALUES (%s, %s, %s, %s)
                """

                history_values = (
                    discount_id,
                    discount['product_id'],
                    discount['original_price'],
                    discount['discounted_price']
                )

                cursor.execute(history_query, history_values)

                logger.info(f"Applied {discount['discount_percentage']}% discount to product {discount['product_id']} "
                            f"(expires in {discount['days_until_expiry']} days)")

            conn.commit()
            logger.info(f"Successfully applied {len(discounts)} discounts")

        except mysql.connector.Error as err:
            conn.rollback()
            logger.error(f"Error applying discounts: {err}")
            raise
        finally:
            cursor.close()
            conn.close()

    def run_discount_cycle(self):
        """Complete discount calculation and application cycle"""
        logger.info("Starting discount calculation cycle")
        discounts = self.calculate_discounts()
        logger.info(f"Found {len(discounts)} products to discount")
        self.apply_discounts(discounts)
        logger.info("Completed discount cycle")
        return discounts

# Example usage
if __name__ == "__main__":
    # Database configuration
    db_config = {
        'host': 'localhost',
        'user': 'your_username',
        'password': 'your_password',
        'database': 'discount_system'
    }

    # Initialize and run discount engine
    engine = DiscountEngine(db_config)
    discounts = engine.run_discount_cycle()

    # Print results
    if discounts:
        print(f"\nApplied {len(discounts)} discounts:")
        for discount in discounts:
            print(f"Product {discount['product_id']}: ${discount['original_price']} → "
                  f"${discount['discounted_price']} ({discount['discount_percentage']}% off, "
                  f"expires in {discount['days_until_expiry']} days)")
    else:
        print("No products to discount at this time")
