import re

filepath = r"c:\Users\DHARMA\inten_1\employee-ai-system\app.py"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_copilot_logic = """        elif any(kw in question for kw in ["department", "project", "team", "which department", "needs attention"]):
            proj_stats = []
            for pname, pdata in projects.items():
                avg = round(pdata["prod_sum"] / pdata["count"], 1)
                proj_stats.append({"name": pname, "avg_prod": avg, "count": pdata["count"], "high_burnout": pdata["high_burnout"]})
            proj_stats.sort(key=lambda x: x["avg_prod"])
            lines = [f"  • {p['name']} — Avg: {p['avg_prod']}%, {p['count']} members, {p['high_burnout']} high burnout" for p in proj_stats[:5]]
            answer = f"📊 Department/Project analysis:\\n" + "\\n".join(lines)
            if proj_stats[0]["avg_prod"] < 50:
                answer += f"\\n\\n⚠️ '{proj_stats[0]['name']}' needs attention ({proj_stats[0]['avg_prod']}% avg productivity)"

        elif any(kw in question for kw in ["overtime", "overwork", "extra hours"]):"""

new_copilot_logic = """        elif any(kw in question for kw in ["compare projects", "department", "project", "team", "which department", "needs attention"]):
            proj_stats = []
            for pname, pdata in projects.items():
                avg = round(pdata["prod_sum"] / pdata["count"], 1)
                proj_stats.append({"name": pname, "avg_prod": avg, "count": pdata["count"], "high_burnout": pdata["high_burnout"]})
            proj_stats.sort(key=lambda x: x["avg_prod"], reverse=True)
            lines = [f"  • {p['name']} — Avg Productivity: {p['avg_prod']}%, {p['count']} members, {p['high_burnout']} high burnout risk" for p in proj_stats]
            answer = f"📊 Project Comparison:\\n" + "\\n".join(lines)
            worst = proj_stats[-1] if proj_stats else None
            if worst and worst["avg_prod"] < 60:
                answer += f"\\n\\n⚠️ '{worst['name']}' needs attention (Lowest productivity: {worst['avg_prod']}%)"
                
        elif any(kw in question for kw in ["top performers by project", "burnout by project"]):
            answer = "🏆 Top Performers by Project:\\n"
            for pname in projects.keys():
                p_emps = [e for e in employees if e["project"] == pname]
                top_p = sorted(p_emps, key=lambda e: e["productivity"], reverse=True)
                burn_p = [e for e in p_emps if e["burnout"] == "High"]
                if top_p:
                    answer += f"\\n{pname}:\\n  • Top: {top_p[0]['name']} ({top_p[0]['productivity']}%)\\n  • High Burnout Risks: {len(burn_p)}"
            
        elif any(kw in question for kw in ["overtime", "overwork", "extra hours"]):"""

content = content.replace(old_copilot_logic, new_copilot_logic)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated copilot endpoints in app.py successfully.")
