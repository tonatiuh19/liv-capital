<?php
/**
 * _mailer.php — Self-contained SMTP mailer (no dependencies).
 *
 * Supports:
 *   - Port 465 implicit SSL  (SMTP_ENCRYPTION = 'ssl')
 *   - Port 587 STARTTLS      (SMTP_ENCRYPTION = 'tls')
 *   - Port 25 / 1025 plain   (SMTP_ENCRYPTION = '')
 *
 * Usage:
 *   smtp_send_mail(
 *     to_email: 'user@example.com',
 *     to_name:  'Juan García',
 *     subject:  'Asunto',
 *     html:     '<html>...</html>',
 *     attachments: [  // optional
 *       ['name' => 'file.ics', 'mime' => 'text/calendar; method=REQUEST', 'data' => $icsString],
 *     ]
 *   );
 *   Returns true on success, throws RuntimeException on failure.
 */
defined('APP_INIT') or die('Direct access not allowed.');

function smtp_send_mail(
    string $to_email,
    string $to_name,
    string $subject,
    string $html,
    array  $attachments = []
): bool {
    $host       = defined('SMTP_HOST') ? SMTP_HOST : 'localhost';
    $port       = defined('SMTP_PORT') ? (int)SMTP_PORT : 25;
    $encryption = defined('SMTP_ENCRYPTION') ? strtolower(SMTP_ENCRYPTION) : '';
    $user       = defined('SMTP_USER') ? SMTP_USER : '';
    $pass       = defined('SMTP_PASS') ? SMTP_PASS : '';
    $fromAddr   = defined('SMTP_USER') ? SMTP_USER : 'noreply@livcapitalgdl.mx';
    $fromName   = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'LIV CAPITAL';

    // ── Connect ───────────────────────────────────────────────────────────────
    $address = ($encryption === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;
    $errno   = 0;
    $errstr  = '';
    $conn    = @stream_socket_client($address, $errno, $errstr, 15);

    if (!$conn) {
        throw new RuntimeException("SMTP connect failed: {$errstr} ({$errno})");
    }

    stream_set_timeout($conn, 15);

    // ── SMTP conversation helpers ─────────────────────────────────────────────
    $read = function () use ($conn): string {
        $buf = '';
        while (!feof($conn)) {
            $line = fgets($conn, 512);
            $buf .= $line;
            // Multi-line responses continue while 4th char is '-'
            if (strlen($line) >= 4 && $line[3] === ' ') break;
        }
        return $buf;
    };

    $cmd = function (string $command) use ($conn, $read): string {
        fwrite($conn, $command . "\r\n");
        return $read();
    };

    $expect = function (string $response, string $code) {
        if (substr(trim($response), 0, 3) !== $code) {
            throw new RuntimeException("SMTP error (expected {$code}): " . trim($response));
        }
    };

    // ── Handshake ─────────────────────────────────────────────────────────────
    $expect($read(),                   '220'); // greeting
    $expect($cmd("EHLO livcapitalgdl.mx"), '250');

    // STARTTLS upgrade
    if ($encryption === 'tls') {
        $expect($cmd("STARTTLS"), '220');
        stream_socket_enable_crypto($conn, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT);
        $expect($cmd("EHLO livcapitalgdl.mx"), '250');
    }

    // AUTH LOGIN
    if ($user !== '' && $pass !== '') {
        $expect($cmd("AUTH LOGIN"),          '334');
        $expect($cmd(base64_encode($user)), '334');
        $expect($cmd(base64_encode($pass)), '235');
    }

    // ── Envelope ─────────────────────────────────────────────────────────────
    $expect($cmd("MAIL FROM:<{$fromAddr}>"),  '250');
    $expect($cmd("RCPT TO:<{$to_email}>"),    '250');
    $expect($cmd("DATA"),                     '354');

    // ── Build message ─────────────────────────────────────────────────────────
    $boundary    = '----LIV_BOUNDARY_' . bin2hex(random_bytes(8));
    $fromEncoded = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    $toEncoded   = '=?UTF-8?B?' . base64_encode($to_name)  . '?=';
    $subEncoded  = '=?UTF-8?B?' . base64_encode($subject)  . '?=';
    $msgId       = '<' . time() . '.' . bin2hex(random_bytes(6)) . '@livcapitalgdl.mx>';
    $date        = date('r');

    $headers  = "Date: {$date}\r\n";
    $headers .= "From: {$fromEncoded} <{$fromAddr}>\r\n";
    $headers .= "To: {$toEncoded} <{$to_email}>\r\n";
    $headers .= "Subject: {$subEncoded}\r\n";
    $headers .= "Message-ID: {$msgId}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "X-Mailer: LIV-CAPITAL-PHP\r\n";

    if (empty($attachments)) {
        // Simple HTML-only email — no multipart wrapper needed
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: base64\r\n";
        $body = chunk_split(base64_encode($html));
    } else {
        $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

        $body  = "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($html)) . "\r\n";

        foreach ($attachments as $att) {
            $b64name  = '=?UTF-8?B?' . base64_encode($att['name']) . '?=';
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Type: {$att['mime']}; name=\"{$b64name}\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"{$b64name}\"\r\n\r\n";
            $body .= chunk_split(base64_encode($att['data'])) . "\r\n";
        }

        $body .= "--{$boundary}--\r\n";
    }

    // Dot-stuffing: lines starting with "." must be doubled
    $message = $headers . "\r\n" . $body;
    $message = preg_replace('/^\.$/m', '..', $message);

    fwrite($conn, $message . "\r\n.\r\n");
    $expect($read(), '250'); // server accepted the message

    $cmd("QUIT");
    fclose($conn);

    return true;
}
