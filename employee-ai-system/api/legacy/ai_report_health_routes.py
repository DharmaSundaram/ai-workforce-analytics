@app.route("/api/copilot", methods=["POST"])
def ai_copilot():
    """
    Rule-based workforce Q&A chatbot.
    Uses existing dashboard data to answer questions.
    """
    try:
        data = request.get_json() or {}
        question = (data.get("question") or "").strip().lower()

        if not question:
            return jsonify({"success": True, "answer": "Please ask a question about your workforce data."})

        # Get latest batch data
        latest = db.session.query(EmployeeHistory.upload_batch_id)\
            .filter(EmployeeHistory.upload_batch_id.isnot(None))\
            .order_by(EmployeeHistory.upload_time.desc()).first()

        if not latest or not latest[0]:
            return jsonify({"success": True, "answer": "No data available. Please upload a dataset first."})

        records = EmployeeHistory.query.filter_by(upload_batch_id=latest[0]).all()
        if not records:
            return jsonify({"success": True, "answer": "No employee records found."})

        # Build employee data
        employees = []
        for r in records:
            employees.append({
                "name": r.employee_name or "Unknown",
                "project": r.project or "",
                "productivity": float(r.productivity or 0),
                "burnout": r.burnout or "Low",
                "hours": float(r.working_hours or 0),
                "overtime": float(r.overtime_hours or 0),
            })

        total = len(employees)
        avg_prod = round(sum(e["productivity"] for e in employees) / total, 1) if total else 0
        high_burnout = [e for e in employees if e["burnout"] == "High"]
        med_burnout = [e for e in employees if e["burnout"] == "Medium"]
        low_prod = sorted(employees, key=lambda e: e["productivity"])
        high_prod = sorted(employees, key=lambda e: e["productivity"], reverse=True)
        high_ot = sorted(employees, key=lambda e: e["overtime"], reverse=True)

        # Projects
        projects = {}
        for e in employees:
            p = e["project"] or "Unknown"
            if p not in projects:
                projects[p] = {"prod_sum": 0, "count": 0, "high_burnout": 0}
            projects[p]["prod_sum"] += e["productivity"]
            projects[p]["count"] += 1
            if e["burnout"] == "High":
                projects[p]["high_burnout"] += 1

        answer = ""

        # Pattern matching
        if any(kw in question for kw in ["highest productivity project", "most productive project", "best project"]):
            proj_stats = []
            for pname, pdata in projects.items():
                avg = round(pdata["prod_sum"] / pdata["count"], 1)
                proj_stats.append({"name": pname, "avg_prod": avg})
            top_p = sorted(proj_stats, key=lambda x: x["avg_prod"], reverse=True)
            if top_p:
                answer = f"🌟 The highest productivity project is **{top_p[0]['name']}** with an average productivity of {top_p[0]['avg_prod']}%."
            else:
                answer = "No project data available."
                
        elif any(kw in question for kw in ["highest burnout project", "most stressed project", "worst burnout project"]):
            proj_stats = []
            for pname, pdata in projects.items():
                proj_stats.append({"name": pname, "high_burnout": pdata["high_burnout"]})
            top_b = sorted(proj_stats, key=lambda x: x["high_burnout"], reverse=True)
            if top_b and top_b[0]["high_burnout"] > 0:
                answer = f"⚠️ The project with the highest burnout risk is **{top_b[0]['name']}** with {top_b[0]['high_burnout']} employees at high risk."
            else:
                answer = "✅ No projects have high burnout risk."

        elif any(kw in question for kw in ["lowest productivity", "least productive", "worst performance", "low productivity"]):
            bottom = low_prod[:5]
            lines = [f"  • {e['name']} — {e['productivity']}% ({e['project']})" for e in bottom]
            answer = f"📉 Lowest productivity employees:\n" + "\n".join(lines)

        elif any(kw in question for kw in ["highest productivity", "most productive", "best performance", "top performer"]):
            top = high_prod[:5]
            lines = [f"  • {e['name']} — {e['productivity']}% ({e['project']})" for e in top]
            answer = f"🌟 Top performing employees:\n" + "\n".join(lines)

        elif any(kw in question for kw in ["high burnout", "burnout risk", "stressed", "at risk"]):
            if high_burnout:
                lines = [f"  • {e['name']} — {e['hours']}h, {e['overtime']}h OT ({e['project']})" for e in high_burnout[:8]]
                answer = f"⚠️ {len(high_burnout)} employee(s) with HIGH burnout:\n" + "\n".join(lines)
            else:
                answer = "✅ No employees with high burnout risk currently."

        elif any(kw in question for kw in ["compare all projects", "compare projects", "project health report", "project report", "department", "project", "team", "which department", "needs attention"]):
            proj_stats = []
            for pname, pdata in projects.items():
                avg = round(pdata["prod_sum"] / pdata["count"], 1)
                proj_stats.append({"name": pname, "avg_prod": avg, "count": pdata["count"], "high_burnout": pdata["high_burnout"]})
            proj_stats.sort(key=lambda x: x["avg_prod"], reverse=True)
            lines = [f"  • {p['name']} — Avg Productivity: {p['avg_prod']}%, {p['count']} members, {p['high_burnout']} high burnout risk" for p in proj_stats]
            answer = f"📊 Project Health Report & Comparison:\n" + "\n".join(lines)
            worst = proj_stats[-1] if proj_stats else None
            if worst and worst["avg_prod"] < 60:
                answer += f"\n\n⚠️ '{worst['name']}' needs attention (Lowest productivity: {worst['avg_prod']}%)"
                
        elif any(kw in question for kw in ["top performers by project", "burnout by project"]):
            answer = "🏆 Top Performers by Project:\n"
            for pname in projects.keys():
                p_emps = [e for e in employees if e["project"] == pname]
                top_p = sorted(p_emps, key=lambda e: e["productivity"], reverse=True)
                burn_p = [e for e in p_emps if e["burnout"] == "High"]
                if top_p:
                    answer += f"\n{pname}:\n  • Top: {top_p[0]['name']} ({top_p[0]['productivity']}%)\n  • High Burnout Risks: {len(burn_p)}"
            
        elif any(kw in question for kw in ["overtime", "overwork", "extra hours"]):
            top_ot = [e for e in high_ot if e["overtime"] > 0][:5]
            if top_ot:
                lines = [f"  • {e['name']} — {e['overtime']}h OT ({e['project']})" for e in top_ot]
                answer = f"⏰ Employees with most overtime:\n" + "\n".join(lines)
            else:
                answer = "✅ No employees with significant overtime."

        elif any(kw in question for kw in ["summary", "overview", "how is the team", "status"]):
            answer = (
                f"📈 Team Summary ({total} employees):\n"
                f"  • Average Productivity: {avg_prod}%\n"
                f"  • High Burnout: {len(high_burnout)} employees\n"
                f"  • Medium Burnout: {len(med_burnout)} employees\n"
                f"  • Projects: {len(projects)}\n"
                f"  • Avg Hours: {round(sum(e['hours'] for e in employees) / total, 1)}h"
            )

        elif any(kw in question for kw in ["how many", "total", "count"]):
            answer = f"📊 Current dataset has {total} employee records across {len(projects)} projects."

        elif any(kw in question for kw in ["help", "what can you"]):
            answer = (
                "🤖 I can help you with:\n"
                "  • \"Who has lowest productivity?\"\n"
                "  • \"Show high burnout employees\"\n"
                "  • \"Which department needs attention?\"\n"
                "  • \"Show top performers\"\n"
                "  • \"Who has the most overtime?\"\n"
                "  • \"Give me a team summary\"\n"
                "  • \"How many employees?\""
            )

        else:
            answer = (
                f"🤖 I'm not sure about that. Here's a quick summary:\n"
                f"  • {total} employees, avg productivity {avg_prod}%\n"
                f"  • {len(high_burnout)} high burnout, {len(med_burnout)} medium burnout\n\n"
                f"Try asking: \"Who has lowest productivity?\" or \"Show high burnout employees\""
            )

        return jsonify({"success": True, "answer": answer})

    except Exception as e:
        print(f"[COPILOT ERROR] {e}")
        return jsonify({"success": True, "answer": f"Error processing question: {str(e)}"})


