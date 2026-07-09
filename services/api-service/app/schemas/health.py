from pydantic import BaseModel
from typing import Optional, Dict

class HealthResponse(BaseModel):
    status: str
    service: str

class ReadyResponse(BaseModel):
    status: str
    database: str
    inference_service: Optional[str] = None
    components: Dict[str, str]
