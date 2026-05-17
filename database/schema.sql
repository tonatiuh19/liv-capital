-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 17, 2026 at 04:40 PM
-- Server version: 11.4.10-MariaDB-cll-lve
-- PHP Version: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gmwbyxyp_liv_capital`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('superadmin','admin') NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(2, 'Alex Gomez', 'alex@disruptinglabs.com', 'superadmin', 1, '2026-05-13 19:21:22', '2026-05-13 14:59:32', '2026-05-13 19:21:22');

-- --------------------------------------------------------

--
-- Table structure for table `admin_sessions`
--

CREATE TABLE `admin_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `admin_id` int(10) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL COMMENT 'hash of the bearer token stored in HttpOnly cookie',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_sessions`
--

INSERT INTO `admin_sessions` (`id`, `admin_id`, `token_hash`, `ip_address`, `user_agent`, `expires_at`, `revoked_at`, `created_at`) VALUES
(1, 2, 'bca929ed614c46d37903787ce536f211347cc1d13897e2c66473906748512e3c', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-20 19:05:07', '2026-05-13 18:09:03', '2026-05-13 15:05:06'),
(2, 2, 'aefe346dbda51c7c9970e345175c07a3daeb25cb59fe755edfb5771d0f24ae11', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-05-20 23:21:22', NULL, '2026-05-13 19:21:22');

-- --------------------------------------------------------

--
-- Table structure for table `amenities`
--

CREATE TABLE `amenities` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL COMMENT 'lucide icon name or SVG path',
  `image_url` varchar(500) DEFAULT NULL,
  `category` varchar(80) DEFAULT NULL COMMENT 'wellness | social | security | services',
  `type` enum('amenity','facility') NOT NULL DEFAULT 'amenity',
  `show_in_gallery` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` smallint(6) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `amenities`
--

