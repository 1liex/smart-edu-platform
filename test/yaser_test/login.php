<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['email'] = $_POST['email']; // نخزن الإيميل في الجلسة
    header("Location: get_data.php");
    exit;
}
?>

<form method="POST">
  <input type="email" name="email" placeholder="Email" required />
  <button type="submit">تسجيل الدخول</button>
</form>