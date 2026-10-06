/* ==================================================
   courses.js — PixelProf v5.1.1
   Course/classroom system: grid, CRUD, icon picker, course menu.
   v5.2.0 (giro colori 05/10): RIMOSSA la personalizzazione colore/sfondo
     dell'aula (voce menu "Personalizza colore", modale "Personalizza
     aula", COURSE_BG_PRESETS, COLOR_PALETTE, colorIdx/bgIdx, tinta
     #app-theme-bg): le card aula ora sono tutte uguali e prendono il
     colore dal tema (vedi pixelprof.css). Restano rinomina/icona/elimina.
   v5.1.0 (app v8.38.0): _enterCourseDirect() ora chiama anche
     _mergeCloudSessions/_mergeCloudModuleStats/_mergeCloudBadges
     (definite in stats.js/badges.js) accanto a _mergeCloudRoster —
     completano la sync cross-device di Progressi/Storico
     sessioni/Traguardi. Vedi sql/v8.38.0_progress_sessions_badges_sync.sql.
   v5.1.1 (app v8.39.0): _enterCourseDirect() chiama anche
     _loadModuleSeenCounts(id) (stats.js) — completamento preciso di
     "Progressi" (domande distinte viste). Vedi
     sql/v8.39.0_seen_questions_sync.sql.
   Cloud sync (DB.updateClassroom, _deleteClassroomRest,
   _reloadCourses, _applyModuleFilter) now embedded
   directly — no override chains from app.js.
   v5.0.7 FIX: enterCourse() (ramo "stessa aula attiva")
     ora attende _applyModuleFilter(id) PRIMA di chiamare
     _enterCourseDirect()/goHome(). In precedenza la UI
     veniva disegnata con il filtro moduli ancora in volo
     verso Supabase — la whitelist arrivava troppo tardi e
     nessuno richiamava un secondo render. Aggiunto lock
     anti-doppio-click (_enterCourseLock) sulla card aula
     durante il fetch, dato che ora c'è un await prima del
     nascondere screen-courses.
   v6.1.1 FIX: vedi setCoursesScreenMode() — badge "🛠️ Gestione"
     rimosso, form "Nuova aula" ora legato alla modalità corrente.
   Depends on: game-engine-state.js
================================================== */

const COURSE_ICONS=['🏫','📚','🎓','💡','🧠','⚡','🌐','💻','🔬','📡','🎯','🚀','🧩','📊','🏆','⭐','🔐','🛡️','📋','🧮'];

let _ddCourseId=null; // id del corso a cui appartiene il dropdown aperto

