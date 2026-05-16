-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 2026_009_amenities_restructure
-- Adds `type` column (amenity | facility) and replaces seed data to match
-- brochure — 11 amenity spaces + 10 building-facility cards.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE `amenities`
  ADD COLUMN `type` ENUM('amenity','facility') NOT NULL DEFAULT 'amenity'
  AFTER `category`;

-- Reseed with brochure content (safe to re-run via REPLACE INTO)
TRUNCATE TABLE `amenities`;

-- ── Amenity spaces (icon grid) ────────────────────────────────────────────────
INSERT INTO `amenities`
  (`name`, `description`, `icon`, `image_url`, `category`, `type`, `is_active`, `display_order`)
VALUES
  ('Pet Park & Pet Shower',        'Parque de mascotas con bebedero y secador de aire climatizado',        'paw-print',  NULL, 'social',   'amenity', 1,  1),
  ('Gym',                          'Área de fitness y wellness con equipos de última generación',           'dumbbell',   NULL, 'wellness', 'amenity', 1,  2),
  ('Coworking & Sala de Juntas',   'Estaciones de trabajo colaborativo y sala de reuniones privada',       'laptop',     NULL, 'services', 'amenity', 1,  3),
  ('Grill Zone',                   'Espacios sociales con asadores para convivir con familia y amigos',    'flame',      NULL, 'social',   'amenity', 1,  4),
  ('Lavandería',                   'Área de lavandería compartida con equipos de alta eficiencia',         'shirt',      NULL, 'services', 'amenity', 1,  5),
  ('Playground',                   'Zona de juegos segura para los más pequeños',                          'baby',       NULL, 'social',   'amenity', 1,  6),
  ('Salón de Juego para Jóvenes',  'Área de entretenimiento y juegos para adolescentes y adultos',         'gamepad-2',  NULL, 'social',   'amenity', 1,  7),
  ('Sala de Lectura',              'Biblioteca tranquila y espacio de lectura con buena iluminación',      'book-open',  NULL, 'social',   'amenity', 1,  8),
  ('Sala Lounge',                  'Área de descanso y convivencia con diseño contemporáneo',               'coffee',     NULL, 'social',   'amenity', 1,  9),
  ('Área de Amacas',               'Espacio de relajación exterior con hamacas y jardín',                  'sunset',     NULL, 'wellness', 'amenity', 1, 10),
  ('Sharing Room',                 'Espacio compartido multifuncional para la comunidad de residentes',    'users',      NULL, 'social',   'amenity', 1, 11);

-- ── Building facilities (feature cards) ──────────────────────────────────────
INSERT INTO `amenities`
  (`name`, `description`, `icon`, `image_url`, `category`, `type`, `is_active`, `display_order`)
VALUES
  ('Espacios Comunes Premium',
   'Gimnasio // Pet Park // Coworking // Playground niños // Salón de juegos adultos // Sala de lectura // Sala Lounge // Área de hamacas // Sharing room',
   'building-2', NULL, 'services', 'facility', 1, 1),
  ('Pet Park Premium',
   'Parque de mascotas con bebedero y área para bañarlos con agua climatizada y secador de aire',
   'paw-print', NULL, 'social', 'facility', 1, 2),
  ('Trabajo Colaborativo',
   'Con sala de juntas y estaciones de trabajo colaborativo',
   'briefcase', NULL, 'services', 'facility', 1, 3),
  ('Seguridad Avanzada',
   'Accesos con alarma y filtros biométricos que mejoran la función de los guardias de seguridad // materiales de construcción libres de mantenimiento',
   'shield-check', NULL, 'security', 'facility', 1, 4),
  ('Movilidad Verde',
   'En planta baja para scooter y bicicletas eléctricas con área de guardado antirobo',
   'zap', NULL, 'services', 'facility', 1, 5),
  ('Convivencia Social',
   'Espacios sociales para convivencia con amigos, familia y mascotas',
   'users', NULL, 'social', 'facility', 1, 6),
  ('Fitness & Wellness',
   'Áreas de fitness y wellness con riego automático en jardines',
   'dumbbell', NULL, 'wellness', 'facility', 1, 7),
  ('Jardines con Riego Automático',
   'En todos los departamentos y con riego automático',
   'leaf', NULL, 'social', 'facility', 1, 8),
  ('Departamentos Flexibles',
   'Cama que se oculta convirtiendo el espacio del departamento en adaptable y flexible // Bodega en sótano para guardar elementos no esenciales',
   'maximize-2', NULL, 'services', 'facility', 1, 9),
  ('Gadgets & Accesorios',
   'Accesorios y gadgets funcionales incluidos en los departamentos',
   'smartphone', NULL, 'services', 'facility', 1, 10);
