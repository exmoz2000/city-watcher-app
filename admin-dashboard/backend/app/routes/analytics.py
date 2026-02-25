from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.report import Report
from app.models.user import User
from app.middleware.municipality_scope import scope_query, DEPARTMENT_CATEGORIES
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta, timezone

analytics_bp = Blueprint("analytics", __name__)


def _apply_date_filter(query, model=Report):
    """Apply optional start_date/end_date query params."""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    if start_date:
        try:
            sd = datetime.fromisoformat(start_date)
            query = query.filter(model.created_at >= sd)
        except ValueError:
            pass
    if end_date:
        try:
            ed = datetime.fromisoformat(end_date)
            query = query.filter(model.created_at <= ed)
        except ValueError:
            pass
    return query


@analytics_bp.route("/trends", methods=["GET"])
@jwt_required()
def get_trends():
    days = request.args.get("days", 30, type=int)
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)

    query = scope_query(Report.query, Report).filter(Report.created_at >= start)
    query = _apply_date_filter(query)

    reports = (
        query
        .with_entities(
            func.date(Report.created_at).label("date"),
            func.count(Report.id).label("count"),
        )
        .group_by(func.date(Report.created_at))
        .order_by(func.date(Report.created_at))
        .all()
    )

    return jsonify([
        {"date": str(r.date), "count": r.count} for r in reports
    ]), 200


@analytics_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():
    query = _apply_date_filter(scope_query(Report.query, Report))
    results = (
        query
        .with_entities(Report.category, func.count(Report.id))
        .group_by(Report.category)
        .all()
    )
    return jsonify([
        {"category": c, "count": v} for c, v in results
    ]), 200


@analytics_bp.route("/performance", methods=["GET"])
@jwt_required()
def get_performance():
    query = _apply_date_filter(scope_query(Report.query, Report))
    total = query.count()
    resolved = query.filter(
        Report.status.in_(["resolved", "closed"])
    ).count()
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    return jsonify({
        "total_reports": total,
        "resolved_reports": resolved,
        "resolution_rate": resolution_rate,
    }), 200


@analytics_bp.route("/department-performance", methods=["GET"])
@jwt_required()
def department_performance():
    """Resolution rates by department."""
    query = _apply_date_filter(scope_query(Report.query, Report))
    results = []

    for dept, cats in DEPARTMENT_CATEGORIES.items():
        if not cats:
            continue
        dept_query = query.filter(Report.category.in_(cats))
        total = dept_query.count()
        resolved = dept_query.filter(Report.status.in_(["resolved", "closed"])).count()
        rate = round((resolved / total * 100), 1) if total > 0 else 0
        results.append({
            "department": dept,
            "total": total,
            "resolved": resolved,
            "resolution_rate": rate,
        })

    return jsonify(results), 200


@analytics_bp.route("/ward-breakdown", methods=["GET"])
@jwt_required()
def ward_breakdown():
    """Report counts per ward."""
    query = _apply_date_filter(scope_query(Report.query, Report))
    results = (
        query
        .filter(Report.ward.isnot(None))
        .with_entities(Report.ward, func.count(Report.id))
        .group_by(Report.ward)
        .order_by(func.count(Report.id).desc())
        .limit(20)
        .all()
    )
    return jsonify([
        {"ward": w, "count": c} for w, c in results
    ]), 200
