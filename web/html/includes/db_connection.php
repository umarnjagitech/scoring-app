<?php
// Database connection for localhost
$dbHost = 'localhost'; // MariaDB/MySQL is on the same machine
$dbName = 'scoring_app_db';
$dbUser = 'app_user';
$dbPass = 'mysql_app_user'; // <--- IMPORTANT: MATCH THE PASSWORD YOU SET IN SQL!

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "DB Connection Successful!"; // Uncomment for testing connection
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit();
}
?>