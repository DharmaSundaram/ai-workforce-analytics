import pickle, pandas as pd, numpy as np, warnings
warnings.filterwarnings('ignore')

burnout_model = pickle.load(open("burnout_model.pkl","rb"))
future_model  = pickle.load(open("future_productivity_model.pkl","rb"))
df2 = pd.read_csv("employee_productivity_dataset.csv")

print("burnout_model.classes_:", burnout_model.classes_)

def predict_burnout_from_row(row):
    feat = pd.DataFrame([{
        "total_hours":       row["total_hours"],
        "idle_time_minutes": row["idle_time_minutes"],
        "overtime_hours":    row["overtime_hours"],
        "break_count":       row["break_count"],
        "meeting_hours":     row["meeting_hours"],
        "tasks_completed":   row["tasks_completed"],
        "bugs_fixed":        row["bugs_fixed"],
        "focus_score":       row["focus_score"],
        "weekly_target":     row["weekly_target"],
        "target_completed":  row["target_completed"],
        "manager_rating":    row["manager_rating"]
    }])
    raw   = burnout_model.predict(feat)[0]
    proba = burnout_model.predict_proba(feat)[0]
    return int(raw), dict(zip([int(c) for c in burnout_model.classes_], proba.round(3)))

for label_name in ["High", "Low", "Medium"]:
    rows = df2[df2["burnout_risk"] == label_name].head(2)
    print(f"\n=== actual={label_name} rows ===")
    for _, row in rows.iterrows():
        raw_class, proba = predict_burnout_from_row(row)
        print(f"  actual={label_name}, predicted_class={raw_class}, proba={proba}")
        print(f"  hours={row['total_hours']}, ot={row['overtime_hours']}, focus={row['focus_score']}, prod={row['productivity_score']}")

# Productivity model on XLSX actual data
print("\n=== PRODUCTIVITY MODEL on actual XLSX dataset ===")
xlsx = pd.read_excel("Staff_Productivity_Dataset (1).xlsx")
for _, row in xlsx.head(12).iterrows():
    feat = pd.DataFrame([{
        "Working Hours for Every Day": row["Working Hours for Every Day"],
        "Total Working Hours Per Day": row["Total Working Hours Per Day"],
        "Lunch Time":                  row["Lunch Time"],
        "Break Time":                  row["Break Time"],
        "Lunch Time & Break Time":     row["Lunch Time & Break Time"],
        "Total Leave":                 row.get("Total Leave", 0),
        "Permission":                  row.get("Permission", 0),
        "Total Leave & Permission":    row.get("Total Leave & Permission", 0),
        "Net Productive Hours":        row["Net Productive Hours"],
        "Overtime Hours":              row["Overtime Hours"]
    }])
    pred   = future_model.predict(feat)[0]
    actual = row["Productivity Score"]
    net    = row["Net Productive Hours"]
    total  = row["Total Working Hours Per Day"]
    print(f"  actual={actual:.1f}, predicted={pred:.2f}, net={net:.2f}, total={total:.2f}")
