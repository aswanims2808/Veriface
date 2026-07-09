import logging
from app.core.database import SessionLocal
from app.models.history import AnalysisHistory
from app.auth.auth_handler import generate_share_token, decode_share_token

logger = logging.getLogger(__name__)

class HistoryService:
    @staticmethod
    def get_history(user_id, page=1, per_page=10):
        db = SessionLocal()
        try:
            query = db.query(AnalysisHistory).filter(
                AnalysisHistory.user_id == user_id
            ).order_by(AnalysisHistory.created_at.desc())
            
            total = query.count()
            analyses = query.offset((page - 1) * per_page).limit(per_page).all()
            
            return {
                'analyses': [a.to_dict() for a in analyses],
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page,
                'status_code': 200
            }
        except Exception as e:
            logger.error(f"History query error: {e}")
            return {'error': 'Failed to fetch history', 'status_code': 500}
        finally:
            db.close()

    @staticmethod
    def get_analysis(user_id, analysis_id):
        db = SessionLocal()
        try:
            analysis = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == analysis_id,
                AnalysisHistory.user_id == user_id
            ).first()
            
            if not analysis:
                return {'error': 'Analysis not found', 'status_code': 404}
            return analysis.to_dict()
        except Exception as e:
            logger.error(f"Analysis fetch error: {e}")
            return {'error': 'Failed to fetch analysis', 'status_code': 500}
        finally:
            db.close()

    @staticmethod
    def delete_analysis(user_id, analysis_id):
        db = SessionLocal()
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
            logger.error(f"Analysis deletion error: {e}")
            return {'error': 'Failed to delete analysis', 'status_code': 500}
        finally:
            db.close()

    @staticmethod
    def share_analysis(user_id, analysis_id, host_url):
        db = SessionLocal()
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
            logger.error(f"Share link generation error: {e}")
            return {'error': f'Failed to generate share link: {str(e)}', 'status_code': 500}
        finally:
            db.close()

    @staticmethod
    def get_shared_analysis(token):
        try:
            payload = decode_share_token(token)
            analysis_id = payload['analysis_id']
        except ValueError as e:
            return {'error': str(e), 'status_code': 400}
        
        db = SessionLocal()
        try:
            analysis = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == analysis_id
            ).first()
            
            if not analysis:
                return {'error': 'Analysis not found', 'status_code': 404}
            
            # Return limited data for privacy if needed, but currently matching old endpoint behavior:
            return analysis.to_dict()
        except Exception as e:
            logger.error(f"Shared analysis retrieval error: {e}")
            return {'error': 'Failed to retrieve shared analysis', 'status_code': 500}
        finally:
            db.close()
