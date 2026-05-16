<?php
/**
 * POST /api/admin/amenity-upload.php
 * Authenticated. Accepts a single image file upload (multipart/form-data, field: "file").
 * Saves to public/uploads/amenities/ and returns { "url": "/uploads/amenities/filename.ext" }.
 *
 * Constraints: JPG / PNG / WebP only, max 5 MB.
 */
require_once __DIR__ . '/_init.php';
require_once __DIR__ . '/_middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_respond(['error' => 'Method not allowed'], 405);
}

$pdo = db_connect();
require_admin($pdo);

if (empty($_FILES['file'])) {
    json_respond(['error' => 'No se recibió ningún archivo (campo: file)'], 400);
}

$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    $errMap = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo supera el límite del servidor',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo supera el límite del formulario',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió parcialmente',
        UPLOAD_ERR_NO_FILE    => 'No se recibió archivo',
        UPLOAD_ERR_NO_TMP_DIR => 'Directorio temporal no disponible',
        UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo',
        UPLOAD_ERR_EXTENSION  => 'Extensión bloqueó la subida',
    ];
    json_respond(['error' => $errMap[$file['error']] ?? 'Error al subir'], 400);
}

// Max 5 MB
if ($file['size'] > 5 * 1024 * 1024) {
    json_respond(['error' => 'El archivo no puede superar 5 MB'], 400);
}

// Validate MIME via file content (not the declared MIME)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);
$allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
if (!array_key_exists($mime, $allowed)) {
    json_respond(['error' => 'Solo se permiten imágenes JPG, PNG o WebP'], 400);
}
$ext = $allowed[$mime];

// Ensure upload directory exists (public/uploads/amenities/)
$uploadDir = realpath(__DIR__ . '/../../') . '/uploads/amenities/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        json_respond(['error' => 'No se pudo crear el directorio de subida'], 500);
    }
}

$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_respond(['error' => 'Error al guardar el archivo en el servidor'], 500);
}

json_respond(['url' => '/uploads/amenities/' . $filename], 201);
