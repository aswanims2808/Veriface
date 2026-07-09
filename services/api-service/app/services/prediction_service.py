import os
import uuid
import json
import logging
from sqlalchemy.orm import Session
from app.core.config import Config
from app.core.service_clients import InferenceServiceClient
from app.models.history import AnalysisHistory

logger = logging.getLogger(__name__)

class PredictionService:
    @staticmethod
    def process_prediction(
        db: Session,
        inference_client: InferenceServiceClient,
        file_bytes: bytes,
        filename: str,
        user_id: int,
        detection_type: str = 'Single'
    ) -> dict:
        # Ensure upload directory exists
        if not os.path.exists(Config.UPLOAD_FOLDER):
            os.makedirs(Config.UPLOAD_FOLDER)
            
        # Generate unique filename to save locally
        ext = os.path.splitext(filename)[1].lower() or '.jpg'
        stored_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(Config.UPLOAD_FOLDER, stored_filename)
        
        # Save file to uploads folder
        try:
            with open(file_path, 'wb') as f:
                f.write(file_bytes)
        except Exception as e:
            logger.error(f"Failed to write uploaded file: {e}")
            return {"error": "Failed to save file on server", "status_code": 500}

        # Perform prediction via the injected inference service client
        result = None
        error_msg = None
        
        prediction_res = inference_client.predict(filename, file_bytes)
        if prediction_res.get("prediction") == "ERROR":
            error_msg = prediction_res.get("error", "Unknown inference engine error")
            logger.error(f"Prediction failed: {error_msg}")
        else:
            result = prediction_res

        # Write metadata history to DB
        try:
            analysis = AnalysisHistory(
                user_id=user_id,
                image_filename=filename,
                prediction=result.get('prediction', 'ERROR') if result else 'ERROR',
                confidence=result.get('confidence', 0.0) if result else 0.0,
                processing_time=result.get('processing_time', '0s') if result else '0s',
                forensics_data=json.dumps(result.get('forensics', {})) if result else json.dumps({'error': error_msg}),
                detection_type=detection_type,
                status='Completed' if result else 'Failed',
                stored_filename=stored_filename
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            
            if result:
                result['analysis_id'] = analysis.id
                return {"result": result, "status_code": 200}
            else:
                return {"error": error_msg, "analysis_id": analysis.id, "status_code": 500}
                
        except Exception as e:
            db.rollback()
            logger.error(f"Database write error for analysis history: {e}")
            return {"error": "Failed to log analysis to database", "status_code": 500}
