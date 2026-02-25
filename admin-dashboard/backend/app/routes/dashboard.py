from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.report import Report
from app.models.report_sub import ReportHistory
from app.middleware.municipality_scope import scope_query
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/metrics", methods=["GET"])
@jwt_required()
def get_metrics():
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    total = scope_query(Report.query, Report).count()
    today = scope_query(Report.query, Report).filter(Report.created_at >= today_start).count()
    this_week = scope_query(Report.query, Report).filter(Report.created_at >= week_start).count()
    this_month = scope_query(Report.query, Report).filter(Report.created_at >= month_start).count()

    pending = scope_query(Report.query, Report).filter(
        Report.status.in_(["received", "under_review"])
    ).count()
    in_progress = scope_query(Report.query, Report).filter(
        Report.status.in_(["crew_dispatched", "in_progress"])
    ).count()
    completed = scope_query(Report.query, Report).filter(
        Report.status.in_(["resolved", "closed"])
    ).count()

    # Average response time (hours) for completed reports
    completed_reports = scope_query(Report.query, Report).filter(
        Report.completed_at.isnot(None)
    ).all()
    if completed_reports:
        total_hours = sum(
            (r.completed_at - r.created_at).total_seconds() / 3600
            for r in completed_reports
        )
        avg_response = round(total_hours / len(completed_reports), 1)
    else:
        avg_response = 0

    return jsonify({
        "total": total,
        "today": today,
        "this_week": this_week,
        "this_month": this_month,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "avg_response_hours": avg_response,
    }), 200


@dashboard_bp.route("/recent-activity", methods=["GET"])
@jwt_required()
def get_recent_activity():
    # Scope through Report join since ReportHistory has no municipality_id
    scoped_report_ids = scope_query(Report.query, Report).with_entities(Report.id)
    activities = (
        ReportHistory.query
        .filter(ReportHistory.report_id.in_(scoped_report_ids))
        .order_by(ReportHistory.timestamp.desc())
        .limit(20)
        .all()
    )
    return jsonify([a.to_dict() for a in activities]), 200


@dashboard_bp.route("/charts", methods=["GET"])
@jwt_required()
def get_charts():
    # Reports by category
    by_category = (
        scope_query(Report.query, Report)
        .with_entities(Report.category, func.count(Report.id))
        .group_by(Report.category)
        .all()
    )

    # Reports by status
    by_status = (
        scope_query(Report.query, Report)
        .with_entities(Report.status, func.count(Report.id))
        .group_by(Report.status)
        .all()
    )

    # Reports by priority
    by_priority = (
        scope_query(Report.query, Report)
        .with_entities(Report.priority, func.count(Report.id))
        .group_by(Report.priority)
        .all()
    )

    return jsonify({
        "by_category": [{"name": c, "value": v} for c, v in by_category],
        "by_status": [{"name": s, "value": v} for s, v in by_status],
        "by_priority": [{"name": p, "value": v} for p, v in by_priority],
    }), 200
