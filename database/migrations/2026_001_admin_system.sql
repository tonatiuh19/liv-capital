-- ============================================================
-- LIV Capital — Admin System Migration 2026-001
-- Applies against the existing schema.sql (already on production).
-- All statements are idempotent — safe to run more than once.
-- ============================================================

-- ── visit_bookings: new admin columns ─────────────────────────
-- admin_notes already exists in schema; IF NOT EXISTS skips silently.
ALTER TABLE visit_bookings
    ADD COLUMN IF NOT EXISTS is_manual_entry      TINYINT(1)   NOT NULL DEFAULT 0
        COMMENT '1 = created by admin, not by visitor',
    ADD COLUMN IF NOT EXISTS admin_notes          TEXT         NULL
        COMMENT 'Internal admin notes (may already exist)',
    ADD COLUMN IF NOT EXISTS created_by_admin_id  INT UNSIGNED NULL
        COMMENT 'Admin who created this booking manually';

-- ── Seed: first superadmin ─────────────────────────────────────
INSERT IGNORE INTO admins (name, email, role, is_active)
VALUES ('Alex Gomez', 'alex@disruptinglabs.com', 'superadmin', 1);
