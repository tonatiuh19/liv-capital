<?php
/**
 * GET  /api/edit-booking.php?token=<edit_token>
 *      Shows a slot-picker form to reschedule the visit.
 *
 * POST /api/edit-booking.php
 *      Body: token, date, slot_template_id, time_start, time_end
 *      Reschedules the booking, regenerates tokens, sends update email.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';
require_once __DIR__ . '/_mailer.php';
require_once __DIR__ . '/_visit_emails.php';

$siteUrl = defined('APP_URL') ? rtrim(APP_URL, '/') : 'https://livcapitalgdl.mx';
$apiBase = $siteUrl . '/api';

// ── Generic result page (errors / success) ────────────────────────────────────
function result_page(string $title, string $heading, string $body, string $btnLabel, string $btnHref): never {
    $logoUrl = 'https://livcapitalgdl.mx/images/logo_liv_white.png';
    echo <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>{$title} — LIV CAPITAL</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#F5F5F3;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:4px;box-shadow:0 4px 24px rgba(46,52,71,.10);max-width:480px;width:100%;overflow:hidden}
    .header{background:#2E3447;padding:32px 40px;text-align:center}
    .header img{display:block;margin:0 auto 20px;height:auto;width:80px;max-width:80px}
    .header h1{color:#fff;font-size:20px;font-weight:700;letter-spacing:1px}
    .body{padding:36px 40px;text-align:center}
    .body p{color:#6B7280;font-size:15px;line-height:1.7;margin-bottom:24px}
    .btn{display:inline-block;background:#ff9933;color:#2E3447;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;padding:14px 32px;border-radius:3px;text-transform:uppercase}
    .footer{background:#F5F5F3;border-top:1px solid #D9D6D1;padding:16px 40px;text-align:center;font-size:11px;color:#A8A29E}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="{$logoUrl}" alt="LIV CAPITAL">
      <h1>{$heading}</h1>
    </div>
    <div class="body">
      {$body}
      <a href="{$btnHref}" class="btn">{$btnLabel}</a>
    </div>
    <div class="footer">© LIV CAPITAL — Guadalajara, Jalisco</div>
  </div>
</body>
</html>
HTML;
    exit;
}

// ── Validate token (shared by GET and POST) ───────────────────────────────────
$method   = $_SERVER['REQUEST_METHOD'];
$rawToken = $method === 'POST' ? trim($_POST['token'] ?? '') : trim($_GET['token'] ?? '');

if ($rawToken === '' || !preg_match('/^[0-9a-f]{64}$/', $rawToken)) {
    http_response_code(400);
    result_page(
        'Enlace inválido', 'Enlace inválido',
        '<p>Este enlace no es válido. Si necesitas reprogramar tu visita, contáctanos directamente.</p>',
        'Volver al inicio', $siteUrl
    );
}

$tokenHash = hash('sha256', $rawToken);

try {
    $pdo = db_connect();
    $stmt = $pdo->prepare(
        "SELECT id, slot_template_id, visit_date, time_start, time_end,
                visitor_name, visitor_email, visitor_interest, status,
                edit_token_expires_at
         FROM visit_bookings
         WHERE edit_token_hash = ?
         LIMIT 1"
    );
    $stmt->execute([$tokenHash]);
    $booking = $stmt->fetch();
} catch (Throwable $e) {
    error_log('[edit-booking.php] DB error: ' . $e->getMessage());
    http_response_code(500);
    result_page('Error', 'Error del servidor', '<p>Ocurrió un error. Intenta de nuevo más tarde.</p>', 'Volver', $siteUrl);
}

if (!$booking) {
    http_response_code(404);
    result_page(
        'Enlace no encontrado', 'Enlace no encontrado',
        '<p>Este enlace ya fue usado o no es válido. Si necesitas ayuda, contáctanos.</p>',
        'Volver al inicio', $siteUrl
    );
}

if (in_array($booking['status'], ['cancelled'], true)) {
    result_page(
        'Visita cancelada', 'Visita cancelada',
        '<p>Esta visita fue cancelada y ya no puede editarse.</p>',
        'Agendar nueva visita', $siteUrl . '/agendar-visita'
    );
}

if (strtotime($booking['edit_token_expires_at']) < time()) {
    http_response_code(410);
    result_page(
        'Enlace expirado', 'Enlace expirado',
        '<p>Este enlace ha expirado (válido por 48 horas). Para reprogramar tu visita, contáctanos directamente.</p>',
        'Contáctanos', $siteUrl . '/#contacto'
    );
}

// ── POST: process reschedule ──────────────────────────────────────────────────
if ($method === 'POST') {
    $newDate   = trim($_POST['date']             ?? '');
    $newSlotId = (int)($_POST['slot_template_id'] ?? 0);
    $newStart  = trim($_POST['time_start']        ?? '');
    $newEnd    = trim($_POST['time_end']          ?? '');

    $errors = [];
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $newDate))                  $errors[] = 'Fecha inválida.';
    if ($newSlotId <= 0)                                                   $errors[] = 'Selecciona un horario.';
    if (!preg_match('/^\d{2}:\d{2}$/', $newStart))                        $errors[] = 'Hora de inicio inválida.';
    if (!preg_match('/^\d{2}:\d{2}$/', $newEnd))                          $errors[] = 'Hora de fin inválida.';
    if (empty($errors) && $newDate <= date('Y-m-d'))                       $errors[] = 'La fecha debe ser a partir de mañana.';

    if ($errors) {
        $errMsg = '<p>' . implode('<br>', array_map('htmlspecialchars', $errors)) . '</p>';
        result_page('Error de validación', 'Datos inválidos', $errMsg, 'Volver a intentar', $siteUrl . '/api/edit-booking.php?token=' . urlencode($rawToken));
    }

    try {
        // Check slot template exists and is active
        $tplStmt = $pdo->prepare("SELECT id, max_capacity FROM visit_slot_templates WHERE id = ? AND is_active = 1");
        $tplStmt->execute([$newSlotId]);
        $tpl = $tplStmt->fetch();
        if (!$tpl) {
            result_page('Horario no disponible', 'Horario no disponible',
                '<p>El horario seleccionado ya no está disponible. Por favor, elige otro.</p>',
                'Intentar de nuevo', $siteUrl . '/api/edit-booking.php?token=' . urlencode($rawToken));
        }

        // Check slot capacity (exclude current booking from count)
        $capStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM visit_bookings
             WHERE visit_date = ? AND slot_template_id = ?
               AND status IN ('pending','confirmed')
               AND id != ?"
        );
        $capStmt->execute([$newDate, $newSlotId, (int)$booking['id']]);
        $booked = (int)$capStmt->fetchColumn();
        if ($booked >= (int)$tpl['max_capacity']) {
            result_page('Sin disponibilidad', 'Sin disponibilidad',
                '<p>Este horario ya no tiene cupo para la fecha seleccionada. Por favor, elige otro.</p>',
                'Elegir otro horario', $siteUrl . '/api/edit-booking.php?token=' . urlencode($rawToken));
        }

        // Check date not blocked
        $blkStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM visit_slot_overrides
             WHERE override_date = ? AND is_blocked = 1 AND start_time IS NULL"
        );
        $blkStmt->execute([$newDate]);
        if ((int)$blkStmt->fetchColumn() > 0) {
            result_page('Fecha bloqueada', 'Fecha no disponible',
                '<p>La fecha seleccionada no está disponible. Por favor, elige otra.</p>',
                'Elegir otra fecha', $siteUrl . '/api/edit-booking.php?token=' . urlencode($rawToken));
        }

        // Generate new tokens
        $newCancelToken    = bin2hex(random_bytes(32));
        $newEditToken      = bin2hex(random_bytes(32));
        $newCancelHash     = hash('sha256', $newCancelToken);
        $newEditHash       = hash('sha256', $newEditToken);
        $tokenExpiry       = date('Y-m-d H:i:s', strtotime('+48 hours'));

        $pdo->prepare(
            "UPDATE visit_bookings
             SET visit_date            = ?,
                 time_start            = ?,
                 time_end              = ?,
                 slot_template_id      = ?,
                 status                = 'rescheduled',
                 cancel_token_hash     = ?,
                 cancel_token_expires_at = ?,
                 edit_token_hash       = ?,
                 edit_token_expires_at = ?,
                 updated_at            = NOW()
             WHERE id = ?"
        )->execute([$newDate, $newStart, $newEnd, $newSlotId,
                    $newCancelHash, $tokenExpiry, $newEditHash, $tokenExpiry,
                    (int)$booking['id']]);

        // Send update email with .ics and new tokens
        $ics = build_ics(
            (int)$booking['id'], $newDate, $newStart, $newEnd,
            $booking['visitor_name'], $booking['visitor_email'], SMTP_USER
        );
        smtp_send_mail(
            $booking['visitor_email'],
            $booking['visitor_name'],
            'Visita reprogramada — LIV CAPITAL — ' . format_date_es($newDate),
            visitor_update_email_html(
                $booking['visitor_name'], $newDate, $newStart, $newEnd,
                $booking['visitor_interest'], (int)$booking['id'],
                $newEditToken, $newCancelToken
            ),
            [['name' => 'visita-liv-capital-' . $newDate . '.ics',
              'mime' => 'text/calendar; method=REQUEST',
              'data' => $ics]]
        );

    } catch (Throwable $e) {
        error_log('[edit-booking.php] Reschedule error: ' . $e->getMessage());
        http_response_code(500);
        result_page('Error', 'Error al reprogramar', '<p>Ocurrió un error. Intenta de nuevo más tarde.</p>', 'Volver', $siteUrl);
    }

    $newDateEs = format_date_es($newDate);
    result_page(
        'Visita reprogramada', 'Visita reprogramada',
        "<p>Tu visita ha sido reprogramada para el <strong>{$newDateEs}</strong> a las <strong>{$newStart} hrs</strong>.</p><p style=\"margin-bottom:24px;\">Te hemos enviado un correo con los nuevos detalles y tu archivo .ics actualizado.</p>",
        'Volver al inicio', $siteUrl
    );
}

// ── GET: show reschedule form ─────────────────────────────────────────────────
$currentDateEs = format_date_es($booking['visit_date']);
$currentStart  = substr($booking['time_start'], 0, 5);
$currentEnd    = substr($booking['time_end'],   0, 5);
$logoUrl       = 'https://livcapitalgdl.mx/images/logo_liv_white.png';
$escapedToken  = htmlspecialchars($rawToken, ENT_QUOTES);
$minDate       = date('Y-m-d', strtotime('+1 day'));
$maxDate       = date('Y-m-d', strtotime('+30 days'));

echo <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Reprogramar visita — LIV CAPITAL</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#F5F5F3;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:4px;box-shadow:0 4px 24px rgba(46,52,71,.10);max-width:520px;width:100%;overflow:hidden}
    .header{background:#2E3447;padding:32px 40px;text-align:center}
    .header img{display:block;margin:0 auto 20px;height:auto;width:80px}
    .header h1{color:#fff;font-size:20px;font-weight:700;letter-spacing:1px}
    .body{padding:32px 40px}
    .current{background:#2E3447;border-radius:4px;padding:20px 24px;margin-bottom:28px}
    .current .label{color:#9CA3AF;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px}
    .current .value{color:#fff;font-size:14px;font-weight:600}
    .current .value.accent{color:#ff9933;font-size:18px}
    .section-title{color:#2E3447;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
    label{display:block;color:#4B5563;font-size:13px;margin-bottom:6px}
    input[type=date]{width:100%;border:1px solid #D1D5DB;border-radius:3px;padding:10px 14px;font-size:14px;color:#1C1C1C;outline:none;appearance:none}
    input[type=date]:focus{border-color:#2E3447}
    .slots{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .slot-btn{border:2px solid #D1D5DB;border-radius:3px;padding:10px 8px;background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#4B5563;transition:all .15s;text-align:center}
    .slot-btn:hover{border-color:#2E3447;color:#2E3447}
    .slot-btn.selected{border-color:#ff9933;background:#fff7ed;color:#2E3447}
    .slot-msg{color:#9CA3AF;font-size:13px;margin-top:12px}
    .submit-btn{display:block;width:100%;background:#ff9933;color:#2E3447;border:none;border-radius:3px;padding:14px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;margin-top:28px}
    .submit-btn:disabled{opacity:.4;cursor:not-allowed}
    .footer{background:#F5F5F3;border-top:1px solid #D9D6D1;padding:16px 40px;text-align:center;font-size:11px;color:#A8A29E}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="{$logoUrl}" alt="LIV CAPITAL">
      <h1>REPROGRAMAR VISITA</h1>
    </div>
    <div class="body">
      <div class="current">
        <div style="margin-bottom:12px">
          <div class="label">Visita actual</div>
          <div class="value">{$currentDateEs}</div>
        </div>
        <div>
          <div class="label">Horario</div>
          <div class="value accent">{$currentStart} – {$currentEnd} hrs</div>
        </div>
      </div>

      <form method="POST" action="/api/edit-booking.php" id="editForm">
        <input type="hidden" name="token" value="{$escapedToken}">
        <input type="hidden" name="slot_template_id" id="slotId">
        <input type="hidden" name="time_start" id="timeStart">
        <input type="hidden" name="time_end" id="timeEnd">

        <div style="margin-bottom:20px">
          <p class="section-title">Selecciona nueva fecha</p>
          <label for="datePicker">Fecha de visita</label>
          <input type="date" id="datePicker" name="date" min="{$minDate}" max="{$maxDate}" required>
        </div>

        <div id="slotsSection" style="display:none">
          <p class="section-title">Horarios disponibles</p>
          <div class="slots" id="slotsGrid"></div>
        </div>
        <p class="slot-msg" id="slotMsg"></p>

        <button type="submit" class="submit-btn" id="submitBtn" disabled>Confirmar nueva fecha</button>
      </form>
    </div>
    <div class="footer">© LIV CAPITAL — Guadalajara, Jalisco</div>
  </div>

  <script>
    const datePicker = document.getElementById('datePicker');
    const slotsSection = document.getElementById('slotsSection');
    const slotsGrid = document.getElementById('slotsGrid');
    const slotMsg = document.getElementById('slotMsg');
    const submitBtn = document.getElementById('submitBtn');
    const slotId = document.getElementById('slotId');
    const timeStart = document.getElementById('timeStart');
    const timeEnd = document.getElementById('timeEnd');
    let selectedSlot = null;
    let lastMonth = '';

    datePicker.addEventListener('change', async () => {
      const date = datePicker.value;
      if (!date) return;

      const month = date.slice(0, 7);
      slotsSection.style.display = 'none';
      slotsGrid.innerHTML = '';
      slotMsg.textContent = 'Cargando horarios...';
      submitBtn.disabled = true;
      selectedSlot = null;
      slotId.value = '';
      timeStart.value = '';
      timeEnd.value = '';

      try {
        const res = await fetch('/api/slots.php?month=' + month);
        const data = await res.json();
        const slots = data.dates && data.dates[date] ? data.dates[date] : [];
        const available = slots.filter(s => s.available > 0);

        if (available.length === 0) {
          slotMsg.textContent = 'No hay horarios disponibles para esta fecha. Elige otra.';
          return;
        }

        slotMsg.textContent = '';
        slotsSection.style.display = 'block';
        slotsGrid.innerHTML = available.map(s =>
          `<button type="button" class="slot-btn" data-id="\${s.id}" data-start="\${s.start}" data-end="\${s.end}">
            \${s.start} – \${s.end} hrs
          </button>`
        ).join('');

        slotsGrid.querySelectorAll('.slot-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            slotsGrid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            slotId.value = btn.dataset.id;
            timeStart.value = btn.dataset.start;
            timeEnd.value = btn.dataset.end;
            submitBtn.disabled = false;
          });
        });
      } catch (e) {
        slotMsg.textContent = 'Error al cargar los horarios. Intenta de nuevo.';
      }
    });
  </script>
</body>
</html>
HTML;
