# Employee AI System Backend

Enterprise Flask backend for workforce analytics, burnout prediction, productivity prediction, Jira sync, reporting, audit logs, notifications, settings, and AI assistant endpoints.

## Architecture Diagram

```text
React Dashboard
      |
      v
Flask API Routes
      |
      v
Services Layer -> Jira Service -> Atlassian Jira
      |
      v
Database Layer -> SQLite / SQLAlchemy
      |
      v
ML Modules -> Burnout + Productivity Models
```

## Folder Structure

```text
employee-ai-system/
  app.py
  api/
  config/
  database/
  ml/
  scheduler/
  security/
  services/
  utils/
  logs/
  tests/
```

`app.py` remains the runtime entry point so existing commands continue to work. New folders provide the enterprise boundaries for configuration, security, services, scheduler, database, and ML code.

## Installation

```bash
cd employee-ai-system
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`.

## Environment Variables

Create `.env` in `employee-ai-system/`.

```env
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me-too
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=sqlite:///employee_data.db
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-token
JIRA_PROJECT_KEY=PROJECT
JIRA_ENCRYPTION_KEY=
```

## Jira Setup

1. Generate an Atlassian API token.
2. Add Jira URL, email, token, and project key in `.env` or the Settings page.
3. Use Settings -> Test Connection to discover active projects.
4. Use Sync Now or the scheduled sync to import Jira work items.

## API Documentation

Authentication:
- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/change-password`
- `POST /api/forgot-password`

Analytics and ML:
- `GET /api/dashboard-data`
- `GET /api/ai-summary`
- `POST /predict-burnout`
- `POST /predict-productivity`
- `GET /api/historical-analytics`

Employee data:
- `POST /upload-dataset`
- `GET /employee-history`
- `GET /api/upload-sessions`
- `GET /api/sync-status`
- `POST /api/trigger-sync`

Jira:
- `POST /api/test-jira-connection`
- `POST /api/sync-jira`
- `GET /api/jira-sync-logs`
- `GET /api/jira-sync-status`

Settings, audit, notifications, reports:
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/settings/sync-now`
- `GET /api/audit-logs`
- `GET /api/notifications`
- `POST /api/notifications/mark-read`
- `POST /api/copilot`
- `GET /api/executive-report`
- `GET /api/system-health`

## Deployment Guide

1. Set production secrets in the host environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Use a production WSGI server such as Waitress or Gunicorn.
4. Configure CORS to the deployed dashboard origin.
5. Mount persistent storage for SQLite or configure `DATABASE_URL` for a managed database.
6. Run migrations/schema checks before startup.

