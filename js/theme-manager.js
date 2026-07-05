/* ==================================================
   theme-manager.js — PixelProf v1.1.0
   Toggle globale tema chiaro/scuro (persistito in
   localStorage, condiviso da tutte le aule su questo
   dispositivo — stesso pattern di AudioManager).

   v1.1.0 — CASCATA DI PRIORITÀ ALL'AVVIO:
     1. Scelta manuale già salvata dall'utente (toggle) — invariata,
        ha sempre precedenza assoluta.
     2. Preferenza del sistema operativo (prefers-color-scheme),
        se rilevabile, quando l'utente non ha mai scelto manualmente.
     3. Fallback finale: tema Light (nessuna scelta utente, nessuna
        preferenza di sistema rilevabile — es. browser molto vecchi).
     In più: finché l'utente non compie la PRIMA scelta manuale, il
     tema segue live gli eventuali cambi di preferenza del sistema
     (es. passaggio automatico giorno/notte del dispositivo) senza
     mai scrivere su localStorage — solo setLight()/toggle() persistono.

   Il tema chiaro NON è un redesign: la palette scura
   resta quella "vera" dell'app (card modulo, hero
   attività, retro carte Memory, schermate di risultato/
   celebrazione restano scure per effetto scenico — sono
   "poster" auto-contenuti o palchi dedicati, non
   superfici di lettura prolungata). Il tema chiaro
   interviene su chrome, moduli, liste, form e superfici
   di lettura prolungata (dashboard, classifica, storico,
   progressi, traguardi) per la leggibilità in aule con
   proiettore e luce diurna. Dettagli completi nel layer
   CSS "theme" in pixelprof.css.

   Applicato via attributo html[data-theme="light"|"dark"].
   Zero logica di tema sparsa altrove in JS: solo 2 piccoli
   hook di classe (app.js e dashboard.js) per i due elementi
   che impostano un colore via style inline — vedi commenti
   puntuali lì e nel layer CSS "theme".

   API pubblica:
     ThemeManager.isLight()      true/false
     ThemeManager.setLight(bool) imposta + persiste + aggiorna UI
     ThemeManager.toggle()       inverte lo stato corrente
================================================== */
const ThemeManager = (function () {
  const STORAGE_KEY = 'pp5_theme_light';

  /**
   * _detectSystemPreference — legge prefers-color-scheme dal
   * sistema operativo/browser.
   * @returns {boolean|null} true=light, false=dark, null=non determinabile
   */
  function _detectSystemPreference() {
    try {
      if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) return true;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches)  return false;
      }
    } catch (e) {}
    return null; // matchMedia assente o nessuna delle due media query soddisfatta
  }

  // _hasUserChoice: true solo se in localStorage esiste una scelta
  // manuale valida ('0'/'1'). Distingue "utente ha scelto" da "mai
  // scelto" — un valore assente (null) NON viene mai interpretato
  // come "scuro" (comportamento precedente), ma innesca il fallback
  // sulla preferenza di sistema.
  let _light;
  let _hasUserChoice = false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '1' || stored === '0') {
      _hasUserChoice = true;
      _light = stored === '1';
    }
  } catch (e) {}

  if (!_hasUserChoice) {
    const sys = _detectSystemPreference();
    _light = (sys !== null) ? sys : true; // true = Light di default
  }

  function _apply() {
    document.documentElement.setAttribute('data-theme', _light ? 'light' : 'dark');
  }

  function _updateAllToggleUI() {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.classList.toggle('is-light', _light);
      btn.title = _light ? 'Tema chiaro attivo — clicca per il tema scuro' : 'Tema scuro attivo — clicca per il tema chiaro';
      btn.setAttribute('aria-pressed', String(_light));
      const icon = btn.querySelector('.theme-toggle-icon');
      if (icon) icon.className = 'ti ' + (_light ? 'ti-sun' : 'ti-moon') + ' theme-toggle-icon';
    });
  }

  function isLight() { return _light; }

  function setLight(v) {
    _light = !!v;
    _hasUserChoice = true; // scelta manuale — vince per sempre sulla preferenza di sistema
    try { localStorage.setItem(STORAGE_KEY, _light ? '1' : '0'); } catch (e) {}
    _apply();
    _updateAllToggleUI();
  }

  function toggle() { setLight(!_light); }

  // Applica subito il tema — prima ancora che il DOM dei pulsanti
  // esista — così non c'è mai un flash del tema scuro sotto lo
  // splash screen (che comunque copre tutto per ~2s all'avvio).
  _apply();
  // Lo script è in fondo al <body>: il DOM dei pulsanti è già pronto.
  _updateAllToggleUI();

  // Finché l'utente NON ha mai scelto manualmente, segue live gli eventuali
  // cambi di preferenza del sistema operativo mentre la tab resta aperta
  // (es. passaggio automatico giorno/notte del dispositivo). Si disattiva
  // per sempre alla prima chiamata di setLight()/toggle() (_hasUserChoice
  // diventa true), quindi non entra mai in conflitto con una scelta manuale.
  try {
    if (window.matchMedia) {
      const _mq = window.matchMedia('(prefers-color-scheme: light)');
      const _onSystemChange = () => {
        if (_hasUserChoice) return;
        const sys = _detectSystemPreference();
        if (sys === null) return;
        _light = sys;
        _apply();
        _updateAllToggleUI();
      };
      if (_mq.addEventListener) _mq.addEventListener('change', _onSystemChange);
      else if (_mq.addListener) _mq.addListener(_onSystemChange); // fallback Safari <14
    }
  } catch (e) {}

  return { isLight, setLight, toggle };
})();
window.ThemeManager = ThemeManager;
