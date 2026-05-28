
import os
import tensorflow as tf
import numpy as np
import time
from .face_detection import FaceDetector

class DetectionEngine:
    def __init__(self):
        print("Initializing Detection Engine...")
        
        # Check for GPU
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"TensorFlow is using GPU(s): {gpus}")
        else:
            print("TensorFlow is using CPU")

        # Initialize Face Detector
        self.face_detector = FaceDetector()

        # Load Keras Model
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "model", "veriface_model.h5")
        
        if os.path.exists(model_path):
            print(f"Loading model from {model_path}...")
            try:
                self.model = tf.keras.models.load_model(model_path)
                print("Model loaded successfully.")
                # self.model.summary() # Causing issues in non-interactive
            except Exception as e:
                print(f"FAILED to load model: {e}")
                with open("model_load_error.log", "w") as f:
                    f.write(str(e))
                self.model = None
        else:
            print(f"WARNING: Model file not found at {model_path}")
            self.model = None

    def process_image(self, image_bytes):
        """
        Process the image bytes and return analysis results.
        :param image_bytes: Raw bytes of the image file
        :return: Dict containing prediction, confidence, and metadata (including face coordinates)
        """
        start_time = time.time()
        
        if self.model is None:
            return {
                "prediction": "ERROR",
                "confidence": 0.0,
                "message": "Model not loaded."
            }
        
        # Detect and crop faces
        try:
            # Note: Model input size. 
            # If inspection showed (None, 224, 224, 3), we should ensure FaceDetector uses 224.
            # Default in FaceDetector is now 224.
            faces, coords = self.face_detector.detect_and_crop(image_bytes, image_size=224)
        except Exception as e:
            print(f"Error in face detection: {e}")
            faces, coords = [], []

        if len(faces) == 0:
            return {
                "prediction": "UNDETECTED",
                "confidence": 0.0,
                "real_confidence": 0.0,
                "ai_confidence": 0.0,
                "deepfake_confidence": 0.0,
                "forensics": {},
                "face_coords": [],
                "risk_score": 0.0,
                "processing_time": f"{time.time() - start_time:.2f}s",
                "message": "No faces detected."
            }
        
        # Run inference
        # faces is a numpy array (Batch, H, W, C)
        try:
            predictions = self.model.predict(faces)
            # predictions shape: (Batch, 3)
            
            # Using the first face result for prediction
            probs = predictions[0] 
            
            # Revised Mapping based on debug analysis:
            # Index 0: AI-Generated (Low score on real image)
            # Index 1: REAL (Highest score on real image)
            # Index 2: Deepfake (Moderate score on real image)
            
            ai_score = float(probs[0]) * 100
            real_score = float(probs[1]) * 100
            deepfake_score = float(probs[2]) * 100
            
            # Determine label
            # 0: AI, 1: Real, 2: Deepfake
            labels = ["AI-GENERATED", "REAL", "DEEPFAKE"]
            max_index = np.argmax(probs)
            prediction = labels[max_index]
            
            confidence = float(probs[max_index]) * 100
            
            # Forensics (mocked/heuristic based on prediction for now)
            forensics = {
                "signals_detected": 1 if prediction != "REAL" else 0,
                "noise_consistency": "High" if prediction == "REAL" else "Irregular",
                "ela_score": 0.0, 
                "compression_artifacts": "Low"
            }

            return {
                "prediction": prediction,
                "confidence": round(confidence, 1),
                "real_confidence": round(real_score, 1),
                "ai_confidence": round(ai_score, 1),
                "deepfake_confidence": round(deepfake_score, 1),
                "forensics": forensics,
                "face_coords": coords, 
                "risk_score": round(deepfake_score + ai_score, 1), # Risk is sum of non-real scores? or just deepfake?
                "processing_time": f"{time.time() - start_time:.2f}s"
            }
            
        except Exception as e:
            print(f"Inference Error: {e}")
            return {
                "prediction": "ERROR",
                "confidence": 0.0,
                "message": str(e)
            }
