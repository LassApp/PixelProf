/* ==================================================
   game-engine-state.js — PixelProf v5.0.6
   Core engine: loader factory, course storage, database,
   session state (QuizSession/FillSession/PlayerSession),
   matchState, TimerManager, PauseUIRegistry, helpers,
   navigation core, dialog system, module/activity selection,
   launch, team turn engine, score saving, ranking, leaderboard.
   Cloud hooks (hook_saveLbEntry, hook_saveSession,
   hook_ensureParticipants) now embedded directly —
   no override chains from app.js.
   Fase 8: PauseUIRegistry (M2), shq() (L1), _pauseForDialog
   refactored — zero hardcoding per gameType.
   Fase 9 / v5.0.0: P1 (add-sq-btn rimosso), P2 (mc-SS id),
   N1 (WP nel wizard). _updateAddSqBtn mantenuta come no-op.
   v5.0.1: N2 (rinomina squadra salvata — inline chip editor).
   v5.0.2: Delete giocatori/squadre salvati (inline × chip).
   v5.0.6: FIX allineamento con HTML/app.js v5.0.6 —
     - goStep(): aggiunto 'step-cat' all'array step da
       nascondere/mostrare; ramo s==='cat' popola
       cat-mod-label; ramo s==='mod' richiama
       window._renderModuleFilter() (sync, definita in
       app.js) per applicare il filtro moduli aula ad
       ogni ritorno in home — niente fetch di rete extra.
     - selMod(): inclusa 'WP' nel reset visivo delle card
       modulo attive (mancava); goStep('act') → goStep('cat')
       per passare dalla nuova schermata categoria
       (Minigiochi/Didattica) prima dell'attività.
     - goCoursesFromApp(): _execBack ora resetta
       window._activeModuleKeys = null prima di mostrare
       la grid aule, evitando che il filtro moduli
       dell'aula precedente "sanguini" su quella successiva.
   This is the central module — loaded before all games.
================================================== */

/* ==================================================
   LOADER FACTORY  v2.1.4
   Unica implementazione fetch+cache+error condivisa
   da tutti e 5 i minigiochi. Ogni gioco configura
   solo le proprie differenze (map, tag, validate,
   normalize). Zero duplicazione di boilerplate.
================================================== */

/**
 * Crea un loader autonomo per un minigioco.
 *
 * @param {object} cfg
 *   .moduleMap   {CE:path, OE:path, ...}
 *   .tag         stringa usata nei log  (es. 'Quiz')
 *   .validate    fn(raw)  true se il JSON  valido
 *   .normalize   fn(raw, mod)  array nel formato interno
 */
function _createLoader(cfg) {
  const cache = {};   // cache dedicata, isolata per ogni loader

  async function _loadOne(mod) {
    if (cache[mod]) return cache[mod];

    const rel = cfg.moduleMap[mod];
    if (!rel) throw new Error(`[${cfg.tag}] Modulo non registrato: "${mod}".`);

    const url = _resolveJsonPath(rel);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`[${cfg.tag}] HTTP ${resp.status} — ${url}`);

    let raw;
    try { raw = await resp.json(); }
    catch(e) { throw new Error(`[${cfg.tag}] JSON non valido in ${url}: ${e.message}`); }

    if (!cfg.validate(raw)) throw new Error(`[${cfg.tag}] Dati non validi o vuoti in ${url}`);

    cache[mod] = cfg.normalize(raw, mod);
    return cache[mod];
  }

async function load(mod) {
  return [...await _loadOne(mod)];
}

function isCached(mod) {
  return !!cache[mod];
}

  function isCached(mod) {
    return mod === 'MIX'
      ? !!(cache['CE'] && cache['OE'])
      : !!cache[mod];
  }

  // Espone il cache per logiche che devono ispezionarlo (es. getMatchSet MIX)
  function getCache() { return cache; }

  return { load, isCached, getCache, moduleMap: cfg.moduleMap };
}

/* ── LOADER REGISTRY v4.0.3 ────────────────────────────────────────
   5 loader unificati: CE / OE / WP nello stesso moduleMap.
   WP è ora un modulo standard — nessuna biforcazione speciale.
   Per aggiungere un nuovo modulo (es. SS): aggiungere riga qui + file JSON.
   ──────────────────────────────────────────────────────────────── */

/* -- Quiz -- */
const QuizLoader = _createLoader({
  moduleMap: {
    CE: 'data/quiz/computer_essentials.json',
    OE: 'data/quiz/online_essentials.json',
    WP: 'data/quiz/word_processing.json',
  },
  tag: 'Quiz',
  validate: raw => Array.isArray(raw) && raw.length > 0,
  normalize: (raw, mod) => raw.map(r => ({
    q: r.question, opts: r.options, a: r.correctIndex, exp: r.explanation, _src: mod,
  })),
});

/* -- Speed Quiz -- */
const SpeedQuizLoader = _createLoader({
  moduleMap: {
    CE: 'data/speed_quiz/computer_essentials.json',
    OE: 'data/speed_quiz/online_essentials.json',
    WP: 'data/speed_quiz/word_processing.json',
  },
  tag: 'SpeedQuiz',
  validate: raw => Array.isArray(raw) && raw.length > 0,
  normalize: (raw, mod) => raw.map(r => ({
    q: r.question, opts: r.options, a: r.correctIndex, exp: r.explanation, _src: mod,
  })),
});

/* -- Abbina -- */
const AbbinLoader = _createLoader({
  moduleMap: {
    CE: 'data/abbina/computer_essentials_abbina.json',
    OE: 'data/abbina/online_essentials_abbina.json',
    WP: 'data/abbina/word_processing_abbina.json',
  },
  tag: 'Abbina',
  validate: raw => raw && Array.isArray(raw.sets) && raw.sets.length > 0,
  normalize: (raw) => raw.sets.map(set =>
    set.map(pair => ({ t: pair.term, d: pair.definition }))
  ),
});

/* -- Memory -- */
const MemoryLoader = _createLoader({
  moduleMap: {
    CE: 'data/memory/computer_essentials_memory.json',
    OE: 'data/memory/online_essentials_memory.json',
    WP: 'data/memory/word_processing_memory.json',
  },
  tag: 'Memory',
  validate: raw => Array.isArray(raw) && raw.length > 0,
  normalize: (raw) => raw.map(r => [r.term, r.definition]),
});

/* -- Completa la frase -- */
const CompletaFraseLoader = _createLoader({
  moduleMap: {
    CE: 'data/completa_frase/computer_essentials_completa_frase.json',
    OE: 'data/completa_frase/online_essentials_completa_frase.json',
    WP: 'data/completa_frase/word_processing_completa_frase.json',
  },
  tag: 'CompletaFrase',
  validate: raw => Array.isArray(raw) && raw.length > 0,
  normalize: (raw) => raw.map(r => ({ t: r.sentence, b: r.answer, bank: r.bank })),
});

/* -- Alias pubblici — API invariata, WP ora gestito dal pipeline standard --
   WP viene caricato dai 5 loader unificati senza biforcazione speciale.    */
const loadPool             = mod => QuizLoader.load(mod);
const loadSpeedPool        = mod => SpeedQuizLoader.load(mod);
const loadAbbinSets        = mod => AbbinLoader.load(mod);
const loadMemoryPairs      = mod => MemoryLoader.load(mod);
const loadCompletaFrasePool= mod => CompletaFraseLoader.load(mod);

/* Helper sincrono  restituisce il modulo di una domanda */
function getQuestionModule(q) { return q._src || 'CE'; }

/* -- UI: loading spinners -- */
function _showLoadingSpinner(cont, icon, label, path) {
  const html = `
    <div class="result-wrap" style="text-align:center;padding:3rem 1rem">
      <div style="font-size:32px;margin-bottom:16px;animation:heroPulse 1s ease-in-out infinite alternate">${icon}</div>
      <div style="font-size:14px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px">${label}</div>
      <div style="font-size:11px;color:rgba(255,255,255,.25);font-family:'Share Tech Mono',monospace">${path}</div>
    </div>`;
  if(cont) cont.innerHTML = html;
  else {
    setTb(null); showScreen('tab-quiz');
    sh('qz-game').classList.add('hidden');
    sh('qz-result').classList.remove('hidden');
    sh('qz-result').innerHTML = html;
  }
}
function showQuizLoading(mod)      { _showLoadingSpinner(null,'📡','Caricamento domande…',      QuizLoader.moduleMap[mod]         || 'data/quiz/'); }
function showSpeedQuizLoading(mod) { _showLoadingSpinner(null,'⚡','Caricamento Speed Quiz…',   SpeedQuizLoader.moduleMap[mod]    || 'data/speed_quiz/'); }
function showAbbinLoading(cont,mod){ _showLoadingSpinner(cont,'🔗','Caricamento Abbina…',       AbbinLoader.moduleMap[mod]        || 'data/abbina/'); }
function showMemoryLoading(cont,mod){ _showLoadingSpinner(cont,'🃏','Caricamento Memory…',      MemoryLoader.moduleMap[mod]       || 'data/memory/'); }
function showCompletaFraseLoading(cont,mod){ _showLoadingSpinner(cont,'✏️','Caricamento Completa la frase…', CompletaFraseLoader.moduleMap[mod] || 'data/completa_frase/'); }

/* -- UI: error screens -- */
function _showGameError(cont, icon, title, color, path, msg) {
  const html = `
    <div class="result-wrap">
      <div class="result-hero">
        <span class="result-stars" style="font-size:36px">${icon}</span>
        <span class="result-score" style="font-size:20px;color:${color};line-height:1.3">${title}</span>
        <span class="result-label" style="color:${color}99;margin-top:8px;line-height:1.5">${escHtml(msg)}</span>
      </div>
      <p class="result-msg" style="margin-top:0">
        Verifica che i file siano presenti in
        <code style="color:${color};font-size:11px">${path}</code>
        e ricarica la pagina.
      </p>
      <div class="btn-row">
        <button class="btn btn-neon" onclick="goHome()"><i class="ti ti-home"></i> Torna alla home</button>
      </div>
    </div>`;
  if(cont){ gsSet(GS.IDLE); gameType=null; cont.innerHTML=html; }
  else {
    gsSet(GS.IDLE); gameType=null; setTb(null); showScreen('tab-quiz');
    sh('qz-game').classList.add('hidden');
    sh('qz-result').classList.remove('hidden');
    sh('qz-result').innerHTML=html;
  }
}
function showQuizLoadError(msg)        { _showGameError(null,  '⚠️','Errore caricamento quiz',          '#ff6b6b','data/quiz/',            msg); }
function showSpeedQuizError(msg)       { _showGameError(null,  '⚡','Speed Quiz non disponibile',        '#ffb400','data/speed_quiz/',      msg); }
function showAbbinError(msg)           { _showGameError(sh('g-area'),'🔗','Abbina non disponibile',      '#9d8fff','data/abbina/',          msg); }
function showMemoryError(cont,msg)     { _showGameError(cont,  '🃏','Memory non disponibile',            '#ff6b85','data/memory/',          msg); }
function showCompletaFraseError(msg)   { _showGameError(sh('g-area'),'✏️','Completa la frase non disponibile','#00cfff','data/completa_frase/', msg); }

/* Base URL calcolato una volta all'avvio  compatibile GitHub Pages.
   window.location.href non cambia durante la sessione. */
const _BASE_URL = (function() {
  return window.location.href
    .split('?')[0]
    .split('#')[0]
    .replace(/\/[^/]*$/, '/');
})();

function _resolveJsonPath(relativePath) {
  return _BASE_URL + relativePath;
}


/* ==================================================
   COURSES STORAGE  schema isolato per aula
   pp5_courses = [ { id, name, icon, color, bg, createdAt } ]
   pp5_cdata_{id} = { players, teams, lb2, stats }
================================================== */
const COURSES_KEY='pp5_courses';

let activeCourseId=null; // null = nessun corso selezionato

/* _coursesCache — v4.0.9 M4:
   Cache in memoria di loadCourses(). Evita 12+ JSON.parse(localStorage)
   ad ogni render/action in courses.js. Invalidata esplicitamente da
   saveCourses() ogni volta che la lista cambia. */
let _coursesCache = null;

