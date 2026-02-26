from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///citywatcher.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 hours

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.reports import reports_bp
    from app.routes.users import users_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.analytics import analytics_bp
    from app.routes.notifications import notifications_bp
    from app.routes.sla import sla_bp
    from app.routes.mobile import mobile_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(sla_bp, url_prefix="/api/sla")
    app.register_blueprint(mobile_bp, url_prefix="/api/mobile")

    from app.middleware.municipality_scope import load_current_user
    app.before_request(load_current_user)

    with app.app_context():
        db.create_all()

    return app
