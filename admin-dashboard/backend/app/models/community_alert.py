from app import db
from datetime import datetime, timezone


class CommunityAlert(db.Model):
    __tablename__ = "community_alerts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    radius_meters = db.Column(db.Float, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    municipality_id = db.Column(db.Integer, db.ForeignKey("municipalities.id"))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    municipality = db.relationship("Municipality", backref="community_alerts")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "category": self.category,
            "severity": self.severity,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "radius_meters": self.radius_meters,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_active": self.is_active,
            "municipality_id": self.municipality_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