function loadCourses(){
  if(_coursesCache) return _coursesCache;
  try{
    const s=localStorage.getItem(COURSES_KEY);
    _coursesCache = s ? JSON.parse(s) : [];
  }catch(e){ _coursesCache = []; }
  return _coursesCache;
}
function saveCourses(list){
  _coursesCache = list; // aggiorna cache — invalida il vecchio valore
  try{localStorage.setItem(COURSES_KEY,JSON.stringify(list));}catch(e){}
}
/** invalidateCoursesCache() — da chiamare quando il cloud sovrascrive
 *  localStorage (es. _reloadCourses in app.js). */
function invalidateCoursesCache(){ _coursesCache = null; }
function courseDataKey(id){return'pp5_cdata_'+id;}
function loadCourseData(id){
  try{
    const s=localStorage.getItem(courseDataKey(id));
    if(s){const p=JSON.parse(s);return migrateDb(p);}
  }catch(e){}
  return makeEmptyDb();
}
function saveCourseData(id,data){
  try{localStorage.setItem(courseDataKey(id),JSON.stringify(data));}catch(e){}
}
function deleteCourseData(id){
  try{localStorage.removeItem(courseDataKey(id));}catch(e){}
}

function makeEmptyDb(){
  return{players:[],teams:[],lb2:makeEmptyLb2(),sessions:[],stats:{tot:0,cor:0,byMod:{CE:{c:0,w:0},OE:{c:0,w:0},WP:{c:0,w:0}}}};
}


/* ==================================================
   DATABASE  caricato per corso attivo
================================================== */
const ACTIVITIES=['quiz','speed','match','memory','fill'];
const TYPES=['ind','sq'];

function makeEmptyLb2(){
  const lb2={};
  TYPES.forEach(t=>{lb2[t]={};ACTIVITIES.forEach(a=>{lb2[t][a]={};});});
  return lb2;
}

let db=makeEmptyDb();

/* save()  scrive sul corso attivo; no-op se nessun corso selezionato */
function save(){
  if(!activeCourseId)return;
  saveCourseData(activeCourseId,db);
}

function migrateDb(p){
  if(!p.lb2)p.lb2=makeEmptyLb2();
  TYPES.forEach(t=>{
    if(!p.lb2[t])p.lb2[t]={};
    ACTIVITIES.forEach(a=>{
      if(!p.lb2[t][a])p.lb2[t][a]={};
      Object.keys(p.lb2[t][a]).forEach(name=>{
        const entry=p.lb2[t][a][name];
        if(!entry.entries){
          p.lb2[t][a][name]={
            entries:[{pts:entry.pts||0,mod:entry.mod||'?',games:entry.games||1}],
            color:entry.color||null
          };
        }
      });
    });
  });
  if(!p.stats)p.stats={tot:0,cor:0,byMod:{CE:{c:0,w:0},OE:{c:0,w:0},WP:{c:0,w:0}}};
  if(!p.stats.byMod)p.stats.byMod={CE:{c:0,w:0},OE:{c:0,w:0},WP:{c:0,w:0}};
  if(!p.stats.byMod.WP)p.stats.byMod.WP={c:0,w:0};
  if(!p.players)p.players=[];
  if(!p.teams)p.teams=[];
  if(!p.sessions)p.sessions=[];
  return p;
}/* ==================================================
   GAME LIFECYCLE  v10 centralized state machine
   States: IDLE | PLAYING | PAUSED | FINISHED
================================================== */
const GS = {
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED'
};
let gameState = GS.IDLE;
let gameType = null; // 'quiz' | 'memory' | 'match' | 'fill'

function gsSet(state){ gameState = state; }
function gsIs(state){ return gameState === state; }
function gsIsActive(){ return gameState === GS.PLAYING || gameState === GS.PAUSED; }


/* ==================================================
   SESSION STATE  v4.0.5 — oggetti strutturati
   Pattern ispirato a matchState (già consolidato).
   Le variabili globali flat restano accessibili via
   alias window.* (defineProperties) — ZERO modifiche
   al resto del codice.
================================================== */

/* -- Setup selettore sessione (invariato) -- */
let sMod=null,sAct=null,sN=0,sMode=null,sIndPlayer=null,sTeams=[],sNumSelected=false;

/* -- Timer globale (deve restare let per stopTimer/clearInterval) -- */
let qTimerInt=null;

/* ── QuizSession — tutto lo stato del quiz corrente ── */
const QuizSession = {
  _defaults: {
    pool:[], idx:0, scores:{}, start:0, answered:false, speedLeft:0,
    streak:0, bestStreak:0, qStart:0,
    totalSpeedBonus:0, totalStreakBonus:0,
    answerLog:[]
    // [{questionId,correct,responseTimeMs,streak,speedBonus,streakBonus,scoreEarned}]
  },
  pool:[], idx:0, scores:{}, start:0, answered:false, speedLeft:0,
  streak:0, bestStreak:0, qStart:0,
  totalSpeedBonus:0, totalStreakBonus:0,
  answerLog:[],
  reset(){
    this.pool=[];this.idx=0;this.scores={};this.start=0;
    this.answered=false;this.speedLeft=0;
    this.streak=0;this.bestStreak=0;this.qStart=0;
    this.totalSpeedBonus=0;this.totalStreakBonus=0;
    this.answerLog=[];
  }
};

/* ── FillSession — stato Completa la frase ── */
const FillSession = {
  streak:0, bestStreak:0, totalScore:0, answerLog:[],
  reset(){
    this.streak=0;this.bestStreak=0;this.totalScore=0;this.answerLog=[];
  }
};

/* ── PlayerSession — giocatori attivi nel turno ── */
const PlayerSession = {
  list:[], prevRank:[],
  reset(){ this.list=[];this.prevRank=[]; }
};

/* ── Alias window.* — retrocompatibilità totale ──
   Tutto il codice esistente che scrive/legge qPool,
   players, fillStreak, ecc. funziona invariato. */
Object.defineProperties(window, {
  qPool:            { get(){ return QuizSession.pool;             }, set(v){ QuizSession.pool=v;             }, configurable:true, enumerable:true },
  qIdx:             { get(){ return QuizSession.idx;              }, set(v){ QuizSession.idx=v;              }, configurable:true, enumerable:true },
  qScores:          { get(){ return QuizSession.scores;           }, set(v){ QuizSession.scores=v;           }, configurable:true, enumerable:true },
  qStart:           { get(){ return QuizSession.start;            }, set(v){ QuizSession.start=v;            }, configurable:true, enumerable:true },
  qAnswered:        { get(){ return QuizSession.answered;         }, set(v){ QuizSession.answered=v;         }, configurable:true, enumerable:true },
  qSpeedLeft:       { get(){ return QuizSession.speedLeft;        }, set(v){ QuizSession.speedLeft=v;        }, configurable:true, enumerable:true },
  qStreak:          { get(){ return QuizSession.streak;           }, set(v){ QuizSession.streak=v;           }, configurable:true, enumerable:true },
  qBestStreak:      { get(){ return QuizSession.bestStreak;       }, set(v){ QuizSession.bestStreak=v;       }, configurable:true, enumerable:true },
  qQStart:          { get(){ return QuizSession.qStart;           }, set(v){ QuizSession.qStart=v;           }, configurable:true, enumerable:true },
  qTotalSpeedBonus: { get(){ return QuizSession.totalSpeedBonus;  }, set(v){ QuizSession.totalSpeedBonus=v;  }, configurable:true, enumerable:true },
  qTotalStreakBonus: { get(){ return QuizSession.totalStreakBonus; }, set(v){ QuizSession.totalStreakBonus=v; }, configurable:true, enumerable:true },
  qAnswerLog:       { get(){ return QuizSession.answerLog;        }, set(v){ QuizSession.answerLog=v;        }, configurable:true, enumerable:true },
  fillStreak:       { get(){ return FillSession.streak;           }, set(v){ FillSession.streak=v;           }, configurable:true, enumerable:true },
  fillBestStreak:   { get(){ return FillSession.bestStreak;       }, set(v){ FillSession.bestStreak=v;       }, configurable:true, enumerable:true },
  fillTotalScore:   { get(){ return FillSession.totalScore;       }, set(v){ FillSession.totalScore=v;       }, configurable:true, enumerable:true },
  fillAnswerLog:    { get(){ return FillSession.answerLog;        }, set(v){ FillSession.answerLog=v;        }, configurable:true, enumerable:true },
  players:          { get(){ return PlayerSession.list;           }, set(v){ PlayerSession.list=v;           }, configurable:true, enumerable:true },
  prevRank:         { get(){ return PlayerSession.prevRank;       }, set(v){ PlayerSession.prevRank=v;       }, configurable:true, enumerable:true },
});

/* ==================================================
   MATCH STATE  sequential team-turn engine v2.1.4
   Separato da SESSION STATE: sopravvive tra un turno
   e il successivo, azzerato solo a inizio partita.
================================================== */
let matchState = {
  active:        false,   // true mentre si gioca a turni
  teams:         [],      // [{name, color, type}] — ordine fisso per tutta la partita
  scores:        {},      // { teamName: totalScore }
  currentIdx:    0,       // indice della squadra che sta giocando ora
  frozenPool:    null,    // pool di domande CONSUMABILE — le domande escono in ordine e non tornano
  usedQIds:      new Set(), // indici (nell'array originale) già mostrati durante la partita
  isTiebreak:    false,   // siamo in spareggio?
  tbTeams:       [],      // solo le squadre in pareggio
  tbRound:       0,       // numero round spareggio
  _splashInterval: null,  // FIX C1: reference al countdown setInterval — cleanup garantito da matchReset()
};

function matchReset(){
  // FIX C1: distrugge il countdown in corso (se presente) prima di azzerare matchState.
  // Previene callback zombie che reinizializzerebbero il gioco su schermata errata.
  if(matchState._splashInterval){
    clearInterval(matchState._splashInterval);
    matchState._splashInterval=null;
  }
  matchState={
    active:false,teams:[],scores:{},currentIdx:0,
    frozenPool:null,usedQIds:new Set(),
    isTiebreak:false,tbTeams:[],tbRound:0,
    _splashInterval:null,  // FIX C1: incluso nel reset per coerenza strutturale
  };
}
let mState={},memState={},fillState={};

/* Memory timer state  v10 */
let memTimerInt=null;
let memElapsed=0;
let memPaused=false;

/* Leaderboard navigation state */
let lbType=null,lbAct=null;


/* ==================================================
   TIMER MANAGER — v4.0.3
   Registro centralizzato di tutti i timer di gioco.
   Ogni timer espone: start, pause, resume, stop.
   TimerManager.pauseAll() / resumeAll() / stopAll()
   eliminano la necessità di hardcoding per gameType
   in _pauseForDialog / _resumeAfterDialog /
   resetSessionState.

   ARCHITETTURA:
   - I timer si auto-registrano alla prima chiamata
     di start(). Non richiedono register() esplicito.
   - Le variabili globali di stato (qTimerInt, ecc.)
     restano invariate: i wrapper legacy le aggiornano.
   - paused = "messo in pausa dall'utente prima del
     dialog" — preserved across dialog open/close.
   - pausedByDialog = flag temporaneo: true se il timer
     era attivo quando il dialog si è aperto (non già
     paused dall'utente).
================================================== */
const TimerManager = (function(){
  const _timers = {}; // { name: { paused, pausedByDialog, ... } }

  /**
   * Registra un timer con le sue callback.
   * Chiamato automaticamente da start() se non già registrato.
   * @param {string}   name
   * @param {function} fnPause    - sospende il timer (aggiorna var globali)
   * @param {function} fnResume   - riprende il timer (aggiorna var globali)
   * @param {function} fnStop     - ferma e resetta il timer
   * @param {function} [fnIsRunning] - true se il timer è attivo
   */
  function register(name, fnPause, fnResume, fnStop, fnIsRunning){
    if(_timers[name]) return; // idempotente
    _timers[name] = { fnPause, fnResume, fnStop, fnIsRunning: fnIsRunning||null };
    console.log('[TimerManager] registered:', name);
  }

  /**
   * Pausa tutti i timer registrati.
   * Salva lo stato pre-dialog in pausedByDialog per
   * poterlo ripristinare correttamente in resumeAll().
   */
  function pauseAll(){
    Object.entries(_timers).forEach(([name, t])=>{
      const running = t.fnIsRunning ? t.fnIsRunning() : true;
      t.pausedByDialog = running;
      if(running){
        try{ t.fnPause(); } catch(e){ console.warn('[TimerManager] pauseAll error:', name, e); }
      }
    });
  }

  /**
   * Riprende i timer che erano attivi prima del dialog.
   * Non riprende i timer che l'utente aveva già messo in pausa.
   */
  function resumeAll(){
    Object.entries(_timers).forEach(([name, t])=>{
      if(t.pausedByDialog){
        t.pausedByDialog = false;
        try{ t.fnResume(); } catch(e){ console.warn('[TimerManager] resumeAll error:', name, e); }
      }
    });
  }

  /**
   * Ferma e resetta tutti i timer registrati.
   * Chiamato da resetSessionState().
   */
  function stopAll(){
    Object.entries(_timers).forEach(([name, t])=>{
      t.pausedByDialog = false;
      try{ t.fnStop(); } catch(e){ console.warn('[TimerManager] stopAll error:', name, e); }
    });
  }

  /**
   * Rimuove la registrazione di un timer.
   * Utile per cleanup (es. fine partita).
   * In pratica non necessario finché i timer sono singleton.
   */
  function unregister(name){
    delete _timers[name];
  }

  /**
   * Espone lo stato interno solo per debug.
   */
  function debug(){ return JSON.parse(JSON.stringify(_timers, (k,v)=>typeof v==='function'?'[fn]':v)); }

  return { register, pauseAll, resumeAll, stopAll, unregister, debug };
})();

