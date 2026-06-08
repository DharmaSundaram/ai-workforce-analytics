@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json
        identifier = data.get("identifier", "").strip()
        password = data.get("password", "")
        
        # Also support legacy username/password format
        if not identifier:
            identifier = data.get("username", "").strip()
        if not password:
            password = data.get("password", "")
        
        if not identifier or not password:
            return jsonify({"success": False, "message": "Please provide email/phone and password"})
        
        user = None
        if "@" in identifier:
            user = User.query.filter_by(email=identifier).first()
        else:
            user = User.query.filter_by(phone=identifier).first()
            if not user:
                user = User.query.filter_by(email=identifier).first()
        
        if not user:
            return jsonify({"success": False, "message": "Account not found. Please register first."})
        
        is_valid = verify_password(user.password_hash, password)

        if not is_valid:
            return jsonify({"success": False, "message": "Invalid password"})
        
        remember = bool(data.get("remember"))
        expires_delta = timedelta(days=30) if remember else timedelta(hours=8)
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role or "viewer"},
            expires_delta=expires_delta
        )

        user.last_login = datetime.utcnow()
        
        audit = AuditLog(
            user_id=user.id,
            user_email=user.email,
            action='login',
            ip_address=request.remote_addr
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            }
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.json
        full_name = data.get("full_name", "").strip()
        email = data.get("email", "").strip().lower() if data.get("email") else None
        phone = data.get("phone", "").strip() if data.get("phone") else None
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")
        
        if not full_name:
            return jsonify({"success": False, "message": "Full name is required"})
        if not email and not phone:
            return jsonify({"success": False, "message": "Email or phone number is required"})
        if not password or len(password) < 8:
            return jsonify({"success": False, "message": "Password must be at least 8 characters"})
        if password != confirm_password:
            return jsonify({"success": False, "message": "Passwords do not match"})
        
        if email:
            if User.query.filter_by(email=email).first():
                return jsonify({"success": False, "message": "An account with this email already exists"})
        if phone:
            if User.query.filter_by(phone=phone).first():
                return jsonify({"success": False, "message": "An account with this phone number already exists"})
        
        hashed_pw = hash_password(password)

        user = User(
            full_name=full_name,
            email=email,
            phone=phone,
            password_hash=hashed_pw,
            role="admin"  # Defaulting to admin for simplicity in this MVP
        )
        db.session.add(user)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Registration successful. Please login."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/logout", methods=["POST"])
def logout():
    try:
        data = request.json or {}
        user_id = data.get("user_id")
        user_email = data.get("email")
        
        audit = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action='logout',
            ip_address=request.remote_addr
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Logged out successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/profile", methods=["GET"])
def get_profile():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"success": False, "message": "User ID required"})
        
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"success": False, "message": "User not found"})
        
        # Get audit logs
        logs = AuditLog.query.filter_by(user_id=user.id).order_by(AuditLog.timestamp.desc()).limit(20).all()
        audit_logs = [{
            "action": log.action,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "ip_address": log.ip_address or ""
        } for log in logs]
        
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "",
                "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else ""
            },
            "audit_logs": audit_logs
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    try:
        data = request.json
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"success": False, "message": "User ID required"})
        
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"success": False, "message": "User not found"})
        
        if data.get("full_name"):
            user.full_name = data["full_name"].strip()
        if data.get("email"):
            email = data["email"].strip().lower()
            existing = User.query.filter(User.email == email, User.id != user.id).first()
            if existing:
                return jsonify({"success": False, "message": "Email already in use"})
            user.email = email
        if data.get("phone"):
            phone = data["phone"].strip()
            existing = User.query.filter(User.phone == phone, User.id != user.id).first()
            if existing:
                return jsonify({"success": False, "message": "Phone number already in use"})
            user.phone = phone
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/change-password", methods=["POST"])
def change_password():
    try:
        data = request.json
        user_id = data.get("user_id")
        old_password = data.get("old_password", "")
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")
        
        if not user_id:
            return jsonify({"success": False, "message": "User ID required"})
        
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"success": False, "message": "User not found"})
        
        if not verify_password(user.password_hash, old_password):
            return jsonify({"success": False, "message": "Current password is incorrect"})
        
        if len(new_password) < 8:
            return jsonify({"success": False, "message": "New password must be at least 8 characters"})
        
        if new_password != confirm_password:
            return jsonify({"success": False, "message": "New passwords do not match"})
        
        user.password_hash = hash_password(new_password)
        create_audit("change_password", user=user, status="success")
        db.session.commit()
        
        return jsonify({"success": True, "message": "Password changed successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.json
        identifier = data.get("identifier", "").strip()
        reset_token = data.get("reset_token", "").strip()
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")
        
        if not identifier:
            return jsonify({"success": False, "message": "Email or phone number is required"})
        
        # Find user
        user = None
        if "@" in identifier:
            user = User.query.filter_by(email=identifier.lower()).first()
        else:
            user = User.query.filter_by(phone=identifier).first()
        
        if not user:
            return jsonify({"success": False, "message": "No account found with this email/phone"})
        
        if not new_password:
            token = secrets.token_urlsafe(32)
            user.password_reset_token_hash = hash_reset_token(token)
            user.password_reset_expires_at = datetime.utcnow() + timedelta(minutes=30)
            user.password_reset_used_at = None
            create_audit("password_reset_requested", user=user, status="success")
            db.session.commit()
            return jsonify({
                "success": True,
                "message": "Reset verification token generated. In production this token must be emailed to the account owner.",
                "account_found": True,
                "reset_token": token,
                "expires_in_minutes": 30
            })

        if not reset_token:
            return jsonify({"success": False, "message": "Password reset token is required"})

        if not user.password_reset_token_hash or user.password_reset_used_at:
            return jsonify({"success": False, "message": "Password reset token is invalid or already used"})

        if not user.password_reset_expires_at or user.password_reset_expires_at < datetime.utcnow():
            return jsonify({"success": False, "message": "Password reset token has expired"})

        if hash_reset_token(reset_token) != user.password_reset_token_hash:
            create_audit("password_reset", user=user, status="failed")
            db.session.commit()
            return jsonify({"success": False, "message": "Password reset token is invalid"})
        
        # Step 2: Reset password
        if len(new_password) < 8:
            return jsonify({"success": False, "message": "Password must be at least 8 characters"})
        
        if new_password != confirm_password:
            return jsonify({"success": False, "message": "Passwords do not match"})
        
        user.password_hash = hash_password(new_password)
        user.password_reset_used_at = datetime.utcnow()
        user.password_reset_token_hash = None
        user.password_reset_expires_at = None
        create_audit("password_reset", user=user, status="success")
        db.session.commit()
        
        return jsonify({"success": True, "message": "Password reset successful. Please login with your new password."})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


# =========================================
# JIRA SYNC API ROUTES
# =========================================

