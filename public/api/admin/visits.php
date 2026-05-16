<?php
/**
 * /api/admin/visits
 * GET    — list visits (filters: ?month=YYYY-MM, ?date=YYYY-MM-DD, ?status=X)
 * POST   — create manual visit
 * PUT    — update visit
 * DELETE — cancel visit (?id=X)
 *
 * Also handles blocked dates:
 * GET  ?view=blocked&month=YYYY-MM  — list blocked dates for month
 * POST action=block-date            — block a date
 * POST action=unblock-date          — unblock a date
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';
require_once __DIR__ . '/../_mailer.php';
require_once __DIR__ . '/../_visit_emails.php';

$pdo    = db_connect();
$admin  = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $view  = $_GET['view']   ?? 'visits';
    $month = $_GET['month']  ?? null;
    $date  = $_GET['date']   ?? null;

    if ($view === 'blocked') {
        // Blocked full-day overrides for a month
        if (!$month || !preg_match('/^\d{4}-\d{2}$/', $month)) {
            json_respond(['error' => 'Parámetro month requerido (YYYY-MM)'], 400);
        }
        [$y, $m] = explode('-', $month);
        $first = sprintf('%04d-%02d-01', $y, $m);
        $last  = date('Y-m-t', strtotime($first));

        $stmt = $pdo->prepare(
            "SELECT id, override_date, start_time, end_time, reason
             FROM visit_slot_overrides
             WHERE override_date BETWEEN ? AND ? AND is_blocked = 1
             ORDER BY override_date, start_time"
        );
        $stmt->execute([$first, $last]);
        json_respond(['blocked_dates' => $stmt->fetchAll()]);
    }

    // ── Regular visits ────────────────────────────────────────────────────────
    $where  = [];
    $params = [];

    if ($date && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $where[]  = 'b.visit_date = ?';
        $params[] = $date;
    } elseif ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
        $where[]  = "DATE_FORMAT(b.visit_date,'%Y-%m') = ?";
        $params[] = $month;
    }

    if (isset($_GET['status']) && $_GET['status'] !== '') {
        $where[]  = 'b.status = ?';
        $params[] = $_GET['status'];
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = $pdo->prepare(
        "SELECT b.id, b.slot_template_id, b.visit_date, b.time_start, b.time_end,
                b.visitor_name, b.visitor_email, b.visitor_phone, b.visitor_interest,
                b.visitor_message, b.status, b.created_at,
                b.admin_notes, b.is_manual_entry
         FROM visit_bookings b
         {$whereSQL}
         ORDER BY b.visit_date DESC, b.time_start
         LIMIT 500"
    );
    $stmt->execute($params);
    $visits = $stmt->fetchAll();

    // Day-count map for the calendar view
    $dayCounts = [];
    if ($month) {
        [$y, $m] = explode('-', $month);
        $first   = sprintf('%04d-%02d-01', $y, $m);
        $last    = date('Y-m-t', strtotime($first));
        $cStmt   = $pdo->prepare(
            "SELECT visit_date, COUNT(*) AS cnt
             FROM visit_bookings
             WHERE visit_date BETWEEN ? AND ? AND status IN ('pending','confirmed')
             GROUP BY visit_date"
        );
        $cStmt->execute([$first, $last]);
        foreach ($cStmt->fetchAll() as $row) {
            $dayCounts[$row['visit_date']] = (int)$row['cnt'];
        }
    }

    json_respond(['visits' => $visits, 'day_counts' => $dayCounts]);
}

// ── POST ──────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body   = json_body();
    $action = $body['action'] ?? 'create';

    // Block a date (full-day or time-range)
    if ($action === 'block-date') {
        $date      = trim($body['date']       ?? '');
        $reason    = trim($body['reason']     ?? '');
        $timeStart = isset($body['time_start']) ? trim($body['time_start']) : null;
        $timeEnd   = isset($body['time_end'])   ? trim($body['time_end'])   : null;

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            json_respond(['error' => 'Fecha inválida'], 400);
        }

        $isRange = ($timeStart !== null && $timeEnd !== null
            && preg_match('/^\d{2}:\d{2}$/', $timeStart)
            && preg_match('/^\d{2}:\d{2}$/', $timeEnd));

        if ($isRange) {
            $dbStart = $timeStart . ':00';
            $dbEnd   = $timeEnd   . ':00';
            if ($dbStart >= $dbEnd) {
                json_respond(['error' => 'La hora de inicio debe ser anterior a la hora de fin'], 400);
            }
            $pdo->prepare(
                "INSERT INTO visit_slot_overrides (override_date, start_time, end_time, is_blocked, reason)
                 VALUES (?, ?, ?, 1, ?)"
            )->execute([$date, $dbStart, $dbEnd, mb_substr($reason, 0, 255)]);
        } else {
            // Full-day: remove any existing full-day block first (idempotent)
            $pdo->prepare(
                "DELETE FROM visit_slot_overrides WHERE override_date = ? AND start_time IS NULL"
            )->execute([$date]);
            $pdo->prepare(
                "INSERT INTO visit_slot_overrides (override_date, start_time, is_blocked, reason)
                 VALUES (?, NULL, 1, ?)"
            )->execute([$date, mb_substr($reason, 0, 255)]);
        }
        json_respond(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    // Unblock a specific override by its ID (used for time-range blocks)
    if ($action === 'unblock-by-id') {
        $id = (int)($body['id'] ?? 0);
        if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);
        $pdo->prepare("DELETE FROM visit_slot_overrides WHERE id = ?")->execute([$id]);
        json_respond(['success' => true]);
    }

    // Unblock a date
    if ($action === 'unblock-date') {
        $date = trim($body['date'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            json_respond(['error' => 'Fecha inválida'], 400);
        }
        $pdo->prepare(
            "DELETE FROM visit_slot_overrides WHERE override_date = ? AND start_time IS NULL"
        )->execute([$date]);
        json_respond(['success' => true]);
    }

    // Create manual visit
    $visitDate = trim($body['visit_date']       ?? '');
    $timeStart = trim($body['time_start']        ?? '');
    $timeEnd   = trim($body['time_end']          ?? '');
    $name      = mb_substr(strip_tags(trim($body['visitor_name']    ?? '')), 0, 120);
    $email     = mb_strtolower(trim($body['visitor_email']  ?? ''));
    $phone     = mb_substr(strip_tags(trim($body['visitor_phone']   ?? '')), 0, 30);
    $interest  = trim($body['visitor_interest']  ?? 'general');
    $message   = mb_substr(strip_tags(trim($body['visitor_message'] ?? '')), 0, 1000);
    $notes     = mb_substr(strip_tags(trim($body['admin_notes']     ?? '')), 0, 1000);
    $status    = trim($body['status'] ?? 'confirmed');

    if (!$visitDate || !$timeStart || !$timeEnd || !$name || !$email) {
        json_respond(['error' => 'Campos obligatorios faltantes'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_respond(['error' => 'Correo inválido'], 400);
    }

    $validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!in_array($status, $validStatuses, true)) $status = 'confirmed';

    $ref = 'LIV-' . strtoupper(substr(uniqid(), -6));

    $stmt = $pdo->prepare(
        "INSERT INTO visit_bookings
         (visit_date, time_start, time_end, visitor_name, visitor_email,
          visitor_phone, visitor_interest, visitor_message, status,
          booking_reference, admin_notes, is_manual_entry, created_by_admin_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?)"
    );
    $stmt->execute([
        $visitDate, $timeStart, $timeEnd, $name, $email,
        $phone, $interest, $message, $status,
        $ref, $notes, (int)$admin['id'],
    ]);
    $bookingId = (int)$pdo->lastInsertId();

    // ── Notify visitor ────────────────────────────────────────────────────────
    if ($email && $status !== 'cancelled') {
        $organizerAddr = defined('SMTP_USER') ? SMTP_USER : 'noreply@livcapitalgdl.mx';
        $ics = build_ics($bookingId, $visitDate, substr($timeStart, 0, 5), substr($timeEnd, 0, 5), $name, $email, $organizerAddr);
        try {
            smtp_send_mail(
                $email, $name,
                '✅ Visita Confirmada — LIV CAPITAL — ' . format_date_es($visitDate),
                visitor_email_html($name, $visitDate, substr($timeStart, 0, 5), substr($timeEnd, 0, 5), $interest, $bookingId),
                [['name' => "visita-liv-capital-{$visitDate}.ics", 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics]]
            );
        } catch (RuntimeException $e) {
            error_log('[admin/visits.php] Create visitor email failed: ' . $e->getMessage());
        }
    }

    json_respond(['success' => true, 'id' => $bookingId, 'booking_reference' => $ref], 201);
}

// ── PUT ───────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_body();
    $id   = (int)($body['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    // Fetch current visit before update so we can detect changes
    $curStmt = $pdo->prepare('SELECT * FROM visit_bookings WHERE id = ?');
    $curStmt->execute([$id]);
    $current = $curStmt->fetch();
    if (!$current) json_respond(['error' => 'Visita no encontrada'], 404);

    $allowed = ['status','admin_notes','visitor_name','visitor_email',
                'visitor_phone','visitor_interest','visitor_message',
                'visit_date','time_start','time_end'];
    $set    = [];
    $params = [];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $body)) {
            $set[]    = "{$f} = ?";
            $params[] = $body[$f];
        }
    }
    if (empty($set)) json_respond(['error' => 'Sin campos para actualizar'], 400);

    $params[] = $id;
    $pdo->prepare("UPDATE visit_bookings SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);

    // ── Determine email to send ───────────────────────────────────────────────
    $newStatus    = $body['status']           ?? $current['status'];
    $newDate      = $body['visit_date']       ?? $current['visit_date'];
    $newStart     = $body['time_start']       ?? $current['time_start'];
    $newEnd       = $body['time_end']         ?? $current['time_end'];
    $visitorEmail = $body['visitor_email']    ?? $current['visitor_email'];
    $visitorName  = $body['visitor_name']     ?? $current['visitor_name'];
    $interest     = $body['visitor_interest'] ?? $current['visitor_interest'];

    $statusChanged = isset($body['status']) && $body['status'] !== $current['status'];
    $timeChanged   = (isset($body['visit_date']) && $body['visit_date'] !== $current['visit_date'])
                  || (isset($body['time_start']) && substr($body['time_start'], 0, 5) !== substr($current['time_start'], 0, 5))
                  || (isset($body['time_end'])   && substr($body['time_end'],   0, 5) !== substr($current['time_end'],   0, 5));

    if ($visitorEmail) {
        $organizerAddr = defined('SMTP_USER') ? SMTP_USER : 'noreply@livcapitalgdl.mx';
        $startHm = substr($newStart, 0, 5);
        $endHm   = substr($newEnd,   0, 5);
        try {
            if ($statusChanged && $newStatus === 'cancelled') {
                smtp_send_mail(
                    $visitorEmail, $visitorName,
                    '❌ Tu visita LIV CAPITAL ha sido cancelada',
                    visitor_cancel_email_html($visitorName, $current['visit_date'], substr($current['time_start'], 0, 5), substr($current['time_end'], 0, 5), $id)
                );
            } elseif ($statusChanged && $newStatus === 'confirmed') {
                $ics = build_ics($id, $newDate, $startHm, $endHm, $visitorName, $visitorEmail, $organizerAddr);
                smtp_send_mail(
                    $visitorEmail, $visitorName,
                    '✅ Tu visita LIV CAPITAL ha sido confirmada — ' . format_date_es($newDate),
                    visitor_email_html($visitorName, $newDate, $startHm, $endHm, $interest, $id),
                    [['name' => "visita-liv-capital-{$newDate}.ics", 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics]]
                );
            } elseif ($timeChanged && $newStatus !== 'cancelled') {
                $ics = build_ics($id, $newDate, $startHm, $endHm, $visitorName, $visitorEmail, $organizerAddr);
                smtp_send_mail(
                    $visitorEmail, $visitorName,
                    '🔄 Tu visita LIV CAPITAL ha sido reprogramada — ' . format_date_es($newDate),
                    visitor_update_email_html($visitorName, $newDate, $startHm, $endHm, $interest, $id),
                    [['name' => "visita-liv-capital-{$newDate}.ics", 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics]]
                );
            }
        } catch (RuntimeException $e) {
            error_log('[admin/visits.php] Update email failed: ' . $e->getMessage());
        }
    }

    json_respond(['success' => true]);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) json_respond(['error' => 'ID inválido'], 400);

    // Fetch visit before cancelling so we can email the visitor
    $vStmt = $pdo->prepare('SELECT visitor_email, visitor_name, visit_date, time_start, time_end FROM visit_bookings WHERE id = ?');
    $vStmt->execute([$id]);
    $visit = $vStmt->fetch();

    $pdo->prepare("UPDATE visit_bookings SET status = 'cancelled' WHERE id = ?")->execute([$id]);

    // ── Notify visitor ────────────────────────────────────────────────────────
    if ($visit && !empty($visit['visitor_email'])) {
        try {
            smtp_send_mail(
                $visit['visitor_email'], $visit['visitor_name'],
                '❌ Tu visita LIV CAPITAL ha sido cancelada',
                visitor_cancel_email_html(
                    $visit['visitor_name'],
                    $visit['visit_date'],
                    substr($visit['time_start'], 0, 5),
                    substr($visit['time_end'],   0, 5),
                    $id
                )
            );
        } catch (RuntimeException $e) {
            error_log('[admin/visits.php] Cancel email failed: ' . $e->getMessage());
        }
    }

    json_respond(['success' => true]);
}

json_respond(['error' => 'Método no permitido'], 405);
