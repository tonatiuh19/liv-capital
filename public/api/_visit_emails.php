<?php
/**
 * _visit_emails.php — Shared email helpers for visit notifications.
 *
 * Functions:
 *   format_date_es()           — "Lunes, 20 de Mayo de 2026"
 *   interest_label()           — maps interest key to readable label
 *   build_ics()                — builds .ics calendar attachment string
 *   visitor_email_html()       — new booking / manual creation confirmation
 *   visitor_update_email_html()— rescheduled date/time
 *   visitor_cancel_email_html()— cancellation notice
 *   visitor_reminder_email_html() — 24hr reminder
 *   admin_email_html()         — admin new-booking notification
 *
 * Included by: bookings.php, admin/visits.php, cron/send-reminders.php
 */
defined('APP_INIT') or die('Direct access not allowed.');

// ── Utility helpers ───────────────────────────────────────────────────────────

function format_date_es(string $date): string {
    $ts     = strtotime($date);
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

// ── Shared header/footer HTML ─────────────────────────────────────────────────

function _email_logo_header(string $badgeText, string $titleText, string $subtitleText = ''): string {
    $sub = $subtitleText ? "<div style=\"color:#D9D6D1;font-size:13px;font-weight:300;margin-top:8px;letter-spacing:1px;\">{$subtitleText}</div>" : '';
    return "
      <tr><td style=\"background:#2E3447;padding:32px 48px 28px;text-align:center;\">
        <img src=\"https://livcapitalgdl.mx/images/logo_liv_white.png\"
             alt=\"LIV CAPITAL\"
             width=\"80\"
             style=\"display:block;margin:0 auto;height:auto;border:0;max-width:80px;\" />
        <div style=\"color:#ffffff;font-size:22px;font-weight:800;letter-spacing:2px;margin-top:24px;\">{$badgeText}</div>
        {$sub}
      </td></tr>";
}

function _email_visit_card(string $dateEs, string $time, string $interestLbl, string $cardBg = '#2E3447', string $accentBg = '#ff9933'): string {
    return "
      <tr><td style=\"padding:0 48px;\">
        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:{$cardBg};border-radius:4px;overflow:hidden;\">
          <tr><td style=\"padding:8px 24px;background:{$accentBg};\">
            <span style=\"color:#2E3447;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;\">Detalles de tu visita</span>
          </td></tr>
          <tr><td style=\"padding:28px 24px;\">
            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
              <tr><td style=\"padding-bottom:16px;\">
                <div style=\"color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;\">Fecha</div>
                <div style=\"color:#ffffff;font-size:16px;font-weight:600;\">{$dateEs}</div>
              </td></tr>
              <tr><td style=\"padding-bottom:16px;\">
                <div style=\"color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;\">Horario</div>
                <div style=\"color:{$accentBg};font-size:22px;font-weight:700;\">{$time}</div>
              </td></tr>
              <tr><td style=\"padding-bottom:16px;\">
                <div style=\"color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;\">Interés</div>
                <div style=\"color:#ffffff;font-size:14px;\">{$interestLbl}</div>
              </td></tr>
              <tr><td>
                <div style=\"color:#D9D6D1;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;\">Ubicación</div>
                <div style=\"color:#ffffff;font-size:14px;\">Guadalajara, Jalisco, México</div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>";
}

function _email_footer(): string {
    $year = date('Y');
    return "
      <tr><td style=\"background:#F5F5F3;padding:24px 48px;border-top:1px solid #D9D6D1;text-align:center;\">
        <p style=\"color:#A8A29E;font-size:11px;margin:0;line-height:1.6;\">
          © {$year} LIV CAPITAL — Guadalajara, Jalisco, México<br>
          <a href=\"https://livcapitalgdl.mx\" style=\"color:#ff9933;text-decoration:none;\">livcapitalgdl.mx</a> &nbsp;·&nbsp; info@livcapitalgdl.mx
        </p>
      </td></tr>";
}

function _email_wrap(string $innerRows): string {
    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
         . '<body style="margin:0;padding:0;background:#F5F5F3;font-family:\'Segoe UI\',Arial,sans-serif;">'
         . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F3;padding:40px 20px;"><tr><td align="center">'
         . '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(46,52,71,0.10);">'
         . $innerRows
         . '</table></td></tr></table></body></html>';
}

// ── Email: New booking / admin-created confirmation ───────────────────────────

function visitor_email_html(
    string $name, string $date, string $start, string $end,
    string $interest, int $bookingId, string $cancelToken = '', string $editToken = ''
): string {
    $dateEs      = format_date_es($date);
    $interestLbl = interest_label($interest);
    $time        = $start . ' – ' . $end . ' hrs';
    $rows  = _email_logo_header('VISITA CONFIRMADA', '', "Referencia #LIV-{$bookingId}");
    $rows .= "
      <tr><td style=\"padding:40px 48px 0;color:#1C1C1C;\">
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 16px;\">Hola <strong>{$name}</strong>,</p>
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 24px;color:#6B7280;\">Tu visita al desarrollo <strong style=\"color:#2E3447;\">LIV CAPITAL</strong> ha sido agendada exitosamente. Te esperamos con gusto.</p>
      </td></tr>";
    $rows .= _email_visit_card($dateEs, $time, $interestLbl);
    $editBtn = $editToken
        ? "<tr><td style=\"padding:32px 48px 0;text-align:center;\"><a href=\"https://livcapitalgdl.mx/api/edit-booking.php?token={$editToken}\" style=\"display:inline-block;border:2px solid #2E3447;color:#2E3447;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;padding:10px 28px;border-radius:3px;text-transform:uppercase;\">Editar visita</a></td></tr>"
        : '';
    $cancelBtn = $cancelToken
        ? "<tr><td style=\"padding:12px 48px 0;text-align:center;\"><a href=\"https://livcapitalgdl.mx/api/cancel-booking.php?token={$cancelToken}\" style=\"display:inline-block;border:2px solid #dc2626;color:#dc2626;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;padding:10px 28px;border-radius:3px;text-transform:uppercase;\">Cancelar visita</a></td></tr>"
        : '';
    $rows .= "
      <tr><td style=\"padding:32px 48px 0;color:#6B7280;font-size:13px;line-height:1.8;\">
        <p style=\"margin:0 0 12px;\">Adjuntamos un archivo <strong>.ics</strong> para que puedas agregar esta cita a tu calendario.</p>
        <p style=\"margin:0 0 12px;\">Te recomendamos llegar 5 minutos antes. Nuestro equipo de ventas te recibirá personalmente.</p>
        <p style=\"margin:0;\">Si necesitas reprogramar tu visita, usa el botón de abajo o contáctanos con anticipación.</p>
      </td></tr>
      <tr><td style=\"padding:32px 48px 24px;text-align:center;\">
        <a href=\"https://livcapitalgdl.mx\" style=\"display:inline-block;background:#ff9933;color:#2E3447;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;padding:14px 36px;border-radius:3px;text-transform:uppercase;\">Conoce más del proyecto</a>
      </td></tr>";
    $rows .= $editBtn;
    $rows .= $cancelBtn;
    $rows .= "<tr><td style=\"padding:24px 48px 40px;\"></td></tr>";
    $rows .= _email_footer();
    return _email_wrap($rows);
}

// ── Email: Rescheduled (date or time changed) ─────────────────────────────────

function visitor_update_email_html(
    string $name, string $date, string $start, string $end,
    string $interest, int $bookingId,
    string $editToken = '', string $cancelToken = ''
): string {
    $dateEs      = format_date_es($date);
    $interestLbl = interest_label($interest);
    $time        = $start . ' – ' . $end . ' hrs';
    $rows  = _email_logo_header('VISITA REPROGRAMADA', '', "Referencia #LIV-{$bookingId}");
    $rows .= "
      <tr><td style=\"padding:40px 48px 0;color:#1C1C1C;\">
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 16px;\">Hola <strong>{$name}</strong>,</p>
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 24px;color:#6B7280;\">Tu visita a <strong style=\"color:#2E3447;\">LIV CAPITAL</strong> ha sido reprogramada. Aquí están los nuevos detalles:</p>
      </td></tr>";
    $rows .= _email_visit_card($dateEs, $time, $interestLbl);
    $editBtn = $editToken
        ? "<tr><td style=\"padding:32px 48px 0;text-align:center;\"><a href=\"https://livcapitalgdl.mx/api/edit-booking.php?token={$editToken}\" style=\"display:inline-block;border:2px solid #2E3447;color:#2E3447;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;padding:10px 28px;border-radius:3px;text-transform:uppercase;\">Editar visita</a></td></tr>"
        : '';
    $cancelBtn = $cancelToken
        ? "<tr><td style=\"padding:12px 48px 0;text-align:center;\"><a href=\"https://livcapitalgdl.mx/api/cancel-booking.php?token={$cancelToken}\" style=\"display:inline-block;border:2px solid #dc2626;color:#dc2626;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;padding:10px 28px;border-radius:3px;text-transform:uppercase;\">Cancelar visita</a></td></tr>"
        : '';
    $rows .= "
      <tr><td style=\"padding:32px 48px 0;color:#6B7280;font-size:13px;line-height:1.8;\">
        <p style=\"margin:0 0 12px;\">Adjuntamos el archivo <strong>.ics</strong> actualizado para tu calendario.</p>
        <p style=\"margin:0;\">Si tienes alguna duda, no dudes en contactarnos.</p>
      </td></tr>
      <tr><td style=\"padding:32px 48px 24px;text-align:center;\">
        <a href=\"https://livcapitalgdl.mx\" style=\"display:inline-block;background:#ff9933;color:#2E3447;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;padding:14px 36px;border-radius:3px;text-transform:uppercase;\">Conoce más del proyecto</a>
      </td></tr>";
    $rows .= $editBtn;
    $rows .= $cancelBtn;
    $rows .= "<tr><td style=\"padding:24px 48px 40px;\"></td></tr>";
    $rows .= _email_footer();
    return _email_wrap($rows);
}

// ── Email: Cancellation ───────────────────────────────────────────────────────

function visitor_cancel_email_html(
    string $name, string $date, string $start, string $end,
    int $bookingId
): string {
    $dateEs = format_date_es($date);
    $time   = $start . ' – ' . $end . ' hrs';
    $rows  = _email_logo_header('VISITA CANCELADA', '', "Referencia #LIV-{$bookingId}");
    $rows .= "
      <tr><td style=\"padding:40px 48px 0;color:#1C1C1C;\">
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 16px;\">Hola <strong>{$name}</strong>,</p>
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 24px;color:#6B7280;\">Tu visita a <strong style=\"color:#2E3447;\">LIV CAPITAL</strong> ha sido cancelada.</p>
      </td></tr>
      <tr><td style=\"padding:0 48px;\">
        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#7f1d1d;border-radius:4px;overflow:hidden;\">
          <tr><td style=\"padding:8px 24px;background:#dc2626;\">
            <span style=\"color:#ffffff;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;\">Visita cancelada</span>
          </td></tr>
          <tr><td style=\"padding:24px;\">
            <div style=\"color:#fca5a5;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;\">Fecha</div>
            <div style=\"color:#ffffff;font-size:16px;font-weight:600;margin-bottom:12px;\">{$dateEs}</div>
            <div style=\"color:#fca5a5;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;\">Horario</div>
            <div style=\"color:#fca5a5;font-size:18px;font-weight:700;\">{$time}</div>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style=\"padding:32px 48px 0;color:#6B7280;font-size:13px;line-height:1.8;\">
        <p style=\"margin:0 0 12px;\">Si deseas agendar una nueva visita, puedes hacerlo en cualquier momento desde nuestra página.</p>
        <p style=\"margin:0;\">Si crees que esto fue un error, por favor contáctanos.</p>
      </td></tr>
      <tr><td style=\"padding:32px 48px 40px;text-align:center;\">
        <a href=\"https://livcapitalgdl.mx\" style=\"display:inline-block;background:#ff9933;color:#2E3447;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;padding:14px 36px;border-radius:3px;text-transform:uppercase;\">Agendar nueva visita</a>
      </td></tr>";
    $rows .= _email_footer();
    return _email_wrap($rows);
}

// ── Email: 24hr Reminder ──────────────────────────────────────────────────────

function visitor_reminder_email_html(
    string $name, string $date, string $start, string $end,
    string $interest, int $bookingId
): string {
    $dateEs      = format_date_es($date);
    $interestLbl = interest_label($interest);
    $time        = $start . ' – ' . $end . ' hrs';
    $rows  = _email_logo_header('TU VISITA ES MAÑANA', '', "Referencia #LIV-{$bookingId}");
    $rows .= "
      <tr><td style=\"padding:40px 48px 0;color:#1C1C1C;\">
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 16px;\">Hola <strong>{$name}</strong>,</p>
        <p style=\"font-size:15px;line-height:1.7;margin:0 0 24px;color:#6B7280;\">Te recordamos que tienes una visita programada en <strong style=\"color:#2E3447;\">LIV CAPITAL</strong> mañana. ¡Te esperamos!</p>
      </td></tr>";
    $rows .= _email_visit_card($dateEs, $time, $interestLbl);
    $rows .= "
      <tr><td style=\"padding:32px 48px 0;color:#6B7280;font-size:13px;line-height:1.8;\">
        <p style=\"margin:0 0 12px;\">Te recomendamos llegar 5 minutos antes. Nuestro equipo de ventas te recibirá personalmente.</p>
        <p style=\"margin:0 0 12px;\"><strong style=\"color:#2E3447;\">LIV CAPITAL</strong> — Guadalajara, Jalisco, México</p>
        <p style=\"margin:0;\">Si necesitas reprogramar, contáctanos a la brevedad.</p>
      </td></tr>
      <tr><td style=\"padding:32px 48px 40px;text-align:center;\">
        <a href=\"https://livcapitalgdl.mx\" style=\"display:inline-block;background:#ff9933;color:#2E3447;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;padding:14px 36px;border-radius:3px;text-transform:uppercase;\">Ver proyecto</a>
      </td></tr>";
    $rows .= _email_footer();
    return _email_wrap($rows);
}

// ── Email: Admin new booking notification ─────────────────────────────────────

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
      <tr><td style="padding:36px 48px;">
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
