from app import db
from datetime import datetime, timezone


class SLAConfig(db.Model):
    __tablename__ = "sla_configs"
    __table_args__ = (
        db.UniqueConstraint("municipality_id", "category", name="uq_sla_config_municipality_category"),
    )

    id = db.Column(db.Integer, primary_key=True)
    municipality_id = db.Column(db.Integer, db.ForeignKey("municipalities.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    response_hours = db.Column(db.Integer, nullable=False)
    warning_threshold_pct = db.Column(db.Integer, default=75)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    municipality = db.relationship("Municipality", backref="sla_configs")
    tracking_records = db.relationship("SLATracking", backref="sla_config", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "municipality_id": self.municipality_id,
            "category": self.category,
            "response_hours": self.response_hours,
            "warning_threshold_pct": self.warning_threshold_pct,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SLATracking(db.Model):
    __tablename__ = "sla_tracking"
    __table_args__ = (
        db.Index("idx_sla_tracking_deadline_breached", "deadline", "breached"),
    )

    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey("reports.id"), nullable=False, unique=True)
    sla_config_id = db.Column(db.Integer, db.ForeignKey("sla_configs.id"), nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    breached = db.Column(db.Boolean, default=False)
    breached_at = db.Column(db.DateTime)

    report = db.relationship("Report", backref=db.backref("sla_tracking", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "sla_config_id": self.sla_config_id,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "breached": self.breached,
            "breached_at": self.breached_at.isoformat() if self.breached_at else None,
        }
