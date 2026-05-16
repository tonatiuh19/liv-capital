<?php
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ── GET — list all slot templates ─────────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, day_of_week, start_time, end_time, max_capacity, label, is_active
         FROM visit_slot_templates
         ORDER BY day_of_week, start_time"
    );
    json_respond(['slots' => $stmt->fetchAll()]);
}

// ── POST — create slot template OR bulk-generate for a day ───────────────────
if ($method === 'POST') {
    $body   = json_body();
    $action = $body['action'] ?? 'create';

    // ── Bulk generate: replace all slots for a day ────────────────────────────
    if ($action === 'generate') {
        $day      = (int)($body['day_of_week']          ?? -1);
        $start    = trim($body['start_time']             ?? '');
        $end      = trim($body['end_time']               ?? '');
        $duration = max(15, min(480, (int)($body['slot_duration_minutes'] ?? 60)));
        $cap      = max(1, min(20,  (int)($body['max_capacity']           ?? 1)));

        if ($day < 0 || $day > 6) {
            json_respond(['error' => 'Día inválido'], 400);
        }
        if (!preg_match('/^\d{2}:\d{2}$/', $start) || !preg_match('/^\d{2}:\d{2}$/', $end)) {
            json_respond(['error' => 'Formato de hora inválido (HH:MM)'], 400);
        }

        $startTs = strtotime("2000-01-01 {$start}:00");
        $endTs   = strtotime("2000-01-01 {$end}:00");
        if ($startTs >= $endTs) {
            json_respond(['error' => 'La hora de inicio debe ser anterior al fin'], 400);
        }

        // Replace all existing slots for this day
        $pdo->prepare("DELETE FROM visit_slot_templates WHERE day_of_week = ?")->execute([$day]);

        $ins   = $pdo->prepare(
            "INSERT INTO visit_slot_templates (day_of_week, start_time, end_time, max_capacity, created_by)
             VALUES (?, ?, ?, ?, ?)"
        );
        $slots = [];
        $cur   = $startTs;
        $step  = $duration * 60;

        while ($cur + $step <= $endTs) {
            $s = date('H:i:s', $cur);
            $e = date('H:i:s', $cur + $step);
            $ins->execute([$day, $s, $e, $cap, $admin['id']]);
            $slots[] = ['day_of_week' => $day, 'start_time' => $s, 'end_time' => $e, 'max_capacity' => $cap];
            $cur += $step;
        }

        json_respond(['success' => true, 'generated' => count($slots)]);
    }

    // ── Create single slot ────────────────────────────────────────────────────
    $day  = (int)($body['day_of_week']  ?? 0);
    $s    = trim($body['start_time']    ?? '');
    $e    = trim($body['end_time']      ?? '');
    $cap  = max(1, min(20, (int)($body['max_capacity'] ?? 1)));
    $lbl  = isset($body['label']) ? mb_substr(trim($body['label']), 0, 100) : null;

    if ($day < 0 || $day > 6) {
        json_respond(['error' => 'Día inválido'], 400);
    }
    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $s) || !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $e)) {
        json_respond(['error' => 'Horario inválido'], 400);
    }
    if ($s >= $e) {
        json_respond(['error' => 'La hora de inicio debe ser anterior al fin'], 400);
    }

    $pdo->prepare(
        "INSERT INTO visit_slot_templates (day_of_week, start_time, end_time, max_capacity, label, created_by)
         VALUES (?, ?, ?, ?, ?, ?)"
    )->execute([$day, $s, $e, $cap, $lbl ?: null, $admin['id']]);

    json_respond(['id' => (int)$pdo->lastInsertId(), 'success' => true], 201);
}

// ── PUT — update slot template ────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();
    $id   = (int)($body['id'] ?? 0);
    if (!$id) json_respond(['error' => 'ID requerido'], 400);

    $allowed = ['day_of_week', 'start_time', 'end_time', 'max_capacity', 'label', 'is_active'];
    $sets = []; $params = [];

    foreach ($allowed as $col) {
        if (!array_key_exists($col, $body)) continue;
        $sets[] = "`{$col}` = ?";
        $params[] = match ($col) {
            'day_of_week'  => max(0, min(6, (int)$body[$col])),
            'max_capacity' => max(1, min(20, (int)$body[$col])),
            'is_active'    => (int)(bool)$body[$col],
            default        => $body[$col] === '' ? null : $body[$col],
        };
    }

    if (!$sets) {
        json_respond(['success' => true]);
    }
    $params[] = $id;
    $pdo->prepare("UPDATE visit_slot_templates SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
    json_respond(['success' => true]);
}

// ── DELETE — delete slot template ─────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) json_respond(['error' => 'ID requerido'], 400);
    $pdo->prepare("DELETE FROM visit_slot_templates WHERE id = ?")->execute([$id]);
    json_respond(['success' => true]);
}
