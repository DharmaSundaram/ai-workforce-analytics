import os
import warnings

import numpy as np
import pandas as pd

from ml.burnout.predictor import load_burnout_model
from ml.productivity.predictor import load_future_productivity_model


warnings.filterwarnings("ignore")

DATASET_DIR = os.path.join(os.path.dirname(__file__), "datasets")
CSV_DATASET = os.path.join(DATASET_DIR, "employee_productivity_dataset.csv")
XLSX_DATASET = os.path.join(DATASET_DIR, "Staff_Productivity_Dataset (1).xlsx")


def print_model_diagnostics():
    burnout_model = load_burnout_model()
    future_model = load_future_productivity_model()

    print("=" * 60)
    print("BURNOUT MODEL")
    print("=" * 60)
    print("Type:", type(burnout_model))
    if hasattr(burnout_model, "classes_"):
        print("classes_:", burnout_model.classes_)
    if hasattr(burnout_model, "feature_names_in_"):
        print("feature_names:", list(burnout_model.feature_names_in_))

    print("\n" + "=" * 60)
    print("PRODUCTIVITY MODEL")
    print("=" * 60)
    print("Type:", type(future_model))
    if hasattr(future_model, "feature_names_in_"):
        print("feature_names:", list(future_model.feature_names_in_))


def print_dataset_diagnostics():
    if os.path.exists(CSV_DATASET):
        df = pd.read_csv(CSV_DATASET)
        print("\nCSV columns:", df.columns.tolist())
        print(df.describe())

    if os.path.exists(XLSX_DATASET):
        df = pd.read_excel(XLSX_DATASET, engine="openpyxl")
        print("\nXLSX columns:", df.columns.tolist())
        print(df.describe())


def run_prediction_smoke_tests():
    burnout_model = load_burnout_model()
    future_model = load_future_productivity_model()

    burnout_features = pd.DataFrame([{
        "total_hours": 11,
        "idle_time_minutes": 60,
        "overtime_hours": 3,
        "break_count": 1,
        "meeting_hours": 3,
        "tasks_completed": 2,
        "bugs_fixed": 8,
        "focus_score": 30,
        "weekly_target": 10,
        "target_completed": 2,
        "manager_rating": 1.5,
    }])
    burnout_prediction = burnout_model.predict(burnout_features)[0]
    print("Burnout smoke prediction:", burnout_prediction)

    productivity_features = pd.DataFrame([{
        "Working Hours for Every Day": 8,
        "Total Working Hours Per Day": 8,
        "Lunch Time": 1.0,
        "Break Time": 0.5,
        "Lunch Time & Break Time": 1.5,
        "Total Leave": 0.0,
        "Permission": 0.0,
        "Total Leave & Permission": 0.0,
        "Net Productive Hours": 6.5,
        "Overtime Hours": 0,
    }])
    productivity_prediction = future_model.predict(productivity_features)[0]
    print("Productivity smoke prediction:", float(np.round(productivity_prediction, 4)))


if __name__ == "__main__":
    print_model_diagnostics()
    print_dataset_diagnostics()
    run_prediction_smoke_tests()

