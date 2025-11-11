<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// ✅ 1. الاتصال بقاعدة البيانات
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "userdb";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

// ✅ 2. استبدال الجلسة: جلب بيانات البريد والباسورد من JSON
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? null;
$passInput = $input['password'] ?? null;

if (!$email || !$passInput) {
    echo json_encode(["error" => "Email or password missing"]);
    exit;
}

// ✅ 3. الحصول على بيانات المستخدم الحالي
$userQuery = $conn->prepare("SELECT id, name, email, role, password FROM users WHERE email = ?");
$userQuery->bind_param("s", $email);
$userQuery->execute();
$userResult = $userQuery->get_result();

if ($userResult->num_rows == 0) {
    echo json_encode(["error" => "User not found"]);
    exit;
}

$userData = $userResult->fetch_assoc();

// ✅ 4. التحقق من كلمة المرور
if (!password_verify($passInput, $userData['password'])) {
    echo json_encode(["error" => "Invalid password"]);
    exit;
}


// ✅ 5. جلب جميع المعلمين وملفاتهم والكلمات والمصادر
$teachers = [];

// ... الكود اللي عندك بالضبط من هنا فصاعدًا بدون أي تغيير

$teacherQuery = "
    SELECT 
        u.id AS teacher_id, u.name AS teacher_name, u.email AS teacher_email,
        f.id AS file_id, f.file_name, f.file_path,
        k.id AS keyword_id, k.keyword,
        r.id AS resource_id, r.title, r.link, r.resource_type
    FROM users u
    LEFT JOIN files f ON f.teacher_id = u.id
    LEFT JOIN keywords k ON k.file_id = f.id
    LEFT JOIN resources r ON r.keyword_id = k.id
    WHERE u.role = 'teacher'
    ORDER BY u.id, f.id, k.id
";

$result = $conn->query($teacherQuery);

$teacherMap = [];

while ($row = $result->fetch_assoc()) {
    $t_id = $row['teacher_id'];

    if (!isset($teacherMap[$t_id])) {
        $teacherMap[$t_id] = [
            "id" => (int)$row['teacher_id'],
            "name" => $row['teacher_name'],
            "email" => $row['teacher_email'],
            "files" => []
        ];
    }

    if ($row['file_id']) {
        $fileIndex = null;
        foreach ($teacherMap[$t_id]["files"] as $idx => $file) {
            if ($file["file_id"] == $row["file_id"]) {
                $fileIndex = $idx;
                break;
            }
        }

        if ($fileIndex === null) {
            $teacherMap[$t_id]["files"][] = [
                  "file_id"    => (int)$row["file_id"],
                  "file_name"  => $row["file_name"],
                  "file_path"  => $row["file_path"],
                  "teacher_id" => (int)$row["teacher_id"],
                  "keywords"   => []
            ];
            $fileIndex = array_key_last($teacherMap[$t_id]["files"]);
        }

        if ($row['keyword_id']) {
            $keywordIndex = null;
            foreach ($teacherMap[$t_id]["files"][$fileIndex]["keywords"] as $idx => $kw) {
                if ($kw["keyword_id"] == $row["keyword_id"]) {
                    $keywordIndex = $idx;
                    break;
                }
            }

            if ($keywordIndex === null) {
                $teacherMap[$t_id]["files"][$fileIndex]["keywords"][] = [
                    "keyword_id" => (int)$row["keyword_id"],
                    "keyword" => $row["keyword"],
                    "resources" => [
                        "videos" => [],
                        "documents" => []
                    ]
                ];
                $keywordIndex = array_key_last($teacherMap[$t_id]["files"][$fileIndex]["keywords"]);
            }

            if ($row['resource_id']) {
                if ($row['resource_type'] === 'video') {
                    $teacherMap[$t_id]["files"][$fileIndex]["keywords"][$keywordIndex]["resources"]["videos"][] = [
                        "title" => $row["title"],
                        "link" => $row["link"]
                    ];
                } else {
                    $teacherMap[$t_id]["files"][$fileIndex]["keywords"][$keywordIndex]["resources"]["documents"][] = [
                        "title" => $row["title"],
                        "link" => $row["link"]
                    ];
                }
            }
        }
    }
}

$teachers = array_values($teacherMap);

// ✅ 6. لو المستخدم معلم، نجيب الملفات الخاصة فيه
$myFiles = [];
if ($userData['role'] === 'teacher') {
    $myFilesQuery = $conn->prepare("
        SELECT 
    f.id AS file_id,
    f.file_name,
    f.file_path,
    f.file_type,
    f.teacher_id,
    k.id AS keyword_id,
    k.keyword,
    r.id AS resource_id,
    r.title,
    r.link,
    r.resource_type
FROM files f
LEFT JOIN keywords k ON k.file_id = f.id
LEFT JOIN resources r ON r.keyword_id = k.id
WHERE f.teacher_id = ?
ORDER BY f.id, k.id

    ");
    $myFilesQuery->bind_param("i", $userData['id']);
    $myFilesQuery->execute();
    $myFilesResult = $myFilesQuery->get_result();

    $fileMap = [];

    while ($row = $myFilesResult->fetch_assoc()) {
        $f_id = $row['file_id'];

        if (!isset($fileMap[$f_id])) {
            $fileMap[$f_id] = [
                "file_id"    => (int)$row["file_id"],
                "file_name"  => $row["file_name"],
                "file_path"  => $row["file_path"],
                "file_type"  => $row["file_type"],
                "teacher_id" => (int)$userData["id"],
                "keywords"   => []
            ];
        }

        if ($row['keyword_id']) {
            $kwIndex = null;
            foreach ($fileMap[$f_id]["keywords"] as $idx => $kw) {
                if ($kw["keyword_id"] == $row["keyword_id"]) {
                    $kwIndex = $idx;
                    break;
                }
            }

            if ($kwIndex === null) {
                $fileMap[$f_id]["keywords"][] = [
                    "keyword_id" => (int)$row["keyword_id"],
                    "keyword" => $row["keyword"],
                    "resources" => [
                        "videos" => [],
                        "documents" => []
                    ]
                ];
                $kwIndex = array_key_last($fileMap[$f_id]["keywords"]);
            }

            if ($row['resource_id']) {
                if ($row['resource_type'] === 'video') {
                    $fileMap[$f_id]["keywords"][$kwIndex]["resources"]["videos"][] = [
                        "title" => $row["title"],
                        "link" => $row["link"]
                    ];
                } else {
                    $fileMap[$f_id]["keywords"][$kwIndex]["resources"]["documents"][] = [
                        "title" => $row["title"],
                        "link" => $row["link"]
                    ];
                }
            }
        }
    }

    $myFiles = array_values($fileMap);
}

// ✅ 7. بناء الاستجابة النهائية

$response = [
    "user" => $userData,
    "teachers" => $teachers,
];

if ($userData['role'] === 'teacher') {
    $response["my_files"] = $myFiles;
}

// ✅ 8. إرجاع JSON
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conn->close();
?>
