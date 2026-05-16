# Cron Jobs — LIV CAPITAL

## Recordatorios 24 horas antes de visita

El script `public/api/cron/send-reminders.php` envía un correo de recordatorio a cada visitante con cita al día siguiente. Adjunta un archivo `.ics` para su calendario.

---

### 1. Generar el secreto

En tu terminal local genera una clave aleatoria segura:

```bash
openssl rand -hex 32
```

Guarda el resultado (ejemplo: `a3f9c12e...`).

---

### 2. Agregar `CRON_SECRET` al servidor

Edita el archivo `public/api/_config.php` **en el servidor** (vía File Manager de cPanel o SFTP) y agrega al final:

```php
// Cron secret — debe coincidir con la URL del cron
define('CRON_SECRET', 'PEGA_AQUI_TU_CLAVE_GENERADA');
```

---

### 3. Ejecutar la migración de base de datos

Solo se necesita correr una vez. Agrega la columna `reminder_sent_at` a la tabla `visit_bookings`:

```sql
-- database/migrations/2026_003_reminder_sent_at.sql
ALTER TABLE visit_bookings
    ADD COLUMN IF NOT EXISTS reminder_sent_at DATETIME NULL DEFAULT NULL;
```

Desde phpMyAdmin en cPanel:

1. Abre la base de datos del proyecto.
2. Pestaña **SQL**.
3. Pega el `ALTER TABLE` y ejecuta.

---

### 4. Configurar el cron en cPanel

1. En cPanel ve a **Cron Jobs**.
2. En _Add New Cron Job_ selecciona **Once a day** o usa entrada personalizada.
3. Configura el horario:

| Campo   | Valor |
| ------- | ----- |
| Minute  | `0`   |
| Hour    | `15`  |
| Day     | `*`   |
| Month   | `*`   |
| Weekday | `*`   |

> **15 UTC = 9:00 am CDT (hora México, verano) / 8:00 am CST (hora México, invierno)**  
> Ajusta si prefieres otro horario.

4. En el campo **Command** pega:

```
curl -s "https://livcapitalgdl.mx/api/cron/send-reminders.php?key=PEGA_AQUI_TU_CLAVE" > /dev/null 2>&1
```

5. Clic en **Add New Cron Job**.

---

### 5. Verificar que funciona

Prueba manualmente desde el navegador o curl:

```bash
curl "https://livcapitalgdl.mx/api/cron/send-reminders.php?key=TU_CLAVE"
```

Respuesta esperada:

```json
{
  "success": true,
  "target_date": "2026-05-14",
  "checked": 3,
  "reminders_sent": 2,
  "failed": 0
}
```

| Campo            | Descripción                                                   |
| ---------------- | ------------------------------------------------------------- |
| `target_date`    | Fecha de visitas evaluada (mañana desde la hora de ejecución) |
| `checked`        | Total de visitas encontradas sin recordatorio                 |
| `reminders_sent` | Correos enviados exitosamente                                 |
| `failed`         | Envíos fallidos (se loguean en el error log de PHP)           |

---

### Notas

- El script es **idempotente**: nunca envía dos veces al mismo visitante. Una vez enviado se guarda el timestamp en `reminder_sent_at`.
- Si el cron falla un día, al correr al día siguiente **no reenvía** los de ayer. Solo evalúa el día siguiente a la ejecución.
- El número de horas de anticipación se controla desde el panel **Configuración → Visitas** (`visit_reminder_hours_before`, default `24`). Si cambias ese valor, ajusta también la hora del cron en cPanel para que coincidan.
- Las claves erróneas retornan `HTTP 403` y no envían correos.