/* ==================================================
   PAUSE UI REGISTRY — v4.0.9 (Fase 8 M2)
   Registro degli handler UI di pausa per ogni minigioco.
   Sostituisce i blocchi if(gameType==='speed'|'memory'|'match')
   in _pauseForDialog/_resumeAfterDialog — ora 4 righe ciascuno.
   Ogni minigioco chiama PauseUIRegistry.register() al caricamento.

   onPause(wasManuallyPaused):
     - wasManuallyPaused è sempre false qui (viene da dialog,
       non da pulsante pausa manuale)
     - Deve: mostrare overlay, bloccare input, cambiare icona btn
   onResume(wasManuallyPaused):
     - wasManuallyPaused: true se il gioco era già in pausa
       manuale PRIMA che si aprisse il dialog
     - Se true: NON togliere overlay/lock (l'utente aveva paused)
     - Se false: ripristina UI normalmente
================================================== */
const PauseUIRegistry = (function(){
  const _handlers = {};

  /**
   * Registra gli handler UI pausa/ripresa per un minigioco.
   * @param {string}   name       'speed' | 'memory' | 'match'
   * @param {object}   handlers   { onPause, onResume }
   */
  function register(name, handlers){
    _handlers[name] = handlers;
  }

  /**
   * Chiama onPause per il gameType attivo.
   * @param {boolean} wasManuallyPaused  sempre false da _pauseForDialog
   */
  function pauseActive(wasManuallyPaused){
    const h = _handlers[gameType];
    if(h && typeof h.onPause === 'function') h.onPause(wasManuallyPaused);
  }

  /**
   * Chiama onResume per il gameType attivo.
   * @param {boolean} wasManuallyPaused  true se gioco era già in pausa manuale
   */
  function resumeActive(wasManuallyPaused){
    const h = _handlers[gameType];
    if(h && typeof h.onResume === 'function') h.onResume(wasManuallyPaused);
  }

  return { register, pauseActive, resumeActive };
})();

/* Reset all transient game state between sessions */
function resetSessionState(){
  TimerManager.stopAll();   // v4.0.5: centralizzato — handles all registered timers
  stopTimer();              // legacy speed-quiz timer wrapper
  // Guard calls: these live in game-match/game-quiz/game-memory which load after this file.
  // TimerManager.stopAll() already covers them; these are safety no-ops.
  if(typeof stopMemTimer   === 'function') stopMemTimer();
  if(typeof stopMatchTimer === 'function') stopMatchTimer();
  gsSet(GS.IDLE);
  gameType=null;
  /* v4.0.5: FASE 4 — reset centralizzato via oggetti sessione */
  QuizSession.reset();
  FillSession.reset();
  PlayerSession.reset();
  mState={};memState={};fillState={};
  sNumSelected=false;
  matchReset(); // v2.1.4: reset team-turn engine
  // Unlock any paused UI (speed quiz OR memory)
  if(typeof _setGamePauseLock === 'function') _setGamePauseLock(false);
  // Reset speed quiz UI elements
  if(typeof resetSpeedUI === 'function') resetSpeedUI();
  const sp=shq('qz-score-pill');if(sp)sp.classList.add('hidden');
  const pb=shq('qz-pause-btn');if(pb)pb.classList.add('hidden');
}


/* ==================================================
   HELPERS
================================================== */
function sh(id){const el=document.getElementById(id);if(!el&&typeof console!=='undefined')console.warn('[PixelProf] elemento non trovato: #'+id);return el;}
/** shq — quiet lookup: elemento opzionale, nessun warning se assente. Usare per
 *  elementi che esistono solo in certi stati UI (es. mem-pause-btn fuori dal Memory). */
function shq(id){return document.getElementById(id);}
function escHtml(s){const d=document.createElement('div');d.appendChild(document.createTextNode(String(s)));return d.innerHTML;}
function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function setTb(active){['tb-home','tb-lb','tb-st','tb-hist'].forEach(id=>sh(id).classList.remove('active'));if(active)sh(active).classList.add('active');}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));sh(id).classList.add('active');}



/* ==================================================
   NAVIGATION  v10 with real pause interception
================================================== */

/* -- v11: Custom confirm dialog  dual mode (exit | restart) -- */
let _dialogCallback=null;
let _dialogMode='exit'; // 'exit' | 'restart'
let _dialogWasPaused=false;
let _dialogMatchWasPaused=false;

const DIALOG_COPY={
  exit:{
    title:'Uscire dalla partita?',
    sub:'La partita corrente verrà interrotta e il punteggio non verrà salvato.',
    confirm:'Sì, esci'
  },
  restart:{
    title:'Riavviare la partita?',
    sub:'La partita corrente verrà azzerata e si ricomincia dall\'inizio.',
    confirm:'Sì, riavvia'
  }
};

function _setDialogCopy(mode){
  const c=DIALOG_COPY[mode]||DIALOG_COPY.exit;
  const t=sh('pp-dialog-title'),s=sh('pp-dialog-sub'),y=sh('pp-dialog-yes');
  if(t)t.textContent=c.title;
  if(s)s.textContent=c.sub;
  if(y)y.textContent=c.confirm;
}

function ppConfirm(onYes){
  _dialogMode='exit';
  _dialogCallback=onYes;
  _setDialogCopy('exit');
  _pauseForDialog();
  sh('pp-dialog-overlay').classList.remove('hidden');
}

function ppConfirmRestart(onYes){
  _dialogMode='restart';
  _dialogCallback=onYes;
  _setDialogCopy('restart');
  _pauseForDialog();
  sh('pp-dialog-overlay').classList.remove('hidden');
}

/* ==================================================
   _pauseForDialog / _resumeAfterDialog — v4.0.8
   Timer: TimerManager.pauseAll() / resumeAll().
   UI (overlay, icone, lock): invariata per gameType.

   FIX I1 (v4.0.8): _dialogWasPaused derivato da timer state.
   FIX bug 1.2/2.2 (v4.0.8):
     Quando il dialog si apre e il gioco è già GS.PAUSED
     (pausa manuale attiva), _pauseForDialog saltava tutto
     il blocco if(gsIs(GS.PLAYING)) e TimerManager.pauseAll()
     non veniva mai chiamato → pausedByDialog=false per tutti
     i timer → _resumeAfterDialog non riavviava nessun timer
     → gsState=PLAYING ma timer fermo → gioco bloccato.

     SOLUZIONE: _dialogGameWasPaused cattura se il gioco era
     già in GS.PAUSED prima dell'apertura del dialog.
     _resumeAfterDialog ripristina GS.PAUSED invece di
     GS.PLAYING in quel caso, mantenendo tutto in pausa.
================================================== */

// true se il gioco era già in GS.PAUSED quando il dialog si è aperto
let _dialogGameWasPaused = false;

function _pauseForDialog(){
  // Cattura se siamo già in pausa manuale PRIMA di cambiare stato
  _dialogGameWasPaused = gsIs(GS.PAUSED);

  if(gsIs(GS.PLAYING)){
    gsSet(GS.PAUSED);

    // ── FIX I1: snapshot da timer state (fonte di verità) non da flag ──
    _dialogWasPaused      = (memTimerInt === null && memElapsed > 0);
    _dialogMatchWasPaused = (mTimerInt   === null && mTimeLeft  > 0 && mTimeLeft < 60);

    // ── Pausa tutti i timer via manager ──
    TimerManager.pauseAll();

    // ── UI pausa delegata al minigioco attivo via PauseUIRegistry ──
    // Ogni gioco registra il proprio handler — zero if(gameType) qui.
    PauseUIRegistry.pauseActive(false);
  }
  // Se il gioco era già GS.PAUSED: non cambiamo nulla.
  // _dialogGameWasPaused=true segnala a _resumeAfterDialog di
  // non riprendere il gioco quando l'utente preme "No, continua".
}

function _resumeAfterDialog(){
  if(!gsIs(GS.PAUSED)) return;

  // ── FIX bug 1.2/2.2: se il gioco era già in pausa quando il dialog
  //    si è aperto, NON riprendere — lascia tutto in GS.PAUSED. ──
  if(_dialogGameWasPaused){
    _dialogGameWasPaused = false;
    return; // il gioco resta in pausa, nessuna UI da cambiare
  }
  _dialogGameWasPaused = false;

  gsSet(GS.PLAYING);

  // ── UI ripresa delegata al minigioco attivo via PauseUIRegistry ──
  // Ogni gioco conosce il proprio stato interno (_dialogWasPaused,
  // _dialogMatchWasPaused) e decide autonomamente se ripristinare l'overlay.
  PauseUIRegistry.resumeActive(false);

  // ── Riprende i timer (DOPO aggiornamento UI) ──
  TimerManager.resumeAll();
}

function _syncMemPauseOverlay(show){
  const overlay=shq('mem-paused-overlay');
  if(!overlay)return;
  overlay.classList.toggle('hidden',!show);
  // Usa classe CSS invece di style inline — più robusto e manutenibile
  document.querySelectorAll('.mem-c.flip').forEach(el=>el.classList.toggle('paused-hidden',show));
}

sh('pp-dialog-yes').onclick=function(){
  sh('pp-dialog-overlay').classList.add('hidden');
  // Confirm: destroy game state cleanly — v4.0.3: TimerManager.stopAll() centralizzato
  TimerManager.stopAll();
  gsSet(GS.IDLE);
  gameType=null;
  if(_dialogCallback){_dialogCallback();_dialogCallback=null;}
};
sh('pp-dialog-no').onclick=function(){
  sh('pp-dialog-overlay').classList.add('hidden');
  _dialogCallback=null;
  // Resume game from where it was
  _resumeAfterDialog();
};

/* Is a game currently active (playing OR paused)? */
function isGameActive(){
  return gsIsActive() && (
    (document.getElementById('tab-quiz')?.classList.contains('active') && !sh('qz-game')?.classList.contains('hidden')) ||
    (document.getElementById('tab-games')?.classList.contains('active') && sh('g-area')?.children.length > 0 && !sh('g-area')?.querySelector('.result-wrap'))
  );
}

function stopTimer(){if(qTimerInt){clearInterval(qTimerInt);qTimerInt=null;}}


/* ==================================================
   TIMER REGISTRATIONS — v4.0.3
   I 3 timer (speed, memory, match) si registrano nel
   TimerManager. Le funzioni pubbliche legacy restano
   come wrapper per retrocompatibilità: il resto del
   codice (speedTogglePause, memTogglePause, ecc.) le
   chiama ancora direttamente senza modifiche.
================================================== */

