<?php
/**
 * /api/admin/model-images.php
 * Gallery image management for a specific apartment model.
 *
 * GET    ?model_id=X              — list all images for the model
 * POST   { model_id, image_url, caption? } — add image record
 * PUT    { id, caption?, display_order? }  — update caption / order
 * DELETE ?id=X                    — remove image record
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ─── GET ─────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $modelId = (int) ($_GET['model_id'] ?? 0);
    if ($modelId <= 0) json_respond(['error' => 'model_id requerido'], 400);

    $stmt = $pdo->prepare(
        "SELECT id, model_id, image_url, caption, display_order, created_at
         FROM model_images
         WHERE model_id = ?
         ORDER BY display_order, id"
    );
    $stmt->execute([$modelId]);
    json_respond(['images' => $stmt->fetchAll()]);
}

// ─── POST ────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body    = json_body();
    $modelId = (int) ($body['model_id'] ?? 0);
    $url     = mb_substr(strip_tags(trim($body['image_url'] ?? '')), 0, 500);

    if ($modelId <= 0 || !$url) {
        json_respond(['error' => 'model_id e image_url son obligatorios'], 400);
    }

    // Verify model exists
    $check = $pdo->prepare("SELECT id FROM apartment_models WHERE id = ?");
    $check->execute([$modelId]);
    if (!$check->fetch()) json_respond(['error' => 'Modelo no encontrado'], 404);

    // Auto-assign next display_order
    $ord = $pdo->prepare("SELECT COALESCE(MAX(display_order), 0) + 1 FROM model_images WHERE model_id = ?");
    $ord->execute([$modelId]);
    $nextOrder = (int) $ord->fetchColumn();

    $stmt = $pdo->prepare(
        "INSERT INTO model_images (model_id, image_url, caption, display_order) VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([
        $modelId,
        $url,
        mb_substr(strip_tags($body['caption'] ?? ''), 0, 255),
        $nextOrder,
    ]);

    json_respond(['success' => true, 'id' => (int) $pdo->lastInsertId()], 201);
}

// ─── PUT ─────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();
    $id   = (int) ($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID requerido'], 400);

    $set = [];
    $params = [];

    if (array_key_exists('caption', $body)) {
        $set[]    = 'caption = ?';
        $params[] = mb_substr(strip_tags($body['caption'] ?? ''), 0, 255);
    }
    if (array_key_exists('display_order', $body)) {
        $set[]    = 'display_order = ?';
        $params[] = (int) $body['display_order'];
    }

    if (empty($set)) json_respond(['error' => 'Sin campos para actualizar'], 400);

    $params[] = $id;
    $pdo->prepare("UPDATE model_images SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    json_respond(['success' => true]);
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID requerido'], 400);
    $pdo->prepare("DELETE FROM model_images WHERE id = ?")->execute([$id]);
    json_respond(['success' => true]);
}
