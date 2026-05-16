<?php
/**
 * /api/admin/contacts
 * GET  — list submissions (?status=new|read|contacted|archived, ?page=1)
 * PUT  — update status / notes
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status = $_GET['status'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 25;
    $offset = ($page - 1) * $limit;

    $where    = [];
    $params   = [];
    if ($status !== '') {
        $where[]  = 'status = ?';
        $params[] = $status;
    }
    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $total = (int)$pdo->prepare("SELECT COUNT(*) FROM contact_submissions {$whereSQL}")
        ->execute($params) ? $pdo->query("SELECT FOUND_ROWS()")->fetchColumn() : 0;

    // Re-run for count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM contact_submissions {$whereSQL}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $params[] = $limit;
    $params[] = $offset;
    $stmt = $pdo->prepare(
        "SELECT id, name, email, phone, subject, message, source, interest, status, admin_notes AS notes, created_at
         FROM contact_submissions {$whereSQL}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute($params);

    json_respond([
        'contacts'   => $stmt->fetchAll(),
        'total'      => $total,
        'page'       => $page,
        'total_pages'=> (int)ceil($total / $limit),
    ]);
}

if ($method === 'PUT') {
    $body = json_body();
    $id   = (int)($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    // Map frontend field names to actual DB column names
    $set    = [];
    $params = [];

    if (array_key_exists('status', $body)) {
        $allowed_statuses = ['new','read','in_progress','replied','archived'];
        if (!in_array($body['status'], $allowed_statuses, true)) {
            json_respond(['error' => 'Estado inválido'], 400);
        }
        $newStatus = $body['status'];
        $set[]    = 'status = ?';
        $params[] = $newStatus;
        if ($newStatus === 'read') {
            $set[]    = 'read_at = NOW()';
        }
        if ($newStatus === 'replied') {
            $set[]    = 'replied_at = NOW()';
            $set[]    = 'replied_by = ?';
            $params[] = (int)$admin['id'];
        }
    }
    if (array_key_exists('notes', $body)) {
        // frontend sends 'notes', actual column is 'admin_notes'
        $set[]    = 'admin_notes = ?';
        $params[] = mb_substr(strip_tags($body['notes'] ?? ''), 0, 5000);
    }
    if (empty($set)) json_respond(['error' => 'Sin campos'], 400);

    $params[] = $id;
    $pdo->prepare("UPDATE contact_submissions SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    json_respond(['success' => true]);
}

json_respond(['error' => 'Método no permitido'], 405);
