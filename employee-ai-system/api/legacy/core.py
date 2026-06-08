from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from datetime import datetime, timedelta
from scheduler import scheduler
import pandas as pd
import numpy as np
import warnings
import io
import random
import uuid
import os
import shutil
import base64
import hashlib
import secrets
import re
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import HTTPException
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
import bcrypt
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

from sklearn.metrics import r2_score
from config.database_config import DATABASE_URL
from config.settings import settings
from ml.burnout.predictor import load_burnout_model
from ml.productivity.predictor import load_future_productivity_model

# =========================================
# SUPPRESS SKLEARN VERSION WARNINGS
# =========================================

warnings.filterwarnings("ignore")

# =========================================
# LOAD MODELS
# =========================================

burnout_model = load_burnout_model()

future_model = load_future_productivity_model()

# =========================================
# FLASK SETUP
# =========================================

app = Flask(__name__)
CORS(app, origins=settings.CORS_ORIGINS, supports_credentials=True)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = settings.SQLALCHEMY_TRACK_MODIFICATIONS
app.secret_key = settings.SECRET_KEY
app.config["JWT_SECRET_KEY"] = settings.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = settings.JWT_ACCESS_TOKEN_EXPIRES
jwt = JWTManager(app)

db.init_app(app)

from database.models import User, AuditLog, UserPreference, JiraProject, JiraSyncLog, EmployeeHistory, Settings, Notification


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    if isinstance(error, HTTPException):
        return jsonify({
            "success": False,
            "message": error.description
        }), error.code

    print(f"[UNHANDLED ERROR] {type(error).__name__}: {error}")
    return jsonify({
        "success": False,
        "message": "An unexpected server error occurred. Please try again later."
    }), 500


def _fernet():
    raw_key = os.environ.get("JIRA_ENCRYPTION_KEY", "").strip()
    if raw_key:
        return Fernet(raw_key.encode("utf-8"))

    material = os.environ.get("SECRET_KEY", app.secret_key).encode("utf-8")
    derived = base64.urlsafe_b64encode(hashlib.sha256(material).digest())
    return Fernet(derived)


def encrypt_secret(value):
    if not value:
        return ""
    if str(value).startswith("fernet:"):
        return value
    return "fernet:" + _fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value):
    if not value:
        return ""
    if not str(value).startswith("fernet:"):
        return value
    try:
        return _fernet().decrypt(value.replace("fernet:", "", 1).encode("utf-8")).decode("utf-8")
    except Exception:
        return ""


def is_masked_secret(value):
    value = (value or "").strip()
    return value.startswith("•") or value.startswith("â€¢")


def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(stored_hash, password):
    if not stored_hash or password is None:
        return False
    try:
        if stored_hash.startswith("$2"):
            return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))
        return check_password_hash(stored_hash, password)
    except Exception:
        return False


def hash_reset_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def valid_email(value):
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value or ""))


def valid_http_url(value):
    return bool(re.match(r"^https?://[^\s/$.?#].[^\s]*$", value or ""))


def create_audit(action, user=None, status="success", message=""):
    try:
        audit = AuditLog(
            user_id=getattr(user, "id", None),
            user_email=getattr(user, "email", None),
            action=f"{action}:{status}" if status else action,
            ip_address=request.remote_addr
        )
        db.session.add(audit)
    except Exception:
        pass


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


def get_settings():
    """
    Get the singleton Settings row, creating one if none exists.
    """
    settings = Settings.query.first()
    if not settings:
        settings = Settings()
        db.session.add(settings)
        db.session.commit()
    return settings

def get_jira_credentials():
    """
    Load Jira credentials from DB settings first, then fallback to .env.
    Returns dict with url, email, token, project_key.
    """
    settings = get_settings()
    url = (settings.jira_url or '').strip()
    email = (settings.jira_email or '').strip()
    token = decrypt_secret((settings.jira_api_token or '').strip())
    project_key = (settings.jira_project_key or '').strip()

    # Fallback to .env if DB settings are empty
    if not url:
        url = os.environ.get('JIRA_URL', '').strip()
    if not email:
        email = os.environ.get('JIRA_EMAIL', '').strip()
    if not token:
        token = os.environ.get('JIRA_API_TOKEN', '').strip()
    if not project_key:
        project_key = os.environ.get('JIRA_PROJECT_KEY', '').strip()

    return {
        'url': url,
        'email': email,
        'token': token,
        'project_key': project_key,
        'auto_sync_interval': settings.auto_sync_interval or 60,
    }

BURNOUT_LABELS = {0: "High", 1: "Low", 2: "Medium"}

# =========================================
# BURNOUT MODEL — EXACT FEATURE NAMES
# (confirmed from burnout_model.feature_names_in_)
# =========================================

BURNOUT_FEATURES = [
    "total_hours",
    "idle_time_minutes",
    "overtime_hours",
    "break_count",
    "meeting_hours",
    "tasks_completed",
    "bugs_fixed",
    "focus_score",
    "weekly_target",
    "target_completed",
    "manager_rating"
]

# =========================================
# PRODUCTIVITY MODEL — EXACT FEATURE NAMES
# (confirmed from future_model.feature_names_in_)
# =========================================

PROD_FEATURES = [
    "Working Hours for Every Day",
    "Total Working Hours Per Day",
    "Lunch Time",
    "Break Time",
    "Lunch Time & Break Time",
    "Total Leave",
    "Permission",
    "Total Leave & Permission",
    "Net Productive Hours",
    "Overtime Hours"
]

# =========================================
# HELPERS
# =========================================

def safe_float(row, *keys, default=0.0):
    """Try multiple column name variants; return float or default."""
    for key in keys:
        try:
            val = row.get(key, None)
            if val is None:
                continue
            s = str(val).strip()
            if s in ("", "nan", "NaN", "None", "NaT", "nat"):
                continue
            return float(val)
        except Exception:
            continue
    return default


def safe_str(row, *keys, default=""):
    """Try multiple column name variants; return string or default."""
    for key in keys:
        try:
            val = row.get(key, None)
            if val is None:
                continue
            s = str(val).strip()
            if s in ("nan", "NaN", "None", "NaT", ""):
                continue
            return s
        except Exception:
            continue
    return default


