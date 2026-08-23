/* ==================================================
   onboarding.js — PixelProf v2.2.0
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

   v2.1.0 — Fase 7.3 Sistema Aree (ROADMAP_AREE.md): il tour non
     menzionava mai il concetto di "Area" introdotto nelle Fasi 2-4,
     né nel wizard, né in "Scegli Aula", né in "Scheda Docente".
     Solo testo dei passi aggiornato (nessun nuovo screen/hook):
       - DIRECTOR_STEPS[1] (wizard/#cs-add-form-wrap): corretto
         "tre semplici passi" → "quattro passi" (nome, area, moduli,
         docenti) — il conteggio era rimasto quello pre-Fase 2.
       - DIRECTOR_STEPS[5] (teacherMgmt/.dd-teacher-list): aggiunto
         cenno al raggruppamento per area delle aule in Scheda Docente.
       - DIRECTOR_STEPS[8] e TEACHER_STEPS[0] (entrambi
         coursesSelect/.course-card): aggiunto cenno al raggruppamento
         per area in "Scegli Aula" (Fase 3).
     Deliberatamente NON aggiunto un passo dedicato dentro il modale
     wizard (step Area vero e proprio) né dentro "Scheda Docente"
     (blocchi .tdc-area-block): il primo richiederebbe scriptare la
     validazione di nome/date/orari obbligatori dello step 1 per poter
     avanzare; il secondo richiederebbe almeno un docente già esistente,
     non garantito nel percorso di primo accesso Direttore (il passo
     "Nuovo Docente" del tour è 'info', non crea davvero un account).
     Entrambi restano possibili in un secondo momento se richiesti
     esplicitamente.

   v2.1.1 — richiesta esplicita utente: le 6 aree didattiche sono ora
     considerate tutte attive (i JSON dei contenuti arrivano
     progressivamente). Rimosso l'unico residuo testuale non generico:
     DIRECTOR_STEPS[9] e TEACHER_STEPS[1] (entrambi homeModule) dicevano
     "alcuni moduli ICDL", presupponendo che tutti i moduli appartenessero
     all'area ECDL — non più vero con Cybersecurity/Reti/Malware/
     Cyberbullismo/AI. Testo generalizzato a "alcuni moduli" (invariato
     tutto il resto: nessun nuovo screen/hook, nessun riferimento
     hardcoded al nome o al conteggio delle aree). Scelta deliberata,
     richiesta esplicitamente: così facendo il tour NON necessita più
     di aggiornamenti quando in futuro verrà aggiunta una nuova area in
     js/areas-config.js — a differenza di altri punti dell'app (es. i
     filtri Dashboard) che invece enumerano le aree esplicitamente.

   v2.1.2 — bug segnalato (solo Direttore): nei passi 'info' il target
     restava coperto dal velo scuro sfocato (by design, v2.0.0) — si
     vedeva solo il bordo dell'anello su sfondo nero, senza distinguere
     cosa venisse indicato. Richiesta esplicita utente: "uguale alle
     altre, stesso comportamento di docente" (cioè come i passi
     'action' già esistenti, e come l'unico passo analogo già presente
     in TEACHER_STEPS — "Scegli il modulo", già di tipo 'action').
       - DIRECTOR_STEPS[4] .dd-new-teacher, [5] .dd-teacher-list,
         [9] .mod-grid: da 'info' ad 'action'. Target singoli con
         un'azione univoca (aprono un'altra schermata/vista) — il
         motore del tour già gestisce il caso in cui il target del
         passo successivo non sia immediatamente visibile dopo la
         navigazione (si riallinea al prossimo show*Step() rilevante),
         stesso meccanismo già in uso per gli altri passi 'action'.
       - DIRECTOR_STEPS[1] #cs-add-form-wrap: NON convertito ad
         'action'. Il target è l'intero form di creazione aula
         multi-campo (nome, area, moduli, docenti): un click reale in
         un punto qualsiasi al suo interno (es. il campo nome) non ha
         un significato univoco di "ho finito con questo passo", e
         avrebbe fatto avanzare il tour al passo successivo ("Tutto
         pronto ✅ — torna al pannello") ancora a wizard non concluso.
         Introdotta invece la proprietà revealTarget:true (solo per
         passi 'info'): il velo ottiene comunque il buco reale — il
         form torna visibile e utilizzabile, non più nascosto dietro
         un riquadro nero — ma l'avanzamento resta legato
         esclusivamente al pulsante "Avanti" del tooltip, non al click
         sul form. Vedi commento SEQUENZE sopra per il dettaglio.
       - DIRECTOR_STEPS[10] #tb-hub-btn (ultimo passo): lasciato
         invariato — resta 'info' esattamente come l'analogo ultimo
         passo di TEACHER_STEPS, quindi già "uguale al docente".

   v2.1.3 — bug segnalato: allo step 6 (.dd-teacher-list) il tour finiva
     fuori schermo, impossibile continuare. Causa: in _position(), il
     ramo top=union.bottom+18 non aveva un limite superiore — se il
     target è più alto del viewport (lista docenti lunga, dopo aver
     creato più account nei test), union.bottom supera
     window.innerHeight e il tooltip si piazza sotto il bordo visibile,
     irraggiungibile (bottoni "Avanti"/"Salta il tour" inclusi). Fix
     generale, non specifico a questo step: clamp finale che tiene il
     tooltip sempre dentro il viewport verticale, qualunque sia
     l'altezza del target — stesso principio già in uso per il clamp
     orizzontale (left) poco sotto.

   v2.1.4 — il fix v2.1.3 (clamp verticale) non risolveva il bug
     realmente segnalato: "step 6, tour fuori schermo, impossibile
     continuare" persisteva. Causa reale, diversa: il click-listener di
     avanzamento è registrato in CAPTURE-phase su document (vedi
     _renderStep sotto), quindi scatta PRIMA dell'onclick nativo
     dell'elemento (bubble-phase). .dd-teacher-list ha onclick="tmGoList()"
     e .dd-new-teacher onclick="tmGoCreate()" — entrambi nascondono
     screen-teacher-mgmt e mostrano un'altra sezione. _advance() calcolava
     "stesso screen del passo precedente" (vero, sono entrambi
     'teacherMgmt') e renderizzava SUBITO il passo successivo — ma in
     quel preciso istante l'onclick nativo non aveva ancora navigato,
     quindi il target risultava temporaneamente ancora visibile; un
     istante dopo l'onclick nativo eseguiva e la sezione spariva,
     lasciando l'anello/tooltip già posizionati orfani sulla schermata
     nuova. Fix in _advance(): il controllo di render viene rimandato di
     un tick (setTimeout 0) così avviene DOPO che l'intero dispatch del
     click, incluso l'onclick nativo, è già completato — vede quindi lo
     stato reale del DOM. Il fix v2.1.3 resta comunque valido come
     protezione generale per target più alti del viewport, indipendente
     da questo bug.

   v2.2.0 — richiesta esplicita utente: 2 nuovi step nel tour Direttore
     (ora 13 invece di 11), per coprire i pulsanti "indietro" delle due
     sottoschermate raggiunte dai passi 5 e 7 (ex 6):
       - Nuovo screen:'teacherCreate', target:'#screen-teacher-create
         .back-link' — inserito subito dopo ".dd-new-teacher" (nuovo
         passo 6/13). Aggancio in tmGoCreate() (js/app.js), stesso
         pattern già usato in openTeacherManagement().
       - Nuovo screen:'teacherList', target:'#screen-teacher-list
         .back-link' — inserito subito dopo ".dd-teacher-list" (nuovo
         passo 8/13). Aggancio in tmGoList() (js/app.js).
     Aggiunti showTeacherCreateStep()/showTeacherListStep() all'API
     pubblica, stesso pattern delle altre show*Step(). Entrambi i nuovi
     passi sono 'action' (si avanza cliccando il pulsante "← Docenti"
     stesso) — al ritorno sulla schermata teacherMgmt il tour si
     riallinea correttamente al passo successivo tramite l'hook già
     esistente in openTeacherManagement(). Il contatore "X di N" nel
     tooltip è calcolato dinamicamente da list.length: passa da solo a
     "di 13", nessun valore hardcoded da aggiornare altrove.

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
                           avanzare (nessun pulsante Avanti). Il
                           target ottiene sempre un buco reale nel
                           velo (vedi revealTarget).
               'info'   → si avanza col pulsante Avanti/Fatto. Di
                           default il target resta coperto dal velo
                           (solo l'anello lo indica visivamente) —
                           vedi revealTarget per il caso contrario.
       revealTarget  (opzionale, solo per passi 'info') → true forza
               comunque il buco reale nel velo (target visibile e
               fisicamente interagibile, es. digitabile) SENZA
               collegare il click all'avanzamento del tour, che
               resta legato solo al pulsante Avanti. Usato per i
               passi 'info' il cui target non è un singolo elemento
               con un'azione univoca (es. un form multi-campo): un
               click reale su un punto qualsiasi al suo interno non
               ha un significato univoco di "ho finito qui", quindi
               non deve far avanzare il tour da solo — ma il target
               non deve comunque restare nascosto dietro un riquadro
               nero (v2.1.2, richiesta esplicita utente).
  ================================================ */
  const DIRECTOR_STEPS = [
    { screen:'dashboard', target:'.dd-aule', type:'action',
      title:'Benvenuto in PixelProf! 👋',
      body:'Inizia da qui: premi su "Gestisci Aule" per creare la tua prima aula e scegliere quali moduli rendere disponibili ai docenti.' },
    { screen:'wizard', target:'#cs-add-form-wrap', type:'info', revealTarget:true,
      title:'Crea la tua prima aula 🏫',
      body:'Da qui avvii la creazione guidata in quattro passi: nome, area didattica, moduli abilitati e docenti da assegnare. L\'area scelta determina quali moduli saranno disponibili.' },
    { screen:'wizard', target:'#cs-back-dashboard-btn', type:'action',
      title:'Tutto pronto ✅',
      body:'Premi qui per tornare al pannello di controllo.' },
    { screen:'dashboard', target:'.dd-docenti', type:'action',
      title:'Gestisci i docenti 👩\u200d🏫',
      body:'Da qui puoi creare nuovi account e gestire quelli esistenti. Premi per continuare.' },
    { screen:'teacherMgmt', target:'.dd-new-teacher', type:'action',
      title:'Crea un nuovo account 🆕',
      body:'Qui puoi inserire un nuovo docente: bastano nome, cognome ed email — riceverà un invito automatico per impostare la password.' },
    { screen:'teacherCreate', target:'#screen-teacher-create .back-link', type:'action',
      title:'Puoi tornare indietro quando vuoi ↩️',
      body:'Se cambi idea, questo pulsante ti riporta alla gestione docenti senza creare nulla.' },
    { screen:'teacherMgmt', target:'.dd-teacher-list', type:'action',
      title:'Docenti già creati 👥',
      body:'Qui trovi i docenti già registrati: da ogni scheda puoi assegnarli alle aule già create (raggruppate per area didattica), modificarne i dati o disattivarli.' },
    { screen:'teacherList', target:'#screen-teacher-list .back-link', type:'action',
      title:'Torna alla gestione docenti ↩️',
      body:'Questo pulsante ti riporta al pannello principale della gestione docenti.' },
    { screen:'teacherMgmt', target:'#screen-teacher-mgmt .back-link', type:'action',
      title:'Torniamo alla dashboard ✅',
      body:'Premi qui per tornare al pannello di controllo.' },
    { screen:'dashboard', target:'.dd-scegli', type:'action',
      title:'Entra in un\'aula 🎮',
      body:'Da qui puoi accedere a un\'aula ed esercitarti esattamente come farebbe un docente.' },
    { screen:'coursesSelect', target:'.course-card', type:'action',
      title:'Scegli un\'aula 🏫',
      body:'Le aule sono raggruppate per area didattica: seleziona una qualsiasi aula tra quelle disponibili per continuare.' },
    { screen:'homeModule', target:'.mod-grid', type:'action',
      title:'Scegli il modulo 📚',
      body:'Ogni aula può abilitare solo alcuni moduli: qui vedi solo quelli disponibili per questa classe.' },
    { screen:'hub', target:'#tb-hub-btn', type:'info',
      title:'Il tuo Hub 🎯',
      body:'Classifica, Progressi, Storico, Panoramica Classe e Traguardi: tutto qui, in un solo tocco.' },
  ];

  const TEACHER_STEPS = [
    { screen:'coursesSelect', target:'.course-card', type:'action',
      title:'Benvenuto in PixelProf! 👋',
      body:'Le aule sono raggruppate per area didattica: scegli una qualsiasi aula tra quelle disponibili per iniziare a esercitarti.' },
    { screen:'homeModule', target:'.mod-card:not(.soon-card)', type:'action',
      title:'Scegli il modulo 📚',
      body:'Ogni aula può abilitare solo alcuni moduli: qui vedi solo quelli disponibili per questa classe.' },
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
    if (sameScreen || hubTarget) {
      // v2.1.4 — bug segnalato: "step 6, tour fuori schermo, impossibile
      // continuare". Causa: questo _advance() viene chiamato dal listener
      // di click in CAPTURE-phase (vedi sotto), che scatta PRIMA
      // dell'eventuale onclick nativo dell'elemento (bubble-phase). Per
      // target come .dd-teacher-list/.dd-new-teacher — stesso "screen"
      // del passo successivo, ma il cui onclick nativo (tmGoList(),
      // tmGoCreate()...) nasconde la sezione corrente e ne mostra
      // un'altra — renderizzare qui in modo sincrono catturava il DOM
      // ancora nello stato "vecchio" (pre-navigazione): il tooltip/anello
      // veniva posizionato su un target che, un istante dopo, spariva
      // dietro la nuova schermata — overlay orfano, mal posizionato,
      // apparentemente "fuori schermo". Rimandando di un tick (dopo che
      // l'intero dispatch sincrono del click, incluso l'onclick nativo,
      // è già completato) il controllo vede lo stato REALE del DOM: se
      // il target è sparito, non renderizza nulla (si riallinea più
      // tardi tramite l'hook già presente, es. openTeacherManagement());
      // se è ancora visibile, renderizza correttamente come prima.
      setTimeout(_tryRenderCurrentStep, 0);
    }
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
    // Passi 'info' con revealTarget:true ottengono comunque il buco reale
    // (target visibile/interagibile) ma NON il pulsante Avanti nascosto né
    // il listener di avanzamento-su-click: l'avanzamento resta legato
    // esclusivamente al pulsante "Avanti" del tooltip (v2.1.2).
    const isInteractive = isAction || def.revealTarget === true;

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

      // 'action' (sempre) e 'info' con revealTarget:true → buco reale nel
      // velo (target visibile e fisicamente interagibile). 'info' senza
      // revealTarget → nessun buco, il velo copre anche il target (resta
      // solo visivamente cerchiato dall'anello sopra).
      veil.style.clipPath = isInteractive ? _buildClipPath(rects, pad) : '';

      const ttRect = tooltip.getBoundingClientRect();
      const ttW = ttRect.width || 290, ttH = ttRect.height || 170;
      const spaceBelow = window.innerHeight - union.bottom;
      let top, arrowCls;
      if (spaceBelow > ttH + 28 || union.top < ttH + 28) {
        top = union.bottom + 18; arrowCls = 'onb-arrow-top';
      } else {
        top = union.top - ttH - 18; arrowCls = 'onb-arrow-bottom';
      }
      // Clamp verticale finale, sempre applicato: se il target è più alto
      // del viewport (es. .dd-teacher-list con molti docenti registrati),
      // union.bottom può superare window.innerHeight e mandare il tooltip
      // fuori schermo, irraggiungibile — tour bloccato. Il tooltip resta
      // sempre entro i bordi visibili, qualunque sia l'altezza del target
      // (v2.1.3, bug segnalato: "step 6, tour fuori schermo, impossibile
      // continuare").
      top = Math.max(12, Math.min(top, window.innerHeight - ttH - 12));
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
  function showTeacherCreateStep() { _tryRenderCurrentStep(); }
  function showTeacherListStep()   { _tryRenderCurrentStep(); }
  function showCoursesSelectStep() { _tryRenderCurrentStep(); }
  function showHomeModuleStep()    { _tryRenderCurrentStep(); }
  function showHomeCategoryStep()  { _tryRenderCurrentStep(); }
  function recheck()               { _tryRenderCurrentStep(); }

  return {
    init,
    showDashboardStep, showWizardStep, showTeacherMgmtStep,
    showTeacherCreateStep, showTeacherListStep,
    showCoursesSelectStep, showHomeModuleStep, showHomeCategoryStep,
    recheck, skip, reset,
  };
})();
window.OnboardingTour = OnboardingTour;
