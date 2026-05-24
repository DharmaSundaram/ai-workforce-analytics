from flask import Flask, request, jsonify
from flask_cors import CORS

import pickle
import pandas as pd
import warnings

# =========================================
# REMOVE SCIKIT WARNINGS
# =========================================

warnings.filterwarnings("ignore")

# =========================================
# LOAD MODELS
# =========================================

burnout_model = pickle.load(
    open("burnout_model.pkl", "rb")
)

future_model = pickle.load(
    open("future_productivity_model.pkl", "rb")
)

# =========================================
# FLASK SETUP
# =========================================

app = Flask(__name__)

CORS(app)

# =========================================
# LABELS
# =========================================

labels = {
    0: "High",
    1: "Low",
    2: "Medium"
}

# =========================================
# HOME ROUTE
# =========================================

@app.route("/")
def home():

    return jsonify({
        "message":
        "AI Workforce Analytics Backend Running Successfully"
    })

# =========================================
# BURNOUT PREDICTION
# =========================================

@app.route("/predict-burnout", methods=["POST"])
def predict_burnout():

    try:

        data = request.json

        features = pd.DataFrame([{

            "total_hours":
                float(data["total_hours"]),

            "idle_time_minutes":
                float(data["idle_time_minutes"]),

            "overtime_hours":
                float(data["overtime_hours"]),

            "break_count":
                float(data["break_count"]),

            "meeting_hours":
                float(data["meeting_hours"]),

            "tasks_completed":
                float(data["tasks_completed"]),

            "bugs_fixed":
                float(data["bugs_fixed"]),

            "focus_score":
                float(data["focus_score"]),

            "weekly_target":
                float(data["weekly_target"]),

            "target_completed":
                float(data["target_completed"]),

            "manager_rating":
                float(data["manager_rating"])

        }])

        prediction = burnout_model.predict(features)[0]

        result = labels.get(
            prediction,
            "Unknown"
        )

        return jsonify({
            "success": True,
            "burnout_risk": result
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })

# =========================================
# PRODUCTIVITY PREDICTION
# =========================================

@app.route("/predict-productivity", methods=["POST"])
def predict_productivity():

    try:

        data = request.json

        features = pd.DataFrame([{

            "Working Hours for Every Day":
                float(data["working_hours"]),

            "Total Working Hours Per Day":
                float(data["total_hours"]),

            "Lunch Time":
                float(data["lunch_time"]),

            "Break Time":
                float(data["break_time"]),

            "Lunch Time & Break Time":
                float(data["lunch_break"]),

            "Total Leave":
                float(data["total_leave"]),

            "Permission":
                float(data["permission"]),

            "Total Leave & Permission":
                float(data["leave_permission"]),

            "Net Productive Hours":
                float(data["net_productive_hours"]),

            "Overtime Hours":
                float(data["overtime_hours"])

        }])

        prediction = future_model.predict(features)[0]

        return jsonify({
            "success": True,
            "predicted_productivity":
                round(float(prediction), 2)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })

# =========================================
# RUN APP
# =========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )