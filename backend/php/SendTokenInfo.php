<?php
$env = parse_ini_file(__DIR__ . '/.env');
$token = $env['ACCESS_TOKEN'];

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "userdb";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, keyword FROM keywords";
$result = $conn->query($sql);

$keywords = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $keywords[] = [
            "token" => $token,
            "id" => $row['id'],
            "keyword" => $row['keyword']
        ];
    }
}


$jsonData = json_encode($keywords, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);


$url = "http://127.0.0.1:5000/API/resources";
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
} else {
    echo "Response from API: " . $response;
}

curl_close($ch);

$conn->close();
