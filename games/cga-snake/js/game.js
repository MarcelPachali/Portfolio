/*
  Snake — CGA Style
  Clean, kommentierter Code für Fenrir Softworks.
  Logische Auflösung: 320x200 (CGA). Wir arbeiten mit einem Zellraster (z.B. 16x10 -> 20x20 Pixel-Zellen)
  damit sich Snake gut spielt. Die Grafik bleibt streng auf CGA-Farben beschränkt.
*/

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false; // scharfe Pixel

// --- Konfiguration (leicht änderbar) ---
let CELL_W = 10; // Zellbreite in Pixel (logische Pixel). 320/10 = 32 Spalten
let CELL_H = 10; // Zellhöhe in Pixel. 200/10 = 20 Reihen
const LOGIC_W = 320;
const LOGIC_H = 200;

// CGA Paletten (vereinfachte Auswahlen)
const PALETTES = {
  cga: [
    [0,0,0],        // 0 Schwarz
    [0,255,255],    // 1 Cyan
    [255,0,255],    // 2 Magenta
    [255,255,255]   // 3 Weiß
  ],
  alt_cga: [
    [0,0,0],
    [255,0,0],      // Rot
    [0,255,0],      // Grün
    [255,255,0]     // Gelb
  ],
  mono: [
    [0,0,0],
    [255,255,255]
  ]
};

// Spielzustand
let palette = PALETTES.cga;
let gameMode = 'cga';
let scale = 3;

let gridCols = Math.floor(LOGIC_W / CELL_W);
let gridRows = Math.floor(LOGIC_H / CELL_H);

let snake = []; // Array von {x,y}
let dir = {x:1,y:0}; // Bewegungsrichtung
let nextDir = {x:1,y:0};
let apple = null;
let running = false;
let paused = false;
let score = 0;
let tickInterval = 120; // ms pro Spiel-Update (höher = langsamer)
let lastTick = 0;
let grow = 0;
let highScore = 0;

// DOM Referenzen
const scoreEl = document.getElementById('score');
const lenEl = document.getElementById('length');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const scaleSelect = document.getElementById('scaleSelect');
const modeSelect = document.getElementById('modeSelect');
const palettePreview = document.getElementById('palettePreview');

// --- Initialisierung ---
function init() {
  applySettings();
  attachEvents();
  resetGame();
  render(); // erstes Rendern
  requestAnimationFrame(loop);
  updatePalettePreview();
}
function applySettings(){
  // Anpassen des Rastermaßes abhängig vom Modus
  if (gameMode === 'cga') {
    CELL_W = 10;
    CELL_H = 10;
    palette = PALETTES.cga;
  } else if (gameMode === 'mono') {
    // Monochrommodus (höhere logische Breite simuliert 640x200)
    CELL_W = 5;
    CELL_H = 10;
    palette = PALETTES.mono;
  }
  gridCols = Math.floor(LOGIC_W / CELL_W);
  gridRows = Math.floor(LOGIC_H / CELL_H);
  // Canvas bleibt 320x200 (logische Auflösung). CSS skaliert das sichtbare Raster.
  canvas.width = LOGIC_W;
  canvas.height = LOGIC_H;
  document.documentElement.style.setProperty('--scale', scale);
}

function attachEvents(){
  window.addEventListener('keydown', onKey);
  startBtn.addEventListener('click', ()=>{ resetGame(); start(); });
  pauseBtn.addEventListener('click', togglePause);
  scaleSelect.addEventListener('change', e => { scale = Number(e.target.value); applySettings(); });
  modeSelect.addEventListener('change', e => { gameMode = e.target.value; applySettings(); resetGame(); });
}

function onKey(e){
  const key = e.key;
  if (key === ' '){ togglePause(); e.preventDefault(); return; }
  if (!running) {
    if (key === 'Enter') { start(); }
  }
  // Richtungstasten
  if (key === 'ArrowUp' || key === 'w' || key === 'W') { setNextDir(0,-1); e.preventDefault(); }
  if (key === 'ArrowDown' || key === 's' || key === 'S') { setNextDir(0,1); e.preventDefault(); }
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') { setNextDir(-1,0); e.preventDefault(); }
  if (key === 'ArrowRight' || key === 'd' || key === 'D') { setNextDir(1,0); e.preventDefault(); }
}

function setNextDir(x,y){
  // Verhindere 180°-Wendung (sofern Slither nicht erwünscht)
  if (x === -dir.x && y === -dir.y) return;
  nextDir = {x,y};
}

