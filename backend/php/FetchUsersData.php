<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "userdb";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$teachers = [];
$teacherSql = "
    SELECT 
        u.id AS teacher_id, u.name AS teacher_name, u.email AS teacher_email, u.role AS teacher_role,
        f.id AS file_id, f.file_name,
        k.id AS keyword_id, k.keyword,
        r.id AS resource_id, r.title AS resource_title, r.link AS resource_link
    FROM users u
    LEFT JOIN files f ON u.id = f.teacher_id
    LEFT JOIN keywords k ON f.id = k.file_id
    LEFT JOIN resources r ON k.id = r.keyword_id
    WHERE u.role = 'teacher'
    ORDER BY u.id, f.id, k.id, r.id
";

$result = $conn->query($teacherSql);

if ($result->num_rows > 0) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $tid = $row['teacher_id'];

        if (!isset($data[$tid])) {
            $data[$tid] = [
                "id" => $row['teacher_id'],
                "name" => $row['teacher_name'],
                "email" => $row['teacher_email'],
                "role" => $row['teacher_role'],
                "files" => [],
                "keywords" => [],
                "resources" => []
            ];
        }

        if ($row['file_id'] && !in_array(["id" => $row['file_id'], "file_name" => $row['file_name']], $data[$tid]['files'])) {
            $data[$tid]['files'][] = ["id" => $row['file_id'], "file_name" => $row['file_name']];
        }

        if ($row['keyword'] && !in_array($row['keyword'], $data[$tid]['keywords'])) {
            $data[$tid]['keywords'][] = $row['keyword'];
        }

        if ($row['resource_id']) {
            $resource = ["title" => $row['resource_title'], "link" => $row['resource_link']];
            if (!in_array($resource, $data[$tid]['resources'])) {
                $data[$tid]['resources'][] = $resource;
            }
        }
    }

    $teachers = array_values($data);
}

$students = [];
$studentSql = "SELECT id, name, email FROM users WHERE role='student'";
$studentResult = $conn->query($studentSql);

if ($studentResult->num_rows > 0) {
    while ($row = $studentResult->fetch_assoc()) {
        $students[] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "email" => $row['email'],
            "role" => "student"
        ];
    }
}

$output = array_merge($teachers, $students);


echo json_encode($output, JSON_PRETTY_PRINT);

$conn->close();
?>
