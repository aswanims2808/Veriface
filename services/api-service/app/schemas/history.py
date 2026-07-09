from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalysisResponse(BaseModel):
    id: int
    user_id: int
    image_filename: Optional[str] = None
    prediction: str
    confidence: float
    processing_time: Optional[str] = None
    detection_type: str
    status: str
    stored_filename: Optional[str] = None
    forensics: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    analyses: List[AnalysisResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class ShareResponse(BaseModel):
    token: str
    share_url: str
