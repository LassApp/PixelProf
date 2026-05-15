PixelProf - Struttura Base

Cartelle:
- data/quiz -> database domande quiz JSON
- assets/memory -> immagini per il gioco memory

Esempio caricamento JS:

fetch('data/quiz/computer_essentials.json')
  .then(r => r.json())
  .then(data => {
    console.log(data);
  });

Ogni modulo deve avere:
- il proprio file JSON
- la propria cartella immagini
