def predict_burnout_ml(features_dict):
    """
    Run ML burnout model.
    Requires exact feature names trained on CSV:
      total_hours, idle_time_minutes, overtime_hours, break_count,
      meeting_hours, tasks_completed, bugs_fixed, focus_score,
      weekly_target, target_completed, manager_rating

    Returns (label_str, used_ml_bool)
    """
    try:
        df = pd.DataFrame([{k: features_dict[k] for k in BURNOUT_FEATURES}])
        raw = burnout_model.predict(df)[0]
        label = BURNOUT_LABELS.get(int(raw), "Low")

        print(f"[BURNOUT ML] raw={raw} -> label={label} | "
              f"hours={features_dict['total_hours']:.1f}, "
              f"ot={features_dict['overtime_hours']:.1f}, "
              f"focus={features_dict['focus_score']:.0f}")
        return label, True

    except Exception as ex:
        print(f"[BURNOUT FALLBACK] ML failed: {ex}")
        # Rule-based fallback using same thresholds as training logic
        ot   = features_dict.get("overtime_hours", 0)
        hrs  = features_dict.get("total_hours", 0)
        prod = features_dict.get("productivity_score_hint", 0)
        focus = features_dict.get("focus_score", 100)

        if ot >= 0.5 or hrs >=8 or focus < 75:
            return "High", False
        elif ot >= 0.25 or hrs >= 7 or focus < 60:
            return "Medium", False
        return "Low", False


def predict_productivity_ml(row_dict):
    """
    Run ML productivity model.
    The model was trained on XLSX columns:
      'Working Hours for Every Day', 'Total Working Hours Per Day',
      'Lunch Time', 'Break Time', 'Lunch Time & Break Time',
      'Total Leave', 'Permission', 'Total Leave & Permission',
      'Net Productive Hours', 'Overtime Hours'

    The model outputs are genuine productivity scores (0-100)
    based on the training data — no artificial clamping needed.

    Returns (predicted_score, used_ml_bool)
    """
    try:
        df = pd.DataFrame([{k: row_dict[k] for k in PROD_FEATURES}])
        raw = float(future_model.predict(df)[0])

        # Clamp to valid range [0, 100] in case of slight model extrapolation
        predicted = round(max(0.0, min(100.0, raw)), 2)

        print(f"[PRODUCTIVITY ML] raw={raw:.2f} -> predicted={predicted:.2f} | "
              f"net_hrs={row_dict['Net Productive Hours']:.2f}, "
              f"total={row_dict['Total Working Hours Per Day']:.2f}")
        return predicted, True

    except Exception as ex:
        print(f"[PRODUCTIVITY FALLBACK] ML failed: {ex}")
        return None, False


def generate_recommendations(emp):
    """Generate AI-powered recommendations based on employee metrics."""
    recs = []
    ot = emp.get('overtime_hours', 0)
    focus = emp.get('focus_score', 0)
    burnout = emp.get('burnout_risk', 'Low')
    prod = emp.get('productivity', 0)
    tasks = emp.get('tasks_completed', 0)
    hours = emp.get('total_hours', 0)

    if ot > 1:
        recs.append('Reduce overtime workload to prevent burnout')
    if focus < 70:
        recs.append('Improve focus sessions with dedicated deep work blocks')
    if burnout == 'High':
        recs.append('Schedule regular breaks and consider workload redistribution')
        recs.append('Conduct one-on-one wellness check with manager')
    if burnout == 'Medium':
        recs.append('Monitor workload balance and ensure adequate rest periods')
    if tasks < 3:
        recs.append('Assign fewer parallel tasks to improve completion rate')
    if prod < 50:
        recs.append('Provide technical training and skill development resources')
        recs.append('Review task complexity and provide mentorship support')
    if hours > 8.5:
        recs.append('Optimize work schedule to maintain sustainable productivity')
    if prod >= 80 and burnout == 'Low':
        recs.append('Consider for leadership development and mentoring roles')
    if focus >= 85 and prod >= 75:
        recs.append('Maintain current productive work patterns')
    if not recs:
        recs.append('Performance is on track - continue current work patterns')

    return recs[:5]


