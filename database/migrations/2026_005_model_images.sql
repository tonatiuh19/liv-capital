-- Migration: 2026_005_model_images
-- Adds main_image_url to apartment_models and creates the model_images gallery table.

ALTER TABLE `apartment_models`
  ADD COLUMN IF NOT EXISTS `main_image_url` varchar(500) DEFAULT NULL
  AFTER `floor_plan_url`;

CREATE TABLE IF NOT EXISTS `model_images` (
  `id`            int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `model_id`      int(10) UNSIGNED NOT NULL,
  `image_url`     varchar(500) NOT NULL,
  `caption`       varchar(255) DEFAULT NULL,
  `display_order` int(10) NOT NULL DEFAULT 0,
  `created_at`    datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_model_images_model` (`model_id`),
  CONSTRAINT `fk_model_images_model`
    FOREIGN KEY (`model_id`) REFERENCES `apartment_models` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