// --- Spielsteuerung ---
function start(){
  running = true;
  paused = false;
  lastTick = performance.now();
  statusEl.textContent = 'Status: Running';
}
function togglePause(){
  if (!running) return;
  paused = !paused;
  statusEl.textContent = paused ? 'Status: Paused' : 'Status: Running';
}
function resetGame(){
  // Snake in die Mitte platzieren
  snake = [];
  const startX = Math.floor(gridCols/2);
  const startY = Math.floor(gridRows/2);
  snake.push({x:startX, y:startY});
  dir = {x:1,y:0};
  nextDir = {x:1,y:0};
  spawnApple();
  score = 0;
  grow = 0;
  running = false;
  paused = false;
  updateHUD();
  statusEl.textContent = 'Status: Ready';
}

// --- Spiel-Mechanik ---
function spawnApple(){
  // Einfach platzieren an zufälligem freien Feld
  const occupied = new Set(snake.map(s => s.x + ',' + s.y));
  let tries = 0;
  while(true){
    const x = Math.floor(Math.random()*gridCols);
    const y = Math.floor(Math.random()*gridRows);
    const key = x + ',' + y;
    if (!occupied.has(key) || tries > 1000) {
      apple = {x,y};
      return;
    }
    tries++;
  }
}

function tick(){
  if (!running || paused) return;
  // Update Richtung (Sanft: nächste Richtung annehmen)
  dir = nextDir;

  // Bewege Kopf
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wand-Kollision -> Wrap-around oder Game Over? Wir machen Game Over
  if (head.x < 0 || head.y < 0 || head.x >= gridCols || head.y >= gridRows) {
    gameOver();
    return;
  }

  // Selbst-Kollision
  for (let i=0;i<snake.length;i++){
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOver();
      return;
    }
  }

  // Einfügen
  snake.unshift(head);

  // Apple gegessen?
  if (apple && head.x === apple.x && head.y === apple.y) {
    score += 10;
    grow += 2; // wächst um 2 Zellen
    spawnApple();
  }

  // Wachsen oder Schwanz entfernen
  if (grow > 0) {
    grow--;
  } else {
    snake.pop();
  }

  // HUD aktualisieren
  updateHUD();
}

function gameOver(){
  running = false;
  paused = false;
  statusEl.textContent = 'Status: Game Over — Drücke Start';
  if (score > highScore) highScore = score;
}

// --- Rendering ---
function clearScreen(){
  // Schwarcher Hintergrund (Palette index 0)
  const p = palette[0];
  ctx.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawCell(gridX, gridY, colorIndex){
  // Zeichne ein "CELL_W x CELL_H" großes Rechteck an der Position (gridX, gridY) im Zellenraster
  const px = gridX * CELL_W;
  const py = gridY * CELL_H;
  const c = palette[colorIndex] || palette[palette.length-1];
  ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillRect(px, py, CELL_W, CELL_H);
}

function render(){
  clearScreen();

  // Optional: Hintergrund-Dither / Raster für CGA-Effekt (nur im cga mode)
  if (gameMode === 'cga') {
    // Ein leichter Streifen-/Dither-Effekt: abwechselnde dunkle Linien (nur optisch)
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = 'black';
    for (let r=0;r<gridRows;r++){
      if (r%2===0) ctx.fillRect(0, r*CELL_H, canvas.width, CELL_H);
    }
    ctx.globalAlpha = 1;
  }

  // Apple
  if (apple){
    // Apple: Verwende Weiß (Index 3) oder bei Mono: weiß
    const idx = (palette.length>2) ? 3 : 1;
    drawCell(apple.x, apple.y, idx);
  }

  // Snake Körper
  for (let i=0;i<snake.length;i++){
    const segment = snake[i];
    // Kopf anders färben
    if (i===0){
      // Kopf: Magenta (Index 2) falls vorhanden, sonst Weiß
      const idx = (palette.length>2) ? 2 : 1;
      drawCell(segment.x, segment.y, idx);
    } else {
      // Körper: Cyan (Index 1) oder Grau
      const idx = (palette.length>2) ? 1 : 1;
      drawCell(segment.x, segment.y, idx);
    }
  }

  // Score-Leiste (kleine Zahlen in rechter Ecke)
  // Wir zeichnen einfache Balken für Score (nur Deko)
  // keine extra UI-Elemente in Canvas nötig
}

function updateHUD(){
  scoreEl.textContent = score;
  lenEl.textContent = snake.length;
}

// --- Game Loop ---
function loop(now){
  if (!lastTick) lastTick = now;
  const dt = now - lastTick;
  if (dt >= tickInterval) {
    tick();
    render();
    lastTick = now;
  }
  requestAnimationFrame(loop);
}

// --- Palette Vorschau (kleine Swatches im HUD) ---
function updatePalettePreview(){
  palettePreview.innerHTML = '';
  const pal = palette;
  for (let i=0;i<pal.length;i++){
    const c = pal[i];
    const sw = document.createElement('span');
    sw.className = 'palette-swatch';
    sw.style.background = `rgb(${c[0]},${c[1]},${c[2]})`;
    palettePreview.appendChild(sw);
  }
}

// Start initialisieren
init();