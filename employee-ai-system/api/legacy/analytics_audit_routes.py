@app.route("/api/historical-analytics", methods=["GET"])
def historical_analytics():
    """
    Return productivity, burnout, and working hours trends.
    Supports ?days=7|30|90 filter.
    """
    try:
        days = int(request.args.get("days", 30))
        if days not in [7, 30, 90]:
            days = 30

        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)

        records = EmployeeHistory.query.filter(
            EmployeeHistory.upload_time >= cutoff
        ).order_by(EmployeeHistory.upload_time.asc()).all()

        if not records:
            return jsonify({"success": True, "has_data": False, "trends": {}})

        # Group by date
        from collections import defaultdict
        daily = defaultdict(lambda: {"prod_sum": 0, "hours_sum": 0, "ot_sum": 0, "high": 0, "med": 0, "low": 0, "count": 0})

        for r in records:
            day_key = r.upload_time.strftime("%Y-%m-%d") if r.upload_time else "unknown"
            d = daily[day_key]
            d["prod_sum"] += float(r.productivity or 0)
            d["hours_sum"] += float(r.working_hours or 0)
            d["ot_sum"] += float(r.overtime_hours or 0)
            b = r.burnout or "Low"
            if b == "High": d["high"] += 1
            elif b == "Medium": d["med"] += 1
            else: d["low"] += 1
            d["count"] += 1

        productivity_trend = []
        burnout_trend = []
        hours_trend = []

        for date_key in sorted(daily.keys()):
            d = daily[date_key]
            cnt = max(d["count"], 1)
            productivity_trend.append({"date": date_key, "avg_productivity": round(d["prod_sum"] / cnt, 1), "count": cnt})
            burnout_trend.append({"date": date_key, "high": d["high"], "medium": d["med"], "low": d["low"]})
            hours_trend.append({"date": date_key, "avg_hours": round(d["hours_sum"] / cnt, 1), "avg_overtime": round(d["ot_sum"] / cnt, 2)})
        # Group by project
        project_daily = defaultdict(lambda: {"prod_sum": 0, "count": 0, "high_burnout": 0})
        for r in records:
            p = r.project or "Unknown"
            project_daily[p]["prod_sum"] += float(r.productivity or 0)
            project_daily[p]["count"] += 1
            if r.burnout == "High":
                project_daily[p]["high_burnout"] += 1

        project_comparison = []
        for p, d in project_daily.items():
            cnt = max(d["count"], 1)
            project_comparison.append({
                "project_name": p,
                "avg_productivity": round(d["prod_sum"] / cnt, 1),
                "total_tasks": d["count"],
                "high_burnout_count": d["high_burnout"]
            })

        project_comparison.sort(key=lambda x: x["avg_productivity"], reverse=True)
        top_performing_project = project_comparison[0] if project_comparison else None
        highest_risk_project = sorted(project_comparison, key=lambda x: x["high_burnout_count"], reverse=True)[0] if project_comparison else None

        return jsonify({
            "success": True,
            "has_data": True,
            "days": days,
            "total_records": len(records),
            "trends": {
                "productivity": productivity_trend,
                "burnout": burnout_trend,
                "hours": hours_trend
            },
            "project_comparison": project_comparison,
            "top_performing_project": top_performing_project,
            "highest_risk_project": highest_risk_project
        })
    except Exception as e:
        print(f"[HISTORICAL ERROR] {e}")
        return jsonify({"success": False, "error": str(e)})


# =========================================
# FEATURE 4: AUDIT LOG PAGE
# =========================================

@app.route("/api/audit-logs", methods=["GET"])
@require_roles("admin")
def get_audit_logs():
    """
    Paginated audit logs with search.
    Supports ?page=1&per_page=20&search=login
    """
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
        search = request.args.get("search", "").strip()

        query = AuditLog.query.order_by(AuditLog.timestamp.desc())

        if search:
            query = query.filter(
                db.or_(
                    AuditLog.action.ilike(f"%{search}%"),
                    AuditLog.user_email.ilike(f"%{search}%"),
                    AuditLog.ip_address.ilike(f"%{search}%"),
                )
            )

        total = query.count()
        logs = query.offset((page - 1) * per_page).limit(per_page).all()

        return jsonify({
            "success": True,
            "logs": [{
                "id": l.id,
                "user_id": l.user_id,
                "user_email": l.user_email or "System",
                "action": l.action,
                "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S") if l.timestamp else "",
                "ip_address": l.ip_address or ""
            } for l in logs],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        })
    except Exception as e:
        print(f"[AUDIT LOGS ERROR] {e}")
        return jsonify({"success": False, "error": str(e)})


# =========================================
# FEATURE 5: NOTIFICATION CENTER
# =========================================

@app.route("/api/notifications", methods=["GET"])
def get_notifications():
    """Get recent notifications, optionally only unread."""
    try:
        unread_only = request.args.get("unread", "false").lower() == "true"
        query = Notification.query.order_by(Notification.created_at.desc())
        if unread_only:
            query = query.filter_by(read=False)
        notifications = query.limit(50).all()

        return jsonify({
            "success": True,
            "notifications": [{
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message or "",
                "severity": n.severity,
                "read": n.read,
                "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S") if n.created_at else ""
            } for n in notifications],
            "unread_count": Notification.query.filter_by(read=False).count()
        })
    except Exception as e:
        print(f"[NOTIFICATIONS ERROR] {e}")
        return jsonify({"success": False, "notifications": [], "unread_count": 0})


@app.route("/api/notifications/mark-read", methods=["POST"])
def mark_notifications_read():
    """Mark specific or all notifications as read."""
    try:
        data = request.get_json() or {}
        nid = data.get("id")

        if nid:
            n = Notification.query.get(nid)
            if n:
                n.read = True
        else:
            Notification.query.filter_by(read=False).update({"read": True})

        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)})


# =========================================
# FEATURE 6: AI WORKFORCE COPILOT
# =========================================

