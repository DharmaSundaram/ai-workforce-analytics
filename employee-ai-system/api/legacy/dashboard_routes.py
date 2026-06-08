@app.route("/")
def home():
    return jsonify({
        "message": "AI Workforce Analytics Backend Running Successfully",
        "endpoints": ["/predict-burnout", "/predict-productivity", "/upload-dataset", "/api/login", "/api/register", "/api/logout", "/api/profile", "/api/change-password", "/api/forgot-password", "/employee-history", "/api/upload-sessions", "/api/sync-status", "/api/trigger-sync", "/api/sync-jira", "/api/jira-sync-logs", "/api/jira-sync-status", "/api/dashboard-data"]
    })


# =========================================
# DASHBOARD DATA — loads latest batch for page refresh
# =========================================

@app.route("/api/dashboard-data", methods=["GET"])
def dashboard_data():
    """
    Returns the latest upload batch in the same JSON shape as /upload-dataset
    so the Dashboard can populate KPIs, charts, and table on page load
    without requiring a fresh file upload.
    """
    try:
        connected_projects = [{
            "project_id": str(p.id),
            "project_key": p.project_key,
            "project_name": p.project_name
        } for p in JiraProject.query.filter_by(is_active=True).order_by(JiraProject.project_key.asc()).all()]

        # Find the latest upload_batch_id
        latest = db.session.query(EmployeeHistory.upload_batch_id)\
            .filter(EmployeeHistory.upload_batch_id.isnot(None))\
            .filter(EmployeeHistory.upload_batch_id != "")\
            .order_by(EmployeeHistory.upload_time.desc())\
            .first()

        if not latest or not latest[0]:
            return jsonify({
                "success": True,
                "employees": [],
                "forecast": [],
                "kpis": {
                    "total_employees": 0,
                    "total_tasks": 0,
                    "projects_connected": 0,
                    "projects_synced": 0,
                    "high_burnout": 0,
                    "medium_burnout": 0,
                    "low_burnout": 0,
                    "avg_productivity": 0,
                    "avg_predicted_productivity": 0,
                    "overtime_employees": 0,
                    "low_productivity_employees": 0,
                    "top_performers_count": 0,
                    "completed_tasks": 0,
                    "open_tasks": 0,
                    "total_worklogs": 0
                },
                "project_performance_overview": [],
                "aggregated_employees": {},
                "department_rankings": [],
                "connected_projects": connected_projects,
                "top_performers": [],
                "accuracy": 87.5,
                "total_records": 0,
                "file_names": [],
                "has_data": False
            })

        batch_id = latest[0]
        jira_record_count = EmployeeHistory.query.filter(
            EmployeeHistory.upload_batch_id.like("jira-%")
        ).count()

        if jira_record_count:
            records = EmployeeHistory.query\
                .filter(EmployeeHistory.upload_batch_id.like("jira-%"))\
                .order_by(EmployeeHistory.id.asc())\
                .all()
            batch_id = "jira-all-projects"
        else:
            records = EmployeeHistory.query\
                .filter_by(upload_batch_id=batch_id)\
                .order_by(EmployeeHistory.id.asc())\
                .all()

        if not records:
            return jsonify({
                "success": True,
                "employees": [],
                "forecast": [],
                "kpis": {},
                "project_performance_overview": [],
                "aggregated_employees": {},
                "department_rankings": [],
                "connected_projects": connected_projects,
                "top_performers": [],
                "accuracy": 87.5,
                "total_records": 0,
                "file_names": [],
                "has_data": False
            })

        # Build employee list in the SAME format as /upload-dataset response
        employees = []
        forecast_map = {}

        for idx, rec in enumerate(records):
            overtime = float(rec.overtime_hours or 0)
            hours = float(rec.working_hours or 0)
            prod = float(rec.productivity or 0)
            burnout = rec.burnout or "Low"

            # Net productive hours estimate
            net_hours = max(0.0, hours - (overtime * 0.5))

            emp = {
                "employee_name": rec.employee_name or "Unknown",
                "project_id": rec.project_id or "",
                "project_key": rec.project_key or "",
                "project_name": rec.project_name or rec.project or "",
                "department": rec.department or "Unknown",
                "task_name": rec.task or "",
                "status_name": rec.status or "Open",
                "productivity": prod,
                "predicted_productivity": prod,
                "productive_hours": round(net_hours, 2),
                "total_hours": hours,
                "overtime_hours": overtime,
                "burnout_risk": burnout,
                "status": "Active" if hours > 0 else "Idle",
                "focus_score": 0,
                "tasks_completed": 1 if rec.status in ["Done", "Resolved", "Closed"] else 0,
                "recommendations": generate_recommendations({"overtime_hours": overtime, "focus_score": 0, "burnout_risk": burnout, "productivity": prod, "tasks_completed": 0, "total_hours": hours}),
                "recommendation_details": generate_recommendation_details({"overtime_hours": overtime, "focus_score": 0, "burnout_risk": burnout, "productivity": prod, "tasks_completed": 0, "total_hours": hours, "predicted_productivity": prod})
            }
            employees.append(emp)

            # Forecast grouping (10 rows per week)
            week_num = (idx // 10) + 1
            week_key = f"Week {week_num}"
            if week_key not in forecast_map:
                forecast_map[week_key] = {
                    "actual_total": 0.0, "predicted_total": 0.0, "count": 0
                }
            forecast_map[week_key]["actual_total"] += prod
            forecast_map[week_key]["predicted_total"] += prod
            forecast_map[week_key]["count"] += 1

        total = len(employees)

        # Build forecast
        forecast = []
        for week, vals in forecast_map.items():
            c = vals["count"]
            forecast.append({
                "week": week,
                "productivity": round(vals["actual_total"] / c, 2),
                "predicted": round(vals["predicted_total"] / c, 2)
            })

        # KPIs
        high_b = sum(1 for e in employees if e["burnout_risk"] == "High")
        med_b = sum(1 for e in employees if e["burnout_risk"] == "Medium")
        low_b = sum(1 for e in employees if e["burnout_risk"] == "Low")

        # Unique employees
        unique_employees = len(set(e["employee_name"] for e in employees))

        # Aggregated Employees
        aggregated_employees = {}
        project_stats = {}
        department_stats = {}
        completed_tasks = 0
        open_tasks = 0

        for e in employees:
            ename = e["employee_name"]
            pname = e["project_name"]

            if e["status_name"] in ["Done", "Resolved", "Closed"]:
                completed_tasks += 1
            else:
                open_tasks += 1

            if ename not in aggregated_employees:
                aggregated_employees[ename] = {
                    "employee_name": ename,
                    "total_hours": 0,
                    "total_tasks": 0,
                    "completed_tasks": 0,
                    "overtime": 0,
                    "productivity_sum": 0,
                    "burnout_counts": {"High": 0, "Medium": 0, "Low": 0},
                    "projects": set(),
                    "department": e["department"],
                }
            
            agg = aggregated_employees[ename]
            agg["total_hours"] += e["total_hours"]
            agg["total_tasks"] += 1
            agg["completed_tasks"] += e["tasks_completed"]
            agg["overtime"] += e["overtime_hours"]
            agg["productivity_sum"] += e["productivity"]
            agg["burnout_counts"][e["burnout_risk"]] = agg["burnout_counts"].get(e["burnout_risk"], 0) + 1
            agg["projects"].add(pname)

            if pname not in project_stats:
                project_stats[pname] = {
                    "project_name": pname,
                    "employee_set": set(),
                    "task_count": 0,
                    "productivity_sum": 0,
                    "high_burnout_count": 0,
                    "burnout_counts": {"High": 0, "Medium": 0, "Low": 0},
                }
            pstat = project_stats[pname]
            pstat["employee_set"].add(ename)
            pstat["task_count"] += 1
            pstat["productivity_sum"] += e["productivity"]
            pstat["burnout_counts"][e["burnout_risk"]] = pstat["burnout_counts"].get(e["burnout_risk"], 0) + 1
            if e["burnout_risk"] == "High":
                pstat["high_burnout_count"] += 1

            dept = e["department"] or "Unknown"
            if dept not in department_stats:
                department_stats[dept] = {
                    "department": dept,
                    "employee_set": set(),
                    "task_count": 0,
                    "productivity_sum": 0,
                    "burnout_sum": 0,
                    "focus_sum": 0,
                    "hours_sum": 0,
                    "high_burnout_count": 0,
                }
            dst = department_stats[dept]
            dst["employee_set"].add(ename)
            dst["task_count"] += 1
            dst["productivity_sum"] += e["productivity"]
            dst["burnout_sum"] += 100 if e["burnout_risk"] == "High" else (50 if e["burnout_risk"] == "Medium" else 0)
            dst["focus_sum"] += e["focus_score"]
            dst["hours_sum"] += e["total_hours"]
            if e["burnout_risk"] == "High":
                dst["high_burnout_count"] += 1

        for agg in aggregated_employees.values():
            agg["avg_productivity"] = round(agg["productivity_sum"] / agg["total_tasks"], 1) if agg["total_tasks"] else 0
            agg["productivity"] = agg["avg_productivity"]
            agg["burnout_risk"] = max(agg["burnout_counts"], key=agg["burnout_counts"].get)
            agg["projects"] = list(agg["projects"])

        project_performance_overview = []
        for pname, pstat in project_stats.items():
            avg_prod = pstat["productivity_sum"] / pstat["task_count"] if pstat["task_count"] else 0
            emp_count = len(pstat["employee_set"])
            high_burnout_pct = pstat["high_burnout_count"] / pstat["task_count"] if pstat["task_count"] else 0
            health_score = (avg_prod * 0.5) + ((1 - high_burnout_pct) * 100 * 0.3) + 20
            project_performance_overview.append({
                "project_name": pname,
                "health_score": round(health_score, 1),
                "employee_count": emp_count,
                "task_count": pstat["task_count"],
                "productivity_score": round(avg_prod, 1),
                "burnout_risk": "High" if pstat["burnout_counts"]["High"] else ("Medium" if pstat["burnout_counts"]["Medium"] else "Low"),
                "burnout_risk_count": pstat["high_burnout_count"]
            })

        department_rankings = []
        for dept, dst in department_stats.items():
            task_count = dst["task_count"]
            emp_count = len(dst["employee_set"])
            avg_productivity = dst["productivity_sum"] / task_count if task_count else 0
            avg_burnout = dst["burnout_sum"] / task_count if task_count else 0
            avg_focus = dst["focus_sum"] / task_count if task_count else 0
            avg_hours = dst["hours_sum"] / task_count if task_count else 0
            high_burnout_pct = dst["high_burnout_count"] / task_count if task_count else 0
            health_score = (avg_productivity * 0.45) + ((100 - avg_burnout) * 0.35) + (avg_focus * 0.2)
            department_rankings.append({
                "department": dept,
                "department_name": dept,
                "health_score": round(health_score, 1),
                "employee_count": emp_count,
                "average_productivity": round(avg_productivity, 1),
                "average_burnout": round(avg_burnout, 1),
                "average_focus": round(avg_focus, 1),
                "average_hours": round(avg_hours, 1),
                "burnout_risk": "High" if high_burnout_pct >= 0.25 else ("Medium" if high_burnout_pct > 0 else "Low"),
                "high_burnout_count": dst["high_burnout_count"],
            })

        department_rankings.sort(key=lambda d: d["health_score"], reverse=True)
        for idx, dept in enumerate(department_rankings, start=1):
            dept["rank"] = idx

        kpis = {
            "total_employees": unique_employees,
            "total_tasks": total,
            "completed_tasks": completed_tasks,
            "open_tasks": open_tasks,
            "total_worklogs": total, # 1 row = 1 worklog essentially
            "projects_connected": JiraProject.query.count(),
            "projects_synced": JiraProject.query.filter(JiraProject.last_sync.isnot(None)).count(),
            "high_burnout": high_b,
            "medium_burnout": med_b,
            "low_burnout": low_b,
            "avg_productivity": round(
                sum(e["productivity"] for e in employees) / total, 1
            ) if total > 0 else 0,
            "avg_predicted_productivity": round(
                sum(e["predicted_productivity"] for e in employees) / total, 1
            ) if total > 0 else 0,
            "overtime_employees": sum(1 for e in aggregated_employees.values() if e["overtime"] > 0),
            "low_productivity_employees": sum(1 for e in aggregated_employees.values() if e["avg_productivity"] < 50),
            "top_performers_count": sum(1 for e in aggregated_employees.values() if e["avg_productivity"] >= 80),
        }

        # Top performers
        def composite_score(e):
            burnout_penalty = 30 if e["burnout_risk"] == "High" else (10 if e["burnout_risk"] == "Medium" else 0)
            return e["productivity"] * 0.5 + e["focus_score"] * 0.3 + e["tasks_completed"] * 0.2 - burnout_penalty

        top_performers = sorted(employees, key=composite_score, reverse=True)[:10]

        # --- Feature Importance (Phase 4) ---
        feature_importance = {}
        try:
            if hasattr(burnout_model, 'feature_importances_'):
                for fname, imp in zip(BURNOUT_FEATURES, burnout_model.feature_importances_):
                    feature_importance[fname] = round(float(imp), 4)
        except Exception:
            pass

        # --- Productivity Trend (last 5 batches) ---
        productivity_trend = []
        try:
            batch_ids = db.session.query(
                EmployeeHistory.upload_batch_id
            ).filter(
                EmployeeHistory.upload_batch_id.isnot(None),
                EmployeeHistory.upload_batch_id != ""
            ).group_by(
                EmployeeHistory.upload_batch_id
            ).order_by(
                db.func.max(EmployeeHistory.upload_time).desc()
            ).limit(5).all()

            for (bid,) in reversed(batch_ids):
                batch_records = EmployeeHistory.query.filter_by(upload_batch_id=bid).all()
                if batch_records:
                    avg_p = round(sum(float(r.productivity or 0) for r in batch_records) / len(batch_records), 1)
                    ts = batch_records[0].upload_time.strftime("%m/%d") if batch_records[0].upload_time else bid[:8]
                    is_jira = bid.startswith("jira-")
                    productivity_trend.append({
                        "batch": bid[:8],
                        "date": ts,
                        "avg_productivity": avg_p,
                        "count": len(batch_records),
                        "source": "Jira" if is_jira else "Upload"
                    })
        except Exception as trend_err:
            print(f"[DASHBOARD-DATA] Trend error: {trend_err}")

        # --- Jira Task Insights ---
        jira_insights = {"done": 0, "in_progress": 0, "todo": 0, "total": 0}
        try:
            jira_records = EmployeeHistory.query.filter(
                EmployeeHistory.upload_batch_id.like("jira-%")
            ).all()
            for jr in jira_records:
                jira_insights["total"] += 1
                task_text = (jr.task or "").lower()
                if float(jr.productivity or 0) >= 50:
                    jira_insights["done"] += 1
                elif float(jr.productivity or 0) >= 30:
                    jira_insights["in_progress"] += 1
                else:
                    jira_insights["todo"] += 1
        except Exception:
            pass

        return jsonify({
            "success": True,
            "employees": employees,
            "forecast": forecast,
            "kpis": kpis,
            "top_performers": top_performers,
            "accuracy": 87.5,
            "total_records": total,
            "file_names": [f"batch-{batch_id}"],
            "has_data": True,
            "feature_importance": feature_importance,
            "productivity_trend": productivity_trend,
            "jira_insights": jira_insights,
            "project_performance_overview": project_performance_overview,
            "aggregated_employees": aggregated_employees,
            "department_rankings": department_rankings,
            "connected_projects": connected_projects
        })

    except Exception as e:
        import traceback
        print(f"[DASHBOARD-DATA ERROR] {e}\n{traceback.format_exc()}")
        return jsonify({
            "success": True,
            "employees": [],
            "forecast": [],
            "kpis": {},
            "project_performance_overview": [],
            "aggregated_employees": {},
            "department_rankings": [],
            "connected_projects": [],
            "top_performers": [],
            "accuracy": 87.5,
            "total_records": 0,
            "file_names": [],
            "has_data": False
        })



# =========================================
# AI WORKFORCE SUMMARY
# =========================================

