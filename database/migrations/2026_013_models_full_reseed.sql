-- ─────────────────────────────────────────────────────────────────────────────
-- ⚠ SUPERSEDED — DO NOT run this migration.
--   Use 2026_014_models_columns_reseed_mock.sql instead.
--   That file adds everything here PLUS video_url column and mock data.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Migration: 2026_013_models_full_reseed (SUPERSEDED by 2026_014)
-- Absorbs 2026_012 (floor ranges were only for old placeholder models).
--
-- • Adds terrace_m2, parking_spaces, storage_units columns
-- • Deletes the 5 placeholder models (Studio, Suite 1-3, Penthouse)
--   → ON DELETE CASCADE also clears any orphaned model_images rows
-- • Inserts 10 real Liv Capital unit types (letter-coded per brochure)
--   with floor ranges already embedded in INSERT values
--
-- Run order: SKIP — superseded by 2026_014.
--
-- Building layout:
--   PB (0)   → AT, FT, H
--   2–3      → A, E, J, K, L, F
--   4–5      → N, F, J, K, L
--   6        → N, K, L
--   7        → N, J, K, L
--
-- floor_min / floor_max represent the full range each model letter appears
-- in. (Model J skips floor 6 but floor_max=7 is used as an approximation.)
-- Model images are uploaded via the Admin panel after deployment.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add new measurement columns ───────────────────────────────────────────
ALTER TABLE `apartment_models`
  ADD COLUMN `terrace_m2`     DECIMAL(8,2)  DEFAULT NULL          AFTER `area_sqm`,
  ADD COLUMN `parking_spaces` TINYINT(4)    NOT NULL DEFAULT 0    AFTER `bathrooms`,
  ADD COLUMN `storage_units`  TINYINT(4)    NOT NULL DEFAULT 1    AFTER `parking_spaces`;

-- ── 2. Clear old placeholder models ──────────────────────────────────────────
-- Using DELETE (not TRUNCATE) so ON DELETE CASCADE removes orphaned model_images
DELETE FROM `apartment_models`;
ALTER TABLE `apartment_models` AUTO_INCREMENT = 1;

-- ── 3. Insert real unit types ─────────────────────────────────────────────────
-- Columns: name, slug, type, bedrooms, bathrooms, area_sqm (interior), terrace_m2,
--          parking_spaces, storage_units, floor_min, floor_max,
--          is_available, is_featured, display_order
INSERT INTO `apartment_models`
  (`name`, `slug`, `type`, `bedrooms`, `bathrooms`,
   `area_sqm`, `terrace_m2`, `parking_spaces`, `storage_units`,
   `floor_min`, `floor_max`, `is_available`, `is_featured`, `display_order`)
VALUES
  -- ── Planta Baja ────────────────────────────────────────────────────────────
  -- AT: 1 rec, terrace 15.01 m², interior 37.47 m², total 53.94 m²
  ('Modelo AT', 'at', '1bed', 1, 1,  37.47, 15.01, 0, 1,  0, 0,  1, 1,  1),
  -- FT: 3 rec, terrace 7.57 m², interior 80.51 m², total 89.43 m², 1 parking
  ('Modelo FT', 'ft', '3bed', 3, 2,  80.51,  7.57, 1, 1,  0, 0,  1, 0,  2),
  -- H:  1 rec, interior 41.28 m², total 42.78 m²
  ('Modelo H',  'h',  '1bed', 1, 1,  41.28,  NULL, 0, 1,  0, 0,  1, 0,  3),

  -- ── Planta 2–3 only ────────────────────────────────────────────────────────
  -- A:  1 rec, interior 37.47 m², total 38.92 m²
  ('Modelo A',  'a',  '1bed', 1, 1,  37.47,  NULL, 0, 1,  2, 3,  1, 0,  4),
  -- E:  1 rec, interior 41.03 m², total 44.14 m²
  ('Modelo E',  'e',  '1bed', 1, 1,  41.03,  NULL, 0, 1,  2, 3,  1, 0,  5),

  -- ── Multi-floor 1-bedroom ─────────────────────────────────────────────────
  -- J:  1 rec, ~49.49 m², Plantas 2-3, 4, 5, 7  (floor_max=7, range approx.)
  ('Modelo J',  'j',  '1bed', 1, 1,  49.49,  NULL, 0, 1,  2, 7,  1, 0,  6),
  -- K:  1 rec, ~46.79 m², Plantas 2-3, 4, 5, 6, 7
  ('Modelo K',  'k',  '1bed', 1, 1,  46.79,  NULL, 0, 1,  2, 7,  1, 0,  7),
  -- L:  1 rec, ~48.50 m², Plantas 2-3, 4, 5, 6, 7
  ('Modelo L',  'l',  '1bed', 1, 1,  48.50,  NULL, 0, 1,  2, 7,  1, 0,  8),

  -- ── 3-bedroom model ────────────────────────────────────────────────────────
  -- F:  3 rec, ~81.74 m², Plantas 2-3, 4, 5 — 1 parking
  ('Modelo F',  'f',  '3bed', 3, 2,  81.74,  NULL, 1, 1,  2, 5,  1, 0,  9),

  -- ── Upper floors 1-bedroom ────────────────────────────────────────────────
  -- N:  1 rec, ~41.98 m², Plantas 4, 5, 6, 7
  ('Modelo N',  'n',  '1bed', 1, 1,  41.98,  NULL, 0, 1,  4, 7,  1, 0, 10);
