<?php
/**
 * GET /api/admin/dashboard
 * Returns stats + upcoming visits + recent contacts for the dashboard.
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_respond(['error' => 'Método no permitido'], 405);
}

$pdo   = db_connect();
$admin = require_admin($pdo);

// ── Stats ─────────────────────────────────────────────────────────────────────
$s = [];

$s['visits_today'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM visit_bookings WHERE visit_date = CURDATE() AND status IN ('pending','confirmed')"
)->fetchColumn();

$s['visits_pending'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM visit_bookings WHERE status = 'pending' AND visit_date >= CURDATE()"
)->fetchColumn();

$s['visits_confirmed'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM visit_bookings WHERE status = 'confirmed' AND visit_date >= CURDATE()"
)->fetchColumn();

$s['visits_this_month'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM visit_bookings
     WHERE DATE_FORMAT(visit_date,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')
       AND status IN ('pending','confirmed','completed')"
)->fetchColumn();

$s['contacts_new'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM contact_submissions WHERE status = 'new'"
)->fetchColumn();

$s['contacts_total'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM contact_submissions"
)->fetchColumn();

$s['models_available'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM apartment_models WHERE is_available = 1"
)->fetchColumn();

$s['models_sold'] = (int)$pdo->query(
    "SELECT COUNT(*) FROM apartment_models WHERE is_available = 0"
)->fetchColumn();

// ── Upcoming visits (next 7 days) ─────────────────────────────────────────────
$upcomingStmt = $pdo->query(
    "SELECT id, visitor_name, visitor_email, visitor_phone,
            visit_date, time_start, time_end, status, visitor_interest
     FROM visit_bookings
     WHERE visit_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       AND status IN ('pending','confirmed')
     ORDER BY visit_date, time_start
     LIMIT 15"
);
$upcomingVisits = $upcomingStmt->fetchAll();

// ── Recent contacts ───────────────────────────────────────────────────────────
$contactsStmt = $pdo->query(
    "SELECT id, name, email, phone, interest, status, created_at
     FROM contact_submissions
     ORDER BY created_at DESC
     LIMIT 6"
);
$recentContacts = $contactsStmt->fetchAll();

json_respond([
    'stats'           => $s,
    'upcoming_visits' => $upcomingVisits,
    'recent_contacts' => $recentContacts,
]);
