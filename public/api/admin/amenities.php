<?php
/**
 * /api/admin/amenities.php
 * CRUD for the `amenities` table.
 *
 * GET    (no params)               — list all amenities ordered by display_order
 * POST   { name, description?, icon?, image_url?, category?, is_active?, display_order? }
 * PUT    { id, ...fields }         — partial update
 * DELETE ?id=X                     — soft delete (or hard delete)
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ─── GET ─────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, name, description, icon, image_url, category, type, show_in_gallery, is_active, display_order, created_at, updated_at
         FROM amenities
         ORDER BY type, display_order, id"
    );
    json_respond(['amenities' => $stmt->fetchAll()]);
}

// ─── POST ────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body = json_body();
    $name = mb_substr(strip_tags(trim($body['name'] ?? '')), 0, 100);
    if (!$name) json_respond(['error' => 'El nombre es obligatorio'], 400);

    $stmt = $pdo->prepare(
        "INSERT INTO amenities (name, description, icon, image_url, category, type, show_in_gallery, is_active, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $name,
        mb_substr(strip_tags($body['description'] ?? ''), 0, 1000) ?: null,
        mb_substr(strip_tags($body['icon'] ?? ''), 0, 100) ?: null,
        mb_substr(strip_tags($body['image_url'] ?? ''), 0, 500) ?: null,
        mb_substr(strip_tags($body['category'] ?? ''), 0, 80) ?: null,
        in_array($body['type'] ?? '', ['amenity', 'facility']) ? $body['type'] : 'amenity',
        isset($body['show_in_gallery']) ? (int) $body['show_in_gallery'] : 0,
        isset($body['is_active']) ? (int) $body['is_active'] : 1,
        isset($body['display_order']) ? (int) $body['display_order'] : 0,
    ]);

    json_respond(['success' => true, 'id' => (int) $pdo->lastInsertId()], 201);
}

// ─── PUT ─────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();
    $id   = (int) ($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID requerido'], 400);

    $set    = [];
    $params = [];

    $fields = ['name', 'description', 'icon', 'image_url', 'category'];
    $limits = ['name' => 100, 'description' => 1000, 'icon' => 100, 'image_url' => 500, 'category' => 80];
    foreach ($fields as $f) {
        if (array_key_exists($f, $body)) {
            $set[]    = "$f = ?";
            $val      = strip_tags($body[$f] ?? '');
            $params[] = mb_substr($val, 0, $limits[$f]) ?: null;
        }
    }
    if (array_key_exists('type', $body) && in_array($body['type'], ['amenity', 'facility'])) {
        $set[]    = 'type = ?';
        $params[] = $body['type'];
    }
    if (array_key_exists('show_in_gallery', $body)) {
        $set[]    = 'show_in_gallery = ?';
        $params[] = (int) $body['show_in_gallery'];
    }
    if (array_key_exists('is_active', $body)) {
        $set[]    = 'is_active = ?';
        $params[] = (int) $body['is_active'];
    }
    if (array_key_exists('display_order', $body)) {
        $set[]    = 'display_order = ?';
        $params[] = (int) $body['display_order'];
    }

    if (empty($set)) json_respond(['error' => 'Nada que actualizar'], 400);

    $params[] = $id;
    $pdo->prepare("UPDATE amenities SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);

    json_respond(['success' => true]);
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID requerido'], 400);

    $pdo->prepare("DELETE FROM amenities WHERE id = ?")->execute([$id]);
    json_respond(['success' => true]);
}

json_respond(['error' => 'Method not allowed'], 405);
