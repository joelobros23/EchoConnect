<?php
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postId = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

    if ($postId <= 0 || $userId <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid post or user ID.']);
        exit;
    }

    try {
        $pdo = connectDB();

        // Check if the like already exists
        $stmt = $pdo->prepare("SELECT * FROM likes WHERE user_id = :user_id AND post_id = :post_id");
        $stmt->execute(['user_id' => $userId, 'post_id' => $postId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'You have already liked this post.']);
            exit;
        }

        // Insert the like into the database
        $stmt = $pdo->prepare("INSERT INTO likes (user_id, post_id) VALUES (:user_id, :post_id)");
        $stmt->execute(['user_id' => $userId, 'post_id' => $postId]);

        echo json_encode(['status' => 'success', 'message' => 'Post liked successfully.']);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>