<?php
/**
 * cron/send-reminders.php — Send 24hr pre-visit reminder emails.
 *
 * Schedule in cPanel (once daily, e.g. 9am Mexico City time):
 *   0 15 * * * curl -s "https://livcapitalgdl.mx/api/cron/send-reminders.php?key=YOUR_CRON_SECRET" > /dev/null
 *   (15 UTC = 9am CDT / 8am CST)
 *
 * Access: protected by CRON_SECRET defined in _config.php
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../_config.php';
require_once __DIR__ . '/../../_headers.php';
require_once __DIR__ . '/../../_mailer.php';
require_once __DIR__ . '/../../_visit_emails.php';

// ── Auth ──────────────────────────────────────────────────────────────────────
$key = $_GET['key'] ?? '';
if (!defined('CRON_SECRET') || !hash_equals(CRON_SECRET, $key)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// ── Load config ───────────────────────────────────────────────────────────────
$pdo = db_connect();

$cfgStmt = $pdo->prepare(
    "SELECT config_key, config_value FROM building_config
     WHERE config_key IN ('visit_reminder_hours_before', 'admin_notify_email')"
);
$cfgStmt->execute();
$cfg = [];
foreach ($cfgStmt->fetchAll() as $r) {
    $cfg[$r['config_key']] = $r['config_value'];
}
$reminderHours = max(1, (int)($cfg['visit_reminder_hours_before'] ?? 24));

// ── Find visits to remind ─────────────────────────────────────────────────────
// Target: visits whose visit_date matches the date that is $reminderHours from now.
// Running daily at 9am, with default 24h = all visits tomorrow.
$targetDate = date('Y-m-d', strtotime("+{$reminderHours} hours"));

$stmt = $pdo->prepare(
    "SELECT id, visit_date, time_start, time_end,
            visitor_name, visitor_email, visitor_interest
     FROM visit_bookings
     WHERE visit_date = ?
       AND status IN ('pending', 'confirmed')
       AND reminder_sent_at IS NULL
       AND visitor_email IS NOT NULL
       AND visitor_email != ''
     ORDER BY time_start"
);
$stmt->execute([$targetDate]);
$visits = $stmt->fetchAll();

// ── Send reminders ────────────────────────────────────────────────────────────
$sent   = 0;
$failed = 0;
$organizerAddr = defined('SMTP_USER') ? SMTP_USER : 'noreply@livcapitalgdl.mx';

foreach ($visits as $v) {
    $startHm = substr($v['time_start'], 0, 5);
    $endHm   = substr($v['time_end'],   0, 5);

    try {
        $ics = build_ics(
            (int)$v['id'],
            $v['visit_date'],
            $startHm,
            $endHm,
            $v['visitor_name'],
            $v['visitor_email'],
            $organizerAddr
        );

        smtp_send_mail(
            $v['visitor_email'],
            $v['visitor_name'],
            '⏰ Recordatorio: Tu visita LIV CAPITAL es mañana — ' . format_date_es($v['visit_date']),
            visitor_reminder_email_html(
                $v['visitor_name'],
                $v['visit_date'],
                $startHm,
                $endHm,
                $v['visitor_interest'] ?? 'general',
                (int)$v['id']
            ),
            [['name' => "visita-liv-capital-{$v['visit_date']}.ics", 'mime' => 'text/calendar; method=REQUEST', 'data' => $ics]]
        );

        // Mark reminder as sent
        $pdo->prepare("UPDATE visit_bookings SET reminder_sent_at = NOW() WHERE id = ?")
            ->execute([$v['id']]);

        $sent++;
    } catch (RuntimeException $e) {
        error_log('[cron/send-reminders.php] Email failed for visit #' . $v['id'] . ': ' . $e->getMessage());
        $failed++;
    }
}

echo json_encode([
    'success'         => true,
    'target_date'     => $targetDate,
    'checked'         => count($visits),
    'reminders_sent'  => $sent,
    'failed'          => $failed,
]);
