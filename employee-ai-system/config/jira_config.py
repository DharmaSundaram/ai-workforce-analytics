import os


def get_env_jira_credentials():
    return {
        "url": os.environ.get("JIRA_URL", "").strip(),
        "email": os.environ.get("JIRA_EMAIL", "").strip(),
        "token": os.environ.get("JIRA_API_TOKEN", "").strip(),
        "project_key": os.environ.get("JIRA_PROJECT_KEY", "").strip(),
    }

