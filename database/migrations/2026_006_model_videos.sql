-- Migration: 2026_006_model_videos
-- Adds video_url to apartment_models for embedded video support on detail page.

ALTER TABLE `apartment_models`
  ADD COLUMN IF NOT EXISTS `video_url` varchar(500) DEFAULT NULL
  COMMENT 'YouTube or Vimeo embed URL (e.g. https://www.youtube.com/embed/ID)'
  AFTER `main_image_url`;
