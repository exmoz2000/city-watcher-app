from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required
from app import db
from app.models.sla import SLAConfig
from app.middleware.municipality_scope import role_required, scope_query
from app.services.sla_engine import check_sla_breaches, get_sla_dashboard

sla_bp = Blueprint("sla", __name__)


@sla_bp.route("/config", methods=["POST"])
@jwt_required()
@role_required(["super_admin", "municipality_admin"])
def create_sla_config():
    data = request.get_json()

    response_hours = data.get("response_hours")
    if not isinstance(response_hours, int) or response_hours <= 0:
        return jsonify({"error": "response_hours must be a positive integer"}), 400

    warning_threshold_pct = data.get("warning_threshold_pct", 75)
    if not isinstance(warning_threshold_pct, int) or warning_threshold_pct < 1 or warning_threshold_pct > 99:
        return jsonify({"error": "warning_threshold_pct must be between 1 and 99"}), 400

    municipality_id = data.get("municipality_id")
    category = data.get("category")

    if not municipality_id or not category:
        return jsonify({"error": "municipality_id and category are required"}), 400

    existing = SLAConfig.query.filter_by(
        municipality_id=municipality_id, category=category
    ).first()
    if existing:
        return jsonify({"error": "SLA config already exists for this municipality and category"}), 409

    config = SLAConfig(
        municipality_id=municipality_id,
        category=category,
        response_hours=response_hours,
        warning_threshold_pct=warning_threshold_pct,
    )
    db.session.add(config)
    db.session.commit()
    return jsonify(config.to_dict()), 201


@sla_bp.route("/config", methods=["GET"])
@jwt_required()
@role_required(["super_admin", "municipality_admin", "department_manager", "field_worker"])
def list_sla_configs():
    query = scope_query(SLAConfig.query, SLAConfig)
    configs = query.all()
    return jsonify([c.to_dict() for c in configs]), 200


@sla_bp.route("/config/<int:config_id>", methods=["PUT"])
@jwt_required()
@role_required(["super_admin", "municipality_admin"])
def update_sla_config(config_id):
    config = SLAConfig.query.get_or_404(config_id)
    data = request.get_json()

    if "response_hours" in data:
        response_hours = data["response_hours"]
        if not isinstance(response_hours, int) or response_hours <= 0:
            return jsonify({"error": "response_hours must be a positive integer"}), 400
        config.response_hours = response_hours

    if "warning_threshold_pct" in data:
        warning_threshold_pct = data["warning_threshold_pct"]
        if not isinstance(warning_threshold_pct, int) or warning_threshold_pct < 1 or warning_threshold_pct > 99:
            return jsonify({"error": "warning_threshold_pct must be between 1 and 99"}), 400
        config.warning_threshold_pct = warning_threshold_pct

    db.session.commit()
    return jsonify(config.to_dict()), 200


@sla_bp.route("/config/<int:config_id>", methods=["DELETE"])
@jwt_required()
@role_required(["super_admin", "municipality_admin"])
def delete_sla_config(config_id):
    config = SLAConfig.query.get_or_404(config_id)
    db.session.delete(config)
    db.session.commit()
    return jsonify({"message": "SLA config deleted"}), 200


@sla_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@role_required(["super_admin", "municipality_admin", "department_manager", "field_worker"])
def sla_dashboard():
    user = g.current_user
    municipality_id = None if user.role == "super_admin" else user.municipality_id
    check_sla_breaches()
    db.session.commit()
    data = get_sla_dashboard(municipality_id)
    return jsonify(data), 200
