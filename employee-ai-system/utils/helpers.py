def safe_float(row, *keys, default=0.0):
    for key in keys:
        try:
            val = row.get(key, None)
            if val is not None and val != "":
                return float(val)
        except Exception:
            continue
    return default


def safe_str(row, *keys, default=""):
    for key in keys:
        try:
            val = row.get(key, None)
            if val is not None:
                return str(val).strip()
        except Exception:
            continue
    return default

