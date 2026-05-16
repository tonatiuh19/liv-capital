<?php
/**
 * /api/admin/admins
 * GET    — list admins (superadmin only)
 * POST   — create admin (superadmin only)
 * PUT    — update admin (superadmin only)
 * DELETE — deactivate admin (?id=X, superadmin only)
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_superadmin($pdo);  // superadmin only
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, name, email, role, is_active, created_at
         FROM admins
         ORDER BY role DESC, name"
    );
    json_respond(['admins' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $body  = json_body();
    $name  = mb_substr(strip_tags(trim($body['name']  ?? '')), 0, 100);
    $email = mb_strtolower(trim($body['email'] ?? ''));
    $role  = in_array($body['role'] ?? '', ['superadmin','admin'], true) ? $body['role'] : 'admin';

    if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_respond(['error' => 'Nombre y correo válidos son obligatorios'], 400);
    }

    // Check duplicate
    $dup = $pdo->prepare("SELECT id FROM admins WHERE email = ?");
    $dup->execute([$email]);
    if ($dup->fetch()) {
        json_respond(['error' => 'Este correo ya está registrado'], 409);
    }

    $pdo->prepare("INSERT INTO admins (name, email, role) VALUES (?,?,?)")
        ->execute([$name, $email, $role]);

    json_respond(['success' => true, 'id' => (int)$pdo->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $body = json_body();
    $id   = (int)($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    // Prevent self-demotion
    if ($id === (int)$admin['id'] && isset($body['role']) && $body['role'] !== 'superadmin') {
        json_respond(['error' => 'No puedes cambiar tu propio rol'], 403);
    }
    if ($id === (int)$admin['id'] && isset($body['is_active']) && !(bool)$body['is_active']) {
        json_respond(['error' => 'No puedes desactivarte a ti mismo'], 403);
    }

    $allowed = ['name','email','role','is_active'];
    $set     = [];
    $params  = [];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $body)) {
            $set[]    = "{$f} = ?";
            $params[] = $body[$f];
        }
    }
    if (empty($set)) json_respond(['error' => 'Sin campos'], 400);
    $params[] = $id;
    $pdo->prepare("UPDATE admins SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    json_respond(['success' => true]);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);
    if ($id === (int)$admin['id']) json_respond(['error' => 'No puedes eliminarte a ti mismo'], 403);

    // Soft delete + revoke all sessions
    $pdo->prepare("UPDATE admins SET is_active = 0 WHERE id = ?")->execute([$id]);
    // Revoke (not delete) sessions so the audit trail is preserved
    $pdo->prepare(
        "UPDATE admin_sessions SET revoked_at = NOW() WHERE admin_id = ? AND revoked_at IS NULL"
    )->execute([$id]);
    json_respond(['success' => true]);
}

json_respond(['error' => 'Método no permitido'], 405);