def generate_recommendation_details(emp):
    """
    Generate structured AI recommendation details with:
    - Strengths and weaknesses analysis
    - Burnout risk explanation with confidence
    - Actionable improvement suggestions
    """
    ot = float(emp.get('overtime_hours', 0))
    focus = float(emp.get('focus_score', 0))
    burnout = emp.get('burnout_risk', 'Low')
    prod = float(emp.get('productivity', 0))
    tasks = int(emp.get('tasks_completed', 0))
    hours = float(emp.get('total_hours', 0))
    predicted_prod = float(emp.get('predicted_productivity', prod))

    # --- Strengths ---
    strengths = []
    if prod >= 80:
        strengths.append(f"High productivity ({prod:.0f}%)")
    elif prod >= 60:
        strengths.append(f"Good productivity ({prod:.0f}%)")
    if focus >= 80:
        strengths.append(f"Excellent focus score ({focus:.0f})")
    if tasks >= 5:
        strengths.append(f"Strong task completion ({tasks} tasks)")
    if ot == 0 and hours > 0:
        strengths.append("Healthy work-life balance — no overtime")
    if burnout == 'Low' and prod >= 60:
        strengths.append("Low burnout risk with sustained output")
    if hours >= 6 and hours <= 8:
        strengths.append("Consistent and optimal working hours")
    if not strengths:
        strengths.append("Steady work pattern")

    # --- Weaknesses ---
    weaknesses = []
    if prod < 50:
        weaknesses.append(f"Below-average productivity ({prod:.0f}%)")
    if ot > 1:
        weaknesses.append(f"Elevated overtime ({ot:.1f} hrs)")
    if focus < 60 and focus > 0:
        weaknesses.append(f"Low focus score ({focus:.0f})")
    if hours > 9:
        weaknesses.append(f"Extended working hours ({hours:.1f} hrs)")
    if tasks < 2 and tasks >= 0:
        weaknesses.append(f"Low task completion rate ({tasks} tasks)")
    if burnout == 'High':
        weaknesses.append("High burnout risk detected")

    # --- Burnout explanation ---
    risk_factors = []
    confidence = 0.5  # Base confidence

    if ot >= 1.5:
        risk_factors.append(f"Overtime above 1.5 hours ({ot:.1f}h)")
        confidence += 0.15
    elif ot >= 1:
        risk_factors.append(f"Overtime above 1 hour ({ot:.1f}h)")
        confidence += 0.1
    if hours >= 9:
        risk_factors.append(f"Working hours above 9 ({hours:.1f}h)")
        confidence += 0.15
    elif hours >= 8:
        risk_factors.append(f"Working hours at/above 8 ({hours:.1f}h)")
        confidence += 0.08
    if focus < 60 and focus > 0:
        risk_factors.append(f"Focus score below 60 ({focus:.0f})")
        confidence += 0.12
    elif focus < 70 and focus > 0:
        risk_factors.append(f"Focus score below 70 ({focus:.0f})")
        confidence += 0.06

    if burnout == 'Low' and not risk_factors:
        risk_factors.append("No significant risk factors detected")
        confidence = 0.85

    confidence = min(0.95, confidence)

    burnout_actions = []
    if burnout == 'High':
        burnout_actions = [
            "Immediate workload redistribution recommended",
            "Schedule wellness check with manager",
            "Consider temporary reduced hours"
        ]
    elif burnout == 'Medium':
        burnout_actions = [
            "Monitor workload over next 2 weeks",
            "Ensure regular break schedules",
            "Review task priority assignments"
        ]
    else:
        burnout_actions = [
            "Continue current work patterns",
            "Maintain healthy work-life balance"
        ]

    # --- Actions ---
    actions = generate_recommendations(emp)

    return {
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
        "actions": actions[:5],
        "burnout_explanation": {
            "risk_level": burnout,
            "risk_factors": risk_factors[:4],
            "confidence": round(confidence, 2),
            "recommended_actions": burnout_actions[:3]
        }
    }



# =========================================
# COLUMN NORMALIZER
# Maps various dataset column formats to canonical names
# =========================================

