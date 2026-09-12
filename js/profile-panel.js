/* ==================================================
   PROFILE PANEL — v8.29.3
   File dedicato (separato da app.js) per il tasto profilo unico in
   topbar (icona + anello colorato per ruolo/genere) e il pannello
   laterale che apre: nome, ruolo, Ultimo accesso, Ultima aula
   collegata, poi Esci e "Rivedi il tour guidato".

   v8.29.3 — Bugfix segnalato: le 4 sezioni "sul posto" (minigiochi/
     didattica/hub/profilo) non facevano nulla se cliccate PRIMA di
     essere entrati in un'aula in questa sessione (es. Direttore dalla
     Dashboard) — stessa confusione già vista nel bug v8.29.1. Ora, se
     activeCourseId (game-engine-state.js) è vuoto, un dialog
     informativo (ppConfirmBox forceConfirm) spiega di entrare prima in
     un'aula, invece di tentare una navigazione a vuoto. "Tour
     completo" e "Gestione Aule e Docenti" invariati: portano entrambi
     a scelta-aula/Dashboard, funzionano comunque aula attiva o no.

   v8.29.2 — Bugfix segnalato: "Rivedi il tour guidato" restava
     cliccabile durante un minigioco o una sessione Flip Card attiva —
     avviare una sezione da lì usciva dalla partita senza la conferma
     "Uscire dalla partita?" già esistente altrove. Nuove
     _isSessionActive()/_updateTourLockState(), che riusano
     isGameActive() (game-engine-state.js) e isFlipCardActive()
     (flip-card.js), entrambe già esistenti — nessuna nuova
     rilevazione di stato. Ricalcolato a ogni apertura del pannello
     (toggle()). Stile in css/tour-sections.css (.pp-tour-locked).

   v8.29.1 — Bugfix: le sezioni "sul posto" non partivano se il
     pannello profilo veniva aperto da una schermata diversa da quella
     con le card categoria (Hub, un minigioco...) — vedi doc completa
     in js/onboarding.js. Aggiunta navigazione esplicita a tab-home/
     step-cat prima di startSection() in _handleTourSectionClick().

   v8.29.0 — "Rivedi il tour guidato" ora apre una lista di sezioni
     (Tour completo, Gestione Aule e Docenti [solo Direttore],
     Minigiochi, Didattica, Hub, Profilo & Impostazioni) invece di
     ripartire subito col tour intero — richiesta esplicita utente.
     "Tour completo" richiama restartTour() INVARIATA (stesso
     comportamento di sempre). Le altre voci chiamano
     OnboardingTour.startSection(key): quelle che vivono nella screen
     'homeCategory' (dove vive già questo pannello) partono sul posto,
     senza conferma; "Gestione Aule e Docenti" (screen 'dashboard')
     esce dal contesto corrente come "Tour completo", quindi ha lo
     stesso tipo di conferma. Markup lista generato qui via JS dentro
     #pp-tour-sections (index.html) — stile in css/tour-sections.css
     (nuovo file, stesso layer @layer topbarprofile).

   SOSTITUISCE il vecchio #tb-user-badge (ruolo-pill + nome + pulsante
   esci sempre visibili in topbar) — vedi index.html.

   Colori riusati 1:1 dalla scheda docente esistente (pixelprof.css
   .tdc-gender-icon.g-uomo/.g-donna), nessun nuovo colore introdotto:
     uomo      → ring #1e90ff / testo #5eb0ff
     donna     → ring #ff4d6d / testo #ff8fa3
     direttore → #ffd700 (invariato, stesso oro del badge "👑 Dir")
     default   → #00cfff (nessun genere impostato — stesso ciano già
                 usato per il ruolo "📖 Doc" prima di questa modifica)

   Dipendenze globali attese (definite altrove nel bundle — vedi
   tools/build.js BUNDLE_FILES, questo file va DOPO app.js/courses.js/
   onboarding.js): sh(), ppConfirmBox(), doLogout(), loadCourses(),
   resetSessionState(), setCoursesScreenMode(), openDirectorDashboard(),
   OnboardingTour, window.Auth.
================================================== */

