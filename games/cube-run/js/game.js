// Canvas-Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Würfel-Objekt (Spieler)
const cube = {
  x: canvasWidth / 2 - 15,
  y: canvasHeight - 60, // Startposition im Weltkoordinatensystem
  width: 30,
  height: 30,
  dx: 0,
  dy: -5,
  speed: 4,
  gravity: 0.5,
  jumpStrength: -10,
  jumpCount: 0,      // Erlaubt bis zu 2 Sprünge (Doppelsprung)
  attached: false    // Für Wand-Heften
};

// Boden-Parameter
const floorHeight = 20;
// floorY repräsentiert den y-Wert des oberen Rands des Bodens (Weltkoordinate)
let floorY = canvasHeight - floorHeight;
// Startboden als Referenzpunkt für den Score
const initialFloor = floorY;

// Plattform-Parameter
const platforms = [];
const platformWidth = 100;
const platformHeight = 10;
const platformSpacing = 80; // vertikaler Abstand zwischen den Plattformen

// Erzeuge initiale Plattformen oberhalb des Bodens
function generateInitialPlatforms() {
  let startY = floorY - platformSpacing;
  for (let i = 0; i < 6; i++) {
    let newX = Math.random() * (canvasWidth - platformWidth);
    platforms.push({
      x: newX,
      y: startY - i * platformSpacing,
      width: platformWidth,
      height: platformHeight
    });
  }
}

// Neue Plattform oberhalb generieren (falls nötig)
function generatePlatformUp() {
  let highest = Math.min(...platforms.map(p => p.y));
  let newY = highest - platformSpacing;
  let newX = Math.random() * (canvasWidth - platformWidth);
  platforms.push({ x: newX, y: newY, width: platformWidth, height: platformHeight });
}

// Neue Plattform unterhalb generieren (falls nötig)
function generatePlatformDown() {
  let lowest = Math.max(...platforms.map(p => p.y));
  let newY = lowest + platformSpacing;
  let newX = Math.random() * (canvasWidth - platformWidth);
  platforms.push({ x: newX, y: newY, width: platformWidth, height: platformHeight });
}

// Initiale Plattformen generieren
generateInitialPlatforms();

// Score-Variable (Wert als Differenz zum Startboden)
let score = 0;

// Steuerung: WASD, Leertaste (Doppelsprung) und Shift (Wand-Heften)
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Update-Funktion
function update() {
  // Wand-Heften: Wenn Shift gedrückt ist und der Würfel nahe am Rand ist,
  // "klebt" er an der Wand (vertikale Bewegung wird gestoppt).
  if (keys["Shift"]) {
    if (cube.x <= 10 || cube.x + cube.width >= canvasWidth - 10) {
      cube.attached = true;
      cube.dy = 0;
    } else {
      cube.attached = false;
    }
  } else {
    cube.attached = false;
  }
  
  // WASD-Steuerung: Links/Rechts
  if (keys["a"] || keys["A"]) {
    cube.dx = -cube.speed;
  } else if (keys["d"] || keys["D"]) {
    cube.dx = cube.speed;
  } else {
    cube.dx = 0;
  }
  
  // Doppelsprung: Leertaste, sofern noch Sprünge verfügbar sind
  if (keys[" "] && cube.jumpCount < 2) {
    cube.dy = cube.jumpStrength;
    cube.jumpCount++;
    keys[" "] = false; // Verhindert Mehrfachauslösung pro Tastendruck
  }
  
  // Gravitation anwenden, sofern nicht an der Wand geheftet
  if (!cube.attached) {
    cube.dy += cube.gravity;
  }
  
  // Position aktualisieren
  cube.x += cube.dx;
  cube.y += cube.dy;
  
  // Begrenzung links/rechts
  if (cube.x < 0) cube.x = 0;
  if (cube.x + cube.width > canvasWidth) cube.x = canvasWidth - cube.width;
  
  // Kollisionsabfrage: Zufällig generierte Plattformen (orange)
  platforms.forEach(plat => {
    if (
      cube.x < plat.x + plat.width &&
      cube.x + cube.width > plat.x &&
      cube.y + cube.height > plat.y &&
      cube.y + cube.height < plat.y + plat.height &&
      cube.dy > 0
    ) {
      cube.dy = cube.jumpStrength;
      cube.jumpCount = 0;
    }
  });
  
  // Kollisionsabfrage: Boden (grün)
  if (cube.y + cube.height > floorY) {
    cube.y = floorY - cube.height;
    cube.dy = 0;
    cube.jumpCount = 0;
  }
  
  // Kamera- und Szenen-Management:
  // Würfel soll stets in der vertikalen Mitte bleiben.
  if (cube.y < canvasHeight / 2) {
    // Spieler steigt auf – Szene verschiebt sich nach unten.
    let diff = canvasHeight / 2 - cube.y;
    cube.y = canvasHeight / 2;
    floorY += diff; // Der Boden wird ebenfalls nach unten verschoben.
    platforms.forEach(p => p.y += diff);
    // Neue Plattformen oberhalb generieren, falls nötig.
    while (Math.min(...platforms.map(p => p.y)) > 0) {
      generatePlatformUp();
    }
  } else if (cube.y > canvasHeight / 2) {
    // Spieler fällt ab – Szene verschiebt sich nach oben.
    let diff = cube.y - canvasHeight / 2;
    cube.y = canvasHeight / 2;
    floorY -= diff; // Der Boden wird nach oben verschoben.
    platforms.forEach(p => p.y -= diff);
    // Neue Plattformen unterhalb generieren, falls nötig.
    while (Math.max(...platforms.map(p => p.y)) < canvasHeight) {
      generatePlatformDown();
    }
  }
  
  // Score als Differenz zwischen aktuellem Boden und Startboden
  score = floorY - initialFloor;
}

// Zeichnen-Funktion
function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Zeichne den Würfel
  ctx.fillStyle = 'blue';
  ctx.fillRect(cube.x, cube.y, cube.width, cube.height);
  
  // Zeichne den Boden (durchgehendes Rechteck)
  ctx.fillStyle = 'green';
  ctx.fillRect(0, floorY, canvasWidth, canvasHeight - floorY);
  
  // Zeichne die zufällig generierten Plattformen (orange)
  ctx.fillStyle = 'orange';
  platforms.forEach(plat => {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  });
  
  // Score anzeigen (als reine Zahl)
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText('Score: ' + Math.floor(score), 10, 20);
}

// Spielschleife
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();