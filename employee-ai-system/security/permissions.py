from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def require_roles(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                role = (claims.get("role") or "viewer").lower()
                if role not in {r.lower() for r in allowed_roles}:
                    return jsonify({"success": False, "message": "Insufficient permissions"}), 403
                return fn(*args, **kwargs)
            except Exception:
                return jsonify({"success": False, "message": "Authentication required"}), 401

        return wrapper

    return decorator