def normalize_row(row):
    """
    Build a canonical feature dict from a dataset row,
    handling both CSV format and XLSX format.
    """
    r = row  # shorthand

    # ---- Employee info ----
    employee_name = safe_str(r,
        "Employee Name", "employee_name", default="Unknown")
    project_name  = safe_str(r,
        "Project Name", "project_name", "department", default="No Project")
    task_name     = safe_str(r,
        "Task Name", "task_name", default="No Task")
    status        = safe_str(r,
        "Status", "task_status", default="Regular")

    # ---- Time features (XLSX uses formal names, CSV uses snake_case) ----
    total_hours = safe_float(r,
        "Total Working Hours Per Day", "total_hours", default=0.0)

    working_hours_every_day = safe_float(r,
        "Working Hours for Every Day", "total_hours", default=total_hours)

    overtime = safe_float(r,
        "Overtime Hours", "overtime_hours", default=0.0)

    lunch_time = safe_float(r,
        "Lunch Time", default=1.0)

    break_time = safe_float(r,
        "Break Time", default=0.5)

    lunch_break = safe_float(r,
        "Lunch Time & Break Time", default=lunch_time + break_time)

    total_leave = safe_float(r,
        "Total Leave", default=0.0)

    permission = safe_float(r,
        "Permission", default=0.0)

    leave_permission = safe_float(r,
        "Total Leave & Permission", default=total_leave + permission)

    # Net Productive Hours: use dataset value if available, else derive
    net_prod_hours_raw = safe_float(r,
        "Net Productive Hours", default=0.0)

    # Derive Net Productive Hours if not in dataset (CSV case)
    # Formula: total_hours - lunch_break - total_leave - permission
    if net_prod_hours_raw == 0.0 and total_hours > 0:
        net_prod_hours = max(0.0, total_hours - lunch_break - total_leave - permission)
    else:
        net_prod_hours = net_prod_hours_raw

    # ---- Productivity score (actual label from dataset) ----
    productivity = safe_float(r,
        "Productivity Score", "productivity_score", default=0.0)

    # ---- Burnout model features (CSV dataset columns) ----
    idle_time_minutes = safe_float(r,
        "Idle Time Minutes", "idle_time_minutes", default=0.0)
    break_count       = safe_float(r,
        "Break Count", "break_count", default=0.0)
    meeting_hours     = safe_float(r,
        "Meeting Hours", "meeting_hours", default=0.0)
    tasks_completed   = safe_float(r,
        "Tasks Completed", "tasks_completed", default=0.0)
    bugs_fixed        = safe_float(r,
        "Bugs Fixed", "bugs_fixed", default=0.0)
    focus_score       = safe_float(r,
        "Focus Score", "focus_score", default=0.0)
    weekly_target     = safe_float(r,
        "Weekly Target", "weekly_target", default=0.0)
    target_completed  = safe_float(r,
        "Target Completed", "target_completed", default=0.0)
    manager_rating    = safe_float(r,
        "Manager Rating", "manager_rating", default=0.0)

    # ---- Burnout label if already present in dataset ----
    burnout_label = safe_str(r,
        "burnout_risk", "Burnout Risk", "Productivity Label", default="")

    return {
        # Employee info
        "employee_name":    employee_name,
        "project_name":     project_name,
        "task_name":        task_name,
        "status":           status,
        # Productivity model features (XLSX-style names)
        "Working Hours for Every Day": working_hours_every_day,
        "Total Working Hours Per Day": total_hours,
        "Lunch Time":                  lunch_time,
        "Break Time":                  break_time,
        "Lunch Time & Break Time":     lunch_break,
        "Total Leave":                 total_leave,
        "Permission":                  permission,
        "Total Leave & Permission":    leave_permission,
        "Net Productive Hours":        net_prod_hours,
        "Overtime Hours":              overtime,
        # Burnout model features (CSV-style names)
        "total_hours":         total_hours,
        "idle_time_minutes":   idle_time_minutes,
        "overtime_hours":      overtime,
        "break_count":         break_count,
        "meeting_hours":       meeting_hours,
        "tasks_completed":     tasks_completed,
        "bugs_fixed":          bugs_fixed,
        "focus_score":         focus_score,
        "weekly_target":       weekly_target,
        "target_completed":    target_completed,
        "manager_rating":      manager_rating,
        # Derived / passthrough
        "productivity":            productivity,
        "productivity_score_hint": productivity,
        "burnout_label_in_data":   burnout_label,
    }



# =========================================
# HOME ROUTE
# =========================================

