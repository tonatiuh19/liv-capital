<?php
/**
 * POST /api/contact
 * Public contact form submission — saves to DB + notifies admin by email.
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';
require_once __DIR__ . '/_mailer.php';
require_once __DIR__ . '/_client.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_respond(['error' => 'Método no permitido'], 405);
}

$body    = json_body();
$name    = mb_substr(strip_tags(trim($body['name']    ?? '')), 0, 100);
$email   = mb_strtolower(trim($body['email']   ?? ''));
$phone   = mb_substr(strip_tags(trim($body['phone']   ?? '')), 0, 30);
$message = mb_substr(strip_tags(trim($body['message'] ?? '')), 0, 2000);
$rawInterest = strip_tags(trim($body['interest'] ?? ''));

$allowed_interests = ['studio','1bed','2bed','3bed','penthouse','general','investment','other'];
$interest = in_array($rawInterest, $allowed_interests, true) ? $rawInterest : 'general';

// Tracking
$ip = $_SERVER['HTTP_X_FORWARDED_FOR']
    ?? $_SERVER['HTTP_X_REAL_IP']
    ?? $_SERVER['REMOTE_ADDR']
    ?? null;
$ip = $ip ? mb_substr($ip, 0, 45) : null;
$ua = isset($_SERVER['HTTP_USER_AGENT']) ? mb_substr($_SERVER['HTTP_USER_AGENT'], 0, 512) : null;

if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$message) {
    json_respond(['error' => 'Nombre, correo y mensaje son obligatorios'], 400);
}

try {
    $pdo = db_connect();
    $stmt = $pdo->prepare(
        "INSERT INTO contact_submissions (name, email, phone, message, interest, ip_address, user_agent)
         VALUES (?,?,?,?,?,?,?)"
    );
    $stmt->execute([$name, $email, $phone ?: null, $message, $interest, $ip, $ua]);
    $id = (int)$pdo->lastInsertId();

    $clientId = client_upsert($pdo, $email, $name, $phone, $interest, 'contact_form');
    $pdo->prepare("UPDATE contact_submissions SET client_id = ? WHERE id = ?")
        ->execute([$clientId, $id]);
} catch (Throwable $e) {
    // DB failure should not break the user experience — still try to send email
    $id = 0;
    error_log('contact.php DB error: ' . $e->getMessage());
}

// Notify admin
try {
    $adminEmail = SMTP_USER;
    $subject    = "Nueva consulta de {$name} — LIV Capital";
    $html       = contact_notification_html($name, $email, $phone, $interest, $message, $id);
    smtp_send_mail($adminEmail, 'Equipo LIV Capital', $subject, $html);
} catch (Throwable $e) {
    error_log('contact.php admin mailer error: ' . $e->getMessage());
}

// Confirm receipt to visitor
try {
    $confirmSubject = '✅ Recibimos tu mensaje — LIV CAPITAL';
    $confirmHtml    = contact_confirmation_html($name, $interest);
    smtp_send_mail($email, $name, $confirmSubject, $confirmHtml);
} catch (Throwable $e) {
    error_log('contact.php visitor mailer error: ' . $e->getMessage());
}

json_respond(['success' => true]);

function contact_notification_html(
    string $name, string $email, string $phone,
    string $interest, string $message, int $id
): string {
    $interestLabel = match($interest) {
        'studio'     => 'Estudio',
        '1bed'       => '1 Recámara',
        '2bed'       => '2 Recámaras',
        '3bed'       => '3 Recámaras',
        'penthouse'  => 'Penthouse',
        'investment' => 'Inversión',
        default      => 'General',
    };
    $ref = $id > 0 ? "#CONT-{$id}" : '';
    return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Nueva consulta</title></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:48px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:2px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#2E3447;padding:28px 40px;text-align:center;">
          <img src="https://livcapitalgdl.mx/images/logo_liv_white.png" alt="LIV CAPITAL" width="110" style="display:block;margin:0 auto 12px;height:auto;border:0;max-width:110px;" />
          <div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.4);margin-top:4px;">NUEVA CONSULTA {$ref}</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
              <span style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Nombre</span><br>
              <strong style="color:#2E3447;">{$name}</strong>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
              <span style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Correo</span><br>
              <a href="mailto:{$email}" style="color:#ff9933;">{$email}</a>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
              <span style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Teléfono</span><br>
              <strong style="color:#2E3447;">{$phone}</strong>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
              <span style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Interés</span><br>
              <strong style="color:#2E3447;">{$interestLabel}</strong>
            </td></tr>
            <tr><td style="padding:10px 0;">
              <span style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Mensaje</span><br>
              <p style="color:#555;line-height:1.6;margin:8px 0 0;">{$message}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8f7f5;padding:16px 40px;text-align:center;border-top:1px solid #ece8e3;">
          <p style="margin:0;font-size:11px;color:#bbb;">© 2026 LIV Capital — Capital Urbano</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}

function contact_confirmation_html(string $name, string $interest): string {
    $interestLabel = match($interest) {
        'studio'     => 'Estudio',
        '1bed'       => '1 Recámara',
        '2bed'       => '2 Recámaras',
        '3bed'       => '3 Recámaras',
        'penthouse'  => 'Penthouse',
        'investment' => 'Inversión',
        default      => 'General',
    };
    $firstName = explode(' ', trim($name))[0];
    return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Mensaje recibido</title></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:48px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:2px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#2E3447;padding:32px 40px;text-align:center;">
          <img src="https://livcapitalgdl.mx/images/logo_liv_white.png" alt="LIV CAPITAL" width="110" style="display:block;margin:0 auto;height:auto;border:0;max-width:110px;" />
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2E3447;letter-spacing:-0.5px;">
            Hola, {$firstName}
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">
            Recibimos tu mensaje. Nuestro equipo lo revisará y se pondrá en contacto contigo a la brevedad.
          </p>

          <!-- Info card -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#f8f7f5;border-radius:2px;padding:0;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <div style="font-size:10px;letter-spacing:2px;color:#ff9933;font-weight:700;margin-bottom:12px;">
                TU CONSULTA
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#999;padding-bottom:6px;">Interés</td>
                  <td style="font-size:13px;font-weight:600;color:#2E3447;text-align:right;padding-bottom:6px;">{$interestLabel}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#999;">Tiempo de respuesta</td>
                  <td style="font-size:13px;font-weight:600;color:#2E3447;text-align:right;">24–48 horas hábiles</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
            Mientras tanto, puedes conocer más del proyecto en
            <a href="https://livcapitalgdl.mx" style="color:#ff9933;text-decoration:none;">livcapitalgdl.mx</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f7f5;padding:16px 40px;text-align:center;border-top:1px solid #ece8e3;">
          <p style="margin:0;font-size:11px;color:#bbb;">© 2026 LIV Capital — Capital Urbano · Guadalajara, Jalisco</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}
