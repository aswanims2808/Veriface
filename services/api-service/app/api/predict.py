from flask import Blueprint, request, jsonify
from app.services.prediction_service import PredictionService
from app.auth.auth_handler import token_required, get_current_user

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('', methods=['POST'])
@predict_bp.route('/', methods=['POST'])
@token_required
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        current_user = get_current_user()
        detection_type = request.form.get('detection_type', 'Single')
        
        # Read file bytes in memory to forward and write locally
        file_bytes = file.read()
        
        res = PredictionService.process_prediction(
            file_bytes=file_bytes,
            filename=file.filename,
            user_id=current_user['user_id'],
            detection_type=detection_type
        )
        
        status_code = res.pop('status_code', 200)
        
        if 'error' in res:
            return jsonify(res), status_code
            
        # Return prediction output dictionary directly
        return jsonify(res.get('result', {})), status_code
        
    except Exception as e:
        return jsonify({"error": f"Prediction flow failed: {str(e)}"}), 500
