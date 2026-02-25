from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.middleware.municipality_scope import scope_query

users_bp = Blueprint("users", __name__)


@users_bp.route("", methods=["GET"])
@jwt_required()
def get_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    role = request.args.get("role")
    search = request.args.get("search")

    query = scope_query(User.query, User)
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            db.or_(
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    paginated = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "users": [u.to_dict() for u in paginated.items],
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
    }), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@users_bp.route("", methods=["POST"])
@jwt_required()
def create_user():
    data = request.get_json()
    email = data.get("email", "").strip()

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    user = User(
        email=email,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        role=data.get("role", "field_worker"),
        department=data.get("department"),
        municipality_id=data.get("municipality_id"),
        phone=data.get("phone"),
    )
    user.set_password(data.get("password", "changeme123"))
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    for field in ["first_name", "last_name", "role", "department",
                   "municipality_id", "phone"]:
        if field in data:
            setattr(user, field, data[field])

    if "password" in data and data["password"]:
        user.set_password(data["password"])

    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.route("/<int:user_id>/status", methods=["PATCH"])
@jwt_required()
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.is_active = data.get("is_active", not user.is_active)
    db.session.commit()
    return jsonify(user.to_dict()), 200
