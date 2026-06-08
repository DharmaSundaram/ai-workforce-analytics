"""
End-to-end test: simulate what upload_dataset does on real files
"""
import warnings
warnings.filterwarnings("ignore")
import pandas as pd
import io
import app as backend

# ---- Test with CSV dataset ----
print("=" * 60)
print("TEST 1: CSV DATASET (employee_productivity_dataset.csv)")
print("=" * 60)

df_csv = pd.read_csv("ml/datasets/employee_productivity_dataset.csv")
print(f"Rows: {len(df_csv)}, Burnout dist in file: {df_csv['burnout_risk'].value_counts().to_dict()}")

# Process first 50 rows
sample = df_csv.head(50)
results = {"High":0,"Medium":0,"Low":0}
for _, row in sample.iterrows():
    canon = backend.normalize_row(row)
    feat  = {k: canon[k] for k in backend.BURNOUT_FEATURES}
    feat["productivity_score_hint"] = canon["productivity"]
    label, ml_used = backend.predict_burnout_ml(feat)
    results[label] = results.get(label, 0) + 1

actual_dist = df_csv.head(50)["burnout_risk"].value_counts().to_dict()
print(f"  Actual burnout in first 50 rows:    {actual_dist}")
print(f"  Predicted burnout in first 50 rows: {results}")

# Productivity predictions
print("\n  Productivity predictions (first 5 rows of CSV):")
for _, row in df_csv.head(5).iterrows():
    canon = backend.normalize_row(row)
    feat  = {k: canon[k] for k in backend.PROD_FEATURES}
    pred, ml_used = backend.predict_productivity_ml(feat)
    actual = canon["productivity"]
    print(f"    actual={actual:.1f}, predicted={pred:.2f}, net_hrs={canon['Net Productive Hours']:.2f}, total={canon['total_hours']:.2f}")

# ---- Test with XLSX dataset ----
print()
print("=" * 60)
print("TEST 2: XLSX DATASET (Staff_Productivity_Dataset)")
print("=" * 60)

df_xlsx = pd.read_excel("ml/datasets/Staff_Productivity_Dataset (1).xlsx", engine="openpyxl")
print(f"Rows: {len(df_xlsx)}, Columns: {list(df_xlsx.columns)}")

# Productivity predictions
print("\n  Productivity predictions (first 5 rows of XLSX):")
for _, row in df_xlsx.head(5).iterrows():
    canon = backend.normalize_row(row)
    feat  = {k: canon[k] for k in backend.PROD_FEATURES}
    pred, ml_used = backend.predict_productivity_ml(feat)
    actual = canon["productivity"]
    print(f"    actual={actual:.1f}, predicted={pred:.2f}, net_hrs={canon['Net Productive Hours']:.2f}, total={canon['total_hours']:.2f}")

print()
print("=" * 60)
print("ALL TESTS DONE")
print("=" * 60)
