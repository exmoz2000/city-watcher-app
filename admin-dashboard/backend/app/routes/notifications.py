from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.notification import Notification
from app.services.preference_manager import PreferenceManager

notifications_bp = Blueprint("notifications", __name__)
preference_manager = PreferenceManager()

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


@notifications_bp.route("/preferences", methods=["GET"])
@jwt_required()
def get_preferences():
    """Get notification preferences for the current user."""
    user_id = int(get_jwt_identity())
    
    try:
        preferences = preference_manager.get_preferences(user_id)
        return jsonify({
            "status_change_enabled": preferences.status_change_enabled,
            "assignment_enabled": preferences.assignment_enabled,
            "updated_at": preferences.updated_at.isoformat() if preferences.updated_at else None
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve preferences"}), 500


@notifications_bp.route("/preferences", methods=["PUT"])
@jwt_required()
def update_preferences():
    """Update notification preferences for the current user."""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    status_change_enabled = data.get("status_change_enabled")
    assignment_enabled = data.get("assignment_enabled")
    
    try:
        preferences = preference_manager.update_preferences(
            user_id=user_id,
            status_change_enabled=status_change_enabled,
            assignment_enabled=assignment_enabled
        )
        return jsonify({
            "status_change_enabled": preferences.status_change_enabled,
            "assignment_enabled": preferences.assignment_enabled,
            "updated_at": preferences.updated_at.isoformat() if preferences.updated_at else None
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to update preferences"}), 500


@notifications_bp.route("/history", methods=["GET"])
@jwt_required()
def get_notification_history():
    """Get notification history for the current user with pagination."""
    user_id = int(get_jwt_identity())
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    
    # Cap limit at 100
    limit = min(limit, 100)
    
    try:
        # Query notifications for this user
        query = Notification.query.filter_by(user_id=user_id).order_by(Notification.sent_at.desc())
        
        # Get total count
        total = query.count()
        
        # Paginate
        offset = (page - 1) * limit
        notifications = query.offset(offset).limit(limit).all()
        
        # Calculate total pages
        pages = (total + limit - 1) // limit if total > 0 else 1
        
        return jsonify({
            "notifications": [
                {
                    "id": n.id,
                    "type": n.notification_type or n.type,
                    "report_id": n.report_id,
                    "title": n.title,
                    "body": n.body or n.message,
                    "sent_at": n.sent_at.isoformat() if n.sent_at else None
                }
                for n in notifications
            ],
            "total": total,
            "page": page,
            "pages": pages
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve notification history"}), 500


@notifications_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_notification_stats():
    """Get notification statistics (admin only)."""
    user_id = int(get_jwt_identity())
    
    # Check if user is admin (you may need to adjust this based on your User model)
    from app.models.user import User
    user = User.query.get(user_id)
    if not user or user.role not in ['super_admin', 'municipality_admin']:
        return jsonify({"error": "Unauthorized"}), 403
    
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    try:
        from datetime import datetime
        query = Notification.query
        
        if start_date:
            query = query.filter(Notification.sent_at >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(Notification.sent_at <= datetime.fromisoformat(end_date))
        
        total_sent = query.filter(Notification.status == 'sent').count()
        total_failed = query.filter(Notification.status == 'failed').count()
        total = total_sent + total_failed
        
        success_rate = (total_sent / total * 100) if total > 0 else 0
        
        # Get error breakdown
        failed_notifications = query.filter(Notification.status == 'failed').all()
        error_breakdown = {}
        for notif in failed_notifications:
            if notif.error_message:
                # Extract error type from message
                error_type = notif.error_message.split(':')[0] if ':' in notif.error_message else 'Unknown'
                error_breakdown[error_type] = error_breakdown.get(error_type, 0) + 1
        
        return jsonify({
            "total_sent": total_sent,
            "total_failed": total_failed,
            "success_rate": round(success_rate, 2),
            "error_breakdown": error_breakdown
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve statistics"}), 500
