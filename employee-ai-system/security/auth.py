import bcrypt
from werkzeug.security import check_password_hash


def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(stored_hash, password):
    if not stored_hash or password is None:
        return False
    try:
        if stored_hash.startswith("$2"):
            return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))
        return check_password_hash(stored_hash, password)
    except Exception:
        return False

