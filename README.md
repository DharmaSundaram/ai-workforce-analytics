# AI Workforce Analytics Dashboard

An AI-powered workforce monitoring and employee burnout prediction dashboard built using React.js, Flask, Python, and Machine Learning.

---

# Project Overview

The AI Workforce Analytics Dashboard helps organizations monitor employee productivity, overtime, wellness, and burnout risk using AI and data analytics.

The system allows users to upload employee datasets, visualize workforce insights, and predict burnout levels using machine learning models.

---

# Features

## Dashboard Analytics
- Total Employees KPI
- High Burnout Employee Count
- Average Productivity Score
- Overtime Employee Statistics

## Data Visualization
- Burnout Distribution Pie Chart
- Productivity Analytics Graph
- Interactive Employee Table

## AI-Based Burnout Prediction
Predict employee burnout risk using:
- Working hours
- Idle time
- Overtime hours
- Break count
- Tasks completed
- Focus score
- Manager rating
- Weekly targets

## Smart Insights
- AI-generated workforce insights
- Burnout recommendations
- Employee wellness suggestions

## Data Management
- CSV Dataset Upload
- Employee Search & Filters
- Department-wise Filtering
- Burnout-level Filtering

## Report Generation
- Export CSV Reports
- Export PDF Reports
- Prediction History Tracking

---

# Technologies Used

## Frontend
- React.js
- CSS
- Recharts

## Backend
- Flask
- Flask-CORS

## Machine Learning
- Python
- Pandas
- Scikit-learn
- Random Forest Classifier

## Tools
- VS Code
- GitHub
- npm

---

# Project Architecture

```text
Frontend (React)
        ↓
REST API (Flask)
        ↓
Machine Learning Model
        ↓
Prediction Result
```

---

# Dataset Features

The dataset contains:

| Feature | Description |
|---|---|
| total_hours | Total working hours |
| idle_time_minutes | Employee idle time |
| overtime_hours | Overtime work duration |
| break_count | Number of breaks |
| meeting_hours | Meeting duration |
| tasks_completed | Completed tasks |
| bugs_fixed | Fixed bugs/tasks |
| focus_score | Productivity focus score |
| weekly_target | Weekly target assigned |
| target_completed | Completed targets |
| manager_rating | Manager evaluation score |

---

# Machine Learning Model

The burnout prediction system uses a Random Forest Classifier trained on employee productivity and wellness data.

### Burnout Levels
- Low
- Medium
- High

---

# Screenshots

## Dashboard
(Add dashboard screenshot here)

## Burnout Prediction
(Add prediction screenshot here)

## Export Report
(Add export report screenshot here)

---

# Installation Guide

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:
```bash
http://127.0.0.1:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:
```bash
http://localhost:3000
```

---

# Future Enhancements

- Login Authentication
- Real-time Monitoring
- AI Chatbot Assistant
- Email Alert System
- Cloud Deployment
- Department Performance Analytics
- Employee Wellness Score

---

# Applications

- HR Analytics
- Workforce Monitoring
- Employee Wellness Tracking
- Productivity Analysis
- Burnout Prevention Systems

---

# Learning Outcomes

Through this project, we learned:
- Full Stack Development
- REST API Integration
- Machine Learning Deployment
- Data Visualization
- React Dashboard Design
- PDF/CSV Report Generation

---

# Author

Dharma Sundaram

---

# License

This project is developed for educational and internship purposes.