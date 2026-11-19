<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(["error" => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST" || !isset($_FILES["logo"])) {
    fail(400, "Fichier manquant.");
}

$file = $_FILES["logo"];
if (!is_array($file) || ($file["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    fail(400, "Envoi refusé.");
}

$original = basename(str_replace("\0", "", (string) $file["name"]));
if (preg_match("/\\.(png|jpe?g|gif|svg)$/i", $original) !== 1) {
    fail(415, "Formats acceptés : PNG, SVG, JPEG, GIF.");
}

$ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
if ($ext === "jpeg") {
    $ext = "jpg";
}

$tmp = (string) $file["tmp_name"];
if (!is_uploaded_file($tmp)) {
    fail(400, "Envoi refusé.");
}
$plain = file_get_contents($tmp);
if (!is_string($plain)) {
    fail(400, "Fichier illisible.");
}

$key = random_bytes(32);
$iv = random_bytes(12);
$tag = "";
$cipher = openssl_encrypt($plain, "aes-256-gcm", $key, OPENSSL_RAW_DATA, $iv, $tag);
if (!is_string($cipher) || strlen($tag) !== 16) {
    fail(500, "Chiffrement impossible.");
}

$directory = __DIR__ . "/upload";
if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
    fail(500, "Dossier upload inaccessible.");
}

$name = bin2hex(random_bytes(16)) . "." . $ext;
if (file_put_contents($directory . "/" . $name, $iv . $tag . $cipher) === false) {
    fail(500, "Enregistrement impossible.");
}

echo json_encode(
    ["path" => "logo.php?f=" . $name . "&k=" . bin2hex($key)],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
