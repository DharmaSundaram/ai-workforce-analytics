# AI Workforce Analytics Dashboard

Enterprise full-stack system for employee analytics, burnout prediction, productivity prediction, Jira integration, multi-project sync, reports, exports, settings, audit logs, notifications, AI assistant workflows, and theme support.

## Project Overview

The project is split into two applications:

- `employee-ai-system`: Flask backend, database access, security, Jira sync, scheduler, ML prediction, reporting, and API endpoints.
- `employee-dashboard`: React dashboard, authentication screens, analytics pages, reports, settings, audit logs, notifications, theme context, and reusable UI components.

Existing runtime behavior is preserved: backend still starts from `employee-ai-system/app.py`, and the dashboard still starts from `employee-dashboard/src/App.js`.

## Architecture Diagram

```text
User
 |
 v
React Dashboard
 |
 v
Central API Service
 |
 v
Flask API Routes
 |
 +--> Auth / Security
 +--> Employee Analytics
 +--> Burnout + Productivity ML
 +--> Jira Service + Scheduler
 +--> Reports / Audit / Notifications
 |
 v
SQLAlchemy Database
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

employee-dashboard/src/
  assets/
  components/
  context/
  hooks/
  pages/
  routes/
  services/
  styles/
  utils/
  App.js
  index.js
```

## Installation Steps

Backend:

```bash
cd employee-ai-system
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
cd employee-dashboard
npm install
npm start
```

Backend runs on `http://127.0.0.1:5000`. Frontend runs on `http://localhost:3000`.

## Environment Variables

Backend `.env`:

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

Frontend `.env`:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:5000
```

## Jira Setup

1. Create an Atlassian API token.
2. Configure Jira URL, email, token, and project key in backend `.env` or through the Settings page.
3. Use Settings -> Test Connection to verify credentials and discover projects.
4. Use Sync Now for manual sync or let the scheduler run periodic Jira sync.

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

Employee and Jira:
- `POST /upload-dataset`
- `GET /employee-history`
- `POST /api/sync-jira`
- `GET /api/jira-sync-logs`
- `GET /api/jira-sync-status`

Settings and reports:
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/audit-logs`
- `GET /api/notifications`
- `POST /api/copilot`
- `GET /api/executive-report`
- `GET /api/system-health`

## Deployment Guide

1. Set production secrets and CORS origins.
2. Install backend dependencies from `employee-ai-system/requirements.txt`.
3. Build the frontend with `npm run build`.
4. Serve Flask through a production WSGI server.
5. Deploy the React build with a static host or reverse proxy.
6. Configure persistent database storage and scheduled Jira sync.