/* ==================================================
   MODALITÀ SCHERMATA AULE — v6.0.0 (Dashboard Direttore)
   _csMode = 'select' (default, invariato) → click sulla card = enterCourse()
   _csMode = 'manage' (da "Gestisci Aule")  → click sulla card = apre il
     pannello direttore (docenti+moduli) della stessa aula, riusando al
     100% dp-overlay/_dpLoadTeachers/_dpLoadTeacherSelect/_dpLoadModules
     già definiti in app.js. Zero duplicazione di logica.
   Il menu "..." (rinomina/icona/elimina) resta invariato e
   funzionante in ENTRAMBE le modalità.
   v6.1.1 FIX: rimosso il badge "🛠️ Gestione" (ridondante, il contesto
     è già chiaro dal titolo/back-link della schermata). Aggiunto il
     controllo di visibilità del form "Nuova aula": ora visibile SOLO
     in modalità 'manage' — evita un secondo percorso di creazione aula
     ridondante quando si è in 'select' (da "Scegli Aula").
================================================== */
let _csMode='select';
function setCoursesScreenMode(mode){
  _csMode=(mode==='manage')?'manage':'select';
  // v8.5.0: ogni nuovo ingresso in screen-courses azzera filtro/ricerca Area
  // (stesso ciclo di vita di _csMode) — vedi _csAreaFilterReset più sotto.
  _csAreaFilterReset();
  _csRenderAreaFilterBar();
  _csApplyAreaFilter();
  const addForm=document.getElementById('cs-add-form-wrap');
  if(addForm) addForm.classList.toggle('is-hidden-by-cs-mode', _csMode!=='manage');
  // v8.x: titolo/sottotitolo hero dinamici — 'manage' (Direttore → Gestisci Aule)
  // enfatizza creazione+assegnazione; 'select' (Docente, o Direttore → Scegli Aula)
  // resta la copy originale orientata all'ingresso in aula.
  const titleEl=document.getElementById('cs-courses-title');
  const subEl  =document.getElementById('cs-courses-sub');
  if(_csMode==='manage'){
    if(titleEl) titleEl.innerHTML='Seleziona o<br>crea <span class="hl">aula</span>';
    if(subEl)   subEl.textContent='Assegna docenti e moduli.';
  }else{
    if(titleEl) titleEl.innerHTML='Seleziona<br>la tua <span class="hl">aula</span>';
    if(subEl)   subEl.textContent='Ogni aula ha giocatori, classifiche e progressi dedicati.';
  }
}
function _csCardClick(id){
  // v6.0.1 FIX: _csMode è una variabile JS che NON viene resettata da un
  // logout/login nella stessa tab (SPA, nessun reload). Se un Direttore
  // lasciava _csMode='manage' (visitando "Gestisci Aule" senza poi tornare
  // su "Scegli Aula") e poi un Docente faceva login nella stessa tab, il
  // click sulla card apriva il pannello direttore invece di entrare in aula.
  // Guard: la modalità 'manage' è onorata SOLO se l'utente è realmente
  // Direttore — il ruolo è la fonte di verità, non lo stato residuo in RAM.
  if(_csMode==='manage' && window.Auth?.isDirector()){
    _dpClassroomId=id;
    document.getElementById('dp-overlay')?.classList.remove('hidden');
    const fb=document.getElementById('dp-invite-fb'); if(fb) fb.textContent='';
    Promise.all([_dpLoadTeachers(), _dpLoadTeacherSelect(), _dpLoadModules()]);
    return;
  }
  enterCourse(id);
}

