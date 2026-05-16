<?php
/**
 * /api/admin/models
 * Uses apartment_models table (defined in schema.sql).
 * GET    — list all models
 * POST   — create model
 * PUT    — update model (including quick availability toggle)
 * DELETE — delete model (?id=X)
 *
 * Column mapping (DB → API):
 *   area_sqm       → area_sqm
 *   floor_plan_url → floor_plan_url
 *   display_order  → display_order
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Graceful detection for columns added by optional migrations
    $hasMainImage = false;
    $hasVideoUrl  = false;
    $hasTerrace   = false;
    $hasParking   = false;
    $hasStorage   = false;
    try { $pdo->query("SELECT main_image_url   FROM apartment_models LIMIT 0"); $hasMainImage = true; } catch (PDOException $e) {}
    try { $pdo->query("SELECT video_url        FROM apartment_models LIMIT 0"); $hasVideoUrl  = true; } catch (PDOException $e) {}
    try { $pdo->query("SELECT terrace_m2       FROM apartment_models LIMIT 0"); $hasTerrace   = true; } catch (PDOException $e) {}
    try { $pdo->query("SELECT parking_spaces   FROM apartment_models LIMIT 0"); $hasParking   = true; } catch (PDOException $e) {}
    try { $pdo->query("SELECT storage_units    FROM apartment_models LIMIT 0"); $hasStorage   = true; } catch (PDOException $e) {}

    $mainImgCol = $hasMainImage ? ', main_image_url'  : ', NULL AS main_image_url';
    $videoCol   = $hasVideoUrl  ? ', video_url'       : ', NULL AS video_url';
    $terraceCol = $hasTerrace   ? ', terrace_m2'      : ', NULL AS terrace_m2';
    $parkingCol = $hasParking   ? ', parking_spaces'  : ', 0 AS parking_spaces';
    $storageCol = $hasStorage   ? ', storage_units'   : ', 0 AS storage_units';

    $stmt = $pdo->query(
        "SELECT id, name, slug, type, bedrooms, bathrooms, area_sqm
                {$terraceCol}{$parkingCol}{$storageCol}, price_from,
                description, floor_plan_url, floor_min, floor_max
                {$mainImgCol}{$videoCol},
                is_available, display_order, created_at, updated_at
         FROM apartment_models
         ORDER BY display_order, id"
    );
    json_respond(['models' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $body = json_body();
    $name = mb_substr(strip_tags(trim($body['name'] ?? '')), 0, 100);
    $type = mb_substr(strip_tags(trim($body['type'] ?? '')), 0, 50);

    if (!$name || !$type) {
        json_respond(['error' => 'Nombre y tipo son obligatorios'], 400);
    }

    // Auto-generate slug from name — must be unique
    $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $name)));
    $slug     = $baseSlug;
    $i = 1;
    while (true) {
        $check = $pdo->prepare("SELECT id FROM apartment_models WHERE slug = ?");
        $check->execute([$slug]);
        if (!$check->fetch()) break;
        $slug = $baseSlug . '-' . (++$i);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO apartment_models
         (name, slug, type, bedrooms, bathrooms, area_sqm, terrace_m2,
          parking_spaces, storage_units, price_from,
          description, floor_plan_url, floor_min, floor_max,
          main_image_url, video_url, is_available, display_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    );
    $stmt->execute([
        $name,
        $slug,
        $type,
        isset($body['bedrooms'])        ? (int)$body['bedrooms']           : 0,
        isset($body['bathrooms'])       ? (float)$body['bathrooms']        : 1,
        isset($body['area_sqm'])        ? (float)$body['area_sqm']         : null,
        isset($body['terrace_m2'])      ? (float)$body['terrace_m2']       : null,
        isset($body['parking_spaces'])  ? (int)$body['parking_spaces']     : 0,
        isset($body['storage_units'])   ? (int)$body['storage_units']      : 1,
        isset($body['price_from'])      ? (float)$body['price_from']       : null,
        mb_substr(strip_tags($body['description']     ?? ''), 0, 2000),
        mb_substr(strip_tags($body['floor_plan_url']  ?? ''), 0, 500),
        isset($body['floor_min'])       ? (int)$body['floor_min']          : null,
        isset($body['floor_max'])       ? (int)$body['floor_max']          : null,
        mb_substr(strip_tags($body['main_image_url']  ?? ''), 0, 500),
        mb_substr(strip_tags($body['video_url']       ?? ''), 0, 500),
        isset($body['is_available'])    ? (int)(bool)$body['is_available'] : 1,
        isset($body['display_order'])   ? (int)$body['display_order']      : 0,
    ]);

    json_respond(['success' => true, 'id' => (int)$pdo->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $body = json_body();
    $id   = (int)($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    // Whitelist DB column names
    $allowed_map = [
        'name'           => 'string',
        'type'           => 'string',
        'area_sqm'       => 'float',
        'terrace_m2'     => 'float_null',
        'bedrooms'       => 'int',
        'bathrooms'      => 'float',
        'parking_spaces' => 'int',
        'storage_units'  => 'int',
        'price_from'     => 'float_null',
        'description'    => 'string',
        'floor_plan_url' => 'string',
        'floor_min'      => 'int_null',
        'floor_max'      => 'int_null',
        'main_image_url' => 'string',
        'video_url'      => 'string',
        'is_available'   => 'bool',
        'display_order'  => 'int',
    ];

    $set    = [];
    $params = [];
    foreach ($allowed_map as $col => $cast) {
        if (!array_key_exists($col, $body)) continue;
        $set[] = "{$col} = ?";
        $params[] = match($cast) {
            'int'        => (int)$body[$col],
            'float'      => (float)$body[$col],
            'float_null' => $body[$col] !== null && $body[$col] !== '' ? (float)$body[$col] : null,
            'int_null'   => $body[$col] !== null && $body[$col] !== '' ? (int)$body[$col] : null,
            'bool'       => (int)(bool)$body[$col],
            default      => mb_substr(strip_tags((string)($body[$col] ?? '')), 0, 500),
        };
    }
    if (empty($set)) json_respond(['error' => 'Sin campos'], 400);
    $params[] = $id;
    $pdo->prepare("UPDATE apartment_models SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    json_respond(['success' => true]);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);
    $pdo->prepare("DELETE FROM apartment_models WHERE id = ?")->execute([$id]);
    json_respond(['success' => true]);
}

json_respond(['error' => 'Método no permitido'], 405);
