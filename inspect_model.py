import os
import tensorflow as tf

model_path = os.path.join("backend", "model", "veriface_model.h5")

try:
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    print("\nModel Summary:")
    model.summary()
    
    print("\nInput Shape:", model.input_shape)
    print("Output Shape:", model.output_shape)
    
    # Try to infer class names if possible (though unlikely in h5 unless saved with metadata)
    # usually it's just the last layer size
    
except Exception as e:
    print(f"Error loading model: {e}")
