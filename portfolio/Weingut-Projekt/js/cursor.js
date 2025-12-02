// Wähle das Cursor-Element aus
const customCursor = document.querySelector('.custom-cursor');

// Event-Listener für Mausbewegungen
document.addEventListener('mousemove', (e) => {
  customCursor.style.left = e.clientX + 'px';
  customCursor.style.top = e.clientY + 'px';
});

// Funktion zum Schließen des Popups mit Animation
function closeNewsletter() {
  var newsletter = document.getElementById('newsletter');
  newsletter.classList.add('slideOut');
  // Nach der Animationsdauer (0.5s) wird das Element aus dem DOM ausgeblendet
  setTimeout(function() {
    newsletter.style.display = 'none';
  }, 500);
}

// JavaScript-Funktionen für das Modal
function openModal(type) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');

  // Dynamischer Inhalt basierend auf dem Typ
  if (type === 'kontakt') {
    modalBody.innerHTML = `
      <h2 class="modal-h2">Kontakt</h2>
      <p class="modal-p">Hier finden Sie unsere Kontaktinformationen...</p>
      <form>
        <input type="text" placeholder="Ihr Name" required>
        <input type="email" placeholder="Ihre E-Mail" required>
        <textarea placeholder="Ihre Nachricht"></textarea>
        <button type="submit">Senden</button>
      </form>
    `;
  } else if (type === 'impressum') {
    modalBody.innerHTML = `
      <h2 class="modal-h2">Impressum</h2>
      <address>
        Vorname Nachname <br>
        00000 Musterstadt <br>
        Musterstraße 000 <br>
      </address>
      <p>Diese Webseite ist mir Visual Studio Code, SCSS und JavaScript entstanden.</p>
    `;
  }

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Optionale Funktion zum Schließen des Modals beim Klick außerhalb
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
};