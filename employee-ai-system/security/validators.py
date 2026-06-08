import re


def valid_email(value):
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value or ""))


def valid_http_url(value):
    return bool(re.match(r"^https?://[^\s/$.?#].[^\s]*$", value or ""))

