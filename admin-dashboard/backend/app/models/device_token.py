from app import db
from datetime import datetime, timezone


class DeviceToken(db.Model):
    __tablename__ = "device_tokens"
    __table_args__ = (
        db.UniqueConstraint("user_id", "expo_push_token", name="uq_user_device_token"),
        db.Index("idx_device_token_user_id", "user_id"),
        db.Index("idx_device_token_token", "expo_push_token"),
        db.Index("idx_device_token_is_active", "is_active"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    expo_push_token = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(10), nullable=False)  # 'ios' or 'android'
    device_name = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_used_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", backref="device_tokens")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "expo_push_token": self.expo_push_token,
            "platform": self.platform,
            "device_name": self.device_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_used_at": self.last_used_at.isoformat() if self.last_used_at else None,
        }
