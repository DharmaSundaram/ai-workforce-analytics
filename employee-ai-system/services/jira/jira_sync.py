from dotenv import load_dotenv
from datetime import datetime, date
import os

load_dotenv()


def _get_credentials(credentials=None):
    """
    Resolve Jira credentials from the provided dict, or fallback to .env.
    This allows both DB-based settings and .env-based settings to work.
    """
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
    )


def test_jira_connection(credentials=None):
    """
    Test if Jira credentials are configured and connection works.
    Accepts optional credentials dict; otherwise uses .env.
    """
    try:
        from jira import JIRA

        url, email, token = _get_credentials(credentials)

        if not url or not email or not token:
            return False

        jira = JIRA(server=url, basic_auth=(email, token))
        jira.myself()
        return True
    except Exception as e:
        print(f"[JIRA CONNECTION TEST] Failed: {e}")
        return False


def _get_story_points(issue):
    """
    Safely extract story points from Jira issue.
    Tries multiple common custom field IDs used across Jira instances.
    """
    custom_fields = [
        "customfield_10016",  # Jira Cloud default
        "customfield_10028",  # Some Jira Server instances
        "customfield_10004",  # Older Jira versions
        "story_points",       # Direct field name
    ]
    for field_name in custom_fields:
        try:
            val = getattr(issue.fields, field_name, None)
            if val is not None:
                return float(val)
        except (TypeError, ValueError):
            continue
    return 0.0


def _extract_issue_metadata(issue):
    """
    Extract rich metadata from a Jira issue for better analytics context.
    Returns a dict with labels, components, sprint, and issue type.
    """
    metadata = {}

    # Labels
    try:
        metadata["labels"] = issue.fields.labels or []
    except Exception:
        metadata["labels"] = []

    # Components
    try:
        metadata["components"] = [
            c.name for c in (issue.fields.components or [])
        ]
    except Exception:
        metadata["components"] = []

    # Issue type
    try:
        metadata["issue_type"] = issue.fields.issuetype.name if issue.fields.issuetype else "Task"
    except Exception:
        metadata["issue_type"] = "Task"

    # Sprint (from common custom field)
    try:
        sprint_field = getattr(issue.fields, "customfield_10020", None)
        if sprint_field and isinstance(sprint_field, list) and len(sprint_field) > 0:
            sprint_obj = sprint_field[-1]  # Latest sprint
            if hasattr(sprint_obj, 'name'):
                metadata["sprint"] = sprint_obj.name
            elif isinstance(sprint_obj, str):
                # Parse sprint string format
                import re
                match = re.search(r'name=([^,]+)', sprint_obj)
                metadata["sprint"] = match.group(1) if match else ""
            else:
                metadata["sprint"] = ""
        else:
            metadata["sprint"] = ""
    except Exception:
        metadata["sprint"] = ""

    return metadata

def _assign_random_department(name):
    departments = ["Engineering", "HR", "Marketing", "Sales", "Product", "Support", "QA"]
    # Provide a stable deterministic department for a given name using hash
    import hashlib
    hash_val = int(hashlib.md5(name.encode('utf-8')).hexdigest(), 16)
    return departments[hash_val % len(departments)]


def sync_jira_data(db, EmployeeHistory, credentials=None):
    """
    Sync data from Jira to the local database for ALL discovered projects.
    """
    try:
        from jira import JIRA
        from jira.exceptions import JIRAError
        from database.models import JiraProject, JiraSyncLog
        from datetime import datetime

        url, email, token = _get_credentials(credentials)

        if not url or not email or not token:
            return {
                "success": False,
                "error": "Jira credentials not configured (URL, email, and token are required)",
                "synced_records": 0,
            }

        # Verify credentials upfront before processing projects
        try:
            jira = JIRA(server=url, basic_auth=(email, token))
            jira.myself()
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "Unauthorized" in error_msg or "AUTHENTICATED_FAILED" in error_msg:
                error_msg = "Invalid Jira credentials. Please check your email and API token, or generate a new token from Atlassian Account → Security → API Tokens."
            elif "403" in error_msg:
                error_msg = "Access forbidden. Check your Jira permissions."
            elif "404" in error_msg:
                error_msg = "Jira URL not found. Please verify the URL."
            elif "connect" in error_msg.lower() or "resolve" in error_msg.lower():
                error_msg = f"Cannot connect to Jira server. Check the URL: {error_msg}"
            print(f"[JIRA SYNC] Auth failed: {e}")
            return {
                "success": False,
                "error": error_msg,
                "synced_records": 0,
            }

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
        projects_failed = 0

        upload_batch_id = f'jira-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'

        for proj in active_projects:
            start_time = datetime.utcnow()
            jql = f'project = "{proj.project_key}" ORDER BY updated DESC'
            
            project_synced_count = 0
            project_errors = []
            
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
                            project_id=str(proj.id) if hasattr(proj, 'id') else "",
                            project_key=proj.project_key,
                            project_name=proj.project_name,
                            project=proj.project_name, # keep for backwards compatibility
                            department=_assign_random_department(assignee),
                            task=task_identifier,
                            status=status,
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
                        project_errors.append(f"[{proj.project_key}] Error processing issue {getattr(issue, 'key', 'Unknown')}: {str(e)}")

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
                    status="success" if not project_errors else "warning",
                    errors="\n".join(project_errors[-5:]) if project_errors else None,
                    duration_seconds=duration,
                    project_name=getattr(proj, 'project_name', 'Unknown') or 'Unknown',
                    project_key=getattr(proj, 'project_key', 'Unknown') or 'Unknown'
                )
                db.session.add(sync_log)
                db.session.commit()
                
                all_errors.extend(project_errors)

            except Exception as e:
                projects_failed += 1
                error_entry = f"[{proj.project_key}] Sync error: {str(e)}"
                all_errors.append(error_entry)
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

        # If ALL projects failed, report failure
        if projects_failed == len(active_projects):
            return {
                "success": False,
                "error": f"All {projects_failed} projects failed to sync. " + (all_errors[0] if all_errors else "Unknown error"),
                "synced_records": 0,
                "errors": all_errors,
            }

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
