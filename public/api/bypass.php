<?php
/**
 * POST /api/bypass
 * Handles the under-construction bypass gate.
 *
 * Actions:
 *   login  — { action: "login",  password: "..." }  → { valid: bool, token?: string }
 *   verify — { action: "verify", token: "..." }      → { valid: bool }
 *
 * Token rotates weekly so bypass persists through the week without re-entering.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_respond(['error' => 'Method not allowed'], 405);
}

/** Weekly-rotating HMAC token — same value for the full ISO week. */
function bypass_token(): string {
    return hash_hmac('sha256', 'bypass:' . date('o-W'), BYPASS_SECRET);
}

$body   = json_body();
$action = $body['action'] ?? '';

// ── Login ─────────────────────────────────────────────────────────────────────
if ($action === 'login') {
    $submitted = $body['password'] ?? '';

    // hash_equals prevents timing attacks; usleep prevents brute-force
    if (!hash_equals(BYPASS_PASSWORD, $submitted)) {
        usleep(400000); // 0.4 s artificial delay on wrong password
        json_respond(['valid' => false], 401);
    }

    json_respond(['valid' => true, 'token' => bypass_token()]);
}

// ── Verify ────────────────────────────────────────────────────────────────────
if ($action === 'verify') {
    $token = $body['token'] ?? '';
    $valid = !empty($token) && hash_equals(bypass_token(), $token);
    json_respond(['valid' => $valid]);
}

json_respond(['error' => 'Invalid action'], 400);
