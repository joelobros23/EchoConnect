<?php
header('Content-Type: application/json');

require_once 'config.php';

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$offset = ($page - 1) * $limit;

$sort = isset($_GET['sort']) ? $_GET['sort'] : 'created_at';
$order = isset($_GET['order']) ? $_GET['order'] : 'DESC';

$allowedSortColumns = ['created_at'];
if (!in_array($sort, $allowedSortColumns)) {
    $sort = 'created_at';
}

$allowedOrderDirections = ['ASC', 'DESC'];
if (!in_array(strtoupper($order), $allowedOrderDirections)) {
    $order = 'DESC';
}

$sql = "SELECT posts.*, users.username, users.profile_picture 
        FROM posts 
        INNER JOIN users ON posts.user_id = users.id 
        ORDER BY $sort $order 
        LIMIT $limit OFFSET $offset";

$result = $conn->query($sql);

if ($result) {
    $posts = array();
    while ($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }

    // Get total number of posts for pagination
    $totalPostsSql = "SELECT COUNT(*) AS total FROM posts";
    $totalPostsResult = $conn->query($totalPostsSql);
    $totalPosts = $totalPostsResult->fetch_assoc()['total'];
    $totalPages = ceil($totalPosts / $limit);

    $response = array(
        'status' => 'success',
        'posts' => $posts,
        'pagination' => array(
            'totalItems' => $totalPosts,
            'totalPages' => $totalPages,
            'currentPage' => $page,
            'itemsPerPage' => $limit
        )
    );
    echo json_encode($response);
} else {
    $response = array('status' => 'error', 'message' => 'Failed to retrieve posts: ' . $conn->error);
    echo json_encode($response);
}

$conn->close();
?>