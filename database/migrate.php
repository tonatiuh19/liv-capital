#!/usr/bin/env php
<?php
/**
 * migrate.php — Simple SQL migration runner
 *
 * Usage (from project root or server terminal):
 *   php database/migrate.php [--dry-run]
 *
 * Reads all database/migrations/*.sql files in order and runs any
 * that have not been recorded in the `schema_migrations` table.
 *
 * On first run it creates the `schema_migrations` table automatically.
 */

// ── Config ────────────────────────────────────────────────────────────────────
// Load from _config.php if running inside public/api context,
// otherwise read from environment or prompt.
$config = load_config();

$dryRun = in_array('--dry-run', $argv ?? [], true);

// ── Connect ───────────────────────────────────────────────────────────────────
try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['name'],
        $config['charset']
    );
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage() . "\n");
}

// ── Bootstrap migrations table ────────────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS `schema_migrations` (
      `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `migration`  VARCHAR(255) NOT NULL,
      `applied_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `uq_migration` (`migration`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// ── Fetch already-applied migrations ─────────────────────────────────────────
$applied = $pdo->query("SELECT migration FROM schema_migrations ORDER BY migration")
               ->fetchAll(PDO::FETCH_COLUMN);
$applied = array_flip($applied); // for O(1) lookup

// ── Discover migration files ──────────────────────────────────────────────────
$migrationsDir = __DIR__ . '/migrations';
$files = glob($migrationsDir . '/*.sql');
if ($files === false || count($files) === 0) {
    echo "No migration files found in {$migrationsDir}\n";
    exit(0);
}
sort($files);

// ── Run pending migrations ────────────────────────────────────────────────────
$pending = 0;
$ran     = 0;

foreach ($files as $file) {
    $name = basename($file, '.sql');

    if (isset($applied[$name])) {
        echo "[SKIP]  {$name} (already applied)\n";
        continue;
    }

    $pending++;
    $sql = file_get_contents($file);

    if ($dryRun) {
        echo "[DRY]   {$name} — would run\n";
        continue;
    }

    echo "[RUN]   {$name} ... ";

    try {
        $pdo->beginTransaction();
        // Execute each statement separately (PDO::exec doesn't support multi-statement well)
        foreach (split_sql($sql) as $statement) {
            $statement = trim($statement);
            if ($statement === '') continue;
            $pdo->exec($statement);
        }
        $pdo->prepare("INSERT INTO schema_migrations (migration) VALUES (?)")
            ->execute([$name]);
        $pdo->commit();
        echo "OK\n";
        $ran++;
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo "FAILED\n";
        echo "  Error: " . $e->getMessage() . "\n";
        echo "  Migration stopped. Fix the error and re-run.\n";
        exit(1);
    }
}

if ($dryRun) {
    echo "\n[DRY RUN] {$pending} pending migration(s) — nothing was applied.\n";
} elseif ($ran === 0 && $pending === 0) {
    echo "\nAll migrations already applied. Nothing to do.\n";
} else {
    echo "\nDone. {$ran} migration(s) applied.\n";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Split a SQL file into individual statements by semicolon,
 * respecting string literals and comments.
 */
function split_sql(string $sql): array
{
    // Strip single-line comments (-- ...) and block comments (/* ... */)
    $sql = preg_replace('/--[^\n]*/', '', $sql);
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
    return explode(';', $sql);
}

/**
 * Load DB credentials. Tries env vars first, then falls back to
 * prompting the user interactively.
 */
function load_config(): array
{
    $host    = getenv('DB_HOST')    ?: readline_or_default('DB host',    'localhost');
    $name    = getenv('DB_NAME')    ?: readline_or_default('DB name',    '');
    $user    = getenv('DB_USER')    ?: readline_or_default('DB user',    '');
    $pass    = getenv('DB_PASS')    ?: readline_or_default('DB password','');
    $charset = getenv('DB_CHARSET') ?: 'utf8mb4';

    return compact('host', 'name', 'user', 'pass', 'charset');
}

function readline_or_default(string $prompt, string $default): string
{
    if (!function_exists('readline')) {
        return $default;
    }
    $val = readline("{$prompt}" . ($default !== '' ? " [{$default}]" : '') . ": ");
    return ($val === '' || $val === false) ? $default : $val;
}
