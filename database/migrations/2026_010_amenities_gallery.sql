-- 2026_010_amenities_gallery.sql
-- Adds show_in_gallery flag so admins can choose which amenity photos appear
-- in the public-facing photo gallery section (up to 4 photos shown).

ALTER TABLE `amenities`
  ADD COLUMN `show_in_gallery` TINYINT(1) NOT NULL DEFAULT 0 AFTER `type`;
