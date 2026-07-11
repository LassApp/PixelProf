/* ==================================================
   onboarding.js — PixelProf v1.0.0
   Tour guidato al primo accesso docente ("dove clicco?").

   Mostra un breve tour "a spotlight" (overlay scuro + riquadro
   evidenziato pulsante + tooltip con freccia) che indica, in
   sequenza, i punti chiave dell'app:

     Direttore:  1) Gestisci Aule (dashboard)
                 2) Wizard "Nuova aula" (screen-courses, modalità manage)
                 3) Filtro moduli (home, step-mod)
                 4) Hub (Classifica/Progressi/Storico/Panoramica/Traguardi)

     Docente:    1) Filtro moduli (home, step-mod)
                 2) Hub
     (i passi 1-2 del Direttore non si applicano: il wizard aula
      è visibile solo al ruolo Direttore, quindi vengono saltati
      automaticamente — nessuna schermata dedicata per il docente).

   PERSISTENZA: localStorage, chiave per-docente
   (pp5_onboarding_<teacherId>) — stesso pattern IIFE +
   localStorage già usato da audio-manager.js e theme-manager.js.
   Una volta completato o saltato, il tour non si ripropone più
   su questo dispositivo per questo account.

   INDIPENDENZA: nessuna dipendenza da altri file (helper minimi
   locali, es. _escHtml) — puramente difensivo, dato che questo
   script è caricato molto presto (subito dopo theme-manager.js,
   prima di game-engine-state.js) e le sue funzioni pubbliche
   vengono comunque chiamate solo a runtime, molto più tardi,
   quando tutti gli altri script sono già pronti.

   INTEGRAZIONE (chiamate aggiunte nei file esistenti):
     app.js               → OnboardingTour.init() in _afterLogin()
                             OnboardingTour.showDashboardStep() in openDirectorDashboard()
                             OnboardingTour.showWizardStep() in ddGoGestisciAule()
     game-engine-state.js → OnboardingTour.showHomeSteps() in goStep('mod')

   API pubblica:
     OnboardingTour.init(teacherId, isDirector)
     OnboardingTour.showDashboardStep()   — screen-director-dashboard
     OnboardingTour.showWizardStep()      — screen-courses, modalità manage
     OnboardingTour.showHomeSteps()       — step-mod (filtro moduli + hub)
     OnboardingTour.skip()                — chiude il passo attivo e completa il tour
     OnboardingTour.reset()               — [debug/QA] riazzera lo stato per
                                             l'utente corrente. Utile in console:
                                               OnboardingTour.reset()
                                             poi ricaricare la pagina per rivedere
                                             il tour dall'inizio.
================================================== */
const OnboardingTour = (function () {
  const KEY_PREFIX = 'pp5_onboarding_';

  let _teacherId  = null;
  let _isDirector = false;
  let _state = { done: false, step: 0 };

  // Riferimenti al DOM del passo attivo — un solo passo alla volta.
  let _overlay    = null;
  let _ring       = null;
  let _tooltip    = null;
  let _reposition = null;
  let _onKey      = null;

  function _escHtml(s) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(s == null ? '' : s)));
    return d.innerHTML;
  }

  function _key() { return KEY_PREFIX + (_teacherId || 'anon'); }

  function _load() {
    _state = { done: false, step: 0 };
    try {
      const raw = localStorage.getItem(_key());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') _state = Object.assign(_state, parsed);
      }
    } catch (e) {}
  }

  function _save() {
    try { localStorage.setItem(_key(), JSON.stringify(_state)); } catch (e) {}
  }

  /**
   * init — chiamata una volta dopo il login (app.js:_afterLogin).
   * Carica lo stato persistito per QUESTO docente su QUESTO dispositivo.
   * @param {string}  teacherId
   * @param {boolean} isDirector
   */
  function init(teacherId, isDirector) {
    _teacherId  = teacherId || 'anon';
    _isDirector = !!isDirector;
    _load();
  }

  function _markDone() {
    _state.done = true;
    _save();
    _teardown();
  }

  /** Chiude il passo attivo (se presente) e completa definitivamente il tour. */
  function skip() { _markDone(); }

  /** [debug/QA] Riazzera il tour per l'utente corrente — vedi commento API sopra. */
  function reset() {
    _state = { done: false, step: 0 };
    _save();
  }

  /* ================================================
     RENDERING — overlay scuro + ring evidenziato + tooltip
     Tecnica "spotlight": il ring ha sfondo trasparente e un
     box-shadow enorme (0 0 0 9999px) che scurisce tutto il resto
     della pagina — nessuna maschera SVG, nessun cutout reale.
     L'overlay sottostante intercetta i click (tour non-bloccante
     sul contenuto, ma un solo modo per procedere: i pulsanti del
     tooltip, coerente con gli altri dialog dell'app che già usano
     mousedown-fuori-per-annullare, es. ppConfirmBox).
  ================================================ */
  function _teardown() {
    if (_reposition) {
      window.removeEventListener('resize', _reposition);
      window.removeEventListener('scroll', _reposition, true);
      _reposition = null;
    }
    if (_onKey) { document.removeEventListener('keydown', _onKey); _onKey = null; }
    if (_overlay) { _overlay.remove(); _overlay = null; }
    _ring = null; _tooltip = null;
  }

  function _resolveTarget(sel) {
    return typeof sel === 'string' ? document.querySelector(sel) : sel;
  }

  /**
   * _spotlight — mostra un singolo passo del tour puntato su un elemento.
   * @param {string|Element} sel        selettore CSS o elemento diretto
   * @param {object} opts
   *   pct        {number}  percentuale barra di avanzamento (0-100)
   *   stepLabel  {string}  es. "2 di 4"
   *   title      {string}
   *   body       {string}
   *   isLast     {boolean} true → pulsante "Fatto" invece di "Avanti"
   *   onNext     {function} eseguita dopo il click su Avanti/Fatto
   */
  function _spotlight(sel, opts) {
    _teardown(); // un solo passo attivo alla volta

    const target = _resolveTarget(sel);
    if (!target) {
      // L'elemento non esiste ancora in questo stato UI (es. schermata
      // non ancora renderizzata): avanza comunque per non bloccare il
      // tour su un passo "orfano" — meglio saltare un passo che restare
      // bloccati silenziosamente per sempre.
      if (opts.onNext) opts.onNext();
      return;
    }

    _overlay = document.createElement('div');
    _overlay.className = 'onb-overlay';

    _ring = document.createElement('div');
    _ring.className = 'onb-ring';

    _tooltip = document.createElement('div');
    _tooltip.className = 'onb-tooltip';
    _tooltip.setAttribute('role', 'dialog');
    _tooltip.setAttribute('aria-modal', 'true');
    _tooltip.innerHTML = `
      <div class="onb-progress"><div class="onb-progress-fill" style="width:${opts.pct}%"></div></div>
      <div class="onb-step-label">${_escHtml(opts.stepLabel || '')}</div>
      <div class="onb-title">${_escHtml(opts.title || '')}</div>
      <div class="onb-body">${_escHtml(opts.body || '')}</div>
      <div class="onb-actions">
        <button type="button" class="onb-skip">Salta il tour</button>
        <button type="button" class="onb-next">${opts.isLast ? 'Fatto' : 'Avanti'} <i class="ti ti-arrow-right"></i></button>
      </div>`;

    _overlay.appendChild(_ring);
    _overlay.appendChild(_tooltip);
    document.body.appendChild(_overlay);

    function _position() {
      if (!_ring || !_tooltip) return;
      const r = target.getBoundingClientRect();
      const pad = 8;
      _ring.style.top    = (r.top - pad) + 'px';
      _ring.style.left   = (r.left - pad) + 'px';
      _ring.style.width  = (r.width  + pad * 2) + 'px';
      _ring.style.height = (r.height + pad * 2) + 'px';

      const ttRect = _tooltip.getBoundingClientRect();
      const ttW = ttRect.width  || 290;
      const ttH = ttRect.height || 170;
      const spaceBelow = window.innerHeight - r.bottom;
      let top, arrowCls;
      if (spaceBelow > ttH + 28 || r.top < ttH + 28) {
        top = r.bottom + 18; arrowCls = 'onb-arrow-top';
      } else {
        top = Math.max(12, r.top - ttH - 18); arrowCls = 'onb-arrow-bottom';
      }
      _tooltip.classList.remove('onb-arrow-top', 'onb-arrow-bottom');
      _tooltip.classList.add(arrowCls);

      let left = r.left + r.width / 2 - ttW / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - ttW - 12));
      _tooltip.style.top  = top + 'px';
      _tooltip.style.left = left + 'px';
    }

    _position();
    requestAnimationFrame(_position); // ricalcola con le dimensioni reali del tooltip
    _reposition = _position;
    window.addEventListener('resize', _reposition);
    window.addEventListener('scroll', _reposition, true);

    try { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    setTimeout(_position, 320); // ricalcola dopo l'eventuale scroll-into-view

    _tooltip.querySelector('.onb-skip').addEventListener('click', () => _markDone());
    _tooltip.querySelector('.onb-next').addEventListener('click', () => {
      _teardown();
      if (opts.onNext) opts.onNext();
    });
    _overlay.addEventListener('mousedown', (e) => { if (e.target === _overlay) _markDone(); });
    _onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); _markDone(); } };
    document.addEventListener('keydown', _onKey);

    setTimeout(() => _tooltip.querySelector('.onb-next')?.focus(), 60);
  }

  /* ================================================
     SEQUENZA PASSI
       1 = dashboard      (solo Direttore)
       2 = wizard aula     (solo Direttore)
       3 = filtro moduli   (tutti)
       4 = hub              (tutti) → tour completato
     Ogni show*Step() è idempotente: se il passo è già stato
     mostrato/superato (o l'intero tour è concluso/saltato) non
     fa nulla — può quindi essere richiamata ad ogni render dello
     schermo di riferimento senza doversi preoccupare di duplicati.
  ================================================ */
  function _total() { return _isDirector ? 4 : 2; }

  function showDashboardStep() {
    if (_state.done || !_isDirector || _state.step >= 1) return;
    _spotlight('.dd-aule', {
      pct: 25, stepLabel: '1 di ' + _total(),
      title: 'Benvenuto in PixelProf! 👋',
      body: 'Inizia da qui: crea la tua prima aula e scegli quali moduli rendere disponibili ai docenti.',
      isLast: false,
      onNext: () => { _state.step = 1; _save(); },
    });
  }

  function showWizardStep() {
    if (_state.done || !_isDirector || _state.step >= 2) return;
    _spotlight('#cs-add-form-wrap', {
      pct: 50, stepLabel: '2 di ' + _total(),
      title: 'Crea la tua prima aula 🏫',
      body: 'Da qui avvii la creazione guidata: nome, moduli abilitati e docenti da assegnare, in tre semplici passi.',
      isLast: false,
      onNext: () => { _state.step = 2; _save(); },
    });
  }

  function showHomeSteps() {
    if (_state.done) return;
    if (_state.step < 3) _spotlightModule(); else _spotlightHub();
  }

  function _spotlightModule() {
    const stepNum = _isDirector ? 3 : 1;
    _spotlight('.mod-grid', {
      pct: _isDirector ? 75 : 50, stepLabel: stepNum + ' di ' + _total(),
      title: 'Scegli il modulo 📚',
      body: 'Ogni aula può abilitare solo alcuni moduli ICDL: qui vedi solo quelli disponibili per questa classe.',
      isLast: false,
      onNext: () => { _state.step = 3; _save(); _spotlightHub(); },
    });
  }

  function _spotlightHub() {
    const stepNum = _isDirector ? 4 : 2;
    _spotlight('#tb-hub-btn', {
      pct: 100, stepLabel: stepNum + ' di ' + _total(),
      title: 'Il tuo Hub 🎯',
      body: 'Classifica, Progressi, Storico, Panoramica Classe e Traguardi: tutto qui, in un solo tocco.',
      isLast: true,
      onNext: () => { _markDone(); },
    });
  }

  return { init, showDashboardStep, showWizardStep, showHomeSteps, skip, reset };
})();
window.OnboardingTour = OnboardingTour;
