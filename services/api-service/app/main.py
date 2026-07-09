import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import Config
from app.core.database import init_db, SessionLocal
from app.models.user import User
from app.auth.auth_handler import hash_password

# Import Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.analyses import router as analyses_router
from app.api.history import history_router, share_router
from app.api.health import router as health_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VeriFaceAPI")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database tables
    init_db()
    logger.info("Database initialized")
    
    # 2. Ensure Demo User exists
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.username == 'Demo User').first()
        if not demo_user:
            logger.info("Creating Demo User...")
            demo_user = User(
                username='Demo User',
                email='demo@veriface.ai',
                password_hash=hash_password('demo123')  # Default password
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo User created successfully")
    except Exception as e:
        logger.error(f"Failed to create Demo User: {e}")
    finally:
        db.close()
        
    yield

# Create FastAPI instance with auto docs
app = FastAPI(
    title="VeriFace API",
    description="State-of-the-art AI Authenticity & Deepfake Detection Gateway",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount StaticFiles to serve uploads folder
if not os.path.exists(Config.UPLOAD_FOLDER):
    os.makedirs(Config.UPLOAD_FOLDER)
app.mount("/uploads", StaticFiles(directory=Config.UPLOAD_FOLDER), name="uploads")

# Register APIRouters
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(analyses_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(share_router, prefix="/api/v1")
app.include_router(health_router)  # Mounted at root level for health/ready check

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
