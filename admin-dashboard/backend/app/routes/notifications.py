from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)

# Notifications are user-scoped by design: all queries filter by user_id from JWT.
# No municipality scope_query needed since notifications are personal to each user.


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread,
    }), 200


@notifications_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    db.session.commit()
    return jsonify(notif.to_dict()), 200


@notifications_bp.route("/mark-all-read", methods=["POST"])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update(
        {"is_read": True}
    )
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200
