from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
LEGACY_PARTS = [
    "core.py",
    "ml_helpers.py",
    "dashboard_routes.py",
    "ai_summary_routes.py",
    "settings_routes.py",
    "auth_routes.py",
    "jira_prediction_routes.py",
    "employee_routes.py",
    "analytics_audit_routes.py",
    "ai_report_health_routes.py",
]

for part in LEGACY_PARTS:
    part_path = BASE_DIR / "api" / "legacy" / part
    exec(compile(part_path.read_text(encoding="utf-8"), str(part_path), "exec"), globals())
