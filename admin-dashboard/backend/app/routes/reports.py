from flask import Blueprint, request, jsonify, Response, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.report import Report
from app.models.report_sub import ReportComment, ReportHistory
from app.models.notification import Notification
from app.models.user import User
from app.middleware.municipality_scope import scope_query, role_required
from app.services.sla_engine import calculate_sla_deadline
from app.services.export_service import generate_csv
from datetime import datetime, timezone

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("", methods=["GET"])
@jwt_required()
def get_reports():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status = request.args.get("status")
    category = request.args.get("category")
    priority = request.args.get("priority")
    search = request.args.get("search")
    sort_by = request.args.get("sort_by", "created_at")
    sort_order = request.args.get("sort_order", "desc")

    query = scope_query(Report.query, Report)

    if status:
        query = query.filter(Report.status == status)
    if category:
        query = query.filter(Report.category == category)
    if priority:
        query = query.filter(Report.priority == priority)
    if search:
        query = query.filter(
            db.or_(
                Report.title.ilike(f"%{search}%"),
                Report.report_number.ilike(f"%{search}%"),
                Report.location_address.ilike(f"%{search}%"),
                Report.description.ilike(f"%{search}%"),
            )
        )

    sort_col = getattr(Report, sort_by, Report.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "reports": [r.to_dict() for r in paginated.items],
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
        "per_page": per_page,
    }), 200


@reports_bp.route("/export", methods=["GET"])
@jwt_required()
@role_required(["super_admin", "municipality_admin", "department_manager"])
def export_reports():
    query = scope_query(Report.query, Report)

    status = request.args.get("status")
    category = request.args.get("category")
    priority = request.args.get("priority")
    search = request.args.get("search")

    if status:
        query = query.filter(Report.status == status)
    if category:
        query = query.filter(Report.category == category)
    if priority:
        query = query.filter(Report.priority == priority)
    if search:
        query = query.filter(
            db.or_(
                Report.title.ilike(f"%{search}%"),
                Report.report_number.ilike(f"%{search}%"),
            )
        )

    reports = query.all()
    csv_bytes = generate_csv(reports)

    return Response(
        csv_bytes,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=reports.csv"},
    )


@reports_bp.route("/bulk", methods=["POST"])
@jwt_required()
@role_required(["super_admin", "municipality_admin", "department_manager"])
def bulk_action():
    data = request.get_json()
    report_ids = data.get("report_ids", [])
    action = data.get("action")
    value = data.get("value")
    user_id = get_jwt_identity()

    if not report_ids or action not in ("status", "assign"):
        return jsonify({"error": "report_ids and valid action (status/assign) are required"}), 400

    # Only update reports the user can see
    allowed_reports = (
        scope_query(Report.query, Report)
        .filter(Report.id.in_(report_ids))
        .all()
    )

    updated = []
    for report in allowed_reports:
        if action == "status":
            old_value = report.status
            report.status = value
            if value in ("resolved", "closed"):
                report.completed_at = datetime.now(timezone.utc)
            history = ReportHistory(
                report_id=report.id,
                user_id=int(user_id),
                action="status_changed",
                old_value=old_value,
                new_value=str(value),
            )
            db.session.add(history)
        elif action == "assign":
            old_value = report.assigned_to
            report.assigned_to = int(value)
            history = ReportHistory(
                report_id=report.id,
                user_id=int(user_id),
                action="assigned",
                old_value=str(old_value) if old_value else None,
                new_value=str(value),
            )
            db.session.add(history)
            notification = Notification(
                user_id=int(value),
                type="report_assigned",
                title="Report Assigned",
                message=f"Report {report.report_number} has been assigned to you.",
                link=f"/reports/{report.id}",
            )
            db.session.add(notification)

        updated.append(report.to_dict())

    db.session.commit()
    return jsonify({"updated": updated, "count": len(updated)}), 200


@reports_bp.route("/<int:report_id>", methods=["GET"])
@jwt_required()
def get_report(report_id):
    report = scope_query(Report.query, Report).filter(Report.id == report_id).first_or_404()
    data = report.to_dict()
    data["comments"] = [c.to_dict() for c in report.comments]
    data["history"] = [h.to_dict() for h in report.history]
    data["attachments"] = [a.to_dict() for a in report.attachments]
    return jsonify(data), 200


