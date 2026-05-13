# Deploying to Banahosting

This project builds to a **static React SPA + PHP API** designed for traditional shared hosting (Apache + PHP).

---

## Requirements

- Node.js 18+ and npm (local machine for building)
- Banahosting account with cPanel access
- Apache with `mod_rewrite` enabled (standard on Banahosting)
- PHP 7.4+ (standard on Banahosting)

---

## Build & Deploy (Manual — cPanel File Manager)

### 1. Build the project

```bash
npm run build
```

This outputs the compiled SPA to `dist/spa/`.

### 2. Assemble the deploy folder

```bash
bash deploy.sh
```

This creates a `deploy/` folder containing:

```
deploy/
├── index.html
├── assets/
├── .htaccess        ← handles SPA routing + PHP API routing
└── api/
    ├── ping.php
    ├── demo.php
    └── (any new PHP API files you add)
```

Or run both steps at once:

```bash
npm run deploy
```

### 3. Compress and upload

```bash
cd deploy && zip -r ../liv-capital.zip .
```

In **cPanel → File Manager**:

1. Navigate to `public_html/`
2. Upload `liv-capital.zip`
3. Extract in place
4. Done — the `.htaccess` handles all routing

---

## PHP API Template

For new API endpoints, create a file in `public/api/`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

echo json_encode(['data' => 'value']);
```

No changes to Vite or any config needed — `.htaccess` routes `/api/my-endpoint` → `api/my-endpoint.php`.

---

## FTP Deploy (Optional)

Create `.env.deploy` (never commit this):

```
FTP_HOST=ftp.yourdomain.com
FTP_USER=your_ftp_user
FTP_PASS=your_ftp_password
FTP_REMOTE_DIR=/public_html
```

Then run:

```bash
npm run deploy -- --upload
```

Requires `lftp`: `brew install lftp`