/* ── Speed Quiz timer ─────────────────────────────
   fnPause:     stopTimer() (clearInterval qTimerInt)
   fnResume:    _restartSpeedTimer() solo se in gioco
   fnStop:      stopTimer()
   fnIsRunning: qTimerInt != null
─────────────────────────────────────────────────── */
TimerManager.register(
  'speed',
  /* pause  */ () => { stopTimer(); },
  /* resume */ () => { if(sAct==='speed' && qSpeedLeft>0 && !qAnswered && !sh('qz-game')?.classList.contains('hidden')) _restartSpeedTimer(); },
  /* stop   */ () => { stopTimer(); },
  /* isRunning */ () => qTimerInt !== null
);

/* v10: memory timer helpers — v4.0.8 I1 fix
   memPaused è mantenuto in sincronia con gsState nei toggle.
   Fonte di verità per "è in pausa?" = memTimerInt === null (timer fermo).
   memPaused serve solo come guard per evitare doppi clearInterval/start. */
function stopMemTimer(){
  if(memTimerInt){clearInterval(memTimerInt);memTimerInt=null;}
  memElapsed=0;memPaused=false;
}
function pauseMemTimer(){
  // Guard: non tentare di fermare un timer già fermo
  if(memTimerInt){clearInterval(memTimerInt);memTimerInt=null;}
  memPaused=true; // sempre sincronizzato: se pauseMemTimer() è chiamato, siamo in pausa
}
function resumeMemTimer(){
  memPaused=false; // sempre sincronizzato: se resumeMemTimer() è chiamato, usciamo da pausa
  _startMemInterval();
}
function _startMemInterval(){
  // Guard: non avviare se già un intervallo attivo
  if(memTimerInt) return;
  memTimerInt=setInterval(()=>{
    // Double-check: blocca tick se gsState è PAUSED o non PLAYING
    if(!gsIs(GS.PLAYING))return;
    memElapsed++;
    _updateMemTimerUI();
  },1000);
}

/* ── Memory timer ─────────────────────────────────
   v4.0.8 I1 fix: fnIsRunning usa solo memTimerInt (non !memPaused ridondante).
   TimerManager.pauseAll() chiama fnPause() solo se fnIsRunning() è true,
   quindi pauseMemTimer() viene chiamato solo quando il timer sta girando.
   Questo garantisce che _dialogWasPaused (snapshot pre-dialog) rifletta
   correttamente se il timer era attivo al momento del dialog.
─────────────────────────────────────────────────── */
TimerManager.register(
  'memory',
  /* pause  */ () => { pauseMemTimer(); },
  /* resume */ () => { resumeMemTimer(); },
  /* stop   */ () => { stopMemTimer(); },
  /* isRunning */ () => memTimerInt !== null   // timer attivo = non in pausa
);
function _updateMemTimerUI(){
  const el=document.getElementById('mem-timer-pill');
  if(!el)return;
  const m=Math.floor(memElapsed/60);
  const s=memElapsed%60;
  el.textContent=(m>0?(m+':'):'')+(s<10?'0':'')+s;
  const warn=memElapsed>=90;
  el.parentElement.classList.toggle('timer-warning',warn);
  el.parentElement.classList.toggle('timer-running',!warn);
  // also refresh score every second (time affects score)
  _updateMemScoreUI(false);
}

function _updateMemScoreUI(bump){
  const el=document.getElementById('mem-score-pill');
  if(!el)return;
  const s=memState;
  if(!s||!s.pairs)return;
  const live=calcMemScore(s.pairs,s.moves,memElapsed);
  el.textContent=live;
  if(bump){
    const pill=el.closest('.mem-stat-pill');
    if(pill){
      pill.classList.remove('score-bump');
      // force reflow so animation restarts
      void pill.offsetWidth;
      pill.classList.add('score-bump');
      pill.addEventListener('animationend',()=>pill.classList.remove('score-bump'),{once:true});
    }
  }
}

function goHome(){
  if(isGameActive()){
    ppConfirm(()=>{resetSessionState();setTb('tb-home');showScreen('tab-home');goStep('mod');});
    return;
  }
  resetSessionState();setTb('tb-home');showScreen('tab-home');goStep('mod');
}

function goCoursesFromApp(){
  const _execBack = () => {
    resetSessionState();
    window._activeModuleKeys = null; // v5.0.6: reset filtro moduli — evita bleed tra aule
    sh('screen-courses').classList.remove('hidden');
    document.querySelector('.app').style.display='none';
    renderCoursesGrid();
  };
  if(isGameActive()){
    ppConfirm(_execBack);
    return;
  }
  // Anche fuori dal gioco: conferma uscita dall'aula se un'aula è attiva
  if(activeCourseId){
    const courses=loadCourses();
    const course=courses.find(c=>c.id===activeCourseId);
    const aulaNome=course?course.name:'questa aula';
    const t=sh('pp-dialog-title'), s=sh('pp-dialog-sub'), y=sh('pp-dialog-yes');
    const _prevT=t?.textContent, _prevS=s?.textContent, _prevY=y?.textContent;
    const _prevYes=sh('pp-dialog-yes')?.onclick, _prevNo=sh('pp-dialog-no')?.onclick;
    if(t) t.textContent='Esci da "'+aulaNome+'"?';
    if(s) s.textContent='Tornerai alla schermata di selezione aule.';
    if(y) y.textContent='Sì, cambia aula';
    sh('pp-dialog-yes').onclick = function(){
      sh('pp-dialog-overlay').classList.add('hidden');
      sh('pp-dialog-yes').onclick=_prevYes; sh('pp-dialog-no').onclick=_prevNo;
      if(t)t.textContent=_prevT; if(s)s.textContent=_prevS; if(y)y.textContent=_prevY;
      _setDialogCopy('exit');
      _execBack();
    };
    sh('pp-dialog-no').onclick = function(){
      sh('pp-dialog-overlay').classList.add('hidden');
      sh('pp-dialog-yes').onclick=_prevYes; sh('pp-dialog-no').onclick=_prevNo;
      if(t)t.textContent=_prevT; if(s)s.textContent=_prevS; if(y)y.textContent=_prevY;
      _setDialogCopy('exit');
    };
    sh('pp-dialog-overlay').classList.remove('hidden');
    return;
  }
  _execBack();
}

function goTab(t){
  if(isGameActive()){
    ppConfirm(()=>{_doGoTab(t);});
    return;
  }
  _doGoTab(t);
}
function _doGoTab(t){
  resetSessionState();
  const tbMap={lb:'tb-lb',stats:'tb-st',hist:'tb-hist'};
  setTb(tbMap[t]||null);
  showScreen('tab-'+t);
  if(t==='lb'){lbType=null;lbAct=null;lbShowStep('type');}
  if(t==='stats')renderStats();
  if(t==='hist')renderHistory();
}

function goStep(s){
  ['step-mod','step-cat','step-act','step-num','step-players'].forEach(id=>{const el=shq(id);if(el)el.classList.add('hidden');});
  const target=shq('step-'+s);if(target)target.classList.remove('hidden');
  if(s==='mod'){
    // v5.0.6: riapplica il filtro moduli ad ogni accesso a step-mod.
    // _renderModuleFilter è sincrona e legge window._activeModuleKeys
    // (impostato da _applyModuleFilter al momento dell'ingresso nell'aula).
    if(typeof window._renderModuleFilter === 'function'){
      window._renderModuleFilter();
    }
  }
  if(s==='cat'){
    const catLabel=shq('cat-mod-label');
    if(catLabel) catLabel.textContent=MOD_LABEL[sMod]||'';
  }
  if(s==='act'){
    sh('act-mod-label').textContent=MOD_LABEL[sMod]||'';
    if(!sAct)updateHero(null);
  }
}


/* ==================================================
   MODULE & ACTIVITY SELECTION
================================================== */
function selMod(m){
  sMod=m;
  document.querySelectorAll('.mod-card').forEach(el=>el.classList.remove('active'));
  sh('mc-'+m).classList.add('active');
  setTimeout(()=>goStep('act'),180);   // ← lascia questa riga com'è nel tuo codice live (act o cat)
}

function updateHero(act){
  const hero=sh('act-hero'),bgEl=sh('act-hero-bg'),iconEl=sh('act-hero-icon'),titleEl=sh('act-hero-title'),subEl=sh('act-hero-sub');
  if(!act){hero.className='act-hero';bgEl.innerHTML='';iconEl.textContent='🎯';titleEl.textContent="Scegli un'attività";subEl.textContent='Seleziona il tipo di esercizio';return;}
  const m=ACT_META[act];hero.className='act-hero '+m.heroClass;bgEl.innerHTML=m.bg;iconEl.textContent=m.icon;titleEl.textContent=m.title;subEl.textContent=m.sub;
}

function selAct(a){
  sAct=a;
  ['quiz','speed','match','memory','fill'].forEach(x=>sh('ac-'+x).classList.remove('active'));
  sh('ac-'+a).classList.add('active');
  updateHero(a);
  const needsNum=(a==='quiz'||a==='speed');
  sh('setup-num').classList.toggle('hidden',!needsNum);
  sh('setup-divider').classList.toggle('hidden',!needsNum);
  // Speed Quiz: hide "Tutte"  no meaning with fixed 60s timer
  const allBtn=sh('nb-all');
  if(allBtn)allBtn.style.display=(a==='speed')?'none':'';
  if(!needsNum){sN=0;sNumSelected=true;}else{sNumSelected=false;}
  sMode=null;sIndPlayer=null;sTeams=[];
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  sh('ps-ind').classList.add('hidden');sh('ps-sq').classList.add('hidden');
  sh('start-btn').disabled=true;
  sh('setup-panel').classList.remove('hidden');
  document.querySelectorAll('.num-btn').forEach(b=>b.classList.remove('active'));
}

function selNum(btn,n){
  document.querySelectorAll('.num-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');sN=n;sNumSelected=true;checkCanStart();
}

function checkCanStart(){
  const needsNum=(sAct==='quiz'||sAct==='speed');
  const numOk=!needsNum||sNumSelected;
  let playerOk=false;
  if(sMode==='ind'){
    playerOk=!!sIndPlayer;
  } else if(sMode==='sq'){
    const named=sTeams.filter(t=>t.name.trim());
    // almeno 2 squadre con nome non vuoto e nomi non duplicati
    const unique=new Set(named.map(t=>t.name.trim().toLowerCase()));
    playerOk=named.length>=2 && unique.size===named.length;
  }
  const btn=sh('start-btn');
  if(btn)btn.disabled=!(numOk&&playerOk);
}

function selMode(m){
  sMode=m;
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  sh('mb-'+m).classList.add('active');
  sh('ps-ind').classList.toggle('hidden',m!=='ind');
  sh('ps-sq').classList.toggle('hidden',m!=='sq');
  if(m==='ind') renderIndChips();
  else renderSqUI();
  // Aggiorna visibilità tasto + DOPO che ps-sq è visibile nel DOM
  if(m==='sq') _updateAddSqBtn();
  checkCanStart();
}

function _updateAddSqBtn(){
  // requestAnimationFrame garantisce che il display venga applicato
  // DOPO che il browser ha calcolato il layout del parent (#ps-sq appena mostrato)
  requestAnimationFrame(()=>{
    const btn=document.getElementById('add-sq-btn');
    if(!btn) return;
    btn.style.display = sTeams.length >= 4 ? 'none' : 'inline-flex';
  });
}

function renderIndChips(){
  const c=sh('ind-chips');
  if(!db.players.length){
    c.innerHTML='<span style="font-size:12px;color:rgba(255,255,255,.3)">Nessun giocatore salvato</span>';
    return;
  }
  c.innerHTML=db.players.map((p,i)=>`
    <div style="display:inline-flex;align-items:center;gap:0;margin:3px 4px 3px 0;position:relative">
      <button class="pchip${sIndPlayer===p?' active':''}"
        style="border-radius:20px 0 0 20px;margin:0;padding-right:6px"
        onclick="pickInd('${escAttr(p)}')">${escHtml(p)}</button>
      <button
        title="Elimina giocatore"
        onclick="deletePlayer(${i},event)"
        style="
          display:inline-flex;align-items:center;justify-content:center;
          height:30px;width:24px;padding:0;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);border-left:none;
          border-radius:0 20px 20px 0;
          color:rgba(255,255,255,.35);font-size:11px;cursor:pointer;
          transition:background .15s,color .15s;
        "
        onmouseover="this.style.background='rgba(255,60,80,.18)';this.style.color='#ff4d6d'"
        onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.color='rgba(255,255,255,.35)'"
      ><i class="ti ti-x"></i></button>
    </div>`).join('');
}
function pickInd(n){sIndPlayer=n;renderIndChips();checkCanStart();}
function addInd(){const inp=sh('ind-inp');const n=inp.value.trim();if(!n)return;if(!db.players.includes(n))db.players.push(n);save();sIndPlayer=n;inp.value='';renderIndChips();checkCanStart();}

