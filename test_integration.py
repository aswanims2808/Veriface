
import os
import sys
import numpy as np
import tensorflow as tf

# Add backend to path to import core.engine
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.engine import DetectionEngine

def test_engine():
    print("Testing DetectionEngine...")
    
    # 1. Initialize Engine
    try:
        engine = DetectionEngine()
    except Exception as e:
        print(f"FAILED to initialize engine: {e}")
        with open("integration_error.log", "w") as f:
            f.write(f"FAILED to initialize engine: {e}")
        return

    # 2. Check if model is loaded
    if engine.model is None:
        print("FAILED: Engine model is None.")
        return
    else:
        print("SUCCESS: Engine model loaded.")

    # 3. Test Inference with Mock Image
    # Create a random noise image (Height, Width, 3) 
    # Use 500x500 to test resizing
    print("Running inference on mock image...")
    mock_image = np.random.randint(0, 255, (500, 500, 3), dtype=np.uint8)
    
    # Encode to bytes (mimic flask request.files['file'].read())
    import cv2
    _, buffer = cv2.imencode('.jpg', mock_image)
    image_bytes = buffer.tobytes()
    
    try:
        result = engine.process_image(image_bytes)
        print("\nInference Result:")
        print(result)
        
        if result['prediction'] == 'ERROR':
            print("FAILED: Prediction returned ERROR")
        elif result['prediction'] == 'UNDETECTED':
            # This is expected for random noise as face detection will likely fail
            print("SUCCESS: Handled no-face case correctly (UNDETECTED).")
            print("Note: To test actual inference, we need a real face image.")
            
            # Allow skipping face detection for a quick model pass test?
            # We can check engine.model.predict directly if we manually create a face tensor
            print("\nTesting direct model prediction with random tensor...")
            # Batch of 1, 224, 224, 3
            dummy_face = np.random.uniform(-1, 1, (1, 224, 224, 3)).astype(np.float32)
            preds = engine.model.predict(dummy_face)
            print("Direct Prediction Output:", preds)
            print("Shape:", preds.shape)
            
            if preds.shape[-1] == 3:
                print("SUCCESS: Output shape is correct (3 classes).")
            else:
                print(f"FAILED: Output shape mismatch. Expected 3 classes, got {preds.shape[-1]}")

        else:
            print("SUCCESS: Prediction returned valid result.")
            
    except Exception as e:
        error_msg = f"FAILED during inference: {e}"
        print(error_msg)
        with open("integration_error.log", "w") as f:
            f.write(error_msg)
            import traceback
            traceback.print_exc(file=f)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_engine()
