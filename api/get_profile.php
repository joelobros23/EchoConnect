<?php
header('Content-Type: application/json');
require_once 'config.php';

// Check if user ID is provided
if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];

    // Prepare the SQL query
    $sql = "SELECT id, username, email, first_name, last_name, profile_picture, bio FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        // Bind the parameter
        $stmt->bind_param("i", $user_id);

        // Execute the query
        if ($stmt->execute()) {
            // Get the result
            $result = $stmt->get_result();

            // Check if a user was found
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();

                // Return the user data as JSON
                echo json_encode($user);
            } else {
                // User not found
                echo json_encode(['error' => 'User not found']);
            }
        } else {
            // Error executing the query
            echo json_encode(['error' => 'Error executing query: ' . $stmt->error]);
        }

        // Close the statement
        $stmt->close();
    } else {
        // Error preparing the statement
        echo json_encode(['error' => 'Error preparing statement: ' . $conn->error]);
    }
} else {
    // User ID not provided
    echo json_encode(['error' => 'User ID not provided']);
}

// Close the connection
$conn->close();
?>