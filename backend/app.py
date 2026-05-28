import os
import uuid
import logging
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from core.engine import DetectionEngine
from database import init_db, SessionLocal
from models import User, AnalysisHistory
from auth import hash_password, verify_password, generate_token, token_required, get_current_user

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VeriFaceAPI")

def create_app():
    app = Flask(__name__)
    
    # Configuration from environment variables
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'))

    # CORS configuration - allow credentials for JWT
    CORS(app, supports_credentials=True, origins=CORS_ORIGINS)

    # Upload configuration
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Initialize Database
    init_db()
    logger.info("Database initialized")
    
    # Initialize Detection Engine (Global singleton for now)
    engine = DetectionEngine()

    # Ensure Demo User exists
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.username == 'Demo User').first()
        if not demo_user:
            logger.info("Creating Demo User...")
            demo_user = User(
                username='Demo User',
                email='demo@veriface.ai',
                password_hash=hash_password('demo123') # Default password
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo User created successfully")
    except Exception as e:
        logger.error(f"Failed to create Demo User: {e}")
    finally:
        db.close()

    # ==================== AUTHENTICATION ENDPOINTS ====================
    
    @app.route('/auth/register', methods=['POST'])
    def register():
        """Register a new user"""
        try:
            data = request.get_json()
            
            # Validate input
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            
            if not username or not email or not password:
                return jsonify({'error': 'Username, email, and password are required'}), 400
            
            if len(password) < 6:
                return jsonify({'error': 'Password must be at least 6 characters'}), 400
            
            # Check if user already exists
            db = SessionLocal()
            try:
                existing_user = db.query(User).filter(
                    (User.username == username) | (User.email == email)
                ).first()
                
                if existing_user:
                    if existing_user.username == username:
                        return jsonify({'error': 'Username already exists'}), 409
                    else:
                        return jsonify({'error': 'Email already exists'}), 409
                
                # Create new user
                password_hash = hash_password(password)
                new_user = User(
                    username=username,
                    email=email,
                    password_hash=password_hash
                )
                
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
                logger.info(f"New user registered: {username}")
                
                return jsonify({
                    'message': 'User registered successfully',
                    'user': new_user.to_dict()
                }), 201
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return jsonify({'error': 'Registration failed'}), 500

    @app.route('/auth/login', methods=['POST'])
    def login():
        """Login user and return JWT token"""
        try:
            data = request.get_json()
            
            # Support both 'username' and 'email' keys in payload
            username_or_email = data.get('username', '').strip() or data.get('email', '').strip()
            password = data.get('password', '')
            
            logger.info(f"Login attempt for: {username_or_email}")
            
            if not username_or_email or not password:
                return jsonify({'error': 'Username/email and password are required'}), 400
            
            db = SessionLocal()
            try:
                # Find user by username or email
                user = db.query(User).filter(
                    (User.username == username_or_email) | (User.email == username_or_email)
                ).first()
                
                if not user:
                    logger.warning(f"Login failed: User not found for {username_or_email}")
                    return jsonify({'error': 'Invalid credentials'}), 401
                
                # Verify password
                is_valid = verify_password(password, user.password_hash)
                if not is_valid:
                    logger.warning(f"Login failed: Invalid password for user {user.username}")
                    # Debug log - remove in production
                    # logger.info(f"Hash check failed. Hash: {user.password_hash}")
                    return jsonify({'error': 'Invalid credentials'}), 401
                
                # Update last login
                user.last_login = datetime.utcnow()
                db.commit()
                
                # Generate JWT token
                token = generate_token(user.id, user.username)
                
                logger.info(f"User logged in successfully: {user.username}")
                
                return jsonify({
                    'message': 'Login successful',
                    'token': token,
                    'user': user.to_dict()
                }), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Login error: {e}")
            return jsonify({'error': 'Login failed'}), 500

    @app.route('/auth/verify', methods=['GET'])
    @token_required
    def verify_token():
        """Verify JWT token and return user info"""
        try:
            current_user = get_current_user()
            
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == current_user['user_id']).first()
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'valid': True,
                    'user': user.to_dict()
                }), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return jsonify({'error': 'Verification failed'}), 500

    # ==================== USER ENDPOINTS ====================
    
    @app.route('/user/profile', methods=['GET'])
    @token_required
    def get_profile():
        """Get user profile"""
        try:
            current_user = get_current_user()
            
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == current_user['user_id']).first()
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                # Get analysis count
                analysis_count = db.query(AnalysisHistory).filter(
                    AnalysisHistory.user_id == user.id
                ).count()
                
                profile = user.to_dict()
                profile['total_analyses'] = analysis_count
                
                return jsonify(profile), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Profile fetch error: {e}")
            return jsonify({'error': 'Failed to fetch profile'}), 500

    # ==================== ANALYSIS ENDPOINTS ====================

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "VeriFace Backend"}), 200

    @app.route('/predict', methods=['POST'])
    @token_required
    def predict():
        """Analyze image for deepfake detection (protected route)"""
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        try:
            current_user = get_current_user()
            detection_type = request.form.get('detection_type', 'Single')
            
            # Read file bytes
            image_bytes = file.read()
            
            # Save file to uploads with unique name
            ext = os.path.splitext(file.filename)[1].lower() or '.jpg'
            stored_filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], stored_filename)
            
            with open(file_path, 'wb') as f:
                f.write(image_bytes)

            # Process using the engine
            result = None
            error_msg = None
            try:
                result = engine.process_image(image_bytes)
            except Exception as e:
                logger.error(f"Engine Processing Error: {e}")
                error_msg = str(e)

            # Save to database (even if failed, to fulfill history requirement)
            db = SessionLocal()
            try:
                analysis = AnalysisHistory(
                    user_id=current_user['user_id'],
                    image_filename=file.filename,
                    prediction=result.get('prediction', 'ERROR') if result else 'ERROR',
                    confidence=result.get('confidence', 0.0) if result else 0.0,
                    processing_time=result.get('processing_time', '0s') if result else '0s',
                    forensics_data=json.dumps(result.get('forensics', {})) if result else json.dumps({'error': error_msg}),
                    detection_type=detection_type,
                    status='Completed' if result else 'Failed',
                    stored_filename=stored_filename
                )
                
                db.add(analysis)
                db.commit()
                db.refresh(analysis)
                
                if result:
                    # Add analysis ID to result
                    result['analysis_id'] = analysis.id
                    logger.info(f"Analysis completed for user {current_user['username']} ({detection_type}): {result['prediction']}")
                    return jsonify(result), 200
                else:
                    return jsonify({"error": error_msg, "analysis_id": analysis.id}), 500
                
            finally:
                db.close()
            
        except Exception as e:
            logger.error(f"Prediction Route Error: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route('/history', methods=['GET'])
    @token_required
    def get_history():
        """Get user's analysis history"""
        try:
            current_user = get_current_user()
            
            # Pagination parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            db = SessionLocal()
            try:
                # Query with pagination
                query = db.query(AnalysisHistory).filter(
                    AnalysisHistory.user_id == current_user['user_id']
                ).order_by(AnalysisHistory.created_at.desc())
                
                total = query.count()
                analyses = query.offset((page - 1) * per_page).limit(per_page).all()
                
                return jsonify({
                    'analyses': [a.to_dict() for a in analyses],
                    'total': total,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': (total + per_page - 1) // per_page
                }), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"History fetch error: {e}")
            return jsonify({'error': 'Failed to fetch history'}), 500

    @app.route('/history/<int:analysis_id>', methods=['GET'])
    @token_required
    def get_analysis(analysis_id):
        """Get specific analysis by ID"""
        try:
            current_user = get_current_user()
            
            db = SessionLocal()
            try:
                analysis = db.query(AnalysisHistory).filter(
                    AnalysisHistory.id == analysis_id,
                    AnalysisHistory.user_id == current_user['user_id']
                ).first()
                
                if not analysis:
                    return jsonify({'error': 'Analysis not found'}), 404
                
                return jsonify(analysis.to_dict()), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Analysis fetch error: {e}")
            return jsonify({'error': 'Failed to fetch analysis'}), 500

    @app.route('/history/<int:analysis_id>', methods=['DELETE'])
    @token_required
    def delete_analysis(analysis_id):
        """Delete specific analysis"""
        try:
            current_user = get_current_user()
            
            db = SessionLocal()
            try:
                analysis = db.query(AnalysisHistory).filter(
                    AnalysisHistory.id == analysis_id,
                    AnalysisHistory.user_id == current_user['user_id']
                ).first()
                
                if not analysis:
                    return jsonify({'error': 'Analysis not found'}), 404
                
                db.delete(analysis)
                db.commit()
                
                return jsonify({'message': 'Analysis deleted successfully'}), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Analysis deletion error: {e}")
            return jsonify({'error': 'Failed to delete analysis'}), 500


    # ==================== SHARE ENDPOINTS ====================

    @app.route('/history/<int:analysis_id>/share', methods=['POST'])
    @token_required
    def share_analysis(analysis_id):
        """Generate a share token for an analysis"""
        try:
            current_user = get_current_user()
            
            db = SessionLocal()
            try:
                # Verify ownership
                analysis = db.query(AnalysisHistory).filter(
                    AnalysisHistory.id == analysis_id,
                    AnalysisHistory.user_id == current_user['user_id']
                ).first()
                
                if not analysis:
                    return jsonify({'error': 'Analysis not found'}), 404
                
                # Generate token
                from auth import generate_share_token
                token = generate_share_token(analysis_id)
                
                share_url = f"{request.host_url}share/{token}"
                
                return jsonify({
                    'token': token,
                    'share_url': share_url
                }), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Share generation error: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to generate share link: {str(e)}'}), 500

    @app.route('/api/share/<token>', methods=['GET'])
    def get_shared_analysis(token):
        """Get public shared analysis"""
        try:
            from auth import decode_share_token
            
            try:
                payload = decode_share_token(token)
                analysis_id = payload['analysis_id']
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
            
            db = SessionLocal()
            try:
                analysis = db.query(AnalysisHistory).filter(
                    AnalysisHistory.id == analysis_id
                ).first()
                
                if not analysis:
                    return jsonify({'error': 'Analysis not found'}), 404
                
                # Return limited data (PRIVACY)
                # Intentionally excluding user info and filename potentially
                data = analysis.to_dict()
                
                # Ensure no user PII is leaked (though to_dict doesn't include it currently)
                # We can also decide what to strip.
                
                return jsonify(data), 200
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Shared fetch error: {e}")
            return jsonify({'error': 'Failed to retrieve shared analysis'}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
