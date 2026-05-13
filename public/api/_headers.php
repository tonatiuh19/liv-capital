<?php
/**
 * _headers.php — Shared CORS + JSON headers.
 * Require AFTER _config.php so CORS_ORIGIN is defined.
 * Handles OPTIONS preflight automatically.
 */
defined('APP_INIT') or die('Direct access not allowed.');

$origin = defined('CORS_ORIGIN') ? CORS_ORIGIN : '*';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Helper: return a PDO connection using config constants.
 */
function db_connect(): PDO {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
}

/**
 * Helper: respond with JSON and exit.
 */
function json_respond(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Helper: get and decode JSON request body.
 */
function json_body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Helper: get client IP respecting common proxy headers.
 */
function client_ip(): string {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            return trim(explode(',', $_SERVER[$key])[0]);
        }
    }
    return 'unknown';
}
