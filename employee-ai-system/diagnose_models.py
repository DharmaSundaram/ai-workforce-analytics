"""
DIAGNOSTIC SCRIPT — AI Workforce Analytics Models
Run this to understand actual model behavior, classes, and output ranges.
"""
import pickle
import pandas as pd
import numpy as np

print("=" * 60)
print("LOADING MODELS")
print("=" * 60)

burnout_model = pickle.load(open("burnout_model.pkl", "rb"))
future_model  = pickle.load(open("future_productivity_model.pkl", "rb"))

# ============================================================
# BURNOUT MODEL
# ============================================================
print("\n=== BURNOUT MODEL ===")
print("Type          :", type(burnout_model))

# Classes stored in the model (the actual label values it was trained on)
if hasattr(burnout_model, "classes_"):
    print("classes_      :", burnout_model.classes_)
    print("classes_ type :", type(burnout_model.classes_[0]))
else:
    print("No classes_ attribute found")

# Feature names if available
if hasattr(burnout_model, "feature_names_in_"):
    print("feature_names :", list(burnout_model.feature_names_in_))
elif hasattr(burnout_model, "feature_importances_"):
    print("feature_importances length:", len(burnout_model.feature_importances_))

# ---- Test predictions with known scenarios ----
test_cases = [
    {
        "label": "HIGH BURNOUT EMPLOYEE (overtime=3, productivity=35, hours=11)",
        "features": {
            "total_hours": 11, "idle_time_minutes": 60, "overtime_hours": 3,
            "break_count": 1, "meeting_hours": 3, "tasks_completed": 2,
            "bugs_fixed": 8, "focus_score": 30, "weekly_target": 10,
            "target_completed": 2, "manager_rating": 1.5
        }
    },
    {
        "label": "MEDIUM BURNOUT EMPLOYEE (overtime=0.5, productivity=65, hours=9)",
        "features": {
            "total_hours": 9, "idle_time_minutes": 20, "overtime_hours": 0.5,
            "break_count": 2, "meeting_hours": 1.5, "tasks_completed": 5,
            "bugs_fixed": 3, "focus_score": 65, "weekly_target": 8,
            "target_completed": 5, "manager_rating": 3.0
        }
    },
    {
        "label": "LOW BURNOUT EMPLOYEE (overtime=0, productivity=90, hours=7)",
        "features": {
            "total_hours": 7, "idle_time_minutes": 10, "overtime_hours": 0,
            "break_count": 3, "meeting_hours": 1, "tasks_completed": 9,
            "bugs_fixed": 1, "focus_score": 92, "weekly_target": 10,
            "target_completed": 9, "manager_rating": 4.8
        }
    }
]

for tc in test_cases:
    print(f"\n  Test: {tc['label']}")
    df = pd.DataFrame([tc["features"]])
    try:
        raw_pred = burnout_model.predict(df)[0]
        print(f"    raw predict()  : {raw_pred!r}  (type: {type(raw_pred).__name__})")
        if hasattr(burnout_model, "predict_proba"):
            proba = burnout_model.predict_proba(df)[0]
            print(f"    predict_proba(): {dict(zip(burnout_model.classes_, proba.round(3)))}")
    except Exception as ex:
        print(f"    ERROR: {ex}")


# ============================================================
# PRODUCTIVITY MODEL
# ============================================================
print("\n\n=== PRODUCTIVITY MODEL (future_model) ===")
print("Type          :", type(future_model))

if hasattr(future_model, "feature_names_in_"):
    print("feature_names :", list(future_model.feature_names_in_))

prod_tests = [
    {
        "label": "LOW hours (6h, 0 OT, net=4.5)",
        "features": {
            "Working Hours for Every Day": 6, "Total Working Hours Per Day": 6,
            "Lunch Time": 1.0, "Break Time": 0.5, "Lunch Time & Break Time": 1.5,
            "Total Leave": 0.0, "Permission": 0.0, "Total Leave & Permission": 0.0,
            "Net Productive Hours": 4.5, "Overtime Hours": 0
        }
    },
    {
        "label": "NORMAL hours (8h, 0 OT, net=6.5)",
        "features": {
            "Working Hours for Every Day": 8, "Total Working Hours Per Day": 8,
            "Lunch Time": 1.0, "Break Time": 0.5, "Lunch Time & Break Time": 1.5,
            "Total Leave": 0.0, "Permission": 0.0, "Total Leave & Permission": 0.0,
            "Net Productive Hours": 6.5, "Overtime Hours": 0
        }
    },
    {
        "label": "HIGH hours (10h, 2h OT, net=8.5)",
        "features": {
            "Working Hours for Every Day": 10, "Total Working Hours Per Day": 10,
            "Lunch Time": 1.0, "Break Time": 0.5, "Lunch Time & Break Time": 1.5,
            "Total Leave": 0.0, "Permission": 0.0, "Total Leave & Permission": 0.0,
            "Net Productive Hours": 8.5, "Overtime Hours": 2
        }
    },
    {
        "label": "ZEROS for everything (default fallback scenario)",
        "features": {
            "Working Hours for Every Day": 0, "Total Working Hours Per Day": 0,
            "Lunch Time": 1.0, "Break Time": 0.5, "Lunch Time & Break Time": 1.5,
            "Total Leave": 0.0, "Permission": 0.0, "Total Leave & Permission": 0.0,
            "Net Productive Hours": 0, "Overtime Hours": 0
        }
    }
]

prod_outputs = []
for pt in prod_tests:
    df = pd.DataFrame([pt["features"]])
    try:
        raw = future_model.predict(df)[0]
        prod_outputs.append(raw)
        print(f"  Test: {pt['label']}")
        print(f"    raw predict(): {raw:.4f}")
    except Exception as ex:
        print(f"  Test: {pt['label']}")
        print(f"    ERROR: {ex}")

if prod_outputs:
    arr = np.array(prod_outputs)
    print(f"\n  Output stats across {len(arr)} tests:")
    print(f"    min={arr.min():.4f}, max={arr.max():.4f}, mean={arr.mean():.4f}")
    print(f"    All values > 90? {(arr > 90).all()}")
    print(f"    All values > 100? {(arr > 100).all()}")

print("\n\n=== DIAGNOSIS COMPLETE ===")
print("Use the class labels and value ranges above to correct the backend mapping.")
