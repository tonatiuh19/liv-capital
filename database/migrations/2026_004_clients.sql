-- Migration: 2026_004_clients
-- Creates the clients table and links visit_bookings + contact_submissions to it.

CREATE TABLE IF NOT EXISTS `clients` (
  `id`              int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`           varchar(255) NOT NULL,
  `name`            varchar(120) NOT NULL,
  `phone`           varchar(30) DEFAULT NULL,
  `interest`        enum('studio','1bed','2bed','3bed','penthouse','general','investment','other') DEFAULT 'general',
  `tags`            json DEFAULT NULL COMMENT 'Array of strings: hot_lead, cold_lead, investor, vip, needs_followup, no_contact',
  `admin_notes`     text DEFAULT NULL,
  `first_source`    varchar(100) DEFAULT NULL COMMENT 'booking | contact_form',
  `last_contact_at` datetime DEFAULT NULL,
  `created_at`      datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at`      datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clients_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add client_id to visit_bookings
ALTER TABLE `visit_bookings`
  ADD COLUMN IF NOT EXISTS `client_id` int(10) UNSIGNED DEFAULT NULL AFTER `id`;

ALTER TABLE `visit_bookings`
  DROP FOREIGN KEY IF EXISTS `fk_bookings_client`;
ALTER TABLE `visit_bookings`
  ADD CONSTRAINT `fk_bookings_client`
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

-- Add client_id to contact_submissions
ALTER TABLE `contact_submissions`
  ADD COLUMN IF NOT EXISTS `client_id` int(10) UNSIGNED DEFAULT NULL AFTER `id`;

ALTER TABLE `contact_submissions`
  DROP FOREIGN KEY IF EXISTS `fk_contacts_client`;
ALTER TABLE `contact_submissions`
  ADD CONSTRAINT `fk_contacts_client`
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

-- -------------------------------------------------------
-- Backfill: create clients from existing visit_bookings
-- INSERT IGNORE skips duplicates (unique key on email)
-- ORDER BY created_at ASC ensures first_source reflects
-- the very first submission from each email address.
-- -------------------------------------------------------
INSERT IGNORE INTO `clients` (`email`, `name`, `phone`, `interest`, `first_source`, `last_contact_at`, `created_at`, `updated_at`)
SELECT
  `visitor_email`,
  `visitor_name`,
  `visitor_phone`,
  `visitor_interest`,
  'booking',
  `created_at`,
  `created_at`,
  `updated_at`
FROM `visit_bookings`
WHERE `visitor_email` IS NOT NULL AND `visitor_email` <> ''
ORDER BY `created_at` ASC;

-- Backfill: create clients from existing contact_submissions
-- (emails already present from bookings are skipped)
INSERT IGNORE INTO `clients` (`email`, `name`, `phone`, `interest`, `first_source`, `last_contact_at`, `created_at`, `updated_at`)
SELECT
  `email`,
  `name`,
  `phone`,
  `interest`,
  'contact_form',
  `created_at`,
  `created_at`,
  `updated_at`
FROM `contact_submissions`
WHERE `email` IS NOT NULL AND `email` <> ''
ORDER BY `created_at` ASC;

-- Update last_contact_at to the most recent event across both tables
UPDATE `clients` c
SET `last_contact_at` = GREATEST(
  COALESCE((SELECT MAX(vb.`created_at`) FROM `visit_bookings` vb WHERE vb.`visitor_email` = c.`email`), '1000-01-01 00:00:00'),
  COALESCE((SELECT MAX(cs.`created_at`) FROM `contact_submissions` cs WHERE cs.`email` = c.`email`), '1000-01-01 00:00:00')
);

-- Wire up client_id on existing visit_bookings rows
UPDATE `visit_bookings` vb
INNER JOIN `clients` c ON c.`email` = vb.`visitor_email`
SET vb.`client_id` = c.`id`;

-- Wire up client_id on existing contact_submissions rows
UPDATE `contact_submissions` cs
INNER JOIN `clients` c ON c.`email` = cs.`email`
SET cs.`client_id` = c.`id`;
