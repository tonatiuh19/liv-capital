-- ============================================================
-- 2026_015_gallery_images.sql
-- Creates the gallery_images table for the public gallery section.
-- Safe to run multiple times (IF NOT EXISTS).
-- ============================================================

CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title`         VARCHAR(200)    NOT NULL,
  `description`   VARCHAR(500)    DEFAULT NULL,
  `image_url`     VARCHAR(500)    NOT NULL,
  `category`      ENUM('arquitectura','amenidades','interiores') NOT NULL DEFAULT 'arquitectura',
  `display_order` SMALLINT        NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
