from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    real_confidence: float
    ai_confidence: float
    deepfake_confidence: float
    forensics: Dict[str, Any] = Field(default_factory=dict)
    face_coords: List[List[int]] = Field(default_factory=list)
    risk_score: float
    processing_time: str
    analysis_id: Optional[int] = None
