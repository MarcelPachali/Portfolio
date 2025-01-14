<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Web Design</title>
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #000000;
            --accent-color: #007BFF;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }

        a, button {
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid var(--accent-color);
            padding: 10px 20px;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        a:hover, button:hover {
            background-color: var(--accent-color);
            color: var(--bg-color);
        }

        .form-group {
            display: block;
            width: 40%;
            margin: auto;
            /*margin-bottom: 15px;*/
        }

        label {
            display: block;
            margin-bottom: 5px;
        }

        input {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border-radius: 5px;
        }

        h1 {
            text-align: center;
        }
        button {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <h1>Web Design Customizer</h1>
    <form id="colorForm">
        <div class="form-group">
            <label for="bgColor">Hintergrundfarbe (#Hex)</label>
            <input type="text" id="bgColor" placeholder="#ffffff" required>
        </div>
        <div class="form-group">
            <label for="textColor">Schriftfarbe (#Hex)</label>
            <input type="text" id="textColor" placeholder="#000000" required>
        </div>
        <div class="form-group">
            <label for="accentColor">Akzentfarbe (#Hex)</label>
            <input type="text" id="accentColor" placeholder="#007BFF" required>
            <br><br>
            <button type="submit">Anwenden</button>
        </div>
        
    </form>

    <script>
        // Farben beim Laden der Seite aus JSON laden
        window.addEventListener('DOMContentLoaded', () => {
            fetch('loadColors.php')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const colors = data.colors;
                        document.getElementById('bgColor').value = colors.bgColor;
                        document.getElementById('textColor').value = colors.textColor;
                        document.getElementById('accentColor').value = colors.accentColor;

                        // Farben anwenden
                        document.documentElement.style.setProperty('--bg-color', colors.bgColor);
                        document.documentElement.style.setProperty('--text-color', colors.textColor);
                        document.documentElement.style.setProperty('--accent-color', colors.accentColor);
                    }
                });
        });

        document.getElementById('colorForm').addEventListener('submit', function(event) {
            event.preventDefault();

            // Farben aus den Eingabefeldern abrufen
            const bgColor = document.getElementById('bgColor').value;
            const textColor = document.getElementById('textColor').value;
            const accentColor = document.getElementById('accentColor').value;

            // Farbvalidierung
            const hexPattern = /^#[0-9A-Fa-f]{6}$/;
            if (!hexPattern.test(bgColor) || !hexPattern.test(textColor) || !hexPattern.test(accentColor)) {
                alert('Bitte geben Sie gültige Hex-Farbwerte ein.');
                return;
            }

            // Farben dynamisch anwenden
            document.documentElement.style.setProperty('--bg-color', bgColor);
            document.documentElement.style.setProperty('--text-color', textColor);
            document.documentElement.style.setProperty('--accent-color', accentColor);

            // Farben in die JSON-Datei speichern
            fetch('saveColors.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bgColor, textColor, accentColor }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Farben erfolgreich gespeichert!');
                } else {
                    alert('Fehler beim Speichern der Farben.');
                }
            });
        });
    </script>
</body>
</html>