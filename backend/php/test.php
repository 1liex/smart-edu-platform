<?php
$url = "http://127.0.0.1:5000/API/resources";
// $token = 'kTXwfT8J01AM#O3';
$data = [
    "token" => "kTXwfT8J01AM#O3",
    "keyword" => "python",
    "id" => 1
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    die("خطأ في الاتصال");
}

echo $result;
?>