/* ==================================================
   _showDeleteConfirm — v5.0.3
   Mini-popover di conferma inline sopra il chip ×.
   Appare posizionato sopra il trigger, scompare
   su Escape / click fuori / conferma / annulla.
   Usato da deletePlayer() e deleteSavedTeam().

   @param {HTMLElement} triggerEl  — il bottone × cliccato
   @param {string}      label      — nome elemento (es. Rossi)
   @param {string}      tipo       — giocatore | squadra
   @param {function}    onConfirm  — callback eseguita dopo conferma
================================================== */
function _showDeleteConfirm(triggerEl, label, tipo, onConfirm){
  // Rimuove eventuali popover già aperti
  document.querySelectorAll('.pp-del-confirm').forEach(el=>el.remove());

  const pop=document.createElement('div');
  pop.className='pp-del-confirm';
  pop.setAttribute('role','dialog');
  pop.setAttribute('aria-modal','true');

  // Stile del popover
  Object.assign(pop.style,{
    position:'fixed',
    zIndex:'9999',
    background:'rgba(12,16,28,.97)',
    border:'1px solid rgba(255,60,80,.35)',
    borderRadius:'12px',
    padding:'12px 14px',
    boxShadow:'0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(255,60,80,.15)',
    minWidth:'200px',
    maxWidth:'260px',
    backdropFilter:'blur(8px)',
  });

  pop.innerHTML=`
    <div style="font-size:11px;font-weight:700;color:rgba(255,60,80,.9);
      text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;
      font-family:'Share Tech Mono',monospace">
      <i class="ti ti-alert-triangle" style="font-size:12px"></i> Elimina ${escHtml(tipo)}
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,.65);margin-bottom:12px;line-height:1.45">
      Eliminare <strong style="color:#fff">${escHtml(label)}</strong>?<br>
      <span style="font-size:10px;color:rgba(255,255,255,.35);font-family:'Share Tech Mono',monospace">
        L'azione rimuoverà il ${escHtml(tipo)} dall'aula.
      </span>
    </div>
    <div style="display:flex;gap:8px">
      <button id="pp-del-cancel" style="
        flex:1;padding:6px 10px;border-radius:8px;
        background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
        color:rgba(255,255,255,.6);font-size:11px;cursor:pointer;
        font-family:'Space Grotesk',sans-serif;font-weight:600;
        transition:background .15s,color .15s;
      "
        onmouseover="this.style.background='rgba(255,255,255,.12)';this.style.color='#fff'"
        onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.color='rgba(255,255,255,.6)'"
      >Annulla</button>
      <button id="pp-del-confirm-btn" style="
        flex:1;padding:6px 10px;border-radius:8px;
        background:rgba(255,60,80,.15);border:1px solid rgba(255,60,80,.4);
        color:#ff4d6d;font-size:11px;cursor:pointer;
        font-family:'Space Grotesk',sans-serif;font-weight:700;
        transition:background .15s,border-color .15s;
      "
        onmouseover="this.style.background='rgba(255,60,80,.28)';this.style.borderColor='rgba(255,60,80,.7)'"
        onmouseout="this.style.background='rgba(255,60,80,.15)';this.style.borderColor='rgba(255,60,80,.4)'"
      ><i class="ti ti-trash" style="font-size:11px"></i> Elimina</button>
    </div>`;

  document.body.appendChild(pop);

  // Posizionamento: sopra il trigger, centrato orizzontalmente
  const rect=triggerEl.getBoundingClientRect();
  const pw=pop.offsetWidth||220;
  let left=rect.left+rect.width/2-pw/2;
  left=Math.max(8,Math.min(left,window.innerWidth-pw-8));
  const top=rect.top-pop.offsetHeight-8;
  pop.style.left=left+'px';
  pop.style.top=(top<8?rect.bottom+8:top)+'px';

  // Handlers
  const _close=()=>{
    pop.remove();
    document.removeEventListener('keydown',_onKey);
    document.removeEventListener('mousedown',_onOutside);
  };
  const _onKey=(e)=>{ if(e.key==='Escape'){ e.preventDefault(); _close(); } };
  const _onOutside=(e)=>{ if(!pop.contains(e.target)&&e.target!==triggerEl) _close(); };

  pop.querySelector('#pp-del-cancel').addEventListener('click',()=>_close());
  pop.querySelector('#pp-del-confirm-btn').addEventListener('click',()=>{
    _close();
    onConfirm();
  });

  // Chiusura automatica su Escape o click fuori
  setTimeout(()=>{
    document.addEventListener('keydown',_onKey);
    document.addEventListener('mousedown',_onOutside);
  },10);

  // Focus sul bottone Annulla per accessibilità
  setTimeout(()=>pop.querySelector('#pp-del-cancel')?.focus(),30);
}

/* ==================================================
   DELETE PLAYER — v5.0.3
   Rimuove un giocatore salvato da db.players.
   Mostra un mini-popover di conferma inline sopra il chip.
   Dopo conferma: splice locale + save + cloud fire-and-forget.
================================================== */
function deletePlayer(idx, evt){
  evt.stopPropagation();
  const name=db.players[idx];
  if(!name) return;
  _showDeleteConfirm(evt.currentTarget, name, 'giocatore', ()=>{
    db.players.splice(idx,1);
    save();
    if(sIndPlayer===name){ sIndPlayer=null; }
    // Cloud: fire-and-forget
    if(window.DB && activeCourseId){
      window.DB.deletePlayer(activeCourseId, name)
        .catch(e=>console.warn('[PixelProf] deletePlayer cloud err:', e));
    }
    renderIndChips();
    checkCanStart();
  });
}
function renderSqUI(){
  const s=sh('sq-saved');
  if(!db.teams.length){
    s.innerHTML='<span style="font-size:12px;color:rgba(255,255,255,.3)">Nessuna squadra salvata</span>';
  } else {
    s.innerHTML=db.teams.map((t,i)=>`
      <div class="pchip-wrap" style="display:inline-flex;align-items:center;gap:0;margin:3px 4px 3px 0;position:relative">
        <button class="pchip" id="sqchip-${i}"
          style="border-left:3px solid ${escAttr(t.color)};border-radius:20px 0 0 20px;margin:0;padding-right:6px"
          onclick="addSavedTeam('${escAttr(t.name)}','${escAttr(t.color)}')">${escHtml(t.name)}</button>
        <button
          title="Rinomina squadra"
          onclick="startRenameSavedTeam(${i},event)"
          style="
            display:inline-flex;align-items:center;justify-content:center;
            height:30px;width:26px;padding:0;
            background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.12);border-left:none;border-right:none;
            border-radius:0;
            color:rgba(255,255,255,.4);font-size:11px;cursor:pointer;
            transition:background .15s,color .15s;
          "
          onmouseover="this.style.background='rgba(0,255,200,.12)';this.style.color='#00ffc8'"
          onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.color='rgba(255,255,255,.4)'"
        ><i class="ti ti-pencil"></i></button>
        <button
          title="Elimina squadra"
          onclick="deleteSavedTeam(${i},event)"
          style="
            display:inline-flex;align-items:center;justify-content:center;
            height:30px;width:24px;padding:0;
            background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.12);border-left:none;
            border-radius:0 20px 20px 0;
            color:rgba(255,255,255,.35);font-size:11px;cursor:pointer;
            transition:background .15s,color .15s;
          "
          onmouseover="this.style.background='rgba(255,60,80,.18)';this.style.color='#ff4d6d'"
          onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.color='rgba(255,255,255,.35)'"
        ><i class="ti ti-x"></i></button>
      </div>`).join('');
  }
  sTeams=[{name:'',color:COLORS[0]},{name:'',color:COLORS[1]}];
  renderSqRows();
  checkCanStart();
}
function addSavedTeam(name,color){
  if(!sTeams.find(t=>t.name===name)) sTeams.push({name,color});
  renderSqRows();
  _updateAddSqBtn();
  checkSqValid();
}

/* ==================================================
   DELETE SAVED TEAM — v5.0.3
   Rimuove una squadra salvata da db.teams.
   Mostra un mini-popover di conferma inline sopra il chip.
   Dopo conferma: splice locale + save + cloud fire-and-forget.
================================================== */
function deleteSavedTeam(idx, evt){
  evt.stopPropagation();
  const team=db.teams[idx];
  if(!team) return;
  const name=team.name;
  _showDeleteConfirm(evt.currentTarget, name, 'squadra', ()=>{
    db.teams.splice(idx,1);
    save();
    // Cloud: fire-and-forget
    if(window.DB && activeCourseId){
      window.DB.deleteTeam(activeCourseId, name)
        .catch(e=>console.warn('[PixelProf] deleteTeam cloud err:', e));
    }
    // Rimuove anche da sTeams se presente nella sessione corrente
    const si=sTeams.findIndex(t=>t.name===name);
    if(si>=0) sTeams.splice(si,1);
    // Re-render chip + righe
    renderSqUI();
    checkCanStart();
  });
}

/* ==================================================
   RENAME SAVED TEAM — N2
   Inline edit direttamente nel chip: nessun prompt(),
   nessun modal. Input sostituisce il chip; ✓ salva,
   ✗ annulla. Aggiorna db.teams + sTeams se la squadra
   è già nella sessione corrente.
================================================== */
function startRenameSavedTeam(idx, evt){
  evt.stopPropagation();
  const team=db.teams[idx];
  if(!team) return;
  const wrap=document.querySelector(`#sqchip-${idx}`)?.parentElement;
  if(!wrap) return;
  const oldName=team.name;
  const col=team.color;

  wrap.innerHTML=`
    <div style="display:inline-flex;align-items:center;gap:4px;padding:2px 4px;
      border:1px solid rgba(0,255,200,.4);border-radius:20px;
      background:rgba(0,255,200,.07);box-shadow:0 0 8px rgba(0,255,200,.12)">
      <div style="width:8px;height:8px;border-radius:50%;background:${escAttr(col)};box-shadow:0 0 5px ${escAttr(col)};flex-shrink:0;margin-left:6px"></div>
      <input id="sq-rename-inp-${idx}"
        value="${escAttr(oldName)}"
        style="
          background:transparent;border:none;outline:none;
          color:#fff;font-size:12px;font-family:'Space Grotesk',sans-serif;
          font-weight:600;width:90px;padding:2px 4px;
        "
        onkeydown="if(event.key==='Enter'){event.preventDefault();confirmRenameSavedTeam(${idx},'${escAttr(oldName)}');}
                   if(event.key==='Escape'){event.preventDefault();renderSqUI();}"
        onfocus="this.select()"
      />
      <button onclick="confirmRenameSavedTeam(${idx},'${escAttr(oldName)}')" title="Salva"
        style="background:rgba(0,255,200,.15);border:1px solid rgba(0,255,200,.3);border-radius:50%;
               width:22px;height:22px;display:flex;align-items:center;justify-content:center;
               color:#00ffc8;font-size:11px;cursor:pointer;flex-shrink:0;transition:background .15s"
        onmouseover="this.style.background='rgba(0,255,200,.3)'"
        onmouseout="this.style.background='rgba(0,255,200,.15)'"
      ><i class="ti ti-check"></i></button>
      <button onclick="renderSqUI()" title="Annulla"
        style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:50%;
               width:22px;height:22px;display:flex;align-items:center;justify-content:center;
               color:rgba(255,255,255,.4);font-size:11px;cursor:pointer;flex-shrink:0;transition:background .15s;margin-right:4px"
        onmouseover="this.style.background='rgba(255,60,80,.2)';this.style.color='#ff4d6d'"
        onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.color='rgba(255,255,255,.4)'"
      ><i class="ti ti-x"></i></button>
    </div>`;
  // Focus con delay per lasciar il DOM aggiornare
  setTimeout(()=>document.getElementById(`sq-rename-inp-${idx}`)?.focus(), 30);
}

