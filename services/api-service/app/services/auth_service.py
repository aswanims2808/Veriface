from datetime import datetime
import logging
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.history import AnalysisHistory
from app.auth.auth_handler import hash_password, verify_password, generate_token

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def register_user(db: Session, username: str, email: str, password: str) -> dict:
        username = username.strip()
        email = email.strip()
        
        if not username or not email or not password:
            return {'error': 'Username, email, and password are required', 'status_code': 400}
        
        if len(password) < 6:
            return {'error': 'Password must be at least 6 characters', 'status_code': 400}
        
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing_user:
                if existing_user.username == username:
                    return {'error': 'Username already exists', 'status_code': 409}
                else:
                    return {'error': 'Email already exists', 'status_code': 409}
            
            # Create user
            new_user = User(
                username=username,
                email=email,
                password_hash=hash_password(password)
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            logger.info(f"New user registered: {username}")
            return {
                'message': 'User registered successfully',
                'user': new_user,
                'status_code': 201
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Registration database error: {e}")
            return {'error': 'Registration failed due to server error', 'status_code': 500}

    @staticmethod
    def login_user(db: Session, username_or_email: str, password: str) -> dict:
        username_or_email = username_or_email.strip()
        
        if not username_or_email or not password:
            return {'error': 'Username/email and password are required', 'status_code': 400}
        
        try:
            user = db.query(User).filter(
                (User.username == username_or_email) | (User.email == username_or_email)
            ).first()
            
            if not user or not verify_password(password, user.password_hash):
                logger.warning(f"Login failed for {username_or_email}")
                return {'error': 'Invalid credentials', 'status_code': 401}
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)
            
            token = generate_token(user.id, user.username)
            logger.info(f"User logged in: {user.username}")
            return {
                'message': 'Login successful',
                'token': token,
                'user': user,
                'status_code': 200
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Login database error: {e}")
            return {'error': 'Login failed due to server error', 'status_code': 500}

    @staticmethod
    def verify_user_token(db: Session, user_id: int) -> dict:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {'error': 'User not found', 'status_code': 404}
            return {
                'valid': True,
                'user': user,
                'status_code': 200
            }
        except Exception as e:
            logger.error(f"Token verify database error: {e}")
            return {'error': 'Verification failed due to server error', 'status_code': 500}

    @staticmethod
    def get_user_profile(db: Session, user_id: int) -> dict:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {'error': 'User not found', 'status_code': 404}
            
            analysis_count = db.query(AnalysisHistory).filter(
                AnalysisHistory.user_id == user.id
            ).count()
            
            return {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'total_analyses': analysis_count
            }
        except Exception as e:
            logger.error(f"Profile fetch database error: {e}")
            return {'error': 'Profile fetch failed', 'status_code': 500}