# =========================================
# FEATURE 7: EXECUTIVE REPORT DATA
# =========================================

@app.route("/api/executive-report", methods=["GET"])
def executive_report():
    """
    Generate executive report data (JSON).
    Frontend will render this into PDF.
    """
    try:
        jira_record_count = EmployeeHistory.query.filter(
            EmployeeHistory.upload_batch_id.like("jira-%")
        ).count()
        if jira_record_count:
            records = EmployeeHistory.query.filter(
                EmployeeHistory.upload_batch_id.like("jira-%")
            ).all()
        else:
            latest = db.session.query(EmployeeHistory.upload_batch_id)\
                .filter(EmployeeHistory.upload_batch_id.isnot(None))\
                .order_by(EmployeeHistory.upload_time.desc()).first()

            if not latest:
                return jsonify({"success": False, "error": "No data available"})

            records = EmployeeHistory.query.filter_by(upload_batch_id=latest[0]).all()
        total = len(records)

        if total == 0:
            return jsonify({"success": False, "error": "No records found"})

        # Stats
        prods = [float(r.productivity or 0) for r in records]
        hours_list = [float(r.working_hours or 0) for r in records]
        ot_list = [float(r.overtime_hours or 0) for r in records]

        burnout_counts = {"High": 0, "Medium": 0, "Low": 0}
        for r in records:
            b = r.burnout or "Low"
            burnout_counts[b] = burnout_counts.get(b, 0) + 1

        # Top/Bottom performers
        sorted_by_prod = sorted(records, key=lambda r: float(r.productivity or 0), reverse=True)
        top_5 = [{"name": r.employee_name, "productivity": float(r.productivity or 0), "project": r.project_name or r.project, "department": r.department or "Unknown"} for r in sorted_by_prod[:5]]
        bottom_5 = [{"name": r.employee_name, "productivity": float(r.productivity or 0), "project": r.project_name or r.project, "department": r.department or "Unknown"} for r in sorted_by_prod[-5:]]

        # Group by project
        projects = {}
        for r in records:
            p = r.project_name or r.project or "Unknown"
            if p not in projects:
                projects[p] = {"prod_sum": 0, "count": 0, "high_burnout": 0, "hours_sum": 0, "employees": set()}
            projects[p]["prod_sum"] += float(r.productivity or 0)
            projects[p]["count"] += 1
            projects[p]["hours_sum"] += float(r.working_hours or 0)
            projects[p]["employees"].add(r.employee_name or "Unknown")
            if r.burnout == "High":
                projects[p]["high_burnout"] += 1

        departments = {}
        for r in records:
            dept = r.department or "Unknown"
            if dept not in departments:
                departments[dept] = {"prod_sum": 0, "burnout_sum": 0, "focus_sum": 0, "hours_sum": 0, "count": 0, "employees": set(), "high_burnout": 0}
            departments[dept]["prod_sum"] += float(r.productivity or 0)
            departments[dept]["burnout_sum"] += 100 if r.burnout == "High" else (50 if r.burnout == "Medium" else 0)
            departments[dept]["hours_sum"] += float(r.working_hours or 0)
            departments[dept]["count"] += 1
            departments[dept]["employees"].add(r.employee_name or "Unknown")
            if r.burnout == "High":
                departments[dept]["high_burnout"] += 1
                
        project_summary = []
        for pname, pdata in projects.items():
            project_summary.append({
                "project_name": pname,
                "avg_productivity": round(pdata["prod_sum"] / pdata["count"], 1),
                "avg_hours": round(pdata["hours_sum"] / pdata["count"], 1),
                "high_burnout_count": pdata["high_burnout"],
                "employee_count": len(pdata["employees"])
            })

        department_summary = []
        for dept, ddata in departments.items():
            cnt = ddata["count"]
            avg_prod = ddata["prod_sum"] / cnt if cnt else 0
            avg_burnout = ddata["burnout_sum"] / cnt if cnt else 0
            health_score = (avg_prod * 0.55) + ((100 - avg_burnout) * 0.45)
            department_summary.append({
                "department_name": dept,
                "health_score": round(health_score, 1),
                "employee_count": len(ddata["employees"]),
                "average_productivity": round(avg_prod, 1),
                "average_burnout": round(avg_burnout, 1),
                "average_hours": round(ddata["hours_sum"] / cnt, 1) if cnt else 0,
                "burnout_risk": "High" if ddata["high_burnout"] else ("Medium" if avg_burnout > 0 else "Low")
            })
        department_summary.sort(key=lambda d: d["health_score"], reverse=True)
        for idx, dept in enumerate(department_summary, start=1):
            dept["rank"] = idx

        # Jira summary
        jira_records = EmployeeHistory.query.filter(EmployeeHistory.upload_batch_id.like("jira-%")).count()
        last_jira = JiraSyncLog.query.order_by(JiraSyncLog.sync_time.desc()).first()

        report = {
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "total_employees": total,
            "productivity": {
                "average": round(sum(prods) / total, 1),
                "max": round(max(prods), 1),
                "min": round(min(prods), 1),
                "above_80": len([p for p in prods if p >= 80]),
                "below_50": len([p for p in prods if p < 50]),
            },
            "burnout": burnout_counts,
            "workload": {
                "avg_hours": round(sum(hours_list) / total, 1),
                "avg_overtime": round(sum(ot_list) / total, 2),
                "max_overtime": round(max(ot_list), 2),
                "overtime_employees": len([o for o in ot_list if o > 0]),
            },
            "top_performers": top_5,
            "needs_improvement": bottom_5,
            "projects_summary": project_summary,
            "departments_summary": department_summary,
            "jira": {
                "total_synced_records": jira_records,
                "last_sync": last_jira.sync_time.strftime("%Y-%m-%d %H:%M:%S") if last_jira else "Never",
                "last_status": last_jira.status if last_jira else "N/A",
            },
            "recommendations": [],
        }

        # Generate executive recommendations
        if burnout_counts["High"] > 0:
            report["recommendations"].append(f"⚠️ {burnout_counts['High']} employees at high burnout risk — immediate intervention needed")
        if report["productivity"]["below_50"] > 0:
            report["recommendations"].append(f"📉 {report['productivity']['below_50']} employees below 50% productivity — training recommended")
        if report["workload"]["avg_overtime"] > 1:
            report["recommendations"].append(f"⏰ Average overtime {report['workload']['avg_overtime']}h — workload redistribution needed")
        if report["productivity"]["average"] >= 70:
            report["recommendations"].append(f"✅ Team productivity is strong at {report['productivity']['average']}%")
        if burnout_counts["High"] == 0 and burnout_counts["Medium"] == 0:
            report["recommendations"].append("✅ No significant burnout risk across the team")

        create_audit("executive_report", status="success")
        db.session.commit()
        return jsonify({"success": True, "report": report})

    except Exception as e:
        print(f"[EXECUTIVE REPORT ERROR] {e}")
        return jsonify({"success": False, "error": str(e)})