function confirmRenameSavedTeam(idx, oldName){
  const inp=document.getElementById(`sq-rename-inp-${idx}`);
  if(!inp) return;
  const newName=inp.value.trim();
  if(!newName){renderSqUI();return;}
  if(newName===oldName){renderSqUI();return;}
  // Controlla duplicati in db.teams
  if(db.teams.find((t,i)=>i!==idx && t.name.trim().toLowerCase()===newName.toLowerCase())){
    inp.style.borderBottom='1px solid #ff4d6d';
    inp.style.color='#ff4d6d';
    inp.title='Nome già usato';
    inp.value='';
    inp.placeholder='Nome già usato!';
    inp.style.setProperty('--placeholder-color','#ff4d6d');
    setTimeout(()=>renderSqUI(),1600);
    return;
  }
  // Aggiorna db.teams
  const col=db.teams[idx].color;
  db.teams[idx].name=newName;
  save();
  // Aggiorna sTeams se la squadra è già presente nella sessione corrente
  const inSession=sTeams.findIndex(t=>t.name===oldName);
  if(inSession>=0){
    sTeams[inSession].name=newName;
    renderSqRows();
  }
  // Re-render chip
  renderSqUI();
}

/* renderSqRows — v4.0.9 I3 fix / v5.0.0 P1:
   oninput aggiorna SOLO sTeams[i].name + checkSqValid senza re-render DOM.
   Il re-render (innerHTML completo) avviene solo su operazioni strutturali:
   addSqRow() e splice (rimozione riga). Elimina il reflow ad ogni tasto.
   Il tasto + inline sull'ultima riga gestisce l'aggiunta — nessun pulsante
   testuale esterno. _updateAddSqBtn() è mantenuta come no-op sicuro. */
let _sqValidDebounceTimer = null;
function _sqOnInput(i, val){
  sTeams[i].name = val;
  clearTimeout(_sqValidDebounceTimer);
  _sqValidDebounceTimer = setTimeout(checkSqValid, 150);
}

function renderSqRows(){
  const cont = shq('sq-rows');
  if(!cont) return;
  const isLast = i => i === sTeams.length - 1;
  const canAdd  = sTeams.length < 4;
  cont.innerHTML = sTeams.map((t,i) => {
    const dot    = `<div class="team-dot" style="background:${escAttr(t.color)};box-shadow:0 0 6px ${escAttr(t.color)}"></div>`;
    const input  = `<input value="${escAttr(t.name)}" placeholder="Nome squadra ${i+1}..." oninput="_sqOnInput(${i},this.value)" onkeydown="if(event.key==='Enter'&&${canAdd&&isLast(i)}){event.preventDefault();addSqRow();}"/>`;
    // Tasto + sull'ultima riga se si possono aggiungere ancora squadre
    const addBtn = (canAdd && isLast(i))
      ? `<button class="btn btn-neon" onclick="addSqRow()" title="Aggiungi squadra" style="padding:6px 10px;font-size:13px;flex-shrink:0"><i class="ti ti-plus"></i></button>`
      : '';
    // Tasto × dalla terza riga in poi
    const removeBtn = i >= 2
      ? `<button class="icon-btn" onclick="sTeams.splice(${i},1);renderSqRows();_updateAddSqBtn();checkSqValid()" title="Rimuovi">×</button>`
      : '';
    return `<div class="team-row">${dot}${input}${addBtn}${removeBtn}</div>`;
  }).join('');
}
function addSqRow(){
  if(sTeams.length>=4) return;
  sTeams.push({name:'',color:COLORS[sTeams.length%COLORS.length]});
  renderSqRows();
  _updateAddSqBtn();
  checkSqValid();
}
function checkSqValid(){checkCanStart();}


/* ==================================================
   LAUNCH
================================================== */

/* Points per correct answer in Speed Quiz  scales with question count */
/* speedPtsPerQ — defined in scoring.js */

async function launch(){
  // Guard: stato minimo necessario
  if(!sAct||!sMod||!sMode){console.warn('[PixelProf] launch() chiamato con stato invalido',{sAct,sMod,sMode});goHome();return;}

  // Cloud hook: assicura il giocatore individuale nel DB prima di avviare
  // Per le squadre, la chiamata avviene nel blocco matchState dopo validazione nomi
  if(typeof window.hook_ensureParticipants==='function'){
    if(sMode==='ind'&&sIndPlayer){
      window.hook_ensureParticipants([{name:sIndPlayer,color:COLORS[0],type:'ind'}]);
    }
  }

  // -- MODALIT SQUADRE  team-turn engine v2.1.6 --
  if(sMode==='sq'){
    // Prima chiamata a launch(): inizializza MATCH STATE
    if(!matchState.active){
      const v=sTeams.filter(t=>t.name.trim());
      if(v.length<2){goHome();return;}
      // Salva squadre nel db se nuove
      v.forEach(t=>{if(!db.teams.find(x=>x.name===t.name))db.teams.push({name:t.name.trim(),color:t.color});});
      save();
      // Cloud hook: assicura i team su Supabase ORA che i nomi sono validati
      // (la chiamata all'inizio di launch() avviene prima della validazione nomi)
      if(typeof window.hook_ensureParticipants==='function'){
        window.hook_ensureParticipants(
          v.map((t,i)=>({name:t.name.trim(),color:t.color||COLORS[i],type:'sq'}))
        );
      }
      // Carica il pool UNA volta e lo condivide fra tutte le squadre
      let rawPool;
      const act=sAct;
      if(act==='speed'){
        const isCached=SpeedQuizLoader.isCached(sMod);
        if(!isCached)showSpeedQuizLoading(sMod);
        try{rawPool=await loadSpeedPool(sMod);}
        catch(err){console.error('[PixelProf] SpeedQuiz load error:',err);showSpeedQuizError('Impossibile caricare lo speed quiz.');matchReset();return;}
      }else if(act==='quiz'){
        const isCached=QuizLoader.isCached(sMod);
        if(!isCached)showQuizLoading(sMod);
        try{rawPool=await loadPool(sMod);}
        catch(err){console.error('[PixelProf] Quiz load error:',err);showQuizLoadError(err.message||'Impossibile caricare il quiz.');matchReset();return;}
      }else{
        // match/memory/fill in modalit squadre: ogni squadra gioca in autonomia
        // non c' un pool domande condiviso  rawPool rimane null
        rawPool=null;
      }

      // Per quiz/speed: shuffle + slicing + ogni domanda marcata con un indice univoco
      // per il tracking anti-duplicati tra turni squadra
      if(rawPool!==null){
        let frozenPool=shuffle(rawPool.map((q,i)=>({...q,_uid:i})));
        if(act==='speed'){const n=sN>0?sN:10;frozenPool=frozenPool.slice(0,Math.min(n,frozenPool.length));}
        else if(sN>0){frozenPool=frozenPool.slice(0,Math.min(sN,frozenPool.length));}
        matchState.frozenPool=frozenPool;
      }else{
        matchState.frozenPool=null;
      }

      matchState.active=true;
      matchState.teams=v.map((t,i)=>({name:t.name.trim(),color:t.color||COLORS[i],type:'sq'}));
      matchState.scores={};
      matchState.teams.forEach(t=>{matchState.scores[t.name]=0;});
      matchState.currentIdx=0;
      matchState.usedQIds=new Set(); // reset tracking domande
      matchState.isTiebreak=false;
      matchState.tbTeams=[];
      matchState.tbRound=0;
    }
    // Avvia il turno della squadra corrente
    _startTeamTurn();
    return;
  }

  // -- MODALIT INDIVIDUALE (invariata) --
  if(!sIndPlayer){goHome();return;}
  players=[{name:sIndPlayer,color:COLORS[0],type:'ind'}];
  qScores={};players.forEach(p=>qScores[p.name]=0);prevRank=getRank();
  const act=sAct;
  if(act==='quiz'||act==='speed'){
    let rawPool;
    if(act==='speed'){
      const isCached=SpeedQuizLoader.isCached(sMod);
      if(!isCached)showSpeedQuizLoading(sMod);
      try{rawPool=await loadSpeedPool(sMod);}
      catch(err){console.error('[PixelProf] SpeedQuiz load error:',err);showSpeedQuizError('Impossibile caricare lo speed quiz. Riprova o cambia modulo.');return;}
    }else{
      const isCached=QuizLoader.isCached(sMod);
      if(!isCached)showQuizLoading(sMod);
      try{rawPool=await loadPool(sMod);}
      catch(err){console.error('[PixelProf] Quiz load error:',err);showQuizLoadError(err.message||'Impossibile caricare il quiz. Riprova o contatta il sistema.');return;}
    }
    gsSet(GS.PLAYING);
    gameType=act;
    let pool=shuffle(rawPool);
    if(act==='speed'){const n=sN>0?sN:10;pool=pool.slice(0,Math.min(n,pool.length));}
    else if(sN>0){pool=pool.slice(0,Math.min(sN,pool.length));}
    qPool=pool;qIdx=0;qAnswered=false;qStart=Date.now();
    stopTimer();
    setTb(null);showScreen('tab-quiz');
    sh('qz-game').classList.remove('hidden');sh('qz-result').classList.add('hidden');
    if(act==='speed'){
      qSpeedLeft=60;
      sh('qz-timer').classList.remove('hidden');sh('qz-timer').textContent='60s';
      sh('qz-score-pill').classList.remove('hidden');sh('qz-score-val').textContent='0';
      sh('qz-pause-btn').classList.remove('hidden');sh('qz-pause-icon').className='ti ti-player-pause';
      qTimerInt=setInterval(()=>{
        if(!gsIs(GS.PLAYING))return;
        qSpeedLeft--;
        const el=sh('qz-timer');
        if(el){el.textContent=qSpeedLeft+'s';el.classList.toggle('red',qSpeedLeft<=10);}
        if(qSpeedLeft<=0){clearInterval(qTimerInt);forceEnd();}
      },1000);
    }else{
      sh('qz-timer').classList.add('hidden');sh('qz-score-pill').classList.add('hidden');sh('qz-pause-btn').classList.add('hidden');
    }
    renderQ();
  }else{
    gameType=act;
    setTb(null);showScreen('tab-games');
    if(act==='match')await startMatch(sh('g-area'),sMod);
    else if(act==='memory')await startMemory(sh('g-area'),sMod);
    else if(act==='fill')await startFill(sh('g-area'),sMod);
  }
}

