<?php
/**
 * POST /api/admin/auth
 * Actions: check-email | send-otp | verify-otp | verify-session | logout
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';
require_once __DIR__ . '/../_mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_respond(['error' => 'Método no permitido'], 405);
}

$body   = json_body();
$action = $body['action'] ?? '';
$pdo    = db_connect();

switch ($action) {

    // ── 1. Check if email belongs to an active admin ──────────────────────────
    case 'check-email': {
        $email = mb_strtolower(trim($body['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_respond(['error' => 'Correo inválido'], 400);
        }

        $stmt = $pdo->prepare("SELECT id, name, is_active FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !$admin['is_active']) {
            json_respond(['exists' => false]);
        }

        json_respond(['exists' => true, 'name' => $admin['name']]);
        break;
    }

    // ── 2. Send OTP email ─────────────────────────────────────────────────────
    case 'send-otp': {
        $email = mb_strtolower(trim($body['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_respond(['error' => 'Correo inválido'], 400);
        }

        $stmt = $pdo->prepare("SELECT id, name, email FROM admins WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        // Always respond the same way to avoid enumeration
        if (!$admin) {
            json_respond(['sent' => true]);
        }

        // Invalidate previous OTPs for this admin
        $pdo->prepare(
            "DELETE FROM otp_codes WHERE context_type = 'admin_login' AND context_id = ?"
        )->execute([(string)$admin['id']]);

        // Generate 6-digit OTP — store hash, never plaintext
        $code      = sprintf('%06d', random_int(0, 999999));
        $codeHash  = hash('sha256', $code);
        $expiresAt = date('Y-m-d H:i:s', time() + 600); // 10 min
        $ip        = $_SERVER['REMOTE_ADDR'] ?? null;

        $pdo->prepare(
            "INSERT INTO otp_codes (context_type, context_id, code_hash, purpose, expires_at, ip_address)
             VALUES ('admin_login', ?, ?, 'login', ?, ?)"
        )->execute([(string)$admin['id'], $codeHash, $expiresAt, $ip]);

        smtp_send_mail(
            $admin['email'],
            $admin['name'],
            'Tu código de acceso — LIV Capital Admin',
            otp_email_html($admin['name'], $code)
        );

        json_respond(['sent' => true]);
        break;
    }

    // ── 3. Verify OTP and create session ─────────────────────────────────────
    case 'verify-otp': {
        $email = mb_strtolower(trim($body['email'] ?? ''));
        $code  = trim($body['code'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $code)) {
            json_respond(['error' => 'Datos inválidos'], 400);
        }

        $stmt = $pdo->prepare("SELECT id, name, role FROM admins WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin) {
            json_respond(['error' => 'Código incorrecto'], 401);
        }

        $codeHash = hash('sha256', $code);
        $otpStmt  = $pdo->prepare(
            "SELECT id FROM otp_codes
             WHERE context_type = 'admin_login' AND context_id = ?
               AND code_hash = ? AND expires_at > NOW() AND used_at IS NULL
             LIMIT 1"
        );
        $otpStmt->execute([(string)$admin['id'], $codeHash]);
        $otp = $otpStmt->fetch();

        if (!$otp) {
            json_respond(['error' => 'Código incorrecto o expirado'], 401);
        }

        // Mark OTP used
        $pdo->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?")->execute([$otp['id']]);

        // Create 7-day session — store hash of token, never plaintext
        $token      = bin2hex(random_bytes(32));
        $tokenHash  = hash('sha256', $token);
        $expiresAt  = date('Y-m-d H:i:s', time() + 86400 * 7);
        $ip         = $_SERVER['REMOTE_ADDR'] ?? null;
        $ua         = mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 512);

        $pdo->prepare(
            "INSERT INTO admin_sessions (admin_id, token_hash, expires_at, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?)"
        )->execute([$admin['id'], $tokenHash, $expiresAt, $ip, $ua]);

        // Update last login timestamp
        $pdo->prepare("UPDATE admins SET last_login_at = NOW() WHERE id = ?")->execute([$admin['id']]);

        json_respond([
            'token' => $token,
            'admin' => ['id' => (int)$admin['id'], 'name' => $admin['name'], 'email' => $email, 'role' => $admin['role']],
        ]);
        break;
    }

    // ── 4. Verify existing session ────────────────────────────────────────────
    case 'verify-session': {
        $token = get_bearer_token();
        if (!$token) {
            json_respond(['valid' => false]);
        }

        $tokenHash = hash('sha256', $token);
        $stmt = $pdo->prepare(
            "SELECT a.id, a.name, a.email, a.role
             FROM admin_sessions s
             JOIN admins a ON a.id = s.admin_id
             WHERE s.token_hash = ? AND s.expires_at > NOW()
               AND s.revoked_at IS NULL AND a.is_active = 1
             LIMIT 1"
        );
        $stmt->execute([$tokenHash]);
        $admin = $stmt->fetch();

        if (!$admin) {
            json_respond(['valid' => false]);
        }

        json_respond(['valid' => true, 'admin' => $admin]);
        break;
    }

    // ── 5. Logout ─────────────────────────────────────────────────────────────
    case 'logout': {
        $token = get_bearer_token();
        if ($token) {
            $tokenHash = hash('sha256', $token);
            $pdo->prepare(
                "UPDATE admin_sessions SET revoked_at = NOW() WHERE token_hash = ?"
            )->execute([$tokenHash]);
        }
        json_respond(['ok' => true]);
        break;
    }

    default:
        json_respond(['error' => 'Acción no válida'], 400);
}

// ── Email template ────────────────────────────────────────────────────────────
function otp_email_html(string $name, string $code): string {
    return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Código de acceso</title>
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:48px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:2px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#2E3447;padding:36px 48px;text-align:center;">
            <div style="font-size:11px;letter-spacing:4px;color:#ff9933;font-weight:700;margin-bottom:6px;">LIV CAPITAL</div>
            <div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.4);">PANEL ADMINISTRATIVO</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:48px;">
            <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#2E3447;">Hola, {$name} 👋</p>
            <p style="margin:0 0 36px;font-size:14px;color:#888;line-height:1.6;">
              Aquí está tu código de acceso de un solo uso para entrar al panel administrativo de LIV Capital.
            </p>
            <div style="background:#f8f7f5;border-radius:4px;padding:32px;text-align:center;margin-bottom:36px;border:1px solid #e8e4df;">
              <div style="font-size:13px;color:#aaa;letter-spacing:2px;margin-bottom:12px;text-transform:uppercase;">Tu código</div>
              <div style="font-size:44px;font-weight:700;letter-spacing:14px;color:#2E3447;font-family:monospace;">{$code}</div>
            </div>
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
              Este código expira en <strong style="color:#666;">10 minutos</strong>.<br>
              Si no solicitaste este código, ignora este mensaje.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f7f5;padding:20px 48px;text-align:center;border-top:1px solid #ece8e3;">
            <p style="margin:0;font-size:11px;color:#bbb;">© 2026 LIV Capital — Capital Urbano. Todos los derechos reservados.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}
