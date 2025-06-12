<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($data->post_id) && isset($data->user_id) && isset($data->content)) {
        $post_id = mysqli_real_escape_string($conn, $data->post_id);
        $user_id = mysqli_real_escape_string($conn, $data->user_id);
        $content = mysqli_real_escape_string($conn, $data->content);

        $sql = "INSERT INTO comments (post_id, user_id, content) VALUES ('$post_id', '$user_id', '$content')";

        if (mysqli_query($conn, $sql)) {
            $response = array('status' => 1, 'message' => 'Comment created successfully');
        } else {
            $response = array('status' => 0, 'message' => 'Failed to create comment: ' . mysqli_error($conn));
        }
    } else {
        $response = array('status' => 0, 'message' => 'Missing required fields (post_id, user_id, content)');
    }
} else {
    $response = array('status' => 0, 'message' => 'Invalid Request Method');
}

echo json_encode($response);

mysqli_close($conn);
?>