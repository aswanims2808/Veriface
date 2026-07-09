import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from core.engine import DetectionEngine

def test_engine():
    engine = DetectionEngine()
    # Create a small dummy image (black square)
    import numpy as np
    import cv2
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    image_bytes = buffer.tobytes()
    
    print("Testing DetectionEngine...")
    result = engine.process_image(image_bytes)
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Face Coordinates: {result['face_coords']}")
    
    if 'face_coords' in result and len(result['face_coords']) > 0:
        print("✅ SUCCESS: Face coordinates detected (or mocked).")
    else:
        print("❌ FAILURE: No face coordinates found.")

if __name__ == "__main__":
    test_engine()
