<?php
/**
 * /api/admin/settings
 * GET  ?group=visits   — return all building_config rows for a group
 * PUT                  — update one or more config values
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $group = trim($_GET['group'] ?? '');
    if ($group === '') json_respond(['error' => 'group param required'], 400);

    $stmt = $pdo->prepare(
        "SELECT config_key, config_value, config_type, label, description
         FROM building_config
         WHERE `group` = ?
         ORDER BY id"
    );
    $stmt->execute([$group]);
    $rows = $stmt->fetchAll();

    // Cast types
    foreach ($rows as &$row) {
        if ($row['config_type'] === 'integer') $row['config_value'] = (int)$row['config_value'];
        if ($row['config_type'] === 'boolean') $row['config_value'] = (bool)(int)$row['config_value'];
    }
    unset($row);

    json_respond(['settings' => $rows]);
}

// ── PUT ───────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();

    // Expect { updates: [ { key, value }, ... ] }
    $updates = $body['updates'] ?? [];
    if (empty($updates) || !is_array($updates)) {
        json_respond(['error' => 'updates array required'], 400);
    }

    // Fetch allowed keys + types to validate
    $keys = array_column($updates, 'key');
    $in   = implode(',', array_fill(0, count($keys), '?'));
    $meta = $pdo->prepare("SELECT config_key, config_type FROM building_config WHERE config_key IN ({$in})");
    $meta->execute($keys);
    $types = [];
    foreach ($meta->fetchAll() as $m) {
        $types[$m['config_key']] = $m['config_type'];
    }

    $stmt = $pdo->prepare("UPDATE building_config SET config_value = ? WHERE config_key = ?");

    foreach ($updates as $u) {
        $key = $u['key'] ?? '';
        $val = $u['value'] ?? '';
        if (!isset($types[$key])) continue; // skip unknown keys

        $cast = match ($types[$key]) {
            'integer' => (string)max(0, (int)$val),
            'boolean' => ((bool)$val) ? '1' : '0',
            'email'   => filter_var($val, FILTER_VALIDATE_EMAIL) ? mb_strtolower(trim($val)) : null,
            'url'     => mb_substr(trim($val), 0, 500),
            default   => mb_substr(strip_tags(trim((string)$val)), 0, 500),
        };

        if ($cast === null) continue; // invalid email — skip
        $stmt->execute([$cast, $key]);
    }

    json_respond(['success' => true]);
}

json_respond(['error' => 'Method not allowed'], 405);