@reports_bp.route("", methods=["POST"])
@jwt_required()
def create_report():
    data = request.get_json()
    user_id = get_jwt_identity()

    count = Report.query.count()
    report_number = f"CW-2026-{count + 1:05d}"

    report = Report(
        report_number=report_number,
        category=data.get("category", "other"),
        title=data.get("title", ""),
        description=data.get("description", ""),
        status="received",
        priority=data.get("priority", "medium"),
        location_address=data.get("location_address", ""),
        location_lat=data.get("location_lat"),
        location_lng=data.get("location_lng"),
        ward=data.get("ward"),
        citizen_name=data.get("citizen_name"),
        citizen_phone=data.get("citizen_phone"),
        citizen_email=data.get("citizen_email"),
        municipality_id=data.get("municipality_id"),
    )
    db.session.add(report)
    db.session.flush()

    # Calculate SLA deadline if config exists
    calculate_sla_deadline(report)

    history = ReportHistory(
        report_id=report.id,
        user_id=int(user_id),
        action="created",
        new_value="received",
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(report.to_dict()), 201


@reports_bp.route("/<int:report_id>", methods=["PUT"])
@jwt_required()
def update_report(report_id):
    report = Report.query.get_or_404(report_id)
    data = request.get_json()

    for field in ["title", "description", "priority", "category", "ward",
                   "location_address", "location_lat", "location_lng",
                   "citizen_name", "citizen_phone", "citizen_email"]:
        if field in data:
            setattr(report, field, data[field])

    db.session.commit()
    return jsonify(report.to_dict()), 200


@reports_bp.route("/<int:report_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(report_id):
    report = Report.query.get_or_404(report_id)
    data = request.get_json()
    user_id = get_jwt_identity()

    old_status = report.status
    new_status = data.get("status")
    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    report.status = new_status
    if new_status in ("resolved", "closed"):
        report.completed_at = datetime.now(timezone.utc)

    history = ReportHistory(
        report_id=report.id,
        user_id=int(user_id),
        action="status_changed",
        old_value=old_status,
        new_value=new_status,
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(report.to_dict()), 200


@reports_bp.route("/<int:report_id>/assign", methods=["PATCH"])
@jwt_required()
def assign_report(report_id):
    report = Report.query.get_or_404(report_id)
    data = request.get_json()
    user_id = get_jwt_identity()

    assignee_id = data.get("assigned_to")
    old_assignee = report.assigned_to
    report.assigned_to = assignee_id

    history = ReportHistory(
        report_id=report.id,
        user_id=int(user_id),
        action="assigned",
        old_value=str(old_assignee) if old_assignee else None,
        new_value=str(assignee_id),
    )
    db.session.add(history)

    if assignee_id:
        notification = Notification(
            user_id=assignee_id,
            type="report_assigned",
            title="Report Assigned",
            message=f"Report {report.report_number} has been assigned to you.",
            link=f"/reports/{report.id}",
        )
        db.session.add(notification)

    db.session.commit()
    return jsonify(report.to_dict()), 200


@reports_bp.route("/<int:report_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(report_id):
    Report.query.get_or_404(report_id)
    data = request.get_json()
    user_id = get_jwt_identity()

    comment = ReportComment(
        report_id=report_id,
        user_id=int(user_id),
        comment_text=data.get("comment_text", ""),
        is_internal=data.get("is_internal", True),
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify(comment.to_dict()), 201


@reports_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    base_query = scope_query(Report.query, Report)
    total = base_query.count()
    received = base_query.filter(Report.status == "received").count()
    under_review = base_query.filter(Report.status == "under_review").count()
    dispatched = base_query.filter(Report.status == "crew_dispatched").count()
    in_progress = base_query.filter(Report.status == "in_progress").count()
    resolved = base_query.filter(Report.status == "resolved").count()

    return jsonify({
        "total": total,
        "received": received,
        "under_review": under_review,
        "dispatched": dispatched,
        "in_progress": in_progress,
        "resolved": resolved,
        "pending": received + under_review,
    }), 200