# =========================================
# SYSTEM HEALTH CHECK
# =========================================

@app.route("/api/system-health", methods=["GET"])
def system_health():
    """Real-time system health status."""
    health = {}

    # Backend
    health["backend"] = {"status": "connected", "ok": True}

    # Database
    try:
        db.session.execute(db.text("SELECT 1"))
        health["database"] = {"status": "connected", "ok": True}
    except Exception as e:
        health["database"] = {"status": f"error: {e}", "ok": False}

    # ML Models
    models_ok = os.path.exists("ml/productivity/model.pkl") and os.path.exists("ml/burnout/model.pkl")
    health["ml_model"] = {"status": "active" if models_ok else "no models found", "ok": models_ok}

    # Jira
    try:
        creds = get_jira_credentials()
        jira_ok = bool(creds.get("url") and creds.get("email") and creds.get("token"))
        health["jira"] = {"status": "configured" if jira_ok else "not configured", "ok": jira_ok}
    except:
        health["jira"] = {"status": "not configured", "ok": False}

    # Scheduler
    try:
        from scheduler import scheduler
        running = scheduler.running if hasattr(scheduler, 'running') else False
        health["scheduler"] = {"status": "running" if running else "idle", "ok": True}
    except:
        health["scheduler"] = {"status": "available", "ok": True}

    all_ok = all(v["ok"] for v in health.values())
    return jsonify({"success": True, "healthy": all_ok, "services": health})


