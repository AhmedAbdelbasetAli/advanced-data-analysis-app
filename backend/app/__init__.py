from flask import Flask
#from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient
from flask_cors import CORS
from google.cloud.sql.connector import Connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

#db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    '''
    # Initialize Cloud SQL Connector
    connector = Connector()

    def get_pg_conn():
        return connector.connect(
            os.getenv('INSTANCE_CONNECTION_NAME'),
            "pg8000",
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASS'),
            database=os.getenv('DB_NAME')  # Corrected parameter name
        )

    # Configure SQLAlchemy
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'creator': get_pg_conn
    }

    db.init_app(app)
    '''
    # MongoDB configuration
    # MongoDB setup
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/mydatabase')
    mongo_client = MongoClient(mongo_uri)
    mongo_db = mongo_client.get_default_database()

    app.config['MONGO_DB'] = mongo_db

    with app.app_context():
        # Import and register blueprints
        from .routes import tabular, images, text
        
        app.register_blueprint(tabular.bp)
        app.register_blueprint(images.bp)
        app.register_blueprint(text.bp)

        # Store MongoDB connection in app config
       

    return app