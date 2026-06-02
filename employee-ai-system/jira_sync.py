from dotenv import load_dotenv
from datetime import datetime, date
import os

load_dotenv()


def test_jira_connection():
    """Test if Jira credentials are configured and connection works."""
    try:
        from jira import JIRA

        url = os.environ.get("JIRA_URL", "").strip()
        email = os.environ.get("JIRA_EMAIL", "").strip()
        token = os.environ.get("JIRA_API_TOKEN", "").strip()

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


def sync_jira_data(db, EmployeeHistory):
    """
    Sync data from Jira to the local database.

    Parameters:
        db: SQLAlchemy database instance
        EmployeeHistory: The EmployeeHistory model class

    Returns:
        dict with success status, synced_records count, and any errors

    Improvements over v1:
        - Issue-key based deduplication (not day-based)
        - Safe story points extraction across Jira versions
        - Rich metadata extraction (labels, components, sprint)
        - Better unassigned issue handling
        - Detailed sync statistics
    """
    try:
        from jira import JIRA
        from jira.exceptions import JIRAError

        url = os.environ.get("JIRA_URL", "").strip()
        email = os.environ.get("JIRA_EMAIL", "").strip()
        token = os.environ.get("JIRA_API_TOKEN", "").strip()
        project_key = os.environ.get("JIRA_PROJECT_KEY", "").strip()

        # Check if credentials are configured
        if not url or not email or not token or not project_key:
            return {
                "success": False,
                "error": "Jira credentials not configured",
                "synced_records": 0,
            }

        # Connect to Jira
        jira = JIRA(server=url, basic_auth=(email, token))

        # Fetch issues
        jql = f"project={project_key} ORDER BY updated DESC"
        issues = jira.search_issues(jql, maxResults=100)

        upload_batch_id = f'jira-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        synced_count = 0
        skipped_duplicates = 0
        skipped_unassigned = 0
        errors = []

        for issue in issues:
            try:
                # Extract issue fields
                assignee = (
                    issue.fields.assignee.displayName
                    if issue.fields.assignee
                    else "Unassigned"
                )

                # Skip unassigned issues — they don't map to real employees
                if assignee == "Unassigned":
                    skipped_unassigned += 1
                    continue

                # Build task identifier with issue key for reliable dedup
                issue_key = str(issue.key)
                raw_summary = str(issue.fields.summary or "")[:90]
                task_identifier = f"[{issue_key}] {raw_summary}"

                status = (
                    issue.fields.status.name if issue.fields.status else "Unknown"
                )
                priority = (
                    issue.fields.priority.name if issue.fields.priority else "Medium"
                )

                # Time spent in hours (Jira stores in seconds)
                time_spent_seconds = issue.fields.timespent or 0
                time_spent = round(time_spent_seconds / 3600, 2)

                # Story points (safe extraction)
                story_points = _get_story_points(issue)

                # Extract rich metadata
                metadata = _extract_issue_metadata(issue)

                # Calculate productivity score
                productivity = min(
                    100,
                    max(
                        0,
                        (story_points * 10)
                        + (
                            50
                            if status == "Done"
                            else 30 if status == "In Progress" else 10
                        ),
                    ),
                )

                # Calculate burnout level
                if time_spent > 8:
                    burnout = "High"
                elif time_spent > 5:
                    burnout = "Medium"
                else:
                    burnout = "Low"

                # Working hours and overtime
                working_hours = time_spent if time_spent > 0 else 8.0
                overtime_hours = max(0, time_spent - 8) if time_spent else 0

                # Issue-key based dedup: check if this exact Jira issue was already imported
                existing = (
                    EmployeeHistory.query.filter(
                        EmployeeHistory.task == task_identifier,
                        EmployeeHistory.upload_batch_id.like("jira-%"),
                    ).first()
                )

                if existing:
                    skipped_duplicates += 1
                    continue

                # Build project field with component context if available
                project_display = project_key
                if metadata.get("components"):
                    project_display = f"{project_key}/{metadata['components'][0]}"

                # Create record
                record = EmployeeHistory(
                    employee_name=assignee,
                    project=project_display,
                    task=task_identifier,
                    productivity=float(productivity),
                    burnout=burnout,
                    working_hours=float(working_hours),
                    overtime_hours=float(overtime_hours),
                    upload_batch_id=upload_batch_id,
                )
                db.session.add(record)
                synced_count += 1

            except Exception as issue_error:
                errors.append(f"Issue {issue.key}: {str(issue_error)}")
                print(f"[JIRA SYNC] Error processing issue {issue.key}: {issue_error}")
                continue

        db.session.commit()

        print(f"[JIRA SYNC] Complete: {synced_count} synced, "
              f"{skipped_duplicates} duplicates skipped, "
              f"{skipped_unassigned} unassigned skipped")

        return {
            "success": True,
            "synced_records": synced_count,
            "last_sync": datetime.utcnow().isoformat(),
            "errors": errors,
            "skipped_duplicates": skipped_duplicates,
            "skipped_unassigned": skipped_unassigned,
        }

    except ConnectionError as e:
        print(f"[JIRA SYNC] Connection error: {e}")
        return {
            "success": False,
            "error": f"Connection error: {str(e)}",
            "synced_records": 0,
        }
    except Exception as e:
        # Catch JIRAError and any other exceptions
        print(f"[JIRA SYNC] Error: {e}")
        db.session.rollback()
        return {
            "success": False,
            "error": str(e),
            "synced_records": 0,
        }