# =========================================
# RUN APP
# =========================================

def ensure_employee_history_enterprise_columns():
    required_columns = {
        "project_id": "VARCHAR(100)",
        "project_key": "VARCHAR(100)",
        "project_name": "VARCHAR(255)",
        "department": "VARCHAR(100)",
        "status": "VARCHAR(50)",
    }

    existing = db.session.execute(db.text("PRAGMA table_info(employee_history)")).fetchall()
    existing_names = {row[1] for row in existing}

    for column, data_type in required_columns.items():
        if column not in existing_names:
            db.session.execute(db.text(f"ALTER TABLE employee_history ADD COLUMN {column} {data_type}"))

    db.session.commit()


def ensure_user_security_columns():
    required_columns = {
        "role": "VARCHAR(50)",
        "password_reset_token_hash": "VARCHAR(256)",
        "password_reset_expires_at": "DATETIME",
        "password_reset_used_at": "DATETIME",
    }

    existing = db.session.execute(db.text("PRAGMA table_info(user)")).fetchall()
    existing_names = {row[1] for row in existing}

    for column, data_type in required_columns.items():
        if column not in existing_names:
            db.session.execute(db.text(f"ALTER TABLE user ADD COLUMN {column} {data_type}"))

    db.session.commit()


def encrypt_existing_jira_token():
    settings = Settings.query.first()
    if settings and settings.jira_api_token and not settings.jira_api_token.startswith("fernet:"):
        settings.jira_api_token = encrypt_secret(settings.jira_api_token)
        db.session.commit()

if __name__ == "__main__":

    with app.app_context():
        db.create_all()
        ensure_employee_history_enterprise_columns()
        ensure_user_security_columns()
        encrypt_existing_jira_token()
        from scheduler import set_jira_sync_app
        set_jira_sync_app(app)

    app.run(debug=True, host="0.0.0.0", port=5000)
