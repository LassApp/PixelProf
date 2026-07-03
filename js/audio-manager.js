/* ==================================================
   audio-manager.js — PixelProf v1.0.0
   Sistema centralizzato di feedback sonoro leggero.

   Un solo interruttore globale (persistito in localStorage,
   condiviso da tutte le aule su questo dispositivo). Il
   pulsante toggle è visibile SOLO nella schermata "Seleziona
   aula" e nello step "Seleziona modulo" della home — ma lo
   stato che imposta vale per l'intera app: Quiz, Speed Quiz,
   Abbina, Memory, Completa la frase, Traguardi.

   FILE AUDIO ATTESI in assets/sound/effects/ (vedi README.txt
   nella stessa cartella):
     correct.mp3       risposta/abbinamento/coppia corretti
     wrong.mp3         risposta/abbinamento sbagliati
     combo-max.mp3     combo massima ×5 raggiunta in Abbina
     badge-unlock.mp3  sblocco di un nuovo traguardo

   Se un file manca, AudioManager.play() fallisce in silenzio
   (nessun errore bloccante per l'utente) — vedi try/catch.

   Nessuna dipendenza: deve essere il PRIMO script caricato,
   prima di qualunque altro file che chiami AudioManager.play(...).

   API pubblica:
     AudioManager.play(name)       riproduce un suono se abilitato
     AudioManager.isEnabled()      true/false
     AudioManager.setEnabled(bool) imposta + persiste + aggiorna UI
     AudioManager.toggle()         inverte lo stato corrente
================================================== */
const AudioManager = (function () {
  const STORAGE_KEY = 'pp5_audio_enabled';
  const BASE = 'assets/sound/effects/';
  const SOUNDS = {
    correct:  BASE + 'correct.mp3',
    wrong:    BASE + 'wrong.mp3',
    comboMax: BASE + 'combo-max.mp3',
    badge:    BASE + 'badge-unlock.mp3',
  };

  let _enabled = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    _enabled = stored === null ? true : stored === '1';
  } catch (e) {}

  // Pre-carica un <audio> per suono. Su play() si clona il nodo,
  // così risposte ravvicinate non si "tagliano" a vicenda.
  const _pool = {};
  Object.keys(SOUNDS).forEach(name => {
    try {
      const a = new Audio(SOUNDS[name]);
      a.preload = 'auto';
      a.volume = 0.55;
      _pool[name] = a;
    } catch (e) {}
  });

  function _updateAllToggleUI() {
    document.querySelectorAll('.audio-toggle-btn').forEach(btn => {
      btn.classList.toggle('muted', !_enabled);
      btn.title = _enabled ? 'Audio attivo — clicca per disattivare' : 'Audio disattivato — clicca per attivare';
      btn.setAttribute('aria-pressed', String(!_enabled));
      const icon = btn.querySelector('.audio-toggle-icon');
      if (icon) icon.className = 'ti ' + (_enabled ? 'ti-volume-2' : 'ti-volume-off') + ' audio-toggle-icon';
    });
  }

  function play(name) {
    if (!_enabled) return;
    const src = _pool[name];
    if (!src) return;
    try {
      const node = src.cloneNode(true);
      node.volume = src.volume;
      const p = node.play();
      if (p && typeof p.catch === 'function') p.catch(() => {}); // policy autoplay/gesture — silenzioso
    } catch (e) {}
  }

  function isEnabled() { return _enabled; }

  function setEnabled(v) {
    _enabled = !!v;
    try { localStorage.setItem(STORAGE_KEY, _enabled ? '1' : '0'); } catch (e) {}
    _updateAllToggleUI();
  }

  function toggle() { setEnabled(!_enabled); }

  // Lo script è caricato in fondo al <body>, dopo tutto il markup dei
  // pulsanti toggle: il DOM è già pronto, aggiorna subito la UI.
  _updateAllToggleUI();

  return { play, isEnabled, setEnabled, toggle };
})();
window.AudioManager = AudioManager;
