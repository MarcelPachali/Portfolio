<?php
// saveColors.php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $bgColor = $input['bgColor'] ?? '';
    $textColor = $input['textColor'] ?? '';
    $accentColor = $input['accentColor'] ?? '';

    // Validierung
    $hexPattern = '/^#[0-9A-Fa-f]{6}$/';
    if (!preg_match($hexPattern, $bgColor) || !preg_match($hexPattern, $textColor) || !preg_match($hexPattern, $accentColor)) {
        echo json_encode(['status' => 'error', 'message' => 'Ungültige Farbwerte.']);
        exit;
    }

    // Farben in JSON-Datei speichern
    $colors = [
        'bgColor' => $bgColor,
        'textColor' => $textColor,
        'accentColor' => $accentColor,
    ];

    file_put_contents('color-setting.json', json_encode($colors, JSON_PRETTY_PRINT));

    echo json_encode(['status' => 'success']);
}
?>