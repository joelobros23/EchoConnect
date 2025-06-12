<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

require_once 'config.php';

$user_id = $_SESSION['user_id'];
$content = $_POST['content'] ?? '';

if (empty($content) && empty($_FILES['image']['name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Post content cannot be empty if no image is uploaded.']);
    exit;
}

$image_url = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['image'];
    $filename = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    $fileType = $file['type'];

    $fileExt = explode('.', $filename);
    $fileActualExt = strtolower(end($fileExt));

    $allowed = ['jpg', 'jpeg', 'png'];

    if (in_array($fileActualExt, $allowed)) {
        if ($fileError === 0) {
            if ($fileSize < 10000000) {
                $fileNameNew = uniqid('', true) . "." . $fileActualExt;
                $fileDestination = '../assets/images/' . $fileNameNew;
                if (move_uploaded_file($fileTmpName, $fileDestination)) {
                    $image_url = 'assets/images/' . $fileNameNew;
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Error uploading image.']);
                    exit;
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Your file is too big!']);
                exit;
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'There was an error uploading your file!']);
            exit;
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'You cannot upload files of this type!']);
        exit;
    }
}

try {
    $pdo = connectDB();
    $stmt = $pdo->prepare("INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $content, $image_url]);

    echo json_encode(['status' => 'success', 'message' => 'Post created successfully']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>