<?php
/**
 * POST /api/bookings.php
 * Creates a visit booking, then sends confirmation emails (visitor + admin)
 * with a calendar (.ics) attachment.
 *
 * Request body (JSON):
 * {
 *   "slot_template_id": 5,
 *   "visit_date":       "2026-05-20",
 *   "time_start":       "10:00",
 *   "time_end":         "11:00",
 *   "visitor_name":     "Juan García",
 *   "visitor_email":    "juan@example.com",
 *   "visitor_phone":    "+523312345678",   // optional
 *   "visitor_interest": "2bed",            // optional
 *   "visitor_message":  "..."              // optional
 * }
 *
 * Success response: { "success": true, "booking_id": 42 }
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';
require_once __DIR__ . '/_mailer.php';
require_once __DIR__ . '/_visit_emails.php';
require_once __DIR__ . '/_client.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_respond(['error' => 'Method not allowed'], 405);
}

// ── Parse & validate input ────────────────────────────────────────────────────
$body = json_body();

$slotId    = isset($body['slot_template_id']) ? (int)$body['slot_template_id'] : 0;
$visitDate = trim($body['visit_date']      ?? '');
$timeStart = trim($body['time_start']      ?? '');
$timeEnd   = trim($body['time_end']        ?? '');
$name      = trim($body['visitor_name']    ?? '');
$email     = trim($body['visitor_email']   ?? '');
$phone     = trim($body['visitor_phone']   ?? '');
$interest  = trim($body['visitor_interest']?? 'general');
$message   = trim($body['visitor_message'] ?? '');

// Required fields
if ($slotId <= 0 || !$visitDate || !$timeStart || !$timeEnd || !$name || !$email) {
    json_respond(['error' => 'Missing required fields'], 400);
}

// Validate formats
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $visitDate)) {
    json_respond(['error' => 'Invalid visit_date format'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_respond(['error' => 'Invalid email address'], 400);
}
if (!preg_match('/^\d{2}:\d{2}$/', $timeStart) || !preg_match('/^\d{2}:\d{2}$/', $timeEnd)) {
    json_respond(['error' => 'Invalid time format'], 400);
}

$validInterests = ['studio','1bed','2bed','3bed','penthouse','general'];
if (!in_array($interest, $validInterests, true)) {
    $interest = 'general';
}

// Sanitize text
$name    = mb_substr(strip_tags($name),    0, 120);
$phone   = mb_substr(strip_tags($phone),   0, 30);
$message = mb_substr(strip_tags($message), 0, 1000);
$email   = mb_strtolower($email);

try {
    $pdo = db_connect();
    $pdo->beginTransaction();

    // ── Verify slot still has capacity (prevent race condition) ────────────────
    $tplStmt = $pdo->prepare(
        "SELECT t.max_capacity, t.day_of_week, t.start_time, t.end_time
         FROM visit_slot_templates t
         WHERE t.id = :id AND t.is_active = 1
         FOR UPDATE"
    );
    $tplStmt->execute([':id' => $slotId]);
    $tpl = $tplStmt->fetch();

    if (!$tpl) {
        $pdo->rollBack();
        json_respond(['error' => 'Slot not found or inactive'], 404);
    }

    // Confirm the day_of_week matches the submitted visit_date
    $dow = (int)date('w', strtotime($visitDate));
    if ($dow !== (int)$tpl['day_of_week']) {
        $pdo->rollBack();
        json_respond(['error' => 'Slot does not match visit date'], 400);
    }

    $countStmt = $pdo->prepare(
        "SELECT COUNT(*) FROM visit_bookings
         WHERE visit_date = :d AND slot_template_id = :s
           AND status IN ('pending','confirmed')"
    );
    $countStmt->execute([':d' => $visitDate, ':s' => $slotId]);
    $booked = (int)$countStmt->fetchColumn();

    if ($booked >= (int)$tpl['max_capacity']) {
        $pdo->rollBack();
        json_respond(['error' => 'Slot is no longer available'], 409);
    }

    // ── Insert booking ────────────────────────────────────────────────────────
    $insertStmt = $pdo->prepare(
        "INSERT INTO visit_bookings
           (slot_template_id, visit_date, time_start, time_end,
            visitor_name, visitor_email, visitor_phone,
            visitor_message, visitor_interest, status, confirmed_at,
            ip_address, user_agent)
         VALUES
           (:slot_id, :visit_date, :t_start, :t_end,
            :name, :email, :phone,
            :message, :interest, 'confirmed', NOW(),
            :ip, :ua)"
    );
    $insertStmt->execute([
        ':slot_id'    => $slotId,
        ':visit_date' => $visitDate,
        ':t_start'    => $timeStart . ':00',
        ':t_end'      => $timeEnd   . ':00',
        ':name'       => $name,
        ':email'      => $email,
        ':phone'      => $phone ?: null,
        ':message'    => $message ?: null,
        ':interest'   => $interest,
        ':ip'         => client_ip(),
        ':ua'         => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 512),
    ]);
    $bookingId = (int)$pdo->lastInsertId();

    // ── Upsert client record ──────────────────────────────────────────────────
    $clientId = client_upsert($pdo, $email, $name, $phone, $interest, 'booking');
    $pdo->prepare("UPDATE visit_bookings SET client_id = ? WHERE id = ?")
        ->execute([$clientId, $bookingId]);

    // ── Generate edit / cancel tokens ─────────────────────────────────────────
    $cancelToken      = bin2hex(random_bytes(32));
    $cancelTokenHash  = hash('sha256', $cancelToken);
    $editToken        = bin2hex(random_bytes(32));
    $editTokenHash    = hash('sha256', $editToken);
    $tokenExpiry      = date('Y-m-d H:i:s', strtotime('+48 hours'));

    $pdo->prepare(
        "UPDATE visit_bookings
         SET cancel_token_hash = ?, cancel_token_expires_at = ?,
             edit_token_hash   = ?, edit_token_expires_at   = ?
         WHERE id = ?"
    )->execute([$cancelTokenHash, $tokenExpiry, $editTokenHash, $tokenExpiry, $bookingId]);

    // ── Log booking_events ────────────────────────────────────────────────────
    $evtStmt = $pdo->prepare(
        "INSERT INTO booking_events (booking_id, event_type, triggered_by, ip_address)
         VALUES (:bid, 'created', 'visitor', :ip)"
    );
    $evtStmt->execute([':bid' => $bookingId, ':ip' => client_ip()]);

    $pdo->commit();

    // ── Load email config ─────────────────────────────────────────────────────
    $emailCfgStmt = $pdo->prepare(
        "SELECT config_key, config_value FROM building_config
         WHERE config_key IN ('email_from_name','email_from_address','admin_notify_email')"
    );
    $emailCfgStmt->execute();
    $emailCfg = [];
    foreach ($emailCfgStmt->fetchAll() as $r) {
        $emailCfg[$r['config_key']] = $r['config_value'];
    }
    $fromName    = $emailCfg['email_from_name']    ?? 'LIV CAPITAL';
    $adminEmail  = $emailCfg['admin_notify_email'] ?? 'admin@livcapitalgdl.mx';
    $organizerAddr = defined('SMTP_USER') ? SMTP_USER : ($emailCfg['email_from_address'] ?? 'noreply@livcapitalgdl.mx');

    // ── Build .ics content ────────────────────────────────────────────────────
    $ics = build_ics($bookingId, $visitDate, $timeStart, $timeEnd, $name, $email, $organizerAddr);

    // ── Send visitor confirmation email ───────────────────────────────────────
    $visitorSubject = 'Visita Confirmada — LIV CAPITAL — ' . format_date_es($visitDate);
    $visitorHtml    = visitor_email_html($name, $visitDate, $timeStart, $timeEnd, $interest, $bookingId, $cancelToken, $editToken);
    try {
        smtp_send_mail($email, $name, $visitorSubject, $visitorHtml, [
            ['name' => 'visita-liv-capital-' . $visitDate . '.ics', 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics],
        ]);
    } catch (RuntimeException $e) {
        error_log('[bookings.php] Visitor email failed: ' . $e->getMessage());
    }

    // ── Send admin notification email ─────────────────────────────────────────
    $adminSubject = 'Nueva Reserva #' . $bookingId . ' — ' . $name . ' — ' . format_date_es($visitDate);
    $adminHtml    = admin_email_html($bookingId, $name, $email, $phone, $visitDate, $timeStart, $timeEnd, $interest, $message);
    try {
        smtp_send_mail($adminEmail, $fromName, $adminSubject, $adminHtml, [
            ['name' => 'visita-liv-capital-' . $visitDate . '.ics', 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics],
        ]);
    } catch (RuntimeException $e) {
        error_log('[bookings.php] Admin email failed: ' . $e->getMessage());
    }

    // ── Log emails ────────────────────────────────────────────────────────────
    $logStmt = $pdo->prepare(
        "INSERT INTO email_logs (recipient_email, recipient_name, template_type, booking_id, subject, status)
         VALUES (:e, :n, :t, :b, :s, 'sent')"
    );
    $logStmt->execute([':e' => $email,      ':n' => $name,      ':t' => 'booking_confirmation', ':b' => $bookingId, ':s' => $visitorSubject]);
    $logStmt->execute([':e' => $adminEmail, ':n' => $fromName,  ':t' => 'new_booking_admin',    ':b' => $bookingId, ':s' => $adminSubject]);

    json_respond(['success' => true, 'booking_id' => $bookingId]);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('[bookings.php] DB error: ' . $e->getMessage());
    json_respond(['error' => 'Database error'], 500);
}

// Helper functions (format_date_es, interest_label, build_ics, visitor_email_html,
// admin_email_html) are defined in _visit_emails.php which is included at the top.
