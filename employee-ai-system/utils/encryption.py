import base64
import hashlib
import os

from cryptography.fernet import Fernet


def _fernet(secret_key):
    raw_key = os.environ.get("JIRA_ENCRYPTION_KEY", "").strip()
    if raw_key:
        return Fernet(raw_key.encode("utf-8"))

    derived = base64.urlsafe_b64encode(hashlib.sha256(secret_key.encode("utf-8")).digest())
    return Fernet(derived)


def encrypt_secret(value, secret_key):
    if not value:
        return ""
    if str(value).startswith("fernet:"):
        return value
    return "fernet:" + _fernet(secret_key).encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value, secret_key):
    if not value:
        return ""
    if not str(value).startswith("fernet:"):
        return value
    try:
        return _fernet(secret_key).decrypt(value.replace("fernet:", "", 1).encode("utf-8")).decode("utf-8")
    except Exception:
        return ""

