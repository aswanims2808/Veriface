import os
import sys
import unittest
from unittest.mock import patch

# Add services/api-service directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.app import create_app
from app.core.database import SessionLocal, init_db
from app.models.user import User

class TestAPIService(unittest.TestCase):
    def setUp(self):
        # Use in-memory SQLite for testing
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        os.environ['JWT_SECRET_KEY'] = 'test-secret-key'
        
        self.app = create_app()
        self.client = self.app.test_client()
        
        # Initialize Database tables
        with self.app.app_context():
            init_db()

    def test_health_check(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "healthy", "service": "VeriFace API Gateway"})

    def test_user_registration_and_login(self):
        # 1. Register a new user
        reg_payload = {
            "username": "testuser",
            "email": "testuser@veriface.ai",
            "password": "password123"
        }
        response = self.client.post('/auth/register', json=reg_payload)
        self.assertEqual(response.status_code, 201)
        self.assertIn("user", response.json)
        self.assertEqual(response.json["user"]["username"], "testuser")

        # 2. Try registering the same user (should fail with 409)
        response = self.client.post('/auth/register', json=reg_payload)
        self.assertEqual(response.status_code, 409)

        # 3. Login
        login_payload = {
            "username": "testuser",
            "password": "password123"
        }
        response = self.client.post('/auth/login', json=login_payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.json)
        token = response.json["token"]

        # 4. Verify token
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.get('/auth/verify', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["valid"])

        # 5. Fetch profile
        response = self.client.get('/user/profile', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["username"], "testuser")
        self.assertEqual(response.json["total_analyses"], 0)

    @patch('app.services.prediction_service.PredictionService.process_prediction')
    def test_predict_route_mocked(self, mock_process_prediction):
        # Mock prediction output
        mock_process_prediction.return_value = {
            "result": {
                "prediction": "REAL",
                "confidence": 99.4,
                "real_confidence": 99.4,
                "ai_confidence": 0.2,
                "deepfake_confidence": 0.4,
                "forensics": {},
                "face_coords": [[10, 20, 100, 100]],
                "risk_score": 0.6,
                "processing_time": "0.04s"
            },
            "status_code": 200
        }

        # Login to get a token
        reg_payload = {
            "username": "predictuser",
            "email": "predict@veriface.ai",
            "password": "password123"
        }
        self.client.post('/auth/register', json=reg_payload)
        
        login_payload = {
            "username": "predictuser",
            "password": "password123"
        }
        login_res = self.client.post('/auth/login', json=login_payload)
        token = login_res.json["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Call predict endpoint
        # Create a dummy file stream
        import io
        data = {
            'file': (io.BytesIO(b"dummy image bytes"), 'face.jpg'),
            'detection_type': 'Single'
        }
        
        response = self.client.post('/predict', data=data, content_type='multipart/form-data', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["prediction"], "REAL")
        self.assertEqual(response.json["confidence"], 99.4)

if __name__ == '__main__':
    unittest.main()
