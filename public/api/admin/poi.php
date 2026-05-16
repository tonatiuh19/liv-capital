<?php
/**
 * /api/admin/poi.php
 * CRUD for the `points_of_interest` table + project centre (building_config).
 *
 * GET    (no params)                    — list all POIs + project centre
 * POST   { category, name, distance_meters, description?, lat?, lng?, display_order?, is_active? }
 * PUT    { id, ...fields }              — partial update for a POI
 * DELETE ?id=X                          — delete a POI
 *
 * Special PUT without `id` but with `center=1`:
 * PUT    { center:1, lat, lng }         — update project_lat / project_lng in building_config
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ─── GET ─────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, category, name, distance_meters, description, lat, lng, display_order, is_active
         FROM points_of_interest
         ORDER BY display_order, id"
    );
    $pois = $stmt->fetchAll();

    // Normalise numeric fields
    foreach ($pois as &$p) {
        $p['id']               = (int)   $p['id'];
        $p['distance_meters']  = (int)   $p['distance_meters'];
        $p['display_order']    = (int)   $p['display_order'];
        $p['is_active']        = (bool)  $p['is_active'];
        $p['lat']              = $p['lat'] !== null ? (float) $p['lat'] : null;
        $p['lng']              = $p['lng'] !== null ? (float) $p['lng'] : null;
    }
    unset($p);

    // Project centre
    $cfg = $pdo->query(
        "SELECT config_key, config_value
         FROM building_config
         WHERE config_key IN ('project_lat','project_lng')"
    )->fetchAll(PDO::FETCH_KEY_PAIR);
    $center = [
        'lat' => isset($cfg['project_lat']) ? (float) $cfg['project_lat'] : 20.6900,
        'lng' => isset($cfg['project_lng']) ? (float) $cfg['project_lng'] : -103.3490,
    ];

    json_respond(['pois' => $pois, 'center' => $center]);
}

// ─── POST (create) ────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body = json_body();

    $valid_categories = ['mercados','transporte','universidades','hospitales','parques','otros'];
    $category = $body['category'] ?? '';
    if (!in_array($category, $valid_categories, true)) {
        json_respond(['error' => 'Categoría inválida'], 400);
    }

    $name = mb_substr(strip_tags(trim($body['name'] ?? '')), 0, 200);
    if (!$name) json_respond(['error' => 'El nombre es obligatorio'], 400);

    $distance = (int) ($body['distance_meters'] ?? 0);
    if ($distance < 1) json_respond(['error' => 'Distancia inválida'], 400);

    $stmt = $pdo->prepare(
        "INSERT INTO points_of_interest (category, name, distance_meters, description, lat, lng, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $category,
        $name,
        $distance,
        mb_substr(strip_tags($body['description'] ?? ''), 0, 255) ?: null,
        isset($body['lat']) && $body['lat'] !== '' && $body['lat'] !== null ? (float) $body['lat'] : null,
        isset($body['lng']) && $body['lng'] !== '' && $body['lng'] !== null ? (float) $body['lng'] : null,
        max(0, (int) ($body['display_order'] ?? 0)),
        isset($body['is_active']) ? (int) (bool) $body['is_active'] : 1,
    ]);
    json_respond(['id' => (int) $pdo->lastInsertId()], 201);
}

// ─── PUT (update) ─────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();

    // Special case: update project centre
    if (!empty($body['center'])) {
        if (!isset($body['lat']) || !isset($body['lng'])) {
            json_respond(['error' => 'lat y lng son requeridos'], 400);
        }
        $lat = (float) $body['lat'];
        $lng = (float) $body['lng'];
        $stmt = $pdo->prepare(
            "UPDATE building_config SET config_value = ? WHERE config_key = ?"
        );
        $stmt->execute([(string) $lat, 'project_lat']);
        $stmt->execute([(string) $lng, 'project_lng']);
        json_respond(['ok' => true]);
    }

    $id = (int) ($body['id'] ?? 0);
    if (!$id) json_respond(['error' => 'ID requerido'], 400);

    $allowed = ['category', 'name', 'distance_meters', 'description', 'lat', 'lng', 'display_order', 'is_active'];
    $sets = [];
    $vals = [];

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $body)) continue;
        $val = $body[$field];
        if ($field === 'name')        $val = mb_substr(strip_tags(trim((string) $val)), 0, 200);
        if ($field === 'description') $val = mb_substr(strip_tags((string) $val), 0, 255) ?: null;
        if ($field === 'lat' || $field === 'lng')
            $val = ($val !== '' && $val !== null) ? (float) $val : null;
        if ($field === 'distance_meters') $val = (int) $val;
        if ($field === 'display_order')   $val = (int) $val;
        if ($field === 'is_active')       $val = (int) (bool) $val;
        $sets[] = "`$field` = ?";
        $vals[] = $val;
    }

    if (empty($sets)) json_respond(['error' => 'Sin cambios'], 400);

    $vals[] = $id;
    $pdo->prepare("UPDATE points_of_interest SET " . implode(', ', $sets) . " WHERE id = ?")->execute($vals);
    json_respond(['ok' => true]);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) json_respond(['error' => 'ID requerido'], 400);
    $pdo->prepare("DELETE FROM points_of_interest WHERE id = ?")->execute([$id]);
    json_respond(['ok' => true]);
}

json_respond(['error' => 'Method not allowed'], 405);
