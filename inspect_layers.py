
import os
import tensorflow as tf

model_path = os.path.join("backend", "model", "veriface_model.h5")

try:
    model = tf.keras.models.load_model(model_path)
    
    with open("layer_info.log", "w") as f:
        f.write(f"Model Input Shape: {model.input_shape}\n\n")
        f.write("First 10 Layers:\n")
        for i, layer in enumerate(model.layers[:10]):
            f.write(f"{i}: {layer.name} ({layer.__class__.__name__})\n")
            if isinstance(layer, tf.keras.layers.Rescaling):
                f.write(f"  - Scale: {layer.scale}\n")
                f.write(f"  - Offset: {layer.offset}\n")
                
        f.write("\nLast Layer Config:\n")
        f.write(str(model.layers[-1].get_config()))
    
except Exception as e:
    print(f"Error: {e}")
