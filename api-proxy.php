<?php
require_once 'secure/config.php'; // Adjust path as needed

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = $input['prompt'] ?? '';

    if (empty($prompt)) {
        http_response_code(400);
        echo json_encode(['error' => 'No prompt provided']);
        exit;
    }

    $response = callHuggingFace($prompt, HUGGING_FACE_API_KEY);
    echo $response;
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

function callHuggingFace($prompt, $apiKey) {
    // ... same as previous implementation
}
?>
