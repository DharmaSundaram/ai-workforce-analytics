def build_notification(ntype, title, message="", severity="info"):
    return {
        "type": ntype,
        "title": title,
        "message": message,
        "severity": severity,
    }

