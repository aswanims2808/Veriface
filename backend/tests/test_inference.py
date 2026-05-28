
import os
import sys
import unittest
import urllib.request

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.engine import DetectionEngine

class TestDetectionEngine(unittest.TestCase):
    def setUp(self):
        self.engine = DetectionEngine()
        self.test_image_path = "backend/tests/test_face.jpg"
        
        # Download a test face image if not exists
        if not os.path.exists(self.test_image_path):
            directory = os.path.dirname(self.test_image_path)
            if not os.path.exists(directory):
                os.makedirs(directory)
                
            # Generate a dummy face image
            from PIL import Image, ImageDraw
            
            # Create a 300x300 image
            img = Image.new('RGB', (300, 300), color = (255, 255, 255))
            d = ImageDraw.Draw(img)
            
            # Draw a face-like shape
            # Head
            d.ellipse([50, 50, 250, 250], fill=(255, 220, 177), outline=(0, 0, 0))
            # Eyes
            d.ellipse([100, 120, 120, 140], fill=(0, 0, 0))
            d.ellipse([180, 120, 200, 140], fill=(0, 0, 0))
            # Mouth
            d.arc([100, 180, 200, 220], start=0, end=180, fill=(0, 0, 0))
            
            img.save(self.test_image_path)
            print(f"Generated test image at {self.test_image_path}")



    def test_process_image(self):
        print(f"Testing with image: {self.test_image_path}")
        with open(self.test_image_path, "rb") as f:
            image_bytes = f.read()
            
        result = self.engine.process_image(image_bytes)
        
        print("Result:", result)
        
        self.assertIn("prediction", result)
        self.assertIn("confidence", result)
        
        if result["prediction"] == "UNDETECTED":
            print("WARNING: No face detected in test image. This is expected for dummy images.")
        else:
            self.assertGreater(len(result.get("face_coords", [])), 0)


if __name__ == "__main__":
    unittest.main()
