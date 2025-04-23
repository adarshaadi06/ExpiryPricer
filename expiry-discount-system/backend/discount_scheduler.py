import time
import schedule
import requests
from datetime import datetime

def run_discount_calculation():
    """Run the discount calculation job"""
    print(f"Running scheduled discount calculation at {datetime.now()}")
    try:
        response = requests.post('http://localhost:5000/api/discounts/calculate')
        if response.status_code == 200:
            print(f"Success: {response.json()}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

# Schedule the job to run every day at midnight
schedule.every().day.at("00:00").do(run_discount_calculation)

# Schedule an additional run at noon for testing
schedule.every().day.at("12:00").do(run_discount_calculation)

print("Discount scheduler started. Press Ctrl+C to exit.")

# Run the scheduler
while True:
    schedule.run_pending()
    time.sleep(60)  # Check every minute