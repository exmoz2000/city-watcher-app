from app import db
from datetime import datetime, timezone
import bcrypt


class User(db.Model):
    __tablename__ = "users"
    __table_args__ = (
        db.Index("idx_user_municipality_role", "municipality_id", "role"),
    )

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for social-only accounts
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(
        db.String(50), nullable=False, default="field_worker"
    )  # super_admin, municipality_admin, department_manager, field_worker
    department = db.Column(db.String(100))
    municipality_id = db.Column(db.Integer, db.ForeignKey("municipalities.id"))
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    municipality = db.relationship("Municipality", backref="users")

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def has_password(self):
        """Check if user has password authentication enabled."""
        return self.password_hash is not None

    def get_linked_providers(self):
        """Get list of linked social providers."""
        return [auth.provider for auth in self.social_auth_providers]

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
            "department": self.department,
            "municipality_id": self.municipality_id,
            "municipality_name": self.municipality.name if self.municipality else None,
            "phone": self.phone,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "has_password": self.has_password(),
            "linked_providers": self.get_linked_providers(),
        }