function genCourseId(){return'c_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);}

function addCourse(){
  const inp=sh('cs-course-inp');
  const name=inp.value.trim();
  if(!name)return;
  const courses=loadCourses();
  const iconIdx=courses.length%COURSE_ICONS.length;
  const course={
    id:genCourseId(),
    name,
    icon:COURSE_ICONS[iconIdx],
    createdAt:Date.now()
  };
  courses.push(course);
  saveCourses(courses);
  inp.value='';
  renderCoursesGrid();
  setTimeout(()=>{
    const card=document.querySelector('[data-course-id="'+course.id+'"]');
    if(card)card.style.boxShadow='0 0 0 2px #4E7464';
    setTimeout(()=>{if(card)card.style.boxShadow='';},1200);
  },80);
}

/* ==================================================
   RAGGRUPPAMENTO PER AREA — v8.2.0 (ROADMAP_AREE.md Fase 3)
   renderCoursesGrid raggruppa le aule caricate per Area (AREAS,
   vedi js/areas-config.js) invece di un'unica griglia piatta.
   Ordine sezioni = ordine AREAS. Sezioni senza aule non vengono
   renderizzate (nessuno spazio vuoto in UI).
   Aule legacy senza areaKey → sezione ECDL. Stesso fallback già
   adottato dal wizard (Fase 2, _cw.area) e da _renderModuleFilter
   (Home, fix Bug B): ECDL è l'unica Area con moduli giocabili oggi,
   quindi è la lettura più corretta per le aule create prima del
   Sistema Aree — evita una sezione "Da classificare" fantasma per
   quella che sarà la stragrande maggioranza delle aule esistenti.
   Puramente di visualizzazione: non scrive alcun areaKey sul DB
   (vedi ROADMAP_AREE.md Fase 5 per l'eventuale backfill SQL).
================================================== */
function renderCoursesGrid(){
  const grid=sh('cs-grid');if(!grid)return;
  const courses=loadCourses();
  if(!courses.length){
    grid.innerHTML=`<div class="cs-empty">
      <div class="cs-empty-icon">🏫</div>
      <div class="cs-empty-text">Nessuna aula ancora.<br>Crea la prima per iniziare!</div>
    </div>`;
    _csRenderAreaFilterBar(); // nasconde la barra (0 aule) — v8.5.0
    return;
  }

  const byArea={};
  courses.forEach(c=>{
    const key=c.areaKey||'ecdl';
    (byArea[key]=byArea[key]||[]).push(c);
  });

  let gi=0; // indice globale — solo per lo stagger dell'animazione
  let html='';
  (window.AREAS||[]).forEach(area=>{
    const list=byArea[area.key];
    if(!list||!list.length)return;
    delete byArea[area.key];
    html+=_csBuildAreaSection(area.key,area.label,area.icon,list,()=>gi++);
  });
  // areaKey orfane (non presenti in AREAS, es. dati corrotti o Area
  // rimossa dalla config) — mostrate comunque in coda, mai perse.
  Object.keys(byArea).forEach(key=>{
    html+=_csBuildAreaSection(key,key,'🗂️',byArea[key],()=>gi++);
  });

  grid.innerHTML=html;

  _csRenderAreaFilterBar(); // v8.5.0 — ricostruisce chip/contatori sul DOM appena renderizzato
  _csApplyAreaFilter();
}

/* ==================================================
   FILTRO/RICERCA PER AREA — v8.5.0 (ROADMAP_AREE.md Fase 7.4)
   Barra sopra #cs-grid, SOLO Direttore (entrambe le modalità _csMode
   'select'/'manage' — vedi setCoursesScreenMode) — ricerca per nome
   aula + chip Area a selezione singola. Stato (_cafArea/_cafQuery)
   persiste tra i re-render dello stesso ingresso in schermata (CRUD
   aule chiamano renderCoursesGrid senza voler perdere il filtro) e
   viene azzerato solo da setCoursesScreenMode(), stesso ciclo di vita
   di _csMode.
   Pattern chip/interazione ripreso da .chd-wq-modfilter-btn
   (dashboard.js, "Domande difficili"); colori per-Area riusano
   --area-rgb già introdotto in Fase 7.1 (ridefinito qui sulle chip:
   elemento diverso da .cs-area-section, la custom property non
   eredita tra fratelli — vedi pixelprof.css). Il ruolo è sempre la
   fonte di verità, stesso guard già usato in _csCardClick.
================================================== */
let _cafArea='all', _cafQuery='';

function _csAreaFilterReset(){
  _cafArea='all'; _cafQuery='';
  const inp=document.getElementById('cs-area-filter-search-inp');
  if(inp) inp.value='';
  const clearBtn=document.getElementById('cs-area-filter-clear-btn');
  if(clearBtn) clearBtn.classList.add('hidden');
}

/** Solo per la label in chip: "Cybersecurity — Non solo..." → "Cybersecurity". Label completa invariata altrove. */
function _csAreaShortLabel(label){
  return String(label||'').split(' — ')[0];
}

/** Ricostruisce visibilità + chip della barra filtro in base a ruolo corrente e aule caricate. */
function _csRenderAreaFilterBar(){
  const bar=document.getElementById('cs-area-filterbar');
  if(!bar) return;
  const courses=loadCourses();
  const visible=!!(window.Auth?.isDirector() && courses.length);
  bar.classList.toggle('hidden', !visible);
  if(!visible) return;

  const byArea={};
  courses.forEach(c=>{ const k=c.areaKey||'ecdl'; byArea[k]=(byArea[k]||0)+1; });

  const chips=document.getElementById('cs-area-filter-chips');
  if(!chips) return;
  let html=`<button type="button" class="cs-area-filter-chip${_cafArea==='all'?' active':''}"
      data-area-key="all" onclick="_csAreaFilterPick('all')">
      <span>🗂️ Tutte</span><span class="cs-area-filter-chip-count">${courses.length}</span>
    </button>`;
  (window.AREAS||[]).forEach(area=>{
    const count=byArea[area.key]||0;
    if(!count) return; // niente chip per Aree senza aule — coerente con le sezioni (Fase 3)
    html+=`<button type="button" class="cs-area-filter-chip${_cafArea===area.key?' active':''}"
        data-area-key="${escAttr(area.key)}" onclick="_csAreaFilterPick('${escAttr(area.key)}')">
        <span>${area.icon} ${escHtml(_csAreaShortLabel(area.label))}</span>
        <span class="cs-area-filter-chip-count">${count}</span>
      </button>`;
  });
  chips.innerHTML=html;
}

function _csAreaFilterPick(key){
  _cafArea=key;
  document.querySelectorAll('#cs-area-filter-chips .cs-area-filter-chip').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.areaKey===key);
  });
  _csApplyAreaFilter();
}

