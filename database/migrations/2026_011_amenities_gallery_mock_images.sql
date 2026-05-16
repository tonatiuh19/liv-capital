-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 2026_011_amenities_gallery_mock_images
-- Assigns placeholder images to 4 amenity spaces and enables them in the
-- public gallery section so the PhotoGallery component can be tested locally.
--
-- Images use picsum.photos (stable seed-based placeholders).
-- Replace these URLs with real photos before going to production.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE `amenities`
SET
  `image_url`      = 'https://picsum.photos/seed/gym-liv/800/600',
  `show_in_gallery` = 1
WHERE `name` = 'Gym' AND `type` = 'amenity';

UPDATE `amenities`
SET
  `image_url`      = 'https://picsum.photos/seed/grill-liv/800/600',
  `show_in_gallery` = 1
WHERE `name` = 'Grill Zone' AND `type` = 'amenity';

UPDATE `amenities`
SET
  `image_url`      = 'https://picsum.photos/seed/cowork-liv/800/600',
  `show_in_gallery` = 1
WHERE `name` = 'Coworking & Sala de Juntas' AND `type` = 'amenity';

UPDATE `amenities`
SET
  `image_url`      = 'https://picsum.photos/seed/lounge-liv/800/600',
  `show_in_gallery` = 1
WHERE `name` = 'Sala Lounge' AND `type` = 'amenity';
