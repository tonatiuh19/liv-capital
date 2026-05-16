-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 2026_014_models_columns_reseed_mock
-- Consolidates everything into one safe migration against the live schema.
--
-- What it does:
--   1. Adds columns missing from the live DB (IF NOT EXISTS — safe to re-run):
--        · video_url       (was 2026_006, absent from current schema)
--        · terrace_m2      (new — interior terrace m²)
--        · parking_spaces  (new — parking spots)
--        · storage_units   (new — bodegas)
--   2. Replaces the 5 placeholder models with the 10 real Liv Capital types.
--        ON DELETE CASCADE automatically clears any existing model_images.
--   3. Seeds mock gallery images (picsum.photos) + sample video URLs for testing.
--
-- Supersedes: 2026_012 (placeholder floor ranges), 2026_013 (reseed without mock).
-- Run order:  apply AFTER the base schema. Skip 2026_012 and 2026_013.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Add missing columns (IF NOT EXISTS → idempotent) ──────────────────────

ALTER TABLE `apartment_models`
  ADD COLUMN IF NOT EXISTS `video_url`
    VARCHAR(500) DEFAULT NULL
    AFTER `main_image_url`;

ALTER TABLE `apartment_models`
  ADD COLUMN IF NOT EXISTS `terrace_m2`
    DECIMAL(8,2) DEFAULT NULL
    AFTER `area_sqm`;

ALTER TABLE `apartment_models`
  ADD COLUMN IF NOT EXISTS `parking_spaces`
    TINYINT(4) NOT NULL DEFAULT 0
    AFTER `bathrooms`;

ALTER TABLE `apartment_models`
  ADD COLUMN IF NOT EXISTS `storage_units`
    TINYINT(4) NOT NULL DEFAULT 1
    AFTER `parking_spaces`;


-- ── 2. Clear placeholder models (CASCADE removes orphaned model_images) ───────

DELETE FROM `apartment_models`;
ALTER TABLE `apartment_models` AUTO_INCREMENT = 1;


-- ── 3. Insert the 10 real unit types ─────────────────────────────────────────
--
-- Floor layout (abbreviated — model J skips floor 6, floor_max=7 is approx):
--   PB (0)   AT · FT · H
--   2–3      A  · E  · J · K · L · F
--   4–5      N  · F  · J · K · L
--   6        N  · K  · L
--   7        N  · J  · K · L
--
-- Columns: name, slug, type, bedrooms, bathrooms,
--          area_sqm (interior), terrace_m2, parking_spaces, storage_units,
--          floor_min, floor_max, is_available, is_featured, display_order,
--          main_image_url, video_url

INSERT INTO `apartment_models`
  (`name`, `slug`, `type`, `bedrooms`, `bathrooms`,
   `area_sqm`, `terrace_m2`, `parking_spaces`, `storage_units`,
   `floor_min`, `floor_max`, `is_available`, `is_featured`, `display_order`,
   `main_image_url`, `video_url`)
VALUES
  -- ── Planta Baja ────────────────────────────────────────────────────────────
  -- AT: 1 rec · interior 37.47 m² · terraza 15.01 m² · total 52.48 m²
  ('Modelo AT', 'at', '1bed', 1, 1,  37.47, 15.01, 0, 1,  0, 0,  1, 1,  1,
   'https://picsum.photos/seed/liv-at-hero/900/600',
   'https://www.youtube.com/embed/dQw4w9WgXcQ'),

  -- FT: 3 rec · interior 80.51 m² · terraza 7.57 m² · total 88.08 m² · 1 cajón
  ('Modelo FT', 'ft', '3bed', 3, 2,  80.51,  7.57, 1, 1,  0, 0,  1, 0,  2,
   'https://picsum.photos/seed/liv-ft-hero/900/600',
   'https://www.youtube.com/embed/dQw4w9WgXcQ'),

  -- H:  1 rec · interior 41.28 m² · total ~42.78 m²
  ('Modelo H',  'h',  '1bed', 1, 1,  41.28,  NULL, 0, 1,  0, 0,  1, 0,  3,
   'https://picsum.photos/seed/liv-h-hero/900/600',
   NULL),

  -- ── Planta 2–3 only ────────────────────────────────────────────────────────
  -- A:  1 rec · interior 37.47 m²
  ('Modelo A',  'a',  '1bed', 1, 1,  37.47,  NULL, 0, 1,  2, 3,  1, 0,  4,
   'https://picsum.photos/seed/liv-a-hero/900/600',
   NULL),

  -- E:  1 rec · interior 41.03 m²
  ('Modelo E',  'e',  '1bed', 1, 1,  41.03,  NULL, 0, 1,  2, 3,  1, 0,  5,
   'https://picsum.photos/seed/liv-e-hero/900/600',
   NULL),

  -- ── Multi-floor 1-bed ─────────────────────────────────────────────────────
  -- J:  1 rec · ~49.49 m² · floors 2–3, 4, 5, 7 (floor_max=7 approx)
  ('Modelo J',  'j',  '1bed', 1, 1,  49.49,  NULL, 0, 1,  2, 7,  1, 0,  6,
   'https://picsum.photos/seed/liv-j-hero/900/600',
   NULL),

  -- K:  1 rec · ~46.79 m² · floors 2–7
  ('Modelo K',  'k',  '1bed', 1, 1,  46.79,  NULL, 0, 1,  2, 7,  1, 0,  7,
   'https://picsum.photos/seed/liv-k-hero/900/600',
   NULL),

  -- L:  1 rec · ~48.50 m² · floors 2–7
  ('Modelo L',  'l',  '1bed', 1, 1,  48.50,  NULL, 0, 1,  2, 7,  1, 0,  8,
   'https://picsum.photos/seed/liv-l-hero/900/600',
   NULL),

  -- ── 3-bed model ────────────────────────────────────────────────────────────
  -- F:  3 rec · ~81.74 m² · floors 2–5 · 1 cajón
  ('Modelo F',  'f',  '3bed', 3, 2,  81.74,  NULL, 1, 1,  2, 5,  1, 0,  9,
   'https://picsum.photos/seed/liv-f-hero/900/600',
   NULL),

  -- ── Upper floors 1-bed ────────────────────────────────────────────────────
  -- N:  1 rec · ~41.98 m² · floors 4–7
  ('Modelo N',  'n',  '1bed', 1, 1,  41.98,  NULL, 0, 1,  4, 7,  1, 0, 10,
   'https://picsum.photos/seed/liv-n-hero/900/600',
   NULL);


