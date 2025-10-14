<?php
require 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('this methode is not allowed');
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    die('all failed is required');
}

$stmt = $conn->prepare("SELECT id, password, name FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    die('');
}

if (!password_verify($password, $user['password'])) {
    die('');
}

// if ($user['verified'] != 1) {
//     die('');
// }

$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['name'];

echo 'welcome' . htmlspecialchars($user['name']) . '.';
header("location: ../../frontend/html_pages/content.html")
?>