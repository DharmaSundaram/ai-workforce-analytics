@app.route("/api/ai-summary", methods=["GET"])
def ai_summary():
    """
    Generate AI-powered workforce summary from the latest data.
    Returns team health score, insights, and actionable recommendations.
    """
    try:
        jira_record_count = EmployeeHistory.query.filter(
            EmployeeHistory.upload_batch_id.like("jira-%")
        ).count()
        latest = None
        if not jira_record_count:
            latest = db.session.query(EmployeeHistory.upload_batch_id)\
                .filter(EmployeeHistory.upload_batch_id.isnot(None))\
                .filter(EmployeeHistory.upload_batch_id != "")\
                .order_by(EmployeeHistory.upload_time.desc())\
                .first()

        if not jira_record_count and (not latest or not latest[0]):
            return jsonify({
                "success": True,
                "summary": {
                    "text": "No data available. Upload a dataset or sync from Jira to generate AI insights.",
                    "team_health_score": 0,
                    "productivity_avg": 0,
                    "burnout_breakdown": {"High": 0, "Medium": 0, "Low": 0},
                    "needs_improvement": 0,
                    "top_performers": 0,
                    "overtime_count": 0,
                    "insights": [],
                    "has_data": False
                }
            })

        if jira_record_count:
            records = EmployeeHistory.query.filter(
                EmployeeHistory.upload_batch_id.like("jira-%")
            ).all()
        else:
            batch_id = latest[0]
            records = EmployeeHistory.query\
                .filter_by(upload_batch_id=batch_id)\
                .all()

        if not records:
            return jsonify({"success": True, "summary": {"text": "No records found.", "has_data": False}})

        total = len(records)
        productivities = [float(r.productivity or 0) for r in records]
        avg_prod = round(sum(productivities) / total, 1) if total > 0 else 0

        burnout_counts = {"High": 0, "Medium": 0, "Low": 0}
        overtime_count = 0
        needs_improvement = 0
        top_performers = 0
        total_hours_sum = 0
        total_ot_sum = 0

        for r in records:
            b = r.burnout or "Low"
            burnout_counts[b] = burnout_counts.get(b, 0) + 1
            if float(r.overtime_hours or 0) > 0:
                overtime_count += 1
            if float(r.productivity or 0) < 50:
                needs_improvement += 1
            if float(r.productivity or 0) >= 80:
                top_performers += 1
            total_hours_sum += float(r.working_hours or 0)
            total_ot_sum += float(r.overtime_hours or 0)

        avg_hours = round(total_hours_sum / total, 1) if total > 0 else 0
        avg_ot = round(total_ot_sum / total, 1) if total > 0 else 0

        # --- Team Health Score ---
        # Weighted: productivity (40%) + inverse burnout (35%) + work-life balance (25%)
        prod_score = min(100, avg_prod)
        burnout_score = 100 - ((burnout_counts["High"] * 100 + burnout_counts["Medium"] * 50) / max(total, 1))
        balance_score = max(0, 100 - (overtime_count / max(total, 1)) * 100)

        team_health = round(
            prod_score * 0.40 +
            burnout_score * 0.35 +
            balance_score * 0.25,
            1
        )

        # --- Generate Insights ---
        insights = []

        if burnout_counts["High"] > 0:
            insights.append(f"⚠️ {burnout_counts['High']} employee(s) at HIGH burnout risk — immediate action needed")
        elif burnout_counts["Medium"] > 0:
            insights.append(f"📋 {burnout_counts['Medium']} employee(s) show medium burnout risk — consider workload review")
        else:
            insights.append("✅ No high or medium burnout risk detected across the team")

        if needs_improvement > 0:
            pct = round(needs_improvement / total * 100, 0)
            insights.append(f"📉 {needs_improvement} employee(s) ({pct:.0f}%) require productivity improvement (below 50%)")

        if top_performers > 0:
            pct = round(top_performers / total * 100, 0)
            insights.append(f"🌟 {top_performers} top performer(s) ({pct:.0f}%) with productivity ≥ 80%")

        if avg_ot <= 0.5:
            insights.append(f"⏰ Average overtime is {avg_ot}h — team is within healthy limits")
        elif avg_ot <= 1.5:
            insights.append(f"⏰ Average overtime is {avg_ot}h — moderate, monitor closely")
        else:
            insights.append(f"🔴 Average overtime is {avg_ot}h — concerning, consider workload redistribution")

        if avg_prod >= 70:
            insights.append(f"📈 Team productivity ({avg_prod}%) is strong")
        elif avg_prod >= 50:
            insights.append(f"📊 Team productivity ({avg_prod}%) has room for improvement")
        else:
            insights.append(f"📉 Team productivity ({avg_prod}%) is below target — training recommended")

        # --- Summary Text ---
        high_text = f"{burnout_counts['High']} high burnout employee(s) detected" if burnout_counts['High'] > 0 else "No high burnout employees detected"
        summary_text = (
            f"Team productivity is {avg_prod}%. "
            f"{high_text}. "
            f"{needs_improvement} employee(s) require productivity improvement."
        )

        return jsonify({
            "success": True,
            "summary": {
                "text": summary_text,
                "team_health_score": team_health,
                "productivity_avg": avg_prod,
                "burnout_breakdown": burnout_counts,
                "needs_improvement": needs_improvement,
                "top_performers": top_performers,
                "overtime_count": overtime_count,
                "avg_hours": avg_hours,
                "avg_overtime": avg_ot,
                "total_employees": total,
                "insights": insights,
                "has_data": True
            }
        })

    except Exception as e:
        print(f"[AI-SUMMARY ERROR] {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "summary": {"text": "Error generating summary.", "has_data": False}
        })


# =========================================
# SETTINGS MANAGEMENT ROUTES
# =========================================

