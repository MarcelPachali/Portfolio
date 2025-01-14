<?php
// loadColors.php
if (file_exists('color-setting.json')) {
    $colors = json_decode(file_get_contents('color-setting.json'), true);
    echo json_encode(['status' => 'success', 'colors' => $colors]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Keine Farbwerte gefunden.']);
}
?>
