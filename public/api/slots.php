<?php
/**
 * GET /api/slots.php?month=YYYY-MM
 * Returns available time slots for every bookable date in the given month.
 *
 * Response:
 * {
 *   "month": "2026-05",
 *   "dates": {
 *     "2026-05-15": [
 *       { "id": 1, "start": "10:00", "end": "11:00", "available": 2, "label": null }
 *     ]
 *   }
 * }
 *
 * A date is omitted if it has no available slots (past, blocked, full, or no templates).
 */
define('APP_INIT', true);
require_once __DIR__ . '/_config.php';
require_once __DIR__ . '/_headers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_respond(['error' => 'Method not allowed'], 405);
}

$month = isset($_GET['month']) ? trim($_GET['month']) : date('Y-m');

// Validate YYYY-MM
if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
    json_respond(['error' => 'Invalid month format. Use YYYY-MM'], 400);
}

[$yearStr, $monStr] = explode('-', $month);
$year = (int)$yearStr;
$mon  = (int)$monStr;

if ($year < 2020 || $year > 2100 || $mon < 1 || $mon > 12) {
    json_respond(['error' => 'Month out of range'], 400);
}

try {
    $pdo = db_connect();

    // ── Read visit config from building_config ────────────────────────────────
    $cfgStmt = $pdo->query(
        "SELECT config_key, config_value
         FROM building_config
         WHERE config_key IN ('visit_booking_advance_days','visit_min_advance_hours')"
    );
    $cfg = [];
    foreach ($cfgStmt->fetchAll() as $row) {
        $cfg[$row['config_key']] = (int)$row['config_value'];
    }
    $maxAdvanceDays  = $cfg['visit_booking_advance_days']  ?? 30;
    $minAdvanceHours = $cfg['visit_min_advance_hours']     ?? 24;

    $nowTs   = time();
    $minTs   = $nowTs + ($minAdvanceHours * 3600);
    $today   = date('Y-m-d', $nowTs);
    $maxDate = date('Y-m-d', $nowTs + ($maxAdvanceDays * 86400));

    // ── Slot templates (grouped by day_of_week) ───────────────────────────────
    $tplStmt = $pdo->query(
        "SELECT id, day_of_week, start_time, end_time, max_capacity, label
         FROM visit_slot_templates
         WHERE is_active = 1
         ORDER BY day_of_week, start_time"
    );
    $templatesByDay = []; // [int(0-6)] => [ {id,start_time,end_time,...} ]
    foreach ($tplStmt->fetchAll() as $tpl) {
        $templatesByDay[(int)$tpl['day_of_week']][] = $tpl;
    }

    // ── Overrides (blocked full days) ─────────────────────────────────────────
    $firstDay = sprintf('%04d-%02d-01', $year, $mon);
    $lastDay  = date('Y-m-t', strtotime($firstDay));

    $ovStmt = $pdo->prepare(
        "SELECT override_date, start_time, is_blocked
         FROM visit_slot_overrides
         WHERE override_date BETWEEN :s AND :e AND is_blocked = 1"
    );
    $ovStmt->execute([':s' => $firstDay, ':e' => $lastDay]);
    $blockedFullDays = [];
    foreach ($ovStmt->fetchAll() as $ov) {
        if ($ov['start_time'] === null) {
            $blockedFullDays[$ov['override_date']] = true;
        }
    }

    // ── Booking counts (pending + confirmed) ─────────────────────────────────
    $bkStmt = $pdo->prepare(
        "SELECT visit_date, slot_template_id, COUNT(*) AS booked
         FROM visit_bookings
         WHERE visit_date BETWEEN :s AND :e
           AND status IN ('pending','confirmed')
         GROUP BY visit_date, slot_template_id"
    );
    $bkStmt->execute([':s' => $firstDay, ':e' => $lastDay]);
    $counts = []; // "YYYY-MM-DD|template_id" => int
    foreach ($bkStmt->fetchAll() as $b) {
        $counts[$b['visit_date'] . '|' . $b['slot_template_id']] = (int)$b['booked'];
    }

    // ── Build result ──────────────────────────────────────────────────────────
    $daysInMonth = (int)date('t', strtotime($firstDay));
    $result      = [];

    for ($d = 1; $d <= $daysInMonth; $d++) {
        $dateStr = sprintf('%04d-%02d-%02d', $year, $mon, $d);

        if ($dateStr < $today)        continue; // past
        if ($dateStr > $maxDate)      continue; // too far ahead
        if (isset($blockedFullDays[$dateStr])) continue; // blocked

        $dow = (int)date('w', strtotime($dateStr)); // 0=Sun .. 6=Sat
        if (empty($templatesByDay[$dow])) continue; // no templates

        $daySlots = [];
        foreach ($templatesByDay[$dow] as $tpl) {
            $slotTs = strtotime($dateStr . ' ' . $tpl['start_time']);
            if ($slotTs < $minTs) continue; // too soon

            $key   = $dateStr . '|' . $tpl['id'];
            $avail = max(0, (int)$tpl['max_capacity'] - ($counts[$key] ?? 0));
            if ($avail <= 0) continue; // full

            $daySlots[] = [
                'id'        => (int)$tpl['id'],
                'start'     => substr($tpl['start_time'], 0, 5),
                'end'       => substr($tpl['end_time'],   0, 5),
                'available' => $avail,
                'label'     => $tpl['label'],
            ];
        }

        if (!empty($daySlots)) {
            $result[$dateStr] = $daySlots;
        }
    }

    json_respond(['month' => $month, 'dates' => $result]);

} catch (PDOException $e) {
    error_log('[slots.php] DB error: ' . $e->getMessage());
    json_respond(['error' => 'Database error'], 500);
}