function _csAreaFilterSearch(value){
  _cafQuery=String(value||'').trim().toLowerCase();
  const clearBtn=document.getElementById('cs-area-filter-clear-btn');
  if(clearBtn) clearBtn.classList.toggle('hidden', !_cafQuery);
  _csApplyAreaFilter();
}

function _csAreaFilterClear(){
  const inp=document.getElementById('cs-area-filter-search-inp');
  if(inp) inp.value='';
  _csAreaFilterSearch('');
}

/** Applica _cafArea/_cafQuery al DOM già renderizzato da renderCoursesGrid(). */
function _csApplyAreaFilter(){
  const grid=document.getElementById('cs-grid');
  if(!grid) return;
  const sections=grid.querySelectorAll('.cs-area-section');
  if(!sections.length) return; // 0 aule — stato vuoto già gestito da renderCoursesGrid

  // Il ruolo resta la fonte di verità (stesso guard di _csCardClick): un
  // filtro Direttore residuo in RAM non deve nascondere aule a un Docente.
  if(!window.Auth?.isDirector()){ _cafArea='all'; _cafQuery=''; }

  let anyVisible=false;
  sections.forEach(section=>{
    const areaMatches=(_cafArea==='all'||section.dataset.areaKey===_cafArea);
    let visibleInSection=0;
    section.querySelectorAll('.course-card').forEach(card=>{
      const name=(card.querySelector('.course-card-name')?.textContent||'').toLowerCase();
      const show=areaMatches&&(!_cafQuery||name.includes(_cafQuery));
      card.classList.toggle('caf-hidden', !show);
      if(show) visibleInSection++;
    });
    section.classList.toggle('caf-hidden', visibleInSection===0);
    if(visibleInSection>0) anyVisible=true;
  });

  const empty=document.getElementById('cs-grid-empty-filtered');
  if(empty) empty.classList.toggle('hidden', anyVisible);
}

/** Costruisce l'HTML di una sezione Area: header (icona+nome+contatore) + griglia aule. */
function _csBuildAreaSection(areaKey,areaLabel,areaIcon,list,nextIdx){
  const cardsHtml=list.map(c=>_csBuildCourseCard(c,nextIdx())).join('');
  return`<div class="cs-area-section" data-area-key="${escAttr(areaKey)}">
    <div class="cs-area-section-header">
      <span class="cs-area-section-icon">${areaIcon}</span>
      <span class="cs-area-section-label">${escHtml(areaLabel)}</span>
      <span class="cs-area-section-count">${list.length}</span>
    </div>
    <div class="cs-grid">${cardsHtml}</div>
  </div>`;
}

