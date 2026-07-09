
import cv2
import numpy as np
from PIL import Image
import os

class FaceDetector:
    def __init__(self, device='cpu'):
        print(f"Initializing FaceDetector (Haar Cascade)...")
        # Load Haar Cascade
        # We use the default one included in OpenCV
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def detect_and_crop(self, image_bytes, scale=1.3, image_size=224):
        """
        Detect faces in the image bytes using Haar Cascade, crop them with a scale factor, 
        and return the processed numpy arrays for the Keras model.
        """
        try:
            # Convert bytes to numpy array for OpenCV
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return [], []
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            # scaleFactor=1.1, minNeighbors=4
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                print("No faces detected.")
                return [], []

            faces_arrays = []
            face_coords = []
            
            # Convert to RGB (PIL)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(img_rgb)

            for (x, y, w, h) in faces:
                # Expand the bounding box
                # Calculate center
                cx = x + w / 2
                cy = y + h / 2
                
                # Apply scale
                size = max(w, h) * scale
                
                # new coordinates
                x1 = max(0, cx - size / 2)
                y1 = max(0, cy - size / 2)
                x2 = min(pil_img.width, cx + size / 2)
                y2 = min(pil_img.height, cy + size / 2)
                
                # Crop
                face_img = pil_img.crop((x1, y1, x2, y2))
                
                # Resize to model input size (e.g., 224x224 for EfficientNet/MobileNet/etc which likely this .h5 is)
                face_img = face_img.resize((image_size, image_size), Image.BILINEAR)
                
                # Convert to numpy array and normalize
                # Keras models usually expect [0, 255] or [-1, 1] or [0, 1]. 
                # Standard practice: 0-255 inputs for models that have a Rescaling layer, or pre-normalized.
                # Assuming standard 0-255 input for now or typical normalization.
                # Let's normalize to [0, 1] as a safe starting point or keep as 0-255 if the model expects it.
                # HOWEVER, inspecting the previous `engine.py` revealed `(img_tensor - 0.5) / 0.5` which is [-1, 1].
                # We will stick to [-1, 1] normalization to be safe if it's based on similar training data.
                
                img_array = np.array(face_img).astype(np.float32) / 127.5 - 1.0 # Map [0, 255] -> [-1, 1]
                
                faces_arrays.append(img_array)
                face_coords.append([int(x1), int(y1), int(x2-x1), int(y2-y1)])

            if not faces_arrays:
                return [], []
            
            # Stack into a batch: (Batch, Height, Width, Channels)
            batch_arrays = np.array(faces_arrays)
            return batch_arrays, face_coords

        except Exception as e:
            print(f"Error in face detection: {e}")
            return [], []
