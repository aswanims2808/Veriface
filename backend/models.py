from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationship to analysis history
    analyses = relationship('AnalysisHistory', back_populates='user', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert user to dictionary (excluding password)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class AnalysisHistory(Base):
    __tablename__ = 'analysis_history'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    image_filename = Column(String(255), nullable=True)
    prediction = Column(String(50), nullable=False)  # REAL, DEEPFAKE, AI-GENERATED
    confidence = Column(Float, nullable=False)
    processing_time = Column(String(20), nullable=True)
    forensics_data = Column(Text, nullable=True)  # JSON string of forensic details
    detection_type = Column(String(20), default='Single')  # Single or Batch
    status = Column(String(20), default='Completed')  # Completed or Failed
    stored_filename = Column(String(255), nullable=True) # Unique name for thumbnail
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship to user
    user = relationship('User', back_populates='analyses')
    
    def to_dict(self):
        """Convert analysis to dictionary"""
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_filename': self.image_filename,
            'prediction': self.prediction,
            'confidence': self.confidence,
            'processing_time': self.processing_time,
            'detection_type': self.detection_type,
            'status': self.status,
            'stored_filename': self.stored_filename,
            'forensics': json.loads(self.forensics_data) if self.forensics_data else {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
