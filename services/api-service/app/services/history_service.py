import logging
from sqlalchemy.orm import Session
from app.models.history import AnalysisHistory
from app.auth.auth_handler import generate_share_token, decode_share_token

logger = logging.getLogger(__name__)

class HistoryService:
    @staticmethod
    def get_history(db: Session, user_id: int, page: int = 1, per_page: int = 10) -> dict:
        try:
            query = db.query(AnalysisHistory).filter(
                AnalysisHistory.user_id == user_id
            ).order_by(AnalysisHistory.created_at.desc())
            
            total = query.count()
            analyses = query.offset((page - 1) * per_page).limit(per_page).all()
            
            return {
                'analyses': analyses,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page,
                'status_code': 200
            }
        except Exception as e:
            logger.error(f"History query database error: {e}")
            return {'error': 'Failed to fetch history', 'status_code': 500}

    @staticmethod
    def get_analysis(db: Session, user_id: int, analysis_id: int) -> dict:
        try:
            analysis = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == analysis_id,
                AnalysisHistory.user_id == user_id
            ).first()
            
            if not analysis:
                return {'error': 'Analysis not found', 'status_code': 404}
            return {'analysis': analysis, 'status_code': 200}
        except Exception as e:
            logger.error(f"Analysis fetch database error: {e}")
            return {'error': 'Failed to fetch analysis', 'status_code': 500}

    @staticmethod
    def delete_analysis(db: Session, user_id: int, analysis_id: int) -> dict:
        try:
            analysis = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == analysis_id,
                AnalysisHistory.user_id == user_id
            ).first()
            
            if not analysis:
                return {'error': 'Analysis not found', 'status_code': 404}
                
            db.delete(analysis)
            db.commit()
            return {'message': 'Analysis deleted successfully', 'status_code': 200}
        except Exception as e:
            db.rollback()
            logger.error(f"Analysis deletion database error: {e}")
            return {'error': 'Failed to delete analysis', 'status_code': 500}

    @staticmethod
    def share_analysis(db: Session, user_id: int, analysis_id: int, host_url: str) -> dict:
        try:
            # Verify ownership
            analysis = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == analysis_id,
                AnalysisHistory.user_id == user_id
            ).first()
            
            if not analysis:
                return {'error': 'Analysis not found', 'status_code': 404}
            
            token = generate_share_token(analysis_id)
            share_url = f"{host_url}share/{token}"
            return {
                'token': token,
                'share_url': share_url,
                'status_code': 200
            }
        except Exception as e:
            logger.error(f"Share link generation database error: {e}")
            return {'error': f'Failed to generate share link: {str(e)}', 'status_code': 500}

    @staticmethod
    def get_shared_analysis(db: Session, token: str) -> dict:
        try:
            payload = decode_share_token(token)
            analysis_id = payload['analysis_id']
        except ValueError as e:
            return {'error': str(e), 'status_code': 400}
        
        try:
            analysis = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == analysis_id
            ).first()
            
            if not analysis:
                return {'error': 'Analysis not found', 'status_code': 404}
            return {'analysis': analysis, 'status_code': 200}
        except Exception as e:
            logger.error(f"Shared analysis retrieval database error: {e}")
            return {'error': 'Failed to retrieve shared analysis', 'status_code': 500}
