<?php
session_start();

// Destroy the session
session_destroy();

// Set a success response
$response = array("success" => true, "message" => "Logged out successfully.");

// Convert the response to JSON
header('Content-Type: application/json');
echo json_encode($response);

exit();
?>