/* ==================================================
   TEAM TURN ENGINE  v2.1.6
   Avvia la sessione per la squadra corrente.

   FIX ROUTING: per match/memory/fill avvia il gioco
   corretto invece di sempre renderQ().

   FIX DUPLICATI: per quiz/speed la squadra riceve
   solo domande non ancora usate nella partita,
   consumando il frozenPool in modo globale.
================================================== */
function _startTeamTurn(){
  const ms=matchState;
  const team=ms.isTiebreak?ms.tbTeams[ms.currentIdx]:ms.teams[ms.currentIdx];
  if(!team){console.error('[PixelProf] _startTeamTurn: team non trovato idx=',ms.currentIdx);matchReset();goHome();return;}

  // SESSION STATE per questo turno  isolato
  players=[{name:team.name,color:team.color,type:'sq'}];
  qScores={};qScores[team.name]=0;
  prevRank=getRank();
  gsSet(GS.PLAYING);
  gameType=sAct;

  // -- GIOCHI NON-QUIZ (match / memory / fill) --
  // Ognuno gioca la propria istanza indipendente  nessun pool condiviso,
  // nessun problema di duplicati.
  if(sAct==='match'||sAct==='memory'||sAct==='fill'){
    _showTeamTurnSplash(team,async()=>{
      setTb(null);showScreen('tab-games');
      const cont=sh('g-area');
      if(sAct==='match')  await startMatch(cont,sMod);
      else if(sAct==='memory') await startMemory(cont,sMod);
      else if(sAct==='fill')   await startFill(cont,sMod);
    });
    return;
  }

  // -- GIOCHI QUIZ / SPEED QUIZ --
  // Consuma le domande non ancora usate dal frozenPool globale.
  // Se il pool  esaurito o insufficiente, gestisce il caso dedicato.

  // Quante domande servono a questa squadra?
  const qNeeded = sAct==='speed'
    ? (sN>0 ? sN : 10)                          // speed: usa tutte quelle allocate
    : (sN>0 ? sN : (ms.frozenPool||[]).length);  // quiz: usa sN o tutto il pool

  // Filtra le domande non ancora usate
  const available=(ms.frozenPool||[]).filter(q=>!ms.usedQIds.has(q._uid));

  if(available.length===0){
    // Pool completamente esaurito  reshuffle controllato e reset tracking
    console.warn('[PixelProf] Pool esaurito — reshuffle controllato per nuova squadra');
    ms.usedQIds=new Set();
    const reshuffled=shuffle([...(ms.frozenPool||[])]);
    ms.frozenPool=reshuffled;
  }

  // Ri-filtra dopo eventuale reshuffle
  const freshAvailable=(ms.frozenPool||[]).filter(q=>!ms.usedQIds.has(q._uid));
  // Prende le prime qNeeded domande disponibili
  const teamPool=freshAvailable.slice(0,Math.min(qNeeded,freshAvailable.length));

  // Marca le domande di questo turno come usate
  teamPool.forEach(q=>ms.usedQIds.add(q._uid));

  qPool=teamPool;
  qIdx=0;qAnswered=false;qStart=Date.now();
  stopTimer();resetSpeedUI();

  // Mostra schermata transizione "Turno di X"
  _showTeamTurnSplash(team,()=>{
    // Dopo il countdown, avvia il quiz engine
    setTb(null);showScreen('tab-quiz');
    sh('qz-game').classList.remove('hidden');sh('qz-result').classList.add('hidden');
    if(sAct==='speed'){
      qSpeedLeft=60;
      sh('qz-timer').classList.remove('hidden');sh('qz-timer').textContent='60s';
      sh('qz-score-pill').classList.remove('hidden');sh('qz-score-val').textContent='0';
      sh('qz-pause-btn').classList.remove('hidden');sh('qz-pause-icon').className='ti ti-player-pause';
      qTimerInt=setInterval(()=>{
        if(!gsIs(GS.PLAYING))return;
        qSpeedLeft--;
        const el=sh('qz-timer');
        if(el){el.textContent=qSpeedLeft+'s';el.classList.toggle('red',qSpeedLeft<=10);}
        if(qSpeedLeft<=0){clearInterval(qTimerInt);forceEnd();}
      },1000);
    }else{
      sh('qz-timer').classList.add('hidden');sh('qz-score-pill').classList.add('hidden');sh('qz-pause-btn').classList.add('hidden');
    }
    if(qPool.length===0){
      // Nessuna domanda disponibile  mostra messaggio e passa al team successivo
      sh('qz-q').textContent='Domande esaurite per questa sessione.';
      sh('qz-opts').innerHTML='';
      setTimeout(()=>endQuiz(),1500);
      return;
    }
    renderQ();
  });
}

/* Schermata di transizione tra un turno e il successivo.
   Mostra "Tocca a: [squadra]" con countdown 3-2-1 poi chiama cb(). */
function _showTeamTurnSplash(team,cb){
  setTb(null);showScreen('tab-quiz');
  sh('qz-game').classList.add('hidden');
  sh('qz-result').classList.remove('hidden');
  const ms=matchState;
  const totalTeams=ms.isTiebreak?ms.tbTeams.length:ms.teams.length;
  const teamNum=ms.currentIdx+1;
  const isTb=ms.isTiebreak;
  const tbLabel=isTb?`<div style="font-size:10px;font-weight:700;color:#ffb400;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;font-family:'Share Tech Mono',monospace">⚡ Spareggio — Round ${ms.tbRound}</div>`:'';
  const progLabel=`Squadra ${teamNum} di ${totalTeams}`;
  // Scoreboard delle squadre che hanno gi giocato
  const doneTeams=(ms.isTiebreak?ms.tbTeams:ms.teams).slice(0,ms.currentIdx);
  const scoreboard=doneTeams.length?`<div style="margin-top:14px;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;font-size:12px;font-family:'Share Tech Mono',monospace">
    ${doneTeams.map(t=>`<div style="display:flex;justify-content:space-between;color:rgba(255,255,255,.5);margin-bottom:4px"><span style="color:${escAttr(t.color)}">${escHtml(t.name)}</span><span>${ms.scores[t.name]} pt</span></div>`).join('')}
  </div>`:'';
  sh('qz-result').innerHTML=`<div class="result-wrap" style="text-align:center;padding:2rem 1rem">
    ${tbLabel}
    <div style="font-size:10px;color:rgba(255,255,255,.3);font-family:'Share Tech Mono',monospace;letter-spacing:2px;margin-bottom:16px;text-transform:uppercase">${progLabel}</div>
    <div style="font-size:48px;margin-bottom:10px">${team.color?'🎮':'🎮'}</div>
    <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-family:'Share Tech Mono',monospace">Tocca a</div>
    <div style="font-size:26px;font-weight:700;color:${escAttr(team.color)};text-shadow:0 0 20px ${escAttr(team.color)}40;margin-bottom:4px">${escHtml(team.name)}</div>
    ${scoreboard}
    <div style="margin-top:24px;font-size:36px;font-weight:700;font-family:'Orbitron',monospace;color:var(--accent)" id="tb-countdown">3</div>
    <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:6px;font-family:'Share Tech Mono',monospace">Il gioco inizia tra poco…</div>
  </div>`;
  // FIX C1: se un countdown precedente è ancora vivo (es. splash multipli rapidi),
  // lo distrugge prima di crearne uno nuovo. Previene race condition e doppio avvio.
  if(matchState._splashInterval){
    clearInterval(matchState._splashInterval);
    matchState._splashInterval=null;
  }
  let n=3;
  matchState._splashInterval=setInterval(()=>{
    n--;
    const el=document.getElementById('tb-countdown');
    if(el)el.textContent=n>0?n:'Vai!';
    if(n<=0){
      // FIX C1: cleanup al termine naturale prima di invocare cb()
      clearInterval(matchState._splashInterval);
      matchState._splashInterval=null;
      setTimeout(cb,400);
    }
  },1000);
}

/* Chiamata da endQuiz() o showGameResult() quando sMode==='sq'.
   Accumula il punteggio, poi decide se passare al team successivo
   oppure se avviare lo spareggio o mostrare il risultato finale.

   v2.1.6: gestisce correttamente la fine turno per TUTTI i minigiochi
   (quiz, speed, match, memory, fill). */
function _onTeamTurnEnd(){
  const ms=matchState;
  const activeList=ms.isTiebreak?ms.tbTeams:ms.teams;
  const team=activeList[ms.currentIdx];

  // Accumula punteggio sessione nel MATCH STATE
  const sessionPts=qScores[team.name]||0;
  ms.scores[team.name]=(ms.scores[team.name]||0)+sessionPts;

  // Salva in lb (best score)  per match/memory/fill lo facciamo qui;
  // per quiz/speed endQuiz() non chiama questo path diretto
  saveLbEntry(team,ms.scores[team.name],sAct,sMod);

  ms.currentIdx++;

  if(ms.currentIdx<activeList.length){
    // Ci sono ancora squadre da giocare in questo round
    gsSet(GS.IDLE);
    setTimeout(()=>_startTeamTurn(),300);
  }else{
    // Tutti hanno giocato  controlla pareggio
    // Per match/memory/fill salva sessione ora (per quiz lo fa endQuiz)
    if(sAct==='match'||sAct==='memory'||sAct==='fill'){
      saveSessionResult(sAct,sMod);
      save();
    }
    _checkMatchEnd();
  }
}

/* Dopo che tutte le squadre hanno completato il loro turno:
   se c' un pareggio al primo posto  spareggio,
   altrimenti → schermata finale. */
function _checkMatchEnd(){
  const ms=matchState;
  const allTeams=ms.isTiebreak?ms.tbTeams:ms.teams;
  // Ordina per score desc
  const sorted=[...allTeams].sort((a,b)=>(ms.scores[b.name]||0)-(ms.scores[a.name]||0));
  const topScore=ms.scores[sorted[0].name]||0;
  const tied=sorted.filter(t=>(ms.scores[t.name]||0)===topScore);

  if(tied.length>1&&!ms.isTiebreak){
    //  SPAREGGIO: prepara un round con solo le squadre pari
    ms.isTiebreak=true;
    ms.tbTeams=tied;
    ms.currentIdx=0;
    ms.tbRound=1;
    // Pool spareggio: 1 domanda per squadra, nuova casualit
    const tbPool=shuffle([...(ms.frozenPool||[])]).slice(0,1);
    ms.frozenPool=tbPool.length>0?tbPool:null;
    _showTiebreakerIntro(tied,()=>_startTeamTurn());
  }else if(tied.length>1&&ms.isTiebreak){
    // Ancora pareggio  un altro round di spareggio
    ms.currentIdx=0;
    ms.tbRound++;
    const tbPool=shuffle([...(matchState._originalPool||ms.frozenPool||[])]).slice(0,1);
    ms.frozenPool=tbPool.length>0?tbPool:null;
    _showTiebreakerIntro(tied,()=>_startTeamTurn());
  }else{
    // Vincitore determinato
    saveSessionResult(sAct,sMod);
    save();
    _showMatchFinalResult();
  }
}

/* Banner "Pareggio  Spareggio!" prima di ogni round extra */
function _showTiebreakerIntro(tied,cb){
  const ms=matchState;
  // Preserva il pool originale per generare domande nuove a ogni round
  if(!ms._originalPool&&ms.frozenPool)ms._originalPool=[...ms.frozenPool];
  setTb(null);showScreen('tab-quiz');
  sh('qz-game').classList.add('hidden');
  sh('qz-result').classList.remove('hidden');
  const names=tied.map(t=>`<span style="color:${escAttr(t.color)};font-weight:700">${escHtml(t.name)}</span>`).join(' <span style="color:rgba(255,255,255,.3)">vs</span> ');
  sh('qz-result').innerHTML=`<div class="result-wrap" style="text-align:center;padding:2rem 1rem">
    <div style="font-size:40px;margin-bottom:14px">⚡</div>
    <div style="font-family:'Orbitron',monospace;font-size:18px;font-weight:900;color:#ffb400;text-shadow:0 0 20px #ffb40060;margin-bottom:6px">PAREGGIO!</div>
    <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:14px">Stessi punti — parte lo spareggio</div>
    <div style="font-size:14px;line-height:2">${names}</div>
    <div style="margin-top:20px;font-size:11px;color:rgba(255,255,255,.3);font-family:'Share Tech Mono',monospace">Round ${ms.tbRound} · 1 domanda per squadra</div>
    <div style="margin-top:20px;font-size:28px;font-weight:700;font-family:'Orbitron',monospace;color:#ffb400" id="tb-countdown">3</div>
  </div>`;
  let n=3;
  // FIX C1: usa lo stesso slot _splashInterval di _showTeamTurnSplash.
  // Cleanup anti-istanza multipla + tracking per matchReset().
  if(matchState._splashInterval){
    clearInterval(matchState._splashInterval);
    matchState._splashInterval=null;
  }
  matchState._splashInterval=setInterval(()=>{
    n--;
    const el=document.getElementById('tb-countdown');
    if(el)el.textContent=n>0?n:'Via!';
    if(n<=0){
      // FIX C1: cleanup al termine naturale
      clearInterval(matchState._splashInterval);
      matchState._splashInterval=null;
      setTimeout(cb,400);
    }
  },1000);
}

/* Schermata finale della partita a squadre 
   mostra SOLO i risultati della partita corrente, nessuna classifica storica. */