const ProfilePanel = (function () {

  const ROLE_STYLE = {
    direttore: { ring: '#ffd700', text: '#ffd700', bg: 'rgba(255,215,0,.12)',  icon: 'ti-crown'         },
    uomo:      { ring: '#1e90ff', text: '#5eb0ff', bg: 'rgba(30,144,255,.12)', icon: 'ti-gender-male'   },
    donna:     { ring: '#ff4d6d', text: '#ff8fa3', bg: 'rgba(255,77,109,.12)', icon: 'ti-gender-female' },
    default:   { ring: '#00cfff', text: '#00cfff', bg: 'rgba(0,207,255,.1)',   icon: 'ti-user'          }
  };

  /** v8.29.0 — Config dichiarativa per la lista sotto "Rivedi il tour
   *  guidato". `key` deve combaciare col campo `section` sui passi in
   *  js/onboarding.js. `exits:true` → la sezione parte da una screen
   *  diversa da 'homeCategory' (dove vive questo pannello): richiede
   *  conferma + navigazione, come "Tour completo". Le voci con
   *  OnboardingTour.sectionCount(key) === 0 per il ruolo corrente (es.
   *  'aule' per il Docente) vengono escluse automaticamente in
   *  _tourSectionsFor() — nessun controllo isDir hardcoded qui. */
  const TOUR_SECTION_DEFS = [
    { key: 'aule', icon: 'ti-school', label: 'Gestione Aule e Docenti', exits: true,
      exitIcon: '🏫', exitTitle: 'Rivedere questa sezione?',
      exitMsg: 'Uscirai dall\u2019aula corrente e tornerai alla Dashboard Direttore per rivedere questa sezione.' },
    { key: 'minigiochi', icon: 'ti-device-gamepad-2', label: 'Minigiochi' },
    { key: 'didattica',  icon: 'ti-book-2',           label: 'Didattica' },
    { key: 'hub',        icon: 'ti-layout-grid',      label: 'Hub' },
    { key: 'profilo',    icon: 'ti-user',             label: 'Profilo & Impostazioni' }
  ];

  let _isDir = false;
  let _tourSectionsOpen = false;
  let _tourItemsCache = [];

  function _styleFor(isDir, genere) {
    if (isDir) return ROLE_STYLE.direttore;
    if (genere === 'uomo')  return ROLE_STYLE.uomo;
    if (genere === 'donna') return ROLE_STYLE.donna;
    return ROLE_STYLE.default;
  }

  function _formatLastAccess(iso) {
    if (!iso) return 'Primo accesso';
    try {
      const d = new Date(iso);
      const now = new Date();
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const sameDay = (a, b) => a.toDateString() === b.toDateString();
      const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      if (sameDay(d, now)) return 'Oggi · ' + time;
      if (sameDay(d, y))   return 'Ieri · ' + time;
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) + ' · ' + time;
    } catch (e) { return '—'; }
  }

  function _lastClassroomName(id) {
    if (!id) return '—';
    try {
      const courses = (typeof loadCourses === 'function') ? loadCourses() : [];
      const c = courses.find(c => c.id === id);
      return c ? c.name : '—';
    } catch (e) { return '—'; }
  }

  /** Chiamata da app.js _afterLogin() al posto del vecchio blocco
   *  tbBadge/tbRole/tbName — popola TUTTE le istanze del tasto
   *  profilo (v8.25.1: presente su ogni schermata, non solo nel
   *  gioco) e il contenuto del pannello, condiviso e unico. */
  function render(profile, isDir) {
    _isDir = !!isDir;
    const st = _styleFor(_isDir, profile && profile.genere);

    document.querySelectorAll('.tb-profile-btn').forEach(btn => {
      btn.style.setProperty('--profile-ring', st.ring);
      btn.style.setProperty('--profile-bg', st.bg);
      btn.classList.add('visible');
    });
    document.querySelectorAll('.tb-profile-icon').forEach(icon => {
      icon.className = 'ti ' + st.icon + ' tb-profile-icon';
    });

    const name = (profile && profile.name) || (window.Auth && window.Auth.getName && window.Auth.getName()) || '—';

    const panelName = sh('pp-profile-name');
    if (panelName) panelName.textContent = name;

    const avatar = sh('pp-profile-avatar');
    if (avatar) {
      avatar.style.setProperty('--profile-ring', st.ring);
      avatar.style.setProperty('--profile-bg', st.bg);
      avatar.innerHTML = '<i class="ti ' + st.icon + '"></i>';
    }

    const rolePill = sh('pp-profile-role');
    if (rolePill) {
      rolePill.textContent = _isDir ? '👑 Direttore' : '📖 Docente';
      rolePill.style.setProperty('--profile-ring', st.ring);
    }

    const lastAccess = sh('pp-profile-last-access');
    if (lastAccess) lastAccess.textContent = _formatLastAccess(profile && profile.last_login_at);

    const lastClass = sh('pp-profile-last-classroom');
    if (lastClass) lastClass.textContent = _lastClassroomName(profile && profile.last_classroom_id);
  }

  function _setTopbarShift(open) {
    document.querySelectorAll('.topbar, .cs-topbar').forEach(tb => tb.classList.toggle('pp-open', open));
  }

  function toggle() {
    const panel = sh('profile-panel');
    const backdrop = sh('profile-panel-backdrop');
    if (!panel || !backdrop) return;
    const open = panel.classList.toggle('open');
    backdrop.classList.toggle('open', open);
    _setTopbarShift(open);
    if (typeof closeHubMenu === 'function') closeHubMenu();
    if (open) _updateTourLockState();
  }

  function close() {
    const panel = sh('profile-panel');
    const backdrop = sh('profile-panel-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    _setTopbarShift(false);
    _collapseTourSections();
  }

  /** v8.29.0 — costruisce la lista di voci da mostrare, nell'ordine:
   *  Tour completo (sempre) → sezioni di TOUR_SECTION_DEFS con almeno
   *  1 passo per il ruolo corrente. Conteggi presi dal vivo da
   *  OnboardingTour (mai hardcoded): restano corretti anche se in
   *  futuro cambia il numero di passi di una sezione. */
  function _tourSectionsFor() {
    const hasOT = (typeof OnboardingTour !== 'undefined');
    const total = hasOT ? OnboardingTour.sectionTotal() : 0;
    const list = [{
      key: 'tutto', icon: 'ti-map-2', label: 'Tour completo', primary: true, exits: true,
      count: total,
      exitIcon: '🧭', exitTitle: 'Rivedere il tour guidato?',
      exitMsg: _isDir
        ? 'Il tour guidato ripartirà dall\u2019inizio e tornerai alla Dashboard Direttore.'
        : 'Il tour guidato ripartirà dall\u2019inizio e uscirai da questa aula per tornare alla scelta delle aule.'
    }];
    TOUR_SECTION_DEFS.forEach(def => {
      const n = hasOT ? OnboardingTour.sectionCount(def.key) : 0;
      if (n > 0) list.push(Object.assign({}, def, { count: n }));
    });
    return list;
  }

  function _renderTourSections() {
    const box = sh('pp-tour-sections');
    if (!box) return;
    const items = _tourSectionsFor();
    _tourItemsCache = items;
    box.innerHTML = items.map((it, i) => {
      const sep = (i > 0 && items[i - 1].exits && !it.exits) ? '<div class="pp-tour-sep"></div>' : '';
      const countTxt = it.key === 'tutto' ? (it.count + ' passaggi · da capo') : (it.count + ' passaggi');
      return sep +
        '<button type="button" class="pp-tour-item' + (it.primary ? ' pp-tour-primary' : '') + '" data-idx="' + i + '">' +
          '<i class="ti ' + it.icon + ' pp-tour-icon"></i>' +
          '<span class="pp-tour-label">' + it.label + '<span class="pp-tour-count">' + countTxt + '</span></span>' +
        '</button>';
    }).join('');
    box.querySelectorAll('.pp-tour-item').forEach(btn => {
      btn.addEventListener('click', () => _handleTourSectionClick(_tourItemsCache[+btn.dataset.idx]));
    });
  }

  /** Chiude (senza riaprirla) la lista sezioni — chiamata da close()
   *  cosicché il pannello si presenti sempre collassato alla riapertura. */
  function _collapseTourSections() {
    _tourSectionsOpen = false;
    const btn = sh('pp-tour-toggle-btn');
    const box = sh('pp-tour-sections');
    if (box) box.classList.remove('open');
    if (btn) { btn.classList.remove('expanded'); btn.setAttribute('aria-expanded', 'false'); }
  }

  /** v8.29.2 — bug segnalato: durante un minigioco o una sessione Flip
   *  Card attiva, "Rivedi il tour guidato" restava cliccabile: avviare
   *  una sezione da lì naviga via (showScreen/goStep, o uscita
   *  dall'aula) SENZA passare dalla conferma "Uscire dalla partita?"
   *  già esistente per ogni altra uscita da un gioco attivo — si
   *  perdeva la sessione in corso senza preavviso. Riusa isGameActive()
   *  (minigiochi, già in game-engine-state.js) e isFlipCardActive()
   *  (Flip Card, già in flip-card.js) — nessuna nuova rilevazione di
   *  stato, solo il gate qui. */
  function _isSessionActive() {
    return (typeof isGameActive === 'function' && isGameActive())
        || (typeof isFlipCardActive === 'function' && isFlipCardActive());
  }

  /** Ricalcolato a ogni apertura del pannello (vedi toggle()): lo stato
   *  del gioco può cambiare tra un'apertura e l'altra. */
  function _updateTourLockState() {
    const btn = sh('pp-tour-toggle-btn');
    if (!btn) return;
    const locked = _isSessionActive();
    btn.classList.toggle('pp-tour-locked', locked);
    btn.setAttribute('aria-disabled', locked ? 'true' : 'false');
    btn.title = locked ? 'Non disponibile durante una sessione di gioco o Flip Card attiva' : '';
  }

  /** Tasto "Rivedi il tour guidato": apre/chiude la lista invece di
   *  avviare subito il tour intero (v8.29.0). I conteggi sono ricalcolati
   *  a ogni apertura: costo trascurabile, sempre aggiornati. */
  function toggleTourSections() {
    if (_isSessionActive()) return; // difesa in profondità, oltre a pointer-events:none in CSS
    const btn = sh('pp-tour-toggle-btn');
    const box = sh('pp-tour-sections');
    if (!btn || !box) return;
    if (!_tourSectionsOpen) _renderTourSections();
    _tourSectionsOpen = !_tourSectionsOpen;
    box.classList.toggle('open', _tourSectionsOpen);
    btn.classList.toggle('expanded', _tourSectionsOpen);
    btn.setAttribute('aria-expanded', _tourSectionsOpen ? 'true' : 'false');
  }

  /** v8.29.0 — 'tutto' richiama restartTour() invariata. Le sezioni con
   *  exits:true (solo 'aule', Direttore) chiedono la stessa conferma e
   *  poi navigano come restartTour(); le altre (minigiochi/didattica/
   *  hub/profilo) partono sul posto: OnboardingTour.startSection() basta
   *  da solo perché la screen di partenza di quei passi è già
   *  'homeCategory', la stessa da cui si apre questo pannello. */
  async function _handleTourSectionClick(it) {
    if (!it) return;
    if (it.key === 'tutto') { await restartTour(); return; }

    if (it.exits) {
      close();
      const ok = await ppConfirmBox(it.exitMsg, {
        title: it.exitTitle, icon: it.exitIcon,
        yesLabel: 'Sì, rivedi il tour', noLabel: 'Annulla'
      });
      if (!ok) return;
      if (typeof resetSessionState === 'function') resetSessionState();
      if (typeof OnboardingTour !== 'undefined') OnboardingTour.startSection(it.key);
      if (typeof openDirectorDashboard === 'function') openDirectorDashboard();
      return;
    }

    // v8.29.3 — bug segnalato: le 4 sezioni "sul posto" presuppongono di
    // essere già dentro un'aula/modulo (vivono tutte in 'homeCategory').
    // Se il pannello profilo è raggiungibile anche PRIMA di essere
    // entrati in un'aula in questa sessione (es. Direttore dalla
    // Dashboard, Docente da scelta-aula/scelta-modulo), il click non
    // faceva nulla — startSection() falliva in silenzio, la stessa
    // confusione già vista nel bug precedente. activeCourseId (già
    // esistente in game-engine-state.js, null = nessuna aula
    // selezionata) distingue questo caso: qui si avvisa esplicitamente
    // invece di tentare una navigazione che non porterebbe da nessuna
    // parte. "Tour completo" e "Gestione Aule e Docenti" NON hanno
    // questo controllo: portano entrambi a scelta-aula/Dashboard, dove
    // funzionano comunque, aula attiva o no.
    if (typeof activeCourseId === 'undefined' || !activeCourseId) {
      await ppConfirmBox('Devi prima entrare in un\u2019aula per avviare questa sezione del tour.', {
        title: 'Entra prima in un\u2019aula', icon: '🏫',
        yesLabel: 'Ho capito', forceConfirm: true
      });
      return;
    }

    close();
    if (typeof OnboardingTour !== 'undefined') OnboardingTour.startSection(it.key);
    // v8.29.1 — bug segnalato: le sezioni "sul posto" non partivano se il
    // pannello profilo veniva aperto da una schermata diversa da quella
    // con le card categoria (es. da dentro l'Hub o un minigioco) — il
    // target del primo passo non era ancora visibile, startSection()
    // falliva in silenzio. Fix: ci si assicura sempre di essere su
    // tab-home/step-cat prima di avviare — goStep('cat') richiama GIÀ da
    // solo OnboardingTour.showHomeCategoryStep() dopo 300ms (vedi
    // game-engine-state.js), che ritenta il render con l'idx nel
    // frattempo già impostato da startSection() qui sopra. Nessun nuovo
    // hook: stesso identico meccanismo già usato da ogni altro passo.
    if (typeof showScreen === 'function' && typeof goStep === 'function') {
      showScreen('tab-home');
      goStep('cat');
    }
  }

  /** "Rivedi il tour guidato" — riazzera lo stato del tour e riporta
   *  l'utente alla schermata iniziale del proprio ruolo (Dashboard per
   *  il Direttore, scelta aula per il Docente), esattamente come al
   *  primo accesso. Il tasto profilo vive solo nella topbar di gioco,
   *  quindi questa azione esce sempre dall'aula corrente — per questo
   *  chiede sempre conferma, con un solo dialogo (niente doppie
   *  conferme sommate a quelle già esistenti per il cambio aula). */
  async function restartTour() {
    close();
    const msg = _isDir
      ? 'Il tour guidato ripartirà dall\u2019inizio e tornerai alla Dashboard Direttore.'
      : 'Il tour guidato ripartirà dall\u2019inizio e uscirai da questa aula per tornare alla scelta delle aule.';
    const ok = await ppConfirmBox(msg, {
      title: 'Rivedere il tour guidato?',
      icon: '🧭',
      yesLabel: 'Sì, rivedi il tour',
      noLabel: 'Annulla'
    });
    if (!ok) return;

    if (typeof resetSessionState === 'function') resetSessionState();
    if (typeof OnboardingTour !== 'undefined') OnboardingTour.reset();

    if (_isDir) {
      if (typeof openDirectorDashboard === 'function') openDirectorDashboard();
      return;
    }

    if (typeof setCoursesScreenMode === 'function') setCoursesScreenMode('select');
    const appEl = document.querySelector('.app');
    if (appEl) appEl.style.display = 'none';
    const cs = sh('screen-courses');
    if (cs) {
      cs.classList.remove('hidden');
      cs.classList.add('entering');
      setTimeout(() => cs.classList.remove('entering'), 400);
    }
    if (typeof OnboardingTour !== 'undefined') {
      setTimeout(() => OnboardingTour.showCoursesSelectStep(), 500);
    }
  }

  return { render, toggle, close, restartTour, toggleTourSections };
})();
window.ProfilePanel = ProfilePanel;
