<?php
/**
 * GET /api/models.php
 * Public endpoint — returns all available apartment models with gallery images.
 * No authentication required.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_respond(['error' => 'Method not allowed'], 405);
}

$pdo = db_connect();

// Check whether optional columns exist (migrations may not have run yet)
$hasMainImage = false;
$hasVideoUrl  = false;
$hasTerrace   = false;
$hasParking   = false;
$hasStorage   = false;
try { $pdo->query("SELECT main_image_url FROM apartment_models LIMIT 0");  $hasMainImage = true; } catch (PDOException $e) {}
try { $pdo->query("SELECT video_url FROM apartment_models LIMIT 0");       $hasVideoUrl  = true; } catch (PDOException $e) {}
try { $pdo->query("SELECT terrace_m2 FROM apartment_models LIMIT 0");     $hasTerrace   = true; } catch (PDOException $e) {}
try { $pdo->query("SELECT parking_spaces FROM apartment_models LIMIT 0"); $hasParking   = true; } catch (PDOException $e) {}
try { $pdo->query("SELECT storage_units FROM apartment_models LIMIT 0");  $hasStorage   = true; } catch (PDOException $e) {}

$mainImgCol = $hasMainImage ? ', main_image_url' : ', NULL AS main_image_url';
$videoCol   = $hasVideoUrl  ? ', video_url'      : ', NULL AS video_url';
$terraceCol = $hasTerrace   ? ', terrace_m2'     : ', NULL AS terrace_m2';
$parkingCol = $hasParking   ? ', parking_spaces'  : ', 0 AS parking_spaces';
$storageCol = $hasStorage   ? ', storage_units'   : ', 0 AS storage_units';

$stmt = $pdo->query(
    "SELECT id, name, slug, type, bedrooms, bathrooms, area_sqm, price_from,
            description, floor_plan_url, floor_min, floor_max
            {$mainImgCol}{$videoCol}{$terraceCol}{$parkingCol}{$storageCol}, display_order
     FROM apartment_models
     WHERE is_available = 1
     ORDER BY display_order, id"
);
$models = $stmt->fetchAll();

if ($models) {
    $ids = implode(',', array_map(fn($m) => (int) $m['id'], $models));

    // model_images table may not exist yet if migration hasn't run
    $imgs = [];
    try {
        $imgs = $pdo->query(
            "SELECT model_id, image_url, caption, display_order
             FROM model_images
             WHERE model_id IN ($ids)
             ORDER BY model_id, display_order, id"
        )->fetchAll();
    } catch (PDOException $e) {
        // Table missing — migration pending
    }

    $byModel = [];
    foreach ($imgs as $img) {
        $byModel[(int) $img['model_id']][] = [
            'image_url'     => $img['image_url'],
            'caption'       => $img['caption'],
            'display_order' => (int) $img['display_order'],
        ];
    }
    foreach ($models as &$m) {
        $m['images'] = $byModel[(int) $m['id']] ?? [];
    }
    unset($m);
}

json_respond(['models' => $models ?: []]);
