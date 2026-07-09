import streamlit as st
import cv2
import numpy as np
import sys
import os
import time
from PIL import Image, ImageDraw

# Add backend to path to import DetectionEngine
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from core.engine import DetectionEngine

# Page configuration
st.set_page_config(
    page_title="VeriFace Authenticity Detector",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for modern look
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .main {
        background-color: #fcfcfd;
    }
    
    /* Premium Banners */
    .stAlert {
        border-radius: 12px;
        border: none;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    /* Header Styling */
    .header-text {
        color: #0f172a;
        font-weight: 800;
        margin-bottom: 0.5rem;
        letter-spacing: -0.025em;
    }
    
    .subtitle-text {
        color: #64748b;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }

    /* Custom Progress Bar Containers */
    .confidence-container {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .confidence-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;
    }

    /* Red Banner for Deepfake */
    .deepfake-alert {
        background-color: #fef2f2;
        color: #991b1b;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #fecaca;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .deepfake-alert-icon {
        font-size: 2rem;
    }
    
    .deepfake-alert-text h3 {
        margin: 0;
        color: #991b1b;
    }
    
    .deepfake-alert-text p {
        margin: 0.25rem 0 0 0;
        opacity: 0.9;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize Detection Engine
@st.cache_resource
def get_engine():
    return DetectionEngine()

engine = get_engine()

# --- Sidebar ---
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/shield.png", width=80)
    st.title("VeriFace Tools")
    
    with st.expander("ℹ️ How It Works", expanded=True):
        st.markdown("""
            **1. Image Upload**
            Upload a JPG or PNG file. Our system currently processes one image at a time for maximum precision.
            
            **2. Face Detection**
            The backend uses automated detectors to locate and crop faces, ensuring analysis is focused on forensic facial signals.
            
            **3. Authenticity Scoring**
            A specialized neural network (XceptionNet/EfficientNet) analyzes the image for deepfake signatures, providing a confidence score for both Real and Deepfake classifications.
        """)
    
    st.divider()
    
    st.subheader("Settings")
    threshold = st.slider(
        "Confidence Threshold (%)",
        min_value=0,
        max_value=100,
        value=70,
        help="Alert will trigger if Deepfake confidence exceeds this value."
    )
    
    st.divider()
    st.info("Demo Mode: Backend currently simulating research-grade inference.")

# --- Main Content ---
st.markdown("<h1 class='header-text'>🛡️ VeriFace Authenticity Detector</h1>", unsafe_allow_html=True)
st.markdown("<p class='subtitle-text'>Next-generation deepfake detection for forensic-level image verification.</p>", unsafe_allow_html=True)

# File Uploader
uploaded_file = st.file_uploader(
    "Drag and drop or browse to upload an image",
    type=["jpg", "jpeg", "png"],
    help="Supported formats: JPG, PNG"
)

if uploaded_file is not None:
    # Read the image
    image_bytes = uploaded_file.read()
    image = Image.open(uploaded_file).convert("RGB")
    
    # Success State
    st.success(f"Successfully uploaded: {uploaded_file.name}")
    
    # Run Analysis
    with st.spinner("Analyzing image authenticity..."):
        result = engine.process_image(image_bytes)
    
    # Split into columns: Image Visualization | Results
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Image Visualization")
        
        # Draw bounding boxes
        draw_img = image.copy()
        draw = ImageDraw.Draw(draw_img)
        
        for (x, y, w, h) in result.get('face_coords', []):
            # Draw green bounding box
            draw.rectangle([x, y, x + w, y + h], outline="#00FF00", width=5)
        
        st.image(draw_img, use_container_width=True, caption="Detected Face (Green Box)")

    with col2:
        st.subheader("Analysis Results")
        
        prediction = result['prediction']
        confidence = result['confidence']
        
        # Calculate scores for progress bars
        # Assuming confidence is for the specific prediction
        real_score = confidence if prediction == "REAL" else (100 - confidence)
        fake_score = confidence if prediction == "DEEPFAKE" else (100 - confidence)
        
        # Alerts/Banners
        if prediction == "DEEPFAKE" and confidence >= threshold:
            st.markdown(f"""
                <div class="deepfake-alert">
                    <div class="deepfake-alert-icon">🚨</div>
                    <div class="deepfake-alert-text">
                        <h3>Deepfake Detected</h3>
                        <p>This image shows significant signs of synthetic manipulation ({confidence}% confidence).</p>
                    </div>
                </div>
            """, unsafe_allow_html=True)
        elif prediction == "DEEPFAKE":
            st.warning(f"⚠️ **Potential Deepfake Detected** ({confidence}%) - Confidence is below your {threshold}% threshold.")
        else:
            st.success(f"✅ **Image Verified as Authentic** ({confidence}% confidence)")
            
        st.divider()
        
        # Confidence Meters
        st.subheader("Confidence Scores")
        
        # Real Progress Bar
        st.markdown(f"""
            <div class="confidence-container">
                <div class="confidence-label">
                    <span>REAL AUTHENTICITY</span>
                    <span>{real_score:.1f}%</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
        st.progress(real_score / 100)
        
        # Fake Progress Bar
        st.markdown(f"""
            <div class="confidence-container" style="margin-top: 1rem;">
                <div class="confidence-label">
                    <span>DEEPFAKE PROBABILITY</span>
                    <span>{fake_score:.1f}%</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
        st.progress(fake_score / 100)
        
        st.divider()
        
        # Forensics Details
        with st.expander("🔍 Forensic Signals"):
            f = result.get('forensics', {})
            st.write(f"**Signals Detected:** {f.get('signals_detected', 0)}")
            st.write(f"**Noise Consistency:** {f.get('noise_consistency', 'Unknown')}")
            st.write(f"**ELA Score:** {f.get('ela_score', 0)}")
            st.write(f"**Processing Time:** {result.get('processing_time', 'N/A')}")

else:
    # Empty State
    st.info("👆 Please upload an image to begin the authenticity check.")
    
    # Example placeholder or tips
    st.markdown("""
        ### Why VeriFace?
        - **Research-Grade Accuracy**: Based on FaceForensics++ benchmarks.
        - **Real-time Detection**: Optimized for live academic demos.
        - **Explainable Results**: Provides forensic signals used for classification.
    """)

# Footer
st.divider()
st.markdown("<p style='text-align: center; color: gray;'>VeriFace AI Authenticity Detection System | Academic Demo v1.0</p>", unsafe_allow_html=True)
