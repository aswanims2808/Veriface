import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///veriface.db')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://veriface-41cr.vercel.app').split(',')
    
    # Path is relative to the api-service root: /services/api-service/uploads
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads'))
    
    # URL of the inference microservice
    INFERENCE_SERVICE_URL = os.getenv('INFERENCE_SERVICE_URL', 'http://localhost:5001')
