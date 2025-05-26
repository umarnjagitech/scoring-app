<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../includes/db_connection.php';

$input = json_decode(file_get_contents('php://input'), true);

$judge_id = $input['judge_id'] ?? null;
$participant_id = $input['participant_id'] ?? null;
$score_value = $input['score_value'] ?? null;
$comment = $input['comment'] ?? null;

if (!is_numeric($judge_id) || !is_numeric($participant_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input: judge_id and participant_id are required and must be numeric.']);
    exit();
}

$judge_id = (int)$judge_id;
$participant_id = (int)$participant_id;

if (!is_null($score_value) && $score_value !== '') {
    $score_value = filter_var($score_value, FILTER_VALIDATE_INT, array("options" => array("min_range"=>0, "max_range"=>100)));
    if ($score_value === false || $score_value === null) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid score value. Must be an integer between 0 and 100.']);
        exit();
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Score value is required.']);
    exit();
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT id FROM scores WHERE judge_id = :judge_id AND participant_id = :participant_id");
    $stmt->execute([':judge_id' => $judge_id, ':participant_id' => $participant_id]);
    $existing_score_id = $stmt->fetchColumn();

    if ($existing_score_id) {
        $stmt = $pdo->prepare("UPDATE scores SET score_value = :score_value, comment = :comment WHERE id = :id");
        $stmt->execute([
            ':score_value' => $score_value,
            ':comment' => $comment,
            ':id' => $existing_score_id
        ]);
        $message = 'Score updated successfully.';
    } else {
        $stmt = $pdo->prepare("INSERT INTO scores (judge_id, participant_id, score_value, comment) VALUES (:judge_id, :participant_id, :score_value, :comment)");
        $stmt->execute([
            ':judge_id' => $judge_id,
            ':participant_id' => $participant_id,
            ':score_value' => $score_value,
            ':comment' => $comment
        ]);
        $message = 'Score submitted successfully.';
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => $message]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>