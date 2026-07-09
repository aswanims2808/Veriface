from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import ProfileResponse
from app.services.auth_service import AuthService
from app.auth.auth_handler import get_current_user_dep

router = APIRouter(prefix="/user", tags=["Users"])

@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: any = Depends(get_current_user_dep), db: Session = Depends(get_db)):
    res = AuthService.get_user_profile(db, current_user.id)
    if isinstance(res, dict) and 'error' in res:
        status_code = res.get('status_code', 500)
        raise HTTPException(status_code=status_code, detail=res['error'])
    
    # Map the response directly to ProfileResponse
    return ProfileResponse(
        id=res.get("id"),
        username=res.get("username"),
        email=res.get("email"),
        created_at=res.get("created_at"),
        last_login=res.get("last_login"),
        total_analyses=res.get("total_analyses")
    )
