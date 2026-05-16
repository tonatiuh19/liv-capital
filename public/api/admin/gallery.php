<?php
/**
 * /api/admin/gallery.php
 * CRUD for the `gallery_images` table.
 *
 * GET    — list all images ordered by display_order
 * POST   { title, description?, image_url, category, display_order?, is_active? }
 * PUT    { id, ...fields }   — partial update
 * DELETE ?id=X
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

$VALID_CATEGORIES = ['arquitectura', 'amenidades', 'interiores'];

// ─── GET ─────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, title, description, image_url, category, display_order, is_active, created_at
         FROM gallery_images
         ORDER BY display_order ASC, id ASC"
    );
    json_respond(['images' => $stmt->fetchAll()]);
}

// ─── POST ────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body  = json_body();
    $title = mb_substr(strip_tags(trim($body['title'] ?? '')), 0, 200);
    $url   = mb_substr(strip_tags(trim($body['image_url'] ?? '')), 0, 500);

    if (!$title) json_respond(['error' => 'El título es obligatorio'], 400);
    if (!$url)   json_respond(['error' => 'La URL de imagen es obligatoria'], 400);

    $cat = in_array($body['category'] ?? '', $VALID_CATEGORIES) ? $body['category'] : 'arquitectura';

    $stmt = $pdo->prepare(
        "INSERT INTO gallery_images (title, description, image_url, category, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $title,
        mb_substr(strip_tags($body['description'] ?? ''), 0, 500) ?: null,
        $url,
        $cat,
        isset($body['display_order']) ? (int) $body['display_order'] : 0,
        isset($body['is_active'])     ? (int) $body['is_active']     : 1,
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

    if (array_key_exists('title', $body)) {
        $set[]    = 'title = ?';
        $params[] = mb_substr(strip_tags($body['title']), 0, 200);
    }
    if (array_key_exists('description', $body)) {
        $set[]    = 'description = ?';
        $params[] = mb_substr(strip_tags($body['description'] ?? ''), 0, 500) ?: null;
    }
    if (array_key_exists('image_url', $body)) {
        $set[]    = 'image_url = ?';
        $params[] = mb_substr(strip_tags($body['image_url']), 0, 500);
    }
    if (array_key_exists('category', $body) && in_array($body['category'], $VALID_CATEGORIES)) {
        $set[]    = 'category = ?';
        $params[] = $body['category'];
    }
    if (array_key_exists('display_order', $body)) {
        $set[]    = 'display_order = ?';
        $params[] = (int) $body['display_order'];
    }
    if (array_key_exists('is_active', $body)) {
        $set[]    = 'is_active = ?';
        $params[] = (int) $body['is_active'];
    }

    if (empty($set)) json_respond(['error' => 'Nada que actualizar'], 400);

    $params[] = $id;
    $pdo->prepare("UPDATE gallery_images SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);

    json_respond(['success' => true]);
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID requerido'], 400);

    $pdo->prepare("DELETE FROM gallery_images WHERE id = ?")->execute([$id]);
    json_respond(['success' => true]);
}

json_respond(['error' => 'Method not allowed'], 405);
