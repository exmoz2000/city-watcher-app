from app import db
from datetime import datetime, timezone


class Notification(db.Model):
    __tablename__ = "notifications"
    __table_args__ = (
        db.Index("idx_notification_user_id", "user_id"),
        db.Index("idx_notification_report_id", "report_id"),
        db.Index("idx_notification_sent_at", "sent_at"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey("reports.id"))
    notification_type = db.Column(db.String(50), nullable=False)  # 'status_change' or 'assignment'
    type = db.Column(db.String(50), nullable=False)  # Kept for backward compatibility
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    body = db.Column(db.Text)  # Alias for message
    link = db.Column(db.String(500))
    status = db.Column(db.String(50), default='sent')  # 'sent', 'failed', 'pending'
    error_message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    sent_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", backref="notifications")
    report = db.relationship("Report", backref="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "report_id": self.report_id,
            "notification_type": self.notification_type or self.type,
            "type": self.type,
            "title": self.title,
            "message": self.message or self.body,
            "body": self.body or self.message,
            "link": self.link,
            "status": self.status,
            "error_message": self.error_message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
        }
