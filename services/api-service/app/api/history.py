from flask import Blueprint, request, jsonify
from app.services.history_service import HistoryService
from app.auth.auth_handler import token_required, get_current_user

history_bp = Blueprint('history', __name__)
share_bp = Blueprint('share', __name__)

# ==================== HISTORY ENDPOINTS ====================

@history_bp.route('', methods=['GET'])
@history_bp.route('/', methods=['GET'])
@token_required
def get_history():
    try:
        current_user = get_current_user()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        res = HistoryService.get_history(current_user['user_id'], page, per_page)
        status_code = res.pop('status_code', 200)
        return jsonify(res), status_code
    except Exception as e:
        return jsonify({'error': f'Failed to fetch history: {str(e)}'}), 500

@history_bp.route('/<int:analysis_id>', methods=['GET'])
@token_required
def get_analysis(analysis_id):
    try:
        current_user = get_current_user()
        res = HistoryService.get_analysis(current_user['user_id'], analysis_id)
        if isinstance(res, dict) and 'error' in res:
            status_code = res.pop('status_code', 500)
            return jsonify(res), status_code
        return jsonify(res), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch analysis: {str(e)}'}), 500

@history_bp.route('/<int:analysis_id>', methods=['DELETE'])
@token_required
def delete_analysis(analysis_id):
    try:
        current_user = get_current_user()
        res = HistoryService.delete_analysis(current_user['user_id'], analysis_id)
        status_code = res.pop('status_code', 200)
        return jsonify(res), status_code
    except Exception as e:
        return jsonify({'error': f'Failed to delete analysis: {str(e)}'}), 500

# ==================== SHARE ENDPOINTS ====================

@history_bp.route('/<int:analysis_id>/share', methods=['POST'])
@token_required
def share_analysis(analysis_id):
    try:
        current_user = get_current_user()
        res = HistoryService.share_analysis(current_user['user_id'], analysis_id, request.host_url)
        status_code = res.pop('status_code', 200)
        return jsonify(res), status_code
    except Exception as e:
        return jsonify({'error': f'Failed to share analysis: {str(e)}'}), 500

@share_bp.route('/<token>', methods=['GET'])
def get_shared_analysis(token):
    try:
        res = HistoryService.get_shared_analysis(token)
        if isinstance(res, dict) and 'error' in res:
            status_code = res.pop('status_code', 500)
            return jsonify(res), status_code
        return jsonify(res), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve shared analysis: {str(e)}'}), 500
