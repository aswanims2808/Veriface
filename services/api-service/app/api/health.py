from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from app.core.database import get_db
from app.core.service_clients import InferenceServiceClient, get_inference_client
from app.schemas.health import HealthResponse, ReadyResponse

router = APIRouter(tags=["System Health"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        service="VeriFace API Gateway"
    )

@router.get("/ready", response_model=ReadyResponse)
def ready_check(
    db: Session = Depends(get_db),
    inference_client: InferenceServiceClient = Depends(get_inference_client)
):
    components = {}
    database_status = "healthy"
    inference_status = "healthy"
    
    # 1. Check SQL Database availability
    try:
        db.execute(text("SELECT 1"))
        components["database"] = "ready"
    except Exception as e:
        database_status = "unhealthy"
        components["database"] = f"error: {str(e)}"
        
    # 2. Check Inference service status
    try:
        inf_health = inference_client.check_health()
        if inf_health.get("status") == "healthy" or inf_health.get("model_loaded") is True:
            components["inference_service"] = "ready"
        else:
            inference_status = "degraded"
            components["inference_service"] = f"degraded (status: {inf_health.get('status')})"
    except Exception as e:
        inference_status = "unhealthy"
        components["inference_service"] = f"error: {str(e)}"

    # Determine overall status
    if database_status == "unhealthy" or inference_status == "unhealthy":
        overall_status = "unhealthy"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ReadyResponse(
                status=overall_status,
                database=database_status,
                inference_service=inference_status,
                components=components
            ).dict()
        )
        
    return ReadyResponse(
        status="ready",
        database=database_status,
        inference_service=inference_status,
        components=components
    )
