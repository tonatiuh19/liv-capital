<?php
/**
 * GET /api/site-config
 * Returns all is_public=1 building_config rows as a flat JSON object.
 * Used by SiteGate to determine under_construction status.
 * Falls back to safe defaults if DB is unavailable.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_respond(['error' => 'Method not allowed'], 405);
}

$config = [];

try {
    $pdo  = db_connect();
    $stmt = $pdo->query(
        "SELECT config_key, config_value, config_type FROM building_config WHERE is_public = 1"
    );

    while ($row = $stmt->fetch()) {
        $value = $row['config_value'];

        // Debug: log raw DB values in development
        if (defined('APP_ENV') && APP_ENV === 'development') {
            error_log(sprintf(
                '[site-config] key=%s raw_value=%s (%s) type=%s',
                $row['config_key'],
                var_export($value, true),
                gettype($value),
                $row['config_type']
            ));
        }

        switch ($row['config_type']) {
            case 'boolean': $value = ($value == '1' || $value === 'true' || $value === true); break;
            case 'integer': $value = (int) $value; break;
            case 'json':    $value = json_decode($value, true); break;
        }

        if (defined('APP_ENV') && APP_ENV === 'development') {
            error_log(sprintf('[site-config] key=%s cast_value=%s', $row['config_key'], var_export($value, true)));
        }

        $config[$row['config_key']] = $value;
    }
} catch (Exception $e) {
    error_log('[site-config] DB error: ' . $e->getMessage());
    // DB unavailable — safe defaults so the site degrades gracefully
    $config['under_construction'] = false;
    if (defined('APP_ENV') && APP_ENV === 'development') {
        $config['_db_error'] = $e->getMessage();
    }
}

json_respond(['config' => $config]);
