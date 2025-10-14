<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('this methode is not allowed');
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$name || !$email || !$password) {
    die('All the failed is require, pless fail it');
}

$hashed = password_hash($password, PASSWORD_DEFAULT);
// $token = bin2hex(random_bytes(16));

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    die('The email has been used before');
}
$stmt->close();

$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param('sss', $name, $email, $hashed);
if ($stmt->execute()) {
    // $verify_link = "http://localhost/SMART-EDU-PLATFORM/backend/php/verify.php?token=$token";
    // echo "تم إنشاء الحساب بنجاح.<br>رابط التفعيل التجريبي (انسخ والصق في المتصفح):<br><a href=\"$verify_link\">$verify_link</a>";
    echo "The new account has been sign";
    header("location: ../../frontend/html_pages/login.html");
} else {
    echo 'there was an errore while Sign a new account';
}
$stmt->close();
$conn->close();
?>