function _showMatchFinalResult(){
  const ms=matchState;
  gsSet(GS.FINISHED);
  stopTimer();stopMemTimer();
  // Ordina squadre per punteggio desc
  const sorted=[...ms.teams].sort((a,b)=>(ms.scores[b.name]||0)-(ms.scores[a.name]||0));
  const rank=sorted.map(t=>t.name);
  const scoreMap=Object.assign({},ms.scores);
  const winner=sorted[0];
  const medals=['🥇','🥈','🥉'];
  // Build classifica corrente (non storica)
  const rankRows=sorted.map((t,i)=>{
    const pts=ms.scores[t.name]||0;
    const medal=i<3?medals[i]:''+(i+1)+'.';
    return`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:${i===0?'rgba(255,215,0,.07)':'rgba(255,255,255,.03)'};border:1px solid ${i===0?'rgba(255,215,0,.2)':'rgba(255,255,255,.07)'};margin-bottom:6px">
      <span style="font-size:20px;width:28px;text-align:center">${medal}</span>
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${escAttr(t.color)};box-shadow:0 0 6px ${escAttr(t.color)};flex-shrink:0"></span>
      <span style="flex:1;font-weight:600;color:#fff">${escHtml(t.name)}</span>
      <span style="font-family:'Share Tech Mono',monospace;font-weight:700;font-size:15px;color:${i===0?'#ffd700':'var(--accent)'}">${pts} pt</span>
    </div>`;
  }).join('');
  const tbNote=ms.isTiebreak?`<div style="margin-bottom:12px;padding:6px 12px;border-radius:20px;background:rgba(255,180,0,.1);border:1px solid rgba(255,180,0,.2);font-size:11px;color:#ffb400;text-align:center;font-family:'Share Tech Mono',monospace">⚡ Deciso ai supplementari — Round ${ms.tbRound}</div>`:'';
  setTb(null);showScreen('tab-quiz');
  sh('qz-game').classList.add('hidden');
  sh('qz-result').classList.remove('hidden');
  sh('qz-result').innerHTML=`<div class="result-wrap">
    <div class="result-hero">
      <span class="result-stars">🏆</span>
      <span class="result-score" style="font-size:22px;line-height:1.3;margin-bottom:4px">${escHtml(winner.name)}</span>
      <span class="result-label">vince la partita con ${ms.scores[winner.name]} pt</span>
    </div>
    ${tbNote}
    <div style="font-size:10px;font-weight:700;color:rgba(0,255,200,.6);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;display:flex;align-items:center;gap:8px">
      Classifica partita corrente
      <span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(0,255,200,.2),transparent)"></span>
    </div>
    ${rankRows}
    <div class="btn-row" style="margin-top:20px">
      <button class="btn" onclick="matchReset();goHome()"><i class="ti ti-home"></i> Home</button>
      <button class="btn" onclick="_restartWholeMatch()"><i class="ti ti-refresh"></i> Rivincita</button>
      <button class="btn btn-neon" onclick="goTab('lb')"><i class="ti ti-trophy"></i> Classifica</button>
    </div>
  </div>`;
  launchConfetti();
  matchReset();
}

/* Rivincita: stesse squadre, nuova partita */
function _restartWholeMatch(){
  // sTeams  ancora valido dalla sessione corrente
  matchReset();
  launch();
}

/* Full Speed Quiz UI reset  called before every launch/restart */

/* ==================================================
   SAVE SCORE TO LB2  extended schema
================================================== */
/* ==================================================
   saveLbEntry — v4.0.6
   Incorpora hook_saveLbEntry cloud (ex override in app.js).
================================================== */
function saveLbEntry(player, pts, act, mod){
  const type=player.type; // 'ind' | 'sq'
  if(!db.lb2[type])db.lb2[type]={};
  if(!db.lb2[type][act])db.lb2[type][act]={};
  const bucket=db.lb2[type][act];
  const key=player.name;
  const existing=bucket[key];
  // Keep best score per (player, activity, mod) combination
  // We store an array of entries so we can show per-module breakdown
  if(!existing){
    bucket[key]={entries:[{pts,mod,games:1}],color:player.color||null};
  }else{
    // find entry for same mod
    const idx=existing.entries.findIndex(e=>e.mod===mod);
    if(idx>=0){
      existing.entries[idx].games++;
      if(pts>existing.entries[idx].pts)existing.entries[idx].pts=pts;
    }else{
      existing.entries.push({pts,mod,games:1});
    }
    if(player.color)existing.color=player.color;
  }
  // Cloud hook — fire-and-forget
  if(typeof window.hook_saveLbEntry==='function') window.hook_saveLbEntry(player,pts,act,mod);
}

/* Persiste la sessione completa  usata alla fine di ogni partita.
   Struttura: { course, game, mode, teams[], timestamp }
   Salvata in db.sessions (array append-only, max 100 voci).
   v4.0.6: incorpora hook_saveSession cloud (ex override in app.js). */
function saveSessionResult(act, mod){
  if(!db.sessions)db.sessions=[];
  // In modalit squadre usa il quadro completo del matchState
  const teamsSnapshot=sMode==='sq'&&matchState.teams.length
    ?matchState.teams.map(t=>({name:t.name,color:t.color,score:matchState.scores[t.name]||0}))
    :players.map(p=>({name:p.name,color:p.color,score:qScores[p.name]||0}));
  const entry={
    course: activeCourseId||null,
    game:   act,
    mod:    mod,
    mode:   sMode,
    teams:  teamsSnapshot,
    timestamp: new Date().toISOString(),
  };
  db.sessions.push(entry);
  if(db.sessions.length>100)db.sessions=db.sessions.slice(-100);
  // Cloud hook — fire-and-forget
  if(typeof window.hook_saveSession==='function'){
    const participants=sMode==='sq'&&matchState.teams.length
      ?matchState.teams.map(t=>({name:t.name,color:t.color,score:matchState.scores[t.name]||0,type:'sq'}))
      :players.map(p=>({name:p.name,color:p.color,score:qScores[p.name]||0,type:'ind'}));
    window.hook_saveSession(act,mod,sMode,participants,activeCourseId,qPool.length||null);
  }
}

/* ==================================================
   RANKING
================================================== */
function getRank(){return[...players].sort((a,b)=>(qScores[b.name]||0)-(qScores[a.name]||0)).map(p=>p.name);}

function renderLiveBar(){
  const bar=sh('live-bar');if(!bar)return;
  // In modalit squadre mostra solo la squadra che sta giocando ora
  // (players ha sempre un solo elemento durante un turno squadra)
  const sorted=[...players].sort((a,b)=>(qScores[b.name]||0)-(qScores[a.name]||0));
  const next=sorted.map(p=>`<div class="live-chip"><div class="dot" style="background:${escAttr(p.color)};box-shadow:0 0 6px ${escAttr(p.color)}"></div>${escHtml(p.name)}<span class="pts">${qScores[p.name]||0}</span></div>`).join('');
  if(bar.innerHTML!==next)bar.innerHTML=next;
  // Etichetta turno: in individuale mai mostrata; in sq mostra avanzamento partita
  const tl=sh('turn-lbl');
  if(tl){
    if(sMode==='sq'&&matchState.active){
      const ms=matchState;
      const activeList=ms.isTiebreak?ms.tbTeams:ms.teams;
      const label=ms.isTiebreak
        ?`⚡ Spareggio R${ms.tbRound} — ${activeList[ms.currentIdx]?.name||''}`
        :`Squadra ${ms.currentIdx+1}/${activeList.length}`;
      tl.textContent=label;
      tl.style.color=players[0]?.color||'rgba(255,255,255,.4)';
    }else{
      tl.textContent='';
    }
  }
}

function checkOvertake(){const nr=getRank();if(nr.length<2)return;for(let i=0;i<nr.length-1;i++){if(prevRank.indexOf(nr[i])>i){doOvertake(nr[i],nr[i+1]||'');break;}}prevRank=nr;}
function doOvertake(w,l){sh('ot-text').textContent=w+(l?' sorpassa '+l:'')+' !';sh('overtake-popup').style.display='block';launchConfetti();setTimeout(()=>sh('overtake-popup').style.display='none',3000);}
function launchConfetti(){const cv=sh('confetti-canvas');cv.style.display='block';cv.width=window.innerWidth;cv.height=window.innerHeight;const ctx=cv.getContext('2d');const pp=Array.from({length:70},()=>({x:Math.random()*cv.width,y:-20,r:Math.random()*5+3,d:Math.random()*6+2,c:COLORS[Math.floor(Math.random()*COLORS.length)],ta:0,ts:Math.random()*.1+.05,t:0}));let f=0;function draw(){ctx.clearRect(0,0,cv.width,cv.height);pp.forEach(p=>{ctx.beginPath();ctx.lineWidth=p.r/2;ctx.strokeStyle=p.c;ctx.moveTo(p.x+p.t+p.r/3,p.y);ctx.lineTo(p.x+p.t,p.y+p.t+p.r/3);ctx.stroke();p.ta+=p.ts;p.y+=Math.cos(p.d)+1.5;p.x+=Math.sin(p.d*.3);p.t=Math.sin(p.ta)*12;});f++;if(f<100)requestAnimationFrame(draw);else cv.style.display='none';}requestAnimationFrame(draw);}

/* ==================================================
   GAME RESULT (non-quiz: match, memory, fill)
   v2.1.6: in modalit squadre delega a _onTeamTurnEnd()
   invece di mostrare il risultato finale individuale.
================================================== */
function showGameResult(name,detail,scoreMap){
  gsSet(GS.FINISHED);
  stopMemTimer();
  stopMatchTimer();

  // -- MODALIT SQUADRE: accumula punteggio e passa al turno successivo --
  if(sMode==='sq'&&matchState.active){
    // Il punteggio del giocatore corrente  gi in qScores (impostato da
    // mSel/memFlip/renderFill prima di chiamare showGameResult)
    save();
    _onTeamTurnEnd();
    return;
  }

  // -- MODALIT INDIVIDUALE: comportamento originale --
  const rank=getRank();
  sh('g-area').innerHTML=`<div class="result-wrap"><div class="result-hero"><span class="result-stars">⭐⭐⭐</span><span class="result-score" style="font-size:30px;margin-bottom:6px">${name}</span><span class="result-label">${detail}</span></div>${buildPodiumHTML(rank,scoreMap)}<div class="btn-row"><button class="btn" onclick="goHome()"><i class="ti ti-home"></i> Home</button><button class="btn" onclick="launch()"><i class="ti ti-refresh"></i> Ricomincia</button><button class="btn btn-neon" onclick="goTab('lb')"><i class="ti ti-trophy"></i> Classifica</button></div></div>`;
}

/* ==================================================
   LEADERBOARD  3-STEP NAVIGATION
================================================== */
function lbShowStep(step){
  ['type','act','results'].forEach(s=>sh('lb-step-'+s).classList.toggle('hidden',s!==step));
}

function lbSelectType(type){
  lbType=type;lbAct=null;
  lbShowStep('act');
  // Update nav breadcrumb
  const typeLabel=type==='ind'?'🧑‍💻 Individuale':'🏆 Squadre';
  sh('lb-nav-act').innerHTML=`
    <span class="lb-nav-crumb" onclick="lbShowStep('type');lbType=null"><i class="ti ti-trophy"></i> Classifica</span>
    <span class="lb-nav-sep">/</span>
    <span class="lb-nav-crumb current">${typeLabel}</span>`;
  // Highlight active type in activity buttons
  document.querySelectorAll('.lb-act-btn').forEach(b=>b.classList.remove('active'));
}

function lbSelectAct(act){
  lbAct=act;
  lbShowStep('results');
  // Highlight button
  document.querySelectorAll('.lb-act-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('.lb-act-btn.a-'+act)?.classList.add('active');
  // Nav
  const typeLabel=lbType==='ind'?'🧑‍💻 Individuale':'🏆 Squadre';
  const actLabel=ACT_ICON[act]+' '+ACT_LABEL[act];
  sh('lb-nav-results').innerHTML=`
    <span class="lb-nav-crumb" onclick="lbShowStep('type');lbType=null"><i class="ti ti-trophy"></i> Classifica</span>
    <span class="lb-nav-sep">/</span>
    <span class="lb-nav-crumb" onclick="lbSelectType('${lbType}')">${typeLabel}</span>
    <span class="lb-nav-sep">/</span>
    <span class="lb-nav-crumb current">${actLabel}</span>`;
  renderLbResults(lbType,act);
}
