from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector
from datetime import datetime, timedelta
from db import get_connection
from discount_engine import DiscountEngine
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the DiscountEngine with database configuration
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}
discount_engine = DiscountEngine(db_config)

# Helper function to convert datetime objects to string
def json_serial(obj):
    if isinstance(obj, (datetime, datetime.date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

# PRODUCTS API
@app.route('/api/products', methods=['GET'])
def get_products():
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Products")
    products = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(products)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Products WHERE product_id = %s", (product_id,))
    product = cursor.fetchone()
    cursor.close()
    connection.close()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product)

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    required_fields = ['product_id', 'name', 'base_price', 'sku']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO Products
            (product_id, name, base_price, category, sku, current_price)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['product_id'],
            data['name'],
            data['base_price'],
            data.get('category', None),
            data['sku'],
            data['base_price']  # Current price starts at base price
        ))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Product created successfully"}), 201
    except mysql.connector.Error as error:
        return jsonify({"error": str(error)}), 500

# INVENTORY API
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT i.*, p.name as product_name
        FROM Inventory i
        JOIN Products p ON i.product_id = p.product_id
    """)
    inventory = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(json.loads(json.dumps(inventory, default=json_serial)))

@app.route('/api/inventory/expiring', methods=['GET'])
def get_expiring_inventory():
    days = request.args.get('days', 30, type=int)

    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    expiry_date = (datetime.now() + timedelta(days=days)).date()

    cursor.execute("""
        SELECT i.*, p.name as product_name, p.current_price, p.base_price
        FROM Inventory i
        JOIN Products p ON i.product_id = p.product_id
        WHERE i.expiration_date <= %s AND i.expiration_date >= CURDATE()
        ORDER BY i.expiration_date ASC
    """, (expiry_date,))

    inventory = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(json.loads(json.dumps(inventory, default=json_serial)))

@app.route('/api/inventory', methods=['POST'])
def create_inventory():
    data = request.json
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    required_fields = ['product_id', 'batch_id', 'quantity', 'expiration_date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO Inventory
            (product_id, batch_id, quantity, location, manufacture_date, expiration_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['product_id'],
            data['batch_id'],
            data['quantity'],
            data.get('location', None),
            data.get('manufacture_date', None),
            data['expiration_date']
        ))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Inventory created successfully"}), 201
    except mysql.connector.Error as error:
        return jsonify({"error": str(error)}), 500

# DISCOUNT RULES API
@app.route('/api/discount-rules', methods=['GET'])
def get_discount_rules():
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM DiscountRules ORDER BY priority DESC")
    rules = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(json.loads(json.dumps(rules, default=json_serial)))

@app.route('/api/discount-rules', methods=['POST'])
def create_discount_rule():
    data = request.json
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    required_fields = ['name', 'days_before_expiry', 'discount_percentage']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO DiscountRules
            (name, description, days_before_expiry, discount_percentage, category, priority, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['name'],
            data.get('description', None),
            data['days_before_expiry'],
            data['discount_percentage'],
            data.get('category', None),
            data.get('priority', 0),
            data.get('is_active', True)
        ))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Discount rule created successfully"}), 201
    except mysql.connector.Error as error:
        return jsonify({"error": str(error)}), 500

@app.route('/api/discount-rules/<int:rule_id>', methods=['PUT'])
def update_discount_rule(rule_id):
    data = request.json
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        # First check if rule exists
        cursor.execute("SELECT * FROM DiscountRules WHERE rule_id = %s", (rule_id,))
        rule = cursor.fetchone()

        if not rule:
            cursor.close()
            connection.close()
            return jsonify({"error": "Discount rule not found"}), 404

        # Update the rule
        cursor.execute("""
            UPDATE DiscountRules SET
            name = %s,
            description = %s,
            days_before_expiry = %s,
            discount_percentage = %s,
            category = %s,
            priority = %s,
            is_active = %s,
            updated_at = CURRENT_TIMESTAMP
            WHERE rule_id = %s
        """, (
            data.get('name', rule['name']),
            data.get('description', rule['description']),
            data.get('days_before_expiry', rule['days_before_expiry']),
            data.get('discount_percentage', rule['discount_percentage']),
            data.get('category', rule['category']),
            data.get('priority', rule['priority']),
            data.get('is_active', rule['is_active']),
            rule_id
        ))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Discount rule updated successfully"})
    except mysql.connector.Error as error:
        return jsonify({"error": str(error)}), 500

# DISCOUNT CALCULATION ENDPOINT
@app.route('/api/discounts/calculate', methods=['POST'])
def trigger_discount_calculation():
    try:
        discounts = discount_engine.run_discount_cycle()
        return jsonify({"message": "Discounts applied successfully", "discounts": discounts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DISCOUNT ANALYTICS
@app.route('/api/discounts/analytics', methods=['GET'])
def get_discount_analytics():
    connection = get_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)

    # Get summary of active discounts
    cursor.execute("""
        SELECT
            COUNT(*) as total_discounted_products,
            AVG(discount_percentage) as avg_discount_percentage,
            SUM(original_price - discounted_price) as total_discount_value
        FROM AppliedDiscounts
        WHERE is_active = TRUE
    """)

    summary = cursor.fetchone()

    # Get discounts by category
    cursor.execute("""
        SELECT
            p.category,
            COUNT(*) as product_count,
            AVG(ad.discount_percentage) as avg_discount
        FROM AppliedDiscounts ad
        JOIN Products p ON ad.product_id = p.product_id
        WHERE ad.is_active = TRUE
        GROUP BY p.category
    """)

    by_category = cursor.fetchall()

    # Get soon expiring items
    cursor.execute("""
        SELECT
            p.product_id,
            p.name,
            i.expiration_date,
            p.current_price,
            p.base_price,
            (p.base_price - p.current_price) as discount_value
        FROM Products p
        JOIN Inventory i ON p.product_id = i.product_id
        WHERE i.expiration_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        AND i.expiration_date >= CURDATE()
        ORDER BY i.expiration_date ASC
        LIMIT 10
    """)

    soon_expiring = cursor.fetchall()

    cursor.close()
    connection.close()

    analytics = {
        "summary": summary,
        "by_category": by_category,
        "soon_expiring": soon_expiring
    }

    return jsonify(json.loads(json.dumps(analytics, default=json_serial)))

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
