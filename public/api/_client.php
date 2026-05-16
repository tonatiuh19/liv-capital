<?php
/**
 * client_upsert()
 *
 * Insert a new client record by email, or update the existing one.
 * Returns the client_id (int).
 *
 * Rules:
 *  - name/phone are only overwritten when the new value is non-empty
 *  - last_contact_at is always refreshed
 */
function client_upsert(
    PDO    $pdo,
    string $email,
    string $name,
    string $phone,
    string $interest,
    string $source
): int {
    $stmt = $pdo->prepare("SELECT id FROM clients WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing) {
        $pdo->prepare(
            "UPDATE clients
             SET name            = IF(? <> '', ?, name),
                 phone           = IF(? <> '', ?, phone),
                 last_contact_at = NOW(),
                 updated_at      = NOW()
             WHERE id = ?"
        )->execute([$name, $name, $phone, $phone, (int)$existing['id']]);
        return (int)$existing['id'];
    }

    $pdo->prepare(
        "INSERT INTO clients (email, name, phone, interest, first_source, last_contact_at)
         VALUES (?, ?, ?, ?, ?, NOW())"
    )->execute([$email, $name, $phone ?: null, $interest, $source]);

    return (int)$pdo->lastInsertId();
}
