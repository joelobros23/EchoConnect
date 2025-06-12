<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "echoconnect";

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Connected successfully"; // Remove or comment out in production
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    die(); // Terminate script execution if connection fails
}

// Function to sanitize user input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>