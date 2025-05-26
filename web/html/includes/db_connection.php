<?php
// web/html/includes/db_connection.php

// Railway automatically injects connection variables for linked databases
// For MySQL, these are typically MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
$dbHost = getenv('MYSQL_HOST');
$dbPort = getenv('MYSQL_PORT');
$dbUser = getenv('MYSQL_USER');
$dbPass = getenv('MYSQL_PASSWORD');
$dbName = getenv('MYSQL_DATABASE');

if (!$dbHost || !$dbName || !$dbUser || !$dbPass) {
    // Fallback for local development or if env vars are missing
    $dbHost = 'db'; // For Docker Compose local dev
    $dbPort = '3306';
    $dbUser = getenv('MYSQL_USER') ?: 'app_user';
    $dbPass = getenv('MYSQL_PASSWORD') ?: 'your_app_user_password';
    $dbName = getenv('MYSQL_DATABASE') ?: 'scoring_app_db';
}

try {
    $pdo = new PDO("mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage()); // Logs to Railway logs
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal server error. Database connection failed.']);
    exit();
}

/*
// Database connection for localhost
$dbHost = 'db'; // MariaDB/MySQL is on the same machine
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
*/
?>