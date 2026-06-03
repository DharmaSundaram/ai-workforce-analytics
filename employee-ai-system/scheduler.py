from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import os
import shutil
import pandas as pd
import io

AUTO_IMPORT_DIR = os.path.join(os.path.dirname(__file__), 'auto_import')
PROCESSED_DIR = os.path.join(AUTO_IMPORT_DIR, 'processed')

def ensure_dirs():
    os.makedirs(AUTO_IMPORT_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def auto_sync():
    """Auto-import datasets from auto_import/ directory."""
    ensure_dirs()
    print(f"[AUTO SYNC] Running at {datetime.now()}")
    
    files = [f for f in os.listdir(AUTO_IMPORT_DIR) 
             if f.endswith(('.csv', '.xlsx', '.xls')) and os.path.isfile(os.path.join(AUTO_IMPORT_DIR, f))]
    
    if not files:
        print("[AUTO SYNC] No files to process")
        return 0
    
    total_records = 0
    for filename in files:
        filepath = os.path.join(AUTO_IMPORT_DIR, filename)
        try:
            ext = filename.rsplit('.', 1)[-1].lower()
            if ext == 'csv':
                df = pd.read_csv(filepath)
            elif ext in ('xlsx', 'xls'):
                df = pd.read_excel(filepath)
            else:
                continue
            
            total_records += len(df)
            print(f"[AUTO SYNC] Processed {filename}: {len(df)} rows")
            
            # Move to processed
            dest = os.path.join(PROCESSED_DIR, f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}")
            shutil.move(filepath, dest)
            print(f"[AUTO SYNC] Moved {filename} to processed/")
            
        except Exception as e:
            print(f"[AUTO SYNC] Error processing {filename}: {e}")
    
    print(f"[AUTO SYNC] Complete. Total records: {total_records}")
    return total_records

# Create directories on module load
ensure_dirs()

# =========================================
# JIRA AUTO SYNC
# =========================================

jira_sync_app = None


def set_jira_sync_app(app):
    """Set the Flask app reference for Jira sync context."""
    global jira_sync_app
    jira_sync_app = app
    print("[SCHEDULER] Jira sync app context registered")


def jira_auto_sync():
    """Auto-sync data from Jira on a scheduled interval."""
    global jira_sync_app
    if jira_sync_app is None:
        print("[JIRA AUTO SYNC] Warning: Flask app not set. Skipping Jira sync.")
        return

    with jira_sync_app.app_context():
        try:
            from app import EmployeeHistory, get_jira_credentials
            from database import db
            import jira_sync

            print(f"[JIRA AUTO SYNC] Running at {datetime.now()}")

            # Load credentials from DB settings (with .env fallback)
            creds = get_jira_credentials()
            result = jira_sync.sync_jira_data(db, EmployeeHistory, credentials=creds)

            if result.get("success"):
                print(f"[JIRA AUTO SYNC] Success: {result.get('synced_records', 0)} records synced")
            else:
                print(f"[JIRA AUTO SYNC] Failed: {result.get('error', 'Unknown error')}")
        except Exception as e:
            print(f"[JIRA AUTO SYNC] Error: {e}")


scheduler = BackgroundScheduler()
scheduler.add_job(
    auto_sync,
    'cron',
    hour=9,
    minute=0
)
scheduler.add_job(
    jira_auto_sync,
    'interval',
    hours=1,
    id='jira_sync'
)
scheduler.start()