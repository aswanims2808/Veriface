import os
import uuid
import json
import logging
import requests
from app.core.config import Config
from app.core.database import SessionLocal
from app.models.history import AnalysisHistory

logger = logging.getLogger(__name__)

class PredictionService:
    @staticmethod
    def process_prediction(file_bytes, filename, user_id, detection_type='Single'):
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

        # Forward file to inference service
        result = None
        error_msg = None
        inference_url = f"{Config.INFERENCE_SERVICE_URL}/predict"
        
        try:
            # We must use files parameter in requests to upload multipart/form-data
            logger.info(f"Forwarding prediction request to {inference_url}...")
            # We pass file_bytes in memory directly to requests
            files = {'file': (filename, file_bytes)}
            response = requests.post(inference_url, files=files, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
            else:
                try:
                    res_json = response.json()
                    error_msg = res_json.get('error', f"Inference service returned status {response.status_code}")
                except Exception:
                    error_msg = f"Inference service error: {response.text}"
                logger.error(f"Inference service failed: {error_msg}")
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error connecting to inference service: {str(e)}"
            logger.error(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error during inference communication: {str(e)}"
            logger.error(error_msg)

        # Write metadata history to DB
        db = SessionLocal()
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
            logger.error(f"Database write error for analysis history: {e}")
            return {"error": "Failed to log analysis to database", "status_code": 500}
        finally:
            db.close()
