from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse, RegisterResponse, VerifyResponse
from app.services.auth_service import AuthService
from app.auth.auth_handler import get_current_user_dep

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    res = AuthService.register_user(db, payload.username, payload.email, payload.password)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return RegisterResponse(
        message=res.get("message"),
        user=UserResponse.from_orm(res.get("user"))
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    username_or_email = payload.username or payload.email
    if not username_or_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email is required")
        
    res = AuthService.login_user(db, username_or_email, payload.password)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return TokenResponse(
        message=res.get("message"),
        token=res.get("token"),
        user=UserResponse.from_orm(res.get("user"))
    )

@router.get("/verify", response_model=VerifyResponse)
def verify_token(current_user: any = Depends(get_current_user_dep), db: Session = Depends(get_db)):
    res = AuthService.verify_user_token(db, current_user.id)
    status_code = res.get('status_code', 200)
    if 'error' in res:
        raise HTTPException(status_code=status_code, detail=res['error'])
    return VerifyResponse(
        valid=res.get("valid"),
        user=UserResponse.from_orm(res.get("user"))
    )
