const gameContainer = document.getElementById("game-container");
const playerStats = document.getElementById("player-stats");
const notification = document.getElementById("notification");

const gridSize = 10; // 10x10 Spielfeld
let player = { x: 4, y: 4, level: 10, exp: 0, lives: 30 };
let enemy = null;
let enemySpawnInterval;

// Spielfeld erstellen
function createGrid() {
  gameContainer.innerHTML = "";
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gameContainer.appendChild(cell);
  }
}

// Position berechnen
function getCell(x, y) {
  const index = y * gridSize + x;
  return gameContainer.children[index];
}

// Spieler und Gegner rendern
function renderGame() {
  createGrid();

  // Spieler rendern
  const playerCell = getCell(player.x, player.y);
  playerCell.classList.add("player");

  // Gegner rendern
  if (enemy) {
    const enemyCell = getCell(enemy.x, enemy.y);
    enemyCell.classList.add("enemy");
    
    // Gegnerfarbe je nach Levelunterschied
    const levelDifference = enemy.level - player.level;
    if (levelDifference < 0) {
      enemyCell.classList.add("green"); // Spieler stärker oder gleich
    } else if (levelDifference === 1) {
      enemyCell.classList.add("lightgreen");
    } else if (levelDifference <= 3) {
      enemyCell.classList.add("yellow");
    } else if (levelDifference <= 5) {
      enemyCell.classList.add("orange");
    } else {
      enemyCell.classList.add("red");
    }
  }

  // Spieler-Stats aktualisieren
  playerStats.textContent = `Level: ${player.level} | EXP: ${player.exp} | Lives: ${player.lives}`;
}

// Gegner zufällig generieren
function spawnEnemy() {
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  
  // Gegner-Level zwischen 1 und 20 für Zufall
  const level = Math.max(1, Math.floor(Math.random() * 20) + 1);

  enemy = { x, y, level };
  renderGame();
}

// Spieler bewegen
function movePlayer(dx, dy) {
  const newX = player.x + dx;
  const newY = player.y + dy;

  // Spielfeldbegrenzung
  if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;

  player.x = newX;
  player.y = newY;

  // Gegner angreifen
  if (enemy && player.x === enemy.x && player.y === enemy.y) {
    const levelDifference = enemy.level - player.level;

    if (levelDifference > 0) {
      // Spieler verliert Leben, je nach Leveldifferenz
      if (levelDifference === 1) {
        player.lives--;
        showNotification("Der Gegner war 1 Level stärker! Du verlierst 1 Leben.");
      } else if (levelDifference <= 3) {
        player.lives -= 2;
        showNotification("Der Gegner war 3 Level stärker! Du verlierst 2 Leben.");
      } else if (levelDifference <= 5) {
        player.lives -= 3;
        showNotification("Der Gegner war 5 Level stärker! Du verlierst 3 Leben.");
      } else {
        player.lives -= 4;
        showNotification("Der Gegner war viel zu stark! Du verlierst 4 Leben.");
      }

      if (player.lives <= 0) {
        // Game Over
        showNotification("Game Over!");
        alert("Game Over! Du hast alle Leben verloren.");
        resetGame();
        return;
      }
    } else {
      // Gegner besiegt
      player.exp += enemy.level * 5;
      if (player.exp >= player.level * 10) {
        player.exp -= player.level * 10;
        player.level++;
        showNotification("Level Up!");
      }
      enemy = null; // Gegner entfernen
      spawnEnemy();
    }
  }

  renderGame();
}

// Benachrichtigung anzeigen
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block"; // Nachricht sichtbar machen
  setTimeout(() => {
    notification.style.display = "none"; // Nachricht nach 5 Sekunden ausblenden
  }, 5000);
}

// Tasteneingaben
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      movePlayer(0, -1);
      break;
    case "s":
      movePlayer(0, 1);
      break;
    case "a":
      movePlayer(-1, 0);
      break;
    case "d":
      movePlayer(1, 0);
      break;
  }
});

// Gegner-Spawn-Intervall starten
function startEnemySpawnInterval() {
  enemySpawnInterval = setInterval(() => {
    spawnEnemy();
  }, 5000);
}

// Spiel zurücksetzen
function resetGame() {
  player = { x: 4, y: 4, level: 10, exp: 0, lives: 30 };
  enemy = null;
  clearInterval(enemySpawnInterval);
  spawnEnemy();
  startEnemySpawnInterval();
  renderGame();
}

// Spiel starten
spawnEnemy();
startEnemySpawnInterval();
renderGame();
