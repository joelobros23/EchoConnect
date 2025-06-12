<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$user_id_1 = $_SESSION['user_id'];
$user_id_2 = isset($_POST['user_id_2']) ? intval($_POST['user_id_2']) : 0;

if ($user_id_2 <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid user ID']);
    exit;
}

if ($user_id_1 == $user_id_2) {
    echo json_encode(['status' => 'error', 'message' => 'Cannot add yourself as a friend']);
    exit;
}

try {
    $pdo = connectDB();

    // Check if friendship already exists
    $stmt = $pdo->prepare("SELECT status FROM friendships WHERE (user_id_1 = :user_id_1 AND user_id_2 = :user_id_2) OR (user_id_1 = :user_id_2 AND user_id_2 = :user_id_1)");
    $stmt->execute(['user_id_1' => $user_id_1, 'user_id_2' => $user_id_2]);
    $existingFriendship = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingFriendship) {
        if ($existingFriendship['status'] == 'pending') {
            echo json_encode(['status' => 'error', 'message' => 'Friend request already sent']);
        } elseif ($existingFriendship['status'] == 'accepted') {
            echo json_encode(['status' => 'error', 'message' => 'Already friends']);
        } else {
             echo json_encode(['status' => 'error', 'message' => 'Friend request was rejected']);
        }
        exit;
    }

    // Add friend request
    $stmt = $pdo->prepare("INSERT INTO friendships (user_id_1, user_id_2, status) VALUES (:user_id_1, :user_id_2, 'pending')");
    $stmt->execute(['user_id_1' => $user_id_1, 'user_id_2' => $user_id_2]);

    echo json_encode(['status' => 'success', 'message' => 'Friend request sent']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>