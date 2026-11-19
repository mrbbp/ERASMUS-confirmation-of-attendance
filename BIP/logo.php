<?php
declare(strict_types=1);

$name = basename((string) ($_GET["f"] ?? ""));
$key = hex2bin((string) ($_GET["k"] ?? ""));
if (
    preg_match("/^[a-f0-9]{32}\\.(png|jpe?g|gif|svg)$/", $name) !== 1
    || !is_string($key)
    || strlen($key) !== 32
) {
    http_response_code(404);
    exit;
}

$path = __DIR__ . "/upload/" . $name;
$stored = is_file($path) ? file_get_contents($path) : false;
if (!is_string($stored) || strlen($stored) < 29) {
    http_response_code(404);
    exit;
}

$plain = openssl_decrypt(
    substr($stored, 28),
    "aes-256-gcm",
    $key,
    OPENSSL_RAW_DATA,
    substr($stored, 0, 12),
    substr($stored, 12, 16)
);
if (!is_string($plain)) {
    http_response_code(404);
    exit;
}

$types = [
    "png" => "image/png",
    "jpg" => "image/jpeg",
    "jpeg" => "image/jpeg",
    "gif" => "image/gif",
    "svg" => "image/svg+xml",
];
$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

header("Content-Type: " . $types[$ext]);
header("X-Content-Type-Options: nosniff");
header("Content-Security-Policy: default-src 'none'; sandbox");
header("Cache-Control: private, no-store");
header("Content-Length: " . (string) strlen($plain));
echo $plain;
