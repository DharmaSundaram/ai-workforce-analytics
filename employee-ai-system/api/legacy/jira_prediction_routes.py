@app.route("/api/sync-jira", methods=["POST"])
@require_roles("admin", "manager")
def sync_jira():
    try:
        import time
        start_time = time.time()
        
        from services.jira.jira_sync import sync_jira_data
        creds = get_jira_credentials()
        result = sync_jira_data(db, EmployeeHistory, credentials=creds)
        create_audit("jira_sync", status="success" if result.get("success") else "failed")
        db.session.commit()
        
        duration = round(time.time() - start_time, 2)
        
        # Log the sync
        sync_log = JiraSyncLog(
            total_records=result.get("synced_records", 0),
            status="success" if result.get("success") else "error",
            errors=str(result.get("errors", result.get("error", ""))),
            duration_seconds=duration,
            project_name="All Projects",
            project_key="All"
        )
        db.session.add(sync_log)
        db.session.commit()
        
        return jsonify({
            "success": result.get("success", False),
            "synced_records": result.get("synced_records", 0),
            "last_sync": result.get("last_sync", datetime.utcnow().isoformat()),
            "message": result.get("error", f"Synced {result.get('synced_records', 0)} records from Jira"),
            "duration": duration
        })
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"[JIRA SYNC ERROR] {e}\n{tb}")
        
        sync_log = JiraSyncLog(
            total_records=0,
            status="error",
            errors=str(e),
            project_name="All Projects",
            project_key="All"
        )
        db.session.add(sync_log)
        db.session.commit()
        
        return jsonify({"success": False, "error": str(e), "synced_records": 0})


@app.route("/api/jira-sync-logs", methods=["GET"])
def jira_sync_logs():
    try:
        logs = JiraSyncLog.query.order_by(JiraSyncLog.sync_time.desc()).limit(50).all()
        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "project_name": log.project_name or "All Projects",
                "project_key": log.project_key or "-",
                "sync_time": log.sync_time.strftime("%Y-%m-%d %H:%M:%S") if log.sync_time else "",
                "total_records": log.total_records,
                "status": log.status,
                "errors": log.errors or "",
                "duration_seconds": log.duration_seconds
            })
        return jsonify({"success": True, "logs": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/api/jira-sync-status", methods=["GET"])
def jira_sync_status():
    try:
        last_log = JiraSyncLog.query.order_by(JiraSyncLog.sync_time.desc()).first()
        
        # Calculate next sync (hourly)
        from datetime import timedelta
        if last_log and last_log.sync_time:
            next_sync = (last_log.sync_time + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")
        else:
            next_sync = "Not scheduled"
        
        return jsonify({
            "success": True,
            "last_sync": last_log.sync_time.strftime("%Y-%m-%d %H:%M:%S") if last_log else None,
            "last_status": last_log.status if last_log else "idle",
            "last_records": last_log.total_records if last_log else 0,
            "next_sync": next_sync,
            "jira_configured": bool(get_jira_credentials()['url'])
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# =========================================
# BURNOUT PREDICTION (existing — unchanged)
# =========================================

@app.route("/predict-burnout", methods=["POST"])
def predict_burnout():
    try:
        data = request.json
        features = pd.DataFrame([{
            "total_hours":       float(data["total_hours"]),
            "idle_time_minutes": float(data["idle_time_minutes"]),
            "overtime_hours":    float(data["overtime_hours"]),
            "break_count":       float(data["break_count"]),
            "meeting_hours":     float(data["meeting_hours"]),
            "tasks_completed":   float(data["tasks_completed"]),
            "bugs_fixed":        float(data["bugs_fixed"]),
            "focus_score":       float(data["focus_score"]),
            "weekly_target":     float(data["weekly_target"]),
            "target_completed":  float(data["target_completed"]),
            "manager_rating":    float(data["manager_rating"])
        }])
        prediction = burnout_model.predict(features)[0]
        result = BURNOUT_LABELS.get(int(prediction), "Low")
        print(f"[/predict-burnout] raw={prediction} -> {result}")
        return jsonify({"success": True, "burnout_risk": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# =========================================
# PRODUCTIVITY PREDICTION (existing — unchanged)
# =========================================

@app.route("/predict-productivity", methods=["POST"])
def predict_productivity():
    try:
        data = request.json
        features = pd.DataFrame([{
            "Working Hours for Every Day": float(data["working_hours"]),
            "Total Working Hours Per Day": float(data["total_hours"]),
            "Lunch Time":                  float(data["lunch_time"]),
            "Break Time":                  float(data["break_time"]),
            "Lunch Time & Break Time":     float(data["lunch_break"]),
            "Total Leave":                 float(data["total_leave"]),
            "Permission":                  float(data["permission"]),
            "Total Leave & Permission":    float(data["leave_permission"]),
            "Net Productive Hours":        float(data["net_productive_hours"]),
            "Overtime Hours":              float(data["overtime_hours"])
        }])
        prediction = future_model.predict(features)[0]
        result = round(max(0.0, min(100.0, float(prediction))), 2)
        print(f"[/predict-productivity] raw={prediction:.2f} -> {result}")
        return jsonify({"success": True, "predicted_productivity": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# =========================================
# UPLOAD DATASET — FULLY DYNAMIC ML PROCESSING
# =========================================

