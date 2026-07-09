import os
import logging
from flask import Flask, jsonify, request
from engine import DetectionEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VeriFaceInference")

def create_app():
    app = Flask(__name__)
    
    # Initialize Detection Engine (loaded once at start)
    engine = DetectionEngine()
    
    @app.route('/health', methods=['GET'])
    def health_check():
        status = "healthy" if engine.model is not None else "degraded"
        return jsonify({
            "status": status,
            "service": "VeriFace Inference Service",
            "model_loaded": engine.model is not None
        }), 200

    @app.route('/predict', methods=['POST'])
    def predict():
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        try:
            image_bytes = file.read()
            result = engine.process_image(image_bytes)
            
            # Log result prediction
            logger.info(f"Processed image. Prediction: {result.get('prediction', 'ERROR')}")
            
            # Check for errors in the processing
            if result.get('prediction') == 'ERROR':
                return jsonify(result), 500
                
            return jsonify(result), 200
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return jsonify({"error": str(e), "prediction": "ERROR"}), 500
            
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
