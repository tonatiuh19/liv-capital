-- Migration 2026_003: Add reminder_sent_at to visit_bookings
-- Tracks whether the 24hr pre-visit reminder email has been sent.
-- Run once. Safe to re-run (IF NOT EXISTS guard).

ALTER TABLE visit_bookings
    ADD COLUMN IF NOT EXISTS reminder_sent_at DATETIME NULL DEFAULT NULL
        COMMENT '24hr reminder email sent timestamp (NULL = not yet sent)';
