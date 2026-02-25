from datetime import datetime, timedelta, timezone
from app import db
from app.models.sla import SLAConfig, SLATracking
from app.models.report import Report


def calculate_sla_deadline(report):
    """
    Calculate and store the SLA deadline for a newly created report.
    Returns the SLATracking record or None if no config exists.
    """
    config = SLAConfig.query.filter_by(
        municipality_id=report.municipality_id,
        category=report.category,
    ).first()

    if not config:
        return None

    deadline = report.created_at + timedelta(hours=config.response_hours)

    tracking = SLATracking(
        report_id=report.id,
        sla_config_id=config.id,
        deadline=deadline,
        breached=False,
        breached_at=None,
    )
    db.session.add(tracking)
    db.session.flush()
    return tracking


def check_sla_breaches():
    """
    Check all open reports for SLA breaches and update tracking records.
    Returns count of newly breached reports.
    """
    now = datetime.now(timezone.utc)

    overdue = (
        SLATracking.query
        .join(Report, SLATracking.report_id == Report.id)
        .filter(
            SLATracking.breached == False,  # noqa: E712
            SLATracking.deadline < now,
            Report.status.notin_(["resolved", "closed"]),
        )
        .all()
    )

    for tracking in overdue:
        tracking.breached = True
        tracking.breached_at = now

    db.session.flush()
    return len(overdue)


def get_sla_dashboard(municipality_id=None):
    """
    Get SLA compliance dashboard data.
    Classifies open tracked reports into breached, at_risk, on_track.
    Returns dict with breached, at_risk, on_track lists and compliance_rate.
    """
    now = datetime.now(timezone.utc)

    query = (
        SLATracking.query
        .join(Report, SLATracking.report_id == Report.id)
        .filter(Report.status.notin_(["resolved", "closed"]))
    )

    if municipality_id is not None:
        query = query.filter(Report.municipality_id == municipality_id)

    trackings = query.all()

    breached = []
    at_risk = []
    on_track = []

    for tracking in trackings:
        report = tracking.report
        report_dict = report.to_dict()
        report_dict["sla_deadline"] = tracking.deadline.isoformat() if tracking.deadline else None
        report_dict["sla_breached"] = tracking.breached

        # Make deadline timezone-aware for comparison if needed
        deadline = tracking.deadline
        if deadline and deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        created_at = report.created_at
        if created_at and created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        if tracking.breached or (deadline and deadline < now):
            breached.append(report_dict)
        else:
            # Calculate elapsed percentage
            config = tracking.sla_config
            total_hours = config.response_hours
            elapsed = (now - created_at).total_seconds() / 3600 if created_at else 0
            elapsed_pct = (elapsed / total_hours) * 100 if total_hours > 0 else 0

            if elapsed_pct >= config.warning_threshold_pct:
                at_risk.append(report_dict)
            else:
                on_track.append(report_dict)

    total = len(breached) + len(at_risk) + len(on_track)
    compliance_rate = (len(on_track) / total) * 100 if total > 0 else 100.0

    return {
        "breached": breached,
        "at_risk": at_risk,
        "on_track": on_track,
        "compliance_rate": round(compliance_rate, 1),
    }
