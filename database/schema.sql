-- ============================================================
--  LIV CAPITAL — Database Schema
--  Engine : MySQL 8.0+ (Banahosting shared hosting)
--  PHP    : 8.4.x  |  Charset: utf8mb4
--  Usage  : Run once via phpMyAdmin or mysql CLI
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- 1. ADMINS
-- ============================================================
-- Auth is fully passwordless — login is OTP-only (code sent to admin email)
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100)    NOT NULL,
  `email`         VARCHAR(255)    NOT NULL,
  `role`          ENUM('superadmin','admin') NOT NULL DEFAULT 'admin',
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `last_login_at` DATETIME                 DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ADMIN SESSIONS  (stateful login tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `admin_id`      INT UNSIGNED    NOT NULL,
  `token_hash`    VARCHAR(255)    NOT NULL COMMENT 'hash of the bearer token stored in HttpOnly cookie',
  `ip_address`    VARCHAR(45)              DEFAULT NULL,
  `user_agent`    VARCHAR(512)             DEFAULT NULL,
  `expires_at`    DATETIME        NOT NULL,
  `revoked_at`    DATETIME                 DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_sessions_token` (`token_hash`),
  KEY `idx_admin_sessions_admin` (`admin_id`),
  KEY `idx_admin_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_admin_sessions_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. OTP CODES  (shared for admin login MFA & visitor actions)
-- ============================================================
CREATE TABLE IF NOT EXISTS `otp_codes` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `context_type`  ENUM('admin_login','visitor_edit','visitor_cancel','visitor_confirm')
                                  NOT NULL,
  `context_id`    VARCHAR(255)    NOT NULL COMMENT 'admin.id or booking.id depending on context_type',
  `code_hash`     VARCHAR(255)    NOT NULL COMMENT 'hash of the 6-digit OTP',
  `purpose`       VARCHAR(64)     NOT NULL COMMENT 'e.g. login, edit_booking, cancel_booking',
  `expires_at`    DATETIME        NOT NULL,
  `used_at`       DATETIME                 DEFAULT NULL,
  `attempts`      TINYINT         NOT NULL DEFAULT 0,
  `ip_address`    VARCHAR(45)              DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_otp_context` (`context_type`, `context_id`),
  KEY `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. VISIT SLOT TEMPLATES  (recurring weekly schedule — admin-editable)
-- ============================================================
CREATE TABLE IF NOT EXISTS `visit_slot_templates` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `day_of_week`   TINYINT         NOT NULL COMMENT '0=Sunday … 6=Saturday',
  `start_time`    TIME            NOT NULL COMMENT 'e.g. 09:00:00',
  `end_time`      TIME            NOT NULL COMMENT 'e.g. 10:00:00 (1 h slot)',
  `max_capacity`  TINYINT         NOT NULL DEFAULT 1 COMMENT 'visitors per slot',
  `label`         VARCHAR(100)             DEFAULT NULL COMMENT 'optional display label',
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `created_by`    INT UNSIGNED             DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slot_templates_day` (`day_of_week`, `is_active`),
  CONSTRAINT `fk_slot_templates_admin`
    FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. VISIT SLOT OVERRIDES  (block dates, holiday closures, special capacity)
-- ============================================================
CREATE TABLE IF NOT EXISTS `visit_slot_overrides` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `override_date` DATE            NOT NULL,
  `start_time`    TIME                     DEFAULT NULL COMMENT 'NULL = whole day',
  `end_time`      TIME                     DEFAULT NULL,
  `is_blocked`    TINYINT(1)      NOT NULL DEFAULT 1,
  `max_capacity`  TINYINT                  DEFAULT NULL COMMENT 'override capacity (NULL = use template default)',
  `reason`        VARCHAR(255)             DEFAULT NULL COMMENT 'internal admin note',
  `created_by`    INT UNSIGNED             DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slot_overrides_date` (`override_date`),
  CONSTRAINT `fk_slot_overrides_admin`
    FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. VISIT BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS `visit_bookings` (
  `id`                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `slot_template_id`     INT UNSIGNED           DEFAULT NULL,
  `visit_date`           DATE          NOT NULL,
  `time_start`           TIME          NOT NULL,
  `time_end`             TIME          NOT NULL,

  -- Visitor info
  `visitor_name`         VARCHAR(120)  NOT NULL,
  `visitor_email`        VARCHAR(255)  NOT NULL,
  `visitor_phone`        VARCHAR(30)            DEFAULT NULL,
  `visitor_message`      TEXT                   DEFAULT NULL,
  `visitor_interest`     ENUM('studio','1bed','2bed','3bed','penthouse','general')
                                                DEFAULT 'general',

  -- Status lifecycle
  `status`               ENUM('pending','confirmed','rescheduled','cancelled','completed','no_show')
                                       NOT NULL DEFAULT 'pending',
  `confirmed_at`         DATETIME               DEFAULT NULL,
  `cancelled_at`         DATETIME               DEFAULT NULL,
  `cancelled_by`         ENUM('visitor','admin') DEFAULT NULL,
  `cancellation_reason`  VARCHAR(500)           DEFAULT NULL,
  `completed_at`         DATETIME               DEFAULT NULL,

  -- Secure action tokens (emailed to visitor — raw token, store only hash)
  `edit_token_hash`      VARCHAR(255)           DEFAULT NULL,
  `edit_token_expires_at` DATETIME              DEFAULT NULL,
  `cancel_token_hash`    VARCHAR(255)           DEFAULT NULL,
  `cancel_token_expires_at` DATETIME            DEFAULT NULL,

  -- Admin
  `admin_notes`          TEXT                   DEFAULT NULL,
  `assigned_to`          INT UNSIGNED           DEFAULT NULL COMMENT 'admin who will receive the visitor',

  -- Metadata
  `ip_address`           VARCHAR(45)            DEFAULT NULL,
  `user_agent`           VARCHAR(512)           DEFAULT NULL,
  `utm_source`           VARCHAR(100)           DEFAULT NULL,
  `utm_medium`           VARCHAR(100)           DEFAULT NULL,
  `utm_campaign`         VARCHAR(100)           DEFAULT NULL,

  `created_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_bookings_date_status` (`visit_date`, `status`),
  KEY `idx_bookings_email` (`visitor_email`),
  KEY `idx_bookings_slot` (`slot_template_id`),
  KEY `idx_bookings_assigned` (`assigned_to`),
  CONSTRAINT `fk_bookings_slot`
    FOREIGN KEY (`slot_template_id`) REFERENCES `visit_slot_templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_admin`
    FOREIGN KEY (`assigned_to`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. BOOKING EVENT TRACKING  (full audit trail per booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS `booking_events` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `booking_id`    INT UNSIGNED    NOT NULL,
  `event_type`    ENUM(
                    'created',
                    'confirmed',
                    'reminder_sent',
                    'email_opened',
                    'edit_link_clicked',
                    'cancel_link_clicked',
                    'rescheduled',
                    'cancelled',
                    'completed',
                    'no_show',
                    'admin_note_added',
                    'admin_status_changed'
                  ) NOT NULL,
  `triggered_by`  ENUM('visitor','admin','system') NOT NULL DEFAULT 'system',
  `admin_id`      INT UNSIGNED             DEFAULT NULL,
  `metadata`      JSON                     DEFAULT NULL COMMENT 'extra event data',
  `ip_address`    VARCHAR(45)              DEFAULT NULL,
  `user_agent`    VARCHAR(512)             DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_events_booking` (`booking_id`),
  KEY `idx_booking_events_type` (`event_type`),
  KEY `idx_booking_events_created` (`created_at`),
  CONSTRAINT `fk_booking_events_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `visit_bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_events_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. CONTACT FORM SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact_submissions` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(120)    NOT NULL,
  `email`         VARCHAR(255)    NOT NULL,
  `phone`         VARCHAR(30)              DEFAULT NULL,
  `subject`       VARCHAR(255)             DEFAULT NULL,
  `message`       TEXT            NOT NULL,
  `source`        VARCHAR(100)             DEFAULT 'contact_form' COMMENT 'hero / footer / modal / contact_form',
  `interest`      ENUM('studio','1bed','2bed','3bed','penthouse','general','investment','other')
                                           DEFAULT 'general',

  -- CRM-lite status
  `status`        ENUM('new','read','in_progress','replied','archived')
                                  NOT NULL DEFAULT 'new',
  `read_at`       DATETIME                 DEFAULT NULL,
  `replied_at`    DATETIME                 DEFAULT NULL,
  `replied_by`    INT UNSIGNED             DEFAULT NULL,
  `admin_notes`   TEXT                     DEFAULT NULL,

  -- Tracking
  `ip_address`    VARCHAR(45)              DEFAULT NULL,
  `user_agent`    VARCHAR(512)             DEFAULT NULL,
  `utm_source`    VARCHAR(100)             DEFAULT NULL,
  `utm_medium`    VARCHAR(100)             DEFAULT NULL,
  `utm_campaign`  VARCHAR(100)             DEFAULT NULL,

  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_contacts_status` (`status`),
  KEY `idx_contacts_email` (`email`),
  KEY `idx_contacts_created` (`created_at`),
  CONSTRAINT `fk_contacts_admin`
    FOREIGN KEY (`replied_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. EMAIL LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `recipient_email` VARCHAR(255)  NOT NULL,
  `recipient_name`  VARCHAR(120)           DEFAULT NULL,
  `template_type`   VARCHAR(100)  NOT NULL COMMENT 'booking_confirmation / booking_reminder / booking_cancelled / contact_reply / otp_admin / otp_visitor',
  `booking_id`      INT UNSIGNED           DEFAULT NULL,
  `contact_id`      INT UNSIGNED           DEFAULT NULL,
  `subject`         VARCHAR(255)  NOT NULL,
  `status`          ENUM('sent','failed','bounced') NOT NULL DEFAULT 'sent',
  `mailer_response` TEXT                   DEFAULT NULL,
  `sent_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_logs_booking` (`booking_id`),
  KEY `idx_email_logs_contact` (`contact_id`),
  KEY `idx_email_logs_recipient` (`recipient_email`),
  CONSTRAINT `fk_email_logs_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `visit_bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_email_logs_contact`
    FOREIGN KEY (`contact_id`) REFERENCES `contact_submissions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. CMS CONTENT  (versioned — terms, privacy policy, about, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS `cms_content` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(100)    NOT NULL COMMENT 'terms_and_conditions | privacy_policy | about_us | faq',
  `title`         VARCHAR(255)    NOT NULL,
  `content`       LONGTEXT        NOT NULL COMMENT 'Markdown content',
  `version`       SMALLINT        NOT NULL DEFAULT 1,
  `is_published`  TINYINT(1)      NOT NULL DEFAULT 0,
  `published_at`  DATETIME                 DEFAULT NULL,
  `published_by`  INT UNSIGNED             DEFAULT NULL,
  `created_by`    INT UNSIGNED             DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cms_slug_published` (`slug`, `is_published`),
  KEY `idx_cms_version` (`slug`, `version`),
  CONSTRAINT `fk_cms_published_by`
    FOREIGN KEY (`published_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cms_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. BUILDING CONFIG  (key-value store for all configurable settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS `building_config` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `config_key`    VARCHAR(100)    NOT NULL COMMENT 'e.g. whatsapp_number, address, total_units',
  `config_value`  TEXT                     DEFAULT NULL,
  `config_type`   ENUM('string','integer','boolean','json','markdown','url','email','phone')
                                  NOT NULL DEFAULT 'string',
  `label`         VARCHAR(150)    NOT NULL COMMENT 'Human-readable label for admin panel',
  `description`   VARCHAR(500)             DEFAULT NULL,
  `group`         VARCHAR(80)              DEFAULT 'general' COMMENT 'general | contact | social | seo | visits | email',
  `is_public`     TINYINT(1)      NOT NULL DEFAULT 1 COMMENT 'expose via public API endpoint',
  `updated_by`    INT UNSIGNED             DEFAULT NULL,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_building_config_key` (`config_key`),
  KEY `idx_building_config_group` (`group`),
  CONSTRAINT `fk_building_config_admin`
    FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. APARTMENT MODELS
-- ============================================================
CREATE TABLE IF NOT EXISTS `apartment_models` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)  NOT NULL COMMENT 'e.g. Studio, Suite 1, Penthouse',
  `slug`            VARCHAR(120)  NOT NULL,
  `description`     TEXT                   DEFAULT NULL,
  `type`            ENUM('studio','1bed','2bed','3bed','penthouse','commercial')
                                  NOT NULL DEFAULT 'studio',
  `bedrooms`        TINYINT       NOT NULL DEFAULT 0,
  `bathrooms`       TINYINT       NOT NULL DEFAULT 1,
  `area_sqm`        DECIMAL(8,2)           DEFAULT NULL,
  `area_sqft`       DECIMAL(8,2)           DEFAULT NULL,
  `floor_min`       TINYINT                DEFAULT NULL,
  `floor_max`       TINYINT                DEFAULT NULL,
  `price_from`      DECIMAL(14,2)          DEFAULT NULL,
  `price_to`        DECIMAL(14,2)          DEFAULT NULL,
  `currency`        CHAR(3)       NOT NULL DEFAULT 'MXN',
  `floor_plan_url`  VARCHAR(500)           DEFAULT NULL,
  `gallery_images`  JSON                   DEFAULT NULL COMMENT '["url1","url2",...]',
  `features`        JSON                   DEFAULT NULL COMMENT '["Terraza","Jacuzzi",...]',
  `is_available`    TINYINT(1)    NOT NULL DEFAULT 1,
  `units_total`     SMALLINT               DEFAULT NULL,
  `units_available` SMALLINT               DEFAULT NULL,
  `is_featured`     TINYINT(1)    NOT NULL DEFAULT 0,
  `display_order`   SMALLINT      NOT NULL DEFAULT 0,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_apartment_models_slug` (`slug`),
  KEY `idx_apartment_models_available` (`is_available`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. AMENITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS `amenities` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100)    NOT NULL,
  `description`   TEXT                     DEFAULT NULL,
  `icon`          VARCHAR(100)             DEFAULT NULL COMMENT 'lucide icon name or SVG path',
  `image_url`     VARCHAR(500)             DEFAULT NULL,
  `category`      VARCHAR(80)              DEFAULT NULL COMMENT 'wellness | social | security | services',
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `display_order` SMALLINT        NOT NULL DEFAULT 0,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_amenities_category` (`category`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(200)             DEFAULT NULL,
  `description`   TEXT                     DEFAULT NULL,
  `image_url`     VARCHAR(500)    NOT NULL,
  `thumbnail_url` VARCHAR(500)             DEFAULT NULL,
  `category`      VARCHAR(80)              DEFAULT NULL COMMENT 'exterior | interior | amenities | renders',
  `alt_text`      VARCHAR(255)             DEFAULT NULL COMMENT 'SEO/accessibility',
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `display_order` SMALLINT        NOT NULL DEFAULT 0,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gallery_category` (`category`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default superadmin — no password, login is OTP sent to this email
INSERT INTO `admins` (`name`, `email`, `role`) VALUES
('Super Admin', 'admin@livcapitalgdl.mx', 'superadmin');

-- Default CMS content
INSERT INTO `cms_content` (`slug`, `title`, `content`, `version`, `is_published`, `published_at`) VALUES
('terms_and_conditions', 'Términos y Condiciones', 
'# Términos y Condiciones\n\n**Última actualización:** Mayo 2025\n\n## 1. Aceptación\n\nAl acceder y usar este sitio web, usted acepta los presentes términos y condiciones en su totalidad. Si no está de acuerdo con alguno de ellos, le pedimos que no utilice nuestros servicios.\n\n## 2. Información del Desarrollador\n\n**LIV CAPITAL** es un desarrollo inmobiliario operado por **Capital Urbano S.A. de C.V.**, con domicilio en Guadalajara, Jalisco, México.\n\n## 3. Uso del Sitio\n\nEste sitio web es de carácter informativo. La información sobre precios, disponibilidad y características está sujeta a cambios sin previo aviso.\n\n## 4. Agendamiento de Visitas\n\nLas visitas al desarrollo se realizan únicamente con cita previa. Al agendar una visita, usted autoriza el uso de sus datos de contacto para coordinar dicha visita. La empresa se reserva el derecho de cancelar o reprogramar visitas por razones operativas.\n\n## 5. Limitación de Responsabilidad\n\nLIV CAPITAL no garantiza que la información del sitio esté libre de errores u omisiones. Las imágenes y renders son representaciones artísticas y pueden diferir del producto final.\n\n## 6. Propiedad Intelectual\n\nTodo el contenido de este sitio (textos, imágenes, logotipos) es propiedad de Capital Urbano S.A. de C.V. y está protegido por las leyes de propiedad intelectual aplicables en México.\n\n## 7. Modificaciones\n\nNos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del sitio implica la aceptación de los términos vigentes.\n\n## 8. Legislación Aplicable\n\nEstos términos se rigen por las leyes vigentes en el Estado de Jalisco, México.',
 1, 1, NOW()),

('privacy_policy', 'Aviso de Privacidad',
'# Aviso de Privacidad\n\n**Última actualización:** Mayo 2025\n\n## Responsable del tratamiento de datos\n\n**Capital Urbano S.A. de C.V.** (en adelante, "LIV CAPITAL"), con domicilio en Guadalajara, Jalisco, México, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).\n\n## Datos que recopilamos\n\n- **Datos de contacto:** nombre, correo electrónico, número telefónico.\n- **Datos de visita:** fecha y hora de visita agendada, interés en tipo de unidad.\n- **Datos técnicos:** dirección IP, tipo de navegador (con fines de seguridad y estadísticos).\n\n## Finalidades del tratamiento\n\n- Coordinar visitas al desarrollo LIV CAPITAL.\n- Responder a solicitudes de información.\n- Enviar información relevante sobre el proyecto (con su consentimiento).\n- Cumplir con obligaciones legales.\n\n## Transferencia de datos\n\nSus datos no serán transferidos a terceros sin su consentimiento, salvo en los casos previstos por la ley.\n\n## Derechos ARCO\n\nUsted tiene derecho a **Acceder, Rectificar, Cancelar u Oponerse** al tratamiento de sus datos. Para ejercerlos, escríbanos a: **privacidad@livcapitalgdl.mx**\n\n## Cookies\n\nEste sitio puede utilizar cookies técnicas necesarias para su funcionamiento. No utilizamos cookies de seguimiento de terceros.\n\n## Cambios al aviso\n\nCualquier cambio a este aviso será publicado en esta página con la fecha de actualización correspondiente.',
 1, 1, NOW()),

('faq', 'Preguntas Frecuentes',
'# Preguntas Frecuentes\n\n## ¿Cuándo estará listo el desarrollo?\n\nLIV CAPITAL tiene una fecha de entrega estimada para el segundo semestre de 2026. Te mantendremos informado sobre el avance de obra.\n\n## ¿Cómo puedo agendar una visita?\n\nPuedes agendar tu visita directamente desde nuestra página web seleccionando el día y horario disponible de tu preferencia.\n\n## ¿Qué documentos necesito para apartar una unidad?\n\nTe asesoraremos en este proceso durante tu visita. Generalmente se requiere identificación oficial y un comprobante de domicilio.\n\n## ¿Las imágenes del sitio son del desarrollo real?\n\nLas imágenes son renders artísticos que representan fielmente el concepto arquitectónico. El resultado final puede tener variaciones menores.',
 1, 1, NOW());

-- Building config defaults
INSERT INTO `building_config` (`config_key`, `config_value`, `config_type`, `label`, `description`, `group`) VALUES
-- Contact
('whatsapp_number',   '+523312345678',            'phone',   'WhatsApp',              'Número de WhatsApp con código de país', 'contact'),
('contact_email',     'info@livcapitalgdl.mx',       'email',   'Email de contacto',     'Email principal de contacto',           'contact'),
('contact_phone',     '+52 (33) 1234 5678',        'phone',   'Teléfono',              'Teléfono de oficina de ventas',         'contact'),
('address',           'Guadalajara, Jalisco, México','string', 'Dirección',             'Dirección del desarrollo',              'contact'),
('google_maps_url',   '',                           'url',     'Google Maps URL',       'URL del pin en Google Maps',            'contact'),

-- Social
('instagram_url',     '',                           'url',     'Instagram',             'URL del perfil de Instagram',           'social'),
('facebook_url',      '',                           'url',     'Facebook',              'URL del perfil de Facebook',            'social'),
('linkedin_url',      '',                           'url',     'LinkedIn',              'URL del perfil de LinkedIn',            'social'),

-- Building facts (shown in hero/stats)
('total_floors',      '8',                          'integer', 'Número de plantas',     'Total de pisos del edificio',           'general'),
('total_units',       '125',                        'integer', 'Total departamentos',   'Total de unidades del proyecto',        'general'),
('total_amenities',   '12',                         'integer', 'Total amenidades',      'Número de amenidades',                  'general'),
('delivery_estimate', 'Segundo semestre 2026',      'string',  'Fecha de entrega',      'Estimado de entrega del proyecto',      'general'),
('construction_stage','Preventa',                   'string',  'Etapa de construcción', 'Etapa actual del desarrollo',           'general'),

-- Visit settings
('visit_slot_duration_minutes', '60',              'integer', 'Duración de cita (min)','Duración por defecto de cada cita',     'visits'),
('visit_booking_advance_days',  '30',              'integer', 'Días de anticipación',  'Máximo de días a futuro para agendar',  'visits'),
('visit_min_advance_hours',     '24',              'integer', 'Horas mínimas previas', 'Mínimo de horas para agendar con anticipación','visits'),
('visit_cancel_token_hours',    '48',              'integer', 'Validez token cancelar','Horas de validez del link de cancelación','visits'),
('visit_edit_token_hours',      '48',              'integer', 'Validez token editar',  'Horas de validez del link de edición',  'visits'),
('visit_reminder_hours_before', '24',              'integer', 'Recordatorio (horas)',  'Horas antes de la visita para enviar recordatorio','visits'),

-- Email (PHPMailer config — sensitive values go in .env, not here)
('email_from_name',   'LIV CAPITAL',               'string',  'Nombre remitente',      'Nombre que aparece en los correos enviados','email'),
('email_from_address','noreply@livcapitalgdl.mx',     'email',   'Email remitente',       'Dirección de correo remitente',         'email'),
('admin_notify_email','admin@livcapitalgdl.mx',       'email',   'Email notif. admin',    'Email que recibe notificaciones de nuevas reservas y contactos','email'),

-- SEO
('site_title',        'LIV CAPITAL — Vivienda Vertical Luxury en Guadalajara','string','Título del sitio','Meta title principal', 'seo'),
('site_description',  'Departamentos de lujo en Guadalajara, Jalisco. Arquitectura contemporánea, amenidades premium y ubicación privilegiada.','string','Descripción del sitio','Meta description principal','seo'),
('og_image_url',      '/og-image.jpg',              'url',     'OG Image URL',          'Imagen para redes sociales (1200x630)',  'seo'),

-- Under construction
('under_construction', '0',                          'boolean', 'Modo construcción',     'Activar página de próximamente (1=activo, 0=desactivado)', 'general');

-- Default visit slot templates (Mon–Sat, 10:00–17:00, 1h slots)
INSERT INTO `visit_slot_templates` (`day_of_week`, `start_time`, `end_time`, `max_capacity`, `label`) VALUES
(1, '10:00:00', '11:00:00', 2, NULL),
(1, '11:00:00', '12:00:00', 2, NULL),
(1, '12:00:00', '13:00:00', 2, NULL),
(1, '14:00:00', '15:00:00', 2, NULL),
(1, '15:00:00', '16:00:00', 2, NULL),
(1, '16:00:00', '17:00:00', 2, NULL),
(2, '10:00:00', '11:00:00', 2, NULL),
(2, '11:00:00', '12:00:00', 2, NULL),
(2, '12:00:00', '13:00:00', 2, NULL),
(2, '14:00:00', '15:00:00', 2, NULL),
(2, '15:00:00', '16:00:00', 2, NULL),
(2, '16:00:00', '17:00:00', 2, NULL),
(3, '10:00:00', '11:00:00', 2, NULL),
(3, '11:00:00', '12:00:00', 2, NULL),
(3, '12:00:00', '13:00:00', 2, NULL),
(3, '14:00:00', '15:00:00', 2, NULL),
(3, '15:00:00', '16:00:00', 2, NULL),
(3, '16:00:00', '17:00:00', 2, NULL),
(4, '10:00:00', '11:00:00', 2, NULL),
(4, '11:00:00', '12:00:00', 2, NULL),
(4, '12:00:00', '13:00:00', 2, NULL),
(4, '14:00:00', '15:00:00', 2, NULL),
(4, '15:00:00', '16:00:00', 2, NULL),
(4, '16:00:00', '17:00:00', 2, NULL),
(5, '10:00:00', '11:00:00', 2, NULL),
(5, '11:00:00', '12:00:00', 2, NULL),
(5, '12:00:00', '13:00:00', 2, NULL),
(5, '14:00:00', '15:00:00', 2, NULL),
(5, '15:00:00', '16:00:00', 2, NULL),
(5, '16:00:00', '17:00:00', 2, NULL),
(6, '10:00:00', '11:00:00', 1, 'Sábado'),
(6, '11:00:00', '12:00:00', 1, 'Sábado'),
(6, '12:00:00', '13:00:00', 1, 'Sábado');

-- Default apartment models
INSERT INTO `apartment_models` (`name`, `slug`, `type`, `bedrooms`, `bathrooms`, `area_sqm`, `price_from`, `currency`, `is_available`, `display_order`, `is_featured`) VALUES
('Studio',    'studio',    'studio',  0, 1, 42.00, 1850000.00, 'MXN', 1, 1, 0),
('Suite 1',   'suite-1',   '1bed',    1, 1, 58.00, 2400000.00, 'MXN', 1, 2, 1),
('Suite 2',   'suite-2',   '2bed',    2, 2, 82.00, 3200000.00, 'MXN', 1, 3, 1),
('Suite 3',   'suite-3',   '3bed',    3, 2, 110.00,4500000.00, 'MXN', 1, 4, 0),
('Penthouse', 'penthouse', 'penthouse',3, 3, 165.00,7200000.00, 'MXN', 1, 5, 1);

-- Default amenities
INSERT INTO `amenities` (`name`, `description`, `icon`, `category`, `display_order`) VALUES
('Rooftop Lounge',    'Terraza panorámica con vista a la ciudad',   'sunset',         'social',   1),
('Alberca Infinity',  'Alberca infinity con deck de descanso',       'waves',          'wellness', 2),
('Gimnasio',          'Equipado con tecnología de última generación','dumbbell',       'wellness', 3),
('Spa & Sauna',       'Área de relajación y bienestar',              'sparkles',       'wellness', 4),
('Coworking',         'Espacios de trabajo con internet de alta velocidad','laptop',   'services', 5),
('Sala de Cine',      'Sala privada de cine para residentes',        'film',           'social',   6),
('Área de Niños',     'Zona de juegos y entretenimiento infantil',   'baby',           'social',   7),
('Lobby Boutique',    'Lobby de diseño con concierge',               'building-2',     'services', 8),
('Estacionamiento',   'Cajones asignados con acceso controlado',     'car',            'security', 9),
('Acceso Controlado', 'Sistema de acceso biométrico 24/7',           'shield-check',   'security', 10),
('Bodega',            'Cuarto de almacenamiento por departamento',   'package',        'services', 11),
('Pet Friendly',      'Área especial para mascotas',                 'paw-print',      'social',   12);

SET foreign_key_checks = 1;

-- ============================================================
-- MIGRATION TRACKER  (created here so schema.sql = migration 001)
-- ============================================================
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration`  VARCHAR(255) NOT NULL,
  `applied_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_migration` (`migration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mark the initial schema as already applied so migrate.php skips it
INSERT IGNORE INTO `schema_migrations` (`migration`) VALUES ('001_initial_schema');

