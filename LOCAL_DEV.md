# Local Development

In development, **Vite** serves the React app at `localhost:8080`. There is no local PHP/Express server — API routes are only available in production (Banahosting). During local dev, API calls will return 404 unless you mock them.

---

## Requirements

- Node.js 18+
- npm

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

The app is available at **http://localhost:8080**

---

## How It Works Locally

```
Browser → http://localhost:8080
             │
             └── /*  → Vite (React HMR)
                          └── client/
```

Vite serves the React SPA with hot module replacement. There is no backend running locally — API calls go to PHP only in production.

---

## API Routes (Production Only)

| URL             | Production (PHP)      |
| --------------- | --------------------- |
| `GET /api/ping` | `public/api/ping.php` |
| `GET /api/demo` | `public/api/demo.php` |

### Adding a new API route

Create a PHP file in `public/api/`:

```bash
# e.g. public/api/contact.php
```

See [DEPLOY.md](DEPLOY.md) for the PHP template. No changes to Vite or any config are needed.

---

## Optional: Run PHP locally

If you need to test PHP endpoints locally:

```bash
npm run dev:api
```

This starts PHP's built-in server at `localhost:9000` serving the `public/` folder.
