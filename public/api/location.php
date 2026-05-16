<?php
/**
 * GET /api/location.php
 * Public endpoint — returns LIV Capital's project centre coordinates
 * and all active points of interest, grouped by category.
 * No authentication required.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_respond(['error' => 'Method not allowed'], 405);
}

$pdo = db_connect();

// ── Project centre ────────────────────────────────────────────────────────────
$center = ['lat' => 20.6897, 'lng' => -103.3493]; // fallback

try {
    $stmt = $pdo->query(
        "SELECT config_key, config_value
         FROM building_config
         WHERE config_key IN ('project_lat','project_lng') AND is_public = 1"
    );
    while ($row = $stmt->fetch()) {
        if ($row['config_key'] === 'project_lat') $center['lat'] = (float) $row['config_value'];
        if ($row['config_key'] === 'project_lng') $center['lng'] = (float) $row['config_value'];
    }
} catch (PDOException $e) {
    // table not yet migrated — use fallback coords above
}

// ── Points of interest ────────────────────────────────────────────────────────
$pois = [];

try {
    $stmt = $pdo->query(
        "SELECT id, category, name, distance_meters, description, lat, lng, display_order
         FROM points_of_interest
         WHERE is_active = 1
         ORDER BY display_order ASC, id ASC"
    );
    while ($row = $stmt->fetch()) {
        $pois[] = [
            'id'               => (int) $row['id'],
            'category'         => $row['category'],
            'name'             => $row['name'],
            'distance_meters'  => (int) $row['distance_meters'],
            'description'      => $row['description'],
            'lat'              => $row['lat'] !== null ? (float) $row['lat'] : null,
            'lng'              => $row['lng'] !== null ? (float) $row['lng'] : null,
            'display_order'    => (int) $row['display_order'],
        ];
    }
} catch (PDOException $e) {
    // table not yet migrated — return empty list so the section still renders
}

json_respond(['center' => $center, 'pois' => $pois]);
