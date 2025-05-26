<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../includes/db_connection.php';

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
$name = trim($input['name'] ?? '');

if (empty($username) || empty($password) || empty($name)) {
    echo json_encode(['status' => 'error', 'message' => 'Username, password, and name are required.']);
    exit();
}

if (strlen($username) < 3 || strlen($username) > 50) {
    echo json_encode(['status' => 'error', 'message' => 'Username must be between 3 and 50 characters.']);
    exit();
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("SELECT id FROM judges WHERE username = :username");
    $stmt->execute([':username' => $username]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Username already exists. Please choose a different one.']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO judges (username, password_hash, name) VALUES (:username, :password_hash, :name)");
    $stmt->execute([
        ':username' => $username,
        ':password_hash' => $password_hash,
        ':name' => $name
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Judge added successfully.', 'id' => $pdo->lastInsertId()]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>