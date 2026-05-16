-- ============================================================
-- 2026_008_poi_coordinates.sql
-- Updates lat/lng for all 16 points of interest.
-- Also sets the confirmed LIV Capital project centre.
-- ============================================================

UPDATE `points_of_interest` SET lat = 20.6849000, lng = -103.3475000 WHERE id =  1; -- Mercado Alcalde
UPDATE `points_of_interest` SET lat = 20.6846000, lng = -103.3684000 WHERE id =  2; -- Mercado Santa Tere
UPDATE `points_of_interest` SET lat = 20.6825000, lng = -103.3906000 WHERE id =  3; -- Midtown Jalisco
UPDATE `points_of_interest` SET lat = 20.7093000, lng = -103.3767000 WHERE id =  4; -- Plaza Patria
UPDATE `points_of_interest` SET lat = 20.6917000, lng = -103.3465000 WHERE id =  5; -- Estación La Normal
UPDATE `points_of_interest` SET lat = 20.6900000, lng = -103.3490000 WHERE id =  6; -- Ciclovía Alcalde / Ávila Camacho / Federalismo
UPDATE `points_of_interest` SET lat = 20.7205000, lng = -103.3440000 WHERE id =  7; -- Ciclovía Av. Normalistas
UPDATE `points_of_interest` SET lat = 20.7068000, lng = -103.3477000 WHERE id =  8; -- Escuela Normal de Jalisco
UPDATE `points_of_interest` SET lat = 20.7424000, lng = -103.3820000 WHERE id =  9; -- Centro Universitario de Ciencias Sociales y Humanidades
UPDATE `points_of_interest` SET lat = 20.6857000, lng = -103.3423000 WHERE id = 10; -- Hospital Civil de Guadalajara
UPDATE `points_of_interest` SET lat = 20.6768000, lng = -103.3437000 WHERE id = 11; -- Cruz Verde Delgadillo Araujo
UPDATE `points_of_interest` SET lat = 20.7170000, lng = -103.3450000 WHERE id = 12; -- Parque Lineal Av. Normalistas
UPDATE `points_of_interest` SET lat = 20.6897000, lng = -103.3436000 WHERE id = 13; -- Parque Alcalde
UPDATE `points_of_interest` SET lat = 20.6769000, lng = -103.3476000 WHERE id = 14; -- Centro Histórico de Guadalajara
UPDATE `points_of_interest` SET lat = 20.6736000, lng = -103.3682000 WHERE id = 15; -- Colonia Americana ("Chapu")
UPDATE `points_of_interest` SET lat = 20.6955000, lng = -103.3902000 WHERE id = 16; -- Providencia

-- Update LIV Capital centre (derived from surrounding POIs)
UPDATE `building_config` SET config_value = '20.6900000' WHERE config_key = 'project_lat';
UPDATE `building_config` SET config_value = '-103.3490000' WHERE config_key = 'project_lng';
