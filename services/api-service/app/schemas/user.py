from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    username: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    message: str
    token: str
    user: UserResponse

class RegisterResponse(BaseModel):
    message: str
    user: UserResponse

class VerifyResponse(BaseModel):
    valid: bool
    user: UserResponse

class ProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    total_analyses: int

    class Config:
        from_attributes = True
