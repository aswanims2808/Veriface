import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add api-service root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.user import User
from app.models.history import AnalysisHistory
from app.core.service_clients import get_inference_client

# Setup Test Database (in-memory SQLite with StaticPool to share connection)
from sqlalchemy.pool import StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override for db session
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Mock Inference Client
class MockInferenceServiceClient:
    def predict(self, filename: str, file_bytes: bytes) -> dict:
        return {
            "prediction": "REAL",
            "confidence": 99.4,
            "real_confidence": 99.4,
            "ai_confidence": 0.2,
            "deepfake_confidence": 0.4,
            "forensics": {
                "signals_detected": 0,
                "noise_consistency": "High",
                "ela_score": 0.0,
                "compression_artifacts": "Low"
            },
            "face_coords": [[10, 20, 100, 100]],
            "risk_score": 0.6,
            "processing_time": "0.04s"
        }
    
    def check_health(self) -> dict:
        return {"status": "healthy"}

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_inference_client] = lambda: MockInferenceServiceClient()

# Build Test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def init_test_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create Demo User in test db (since main app lifespan isn't always fully executed in simple TestClient imports)
    from app.models.user import User
    from app.auth.auth_handler import hash_password
    db = TestingSessionLocal()
    demo_user = db.query(User).filter(User.username == 'Demo User').first()
    if not demo_user:
        demo_user = User(
            username='Demo User',
            email='demo@veriface.ai',
            password_hash=hash_password('demo123')
        )
        db.add(demo_user)
        db.commit()
    db.close()
    
    yield
    # Drop all tables
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "VeriFace API Gateway"}

def test_ready_check():
    response = client.get("/ready")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "ready"
    assert res_data["database"] == "healthy"
    assert res_data["inference_service"] == "healthy"

def test_auth_registration_and_login():
    # 1. Register User
    payload = {
        "username": "testfastapi",
        "email": "testfastapi@veriface.ai",
        "password": "securepassword"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    assert "user" in response.json()
    assert response.json()["user"]["username"] == "testfastapi"

    # 2. Duplicate registration check
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409

    # 3. Login
    login_payload = {
        "username": "testfastapi",
        "password": "securepassword"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "token" in response.json()
    token = response.json()["token"]

    # 4. Verify Token
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/verify", headers=headers)
    assert response.status_code == 200
    assert response.json()["valid"] is True
    assert response.json()["user"]["username"] == "testfastapi"

    # 5. Fetch Profile
    response = client.get("/api/v1/user/profile", headers=headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testfastapi"
    assert response.json()["total_analyses"] == 0

def test_prediction_and_history_logging():
    # Register and login to retrieve JWT token
    reg_payload = {
        "username": "predictuser",
        "email": "predictuser@veriface.ai",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    
    login_payload = {
        "username": "predictuser",
        "password": "password123"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload dummy image
    file_payload = {"file": ("test.jpg", b"dummy image bytes", "image/jpeg")}
    form_payload = {"detection_type": "Single"}
    
    response = client.post("/api/v1/predict", files=file_payload, data=form_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["prediction"] == "REAL"
    assert response.json()["confidence"] == 99.4
    analysis_id = response.json()["analysis_id"]

    # Fetch profile (total analyses should now be 1)
    profile_res = client.get("/api/v1/user/profile", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["total_analyses"] == 1

    # Fetch History
    history_res = client.get("/api/v1/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()["analyses"]) == 1
    assert history_res.json()["analyses"][0]["id"] == analysis_id

    # Fetch share token
    share_res = client.post(f"/api/v1/history/{analysis_id}/share", headers=headers)
    assert share_res.status_code == 200
    assert "token" in share_res.json()
    share_token = share_res.json()["token"]

    # Fetch public shared analysis (no authorization header needed)
    public_res = client.get(f"/api/v1/api/share/{share_token}")
    assert public_res.status_code == 200
    assert public_res.json()["prediction"] == "REAL"
    assert public_res.json()["confidence"] == 99.4
