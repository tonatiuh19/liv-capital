<?php
/**
 * Admin session middleware.
 * Call require_admin($pdo) to validate the Bearer token and return the admin row.
 */
defined('APP_INIT') or die('Acceso directo no permitido.');

function require_admin(PDO $pdo): array {
    $token = get_bearer_token();
    if (!$token) {
        json_respond(['error' => 'No autorizado'], 401);
    }

    $tokenHash = hash('sha256', $token);
    $stmt = $pdo->prepare(
        "SELECT s.id AS session_id, a.id, a.name, a.email, a.role, a.is_active
         FROM admin_sessions s
         JOIN admins a ON a.id = s.admin_id
         WHERE s.token_hash = ? AND s.expires_at > NOW() AND s.revoked_at IS NULL
         LIMIT 1"
    );
    $stmt->execute([$tokenHash]);
    $admin = $stmt->fetch();

    if (!$admin || !$admin['is_active']) {
        json_respond(['error' => 'No autorizado'], 401);
    }

    return $admin;
}

function require_superadmin(PDO $pdo): array {
    $admin = require_admin($pdo);
    if ($admin['role'] !== 'superadmin') {
        json_respond(['error' => 'Se requiere rol de superadmin'], 403);
    }
    return $admin;
}
