import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_connection():
    """Create and return a database connection"""
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    return connection

def close_connection(connection, cursor=None):
    """Close cursor and connection"""
    if cursor:
        cursor.close()
    if connection and connection.is_connected():
        connection.close()
