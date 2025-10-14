<?php
// config.php - database connection
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'userdb';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("the connect to database has failed" . $conn->connect_error);
}
?>