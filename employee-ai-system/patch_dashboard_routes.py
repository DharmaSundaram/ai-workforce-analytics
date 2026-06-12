import os

file_path = "api/legacy/dashboard_routes.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add global summary endpoint
global_summary_code = """
# =========================================
# GLOBAL DASHBOARD SUMMARY
# =========================================

@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_global_summary():
    \"\"\"
    Returns the real-time global counts for all employees across all 
    Jira projects and imported datasets.
    \"\"\"
    try:
        # Get all records
        records = EmployeeHistory.query.all()
        
        unique_employees = {}
        for rec in records:
            name = rec.employee_name or "Unknown"
            if name not in unique_employees:
                unique_employees[name] = {
                    "productivity_sum": 0,
                    "task_count": 0,
                    "hours": 0,
                    "burnout_high": 0
                }
            
            emp = unique_employees[name]
            emp["productivity_sum"] += float(rec.productivity or 0)
            emp["task_count"] += 1
            emp["hours"] += float(rec.working_hours or 0)
            if rec.burnout == "High":
                emp["burnout_high"] += 1

        total_employees = len(unique_employees)
        active_employees = 0
        top_performers = 0
        need_help = 0

        for name, stats in unique_employees.items():
            if stats["hours"] > 0:
                active_employees += 1
            
            avg_prod = stats["productivity_sum"] / stats["task_count"] if stats["task_count"] > 0 else 0
            
            if avg_prod >= 80:
                top_performers += 1
            if avg_prod < 50 or stats["burnout_high"] > 0:
                need_help += 1

        return jsonify({
            "success": True,
            "totalEmployees": total_employees,
            "activeEmployees": active_employees,
            "topPerformers": top_performers,
            "needHelp": need_help
        })
    except Exception as e:
        import traceback
        print(f"[DASHBOARD SUMMARY ERROR] {e}\\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": str(e),
            "totalEmployees": 0,
            "activeEmployees": 0,
            "topPerformers": 0,
            "needHelp": 0
        }), 500
"""

if "/api/dashboard/summary" not in content:
    content = content.replace("# AI WORKFORCE SUMMARY", global_summary_code + "\n\n# AI WORKFORCE SUMMARY")

# 2. Update productivity_trend
old_trend = """                    avg_p = round(sum(float(r.productivity or 0) for r in batch_records) / len(batch_records), 1)
                    ts = batch_records[0].upload_time.strftime("%m/%d") if batch_records[0].upload_time else bid[:8]
                    is_jira = bid.startswith("jira-")
                    productivity_trend.append({
                        "batch": bid[:8],
                        "date": ts,
                        "avg_productivity": avg_p,
                        "count": len(batch_records),
                        "source": "Jira" if is_jira else "Upload"
                    })"""

new_trend = """                    avg_p = round(sum(float(r.productivity or 0) for r in batch_records) / len(batch_records), 1)
                    high_burnout = sum(1 for r in batch_records if r.burnout == "High")
                    burnout_score = round((high_burnout / len(batch_records)) * 100, 1)
                    health_score = round((avg_p * 0.6) + ((100 - burnout_score) * 0.4), 1)
                    ts = batch_records[0].upload_time.strftime("%m/%d") if batch_records[0].upload_time else bid[:8]
                    is_jira = bid.startswith("jira-")
                    productivity_trend.append({
                        "batch": bid[:8],
                        "date": ts,
                        "avg_productivity": avg_p,
                        "burnout_score": burnout_score,
                        "health_score": health_score,
                        "count": len(batch_records),
                        "source": "Jira" if is_jira else "Upload"
                    })"""

if old_trend in content:
    content = content.replace(old_trend, new_trend)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done patching.")