INSERT INTO `amenities` (`id`, `name`, `description`, `icon`, `image_url`, `category`, `type`, `show_in_gallery`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Pet Park & Pet Shower', 'Parque de mascotas con bebedero y secador de aire climatizado', 'paw-print', NULL, 'social', 'amenity', 0, 1, 1, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(2, 'Gym', 'Área de fitness y wellness con equipos de última generación', 'dumbbell', '/uploads/amenities/76a4357f00cf01f3de7684cf4ffe8744.png', 'wellness', 'amenity', 1, 1, 2, '2026-05-15 21:22:08', '2026-05-17 15:49:35'),
(3, 'Coworking & Sala de Juntas', 'Estaciones de trabajo colaborativo y sala de reuniones privada', 'laptop', '/uploads/amenities/0859f71642a3ba26a2057868e4b00832.png', 'services', 'amenity', 1, 1, 3, '2026-05-15 21:22:08', '2026-05-17 15:49:54'),
(4, 'Grill Zone', 'Espacios sociales con asadores para convivir con familia y amigos', 'flame', '/uploads/amenities/96f1d08f5dae8e0168ccf2e2bcf712bc.png', 'social', 'amenity', 1, 1, 4, '2026-05-15 21:22:08', '2026-05-17 15:50:06'),
(5, 'Lavandería', 'Área de lavandería compartida con equipos de alta eficiencia', 'shirt', NULL, 'services', 'amenity', 0, 1, 5, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(6, 'Playground', 'Zona de juegos segura para los más pequeños', 'baby', NULL, 'social', 'amenity', 0, 1, 6, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(7, 'Salón de Juego para Jóvenes', 'Área de entretenimiento y juegos para adolescentes y adultos', 'gamepad-2', NULL, 'social', 'amenity', 0, 1, 7, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(8, 'Sala de Lectura', 'Biblioteca tranquila y espacio de lectura con buena iluminación', 'book-open', NULL, 'social', 'amenity', 0, 1, 8, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(9, 'Sala Lounge', 'Área de descanso y convivencia con diseño contemporáneo', 'coffee', '/uploads/amenities/73bd397ecd2afb2c893b82492e0f069c.png', 'social', 'amenity', 1, 1, 9, '2026-05-15 21:22:08', '2026-05-17 16:27:25'),
(10, 'Área de Amacas', 'Espacio de relajación exterior con hamacas y jardín', 'sunset', NULL, 'wellness', 'amenity', 0, 1, 10, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(11, 'Sharing Room', 'Espacio compartido multifuncional para la comunidad de residentes', 'users', NULL, 'social', 'amenity', 0, 1, 11, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(12, 'Espacios Comunes Premium', 'Gimnasio // Pet Park // Coworking // Playground niños // Salón de juegos adultos // Sala de lectura // Sala Lounge // Área de hamacas // Sharing room', 'building-2', NULL, 'services', 'facility', 0, 1, 1, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(13, 'Pet Park Premium', 'Parque de mascotas con bebedero y área para bañarlos con agua climatizada y secador de aire', 'paw-print', NULL, 'social', 'facility', 0, 1, 2, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(14, 'Trabajo Colaborativo', 'Con sala de juntas y estaciones de trabajo colaborativo', 'briefcase', NULL, 'services', 'facility', 0, 1, 3, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(15, 'Seguridad Avanzada', 'Accesos con alarma y filtros biométricos que mejoran la función de los guardias de seguridad // materiales de construcción libres de mantenimiento', 'shield-check', NULL, 'security', 'facility', 0, 1, 4, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(16, 'Movilidad Verde', 'En planta baja para scooter y bicicletas eléctricas con área de guardado antirobo', 'zap', NULL, 'services', 'facility', 0, 1, 5, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(17, 'Convivencia Social', 'Espacios sociales para convivencia con amigos, familia y mascotas', 'users', NULL, 'social', 'facility', 0, 1, 6, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(18, 'Fitness & Wellness', 'Áreas de fitness y wellness con riego automático en jardines', 'dumbbell', NULL, 'wellness', 'facility', 0, 1, 7, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(19, 'Jardines con Riego Automático', 'En todos los departamentos y con riego automático', 'leaf', NULL, 'social', 'facility', 0, 1, 8, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(20, 'Departamentos Flexibles', 'Cama que se oculta convirtiendo el espacio del departamento en adaptable y flexible // Bodega en sótano para guardar elementos no esenciales', 'maximize-2', NULL, 'services', 'facility', 0, 1, 9, '2026-05-15 21:22:08', '2026-05-15 21:22:08'),
(21, 'Gadgets & Accesorios', 'Accesorios y gadgets funcionales incluidos en los departamentos', 'smartphone', NULL, 'services', 'facility', 0, 1, 10, '2026-05-15 21:22:08', '2026-05-15 21:22:08');

-- --------------------------------------------------------

--
-- Table structure for table `apartment_models`
--

CREATE TABLE `apartment_models` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'e.g. Studio, Suite 1, Penthouse',
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('studio','1bed','2bed','3bed','penthouse','commercial') NOT NULL DEFAULT 'studio',
  `bedrooms` tinyint(4) NOT NULL DEFAULT 0,
  `bathrooms` tinyint(4) NOT NULL DEFAULT 1,
  `parking_spaces` tinyint(4) NOT NULL DEFAULT 0,
  `storage_units` tinyint(4) NOT NULL DEFAULT 1,
  `area_sqm` decimal(8,2) DEFAULT NULL,
  `terrace_m2` decimal(8,2) DEFAULT NULL,
  `area_sqft` decimal(8,2) DEFAULT NULL,
  `floor_min` tinyint(4) DEFAULT NULL,
  `floor_max` tinyint(4) DEFAULT NULL,
  `price_from` decimal(14,2) DEFAULT NULL,
  `price_to` decimal(14,2) DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MXN',
  `floor_plan_url` varchar(500) DEFAULT NULL,
  `main_image_url` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `gallery_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["url1","url2",...]' CHECK (json_valid(`gallery_images`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["Terraza","Jacuzzi",...]' CHECK (json_valid(`features`)),
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `units_total` smallint(6) DEFAULT NULL,
  `units_available` smallint(6) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` smallint(6) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `apartment_models`
--

INSERT INTO `apartment_models` (`id`, `name`, `slug`, `description`, `type`, `bedrooms`, `bathrooms`, `parking_spaces`, `storage_units`, `area_sqm`, `terrace_m2`, `area_sqft`, `floor_min`, `floor_max`, `price_from`, `price_to`, `currency`, `floor_plan_url`, `main_image_url`, `video_url`, `gallery_images`, `features`, `is_available`, `units_total`, `units_available`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Modelo AT', 'at', '', '1bed', 1, 1, 0, 1, 37.47, 15.01, NULL, 0, 0, NULL, NULL, 'MXN', '', '/uploads/models/894c0222274bc9f6feff7184ed48640f.png', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, NULL, 1, NULL, NULL, 1, 1, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(2, 'Modelo FT', 'ft', '', '3bed', 3, 2, 1, 1, 80.51, 7.57, NULL, 0, 0, NULL, NULL, 'MXN', '', '/uploads/models/f83b749105ddfc6ee784528bc30504de.png', 'https://www.youtube.com/embed/dQw4w9WgXcQ', NULL, NULL, 1, NULL, NULL, 0, 2, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(3, 'Modelo H', 'h', '', '1bed', 1, 1, 0, 1, 41.28, NULL, NULL, 0, 0, NULL, NULL, 'MXN', '', '/uploads/models/e6dfacf4fbebcad3204fced8a8504c9e.png', '', NULL, NULL, 1, NULL, NULL, 0, 3, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(4, 'Modelo A', 'a', '', '1bed', 1, 1, 0, 1, 37.47, NULL, NULL, 2, 3, NULL, NULL, 'MXN', '', '/uploads/models/112fbbf1c63e15be272c43d6aef3256b.png', '', NULL, NULL, 1, NULL, NULL, 0, 4, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(5, 'Modelo E', 'e', '', '1bed', 1, 1, 0, 1, 41.03, NULL, NULL, 2, 3, NULL, NULL, 'MXN', '', '/uploads/models/0a575d12303aa676e46f828d5aec0f9c.png', '', NULL, NULL, 1, NULL, NULL, 0, 5, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(6, 'Modelo J', 'j', '', '1bed', 1, 1, 0, 1, 49.49, NULL, NULL, 2, 7, NULL, NULL, 'MXN', '', '/uploads/models/5ac9753548fa60e66a41097706d6ec19.png', '', NULL, NULL, 1, NULL, NULL, 0, 6, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(7, 'Modelo K', 'k', '', '1bed', 1, 1, 0, 1, 46.79, NULL, NULL, 2, 7, NULL, NULL, 'MXN', '', '/uploads/models/66294ef4db3ef37c3194ff63b939fdda.png', '', NULL, NULL, 1, NULL, NULL, 0, 7, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(8, 'Modelo L', 'l', '', '1bed', 1, 1, 0, 1, 48.50, NULL, NULL, 2, 7, NULL, NULL, 'MXN', '', '/uploads/models/b1cad0d3dd2ef59c4ca69623943e938f.png', '', NULL, NULL, 1, NULL, NULL, 0, 8, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(9, 'Modelo F', 'f', '', '3bed', 3, 2, 1, 1, 81.74, NULL, NULL, 2, 5, NULL, NULL, 'MXN', '', '/uploads/models/f10f514ffe945d71adf8622a988f657c.png', '', NULL, NULL, 1, NULL, NULL, 0, 9, '2026-05-15 22:32:50', '2026-05-16 02:57:55'),
(10, 'Modelo N', 'n', '', '1bed', 1, 1, 0, 1, 41.98, NULL, NULL, 4, 7, NULL, NULL, 'MXN', '', '/uploads/models/93ef56d5233ac85e223a048c4d30116d.png', '', NULL, NULL, 1, NULL, NULL, 0, 10, '2026-05-15 22:32:50', '2026-05-16 02:57:55');

-- --------------------------------------------------------

--
-- Table structure for table `booking_events`
--

CREATE TABLE `booking_events` (
  `id` int(10) UNSIGNED NOT NULL,
  `booking_id` int(10) UNSIGNED NOT NULL,
  `event_type` enum('created','confirmed','reminder_sent','email_opened','edit_link_clicked','cancel_link_clicked','rescheduled','cancelled','completed','no_show','admin_note_added','admin_status_changed') NOT NULL,
  `triggered_by` enum('visitor','admin','system') NOT NULL DEFAULT 'system',
  `admin_id` int(10) UNSIGNED DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'extra event data' CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_events`
--

INSERT INTO `booking_events` (`id`, `booking_id`, `event_type`, `triggered_by`, `admin_id`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'created', 'visitor', NULL, NULL, '::1', NULL, '2026-05-13 18:15:39');

-- --------------------------------------------------------

--
-- Table structure for table `building_config`
--

CREATE TABLE `building_config` (
  `id` int(10) UNSIGNED NOT NULL,
  `config_key` varchar(100) NOT NULL COMMENT 'e.g. whatsapp_number, address, total_units',
  `config_value` text DEFAULT NULL,
  `config_type` enum('string','integer','boolean','json','markdown','url','email','phone') NOT NULL DEFAULT 'string',
  `label` varchar(150) NOT NULL COMMENT 'Human-readable label for admin panel',
  `description` varchar(500) DEFAULT NULL,
  `group` varchar(80) DEFAULT 'general' COMMENT 'general | contact | social | seo | visits | email',
  `is_public` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'expose via public API endpoint',
  `updated_by` int(10) UNSIGNED DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `building_config`
--

INSERT INTO `building_config` (`id`, `config_key`, `config_value`, `config_type`, `label`, `description`, `group`, `is_public`, `updated_by`, `updated_at`) VALUES
(1, 'whatsapp_number', '+523312345678', 'phone', 'WhatsApp', 'Número de WhatsApp con código de país', 'contact', 1, NULL, '2026-05-12 20:45:02'),
(2, 'contact_email', 'info@livcapital.com', 'email', 'Email de contacto', 'Email principal de contacto', 'contact', 1, NULL, '2026-05-12 20:45:02'),
(3, 'contact_phone', '+52 (33) 1234 5678', 'phone', 'Teléfono', 'Teléfono de oficina de ventas', 'contact', 1, NULL, '2026-05-12 20:45:02'),
(4, 'address', 'Guadalajara, Jalisco, México', 'string', 'Dirección', 'Dirección del desarrollo', 'contact', 1, NULL, '2026-05-12 20:45:02'),
(5, 'google_maps_url', '', 'url', 'Google Maps URL', 'URL del pin en Google Maps', 'contact', 1, NULL, '2026-05-12 20:45:02'),
(6, 'instagram_url', '', 'url', 'Instagram', 'URL del perfil de Instagram', 'social', 1, NULL, '2026-05-12 20:45:02'),
(7, 'facebook_url', '', 'url', 'Facebook', 'URL del perfil de Facebook', 'social', 1, NULL, '2026-05-12 20:45:02'),
(8, 'linkedin_url', '', 'url', 'LinkedIn', 'URL del perfil de LinkedIn', 'social', 1, NULL, '2026-05-12 20:45:02'),
(9, 'total_floors', '8', 'integer', 'Número de plantas', 'Total de pisos del edificio', 'general', 1, NULL, '2026-05-12 20:45:02'),
(10, 'total_units', '125', 'integer', 'Total departamentos', 'Total de unidades del proyecto', 'general', 1, NULL, '2026-05-12 20:45:02'),
(11, 'total_amenities', '12', 'integer', 'Total amenidades', 'Número de amenidades', 'general', 1, NULL, '2026-05-12 20:45:02'),
(12, 'delivery_estimate', 'Segundo semestre 2026', 'string', 'Fecha de entrega', 'Estimado de entrega del proyecto', 'general', 1, NULL, '2026-05-12 20:45:02'),
(13, 'construction_stage', 'Preventa', 'string', 'Etapa de construcción', 'Etapa actual del desarrollo', 'general', 1, NULL, '2026-05-12 20:45:02'),
(14, 'visit_slot_duration_minutes', '60', 'integer', 'Duración de cita (min)', 'Duración por defecto de cada cita', 'visits', 1, NULL, '2026-05-12 20:45:02'),
(15, 'visit_booking_advance_days', '30', 'integer', 'Días de anticipación', 'Máximo de días a futuro para agendar', 'visits', 1, NULL, '2026-05-12 20:45:02'),
(16, 'visit_min_advance_hours', '24', 'integer', 'Horas mínimas previas', 'Mínimo de horas para agendar con anticipación', 'visits', 1, NULL, '2026-05-12 20:45:02'),
(17, 'visit_cancel_token_hours', '48', 'integer', 'Validez token cancelar', 'Horas de validez del link de cancelación', 'visits', 1, NULL, '2026-05-12 20:45:02'),
(18, 'visit_edit_token_hours', '48', 'integer', 'Validez token editar', 'Horas de validez del link de edición', 'visits', 1, NULL, '2026-05-12 20:45:02'),
(19, 'visit_reminder_hours_before', '24', 'integer', 'Recordatorio (horas)', 'Horas antes de la visita para enviar recordatorio', 'visits', 1, NULL, '2026-05-12 20:45:02'),
(20, 'email_from_name', 'LIV CAPITAL', 'string', 'Nombre remitente', 'Nombre que aparece en los correos enviados', 'email', 1, NULL, '2026-05-12 20:45:02'),
(21, 'email_from_address', 'noreply@livcapital.com', 'email', 'Email remitente', 'Dirección de correo remitente', 'email', 1, NULL, '2026-05-12 20:45:02'),
(22, 'admin_notify_email', 'admin@livcapital.com', 'email', 'Email notif. admin', 'Email que recibe notificaciones de nuevas reservas y contactos', 'email', 1, NULL, '2026-05-12 20:45:02'),
(23, 'site_title', 'LIV CAPITAL — Vivienda Vertical Luxury en Guadalajara', 'string', 'Título del sitio', 'Meta title principal', 'seo', 1, NULL, '2026-05-12 20:45:02'),
(24, 'site_description', 'Departamentos de lujo en Guadalajara, Jalisco. Arquitectura contemporánea, amenidades premium y ubicación privilegiada.', 'string', 'Descripción del sitio', 'Meta description principal', 'seo', 1, NULL, '2026-05-12 20:45:02'),
(25, 'og_image_url', '/og-image.jpg', 'url', 'OG Image URL', 'Imagen para redes sociales (1200x630)', 'seo', 1, NULL, '2026-05-12 20:45:02'),
(26, 'under_construction', '1', 'boolean', 'Modo construcción', 'Activar página de próximamente (1=activo, 0=desactivado)', 'general', 1, NULL, '2026-05-12 16:56:42'),
(28, 'project_lat', '20.6900000', 'string', 'Latitud del proyecto', 'WGS84 latitude — actualizar con coordenadas exactas', 'general', 1, NULL, '2026-05-15 18:51:09'),
(29, 'project_lng', '-103.3490000', 'string', 'Longitud del proyecto', 'WGS84 longitude — actualizar con coordenadas exactas', 'general', 1, NULL, '2026-05-15 18:51:09');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `interest` enum('studio','1bed','2bed','3bed','penthouse','general','investment','other') DEFAULT 'general',
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of strings: hot_lead, cold_lead, investor, vip, needs_followup, no_contact' CHECK (json_valid(`tags`)),
  `admin_notes` text DEFAULT NULL,
  `first_source` varchar(100) DEFAULT NULL COMMENT 'booking | contact_form',
  `last_contact_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `email`, `name`, `phone`, `interest`, `tags`, `admin_notes`, `first_source`, `last_contact_at`, `created_at`, `updated_at`) VALUES
(1, 'axgoomez@gmail.com', 'Alex Gomez', '+524741400363', 'general', NULL, NULL, 'booking', '2026-05-13 18:15:38', '2026-05-13 18:15:38', '2026-05-13 18:15:38'),
(3, 'tonatiuh.gom@gmail.com', 'Tonatiuh Gomez', '+524741400363', 'investment', NULL, NULL, 'contact_form', '2026-05-13 19:25:08', '2026-05-13 19:25:08', '2026-05-13 19:25:08');

-- --------------------------------------------------------

--
-- Table structure for table `cms_content`
--

CREATE TABLE `cms_content` (
  `id` int(10) UNSIGNED NOT NULL,
  `slug` varchar(100) NOT NULL COMMENT 'terms_and_conditions | privacy_policy | about_us | faq',
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL COMMENT 'Markdown content',
  `version` smallint(6) NOT NULL DEFAULT 1,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `published_by` int(10) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cms_content`
--

INSERT INTO `cms_content` (`id`, `slug`, `title`, `content`, `version`, `is_published`, `published_at`, `published_by`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'terms_and_conditions', 'Términos y Condiciones', '# Términos y Condiciones\n\n**Última actualización:** Mayo 2025\n\n## 1. Aceptación\n\nAl acceder y usar este sitio web, usted acepta los presentes términos y condiciones en su totalidad. Si no está de acuerdo con alguno de ellos, le pedimos que no utilice nuestros servicios.\n\n## 2. Información del Desarrollador\n\n**LIV CAPITAL** es un desarrollo inmobiliario operado por **Capital Urbano S.A. de C.V.**, con domicilio en Guadalajara, Jalisco, México.\n\n## 3. Uso del Sitio\n\nEste sitio web es de carácter informativo. La información sobre precios, disponibilidad y características está sujeta a cambios sin previo aviso.\n\n## 4. Agendamiento de Visitas\n\nLas visitas al desarrollo se realizan únicamente con cita previa. Al agendar una visita, usted autoriza el uso de sus datos de contacto para coordinar dicha visita. La empresa se reserva el derecho de cancelar o reprogramar visitas por razones operativas.\n\n## 5. Limitación de Responsabilidad\n\nLIV CAPITAL no garantiza que la información del sitio esté libre de errores u omisiones. Las imágenes y renders son representaciones artísticas y pueden diferir del producto final.\n\n## 6. Propiedad Intelectual\n\nTodo el contenido de este sitio (textos, imágenes, logotipos) es propiedad de Capital Urbano S.A. de C.V. y está protegido por las leyes de propiedad intelectual aplicables en México.\n\n## 7. Modificaciones\n\nNos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del sitio implica la aceptación de los términos vigentes.\n\n## 8. Legislación Aplicable\n\nEstos términos se rigen por las leyes vigentes en el Estado de Jalisco, México.', 1, 1, '2026-05-12 20:45:02', NULL, NULL, '2026-05-12 20:45:02', '2026-05-12 20:45:02'),
(2, 'privacy_policy', 'Aviso de Privacidad', '# Aviso de Privacidad\n\n**Última actualización:** Mayo 2025\n\n## Responsable del tratamiento de datos\n\n**Capital Urbano S.A. de C.V.** (en adelante, \"LIV CAPITAL\"), con domicilio en Guadalajara, Jalisco, México, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).\n\n## Datos que recopilamos\n\n- **Datos de contacto:** nombre, correo electrónico, número telefónico.\n- **Datos de visita:** fecha y hora de visita agendada, interés en tipo de unidad.\n- **Datos técnicos:** dirección IP, tipo de navegador (con fines de seguridad y estadísticos).\n\n## Finalidades del tratamiento\n\n- Coordinar visitas al desarrollo LIV CAPITAL.\n- Responder a solicitudes de información.\n- Enviar información relevante sobre el proyecto (con su consentimiento).\n- Cumplir con obligaciones legales.\n\n## Transferencia de datos\n\nSus datos no serán transferidos a terceros sin su consentimiento, salvo en los casos previstos por la ley.\n\n## Derechos ARCO\n\nUsted tiene derecho a **Acceder, Rectificar, Cancelar u Oponerse** al tratamiento de sus datos. Para ejercerlos, escríbanos a: **privacidad@livcapital.com**\n\n## Cookies\n\nEste sitio puede utilizar cookies técnicas necesarias para su funcionamiento. No utilizamos cookies de seguimiento de terceros.\n\n## Cambios al aviso\n\nCualquier cambio a este aviso será publicado en esta página con la fecha de actualización correspondiente.', 1, 1, '2026-05-12 20:45:02', NULL, NULL, '2026-05-12 20:45:02', '2026-05-12 20:45:02'),
(3, 'faq', 'Preguntas Frecuentes', '# Preguntas Frecuentes\n\n## ¿Cuándo estará listo el desarrollo?\n\nLIV CAPITAL tiene una fecha de entrega estimada para el segundo semestre de 2026. Te mantendremos informado sobre el avance de obra.\n\n## ¿Cómo puedo agendar una visita?\n\nPuedes agendar tu visita directamente desde nuestra página web seleccionando el día y horario disponible de tu preferencia.\n\n## ¿Qué documentos necesito para apartar una unidad?\n\nTe asesoraremos en este proceso durante tu visita. Generalmente se requiere identificación oficial y un comprobante de domicilio.\n\n## ¿Las imágenes del sitio son del desarrollo real?\n\nLas imágenes son renders artísticos que representan fielmente el concepto arquitectónico. El resultado final puede tener variaciones menores.', 1, 1, '2026-05-12 20:45:02', NULL, NULL, '2026-05-12 20:45:02', '2026-05-12 20:45:02');

-- --------------------------------------------------------

--
-- Table structure for table `contact_submissions`
--

CREATE TABLE `contact_submissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `source` varchar(100) DEFAULT 'contact_form' COMMENT 'hero / footer / modal / contact_form',
  `interest` enum('studio','1bed','2bed','3bed','penthouse','general','investment','other') DEFAULT 'general',
  `status` enum('new','read','in_progress','replied','archived') NOT NULL DEFAULT 'new',
  `read_at` datetime DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `replied_by` int(10) UNSIGNED DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_submissions`
--

INSERT INTO `contact_submissions` (`id`, `client_id`, `name`, `email`, `phone`, `subject`, `message`, `source`, `interest`, `status`, `read_at`, `replied_at`, `replied_by`, `admin_notes`, `ip_address`, `user_agent`, `utm_source`, `utm_medium`, `utm_campaign`, `created_at`, `updated_at`) VALUES
(1, 3, 'Tonatiuh Gomez', 'tonatiuh.gom@gmail.com', '+524741400363', NULL, 'Test', 'contact_form', 'investment', 'read', '2026-05-13 19:27:01', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', NULL, NULL, NULL, '2026-05-13 19:25:07', '2026-05-13 19:27:01');

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `recipient_name` varchar(120) DEFAULT NULL,
  `template_type` varchar(100) NOT NULL COMMENT 'booking_confirmation / booking_reminder / booking_cancelled / contact_reply / otp_admin / otp_visitor',
  `booking_id` int(10) UNSIGNED DEFAULT NULL,
  `contact_id` int(10) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('sent','failed','bounced') NOT NULL DEFAULT 'sent',
  `mailer_response` text DEFAULT NULL,
  `sent_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_logs`
--

INSERT INTO `email_logs` (`id`, `recipient_email`, `recipient_name`, `template_type`, `booking_id`, `contact_id`, `subject`, `status`, `mailer_response`, `sent_at`) VALUES
(1, 'axgoomez@gmail.com', 'Alex Gomez', 'booking_confirmation', 1, NULL, '✅ Visita Confirmada — LIV CAPITAL — Viernes, 29 de Mayo de 2026', 'sent', NULL, '2026-05-13 18:15:42'),
(2, 'admin@livcapital.com', 'LIV CAPITAL', 'new_booking_admin', 1, NULL, '🏠 Nueva Reserva #1 — Alex Gomez — Viernes, 29 de Mayo de 2026', 'sent', NULL, '2026-05-13 18:15:42');

-- --------------------------------------------------------

--
-- Table structure for table `gallery_images`
--

CREATE TABLE `gallery_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `category` enum('arquitectura','amenidades','interiores') NOT NULL DEFAULT 'arquitectura',
  `display_order` smallint(6) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery_images`
--

INSERT INTO `gallery_images` (`id`, `title`, `description`, `image_url`, `category`, `display_order`, `is_active`, `created_at`) VALUES
(1, 'Cocina Modelo CT', NULL, '/uploads/gallery/35304a7442ab688563efc6d6234acdb0.jpg', 'arquitectura', 0, 1, '2026-05-17 16:28:15'),
(2, 'Escritorio Modelo CT', NULL, '/uploads/gallery/b429d8576d722870c4974e2253bf911d.jpg', 'arquitectura', 0, 1, '2026-05-17 16:29:00'),
(3, 'Recamara Escritorio Modelo CT', NULL, '/uploads/gallery/e0256a485238a5d94ad70e94e4d4564f.jpg', 'arquitectura', 0, 1, '2026-05-17 16:29:26'),
(4, 'Recamara Modelo CT', NULL, '/uploads/gallery/843e7d5b3a9efb1b596379687e6587d0.jpg', 'arquitectura', 0, 1, '2026-05-17 16:29:38'),
(5, 'Terraza Modelo CT', NULL, '/uploads/gallery/b7e53e6f75189ad29e97f279597dca3b.jpg', 'arquitectura', 0, 1, '2026-05-17 16:29:58'),
(6, 'Cocina Modelo F', NULL, '/uploads/gallery/269b8c382447af14a3f0474f01710490.jpg', 'arquitectura', 0, 1, '2026-05-17 16:30:58'),
(7, 'Recamara Modelo F', NULL, '/uploads/gallery/f9cf7417756aaa806c484441e32276a2.jpg', 'arquitectura', 0, 1, '2026-05-17 16:31:13'),
(8, 'Sala Modelo F', NULL, '/uploads/gallery/41409eebd638865f9058c5663c5a77cb.jpg', 'arquitectura', 0, 1, '2026-05-17 16:31:26'),
(9, 'Baño Modelo I', NULL, '/uploads/gallery/46c95c857d607c08780bef223ad70f79.jpg', 'arquitectura', 0, 1, '2026-05-17 16:31:45'),
(10, 'Lavado Modelo J', NULL, '/uploads/gallery/fcabcb6360c70bde31168f95a8c7feb1.jpg', 'arquitectura', 0, 1, '2026-05-17 16:32:09'),
(11, 'Recamara Escritorio Modelo J', NULL, '/uploads/gallery/3760a9f09c0f24cfdc0a7280a9890f86.jpg', 'arquitectura', 0, 1, '2026-05-17 16:32:44'),
(12, 'Recamara Modelo J', NULL, '/uploads/gallery/3c8297b37e2edc050faba8942209cc07.jpg', 'arquitectura', 0, 1, '2026-05-17 16:32:57'),
(13, 'Sala Escritorio Modelo J', NULL, '/uploads/gallery/c6f41945747c78c584de7901c3a1ba7a.jpg', 'arquitectura', 0, 1, '2026-05-17 16:33:13'),
(14, 'Sala Comedor Modelo J', NULL, '/uploads/gallery/91330009ce56dc7214dacb85c1f4fd50.jpg', 'arquitectura', 0, 1, '2026-05-17 16:33:28'),
(15, 'Cocina Modelo M', NULL, '/uploads/gallery/dc97350b15000e2471fbdd134b6a0752.jpg', 'arquitectura', 0, 1, '2026-05-17 16:33:52'),
(16, 'Recamara Escritorio Modelo M', NULL, '/uploads/gallery/1b9266f82846c7bcd0a0df5e9539c9ac.jpg', 'arquitectura', 0, 1, '2026-05-17 16:34:08'),
(17, 'Recamara Modelo M', NULL, '/uploads/gallery/d37f5f860e52c64a80e72b9e889a5cc5.jpg', 'arquitectura', 0, 1, '2026-05-17 16:34:20');

-- --------------------------------------------------------

--
-- Table structure for table `gallery_items`
--

CREATE TABLE `gallery_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `category` varchar(80) DEFAULT NULL COMMENT 'exterior | interior | amenities | renders',
  `alt_text` varchar(255) DEFAULT NULL COMMENT 'SEO/accessibility',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` smallint(6) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_images`
--

CREATE TABLE `model_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `model_id` int(10) UNSIGNED NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `display_order` int(10) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_images`
--

INSERT INTO `model_images` (`id`, `model_id`, `image_url`, `caption`, `display_order`, `created_at`) VALUES
(32, 1, '/uploads/models/1d95b7b41e3b2f005f581c7dba00df6c.png', '', 4, '2026-05-16 00:43:57'),
(33, 1, '/uploads/models/55e34b17dea9a70e058a5fbbe3666928.png', '', 5, '2026-05-16 00:44:04'),
(34, 2, '/uploads/models/15ee5c0cb989cabddcf504f53731bf85.png', '', 4, '2026-05-16 01:01:02'),
(35, 2, '/uploads/models/18da5b7475d135daf92c707ff270d298.png', '', 5, '2026-05-16 01:01:10'),
(36, 3, '/uploads/models/884edf39c3e3a7b42167eacf5452d313.png', '', 3, '2026-05-16 01:01:48'),
(37, 3, '/uploads/models/895f6c3e4280ba4e2bec55ecd8edeb46.png', '', 4, '2026-05-16 01:01:57'),
(38, 4, '/uploads/models/0722d77f2e529a9a769a4c95577d97f9.png', '', 3, '2026-05-16 01:02:31'),
(39, 4, '/uploads/models/47d0f687aaf51aee09b8258aff9b02fd.png', '', 4, '2026-05-16 01:02:41'),
(40, 5, '/uploads/models/19b0ef4cada829a924a39c725f1d717b.png', '', 3, '2026-05-16 01:03:09'),
(41, 5, '/uploads/models/0b9f1357a471ed381bb938a256c54fcf.png', '', 4, '2026-05-16 01:03:19'),
(42, 6, '/uploads/models/c14f72c98832ff33ec569f6edb2d7879.png', '', 4, '2026-05-16 01:03:48'),
(43, 6, '/uploads/models/d33120649b0ef67c89248ec171a82e16.png', '', 5, '2026-05-16 01:03:55'),
(44, 7, '/uploads/models/e0d70861698385e947e310b7afec1c56.png', '', 3, '2026-05-16 01:04:23'),
(45, 7, '/uploads/models/22e5fdbdd333b48b1b99c4747f8b67bd.png', '', 4, '2026-05-16 01:04:31'),
(46, 8, '/uploads/models/d860cd9fe44de2357c3be71df2108536.png', '', 4, '2026-05-16 01:05:00'),
(47, 8, '/uploads/models/355ea16ec3560ef3ac501ecafcab2544.png', '', 5, '2026-05-16 01:05:07'),
(48, 9, '/uploads/models/8e1088b8c33f2ed9941ff04e4aa7ac1c.png', '', 4, '2026-05-16 01:05:33'),
(49, 9, '/uploads/models/e886a13c21e9daebd22721e093df0cfe.png', '', 5, '2026-05-16 01:05:45'),
(50, 10, '/uploads/models/f1dcbccd2d0919b699adf1af1d886ea1.png', '', 3, '2026-05-16 01:06:19'),
(51, 10, '/uploads/models/7a9f3ae378be82e73161d637d71f3417.png', '', 4, '2026-05-16 01:06:27');

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` int(10) UNSIGNED NOT NULL,
  `context_type` enum('admin_login','visitor_edit','visitor_cancel','visitor_confirm') NOT NULL,
  `context_id` varchar(255) NOT NULL COMMENT 'admin.id or booking.id depending on context_type',
  `code_hash` varchar(255) NOT NULL COMMENT 'hash of the 6-digit OTP',
  `purpose` varchar(64) NOT NULL COMMENT 'e.g. login, edit_booking, cancel_booking',
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `attempts` tinyint(4) NOT NULL DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_codes`
--

INSERT INTO `otp_codes` (`id`, `context_type`, `context_id`, `code_hash`, `purpose`, `expires_at`, `used_at`, `attempts`, `ip_address`, `created_at`) VALUES
(2, 'admin_login', '2', 'b1cc2cd22971c94672e23d80c6a89bceb7d9461a95f47c470532416ec49df243', 'login', '2026-05-13 23:30:38', '2026-05-13 19:21:22', 0, '::1', '2026-05-13 19:20:37');

-- --------------------------------------------------------

--
-- Table structure for table `points_of_interest`
--

CREATE TABLE `points_of_interest` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `category` enum('mercados','transporte','universidades','hospitales','parques','otros') NOT NULL,
  `name` varchar(200) NOT NULL,
  `distance_meters` smallint(5) UNSIGNED NOT NULL COMMENT 'Approx distance in metres from LIV Capital',
  `description` varchar(255) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL COMMENT 'WGS84 latitude  — update after confirming on-site',
  `lng` decimal(10,7) DEFAULT NULL COMMENT 'WGS84 longitude — update after confirming on-site',
  `display_order` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `points_of_interest`
--

INSERT INTO `points_of_interest` (`id`, `category`, `name`, `distance_meters`, `description`, `lat`, `lng`, `display_order`, `is_active`, `created_at`) VALUES
(1, 'mercados', 'Mercado Alcalde', 950, NULL, 20.6849000, -103.3475000, 1, 1, '2026-05-15 18:43:36'),
(2, 'mercados', 'Mercado Santa Tere', 2700, NULL, 20.6846000, -103.3684000, 2, 1, '2026-05-15 18:43:36'),
(3, 'mercados', 'Midtown \"Centro Comercial\"', 3200, NULL, 20.6825000, -103.3906000, 3, 1, '2026-05-15 18:43:36'),
(4, 'mercados', 'Plaza Patria \"Centro Comercial\"', 4000, NULL, 20.7093000, -103.3767000, 4, 1, '2026-05-15 18:43:36'),
(5, 'transporte', 'Tren ligero estación \"La Normal\"', 500, NULL, 20.6917000, -103.3465000, 5, 1, '2026-05-15 18:43:36'),
(6, 'transporte', 'Ciclovía Alcalde / Ávila Camacho / Federalismo', 500, NULL, 20.6900000, -103.3490000, 6, 1, '2026-05-15 18:43:36'),
(7, 'transporte', 'Ciclovía Av. Normalistas', 250, NULL, 20.7205000, -103.3440000, 7, 1, '2026-05-15 18:43:36'),
(8, 'universidades', 'Escuela Normal de Jalisco', 530, NULL, 20.7068000, -103.3477000, 8, 1, '2026-05-15 18:43:36'),
(9, 'universidades', 'Centro Universitario de Ciencias Sociales y Humanidades', 750, NULL, 20.7424000, -103.3820000, 9, 1, '2026-05-15 18:43:36'),
(10, 'hospitales', 'Hospital Civil de Guadalajara', 400, NULL, 20.6857000, -103.3423000, 10, 1, '2026-05-15 18:43:36'),
(11, 'hospitales', 'Cruz Verde Delgadillo Araujo', 850, NULL, 20.6768000, -103.3437000, 11, 1, '2026-05-15 18:43:36'),
(12, 'parques', 'Parque lineal Av. Normalistas', 250, NULL, 20.7170000, -103.3450000, 12, 1, '2026-05-15 18:43:36'),
(13, 'parques', 'Parque Alcalde', 800, NULL, 20.6897000, -103.3436000, 13, 1, '2026-05-15 18:43:36'),
(14, 'otros', 'Centro histórico', 1700, NULL, 20.6769000, -103.3476000, 14, 1, '2026-05-15 18:43:36'),
(15, 'otros', '\"Chapu\" Col. Americana', 3000, NULL, 20.6736000, -103.3682000, 15, 1, '2026-05-15 18:43:36'),
(16, 'otros', 'Col. Providencia', 3600, NULL, 20.6955000, -103.3902000, 16, 1, '2026-05-15 18:43:36');

-- --------------------------------------------------------

--
-- Table structure for table `visit_bookings`
--

CREATE TABLE `visit_bookings` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `slot_template_id` int(10) UNSIGNED DEFAULT NULL,
  `visit_date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `visitor_name` varchar(120) NOT NULL,
  `visitor_email` varchar(255) NOT NULL,
  `visitor_phone` varchar(30) DEFAULT NULL,
  `visitor_message` text DEFAULT NULL,
  `visitor_interest` enum('studio','1bed','2bed','3bed','penthouse','general') DEFAULT 'general',
  `status` enum('pending','confirmed','rescheduled','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
  `confirmed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` enum('visitor','admin') DEFAULT NULL,
  `cancellation_reason` varchar(500) DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `edit_token_hash` varchar(255) DEFAULT NULL,
  `edit_token_expires_at` datetime DEFAULT NULL,
  `cancel_token_hash` varchar(255) DEFAULT NULL,
  `cancel_token_expires_at` datetime DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `assigned_to` int(10) UNSIGNED DEFAULT NULL COMMENT 'admin who will receive the visitor',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_manual_entry` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = created by admin, not by visitor',
  `created_by_admin_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'Admin who created this booking manually',
  `reminder_sent_at` datetime DEFAULT NULL COMMENT '24hr reminder email sent timestamp (NULL = not yet sent)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visit_bookings`
--

INSERT INTO `visit_bookings` (`id`, `client_id`, `slot_template_id`, `visit_date`, `time_start`, `time_end`, `visitor_name`, `visitor_email`, `visitor_phone`, `visitor_message`, `visitor_interest`, `status`, `confirmed_at`, `cancelled_at`, `cancelled_by`, `cancellation_reason`, `completed_at`, `edit_token_hash`, `edit_token_expires_at`, `cancel_token_hash`, `cancel_token_expires_at`, `admin_notes`, `assigned_to`, `ip_address`, `user_agent`, `utm_source`, `utm_medium`, `utm_campaign`, `created_at`, `updated_at`, `is_manual_entry`, `created_by_admin_id`, `reminder_sent_at`) VALUES
(1, 1, 86, '2026-05-29', '12:00:00', '13:00:00', 'Alex Gomez', 'axgoomez@gmail.com', '+524741400363', 'Test', 'general', 'confirmed', '2026-05-13 18:15:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', NULL, NULL, NULL, '2026-05-13 18:15:38', '2026-05-13 19:23:23', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `visit_slot_overrides`
--

CREATE TABLE `visit_slot_overrides` (
  `id` int(10) UNSIGNED NOT NULL,
  `override_date` date NOT NULL,
  `start_time` time DEFAULT NULL COMMENT 'NULL = whole day',
  `end_time` time DEFAULT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT 1,
  `max_capacity` tinyint(4) DEFAULT NULL COMMENT 'override capacity (NULL = use template default)',
  `reason` varchar(255) DEFAULT NULL COMMENT 'internal admin note',
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visit_slot_templates`
--

CREATE TABLE `visit_slot_templates` (
  `id` int(10) UNSIGNED NOT NULL,
  `day_of_week` tinyint(4) NOT NULL COMMENT '0=Sunday … 6=Saturday',
  `start_time` time NOT NULL COMMENT 'e.g. 09:00:00',
  `end_time` time NOT NULL COMMENT 'e.g. 10:00:00 (1 h slot)',
  `max_capacity` tinyint(4) NOT NULL DEFAULT 1 COMMENT 'visitors per slot',
  `label` varchar(100) DEFAULT NULL COMMENT 'optional display label',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visit_slot_templates`
--

INSERT INTO `visit_slot_templates` (`id`, `day_of_week`, `start_time`, `end_time`, `max_capacity`, `label`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(34, 1, '08:00:00', '09:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(35, 1, '09:00:00', '10:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(36, 1, '10:00:00', '11:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(37, 1, '11:00:00', '12:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(38, 1, '12:00:00', '13:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(39, 1, '13:00:00', '14:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(40, 1, '14:00:00', '15:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(41, 1, '15:00:00', '16:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(42, 1, '16:00:00', '17:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(43, 1, '17:00:00', '18:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(44, 1, '18:00:00', '19:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(45, 1, '19:00:00', '20:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(46, 2, '08:00:00', '09:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(47, 2, '09:00:00', '10:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(48, 2, '10:00:00', '11:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(49, 2, '11:00:00', '12:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(50, 2, '12:00:00', '13:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(51, 2, '13:00:00', '14:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(52, 2, '14:00:00', '15:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(53, 2, '15:00:00', '16:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(54, 2, '16:00:00', '17:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(55, 2, '17:00:00', '18:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(56, 2, '18:00:00', '19:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(57, 2, '19:00:00', '20:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(58, 3, '08:00:00', '09:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(59, 3, '09:00:00', '10:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(60, 3, '10:00:00', '11:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(61, 3, '11:00:00', '12:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(62, 3, '12:00:00', '13:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(63, 3, '13:00:00', '14:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(64, 3, '14:00:00', '15:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(65, 3, '15:00:00', '16:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(66, 3, '16:00:00', '17:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(67, 3, '17:00:00', '18:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(68, 3, '18:00:00', '19:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(69, 3, '19:00:00', '20:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(70, 4, '08:00:00', '09:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(71, 4, '09:00:00', '10:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(72, 4, '10:00:00', '11:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(73, 4, '11:00:00', '12:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(74, 4, '12:00:00', '13:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(75, 4, '13:00:00', '14:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(76, 4, '14:00:00', '15:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(77, 4, '15:00:00', '16:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(78, 4, '16:00:00', '17:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(79, 4, '17:00:00', '18:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(80, 4, '18:00:00', '19:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(81, 4, '19:00:00', '20:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(82, 5, '08:00:00', '09:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(83, 5, '09:00:00', '10:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(84, 5, '10:00:00', '11:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(85, 5, '11:00:00', '12:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(86, 5, '12:00:00', '13:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(87, 5, '13:00:00', '14:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(88, 5, '14:00:00', '15:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(89, 5, '15:00:00', '16:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(90, 5, '16:00:00', '17:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(91, 5, '17:00:00', '18:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(92, 5, '18:00:00', '19:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(93, 5, '19:00:00', '20:00:00', 2, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(94, 6, '08:00:00', '09:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(95, 6, '09:00:00', '10:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(96, 6, '10:00:00', '11:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(97, 6, '11:00:00', '12:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(98, 6, '12:00:00', '13:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(99, 6, '13:00:00', '14:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(100, 6, '14:00:00', '15:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(101, 6, '15:00:00', '16:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(102, 6, '16:00:00', '17:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(103, 6, '17:00:00', '18:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(104, 6, '18:00:00', '19:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10'),
(105, 6, '19:00:00', '20:00:00', 1, NULL, 1, NULL, '2026-05-13 15:41:10', '2026-05-13 15:41:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admins_email` (`email`);

--
-- Indexes for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admin_sessions_token` (`token_hash`),
  ADD KEY `idx_admin_sessions_admin` (`admin_id`),
  ADD KEY `idx_admin_sessions_expires` (`expires_at`);

--
-- Indexes for table `amenities`
--
ALTER TABLE `amenities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_amenities_category` (`category`,`is_active`);

--
-- Indexes for table `apartment_models`
--
ALTER TABLE `apartment_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_apartment_models_slug` (`slug`),
  ADD KEY `idx_apartment_models_available` (`is_available`,`display_order`);

--
-- Indexes for table `booking_events`
--
ALTER TABLE `booking_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_events_booking` (`booking_id`),
  ADD KEY `idx_booking_events_type` (`event_type`),
  ADD KEY `idx_booking_events_created` (`created_at`),
  ADD KEY `fk_booking_events_admin` (`admin_id`);

--
-- Indexes for table `building_config`
--
ALTER TABLE `building_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_building_config_key` (`config_key`),
  ADD KEY `idx_building_config_group` (`group`),
  ADD KEY `fk_building_config_admin` (`updated_by`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_clients_email` (`email`);

--
-- Indexes for table `cms_content`
--
ALTER TABLE `cms_content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cms_slug_published` (`slug`,`is_published`),
  ADD KEY `idx_cms_version` (`slug`,`version`),
  ADD KEY `fk_cms_published_by` (`published_by`),
  ADD KEY `fk_cms_created_by` (`created_by`);

--
-- Indexes for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contacts_status` (`status`),
  ADD KEY `idx_contacts_email` (`email`),
  ADD KEY `idx_contacts_created` (`created_at`),
  ADD KEY `fk_contacts_admin` (`replied_by`),
  ADD KEY `fk_contacts_client` (`client_id`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_logs_booking` (`booking_id`),
  ADD KEY `idx_email_logs_contact` (`contact_id`),
  ADD KEY `idx_email_logs_recipient` (`recipient_email`);

--
-- Indexes for table `gallery_images`
--
ALTER TABLE `gallery_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gallery_items`
--
ALTER TABLE `gallery_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gallery_category` (`category`,`is_active`);

--
-- Indexes for table `model_images`
--
ALTER TABLE `model_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_model_images_model` (`model_id`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_otp_context` (`context_type`,`context_id`),
  ADD KEY `idx_otp_expires` (`expires_at`);

--
-- Indexes for table `points_of_interest`
--
ALTER TABLE `points_of_interest`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visit_bookings`
--
ALTER TABLE `visit_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bookings_date_status` (`visit_date`,`status`),
  ADD KEY `idx_bookings_email` (`visitor_email`),
  ADD KEY `idx_bookings_slot` (`slot_template_id`),
  ADD KEY `idx_bookings_assigned` (`assigned_to`),
  ADD KEY `fk_bookings_client` (`client_id`);

--
-- Indexes for table `visit_slot_overrides`
--
ALTER TABLE `visit_slot_overrides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_slot_overrides_date` (`override_date`),
  ADD KEY `fk_slot_overrides_admin` (`created_by`);

--
-- Indexes for table `visit_slot_templates`
--
ALTER TABLE `visit_slot_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_slot_templates_day` (`day_of_week`,`is_active`),
  ADD KEY `fk_slot_templates_admin` (`created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `apartment_models`
--
ALTER TABLE `apartment_models`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `booking_events`
--
ALTER TABLE `booking_events`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `building_config`
--
ALTER TABLE `building_config`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cms_content`
--
ALTER TABLE `cms_content`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `gallery_images`
--
ALTER TABLE `gallery_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `gallery_items`
--
ALTER TABLE `gallery_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `model_images`
--
ALTER TABLE `model_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `points_of_interest`
--
ALTER TABLE `points_of_interest`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `visit_bookings`
--
ALTER TABLE `visit_bookings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `visit_slot_overrides`
--
ALTER TABLE `visit_slot_overrides`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visit_slot_templates`
--
ALTER TABLE `visit_slot_templates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD CONSTRAINT `fk_admin_sessions_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_events`
--
ALTER TABLE `booking_events`
  ADD CONSTRAINT `fk_booking_events_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_booking_events_booking` FOREIGN KEY (`booking_id`) REFERENCES `visit_bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `building_config`
--
ALTER TABLE `building_config`
  ADD CONSTRAINT `fk_building_config_admin` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cms_content`
--
ALTER TABLE `cms_content`
  ADD CONSTRAINT `fk_cms_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cms_published_by` FOREIGN KEY (`published_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD CONSTRAINT `fk_contacts_admin` FOREIGN KEY (`replied_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_contacts_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `fk_email_logs_booking` FOREIGN KEY (`booking_id`) REFERENCES `visit_bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_email_logs_contact` FOREIGN KEY (`contact_id`) REFERENCES `contact_submissions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `model_images`
--
ALTER TABLE `model_images`
  ADD CONSTRAINT `fk_model_images_model` FOREIGN KEY (`model_id`) REFERENCES `apartment_models` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `visit_bookings`
--
ALTER TABLE `visit_bookings`
  ADD CONSTRAINT `fk_bookings_admin` FOREIGN KEY (`assigned_to`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_slot` FOREIGN KEY (`slot_template_id`) REFERENCES `visit_slot_templates` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `visit_slot_overrides`
--
ALTER TABLE `visit_slot_overrides`
  ADD CONSTRAINT `fk_slot_overrides_admin` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `visit_slot_templates`
--
ALTER TABLE `visit_slot_templates`
  ADD CONSTRAINT `fk_slot_templates_admin` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
