/* ==================================================
   onboarding.js — PixelProf v2.0.0
   Tour guidato al primo accesso docente ("dove clicco?").

   v2.0.0 — RISCRITTURA MOTORE (richiesta esplicita utente):
     - Esc e click-fuori-dal-tooltip NON chiudono più il tour.
       L'unica uscita anticipata è il pulsante "Salta il tour".
     - Vero LOCK dell'interfaccia durante il tour: invece del
       vecchio overlay pieno che bloccava anche l'elemento
       evidenziato (l'utente poteva avanzare SOLO col pulsante
       "Avanti" del tooltip), ora un singolo velo a tutto schermo
       usa clip-path per ritagliare un "buco" ESATTAMENTE sopra
       il target del passo corrente. Tutto il resto dell'app
       (compresi gli altri pulsanti dello stesso schermo, es. le
       altre card della dashboard) resta fisicamente non cliccabile
       finché il velo copre quell'area — senza bisogno di aggiungere
       classi "disabled" sparse sui bottoni reali dell'app: un solo
       target alla volta è sempre l'unico elemento passante.
     - Due tipi di passo:
         'action' → il target è realmente cliccabile (buco nel velo);
                    l'avanzamento avviene con un click REALE
                    sull'elemento evidenziato (nessun pulsante
                    "Avanti" nel tooltip — solo "Salta il tour").
         'info'   → nessun buco (l'anello resta solo visivo, il
                    velo copre anche il target): si avanza col
                    pulsante "Avanti"/"Fatto" del tooltip.
     - Sequenza completamente ridisegnata per Direttore (11 passi:
       Gestisci Aule → form nuova aula [back disabilitato] → torna
       alla dashboard → Gestisci Docenti → Nuovo Docente → Docenti
       già creati → torna alla dashboard → Scegli Aula → seleziona
       aula → scegli modulo → Hub) e Docente (4 passi: scegli aula
       [tutte le card abilitate] → scegli modulo → scegli modalità
       → Hub).
     - Stato persistito: {done, idx} — idx è l'indice nell'array
       di passi del ruolo corrente (DIRECTOR_STEPS/TEACHER_STEPS).
       Schema precedente ({done, step}) non è più compatibile: se
       rilevato in localStorage, 'done' viene preservato (chi aveva
       già completato/saltato il tour non lo rivede), altrimenti si
       riparte da idx 0 sotto il nuovo schema.

   PERSISTENZA: localStorage, chiave per-docente
   (pp5_onboarding_<teacherId>) — invariata.

   INDIPENDENZA: nessuna dipendenza da altri file (helper minimi
   locali, es. _escHtml) — puramente difensivo, dato che questo
   script è caricato molto presto (subito dopo theme-manager.js,
   prima di game-engine-state.js) e le sue funzioni pubbliche
   vengono comunque chiamate solo a runtime, molto più tardi.

   INTEGRAZIONE (chiamate nei file esistenti):
     app.js:
       _afterLogin()            → OnboardingTour.init() (invariato)
                                   + OnboardingTour.showCoursesSelectStep()
                                     (ramo Docente, nuovo)
       openDirectorDashboard()  → OnboardingTour.showDashboardStep()
       ddGoGestisciAule()       → OnboardingTour.showWizardStep()
       ddGoSceltaAula()         → OnboardingTour.showCoursesSelectStep() (nuovo)
       openTeacherManagement()  → OnboardingTour.showTeacherMgmtStep() (nuovo)
     game-engine-state.js:
       goStep('mod')  → OnboardingTour.showHomeModuleStep()
       goStep('cat')  → OnboardingTour.showHomeCategoryStep() (nuovo)
       goStep('act')  → OnboardingTour.recheck() (nuovo, rete di sicurezza
                         per il passo Hub, già raggiungibile comunque in modo
                         opportunistico da _advance())

   API pubblica:
     OnboardingTour.init(teacherId, isDirector)
     OnboardingTour.showDashboardStep()
     OnboardingTour.showWizardStep()
     OnboardingTour.showTeacherMgmtStep()
     OnboardingTour.showCoursesSelectStep()
     OnboardingTour.showHomeModuleStep()
     OnboardingTour.showHomeCategoryStep()
     OnboardingTour.recheck()             — ri-tenta il render del passo
                                             corrente, no-op se non pertinente
     OnboardingTour.skip()                — chiude il passo attivo e
                                             completa il tour (unica uscita
                                             anticipata possibile)
     OnboardingTour.reset()               — [debug/QA] riazzera lo stato per
                                             l'utente corrente. Console:
                                               OnboardingTour.reset()
                                             poi ricaricare la pagina.
================================================== */
const OnboardingTour = (function () {
  const KEY_PREFIX = 'pp5_onboarding_';

  let _teacherId  = null;
  let _isDirector = false;
  let _state = { done: false, idx: 0 };
  let _renderedIdx = -1; // idx attualmente mostrato — evita re-render/flicker

  // Nodi DOM del passo attivo (velo, anelli, tooltip) — un solo passo alla volta.
  let _domNodes = [];
  // Handler in capture-phase per i passi 'action' — un solo listener globale
  // alla volta, attivo solo mentre un passo 'action' è mostrato.
  let _actionCaptureHandler = null;
  let _reposition = null;

  function _escHtml(s) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(s == null ? '' : s)));
    return d.innerHTML;
  }

  function _key() { return KEY_PREFIX + (_teacherId || 'anon'); }

  function _load() {
    _state = { done: false, idx: 0 };
    try {
      const raw = localStorage.getItem(_key());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Migrazione dallo schema precedente {done, step}: 'done' resta
          // valido così com'è (chi aveva già finito/saltato non lo rivede),
          // 'idx' riparte da 0 se assente — i due schemi di numerazione
          // dei passi non sono confrontabili tra loro.
          _state.done = !!parsed.done;
          _state.idx  = (typeof parsed.idx === 'number') ? parsed.idx : 0;
        }
      }
    } catch (e) {}
  }

  function _save() {
    try { localStorage.setItem(_key(), JSON.stringify(_state)); } catch (e) {}
  }

  function init(teacherId, isDirector) {
    _teacherId  = teacherId || 'anon';
    _isDirector = !!isDirector;
    _renderedIdx = -1;
    _load();
  }

  function _markDone() {
    _state.done = true;
    _save();
    _teardown();
  }

  /** Chiude il passo attivo (se presente) e completa definitivamente il tour.
   *  Unico modo per uscire dal tour prima del suo completamento naturale —
   *  Esc e click fuori dal tooltip NON hanno alcun effetto (per scelta). */
  function skip() { _markDone(); }

  /** [debug/QA] Riazzera il tour per l'utente corrente — vedi commento API sopra. */
  function reset() {
    _state = { done: false, idx: 0 };
    _renderedIdx = -1;
    _save();
  }

  /* ================================================
     SEQUENZE — un array dichiarativo per ruolo.
     Ogni passo: { screen, target, type, title, body }
       screen  stringa libera, usata SOLO per decidere se avanzare
               al passo successivo È SICURO farlo immediatamente
               dopo un click/Avanti (stesso screen = nessuna
               transizione di pagina in corso, sicuro renderizzare
               subito) oppure se conviene aspettare la chiamata
               esplicita show*Step() dal punto di navigazione
               dell'app (screen diverso = potenziale animazione/
               reload in corso).
       target  selettore CSS. Se seleziona più elementi (es. tutte
               le card aula), TUTTI diventano contemporaneamente
               il "buco" nel velo per i passi 'action'.
       type    'action' → serve un click reale sul target per
                           avanzare (nessun pulsante Avanti).
               'info'   → si avanza col pulsante Avanti/Fatto,
                           il target resta visivamente cerchiato
                           ma NON cliccabile.
  ================================================ */
  const DIRECTOR_STEPS = [
    { screen:'dashboard', target:'.dd-aule', type:'action',
      title:'Benvenuto in PixelProf! 👋',
      body:'Inizia da qui: premi su "Gestisci Aule" per creare la tua prima aula e scegliere quali moduli rendere disponibili ai docenti.' },
    { screen:'wizard', target:'#cs-add-form-wrap', type:'info',
      title:'Crea la tua prima aula 🏫',
      body:'Da qui avvii la creazione guidata: nome, moduli abilitati e docenti da assegnare, in tre semplici passi.' },
    { screen:'wizard', target:'#cs-back-dashboard-btn', type:'action',
      title:'Tutto pronto ✅',
      body:'Premi qui per tornare al pannello di controllo.' },
    { screen:'dashboard', target:'.dd-docenti', type:'action',
      title:'Gestisci i docenti 👩\u200d🏫',
      body:'Da qui puoi creare nuovi account e gestire quelli esistenti. Premi per continuare.' },
    { screen:'teacherMgmt', target:'.dd-new-teacher', type:'info',
      title:'Crea un nuovo account 🆕',
      body:'Qui puoi inserire un nuovo docente: bastano nome, cognome ed email — riceverà un invito automatico per impostare la password.' },
    { screen:'teacherMgmt', target:'.dd-teacher-list', type:'info',
      title:'Docenti già creati 👥',
      body:'Qui trovi i docenti già registrati: da ogni scheda puoi assegnarli alle aule già create, modificarne i dati o disattivarli.' },
    { screen:'teacherMgmt', target:'#screen-teacher-mgmt .back-link', type:'action',
      title:'Torniamo alla dashboard ✅',
      body:'Premi qui per tornare al pannello di controllo.' },
    { screen:'dashboard', target:'.dd-scegli', type:'action',
      title:'Entra in un\'aula 🎮',
      body:'Da qui puoi accedere a un\'aula ed esercitarti esattamente come farebbe un docente.' },
    { screen:'coursesSelect', target:'.course-card', type:'action',
      title:'Scegli un\'aula 🏫',
      body:'Seleziona una qualsiasi aula tra quelle disponibili per continuare.' },
    { screen:'homeModule', target:'.mod-grid', type:'info',
      title:'Scegli il modulo 📚',
      body:'Ogni aula può abilitare solo alcuni moduli ICDL: qui vedi solo quelli disponibili per questa classe.' },
    { screen:'hub', target:'#tb-hub-btn', type:'info',
      title:'Il tuo Hub 🎯',
      body:'Classifica, Progressi, Storico, Panoramica Classe e Traguardi: tutto qui, in un solo tocco.' },
  ];

  const TEACHER_STEPS = [
    { screen:'coursesSelect', target:'.course-card', type:'action',
      title:'Benvenuto in PixelProf! 👋',
      body:'Scegli una qualsiasi aula tra quelle disponibili per iniziare a esercitarti.' },
    { screen:'homeModule', target:'.mod-card:not(.soon-card)', type:'action',
      title:'Scegli il modulo 📚',
      body:'Ogni aula può abilitare solo alcuni moduli ICDL: qui vedi solo quelli disponibili per questa classe.' },
    { screen:'homeCategory', target:'.cat-games', type:'action',
      title:'Scegli la modalità 🎮',
      body:'Al momento sono disponibili i Minigiochi; la sezione Didattica arriverà presto.' },
    { screen:'hub', target:'#tb-hub-btn', type:'info',
      title:'Il tuo Hub 🎯',
      body:'Classifica, Progressi, Storico, Panoramica Classe e Traguardi: tutto qui, in un solo tocco.' },
  ];

  function _stepList() { return _isDirector ? DIRECTOR_STEPS : TEACHER_STEPS; }

  /* ================================================
     TEARDOWN / RISOLUZIONE TARGET
  ================================================ */
  function _teardown() {
    if (_reposition) {
      window.removeEventListener('resize', _reposition);
      window.removeEventListener('scroll', _reposition, true);
      _reposition = null;
    }
    if (_actionCaptureHandler) {
      document.removeEventListener('click', _actionCaptureHandler, true);
      _actionCaptureHandler = null;
    }
    _domNodes.forEach(n => { try { n.remove(); } catch (e) {} });
    _domNodes = [];
  }

  /** Elementi che matchano il selettore E sono realmente visibili
   *  (offsetParent non nullo — falso per display:none a qualunque
   *  livello di antenato, che è esattamente come questa app nasconde
   *  le schermate tramite la classe .hidden). Evita falsi positivi
   *  su elementi statici presenti nel DOM ma dietro a uno schermo
   *  ancora nascosto. */
  function _resolveVisibleTargets(sel) {
    try {
      return Array.from(document.querySelectorAll(sel)).filter(el => el.offsetParent !== null);
    } catch (e) { return []; }
  }

  function _unionRect(rects) {
    const left   = Math.min.apply(null, rects.map(r => r.left));
    const top    = Math.min.apply(null, rects.map(r => r.top));
    const right  = Math.max.apply(null, rects.map(r => r.right));
    const bottom = Math.max.apply(null, rects.map(r => r.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  /** Costruisce un clip-path (regola evenodd) = intero viewport MENO un
   *  rettangolo per ciascun rect fornito, con pad px di margine. Il
   *  risultato ritaglia SIA il rendering SIA l'hit-test dell'elemento a
   *  cui viene applicato: le aree "bucate" non ricevono più click, che
   *  passano diretti all'elemento reale sottostante. */
  function _buildClipPath(rects, pad) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let d = `M0 0H${vw}V${vh}H0Z`;
    rects.forEach(r => {
      const x0 = Math.max(0, r.left - pad);
      const y0 = Math.max(0, r.top - pad);
      const x1 = Math.min(vw, r.right + pad);
      const y1 = Math.min(vh, r.bottom + pad);
      const w = x1 - x0, h = y1 - y0;
      if (w > 0 && h > 0) d += `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
    });
    return `path(evenodd, "${d}")`;
  }

  /* ================================================
     AVANZAMENTO
  ================================================ */
  function _advance() {
    const list = _stepList();
    const prevDef = list[_state.idx];
    _state.idx++;
    _save();
    _renderedIdx = -1;
    _teardown();
    const nextDef = list[_state.idx];
    if (!nextDef) { _markDone(); return; }
    // Sicuro renderizzare SUBITO (senza aspettare l'hook esplicito
    // dell'app) in due casi: stesso "screen" del passo appena concluso
    // (nessuna transizione di pagina in mezzo), oppure il target è
    // l'Hub — sempre presente nella topbar qualunque sia lo step-*
    // attivo in quel momento, quindi sempre sicuro da controllare.
    const sameScreen = prevDef && nextDef.screen === prevDef.screen;
    const hubTarget  = nextDef.target === '#tb-hub-btn';
    if (sameScreen || hubTarget) _tryRenderCurrentStep();
  }

  function _tryRenderCurrentStep() {
    if (_state.done) return false;
    const list = _stepList();
    if (_state.idx >= list.length) { _markDone(); return false; }
    if (_renderedIdx === _state.idx && _domNodes.length) return true; // già mostrato
    const def = list[_state.idx];
    const targets = _resolveVisibleTargets(def.target);
    if (!targets.length) return false; // schermata non ancora pronta — si riprova dopo
    _renderStep(def, targets);
    _renderedIdx = _state.idx;
    return true;
  }

  /* ================================================
     RENDERING — velo con clip-path + anello/i + tooltip
  ================================================ */
  function _renderStep(def, targets) {
    _teardown(); // sicurezza, normalmente già vuoto

    const list = _stepList();
    const idx = _state.idx;
    const isLast = idx === list.length - 1;
    const pct = Math.round(((idx + 1) / list.length) * 100);
    const stepLabel = (idx + 1) + ' di ' + list.length;
    const isAction = def.type === 'action';

    const veil = document.createElement('div');
    veil.className = 'onb-overlay';
    document.body.appendChild(veil);
    _domNodes.push(veil);

    const rings = targets.map(() => {
      const r = document.createElement('div');
      r.className = 'onb-ring' + (isAction ? ' onb-ring-pulse' : '');
      document.body.appendChild(r);
      _domNodes.push(r);
      return r;
    });

    const tooltip = document.createElement('div');
    tooltip.className = 'onb-tooltip';
    tooltip.setAttribute('role', 'dialog');
    tooltip.setAttribute('aria-modal', 'true');
    const nextBtnHtml = isAction ? '' :
      `<button type="button" class="onb-next">${isLast ? 'Fatto' : 'Avanti'} <i class="ti ti-arrow-right"></i></button>`;
    tooltip.innerHTML = `
      <div class="onb-progress"><div class="onb-progress-fill" style="width:${pct}%"></div></div>
      <div class="onb-step-label">${_escHtml(stepLabel)}</div>
      <div class="onb-title">${_escHtml(def.title || '')}</div>
      <div class="onb-body">${_escHtml(def.body || '')}</div>
      <div class="onb-actions">
        <button type="button" class="onb-skip">Salta il tour</button>
        ${nextBtnHtml}
      </div>`;
    document.body.appendChild(tooltip);
    _domNodes.push(tooltip);

    function _position() {
      const rects = targets.map(t => t.getBoundingClientRect());
      const union = _unionRect(rects);
      const pad = 8;

      rects.forEach((r, i) => {
        const ring = rings[i];
        ring.style.top    = (r.top - pad) + 'px';
        ring.style.left   = (r.left - pad) + 'px';
        ring.style.width  = (r.width + pad * 2) + 'px';
        ring.style.height = (r.height + pad * 2) + 'px';
      });

      // 'action' → buco reale nel velo (target cliccabile).
      // 'info'   → nessun buco, il velo copre anche il target
      //            (resta solo visivamente cerchiato dall'anello sopra).
      veil.style.clipPath = isAction ? _buildClipPath(rects, pad) : '';

      const ttRect = tooltip.getBoundingClientRect();
      const ttW = ttRect.width || 290, ttH = ttRect.height || 170;
      const spaceBelow = window.innerHeight - union.bottom;
      let top, arrowCls;
      if (spaceBelow > ttH + 28 || union.top < ttH + 28) {
        top = union.bottom + 18; arrowCls = 'onb-arrow-top';
      } else {
        top = Math.max(12, union.top - ttH - 18); arrowCls = 'onb-arrow-bottom';
      }
      tooltip.classList.remove('onb-arrow-top', 'onb-arrow-bottom');
      tooltip.classList.add(arrowCls);

      let left = union.left + union.width / 2 - ttW / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - ttW - 12));
      tooltip.style.top  = top + 'px';
      tooltip.style.left = left + 'px';
    }

    _position();
    requestAnimationFrame(_position); // ricalcola con le dimensioni reali del tooltip
    _reposition = _position;
    window.addEventListener('resize', _reposition);
    window.addEventListener('scroll', _reposition, true);

    try { targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    setTimeout(_position, 320); // ricalcola dopo l'eventuale scroll-into-view

    // Nessun handler per Escape né per click fuori dal tooltip: l'unica
    // uscita anticipata dal tour è il pulsante "Salta il tour" qui sotto.
    tooltip.querySelector('.onb-skip').addEventListener('click', () => _markDone());

    const nextBtn = tooltip.querySelector('.onb-next');
    if (nextBtn) nextBtn.addEventListener('click', () => _advance());

    if (isAction) {
      // Delegazione in CAPTURE phase su document: garantisce che il nostro
      // avanzamento di stato avvenga PRIMA di qualunque onclick nativo
      // dell'app collegato allo stesso elemento (l'ordine dei listener
      // sullo stesso nodo segue l'ordine di registrazione, e l'onclick
      // inline dell'app è sempre registrato molto prima di questo — la
      // capture-phase su un antenato bypassa il problema alla radice).
      _actionCaptureHandler = (e) => {
        const hit = targets.some(t => t === e.target || t.contains(e.target));
        if (hit) _advance();
      };
      document.addEventListener('click', _actionCaptureHandler, true);
    }

    const focusTarget = nextBtn || tooltip.querySelector('.onb-skip');
    setTimeout(() => focusTarget && focusTarget.focus(), 60);
  }

  /* ================================================
     API PUBBLICA — ogni show*Step()/recheck() è idempotente:
     se il passo corrente non riguarda questa schermata, o è già
     mostrato, non fa nulla. Sicuro richiamarle da qualunque punto
     di navigazione, anche più volte.
  ================================================ */
  function showDashboardStep()     { _tryRenderCurrentStep(); }
  function showWizardStep()        { _tryRenderCurrentStep(); }
  function showTeacherMgmtStep()   { _tryRenderCurrentStep(); }
  function showCoursesSelectStep() { _tryRenderCurrentStep(); }
  function showHomeModuleStep()    { _tryRenderCurrentStep(); }
  function showHomeCategoryStep()  { _tryRenderCurrentStep(); }
  function recheck()               { _tryRenderCurrentStep(); }

  return {
    init,
    showDashboardStep, showWizardStep, showTeacherMgmtStep,
    showCoursesSelectStep, showHomeModuleStep, showHomeCategoryStep,
    recheck, skip, reset,
  };
})();
window.OnboardingTour = OnboardingTour;
