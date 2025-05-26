<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../includes/db_connection.php';

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Username and password are required.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, username, password_hash, name FROM judges WHERE username = :username");
    $stmt->execute([':username' => $username]);
    $judge = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($judge && password_verify($password, $judge['password_hash'])) {
        unset($judge['password_hash']);
        echo json_encode(['status' => 'success', 'message' => 'Login successful', 'judge' => $judge]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>