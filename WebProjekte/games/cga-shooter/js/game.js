// Globaler App-ID und Firebase Konfiguration
// Diese Variablen sind für die Firestore-Nutzung vorgesehen, werden hier aber nicht verwendet.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        
// Holen Sie sich den Canvas und den 2D-Rendering-Kontext
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const startButton = document.getElementById('start-button');
        
// Modal-Elemente
const controlsButton = document.getElementById('controls-button');
const controlsModal = document.getElementById('controls-modal');
const closeModalButton = document.getElementById('close-modal-button');


// Allgemeine Spielvariablen
let gameActive = false;
let isPaused = false; // NEU: Pausen-Zustand
let score = 0;
let keys = {};
let lastTime = 0;
const fps = 60;
const frameDuration = 1000 / fps;
        
// CGA Colors
const PLAYER_COLOR = '#55FFFF'; // Cyan
const BULLET_COLOR = '#FF55FF'; // Magenta
const ENEMY_COLOR = '#FFFF55'; // Yellow

// Spieler-Objekt
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 5,
    color: PLAYER_COLOR,
    draw() {
        ctx.fillStyle = this.color;
        // Zeichne das Schiff als einfaches Dreieck (Spieler)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2); // Spitze
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2); // Linker Flügel
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2); // Rechter Flügel
        ctx.closePath();
        ctx.fill();

        // Keine Schatten oder Leuchteffekte im CGA-Modus
    },
    move() {
        // Bewegung nach links: Pfeil links ODER A
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.speed;
        }
        // Bewegung nach rechts: Pfeil rechts ODER D
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.speed;
        }

        // Begrenzung innerhalb des Canvas
        if (this.x < this.width / 2) this.x = this.width / 2;
        if (this.x > canvas.width - this.width / 2) this.x = canvas.width - this.width / 2;
    }
};

// Kugel-Klasse
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.speed = 7;
        this.color = BULLET_COLOR;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 1, this.y - 5, 2, 10); // Längliche Kugel
        // Keine Schatten oder Leuchteffekte im CGA-Modus
    }

    update() {
        this.y -= this.speed;
    }
}

let bullets = [];
let canShoot = true;
const shootDelay = 200; // Schussverzögerung in ms

// Feind-Klasse
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1 + Math.random() * 1.5;
        this.type = type;
        this.color = ENEMY_COLOR;
    }

    draw() {
        ctx.fillStyle = this.color;
        // Zeichne den Feind als Quadrat
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // Kontrast-Detail im Zentrum (CGA-Style)
        ctx.strokeStyle = PLAYER_COLOR; // Cyan-Kontrast
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 5, this.y - 5, 10, 10);
    }

    update() {
        this.y += this.speed;
    }
}

let enemies = [];
let enemySpawnInterval = 1500;
let lastSpawnTime = 0;

// Explosions-Klasse (einfache Partikel mit CGA-Farben)
class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.radius = Math.random() * 2 + 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1; // Alpha ist anti-CGA, setzen wir auf 1, aber lassen Partikel sterben
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2); // Quadratische Partikel
        ctx.restore();
    }

    update() {
        this.velocity.y *= 0.99;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.05; // Schnelles Sterben
    }
}

let particles = [];

// Funktion zum Starten einer Explosion
function createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, color, {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6)
        }));
    }
}

// NEU: Funktion zum Pausieren/Fortsetzen des Spiels
function togglePause() {
    if (!gameActive) return;

    isPaused = !isPaused;

    if (isPaused) {
        // Spiel pausiert: Zeige Overlay
        gameOverlay.style.display = 'flex';
        overlayTitle.textContent = 'SPIEL PAUSIERT';
        overlayText.innerHTML = 'Drücke [P], um fortzufahren.';
        startButton.style.display = 'none'; // Verstecke den Start-Button im Pausenmodus
    } else {
        // Spiel wird fortgesetzt: Blende Overlay aus
        gameOverlay.style.display = 'none';
        // Setze lastTime neu, um einen großen Sprung in deltaTime nach der Pause zu vermeiden
        lastTime = performance.now();
        // Starte den Loop neu, falls er nach der Pause gestoppt wurde (sicherheitshalber)
        requestAnimationFrame(gameLoop);
    }
}


