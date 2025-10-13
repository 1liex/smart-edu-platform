<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *"); // السماح لأي دومين يرسل طلب
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // تحديد نوع الطلبات المسموحة
header("Access-Control-Allow-Headers: Content-Type, Authorization");

error_reporting(E_ALL);
ini_set('display_errors', 0); // نخفف الأخطاء للمستخدم
session_start();

$conn = new mysqli("localhost", "root", "", "userdb");
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

// استلام البيانات من الواجهة الأمامية
$input = json_decode(file_get_contents("php://input"), true);
$email = $input['email'] ?? null;
$password = $input['password'] ?? null;

if (!$email || !$password) {
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

// جلب بيانات المستخدم
$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

$user = $result->fetch_assoc();

// التحقق من الباسورد
if ($passInput !== $userData['password']) {
    echo json_encode(["error" => "Invalid password"]);
    exit;
}

// ✅ تخزين البيانات في الجلسة
$_SESSION['email'] = $user['email'];
$_SESSION['password'] = $password;
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];

// إرجاع البيانات الأساسية للمستخدم
echo json_encode([
    "status" => "logged_in",
    "user" => [
        "id" => $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role']
    ]
]);

$conn->close();
?>
