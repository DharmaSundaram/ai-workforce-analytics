"""
DEEP DIAGNOSTIC — Understand actual dataset column values to fix productivity model
"""
import pickle
import pandas as pd
import numpy as np

burnout_model = pickle.load(open("burnout_model.pkl", "rb"))
future_model  = pickle.load(open("future_productivity_model.pkl", "rb"))

# Load the actual dataset to understand realistic value ranges
try:
    df = pd.read_excel("Staff_Productivity_Dataset (1).xlsx")
    print("=== ACTUAL DATASET COLUMNS ===")
    print(df.columns.tolist())
    print("\n=== SAMPLE DATA (first 5 rows) ===")
    print(df.head())
    print("\n=== VALUE RANGES ===")
    print(df.describe())
except Exception as e:
    print("Could not load xlsx:", e)

try:
    df2 = pd.read_csv("employee_productivity_dataset.csv")
    print("\n=== CSV DATASET COLUMNS ===")
    print(df2.columns.tolist())
    print("\n=== CSV SAMPLE (first 3 rows) ===")
    print(df2.head(3))
    print("\n=== CSV VALUE RANGES ===")
    print(df2.describe())
except Exception as e:
    print("Could not load csv:", e)

# Now test productivity model with actual realistic Net Productive Hours
# From dataset ranges
print("\n=== PRODUCTIVITY MODEL — Granular Tests ===")
tests = [
    (4.0, 6.0, 0.0),   # (net_hours, total_hours, overtime)
    (5.0, 7.0, 0.0),
    (6.0, 8.0, 0.0),
    (6.5, 8.0, 0.0),
    (7.0, 8.5, 0.5),
    (7.5, 9.0, 1.0),
    (8.0, 10.0, 2.0),
    (8.5, 10.5, 2.5),
]
for net, total, ot in tests:
    feat = pd.DataFrame([{
        "Working Hours for Every Day": total,
        "Total Working Hours Per Day": total,
        "Lunch Time": 1.0,
        "Break Time": 0.5,
        "Lunch Time & Break Time": 1.5,
        "Total Leave": 0.0,
        "Permission": 0.0,
        "Total Leave & Permission": 0.0,
        "Net Productive Hours": net,
        "Overtime Hours": ot
    }])
    pred = future_model.predict(feat)[0]
    print(f"  net={net}, total={total}, OT={ot}  →  predicted={pred:.2f}")

# What does burnout model predict for class 0, 1, 2 meaning?
print("\n=== BURNOUT CLASS MEANING (via probabilities) ===")
# High burnout scenario: overtime=3, focus=30
high_feat = pd.DataFrame([{"total_hours":11,"idle_time_minutes":60,"overtime_hours":3,"break_count":1,"meeting_hours":3,"tasks_completed":2,"bugs_fixed":8,"focus_score":30,"weekly_target":10,"target_completed":2,"manager_rating":1.5}])
raw = burnout_model.predict(high_feat)[0]
proba = burnout_model.predict_proba(high_feat)[0]
print(f"High-risk input → class={raw}, probas={dict(zip(burnout_model.classes_, proba.round(3)))}")
print("So class 0 maps to → HIGH BURNOUT (most probable for risky employee)")
print("   class 1 maps to → LOW BURNOUT")
print("   class 2 maps to → MEDIUM BURNOUT")
print("\nOriginal label mapping in code: {0:'High', 1:'Low', 2:'Medium'} ← CORRECT!")
print("BUT: model returns numpy.int64, need int() cast for dict.get()")

# Verify int cast works
print(f"\nDirect key lookup labels.get({raw}): ", {0:"High",1:"Low",2:"Medium"}.get(raw, "MISSING"))
print(f"Int cast lookup labels.get({int(raw)}): ", {0:"High",1:"Low",2:"Medium"}.get(int(raw), "MISSING"))