/** Costruisce l'HTML di una singola course-card. Logica invariata rispetto a prima di v8.2.0 — solo estratta in funzione per essere riusabile per-sezione. */
function _csBuildCourseCard(c,i){
  const fmtDate=d=>{
    if(!d) return null;
    try{
      const dt=new Date(d);
      if(isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'2-digit'});
    }catch{return d;}
  };
  const startFmt=fmtDate(c.startDate);
  const endFmt  =fmtDate(c.endDate);
  const dateRow = (startFmt||endFmt)
    ? `<div class="course-card-dates"><i class="ti ti-calendar" style="font-size:9px;opacity:.5"></i> ${startFmt||'—'} → ${endFmt||'—'}</div>`
    : `<div class="course-card-meta">Creata il ${new Date(c.createdAt||Date.now()).toLocaleDateString('it-IT',{day:'2-digit',month:'short'})}</div>`;
  const timeRow = c.timeSlot
    ? `<div class="course-card-time"><i class="ti ti-clock" style="font-size:10px;opacity:.5"></i> ${escHtml(c.timeSlot)}</div>`
    : '';
  const teacherChips=(c._teachers||[])
    .filter(t=>t.role!=='director')
    .map(t=>`<span class="course-card-teacher-chip">${escHtml(t.name||'')}</span>`)
    .join('');
  const teachersRow=teacherChips
    ?`<div class="course-card-teachers">${teacherChips}</div>`:'';
  return`<div class="course-card" data-course-id="${escAttr(c.id)}"
    style="animation-delay:${i*0.04}s"
    onclick="_csCardClick('${escAttr(c.id)}')"
  >
    <div class="course-card-top">
      <span class="course-card-icon">${c.icon}</span>
      <div class="course-card-name">${escHtml(c.name)}</div>
      <button class="course-card-menu" onclick="event.stopPropagation();openCourseMenu('${escAttr(c.id)}',this)" title="Opzioni" aria-label="Opzioni aula" style="position:static;flex-shrink:0">⋯</button>
    </div>
    <div class="course-card-middle">
      ${dateRow}
      ${timeRow}
    </div>
    ${teachersRow}
  </div>`;
}

/* ==================================================
   enterCourse — v4.0.6
   Incorpora la logica cloud di app.js (appState,
   location.reload per aula diversa, _applyModuleFilter).
   Nessuna override chain necessaria.
================================================== */
let _enterCourseLock=false;
async function enterCourse(id){
  if(_enterCourseLock)return; // evita doppio ingresso se l'utente clicca 2 volte durante il fetch Supabase
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  if(!course)return;

  // Stessa aula già attiva → entra direttamente senza reload
  if(id===activeCourseId){
    if(window.appState) window.appState.classroom=course;
    _enterCourseLock=true;
    const card=document.querySelector('[data-course-id="'+id+'"]');
    if(card)card.style.opacity='.55';
    try{
      // v5.0.7 FIX: attende la risposta Supabase (getEnabledModules) PRIMA
      // di mostrare l'aula. In precedenza _enterCourseDirect()→goHome() disegnava
      // la UI in modo sincrono mentre _applyModuleFilter girava ancora in background:
      // il filtro arrivava dopo che step-mod era già stato renderizzato, e nessuno
      // richiamava un secondo render — risultato: tutti i moduli visibili o stato
      // dell'aula precedente, indipendentemente dalla whitelist Supabase.
      await _applyModuleFilter(id);
      _enterCourseDirect(id);
    }finally{
      _enterCourseLock=false;
      if(card)card.style.opacity='';
    }
    return;
  }

  // Aula diversa → salva la scelta e ricarica la pagina per stato JS pulito
  try{ sessionStorage.setItem('pp_pending_course',id); }catch(e){}
  location.reload();
}

