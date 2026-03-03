from app import db
from datetime import datetime, timezone


class SocialAuthProvider(db.Model):
    """
    Model for storing social authentication provider information.
    Links users to their social media accounts (Google, Facebook, Apple).
    """
    __tablename__ = 'social_auth_providers'
    __table_args__ = (
        db.Index('idx_provider_user', 'provider', 'provider_user_id', unique=True),
        db.Index('idx_user_provider', 'user_id', 'provider'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    provider = db.Column(db.String(20), nullable=False)  # 'google', 'facebook', 'apple'
    provider_user_id = db.Column(db.String(255), nullable=False)  # Provider's unique ID
    email = db.Column(db.String(255), nullable=False)  # Email from provider
    profile_picture_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
    
    # Relationship to User model
    user = db.relationship('User', backref=db.backref('social_auth_providers', cascade='all, delete-orphan'))
    
    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            'id': self.id,
            'provider': self.provider,
            'email': self.email,
            'profile_picture_url': self.profile_picture_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
