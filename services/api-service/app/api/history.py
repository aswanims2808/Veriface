from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.history import AnalysisResponse, HistoryResponse, ShareResponse
from app.services.history_service import HistoryService
from app.auth.auth_handler import get_current_user_dep

history_router = APIRouter(prefix="/history", tags=["History"])
share_router = APIRouter(prefix="/api/share", tags=["Sharing"])

# ==================== HISTORY ENDPOINTS ====================

@history_router.get("", response_model=HistoryResponse)
@history_router.get("/", response_model=HistoryResponse)
def get_history(
    page: int = 1,
    per_page: int = 10,
    current_user: any = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    res = HistoryService.get_history(db, current_user.id, page, per_page)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return HistoryResponse(
        analyses=[AnalysisResponse.from_orm(a) for a in res.get('analyses', [])],
        total=res.get('total', 0),
        page=res.get('page', 1),
        per_page=res.get('per_page', 10),
        total_pages=res.get('total_pages', 1)
    )

@history_router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    current_user: any = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    res = HistoryService.get_analysis(db, current_user.id, analysis_id)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return AnalysisResponse.from_orm(res.get('analysis'))

@history_router.delete("/{analysis_id}", response_model=dict)
def delete_analysis(
    analysis_id: int,
    current_user: any = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    res = HistoryService.delete_analysis(db, current_user.id, analysis_id)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return {"message": res.get("message")}

# ==================== SHARE ENDPOINTS ====================

@history_router.post("/{analysis_id}/share", response_model=ShareResponse)
def share_analysis(
    analysis_id: int,
    req: Request,
    current_user: any = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    # Determine base host URL (Flask request.host_url equivalent)
    # req.base_url contains host e.g. "http://localhost:5000/"
    host_url = str(req.base_url)
    res = HistoryService.share_analysis(db, current_user.id, analysis_id, host_url)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return ShareResponse(
        token=res.get("token"),
        share_url=res.get("share_url")
    )

@share_router.get("/{token}", response_model=AnalysisResponse)
def get_shared_analysis(
    token: str,
    db: Session = Depends(get_db)
):
    res = HistoryService.get_shared_analysis(db, token)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return AnalysisResponse.from_orm(res.get('analysis'))