/* Logica DOM pura dell'ingresso in un'aula (ex corpo di enterCourse). */
function _enterCourseDirect(id){
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  if(!course)return;
  activeCourseId=id;
  window.activeCourseId=id; // v8.37.2 — FIX: window.activeCourseId non veniva MAI impostato,
  // solo la variabile locale activeCourseId (let, visibile agli script classici ma non ai
  // moduli ES). _classId() in game_hooks.js legge window.activeCourseId: senza questa riga
  // tutti gli hook cloud (leaderboard, sessioni, statistiche, domande sbagliate) restavano
  // sempre "offline" silenziosamente — bug segnalato da Erasmo su wrong_questions vuota.
  db=loadCourseData(id);
  _mergeCloudRoster(id); // v8.37.3 — fire-and-forget, vedi sotto
  _mergeCloudSessions(id); // v8.38.0 — idem, definita in stats.js (serve presto per i traguardi)
  _mergeCloudModuleStats(id); // v8.38.0 — idem, definita in stats.js
  _mergeCloudBadges(id); // v8.38.0 — idem, definita in badges.js (prima del 1° checkAndShowNewBadges)
  _loadModuleSeenCounts(id); // v8.39.0 — idem, definita in stats.js (completamento preciso "Progressi")
  // v8.25.0: registra questa come ultima aula collegata per il
  // pannello Profilo (fire-and-forget, vedi js/profile-panel.js).
  if(window.Auth && window.Auth.touchLoginMeta) window.Auth.touchLoginMeta(id);

  const badge=sh('tb-course-badge');
  const badgeIcon=sh('tb-course-icon');
  const badgeName=sh('tb-course-name');
  if(badge&&badgeIcon&&badgeName){
    badgeIcon.textContent=course.icon;
    badgeName.textContent=course.name;
    badge.style.display='flex';
  }

  sh('screen-courses').classList.add('hidden');
  const app=document.querySelector('.app');
  app.style.display='';
  app.style.opacity='0';
  app.style.transform='scale(.97)';
  requestAnimationFrame(()=>{
    app.style.transition='opacity .35s ease, transform .35s cubic-bezier(.22,1,.36,1)';
    app.style.opacity='1';
    app.style.transform='scale(1)';
    setTimeout(()=>{app.style.transition='';},400);
  });
  closeCourseMenu();
  goHome();
}

/**
 * v8.37.3 — completa il gap trovato da Erasmo: window.DB.loadPlayers/
 * loadTeams esistevano già in db_adapter.js (usate solo internamente da
 * getClassroomOverview per le statistiche) ma non erano mai collegate
 * all'ingresso in aula — db.players/db.teams restavano quindi solo
 * quelli salvati in locale su QUESTO dispositivo, anche se altri
 * giocatori/squadre esistevano già su Supabase (aggiunti da un altro
 * PC). Fire-and-forget, non blocca l'ingresso in aula: unisce (non
 * sostituisce) i nomi dal cloud a quelli già locali, poi salva e
 * ri-renderizza i chip SOLO se il pannello è già visibile.
 */
async function _mergeCloudRoster(id){
  if(!window.DB?.loadPlayers || !window.DB?.loadTeams) return;
  let cloudPlayers, cloudTeams;
  try{
    [cloudPlayers, cloudTeams] = await Promise.all([
      window.DB.loadPlayers(id),
      window.DB.loadTeams(id),
    ]);
  }catch(err){
    console.warn('[PixelProf] _mergeCloudRoster errore:', err);
    return;
  }
  if(activeCourseId!==id) return; // l'utente ha già cambiato aula nel frattempo
  let changed=false;
  (cloudPlayers||[]).forEach(name=>{
    if(name && !db.players.includes(name)){ db.players.push(name); changed=true; }
  });
  (cloudTeams||[]).forEach(t=>{
    if(t?.name && !db.teams.find(x=>x.name===t.name)){ db.teams.push({name:t.name,color:t.color}); changed=true; }
  });
  if(changed){
    save();
    if(sh('ind-chips')) renderIndChips();
  }
}

/* -- Course dropdown menu -- */
function openCourseMenu(id,triggerEl){
  _ddCourseId=id;
  const dd=sh('course-dropdown');
  dd.classList.remove('hidden');
  const manageItem=sh('cd-manage');
  if(manageItem) manageItem.style.display=window.Auth?.isDirector()?'':'none';
  const rect=triggerEl.getBoundingClientRect();
  dd.style.top=(rect.bottom+6)+'px';
  dd.style.left=Math.min(rect.left, window.innerWidth-180)+'px';
  setTimeout(()=>document.addEventListener('click',closeCourseMenuOutside,{once:true}),10);
}

