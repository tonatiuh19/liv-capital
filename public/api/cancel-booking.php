<?php
/**
 * GET  /api/cancel-booking.php?token=<cancel_token>
 *      Shows a confirmation page with visit details before cancelling.
 *
 * POST /api/cancel-booking.php
 *      Body: token — performs the actual cancellation.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';
require_once __DIR__ . '/_mailer.php';
require_once __DIR__ . '/_visit_emails.php';

$siteUrl = defined('APP_URL') ? rtrim(APP_URL, '/') : 'https://livcapitalgdl.mx';

// ── Generic result page ───────────────────────────────────────────────────────
function html_page(string $title, string $heading, string $body, string $btnLabel, string $btnHref): never {
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
    html_page(
        'Enlace inválido', 'Enlace inválido',
        '<p>Este enlace de cancelación no es válido. Si necesitas cancelar tu visita, contáctanos directamente.</p>',
        'Volver al inicio', $siteUrl
    );
}

$tokenHash = hash('sha256', $rawToken);

try {
    $pdo  = db_connect();
    $stmt = $pdo->prepare(
        "SELECT id, visit_date, time_start, time_end,
                visitor_name, visitor_email, status,
                cancel_token_expires_at
         FROM visit_bookings
         WHERE cancel_token_hash = ?
         LIMIT 1"
    );
    $stmt->execute([$tokenHash]);
    $booking = $stmt->fetch();
} catch (Throwable $e) {
    error_log('[cancel-booking.php] DB error: ' . $e->getMessage());
    http_response_code(500);
    html_page('Error', 'Error del servidor', '<p>Ocurrió un error. Intenta de nuevo más tarde.</p>', 'Volver', $siteUrl);
}

if (!$booking) {
    http_response_code(404);
    html_page(
        'Enlace no encontrado', 'Enlace no encontrado',
        '<p>Este enlace ya fue usado o no es válido. Si necesitas ayuda, contáctanos.</p>',
        'Volver al inicio', $siteUrl
    );
}

if ($booking['status'] === 'cancelled') {
    html_page(
        'Visita ya cancelada', 'Visita ya cancelada',
        '<p>Esta visita ya fue cancelada anteriormente.</p>',
        'Agendar nueva visita', $siteUrl . '/agendar-visita'
    );
}

if (strtotime($booking['cancel_token_expires_at']) < time()) {
    http_response_code(410);
    html_page(
        'Enlace expirado', 'Enlace expirado',
        '<p>Este enlace de cancelación ha expirado (válido por 48 horas). Para cancelar tu visita, contáctanos directamente.</p>',
        'Contáctanos', $siteUrl . '/#contacto'
    );
}

$startHm   = substr($booking['time_start'], 0, 5);
$endHm     = substr($booking['time_end'],   0, 5);
$dateEs    = format_date_es($booking['visit_date']);

// ── POST: perform cancellation ────────────────────────────────────────────────
if ($method === 'POST') {
    try {
        $pdo->prepare(
            "UPDATE visit_bookings
             SET status = 'cancelled',
                 cancelled_at = NOW(),
                 cancelled_by = 'visitor',
                 cancel_token_hash = NULL,
                 cancel_token_expires_at = NULL
             WHERE id = ?"
        )->execute([$booking['id']]);

        smtp_send_mail(
            $booking['visitor_email'],
            $booking['visitor_name'],
            'Visita cancelada — LIV CAPITAL',
            visitor_cancel_email_html(
                $booking['visitor_name'],
                $booking['visit_date'],
                $startHm, $endHm,
                (int)$booking['id']
            )
        );
    } catch (Throwable $e) {
        error_log('[cancel-booking.php] Cancel error: ' . $e->getMessage());
    }

    html_page(
        'Visita cancelada', 'Visita cancelada',
        "<p>Tu visita del <strong>{$dateEs}</strong> a las <strong>{$startHm} hrs</strong> ha sido cancelada.</p>"
        . '<p style="margin-bottom:24px;">Si deseas agendar una nueva visita, puedes hacerlo en cualquier momento.</p>',
        'Agendar nueva visita', $siteUrl . '/agendar-visita'
    );
}

// ── GET: show confirmation page ───────────────────────────────────────────────
$logoUrl      = 'https://livcapitalgdl.mx/images/logo_liv_white.png';
$escapedToken = htmlspecialchars($rawToken, ENT_QUOTES);
$keepUrl      = $siteUrl;

echo <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Cancelar visita — LIV CAPITAL</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#F5F5F3;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:4px;box-shadow:0 4px 24px rgba(46,52,71,.10);max-width:480px;width:100%;overflow:hidden}
    .header{background:#2E3447;padding:32px 40px;text-align:center}
    .header img{display:block;margin:0 auto 20px;height:auto;width:80px}
    .header h1{color:#fff;font-size:20px;font-weight:700;letter-spacing:1px}
    .body{padding:32px 40px}
    .visit-card{background:#2E3447;border-radius:4px;padding:24px;margin-bottom:28px}
    .visit-card .row{margin-bottom:14px}
    .visit-card .row:last-child{margin-bottom:0}
    .visit-card .label{color:#9CA3AF;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px}
    .visit-card .value{color:#fff;font-size:15px;font-weight:600}
    .visit-card .value.accent{color:#ff9933;font-size:20px}
    .warning{background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:16px 20px;margin-bottom:28px;color:#991b1b;font-size:13px;line-height:1.6;text-align:center}
    .actions{display:flex;flex-direction:column;gap:12px}
    .btn-cancel{display:block;width:100%;background:#dc2626;color:#fff;border:none;border-radius:3px;padding:14px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;text-align:center}
    .btn-cancel:hover{background:#b91c1c}
    .btn-keep{display:block;width:100%;background:#fff;color:#2E3447;border:2px solid #2E3447;border-radius:3px;padding:13px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;text-align:center}
    .btn-keep:hover{background:#f9fafb}
    .footer{background:#F5F5F3;border-top:1px solid #D9D6D1;padding:16px 40px;text-align:center;font-size:11px;color:#A8A29E}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="{$logoUrl}" alt="LIV CAPITAL">
      <h1>CANCELAR VISITA</h1>
    </div>
    <div class="body">
      <div class="visit-card">
        <div class="row">
          <div class="label">Fecha</div>
          <div class="value">{$dateEs}</div>
        </div>
        <div class="row">
          <div class="label">Horario</div>
          <div class="value accent">{$startHm} – {$endHm} hrs</div>
        </div>
        <div class="row">
          <div class="label">Nombre</div>
          <div class="value">{$booking['visitor_name']}</div>
        </div>
      </div>

      <div class="warning">
        ¿Seguro que deseas cancelar esta visita? Esta acción no se puede deshacer.
      </div>

      <div class="actions">
        <form method="POST" action="/api/cancel-booking.php">
          <input type="hidden" name="token" value="{$escapedToken}">
          <button type="submit" class="btn-cancel">Sí, cancelar visita</button>
        </form>
        <a href="{$keepUrl}" class="btn-keep">No, mantener visita</a>
      </div>
    </div>
    <div class="footer">© LIV CAPITAL — Guadalajara, Jalisco</div>
  </div>
</body>
</html>
HTML;