-- ── 4. Mock gallery images ────────────────────────────────────────────────────
-- Slug-based subqueries avoid hardcoded IDs after AUTO_INCREMENT reset.
-- Each model gets 2–3 images covering common room types.

INSERT INTO `model_images` (`model_id`, `image_url`, `caption`, `display_order`)

-- Modelo AT (with terrace — 3 shots)
SELECT id, 'https://picsum.photos/seed/liv-at-sala/900/600',    'Sala',     1 FROM `apartment_models` WHERE slug = 'at' UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-at-rec/900/600',     'Recámara', 2 FROM `apartment_models` WHERE slug = 'at' UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-at-ter/900/600',     'Terraza',  3 FROM `apartment_models` WHERE slug = 'at' UNION ALL

-- Modelo FT (3-bed with terrace — 3 shots)
SELECT id, 'https://picsum.photos/seed/liv-ft-sala/900/600',    'Sala',      1 FROM `apartment_models` WHERE slug = 'ft' UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-ft-coc/900/600',     'Cocina',    2 FROM `apartment_models` WHERE slug = 'ft' UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-ft-ter/900/600',     'Terraza',   3 FROM `apartment_models` WHERE slug = 'ft' UNION ALL

-- Modelo H (2 shots)
SELECT id, 'https://picsum.photos/seed/liv-h-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'h'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-h-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'h'  UNION ALL

-- Modelo A (2 shots)
SELECT id, 'https://picsum.photos/seed/liv-a-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'a'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-a-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'a'  UNION ALL

-- Modelo E (2 shots)
SELECT id, 'https://picsum.photos/seed/liv-e-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'e'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-e-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'e'  UNION ALL

-- Modelo J (3 shots)
SELECT id, 'https://picsum.photos/seed/liv-j-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'j'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-j-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'j'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-j-ban/900/600',      'Baño',      3 FROM `apartment_models` WHERE slug = 'j'  UNION ALL

-- Modelo K (2 shots)
SELECT id, 'https://picsum.photos/seed/liv-k-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'k'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-k-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'k'  UNION ALL

-- Modelo L (3 shots)
SELECT id, 'https://picsum.photos/seed/liv-l-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'l'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-l-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'l'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-l-ban/900/600',      'Baño',      3 FROM `apartment_models` WHERE slug = 'l'  UNION ALL

-- Modelo F (3-bed — 3 shots)
SELECT id, 'https://picsum.photos/seed/liv-f-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'f'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-f-coc/900/600',      'Cocina',    2 FROM `apartment_models` WHERE slug = 'f'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-f-rec/900/600',      'Recámaras', 3 FROM `apartment_models` WHERE slug = 'f'  UNION ALL

-- Modelo N (2 shots)
SELECT id, 'https://picsum.photos/seed/liv-n-sala/900/600',     'Sala',      1 FROM `apartment_models` WHERE slug = 'n'  UNION ALL
SELECT id, 'https://picsum.photos/seed/liv-n-rec/900/600',      'Recámara',  2 FROM `apartment_models` WHERE slug = 'n';