function _cdManage(){
  const id=_ddCourseId;
  closeCourseMenu();
  if(!id) return;
  _dpClassroomId=id;
  sh('dp-overlay').classList.remove('hidden');
  sh('dp-invite-fb').textContent='';
  Promise.all([_dpLoadTeachers(), _dpLoadTeacherSelect(), _dpLoadModules()]);
}

function closeCourseMenuOutside(e){
  const dd=sh('course-dropdown');
  if(dd&&!dd.contains(e.target))closeCourseMenu();
}
function closeCourseMenu(){sh('course-dropdown').classList.add('hidden');_ddCourseId=null;}

/* ==================================================
   cdAction — v4.0.6
   Incorpora la propagazione cloud di app.js.
   Nessuna override chain necessaria.
================================================== */
async function cdAction(action){
  const id=_ddCourseId;
  closeCourseMenu();
  if(!id)return;
  const courses=loadCourses();
  const idx=courses.findIndex(c=>c.id===id);
  if(idx<0)return;

  if(action==='rename'){
    const newName=await ppPromptBox('Inserisci il nuovo nome per questa aula.', courses[idx].name, { title:'Rinomina aula', icon:'✏️', maxlength:40 });
    if(!newName)return;
    // Aggiorna localStorage
    courses[idx].name=newName.trim();
    saveCourses(courses);
    renderCoursesGrid();
    // Propaga al cloud se disponibile
    if(window.DB && window.Auth?.getUserId()){
      await window.DB.updateClassroom(id, { name: newName.trim() });
      await _reloadCourses();
    }
  } else if(action==='icon'){
    openIconPicker(id);
  } else if(action==='delete'){
    _showDeleteClassroomConfirm(id, courses[idx].name, async ()=>{
      const delRes=await _deleteClassroomRest(id);
      if(!delRes.ok){
        let errMsg=delRes.error||'errore sconosciuto';
        try{
          const m=errMsg.match(/\{.*\}/s);
          if(m){ const p=JSON.parse(m[0]); if(p.message) errMsg=p.message; }
        }catch(e){}
        await ppAlert('Impossibile eliminare l\'aula.\n\n'+errMsg+'\n\nEsegui la SQL director_delete_classroom nel Supabase SQL Editor.', { title:'Eliminazione non riuscita', icon:'❌' });
        return;
      }
      if(activeCourseId===id){
        activeCourseId=null;
        window.activeCourseId=null; // v8.37.2 — vedi fix gemello sopra in _enterCourseDirect
        if(window.appState) window.appState.classroom=null;
        db=makeEmptyDb();
        goCoursesFromApp();
      }
      await _reloadCourses();
    });
  }
}

/* -- Icon picker -- */
let _ipCourseId=null;
function openIconPicker(id){
  _ipCourseId=id;
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  const grid=sh('icp-grid');
  grid.innerHTML=COURSE_ICONS.map(ic=>`<button class="icp-btn${course&&course.icon===ic?' selected':''}" onclick="pickIcon('${escAttr(ic)}')">${ic}</button>`).join('');
  sh('icon-picker-overlay').classList.remove('hidden');
}

/* ==================================================
   pickIcon — v4.0.6
   Incorpora DB.updateClassroom + _reloadCourses di app.js.
================================================== */
async function pickIcon(icon){
  const courses=loadCourses();
  const idx=courses.findIndex(c=>c.id===_ipCourseId);
  if(idx<0)return;
  // Salva l'id prima di closeIconPicker() che azzera _ipCourseId
  const courseId=_ipCourseId;
  courses[idx].icon=icon;
  saveCourses(courses);
  closeIconPicker();
  renderCoursesGrid();
  // Propaga al cloud e poi ricarica (await garantisce che il cloud sia aggiornato
  // prima che _reloadCourses sovrascriva il localStorage con i dati del server)
  if(window.DB && courseId){
    await window.DB.updateClassroom(courseId, { icon }).catch(e=>console.error('[PixelProf] pickIcon cloud error:',e));
    await _reloadCourses();
  }
}
function closeIconPicker(){sh('icon-picker-overlay').classList.add('hidden');_ipCourseId=null;}
