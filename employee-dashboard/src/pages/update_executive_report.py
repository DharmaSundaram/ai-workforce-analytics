import re

filepath = r"c:\Users\DHARMA\inten_1\employee-ai-system\app.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_exec_logic = """        # Top/Bottom performers
        sorted_by_prod = sorted(records, key=lambda r: float(r.productivity or 0), reverse=True)
        top_5 = [{"name": r.employee_name, "productivity": float(r.productivity or 0), "project": r.project} for r in sorted_by_prod[:5]]
        bottom_5 = [{"name": r.employee_name, "productivity": float(r.productivity or 0), "project": r.project} for r in sorted_by_prod[-5:]]

        # Jira summary"""

new_exec_logic = """        # Top/Bottom performers
        sorted_by_prod = sorted(records, key=lambda r: float(r.productivity or 0), reverse=True)
        top_5 = [{"name": r.employee_name, "productivity": float(r.productivity or 0), "project": r.project} for r in sorted_by_prod[:5]]
        bottom_5 = [{"name": r.employee_name, "productivity": float(r.productivity or 0), "project": r.project} for r in sorted_by_prod[-5:]]

        # Group by project
        projects = {}
        for r in records:
            p = r.project or "Unknown"
            if p not in projects:
                projects[p] = {"prod_sum": 0, "count": 0, "high_burnout": 0, "hours_sum": 0}
            projects[p]["prod_sum"] += float(r.productivity or 0)
            projects[p]["count"] += 1
            projects[p]["hours_sum"] += float(r.working_hours or 0)
            if r.burnout == "High":
                projects[p]["high_burnout"] += 1
                
        project_summary = []
        for pname, pdata in projects.items():
            project_summary.append({
                "project_name": pname,
                "avg_productivity": round(pdata["prod_sum"] / pdata["count"], 1),
                "avg_hours": round(pdata["hours_sum"] / pdata["count"], 1),
                "high_burnout_count": pdata["high_burnout"],
                "employee_count": pdata["count"]
            })

        # Jira summary"""

content = content.replace(old_exec_logic, new_exec_logic)

old_exec_report = """            "top_performers": top_5,
            "needs_improvement": bottom_5,
            "jira": {"""

new_exec_report = """            "top_performers": top_5,
            "needs_improvement": bottom_5,
            "projects_summary": project_summary,
            "jira": {"""

content = content.replace(old_exec_report, new_exec_report)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated executive report endpoint in app.py successfully.")
