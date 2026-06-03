-- =========================================
-- AI WORKFORCE ANALYTICS — DATABASE SCHEMA
-- SQLite-compatible SQL
-- Generated: 2026-06-03
-- =========================================

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS user (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(120) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(256) NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME
);

CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON user(phone);

-- =========================================
-- EMPLOYEE HISTORY (Analytics Records)
-- =========================================
CREATE TABLE IF NOT EXISTS employee_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name   VARCHAR(100),
    project         VARCHAR(100),
    task            VARCHAR(100),
    productivity    REAL,
    burnout         VARCHAR(50),
    working_hours   REAL,
    overtime_hours  REAL,
    upload_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
    upload_batch_id VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_eh_employee    ON employee_history(employee_name);
CREATE INDEX IF NOT EXISTS idx_eh_batch       ON employee_history(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_eh_upload_time ON employee_history(upload_time);

-- =========================================
-- AUDIT LOG (Activity Tracking)
-- =========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,
    user_email      VARCHAR(120),
    action          VARCHAR(50) NOT NULL,
    timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address      VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user      ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);

-- =========================================
-- JIRA SYNC LOG
-- =========================================
CREATE TABLE IF NOT EXISTS jira_sync_log (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_time         DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_records     INTEGER DEFAULT 0,
    status            VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
    errors            TEXT,
    duration_seconds  REAL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_jira_sync_time ON jira_sync_log(sync_time);

-- =========================================
-- SETTINGS (Application Configuration)
-- Stores Jira credentials and sync preferences.
-- Only one row expected (singleton pattern).
-- =========================================
CREATE TABLE IF NOT EXISTS settings (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    jira_url            VARCHAR(255) DEFAULT '',
    jira_email          VARCHAR(255) DEFAULT '',
    jira_api_token      VARCHAR(512) DEFAULT '',
    jira_project_key    VARCHAR(50) DEFAULT '',
    auto_sync_interval  INTEGER DEFAULT 60,   -- minutes
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sync_interval CHECK (auto_sync_interval >= 5 AND auto_sync_interval <= 1440)
);
