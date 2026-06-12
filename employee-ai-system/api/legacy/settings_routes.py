@app.route("/api/settings", methods=["GET"])
@require_roles("admin", "manager")
def get_settings_api():
    """
    Get current Jira settings.
    Token is masked in the response for security.
    """
    try:
        settings = get_settings()
        creds = get_jira_credentials()

        # Mask token: show only last 4 chars
        token_display = ""
        if creds['token']:
            token_display = "•" * 20 + creds['token'][-4:] if len(creds['token']) > 4 else "•" * len(creds['token'])

        # Fetch discovered projects
        projects = JiraProject.query.filter_by(is_active=True).all()
        connected_projects = [{
            "id": p.id,
            "project_key": p.project_key,
            "project_name": p.project_name,
            "project_type": p.project_type,
            "is_synced": p.is_synced,
            "last_sync": p.last_sync.isoformat() if p.last_sync else None,
            "last_sync_records": p.last_sync_records
        } for p in projects]

        return jsonify({
            "success": True,
            "settings": {
                "jira_url": creds['url'],
                "jira_email": creds['email'],
                "jira_api_token_masked": token_display,
                "auto_sync_interval": creds['auto_sync_interval'],
                "connected_projects": connected_projects,
                "updated_at": settings.updated_at.isoformat() if settings.updated_at else None,
                "source": "database" if (settings.jira_url or '').strip() else "env_fallback"
            }
        })
    except Exception as e:
        print(f"[SETTINGS GET ERROR] {e}")
        return jsonify({"success": False, "error": str(e)})


@app.route("/api/settings", methods=["PUT"])
@require_roles("admin")
def update_settings_api():
    """
    Save Jira settings to SQLite.
    If token field is all dots (masked), keep the existing token.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        settings = get_settings()

        # Update fields if provided
        if 'jira_url' in data:
            jira_url = data['jira_url'].strip()
            if jira_url and not valid_http_url(jira_url):
                return jsonify({"success": False, "error": "Jira URL must be a valid http(s) URL"}), 400
            settings.jira_url = jira_url
        if 'jira_email' in data:
            jira_email = data['jira_email'].strip()
            if jira_email and not valid_email(jira_email):
                return jsonify({"success": False, "error": "Jira email is invalid"}), 400
            settings.jira_email = jira_email
        if 'auto_sync_interval' in data:
            try:
                interval = int(data['auto_sync_interval'])
            except (TypeError, ValueError):
                return jsonify({"success": False, "error": "Auto-sync interval must be a number"}), 400
            settings.auto_sync_interval = max(5, min(1440, interval))

        # Only update token if it's a real value (not masked dots)
        if 'jira_api_token' in data:
            token_val = data['jira_api_token'].strip()
            if token_val and not is_masked_secret(token_val):
                settings.jira_api_token = encrypt_secret(token_val)

        settings.updated_at = datetime.utcnow()
        create_audit("settings_update", status="success")
        db.session.commit()

        print(f"[SETTINGS] Updated by user at {datetime.utcnow()}")

        return jsonify({
            "success": True,
            "message": "Settings saved successfully"
        })
    except Exception as e:
        print(f"[SETTINGS PUT ERROR] {e}")
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/test-jira-connection", methods=["POST"])
@require_roles("admin", "manager")
def test_jira_connection_api():
    """
    Test Jira connection using provided credentials or saved settings.
    Accepts optional credentials in the request body; otherwise uses saved settings.
    """
    try:
        from jira import JIRA

        data = request.get_json() or {}

        # Use provided credentials or fall back to saved settings
        creds = get_jira_credentials()
        url = data.get('jira_url', '').strip() or creds['url']
        email = data.get('jira_email', '').strip() or creds['email']
        token = data.get('jira_api_token', '').strip()
        if is_masked_secret(token):
            token = ""

        # If token is masked or empty, use saved token
        if not token or token.startswith("•"):
            token = creds['token']

        if not url or not email or not token:
            return jsonify({
                "success": False,
                "connected": False,
                "message": "Jira URL, Email, and API Token are required"
            })

        # Test connection
        jira = JIRA(server=url, basic_auth=(email, token))
        user_info = jira.myself()

        # Auto-discover projects
        projects = jira.projects()
        discovered_count = len(projects)
        
        # Save to database
        for proj in projects:
            existing = JiraProject.query.filter_by(project_key=proj.key).first()
            project_type_key = getattr(proj, 'projectTypeKey', 'software')
            if not existing:
                new_proj = JiraProject(
                    project_key=proj.key,
                    project_name=proj.name,
                    project_type=project_type_key
                )
                db.session.add(new_proj)
            else:
                existing.project_name = proj.name
                existing.project_type = project_type_key
                existing.is_active = True
                
        db.session.commit()

        project_msg = f" Discovered {discovered_count} accessible projects."

        return jsonify({
            "success": True,
            "connected": True,
            "message": f"Connected successfully as {user_info.get('displayName', email)}.{project_msg}"
        })

    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Unauthorized" in error_msg:
            error_msg = "Invalid Jira credentials. Please check your email and API token."
        elif "403" in error_msg:
            error_msg = "Access forbidden. Check your Jira permissions."
        elif "404" in error_msg:
            error_msg = "Jira URL not found. Please verify the URL."
        elif "connect" in error_msg.lower() or "resolve" in error_msg.lower():
            error_msg = f"Cannot connect to Jira server. Check the URL: {error_msg}"

        print(f"[JIRA CONNECTION TEST] Failed: {e}")
        return jsonify({
            "success": True,
            "connected": False,
            "message": error_msg
        })


@app.route("/api/settings/sync-now", methods=["POST"])
@require_roles("admin", "manager")
def settings_sync_now():
    """
    Trigger an immediate Jira sync using the current saved settings.
    """
    try:
        from services.jira import jira_sync
        creds = get_jira_credentials()

        if not creds['url'] or not creds['email'] or not creds['token']:
            return jsonify({
                "success": False,
                "error": "Jira credentials are not configured. Please save settings first."
            })

        result = jira_sync.sync_jira_data(db, EmployeeHistory, credentials=creds)
        create_audit("settings_sync_now", status="success" if result.get("success") else "failed")
        db.session.commit()
        return jsonify(result)
    except Exception as e:
        print(f"[SETTINGS SYNC NOW ERROR] {e}")
        return jsonify({"success": False, "error": str(e)})


