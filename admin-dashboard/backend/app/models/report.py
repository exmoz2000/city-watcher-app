from app import db
from datetime import datetime, timezone


class Report(db.Model):
    __tablename__ = "reports"
    __table_args__ = (
        db.Index("idx_report_municipality_status", "municipality_id", "status"),
        db.Index("idx_report_municipality_category", "municipality_id", "category"),
        db.Index("idx_report_assigned_to", "assigned_to"),
        db.Index("idx_report_created_at", "created_at"),
    )

    id = db.Column(db.Integer, primary_key=True)
    report_number = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), nullable=False, default="received")
    priority = db.Column(db.String(20), nullable=False, default="medium")
    location_address = db.Column(db.String(500))
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    ward = db.Column(db.String(50))
    citizen_name = db.Column(db.String(200))
    citizen_phone = db.Column(db.String(20))
    citizen_email = db.Column(db.String(255))
    submitter_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))
    municipality_id = db.Column(db.Integer, db.ForeignKey("municipalities.id"))
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    completed_at = db.Column(db.DateTime)

    assignee = db.relationship("User", backref="assigned_reports", foreign_keys=[assigned_to])
    municipality = db.relationship("Municipality", backref="reports")
    comments = db.relationship("ReportComment", backref="report", lazy=True, order_by="ReportComment.created_at.desc()")
    history = db.relationship("ReportHistory", backref="report", lazy=True, order_by="ReportHistory.timestamp.desc()")
    attachments = db.relationship("ReportAttachment", backref="report", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "report_number": self.report_number,
            "category": self.category,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "location_address": self.location_address,
            "location_lat": self.location_lat,
            "location_lng": self.location_lng,
            "ward": self.ward,
            "citizen_name": self.citizen_name,
            "citizen_phone": self.citizen_phone,
            "citizen_email": self.citizen_email,
            "assigned_to": self.assigned_to,
            "assignee_name": f"{self.assignee.first_name} {self.assignee.last_name}" if self.assignee else None,
            "municipality_id": self.municipality_id,
            "attachment_count": len(self.attachments),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
