from app import db
from datetime import datetime, timezone
import json


class Municipality(db.Model):
    __tablename__ = "municipalities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    logo_url = db.Column(db.String(500))
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    settings = db.Column(db.Text, default="{}")  # JSON string
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def get_settings(self):
        try:
            return json.loads(self.settings) if self.settings else {}
        except (json.JSONDecodeError, TypeError):
            return {}

    def set_settings(self, settings_dict):
        self.settings = json.dumps(settings_dict)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "logo_url": self.logo_url,
            "contact_email": self.contact_email,
            "contact_phone": self.contact_phone,
            "address": self.address,
            "settings": self.get_settings(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
