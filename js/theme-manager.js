/* ==================================================
   theme-manager.js — PixelProf v1.0.0
   Toggle globale tema chiaro/scuro (persistito in
   localStorage, condiviso da tutte le aule su questo
   dispositivo — stesso pattern di AudioManager).

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

  let _light = false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    _light = stored === '1';
  } catch (e) {}

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

  return { isLight, setLight, toggle };
})();
window.ThemeManager = ThemeManager;
