from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.service_clients import InferenceServiceClient, get_inference_client
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import PredictionService
from app.auth.auth_handler import get_current_user_dep

# We omit the prefix here so we can register both /analyses/predict and /predict easily,
# or we can set prefix to "" and specify full paths.
router = APIRouter(tags=["Analyses"])

async def run_predict(
    file: UploadFile,
    detection_type: str,
    db: Session,
    inference_client: InferenceServiceClient,
    current_user: any
):
    try:
        # Read file bytes in memory
        file_bytes = await file.read()
        
        res = PredictionService.process_prediction(
            db=db,
            inference_client=inference_client,
            file_bytes=file_bytes,
            filename=file.filename,
            user_id=current_user.id,
            detection_type=detection_type
        )
        
        status_code = res.get('status_code', 200)
        if 'error' in res:
            raise HTTPException(status_code=status_code, detail=res['error'])
            
        return res.get('result')
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction flow failed: {str(e)}"
        )

@router.post("/analyses/predict", response_model=PredictionResponse)
async def predict_analyses(
    file: UploadFile = File(...),
    detection_type: str = Form("Single"),
    db: Session = Depends(get_db),
    inference_client: InferenceServiceClient = Depends(get_inference_client),
    current_user: any = Depends(get_current_user_dep)
):
    return await run_predict(file, detection_type, db, inference_client, current_user)

@router.post("/predict", response_model=PredictionResponse)
async def predict_direct(
    file: UploadFile = File(...),
    detection_type: str = Form("Single"),
    db: Session = Depends(get_db),
    inference_client: InferenceServiceClient = Depends(get_inference_client),
    current_user: any = Depends(get_current_user_dep)
):
    return await run_predict(file, detection_type, db, inference_client, current_user)
