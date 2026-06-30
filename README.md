# VeriFace
State-of-the-art AI Authenticity & Deepfake Detection System

VeriFace is a real-time, high-precision deep learning pipeline designed to distinguish authentic human faces from synthetic media. Utilizing a dual-branch architecture that analyzes both spatial artifacts and frequency domain anomalies, VeriFace categorizes media into Real, Deepfake, or AI-Generated with sub-50ms inference times.

---

## Table of Contents
- [Detection Categories](#detection-categories)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage & API](#usage--api)
- [Model Performance](#model-performance)
- [Core Team](#core-team)
- [Ethics & Responsible Use](#ethics--responsible-use)

---

## Detection Categories

VeriFace classifies facial images into three distinct categories with calibrated confidence scores:

| Category | Description | Threat Level | Common Sources |
|:---|:---|:---:|:---|
| Real | Authentic, unmanipulated human photographs | Low | Camera photos, ID scans, biometric images |
| Deepfake | AI-manipulated video/image with face swap | High | FaceSwap, DeepFaceLab, DeepLiveCam |
| AI-Generated | Fully synthetic face from generative models | Medium | StyleGAN, Midjourney, Stable Diffusion |

---

## Key Features

*   Multi-Class Authenticity: Single-pass inference classifying Real, Deepfake, and AI-Generated media.
*   Real-Time Processing: Optimized pipeline delivering sub-50ms predictions on GPU.
*   Advanced Forensic Analysis: Detects GAN fingerprints, DCT anomalies, and blending boundaries invisible to the human eye.
*   Enterprise-Ready: Fully documented FastAPI backend, Docker containerization, and batch-processing support.

---

## Architecture

VeriFace utilizes a dual-branch neural network to capture both visible and invisible manipulation artifacts.

```mermaid
graph TD
    A[Input Image 224x224x3] --> B(EfficientNet-B4 Backbone)
    B --> C[Spatial Branch: CNN]
    B --> D[Frequency Branch: FFT/DCT]
    C --> E{Feature Fusion}
    D --> E
    E --> F[Classification Head]
    F --> G(Real)
    F --> H(Deepfake)
    F --> I(AI-Generated)
