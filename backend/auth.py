import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import logging

logger = logging.getLogger(__name__)

import hmac
import hashlib
import base64
import json

# Secret key for JWT - should be in environment variable in production
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
ALGORITHM = 'HS256'
TOKEN_EXPIRATION_HOURS = 24

def custom_jwt_encode(payload, secret, algorithm='HS256'):
    """Custom JWT implementation to bypass dependency issues"""
    header = {'typ': 'JWT', 'alg': algorithm}
    
    # Encode header
    json_header = json.dumps(header, separators=(',', ':')).encode('utf-8')
    b64_header = base64.urlsafe_b64encode(json_header).replace(b'=', b'').decode('utf-8')
    
    # Encode payload
    # Handle datetime objects manually if needed, but PyJWT handles standard claims
    # Here we assume payload values are serializable or already converted
    def json_serializer(obj):
        if isinstance(obj, (datetime, datetime.date)):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    json_payload = json.dumps(payload, separators=(',', ':'), default=json_serializer).encode('utf-8')
    b64_payload = base64.urlsafe_b64encode(json_payload).replace(b'=', b'').decode('utf-8')
    
    # Create signature
    msg = f"{b64_header}.{b64_payload}".encode('utf-8')
    if algorithm == 'HS256':
        signature = hmac.new(str(secret).encode('utf-8'), msg, hashlib.sha256).digest()
        b64_signature = base64.urlsafe_b64encode(signature).replace(b'=', b'').decode('utf-8')
    else:
        raise NotImplementedError("Only HS256 supported")
        
    return f"{b64_header}.{b64_payload}.{b64_signature}"

def custom_jwt_decode(token, secret, algorithms=['HS256']):
    """Custom JWT decode implementation"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError("Invalid token format")
            
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify signature
        msg = f"{header_b64}.{payload_b64}".encode('utf-8')
        # Add padding back? urlsafe_b64decode handles missing padding in some versions,
        # otherwise usually ends with '='.
        # But simpler: verify by re-signing
        
        if 'HS256' in algorithms:
            expected_sig = hmac.new(str(secret).encode('utf-8'), msg, hashlib.sha256).digest()
            expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).replace(b'=', b'').decode('utf-8')
            
            # Constant time comparison
            if not hmac.compare_digest(signature_b64, expected_sig_b64):
                raise ValueError("Invalid signature")
        
        # Decode payload
        # Pad with '='
        padding = len(payload_b64) % 4
        if padding:
            payload_b64 += '=' * (4 - padding)
            
        payload_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
        payload = json.loads(payload_json)
        
        # Check exp
        if 'exp' in payload:
            exp = payload['exp']
            # handle isoformat string from custom encode?
            if isinstance(exp, str):
                try:
                    exp_dt = datetime.fromisoformat(exp)
                    if exp_dt < datetime.utcnow():
                        raise ValueError("Token has expired")
                except:
                    # Maybe timestamp (int/float)
                    pass
            elif isinstance(exp, (int, float)):
                if datetime.utcnow().timestamp() > exp:
                     raise ValueError("Token has expired")

        return payload
    except Exception as e:
        raise ValueError(f"Invalid token: {e}")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def generate_token(user_id: int, username: str) -> str:
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=TOKEN_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    # Use custom JWT functions
    token = custom_jwt_encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        # payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        payload = custom_jwt_decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception as e:
        raise ValueError(f"{str(e)}")


def token_required(f):
    """Decorator to protect routes - allows bypass for Demo Mode"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Expected format: "Bearer <token>"
                token = auth_header.split(' ')[1]
            except IndexError:
                pass # Fallback to demo logic
        
        # DEMO MODE: If no token or invalid token, use Demo User
        if not token:
            # Inject Demo User context
            request.user_id = 1
            request.username = 'Demo User'
            logger.info("Using Demo User context (no token)")
            return f(*args, **kwargs)
        
        try:
            # Decode and validate token if present
            payload = decode_token(token)
            # Add user info to request context
            request.user_id = payload['user_id']
            request.username = payload['username']
        except Exception as e:
            logger.warning(f"Token validation failed ({e}), falling back to Demo User")
            # Fallback to Demo User even on invalid token for smoother demo experience
            request.user_id = 1
            request.username = 'Demo User'
        
        return f(*args, **kwargs)
    
    return decorated



def generate_share_token(analysis_id: int) -> str:
    """Generate JWT token for sharing analysis"""
    payload = {
        'analysis_id': analysis_id,
        'type': 'share',
        'exp': datetime.utcnow() + timedelta(days=7),  # Valid for 7 days
        'iat': datetime.utcnow()
    }
    # Use custom JWT functions
    token = custom_jwt_encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_share_token(token: str) -> dict:
    """Decode and validate share token"""
    try:
        # payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        payload = custom_jwt_decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get('type') != 'share':
            raise ValueError("Invalid token type")
        return payload
    except Exception as e:
        raise ValueError(f"{str(e)}")

def get_current_user():
    """Get current user info from request context"""
    return {
        'user_id': getattr(request, 'user_id', None),
        'username': getattr(request, 'username', None)
    }