// Game Loop / Hauptspiel-Logik
function gameLoop(currentTime) {
    if (!gameActive) return;
    if (isPaused) { // NEU: Wenn pausiert, keine Logik ausführen
        requestAnimationFrame(gameLoop);
        return; 
    }

    // Framerate-Kontrolle
    const deltaTime = currentTime - lastTime;
    if (deltaTime < frameDuration) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastTime = currentTime - (deltaTime % frameDuration);

    // 1. Hintergrund löschen (CGA-Schwarz)
    ctx.fillStyle = '#01010A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Spieler aktualisieren und zeichnen
    player.move();
    player.draw();

    // 3. Kugeln aktualisieren und zeichnen
    bullets.forEach((bullet, bIndex) => {
        bullet.update();
        bullet.draw();

        // Entferne Kugeln, die den Bildschirm verlassen
        if (bullet.y < 0) {
            setTimeout(() => {
                bullets.splice(bIndex, 1);
            }, 0);
        }
    });

    // 4. Feinde spawnen
    if (currentTime - lastSpawnTime > enemySpawnInterval) {
        const x = Math.random() * (canvas.width - 60) + 30;
        enemies.push(new Enemy(x, -30, 1));
        lastSpawnTime = currentTime;

        // Mache das Spiel mit der Zeit schwerer
        if (enemySpawnInterval > 500) {
            enemySpawnInterval -= 20;
        }
    }

    // 5. Feinde aktualisieren und zeichnen
    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        enemy.draw();

        // Kollision: Feind trifft Spieler
        if (
            enemy.y + enemy.height / 2 > player.y - player.height / 2 &&
            enemy.y - enemy.height / 2 < player.y + player.height / 2 &&
            enemy.x + enemy.width / 2 > player.x - player.width / 2 &&
            enemy.x - enemy.width / 2 < player.x + player.width / 2
        ) {
                createExplosion(player.x, player.y, PLAYER_COLOR);
            createExplosion(enemy.x, enemy.y, ENEMY_COLOR);
            endGame();
        }

        // Entferne Feinde, die den Bildschirm verlassen
        if (enemy.y > canvas.height) {
            setTimeout(() => {
                enemies.splice(eIndex, 1);
            }, 0);
        }

                // 6. Kollision: Kugel trifft Feind
        bullets.forEach((bullet, bIndex) => {
            const distanceX = bullet.x - enemy.x;
            const distanceY = bullet.y - enemy.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < enemy.width / 2 + bullet.radius) {
                // Treffer!
                createExplosion(enemy.x, enemy.y, ENEMY_COLOR);

                // Feind und Kugel entfernen
                setTimeout(() => {
                    enemies.splice(eIndex, 1);
                    bullets.splice(bIndex, 1);
                    score += 10;
                    updateScore();
                }, 0);
            }
        });
    });

    // 7. Partikel aktualisieren
    particles.forEach((particle, pIndex) => {
        if (particle.alpha <= 0.1) {
            particles.splice(pIndex, 1);
        } else {
            particle.update();
            particle.draw();
        }
    });


    // Schleife fortsetzen
    requestAnimationFrame(gameLoop);
}

// Funktion zum Aktualisieren der Punkteanzeige
function updateScore() {
    scoreDisplay.textContent = `Punkte: ${score}`;
}

// Funktion zum Schießen
function shoot() {
    if (gameActive && canShoot && !isPaused) { // Schießen nur, wenn aktiv und nicht pausiert
        bullets.push(new Bullet(player.x, player.y - player.height / 2));
        canShoot = false;
        // Setze die Schussverzögerung zurück
        setTimeout(() => {
            canShoot = true;
        }, shootDelay);
    }
}

// Event-Listener für Tastatureingaben
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
            
    // NEU: P-Taste für Pause
    if (e.key === 'p' || e.key === 'P') { 
        e.preventDefault();
        togglePause();
    }

    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Verhindert Scrollen bei Leertaste
        shoot();
    }
    if (e.key === 'Escape') {
        closeModal();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});
        
// --- Modal Logik ---
        
function openModal() {
    controlsModal.style.display = 'flex';
}
        
function closeModal() {
    controlsModal.style.display = 'none';
}
        
controlsButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
        
// Schließe das Modal, wenn außerhalb geklickt wird
controlsModal.addEventListener('click', (e) => {
    if (e.target === controlsModal) {
        closeModal();
    }
});

// Spiel-Zustandsfunktionen
function initializeGame() {
    score = 0;
    updateScore();
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    bullets = [];
    enemies = [];
    particles = [];
    enemySpawnInterval = 1500;
    lastSpawnTime = performance.now();
    gameActive = true;
    isPaused = false; // Wichtig: Beim Start nicht pausiert sein
    gameOverlay.style.display = 'none'; // Overlay ausblenden
}

function startGame() {
    if (!gameActive) {
        initializeGame();
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameActive = false;
    isPaused = false; // Beendet den Pausenmodus
    // Zeige das Game Over Overlay
    overlayTitle.textContent = 'SYSTEM FEHLER: GAME OVER';
    overlayText.innerHTML = `PUNKTEZAHL: ${score}<br>Bitte NEUSTARTEN...`;
    startButton.textContent = 'Neustart INIT';
    startButton.style.display = 'block'; // Zeige den Start-Button wieder
    gameOverlay.style.display = 'flex';
}

// Start-Button-Handler
startButton.addEventListener('click', startGame);

// Initialisierung beim Laden
window.onload = function() {
    // Zeige das Start-Overlay beim ersten Laden
    overlayTitle.textContent = 'CGA SPACE WAR';
    overlayText.innerHTML = 'RETRO-MODUS AKTIVIERT. BITTE STARTEN.';
    startButton.textContent = 'Spiel Starten';
    gameOverlay.style.display = 'flex';
};