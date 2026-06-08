import re

filepath = r"c:\Users\DHARMA\inten_1\employee-ai-system\jira_sync.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace _get_credentials
old_get_creds = """def _get_credentials(credentials=None):
    \"\"\"
    Resolve Jira credentials from the provided dict, or fallback to .env.
    This allows both DB-based settings and .env-based settings to work.
    \"\"\"
    if credentials:
        return (
            credentials.get('url', '').strip(),
            credentials.get('email', '').strip(),
            credentials.get('token', '').strip(),
            credentials.get('project_key', '').strip(),
        )
    return (
        os.environ.get("JIRA_URL", "").strip(),
        os.environ.get("JIRA_EMAIL", "").strip(),
        os.environ.get("JIRA_API_TOKEN", "").strip(),
        os.environ.get("JIRA_PROJECT_KEY", "").strip(),
    )"""

new_get_creds = """def _get_credentials(credentials=None):
    \"\"\"
    Resolve Jira credentials from the provided dict, or fallback to .env.
    This allows both DB-based settings and .env-based settings to work.
    \"\"\"
    if credentials:
        return (
            credentials.get('url', '').strip(),
            credentials.get('email', '').strip(),
            credentials.get('token', '').strip(),
        )
    return (
        os.environ.get("JIRA_URL", "").strip(),
        os.environ.get("JIRA_EMAIL", "").strip(),
        os.environ.get("JIRA_API_TOKEN", "").strip(),
    )"""

content = content.replace(old_get_creds, new_get_creds)

# Replace test_jira_connection signature usage
old_test_jira = """        url, email, token, _ = _get_credentials(credentials)"""
new_test_jira = """        url, email, token = _get_credentials(credentials)"""
content = content.replace(old_test_jira, new_test_jira)

# We want to completely replace `def sync_jira_data` up to the end of the file.
sync_func_start = content.find("def sync_jira_data(db, EmployeeHistory, credentials=None):")

if sync_func_start != -1:
    content = content[:sync_func_start]

new_sync_data = """def sync_jira_data(db, EmployeeHistory, credentials=None):
    \"\"\"
    Sync data from Jira to the local database for ALL discovered projects.
    \"\"\"
    try:
        from jira import JIRA
        from jira.exceptions import JIRAError
        from models import JiraProject, JiraSyncLog
        from datetime import datetime

        url, email, token = _get_credentials(credentials)

        if not url or not email or not token:
            return {
                "success": False,
                "error": "Jira credentials not configured (URL, email, and token are required)",
                "synced_records": 0,
            }

        jira = JIRA(server=url, basic_auth=(email, token))

        # Get all active projects
        active_projects = JiraProject.query.filter_by(is_active=True).all()
        
        if not active_projects:
            return {
                "success": False,
                "error": "No projects found. Please click 'Test Connection' in Settings to discover projects.",
                "synced_records": 0,
            }

        total_synced_count = 0
        total_skipped_duplicates = 0
        total_skipped_unassigned = 0
        all_errors = []

        upload_batch_id = f'jira-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'

        for proj in active_projects:
            start_time = datetime.utcnow()
            jql = f'project = "{proj.project_key}" ORDER BY updated DESC'
            
            project_synced_count = 0
            
            try:
                issues = jira.search_issues(jql, maxResults=100)
                
                for issue in issues:
                    try:
                        assignee = issue.fields.assignee.displayName if issue.fields.assignee else "Unassigned"
                        if assignee == "Unassigned":
                            total_skipped_unassigned += 1
                            continue

                        issue_key = str(issue.key)
                        raw_summary = str(issue.fields.summary or "")[:90]
                        task_identifier = f"[{issue_key}] {raw_summary}"

                        status = issue.fields.status.name if issue.fields.status else "Unknown"
                        priority = issue.fields.priority.name if issue.fields.priority else "Medium"

                        time_spent_seconds = issue.fields.timespent or 0
                        time_spent = round(time_spent_seconds / 3600, 2)

                        story_points = _get_story_points(issue)
                        metadata = _extract_issue_metadata(issue)

                        # Deduplication logic
                        existing_task = EmployeeHistory.query.filter_by(
                            employee_name=assignee,
                            project=proj.project_name,
                            task=task_identifier
                        ).first()

                        if existing_task:
                            total_skipped_duplicates += 1
                            continue

                        # Calculate metrics
                        working_hours = 8.0
                        productivity_score = 75.0
                        burnout_risk = "Medium"

                        if status in ["Done", "Resolved", "Closed"]:
                            productivity_score += 10
                            if time_spent > 0 and story_points > 0:
                                productivity_score += (story_points / time_spent) * 10
                        if priority == "High" or priority == "Highest":
                            productivity_score += 5

                        if time_spent > 40:
                            burnout_risk = "High"
                            productivity_score -= 10
                        elif time_spent > 30:
                            burnout_risk = "High"
                        elif time_spent < 10:
                            burnout_risk = "Low"

                        productivity_score = max(0, min(100, productivity_score))

                        history_entry = EmployeeHistory(
                            employee_name=assignee,
                            project=proj.project_name,
                            task=task_identifier,
                            productivity=productivity_score,
                            burnout=burnout_risk,
                            working_hours=working_hours,
                            overtime_hours=max(0, time_spent - 40) if time_spent > 40 else 0,
                            upload_batch_id=upload_batch_id
                        )
                        db.session.add(history_entry)
                        project_synced_count += 1
                        total_synced_count += 1
                        
                    except Exception as e:
                        all_errors.append(f"[{proj.project_key}] Error processing issue {getattr(issue, 'key', 'Unknown')}: {str(e)}")

                db.session.commit()
                
                # Update project metadata
                proj.last_sync = datetime.utcnow()
                proj.last_sync_records = project_synced_count
                db.session.commit()
                
                # Add JiraSyncLog for this project
                end_time = datetime.utcnow()
                duration = (end_time - start_time).total_seconds()
                
                sync_log = JiraSyncLog(
                    sync_time=end_time,
                    total_records=project_synced_count,
                    status="success" if project_synced_count > 0 or not all_errors else "warning",
                    errors="\\n".join(all_errors[-5:]) if all_errors else None,
                    duration_seconds=duration,
                    project_name=getattr(proj, 'project_name', 'Unknown') or 'Unknown',
                    project_key=getattr(proj, 'project_key', 'Unknown') or 'Unknown'
                )
                db.session.add(sync_log)
                db.session.commit()

            except Exception as e:
                all_errors.append(f"[{proj.project_key}] Sync error: {str(e)}")
                end_time = datetime.utcnow()
                sync_log = JiraSyncLog(
                    sync_time=end_time,
                    total_records=0,
                    status="error",
                    errors=str(e),
                    duration_seconds=(end_time - start_time).total_seconds(),
                    project_name=getattr(proj, 'project_name', 'Unknown') or 'Unknown',
                    project_key=getattr(proj, 'project_key', 'Unknown') or 'Unknown'
                )
                db.session.add(sync_log)
                db.session.commit()

        return {
            "success": True,
            "synced_records": total_synced_count,
            "last_sync": datetime.utcnow().isoformat(),
            "errors": all_errors,
            "skipped_duplicates": total_skipped_duplicates,
            "skipped_unassigned": total_skipped_unassigned,
        }

    except Exception as e:
        print(f"[JIRA SYNC] Error: {e}")
        db.session.rollback()
        return {
            "success": False,
            "error": str(e),
            "synced_records": 0,
        }
"""

content += new_sync_data

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated jira_sync.py successfully.")
