<?php
/**
 * _config.example.php — Copy this to _config.php and fill in real values.
 * _config.php is gitignored and must be uploaded manually to the server.
 * NEVER commit _config.php — it contains secrets.
 */
defined('APP_INIT') or die('Direct access not allowed.');

// ─── Database ────────────────────────────────────────────────────────────────
define('DB_HOST',    'localhost'); // 'localhost' on server; use server IP for remote dev (if port 3306 is open)
define('DB_NAME',    'your_db_name');         // e.g. banahost_livcapital
define('DB_USER',    'your_db_user');
define('DB_PASS',    'your_db_password');
define('DB_CHARSET', 'utf8mb4');

// ─── Under Construction Bypass ───────────────────────────────────────────────
// Password visitors enter to access the site while under construction.
// Use a strong passphrase. Change before going live.
define('BYPASS_PASSWORD', 'change-me-strong-passphrase');
// Random secret used to sign bypass tokens. Generate with: openssl rand -hex 32
define('BYPASS_SECRET',   'change-me-64-char-random-hex-string');

// ─── PHPMailer / SMTP (Banahosting) ──────────────────────────────────────────
define('SMTP_HOST',       'hd-4938.banahosting.com'); // from cPanel Mail Client Settings
define('SMTP_PORT',       465);
define('SMTP_ENCRYPTION', 'ssl');                     // ssl (port 465) | tls (port 587)
define('SMTP_USER',       'no-responder@livcapitalgdl.mx');
define('SMTP_PASS',       'your-smtp-password');
define('SMTP_FROM_NAME',  'LIV CAPITAL');             // optional; defaults to 'LIV CAPITAL'

// ─── App ─────────────────────────────────────────────────────────────────────
define('APP_ENV',     'production');          // development | production
define('APP_URL',     'https://livcapitalgdl.mx');
define('CORS_ORIGIN', 'https://livcapitalgdl.mx'); // Use '*' only in development
