<?php
session_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if (empty($username) || empty($password)) {
        $response = ['status' => 'error', 'message' => 'Please enter both username and password.'];
        echo json_encode($response);
        exit;
    }

    try {
        $pdo = connectDB();
        $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Password is correct, so start a new session
            session_regenerate_id();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            $response = ['status' => 'success', 'message' => 'Login successful.'];
            echo json_encode($response);
            exit;
        } else {
            $response = ['status' => 'error', 'message' => 'Incorrect username or password.'];
            echo json_encode($response);
            exit;
        }
    } catch (PDOException $e) {
        $response = ['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()];
        echo json_encode($response);
        exit;
    }
} else {
    $response = ['status' => 'error', 'message' => 'Invalid request method.'];
    echo json_encode($response);
    exit;
}
?>