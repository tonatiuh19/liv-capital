<?php
/**
 * GET /api/gallery.php
 * Public — returns all active gallery images ordered by display_order.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );

    $rows = $pdo->query(
        "SELECT id, title, description, image_url, category, display_order
         FROM gallery_images
         WHERE is_active = 1
         ORDER BY display_order ASC, id ASC"
    )->fetchAll();

    echo json_encode(['images' => array_values($rows)]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor']);
}
