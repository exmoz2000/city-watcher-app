from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User


DEPARTMENT_CATEGORIES = {
    "Public Works": ["pothole", "street_light", "traffic_light"],
    "Water & Sanitation": ["water_leak"],
    "Electricity": ["power_outage"],
    "Waste Management": ["garbage"],
    "Administration": [],
}


def load_current_user():
    """Before-request hook: load user from JWT into flask.g."""
    g.current_user = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            g.current_user = User.query.get(int(user_id))
    except Exception:
        g.current_user = None


def scope_query(query, model):
    """
    Filter a SQLAlchemy query based on the current user's role.

    - super_admin: no filter (sees all municipalities)
    - municipality_admin: filter by municipality_id
    - department_manager: filter by municipality_id + department categories
    - field_worker: filter by assigned_to (only their reports)
    - No user: empty result set
    """
    user = getattr(g, "current_user", None)
    if not user:
        return query.filter(False)

    if user.role == "super_admin":
        return query

    # All non-super_admin users are scoped to their municipality
    if hasattr(model, "municipality_id"):
        query = query.filter(model.municipality_id == user.municipality_id)

    # Department managers see only their department's categories
    if user.role == "department_manager" and hasattr(model, "category"):
        categories = DEPARTMENT_CATEGORIES.get(user.department, [])
        if categories:
            query = query.filter(model.category.in_(categories))

    # Field workers see only reports assigned to them
    if user.role == "field_worker" and hasattr(model, "assigned_to"):
        query = query.filter(model.assigned_to == user.id)

    return query


def role_required(allowed_roles):
    """Decorator to restrict endpoint access by role."""

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, "current_user", None)
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.role not in allowed_roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            return f(*args, **kwargs)

        return wrapper

    return decorator
