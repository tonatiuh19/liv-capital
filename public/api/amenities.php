<?php
/**
 * GET /api/amenities.php
 * Public endpoint — returns all active amenities ordered by display_order.
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

    $stmt = $pdo->query(
        "SELECT id, name, description, icon, image_url, category, type, show_in_gallery, display_order
         FROM amenities
         WHERE is_active = 1
         ORDER BY type, display_order, id"
    );

    $rows = $stmt->fetchAll();
    echo json_encode([
        'amenities'  => array_values(array_filter($rows, fn($r) => $r['type'] === 'amenity')),
        'facilities' => array_values(array_filter($rows, fn($r) => $r['type'] === 'facility')),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor']);
}
