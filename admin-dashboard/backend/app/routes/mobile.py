import math
import os
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.community_alert import CommunityAlert
from app.models.device_token import DeviceToken
from app.models.report import Report
from app.models.report_sub import ReportAttachment
from app.models.user import User
from app.services.token_manager import TokenManager

mobile_bp = Blueprint("mobile", __name__)
token_manager = TokenManager()



def _haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the Haversine distance in meters between two points."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


SEVERITY_ORDER = {"critical": 0, "warning": 1, "info": 2}


@mobile_bp.route("/alerts", methods=["GET"])
@jwt_required()
def get_alerts():
    now = datetime.now(timezone.utc)
    alerts = CommunityAlert.query.filter(
        CommunityAlert.is_active == True,
        CommunityAlert.expires_at > now,
    ).all()

    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    if lat is not None and lng is not None:
        alerts = [
            a for a in alerts
            if _haversine_distance(lat, lng, a.latitude, a.longitude) <= a.radius_meters
        ]

    alerts.sort(key=lambda a: (
        SEVERITY_ORDER.get(a.severity, 99),
        -(a.created_at.timestamp() if a.created_at else 0),
    ))

    return jsonify([a.to_dict() for a in alerts]), 200


@mobile_bp.route("/profile", methods=["PATCH"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    allowed_fields = ["first_name", "last_name", "phone"]
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify(user.to_dict()), 200


@mobile_bp.route("/device-tokens", methods=["POST"])
@jwt_required()
def register_device_token():
    """Register or update a push notification token."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    expo_push_token = data.get("expo_push_token") or data.get("token")
    platform = data.get("platform") or data.get("device_type", "ios")
    device_name = data.get("device_name")

    if not expo_push_token or not platform:
        return jsonify({"error": "expo_push_token and platform are required"}), 400

    try:
        token = token_manager.register_token(
            user_id=user_id,
            token=expo_push_token,
            platform=platform,
            device_name=device_name
        )
        return jsonify(token.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to register token"}), 500


@mobile_bp.route("/device-tokens", methods=["GET"])
@jwt_required()
def get_device_tokens():
    """Get all active device tokens for the current user."""
    user_id = int(get_jwt_identity())
    
    try:
        tokens = token_manager.get_active_tokens(user_id)
        return jsonify({"tokens": [token.to_dict() for token in tokens]}), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve tokens"}), 500


@mobile_bp.route("/device-tokens/<token>", methods=["DELETE"])
@jwt_required()
def delete_device_token(token):
    """Remove a device token (on logout)."""
    user_id = int(get_jwt_identity())
    
    try:
        success = token_manager.remove_token(token, user_id)
        if success:
            return jsonify({"message": "Token removed"}), 204
        else:
            return jsonify({"error": "Token not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to remove token"}), 500


@mobile_bp.route("/device-tokens", methods=["DELETE"])
@jwt_required()
def deactivate_device_token():
    """Deactivate a device token (legacy endpoint for backward compatibility)."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    expo_push_token = data.get("expo_push_token")
    if not expo_push_token:
        return jsonify({"error": "expo_push_token is required"}), 400

    try:
        success = token_manager.remove_token(expo_push_token, user_id)
        return jsonify({"message": "Device token deactivated"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to deactivate token"}), 500


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@mobile_bp.route("/reports/<int:report_id>/attachments", methods=["POST"])
@jwt_required()
def upload_attachment(report_id):
    user_id = int(get_jwt_identity())

    report = Report.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No file provided"}), 400

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        return jsonify({"error": "Only JPEG and PNG images are allowed"}), 415

    # Check file size by reading content
    file_data = file.read()
    if len(file_data) > MAX_FILE_SIZE:
        return jsonify({"error": "File size exceeds 10 MB limit"}), 413
    file.seek(0)

    # Determine upload directory
    upload_base = current_app.config.get("UPLOAD_FOLDER", "uploads")
    upload_dir = os.path.join(upload_base, "reports", str(report_id))
    os.makedirs(upload_dir, exist_ok=True)

    # Generate UUID filename preserving extension
    ext = os.path.splitext(file.filename)[1] or (".jpg" if file.content_type == "image/jpeg" else ".png")
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(file_data)

    attachment = ReportAttachment(
        report_id=report_id,
        file_path=file_path,
        file_type=file.content_type,
        uploaded_by=user_id,
    )
    db.session.add(attachment)
    db.session.commit()

    return jsonify(attachment.to_dict()), 201
