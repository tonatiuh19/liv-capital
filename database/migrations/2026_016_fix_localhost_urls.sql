-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 2026_016 — Strip localhost:9000 origin from stored asset URLs
--
-- Problem: upload endpoints were returning absolute URLs using APP_URL, which
-- was set to http://localhost:9000 in local dev. These absolute localhost URLs
-- got stored in the DB. In production they resolve to nothing.
--
-- Fix: convert all http://localhost:9000/uploads/... paths to relative paths
-- (/uploads/...) so they work on any domain.
-- ─────────────────────────────────────────────────────────────────────────────

-- apartment_models: main_image_url
UPDATE apartment_models
SET main_image_url = REPLACE(main_image_url, 'http://localhost:9000', '')
WHERE main_image_url LIKE 'http://localhost:9000/%';

-- apartment_models: floor_plan_url
UPDATE apartment_models
SET floor_plan_url = REPLACE(floor_plan_url, 'http://localhost:9000', '')
WHERE floor_plan_url LIKE 'http://localhost:9000/%';

-- model_images: image_url
UPDATE model_images
SET image_url = REPLACE(image_url, 'http://localhost:9000', '')
WHERE image_url LIKE 'http://localhost:9000/%';

-- amenities: image_url
UPDATE amenities
SET image_url = REPLACE(image_url, 'http://localhost:9000', '')
WHERE image_url LIKE 'http://localhost:9000/%';

-- gallery_images: image_url
UPDATE gallery_images
SET image_url = REPLACE(image_url, 'http://localhost:9000', '')
WHERE image_url LIKE 'http://localhost:9000/%';
