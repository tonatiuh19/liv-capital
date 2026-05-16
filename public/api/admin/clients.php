<?php
/**
 * /api/admin/clients.php
 *
 * GET  ?page=1&search=&tag=&export=csv  — list clients
 * GET  ?id=X                            — single client with timeline
 * PUT                                   — update notes / tags
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ── GET single client (detail + timeline) ─────────────────────────────────────
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    $client = $pdo->prepare(
        "SELECT id, email, name, phone, interest, tags, admin_notes,
                first_source, last_contact_at, created_at
         FROM clients WHERE id = ? LIMIT 1"
    );
    $client->execute([$id]);
    $row = $client->fetch();
    if (!$row) json_respond(['error' => 'Cliente no encontrado'], 404);

    $row['tags'] = json_decode($row['tags'] ?? '[]', true) ?? [];

    // Visit timeline
    $visits = $pdo->prepare(
        "SELECT id, visit_date, time_start, time_end, visitor_interest AS interest,
                status, admin_notes, created_at
         FROM visit_bookings
         WHERE client_id = ?
         ORDER BY visit_date DESC"
    );
    $visits->execute([$id]);

    // Contact timeline
    $contacts = $pdo->prepare(
        "SELECT id, subject, message, interest, status, created_at
         FROM contact_submissions
         WHERE client_id = ?
         ORDER BY created_at DESC"
    );
    $contacts->execute([$id]);

    json_respond([
        'client'   => $row,
        'visits'   => $visits->fetchAll(),
        'contacts' => $contacts->fetchAll(),
    ]);
}

// ── GET list ─────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $search  = trim($_GET['search'] ?? '');
    $tag     = trim($_GET['tag']    ?? '');
    $page    = max(1, (int)($_GET['page'] ?? 1));
    $export  = trim($_GET['export'] ?? '');
    $limit   = 40;
    $offset  = ($page - 1) * $limit;

    $where  = [];
    $params = [];

    if ($search !== '') {
        $where[]  = '(name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        $like     = '%' . $search . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }
    if ($tag !== '') {
        $where[]  = 'JSON_CONTAINS(COALESCE(tags, "[]"), JSON_QUOTE(?))';
        $params[] = $tag;
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM clients {$whereSQL}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // CSV export — no pagination
    if ($export === 'csv') {
        $stmt = $pdo->prepare(
            "SELECT c.id, c.name, c.email, c.phone, c.interest,
                    c.tags, c.first_source, c.last_contact_at,
                    c.created_at,
                    (SELECT COUNT(*) FROM visit_bookings b WHERE b.client_id = c.id) AS total_visits,
                    (SELECT COUNT(*) FROM contact_submissions s WHERE s.client_id = c.id) AS total_contacts
             FROM clients c {$whereSQL}
             ORDER BY c.created_at DESC"
        );
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="clientes-liv-capital.csv"');
        header('Cache-Control: no-store');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['ID','Nombre','Email','Teléfono','Interés','Etiquetas','Fuente','Último contacto','Registro','Visitas','Consultas']);
        foreach ($rows as $r) {
            $tags = implode(', ', json_decode($r['tags'] ?? '[]', true) ?? []);
            fputcsv($out, [
                $r['id'], $r['name'], $r['email'], $r['phone'] ?? '',
                $r['interest'], $tags, $r['first_source'] ?? '',
                $r['last_contact_at'] ?? '', $r['created_at'],
                $r['total_visits'], $r['total_contacts'],
            ]);
        }
        fclose($out);
        exit;
    }

    $params[] = $limit;
    $params[] = $offset;
    $stmt = $pdo->prepare(
        "SELECT c.id, c.name, c.email, c.phone, c.interest,
                c.tags, c.first_source, c.last_contact_at, c.created_at,
                (SELECT COUNT(*) FROM visit_bookings b WHERE b.client_id = c.id) AS total_visits,
                (SELECT COUNT(*) FROM contact_submissions s WHERE s.client_id = c.id) AS total_contacts
         FROM clients c {$whereSQL}
         ORDER BY c.last_contact_at DESC, c.created_at DESC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute($params);
    $clients = $stmt->fetchAll();

    foreach ($clients as &$c) {
        $c['tags'] = json_decode($c['tags'] ?? '[]', true) ?? [];
    }
    unset($c);

    json_respond([
        'clients'     => $clients,
        'total'       => $total,
        'page'        => $page,
        'total_pages' => (int)ceil($total / max($limit, 1)),
    ]);
}

// ── PUT update notes / tags ───────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();
    $id   = (int)($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    $set    = [];
    $params = [];

    if (array_key_exists('admin_notes', $body)) {
        $set[]    = 'admin_notes = ?';
        $params[] = mb_substr(strip_tags($body['admin_notes']), 0, 5000);
    }

    if (array_key_exists('tags', $body)) {
        $allowed = ['hot_lead','cold_lead','investor','vip','needs_followup','no_contact'];
        $tags    = array_values(array_filter((array)$body['tags'], fn($t) => in_array($t, $allowed, true)));
        $set[]    = 'tags = ?';
        $params[] = json_encode($tags);
    }

    if (empty($set)) json_respond(['error' => 'Nada que actualizar'], 400);

    $params[] = $id;
    $pdo->prepare("UPDATE clients SET " . implode(', ', $set) . " WHERE id = ?")
        ->execute($params);

    json_respond(['success' => true]);
}

json_respond(['error' => 'Method not allowed'], 405);
