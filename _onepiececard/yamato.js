// Annahme: Sie haben eine Datenbank oder ein Objekt mit den Karteninformationen, einschließlich Bildpfaden
const kartenDatenbank = {
    'ST09-001': {
      name: 'Yamato',
      typ: 'Anführer',
      cost: '?',
      counter: '?',
      kraft: 5000,
      lebenspunkte: 5,
      farbe: 'Gelb',
      region: 'Land von Wano',
      beschreibung: "Don! x1 - Gegnerzug: Wenn du 2 oder weniger Lebenspunkte hast, erhält dieser Anführer +1000 Kraft.",
      bild: 'bilder/yamato/yamato.jpg' // Beispielbildpfad, ersetze dies durch den tatsächlichen Pfad zu deinen Bildern
    },
    'ST09-002': {
      name: 'Uzuki Tempura',
      typ: 'Charakter',
      cost: 4,
      counter: 1000,
      kraft: 5000,
      lebenspunkte: '?',
      farbe: 'Gelb',
      region: 'Land von Wano',
      beschreibung: "Effekt: Setze bis zu 1 deiner gegnerischen Charaktere mit einem Wert von 2 oder weniger aus und füge diese Karte deiner Hand hinzu.",
      bild: 'bilder/yamato/uzuki.webp'
    },
    'ST09-003': {
      name: 'Ulti',
      typ: 'Charakter',
      cost: 4,
      counter: 1000,
      kraft: 6000,
      lebenspunkte: '?',
      farbe: 'Gelb',
      region: 'Biest Königreich Piraten',
      beschreibung: "_",
      bild: 'bilder/yamato/ulti.jpg' 
    },
    'ST09-004': {
      name: 'Kaido',
      typ: 'Charakter',
      cost: 4,
      counter: 1000,
      kraft: 5000,
      lebenspunkte: '?',
      farbe: 'Gelb',
      region: 'Die 4 Kaiser / Biest Königreich Piraten',
      beschreibung: "DON!! x1 Wenn du 2 oder weniger Lebenskarten hast, kann dieser Charakter im Kampf nicht kampfunfähig gemacht werden.",
      bild: 'bilder/yamato/kaido.png' 
    },
    'ST09-005': {
      name: 'Kouzuki Oden',
      typ: 'Charakter',
      cost: 7,
      counter: '?',
      kraft: 7000,
      lebenspunkte: '?',
      farbe: 'Gelb',
      region: 'Land von Wano / Kouzuki Clan',
      beschreibung: "DON!! x1 Dieser Charakter erhält Doppelangriff. (Diese Karte fügt 2 Schaden zu.) <br> Bei K.O. Du kannst 2 Karten aus deiner Hand ablegen: Füge bis zu 1 Karte von oben deines Decks zu den obersten Karten deines Lebens hinzu.",
      bild: 'bilder/yamato/oden.jpg' 
    },
    // Weitere Karten können hier hinzugefügt werden
    /*
    '': {
      name: '',
      typ: '',
      cost: ,
      counter: ,
      kraft: ,
      lebenspunkte: '?',
      farbe: 'Gelb',
      region: '',
      beschreibung: "",
      bild: '' 
    },
    */
  };

  // Funktion zum Anzeigen des Kartenprofils basierend auf der Kartennummer
  function zeigeKartenProfil() {
  const kartennummer = document.getElementById('kartennummer').value.trim(); // trim() entfernt Whitespaces
  const karte = kartenDatenbank[kartennummer];
  const kartenprofilBereich = document.getElementById('kartenprofil');

  if (karte) {
    kartenprofilBereich.innerHTML = `
      <h2>Kartenprofil:</h2>
      <img src="${karte.bild}" alt="${karte.name}" style="max-width: 200px;">
      <p><strong>Name:</strong> ${karte.name}</p>
      <p><strong>Typ:</strong> ${karte.typ}</p>
      <p><strong>Kosten:</strong> ${karte.cost}</p>
      <p><strong>Konter</strong> ${karte.counter}</p>
      <p><strong>Kraft:</strong> ${karte.kraft}</p>
      <p><strong>Lebenspunkte:</strong> ${karte.lebenspunkte}</p>
      <p><strong>Farbe:</strong> ${karte.farbe}</p>
      <p><strong>Region:</strong> ${karte.region}</p>
      <p><strong>Beschreibung:</strong> ${karte.beschreibung}</p>
    `;
  } else {
    kartenprofilBereich.innerHTML = '<p>Karte nicht gefunden.</p>';
  }
}