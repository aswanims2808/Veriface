import os
import logging
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from app.core.config import Config
from app.core.database import init_db, SessionLocal
from app.models.user import User
from app.auth.auth_handler import hash_password

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VeriFaceAPI")

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)

    # CORS configuration - allow credentials for JWT
    CORS(app, supports_credentials=True, origins=Config.CORS_ORIGINS)

    # Upload configuration
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)
    app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Initialize Database
    init_db()
    logger.info("Database initialized")
    
    # Ensure Demo User exists
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

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.user import user_bp
    from app.api.predict import predict_bp
    from app.api.history import history_bp, share_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(predict_bp, url_prefix='/predict')
    app.register_blueprint(history_bp, url_prefix='/history')
    app.register_blueprint(share_bp, url_prefix='/api/share')

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "VeriFace API Gateway"}), 200

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
