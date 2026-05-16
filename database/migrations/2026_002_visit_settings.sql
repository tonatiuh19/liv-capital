-- ============================================================
-- LIV Capital — Visit Settings Migration 2026-002
-- Adds default building_config rows for the visit Configuración
-- panel (admin panel → Visitas → Configuración tab).
-- All statements are idempotent — safe to run more than once.
-- ============================================================

-- ── Visit configuration defaults ──────────────────────────────
-- INSERT IGNORE skips rows that already exist (unique key: config_key).

INSERT IGNORE INTO `building_config`
    (`config_key`, `config_value`, `config_type`, `label`, `description`, `group`, `is_public`)
VALUES
    ('visit_slot_duration_minutes', '60',  'integer',
     'Duración de cita (min)',
     'Duración por defecto de cada cita',
     'visits', 1),

    ('visit_booking_advance_days',  '30',  'integer',
     'Días de anticipación',
     'Máximo de días a futuro para agendar',
     'visits', 1),

    ('visit_min_advance_hours',     '24',  'integer',
     'Horas mínimas previas',
     'Mínimo de horas para agendar con anticipación',
     'visits', 1),

    ('visit_cancel_token_hours',    '48',  'integer',
     'Validez token cancelar',
     'Horas de validez del link de cancelación',
     'visits', 1),

    ('visit_edit_token_hours',      '48',  'integer',
     'Validez token editar',
     'Horas de validez del link de edición',
     'visits', 1),

    ('visit_reminder_hours_before', '24',  'integer',
     'Recordatorio (horas)',
     'Horas antes de la visita para enviar recordatorio',
     'visits', 1);

-- ── Default visit slot templates: Mon–Sat 08:00–20:00 (1 h slots) ─────────
-- Replaces the narrow 10:00–17:00 seeds that ship with schema.sql.
-- visit_bookings.slot_template_id has ON DELETE SET NULL, so existing
-- bookings are preserved (their slot reference just becomes NULL).

DELETE FROM `visit_slot_templates`;

INSERT INTO `visit_slot_templates`
    (`day_of_week`, `start_time`, `end_time`, `max_capacity`, `label`, `is_active`)
VALUES
-- Monday (1)
(1,'08:00:00','09:00:00',2,NULL,1),
(1,'09:00:00','10:00:00',2,NULL,1),
(1,'10:00:00','11:00:00',2,NULL,1),
(1,'11:00:00','12:00:00',2,NULL,1),
(1,'12:00:00','13:00:00',2,NULL,1),
(1,'13:00:00','14:00:00',2,NULL,1),
(1,'14:00:00','15:00:00',2,NULL,1),
(1,'15:00:00','16:00:00',2,NULL,1),
(1,'16:00:00','17:00:00',2,NULL,1),
(1,'17:00:00','18:00:00',2,NULL,1),
(1,'18:00:00','19:00:00',2,NULL,1),
(1,'19:00:00','20:00:00',2,NULL,1),
-- Tuesday (2)
(2,'08:00:00','09:00:00',2,NULL,1),
(2,'09:00:00','10:00:00',2,NULL,1),
(2,'10:00:00','11:00:00',2,NULL,1),
(2,'11:00:00','12:00:00',2,NULL,1),
(2,'12:00:00','13:00:00',2,NULL,1),
(2,'13:00:00','14:00:00',2,NULL,1),
(2,'14:00:00','15:00:00',2,NULL,1),
(2,'15:00:00','16:00:00',2,NULL,1),
(2,'16:00:00','17:00:00',2,NULL,1),
(2,'17:00:00','18:00:00',2,NULL,1),
(2,'18:00:00','19:00:00',2,NULL,1),
(2,'19:00:00','20:00:00',2,NULL,1),
-- Wednesday (3)
(3,'08:00:00','09:00:00',2,NULL,1),
(3,'09:00:00','10:00:00',2,NULL,1),
(3,'10:00:00','11:00:00',2,NULL,1),
(3,'11:00:00','12:00:00',2,NULL,1),
(3,'12:00:00','13:00:00',2,NULL,1),
(3,'13:00:00','14:00:00',2,NULL,1),
(3,'14:00:00','15:00:00',2,NULL,1),
(3,'15:00:00','16:00:00',2,NULL,1),
(3,'16:00:00','17:00:00',2,NULL,1),
(3,'17:00:00','18:00:00',2,NULL,1),
(3,'18:00:00','19:00:00',2,NULL,1),
(3,'19:00:00','20:00:00',2,NULL,1),
-- Thursday (4)
(4,'08:00:00','09:00:00',2,NULL,1),
(4,'09:00:00','10:00:00',2,NULL,1),
(4,'10:00:00','11:00:00',2,NULL,1),
(4,'11:00:00','12:00:00',2,NULL,1),
(4,'12:00:00','13:00:00',2,NULL,1),
(4,'13:00:00','14:00:00',2,NULL,1),
(4,'14:00:00','15:00:00',2,NULL,1),
(4,'15:00:00','16:00:00',2,NULL,1),
(4,'16:00:00','17:00:00',2,NULL,1),
(4,'17:00:00','18:00:00',2,NULL,1),
(4,'18:00:00','19:00:00',2,NULL,1),
(4,'19:00:00','20:00:00',2,NULL,1),
-- Friday (5)
(5,'08:00:00','09:00:00',2,NULL,1),
(5,'09:00:00','10:00:00',2,NULL,1),
(5,'10:00:00','11:00:00',2,NULL,1),
(5,'11:00:00','12:00:00',2,NULL,1),
(5,'12:00:00','13:00:00',2,NULL,1),
(5,'13:00:00','14:00:00',2,NULL,1),
(5,'14:00:00','15:00:00',2,NULL,1),
(5,'15:00:00','16:00:00',2,NULL,1),
(5,'16:00:00','17:00:00',2,NULL,1),
(5,'17:00:00','18:00:00',2,NULL,1),
(5,'18:00:00','19:00:00',2,NULL,1),
(5,'19:00:00','20:00:00',2,NULL,1),
-- Saturday (6)
(6,'08:00:00','09:00:00',1,NULL,1),
(6,'09:00:00','10:00:00',1,NULL,1),
(6,'10:00:00','11:00:00',1,NULL,1),
(6,'11:00:00','12:00:00',1,NULL,1),
(6,'12:00:00','13:00:00',1,NULL,1),
(6,'13:00:00','14:00:00',1,NULL,1),
(6,'14:00:00','15:00:00',1,NULL,1),
(6,'15:00:00','16:00:00',1,NULL,1),
(6,'16:00:00','17:00:00',1,NULL,1),
(6,'17:00:00','18:00:00',1,NULL,1),
(6,'18:00:00','19:00:00',1,NULL,1),
(6,'19:00:00','20:00:00',1,NULL,1);
