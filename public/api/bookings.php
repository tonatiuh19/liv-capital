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
            visitor_message, visitor_interest, status,
            ip_address, user_agent)
         VALUES
           (:slot_id, :visit_date, :t_start, :t_end,
            :name, :email, :phone,
            :message, :interest, 'pending',
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
    $visitorSubject = "✅ Visita Confirmada — LIV CAPITAL — " . format_date_es($visitDate);
    $visitorHtml    = visitor_email_html($name, $visitDate, $timeStart, $timeEnd, $interest, $bookingId);
    try {
        smtp_send_mail($email, $name, $visitorSubject, $visitorHtml, [
            ['name' => 'visita-liv-capital-' . $visitDate . '.ics', 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics],
        ]);
    } catch (RuntimeException $e) {
        error_log('[bookings.php] Visitor email failed: ' . $e->getMessage());
    }

    // ── Send admin notification email ─────────────────────────────────────────
    $adminSubject = "🏠 Nueva Reserva #{$bookingId} — {$name} — " . format_date_es($visitDate);
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

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function format_date_es(string $date): string {
    $ts = strtotime($date);
    $days   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    $months = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return $days[date('w', $ts)] . ', ' . (int)date('j', $ts) . ' de ' . $months[(int)date('n', $ts)] . ' de ' . date('Y', $ts);
}

function interest_label(string $i): string {
    $map = [
        'studio'    => 'Studio',
        '1bed'      => 'Suite 1 Recámara',
        '2bed'      => 'Suite 2 Recámaras',
        '3bed'      => 'Suite 3 Recámaras',
        'penthouse' => 'Penthouse',
        'general'   => 'Información general',
    ];
    return $map[$i] ?? 'General';
}

function build_ics(int $id, string $date, string $start, string $end, string $name, string $email, string $organizer): string {
    $dtStamp  = gmdate('Ymd\THis\Z');
    $dtStart  = str_replace('-', '', $date) . 'T' . str_replace(':', '', $start) . '00';
    $dtEnd    = str_replace('-', '', $date) . 'T' . str_replace(':', '', $end)   . '00';
    $uid      = 'booking-' . $id . '-' . time() . '@livcapitalgdl.mx';
    $safeName = preg_replace('/[^\x20-\x7E]/', '', $name);

    return "BEGIN:VCALENDAR\r\n"
         . "VERSION:2.0\r\n"
         . "PRODID:-//LIV CAPITAL//Visit Booking//ES\r\n"
         . "CALSCALE:GREGORIAN\r\n"
         . "METHOD:REQUEST\r\n"
         . "BEGIN:VEVENT\r\n"
         . "UID:{$uid}\r\n"
         . "DTSTAMP:{$dtStamp}\r\n"
         . "DTSTART;TZID=America/Mexico_City:{$dtStart}\r\n"
         . "DTEND;TZID=America/Mexico_City:{$dtEnd}\r\n"
         . "SUMMARY:Visita LIV CAPITAL — {$safeName}\r\n"
         . "DESCRIPTION:Visita programada en LIV CAPITAL\\nNombre: {$safeName}\\nEmail: {$email}\r\n"
         . "LOCATION:LIV CAPITAL\\, Guadalajara\\, Jalisco\\, México\r\n"
         . "ORGANIZER;CN=LIV CAPITAL:mailto:{$organizer}\r\n"
         . "STATUS:CONFIRMED\r\n"
         . "BEGIN:VALARM\r\n"
         . "ACTION:DISPLAY\r\n"
         . "DESCRIPTION:Recordatorio: Visita LIV CAPITAL en 1 hora\r\n"
         . "TRIGGER:-PT1H\r\n"
         . "END:VALARM\r\n"
         . "END:VEVENT\r\n"
         . "END:VCALENDAR\r\n";
}

// ── Email HTML: Visitor ───────────────────────────────────────────────────────
function visitor_email_html(
    string $name, string $date, string $start, string $end,
    string $interest, int $bookingId
): string {
    $dateEs     = format_date_es($date);
    $interestLbl= interest_label($interest);
    $time       = $start . ' – ' . $end . ' hrs';
    $year       = date('Y');

    return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visita Confirmada</title></head>
<body style="margin:0;padding:0;background:#F5F5F3;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F3;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(46,52,71,0.10);">

      <!-- Header -->
      <tr><td style="background:#2E3447;padding:40px 48px;text-align:center;">
        <table cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td style="background:#ff9933;width:36px;height:36px;border-radius:3px;text-align:center;vertical-align:middle;">
              <span style="color:#2E3447;font-weight:800;font-size:20px;line-height:36px;">L</span>
            </td>
            <td style="padding-left:10px;text-align:left;">
              <div style="color:#ff9933;font-size:13px;font-weight:700;letter-spacing:3px;line-height:1;">LIV</div>
              <div style="color:#D9D6D1;font-size:10px;font-weight:300;letter-spacing:4px;line-height:1;margin-top:2px;">CAPITAL</div>
            </td>
          </tr>
        </table>
        <div style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:2px;margin-top:28px;">VISITA CONFIRMADA</div>
        <div style="color:#D9D6D1;font-size:13px;font-weight:300;margin-top:8px;letter-spacing:1px;">Referencia #LIV-{$bookingId}</div>
      </td></tr>

      <!-- Greeting -->
      <tr><td style="padding:40px 48px 0;color:#1C1C1C;">
        <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hola <strong>{$name}</strong>,</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#6B7280;">Tu visita al desarrollo <strong style="color:#2E3447;">LIV CAPITAL</strong> ha sido agendada exitosamente. Te esperamos con gusto.</p>
      </td></tr>

      <!-- Visit Card -->
      <tr><td style="padding:0 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#2E3447;border-radius:4px;overflow:hidden;">
          <tr><td style="padding:8px 24px;background:#ff9933;">
            <span style="color:#2E3447;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Detalles de tu visita</span>
          </td></tr>
          <tr><td style="padding:28px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;">
                  <div style="color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Fecha</div>
                  <div style="color:#ffffff;font-size:16px;font-weight:600;">{$dateEs}</div>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;">
                  <div style="color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Horario</div>
                  <div style="color:#ff9933;font-size:22px;font-weight:700;">{$time}</div>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;">
                  <div style="color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Interés</div>
                  <div style="color:#ffffff;font-size:14px;">{$interestLbl}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div style="color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Ubicación</div>
                  <div style="color:#ffffff;font-size:14px;">Guadalajara, Jalisco, México</div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- Info -->
      <tr><td style="padding:32px 48px 0;color:#6B7280;font-size:13px;line-height:1.8;">
        <p style="margin:0 0 12px;">📎 Adjuntamos un archivo <strong>.ics</strong> para que puedas agregar esta cita a tu calendario.</p>
        <p style="margin:0 0 12px;">🏗️ Te recomendamos llegar 5 minutos antes. Nuestro equipo de ventas te recibirá personalmente.</p>
        <p style="margin:0;">Si necesitas reprogramar o cancelar tu visita, por favor contáctanos con anticipación.</p>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:32px 48px 40px;text-align:center;">
        <a href="https://livcapitalgdl.mx" style="display:inline-block;background:#ff9933;color:#2E3447;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;padding:14px 36px;border-radius:3px;text-transform:uppercase;">Conoce más del proyecto</a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#F5F5F3;padding:24px 48px;border-top:1px solid #D9D6D1;text-align:center;">
        <p style="color:#A8A29E;font-size:11px;margin:0;line-height:1.6;">
          © {$year} LIV CAPITAL — Guadalajara, Jalisco, México<br>
          <a href="https://livcapitalgdl.mx" style="color:#ff9933;text-decoration:none;">livcapitalgdl.mx</a> &nbsp;·&nbsp; info@livcapitalgdl.mx
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
}

// ── Email HTML: Admin ─────────────────────────────────────────────────────────
function admin_email_html(
    int $id, string $name, string $email, string $phone,
    string $date, string $start, string $end,
    string $interest, string $message
): string {
    $dateEs      = format_date_es($date);
    $interestLbl = interest_label($interest);
    $time        = $start . ' – ' . $end . ' hrs';
    $phoneRow    = $phone ? "<tr><td style='color:#6B7280;font-size:13px;padding:6px 0;border-bottom:1px solid #F5F5F3;'>Teléfono</td><td style='color:#1C1C1C;font-size:13px;font-weight:600;padding:6px 0 6px 16px;border-bottom:1px solid #F5F5F3;'>{$phone}</td></tr>" : '';
    $msgRow      = $message ? "<tr><td colspan='2' style='padding:16px 0 0;'><div style='color:#6B7280;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;'>Mensaje del visitante</div><div style='background:#F5F5F3;border-left:3px solid #ff9933;padding:12px 16px;font-size:13px;color:#1C1C1C;line-height:1.7;'>" . htmlspecialchars($message) . "</div></td></tr>" : '';
    $year        = date('Y');

    return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nueva Reserva</title></head>
<body style="margin:0;padding:0;background:#F5F5F3;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F3;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(46,52,71,0.10);">

      <!-- Header -->
      <tr><td style="background:#2E3447;padding:32px 48px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#ff9933;width:32px;height:32px;border-radius:3px;text-align:center;vertical-align:middle;">
              <span style="color:#2E3447;font-weight:800;font-size:18px;line-height:32px;">L</span>
            </td>
            <td style="padding-left:10px;">
              <div style="color:#ff9933;font-size:11px;font-weight:700;letter-spacing:3px;">LIV</div>
              <div style="color:#D9D6D1;font-size:9px;font-weight:300;letter-spacing:4px;margin-top:1px;">CAPITAL</div>
            </td>
          </tr>
        </table>
        <div style="margin-top:20px;">
          <span style="background:#ff9933;color:#2E3447;font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 12px;border-radius:2px;text-transform:uppercase;">Admin</span>
        </div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:12px;">Nueva Reserva #{$id}</div>
        <div style="color:#D9D6D1;font-size:13px;margin-top:4px;">{$dateEs} · {$time}</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 48px;">

        <!-- Date highlight -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#2E3447;border-radius:4px;margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding-right:24px;">
                  Fecha<br><span style="color:#ffffff;font-size:15px;font-weight:700;text-transform:none;letter-spacing:0;">{$dateEs}</span>
                </td>
                <td style="color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;">
                  Horario<br><span style="color:#ff9933;font-size:18px;font-weight:700;text-transform:none;letter-spacing:0;">{$time}</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- Visitor info -->
        <div style="color:#2E3447;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;font-weight:700;">Datos del visitante</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D9D6D1;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:10px 16px;border-bottom:1px solid #F5F5F3;width:120px;">Nombre</td>
            <td style="color:#1C1C1C;font-size:13px;font-weight:600;padding:10px 16px;border-bottom:1px solid #F5F5F3;">{$name}</td>
          </tr>
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:10px 16px;border-bottom:1px solid #F5F5F3;">Email</td>
            <td style="padding:10px 16px;border-bottom:1px solid #F5F5F3;"><a href="mailto:{$email}" style="color:#ff9933;font-size:13px;font-weight:600;text-decoration:none;">{$email}</a></td>
          </tr>
          {$phoneRow}
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:10px 16px;">Interés</td>
            <td style="color:#1C1C1C;font-size:13px;font-weight:600;padding:10px 16px;">{$interestLbl}</td>
          </tr>
          {$msgRow}
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#F5F5F3;padding:20px 48px;border-top:1px solid #D9D6D1;text-align:center;">
        <p style="color:#A8A29E;font-size:11px;margin:0;">LIV CAPITAL Admin · © {$year}</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
}
