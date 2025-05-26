<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../includes/db_connection.php';

$judge_id = $_GET['judge_id'] ?? null;

try {
    if ($judge_id !== null && is_numeric($judge_id)) {
        $stmt = $pdo->prepare("
            SELECT
                s.participant_id,
                s.score_value,
                s.comment,
                p.name AS participant_name
            FROM
                scores s
            JOIN
                participants p ON s.participant_id = p.id
            WHERE
                s.judge_id = :judge_id
            ORDER BY
                p.name ASC
        ");
        $stmt->execute([':judge_id' => $judge_id]);
        $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'scores' => $scores]);

    } else {
        $stmt = $pdo->query("
            SELECT
                p.id AS participant_id,
                p.name AS participant_name,
                COALESCE(SUM(s.score_value), 0) AS total_score,
                COUNT(s.id) AS num_judges_scored
            FROM
                participants p
            LEFT JOIN
                scores s ON p.id = s.participant_id
            GROUP BY
                p.id, p.name
            ORDER BY
                total_score DESC, p.name ASC;
        ");
        $overall_scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'overall_scoreboard' => $overall_scores]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>