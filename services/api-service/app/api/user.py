from flask import Blueprint, jsonify
from app.services.auth_service import AuthService
from app.auth.auth_handler import token_required, get_current_user

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        current_user = get_current_user()
        res = AuthService.get_user_profile(current_user['user_id'])
        if isinstance(res, dict) and 'error' in res:
            status_code = res.pop('status_code', 500)
            return jsonify(res), status_code
        return jsonify(res), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch profile: {str(e)}'}), 500
