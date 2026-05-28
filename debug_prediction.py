
import os
import sys
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from core.face_detection import FaceDetector

model_path = os.path.join("backend", "model", "veriface_model.h5")
test_image_path = os.path.join("backend", "uploads", "5a55de5d-14cb-4542-ac16-fda64dfc22e5.jpg")

def preprocess_image(face_img):
    # Resize
    face_img = face_img.resize((224, 224), Image.BILINEAR)
    
    # 1. [-1, 1]
    img_neg_one = np.array(face_img).astype(np.float32) / 127.5 - 1.0
    
    # 2. [0, 1]
    img_zero_one = np.array(face_img).astype(np.float32) / 255.0
    
    # 3. [0, 255]
    img_raw = np.array(face_img).astype(np.float32)
    
    return [
        ("[-1, 1]", img_neg_one),
        ("[0, 1]", img_zero_one),
        ("[0, 255]", img_raw)
    ]

try:
    print("Loading model...")
    model = tf.keras.models.load_model(model_path)
    
    print(f"Loading test image: {test_image_path}")
    if not os.path.exists(test_image_path):
        print("Test image not found.")
        sys.exit(1)
        
    with open(test_image_path, "rb") as f:
        image_bytes = f.read()
        
    detector = FaceDetector()
    
    with open("debug_output.log", "w") as log_file:
        # 1. Current Pipeline Check
        log_file.write("\n--- Current Pipeline Check ---\n")
        print("\n--- Current Pipeline Check ---")
        
        faces, coords = detector.detect_and_crop(image_bytes, image_size=224)
        if len(faces) == 0:
            msg = "No faces detected in test image.\n"
            print(msg.strip())
            log_file.write(msg)
        else:
            msg = f"Detected {len(faces)} faces.\n"
            print(msg.strip())
            log_file.write(msg)
            
            preds = model.predict(faces)
            msg = f"Current Pipeline Prediction ([-1, 1]): {preds[0]}\n"
            print(msg.strip())
            log_file.write(msg)

        # 2. Variations Check
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces_custom = detector.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces_custom) > 0:
            x, y, w, h = faces_custom[0]
            # Crop logic
            cx = x + w / 2
            cy = y + h / 2
            size = max(w, h) * 1.3
            pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            x1 = max(0, cx - size / 2)
            y1 = max(0, cy - size / 2)
            x2 = min(pil_img.width, cx + size / 2)
            y2 = min(pil_img.height, cy + size / 2)
            face_img = pil_img.crop((x1, y1, x2, y2))
            
            variations = preprocess_image(face_img)
            
            log_file.write("\n--- Preprocessing Variations ---\n")
            print("\n--- Preprocessing Variations ---")
            
            for name, data in variations:
                batch = np.expand_dims(data, axis=0)
                preds = model.predict(batch)
                msg = f"{name}: {preds[0]}\n"
                print(msg.strip())
                log_file.write(msg)
        else:
            log_file.write("No faces found for variations check.\n")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
