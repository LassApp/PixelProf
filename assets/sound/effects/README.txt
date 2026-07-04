PIXELPROF — SUONI DI FEEDBACK (v1.0.0)

Cartella: assets/sound/effects/

Il sistema audio (js/audio-manager.js) carica questi 4 file per
nome ESATTO. Se un file manca o il nome non corrisponde, quel
suono semplicemente non viene riprodotto — nessun errore
bloccante per l'utente (gestione difensiva con try/catch).

FILE ATTESI (minuscolo, formato .mp3):

  correct.mp3
    Risposta corretta in Quiz, Speed Quiz, Completa la frase;
    abbinamento corretto in Abbina; coppia trovata in Memory.

  wrong.mp3
    Risposta sbagliata in Quiz, Speed Quiz, Completa la frase;
    abbinamento sbagliato in Abbina.
    (In Memory il tentativo fallito resta silenzioso di proposito:
    è normale gameplay, non un errore da segnalare acusticamente.)

  combo-max.mp3
    Combo massima ×5 raggiunta in Abbina — sostituisce
    correct.mp3 in quel preciso istante (fanfara dedicata).

  badge-unlock.mp3
    Sblocco di un nuovo traguardo/achievement (schermata Traguardi).

LINEE GUIDA:
  - Durata: molto breve — 150–500ms per correct/wrong,
    fino a 1.5s per combo-max/badge-unlock
  - Stile: leggero, non invasivo, coerente con l'estetica
    "dark neon / streaming platform" del gioco
  - Volume: il codice applica già un volume moderato (0.55) —
    evitare file già normalizzati troppo alti
  - Formato: .mp3 (supportato nativamente da tutti i browser
    moderni via <audio>, nessuna libreria esterna necessaria)

TOGGLE ON/OFF:
  Un solo interruttore globale, persistito su questo dispositivo
  (localStorage, chiave pp5_audio_enabled), visibile SOLO nella
  schermata "Seleziona aula" e nello step "Seleziona modulo" della
  home — ma lo stato vale per l'intera webapp.
