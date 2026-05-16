-- ============================================================
-- 2026_007_points_of_interest.sql
-- Creates the points_of_interest table and seeds it with all
-- POIs from the brochure.  lat/lng columns default to NULL —
-- update them once coordinates are confirmed on-site.
-- Also registers LIV Capital's own coordinates in building_config.
-- ============================================================

CREATE TABLE IF NOT EXISTS `points_of_interest` (
  `id`               TINYINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `category`         ENUM('mercados','transporte','universidades','hospitales','parques','otros')
                                          NOT NULL,
  `name`             VARCHAR(200)         NOT NULL,
  `distance_meters`  SMALLINT UNSIGNED    NOT NULL COMMENT 'Approx distance in metres from LIV Capital',
  `description`      VARCHAR(255)         NULL,
  `lat`              DECIMAL(10,7)        NULL COMMENT 'WGS84 latitude  — update after confirming on-site',
  `lng`              DECIMAL(10,7)        NULL COMMENT 'WGS84 longitude — update after confirming on-site',
  `display_order`    TINYINT UNSIGNED     NOT NULL DEFAULT 0,
  `is_active`        TINYINT(1)           NOT NULL DEFAULT 1,
  `created_at`       DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed data (from brochure — coordinates TBD) ──────────────────────────────
INSERT IGNORE INTO `points_of_interest`
  (`id`, `category`, `name`, `distance_meters`, `display_order`)
VALUES
  -- Mercados y Centros Comerciales
  ( 1, 'mercados',      'Mercado Alcalde',                                     950,  1),
  ( 2, 'mercados',      'Mercado Santa Tere',                                 2700,  2),
  ( 3, 'mercados',      'Midtown "Centro Comercial"',                         3200,  3),
  ( 4, 'mercados',      'Plaza Patria "Centro Comercial"',                    4000,  4),
  -- Transporte No Motorizado
  ( 5, 'transporte',    'Tren ligero estación "La Normal"',                    500,  5),
  ( 6, 'transporte',    'Ciclovía Alcalde / Ávila Camacho / Federalismo',      500,  6),
  ( 7, 'transporte',    'Ciclovía Av. Normalistas',                            250,  7),
  -- Centros Universitarios
  ( 8, 'universidades', 'Escuela Normal de Jalisco',                           530,  8),
  ( 9, 'universidades', 'Centro Universitario de Ciencias Sociales y Humanidades', 750, 9),
  -- Hospitales
  (10, 'hospitales',    'Hospital Civil de Guadalajara',                       400, 10),
  (11, 'hospitales',    'Cruz Verde Delgadillo Araujo',                        850, 11),
  -- Parques
  (12, 'parques',       'Parque lineal Av. Normalistas',                       250, 12),
  (13, 'parques',       'Parque Alcalde',                                       800, 13),
  -- Otros Puntos Importantes
  (14, 'otros',         'Centro histórico',                                   1700, 14),
  (15, 'otros',         '"Chapu" Col. Americana',                             3000, 15),
  (16, 'otros',         'Col. Providencia',                                   3600, 16);

-- ── LIV Capital project coordinates in building_config ────────────────────────
-- Placeholder coordinates for La Normal / Alcalde corridor, Guadalajara.
-- Update config_value once exact on-site coordinates are confirmed.
INSERT INTO `building_config`
  (`config_key`, `config_value`, `config_type`, `label`, `description`, `group`, `is_public`)
VALUES
  ('project_lat', '20.6897000', 'string', 'Latitud del proyecto',  'WGS84 latitude — actualizar con coordenadas exactas',  'general', 1),
  ('project_lng', '-103.3493000', 'string', 'Longitud del proyecto', 'WGS84 longitude — actualizar con coordenadas exactas', 'general', 1)
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
