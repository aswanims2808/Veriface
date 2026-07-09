from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.auth.auth_handler import token_required, get_current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing request payload'}), 400
            
        username = data.get('username', '')
        email = data.get('email', '')
        password = data.get('password', '')
        
        res = AuthService.register_user(username, email, password)
        status_code = res.pop('status_code', 200)
        return jsonify(res), status_code
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing request payload'}), 400
            
        username_or_email = data.get('username', '').strip() or data.get('email', '').strip()
        password = data.get('password', '')
        
        res = AuthService.login_user(username_or_email, password)
        status_code = res.pop('status_code', 200)
        return jsonify(res), status_code
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['GET'])
@token_required
def verify_token():
    try:
        current_user = get_current_user()
        res = AuthService.verify_user_token(current_user['user_id'])
        status_code = res.pop('status_code', 200)
        return jsonify(res), status_code
    except Exception as e:
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500
