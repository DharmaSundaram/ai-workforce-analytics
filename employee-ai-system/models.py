from database import db
from datetime import datetime

# =========================================
# USER MODEL
# =========================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='user')
    password_reset_token_hash = db.Column(db.String(256), nullable=True)
    password_reset_expires_at = db.Column(db.DateTime, nullable=True)
    password_reset_used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

# =========================================
# AUDIT LOG MODEL
# =========================================
class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    user_email = db.Column(db.String(120), nullable=True)
    action = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50), nullable=True)

# =========================================
# USER PREFERENCES MODEL (Theme, Font, etc.)
# =========================================
class UserPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    theme_mode = db.Column(db.String(20), default='dark')        # 'dark' | 'light'
    color_theme = db.Column(db.String(20), default='blue')       # blue, purple, green, red, white, midnight, cyan, gray
    font_family = db.Column(db.String(50), default='Inter')      # Inter, Poppins, Orbitron, Roboto, Montserrat, IBM Plex Sans
    glass_enabled = db.Column(db.Boolean, default=True)
    animations_enabled = db.Column(db.Boolean, default=True)
    particles_enabled = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# =========================================
# JIRA PROJECTS MODEL (Multi-Project Support)
# =========================================
class JiraProject(db.Model):
    __tablename__ = 'jira_projects'
    id = db.Column(db.Integer, primary_key=True)
    project_key = db.Column(db.String(50), nullable=False)
    project_name = db.Column(db.String(200), nullable=False)
    project_type = db.Column(db.String(50), default='software')   # software, service_desk, business
    is_active = db.Column(db.Boolean, default=True)
    is_synced = db.Column(db.Boolean, default=True)               # whether to include in syncs
    last_sync = db.Column(db.DateTime, nullable=True)
    last_sync_records = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# =========================================
# JIRA SYNC LOG MODEL
# =========================================
class JiraSyncLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(255), nullable=True, default='Unknown')
    project_key = db.Column(db.String(100), nullable=True, default='Unknown')
    sync_time = db.Column(db.DateTime, default=datetime.utcnow)
    total_records = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='success')
    errors = db.Column(db.Text, nullable=True)
    duration_seconds = db.Column(db.Float, default=0)

# =========================================
# VERIFIED LABEL MAPPING
# Confirmed by diagnostic: classes_ = [0, 1, 2]
# actual=High rows  → model predicts 0
# actual=Low rows   → model predicts 1
# actual=Medium rows→ model predicts 2
# =========================================
class EmployeeHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    employee_name = db.Column(db.String(100))
    project_id = db.Column(db.String(100), nullable=True)
    project_key = db.Column(db.String(100), nullable=True)
    project_name = db.Column(db.String(255), nullable=True)
    project = db.Column(db.String(100))  # Legacy field
    department = db.Column(db.String(100), nullable=True)
    task = db.Column(db.String(100))
    status = db.Column(db.String(50), nullable=True)

    productivity = db.Column(db.Float)
    burnout = db.Column(db.String(50))

    working_hours = db.Column(db.Float)
    overtime_hours = db.Column(db.Float)

    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    upload_batch_id = db.Column(db.String(50))

# =========================================
# SETTINGS MODEL (Jira config + sync interval)
# =========================================
class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jira_url = db.Column(db.String(255), default='')
    jira_email = db.Column(db.String(255), default='')
    jira_api_token = db.Column(db.String(512), default='')
    jira_project_key = db.Column(db.String(50), default='')
    auto_sync_interval = db.Column(db.Integer, default=60)  # minutes
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# =========================================
# NOTIFICATION MODEL
# =========================================
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)       # jira_sync, burnout_alert, upload, settings
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), default='info')    # info, success, warning, error
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
