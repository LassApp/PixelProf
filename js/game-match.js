/* ==================================================
   game-match.js — PixelProf v5.0.4 commento prova
   Abbina (match) game: timer, combo scoring, pair logic.
   Fase 8: PauseUIRegistry handler registrato (M2).
   Depends on: game-engine-state.js, scoring.js
   v5.1.0 (app v8.36.0): getMatchSet() rispetta ora il toggle
   "includi domande difficili" del setup-panel (db.diffPrefs.match).
   A differenza degli altri minigiochi la difficoltà qui è per
   ROUND (5 coppie), non per singola voce — vedi AbbinLoader.normalize
   in game-engine-state.js, che ora restituisce {difficulty,pairs}
   per ogni set invece del semplice array di pair.
================================================== */

/* -- Per-pair color palette -- */
// v9: intonati alla palette (prima neon puri) — stesso ruolo (una
// tinta per coppia nel minigioco Abbina), stessa famiglia già usata
// altrove nel redesign.
// v8.45.0: tolta la terracotta #AB5649 (è il colore dell'errore: una coppia giusta non deve
// "sembrare" sbagliata) e riordinata la lista: le prime 5 tinte — quelle che servono in un round —
// sono tutte di famiglie diverse (salvia, fango, slate, rosa, miele). Restano oliva e salvia scuro
// come riserva. In chiaro/scuro la tinta non colora il testo: lo fa abbina.css (--pc-ink).
const PAIR_COLORS=[
  '#4E7464','#7A5A38','#54708C','#9D5875',
  '#B8935A','#6E7A50','#4A6B52'
];

/* ==================================================
   MATCH
================================================== */

/* CODE-03: centralized game header builder
   (Fill, Memory e Vero/Falso gli passano un secondo argomento storico — la stringa della chiamata di
   riavvio — che qui NON viene usato: per questo il v8.45.0 non aggiunge un parametro "classe" ma lascia
   la firma com'era; Abbina aggiunge .match-bar da sola, vedi startMatch.) */
function buildGameHeader(rightContent){
  return`<div class="game-header"><div class="game-header-left"><button class="game-exit-btn" onclick="ppConfirm(()=>goHome('cat'))"><i class="ti ti-x"></i> Esci</button><button class="game-restart-btn" onclick="restartActivity()"><i class="ti ti-refresh"></i> Ricomincia</button></div>${rightContent}</div>`;
}

async function getMatchSet(mod){
  const sets = await loadAbbinSets(mod); // [{difficulty,pairs:[{t,d},...]}, ...]
  const includeHard = !!(db.diffPrefs && db.diffPrefs['match']);
  let pool = includeHard ? sets : sets.filter(s=>s.difficulty!=='hard');
  if(!pool.length) pool = sets; // rete di sicurezza: mai restare senza round disponibili
  const chosen = pool[Math.floor(Math.random()*pool.length)];
  return shuffle(chosen.pairs).slice(0,5);
}

/* ==================================================
   ABBINA v2.1.6  timer  combo  per-pair colors
   
   SCORING FORMULA:
     base per coppia corretta  : 100 pt
     moltiplicatore combo       : combo (max 5)
     penalit per errore        : 30 pt (min 0)
     bonus tempo finale         : +timeLeft  5 pt
   COMBO RULES:
     match corretto   combo++  (cap 5)
     errore           combo = 1
================================================== */

/* Timer state per Abbina  isolato da memTimer/speedTimer
   v4.0.8 I1 fix: mPaused sempre sincronizzato. Fonte di verità
   per "è in pausa?" = mTimerInt === null (timer fermo). */
let mTimerInt=null;
let mTimeLeft=0;
let mPaused=false;
let _matchRO=null;   // v8.45.0: ResizeObserver che ridisegna i fili quando la scacchiera cambia misura

function stopMatchTimer(){
  if(mTimerInt){clearInterval(mTimerInt);mTimerInt=null;}
  mTimeLeft=0;mPaused=false;
  if(_matchRO){_matchRO.disconnect();_matchRO=null;}
}
function pauseMatchTimer(){
  // Guard: non tentare di fermare un timer già fermo
  if(mTimerInt){clearInterval(mTimerInt);mTimerInt=null;}
  mPaused=true; // sempre sincronizzato
}
function resumeMatchTimer(){
  mPaused=false; // sempre sincronizzato
  _startMatchInterval();
}
function _startMatchInterval(){
  // Guard: non avviare se già un intervallo attivo
  if(mTimerInt) return;
  mTimerInt=setInterval(()=>{
    // Double-check: blocca tick se gsState è PAUSED o non PLAYING
    if(!gsIs(GS.PLAYING))return;
    mTimeLeft--;
    _updateMatchTimerUI();
    if(mTimeLeft<=0){clearInterval(mTimerInt);mTimerInt=null;_matchTimeUp();}
  },1000);
}

/* ── Abbina (Match) timer ─────────────────────────
   v4.0.8 I1 fix: fnIsRunning usa solo mTimerInt (non !mPaused ridondante).
   TimerManager.pauseAll() chiama fnPause() solo se fnIsRunning() è true.
─────────────────────────────────────────────────── */
TimerManager.register(
  'match',
  /* pause  */ () => { pauseMatchTimer(); },
  /* resume */ () => { resumeMatchTimer(); },
  /* stop   */ () => { stopMatchTimer(); },
  /* isRunning */ () => mTimerInt !== null   // timer attivo = non in pausa
);

function _updateMatchTimerUI(){
  const el=document.getElementById('match-timer-val');
  if(!el)return;
  el.textContent=mTimeLeft+'s';
  const pill=el.closest('.mem-stat-pill');
  if(pill){
    pill.classList.toggle('timer-warning',mTimeLeft<=10);
    pill.classList.toggle('timer-running',mTimeLeft>10);
  }
}

function _updateMatchScoreUI(){
  const el=document.getElementById('match-score-val');
  if(el)el.textContent=mState.score||0;
}

function _updateMatchComboUI(){
  const s=mState;
  const pill=document.getElementById('match-combo-pill');
  if(!pill)return;
  const c=s.combo||1;
  const label=c>=5?'🔥 ×'+c:'×'+c;
  pill.textContent=label;
  // class tier
  pill.className='match-combo-pill '+(c>=5?'xmax':c===4?'x4':c===3?'x3':c===2?'x2':'x1');
  // bump animation
  if(c>1){
    pill.classList.remove('combo-bump');
    void pill.offsetWidth;
    pill.classList.add('combo-bump');
    pill.addEventListener('animationend',()=>pill.classList.remove('combo-bump'),{once:true});
  }
}

/* -- _applyNextColor: calcola nextPairColor e lo scrive come --pair-color su tutte le voci non
   ancora abbinate. Chiamata all'avvio e dopo ogni match corretto.
   v8.45.0: solo la variabile. Prima qui si aggiungevano anche listener mouseenter/mouseleave e
   stili inline (bordo, colore del testo, sfondo) per hover e selezione: ora hover, selezione e
   abbinamento sono tutti in abbina.css e leggono --pair-color — niente più colore del testo
   cambiato via JS, quindi niente più testo colorato illeggibile su sfondo chiaro. -- */
function _applyNextColor(){
  const s=mState;
  const usedColors=Object.values(s.pairColorMap);
  const availColors=PAIR_COLORS.filter(c=>!usedColors.includes(c));
  s.nextPairColor = availColors.length>0
    ? availColors[0]
    : PAIR_COLORS[s.matched.size % PAIR_COLORS.length];

  document.querySelectorAll('.match-item:not(.matched)').forEach(el=>{
    el.style.setProperty('--pair-color', s.nextPairColor);
  });
}

/* Converte hex (#rrggbb) in "r,g,b" per rgba() — usata anche da game-quiz.js */
function _hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   v8.45.0 — FILI ONDULATI tra termine e definizione abbinati
   Ogni coppia giusta è collegata da un filo nel colore della coppia (stesso colore di voce, porta e
   pallino di avanzamento). Il filo è un SVG sopra lo sfondo e sotto le voci (#match-wires, dentro
   #match-stage): i suoi estremi sono i CENTRI delle due porte (.mi-port), misurati sul DOM con
   getBoundingClientRect — così seguono qualsiasi altezza di riga (definizioni lunghe che vanno a
   capo) e si ridisegnano da soli a ogni resize / caricamento font (ResizeObserver su #match-board).
   Forma: curva a S con tangenti orizzontali + sinusoide perpendicolare che si spegne agli estremi;
   il numero di semionde è sempre intero, così l'onda chiude in fase sulla porta d'arrivo.
   L'anteprima (tratteggio puntinato) parte dalla voce selezionata e segue il mouse fino alla
   voce dell'altra colonna su cui si passa sopra.
   ══════════════════════════════════════════════════════════════════════════ */
const _MATCH_NAR_W=540;   // sotto questa larghezza della scacchiera: layout stretto (niente badge, filo più basso)
const _MATCH_ICO={
  ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5l10-10"/></svg>',
  ko:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6l-12 12M6 6l12 12"/></svg>'
};

function _matchWavePath(x0,y0,x1,y1,A,per){
  const N=72, c=(x1-x0)*0.5;
  const bez=t=>{const u=1-t;return[
    u*u*u*x0+3*u*u*t*(x0+c)+3*u*t*t*(x1-c)+t*t*t*x1,
    u*u*u*y0+3*u*u*t*y0+3*u*t*t*y1+t*t*t*y1];};
  let L=0,prev=bez(0);
  for(let i=1;i<=24;i++){const p=bez(i/24);L+=Math.hypot(p[0]-prev[0],p[1]-prev[1]);prev=p;}
  const k=Math.max(1.5,Math.round(L/per*2)/2);
  const pts=[];
  for(let i=0;i<=N;i++){
    const t=i/N, p=bez(t), q=bez(Math.min(1,t+0.001)), r=bez(Math.max(0,t-0.001));
    let tx=q[0]-r[0], ty=q[1]-r[1]; const m=Math.hypot(tx,ty)||1; tx/=m; ty/=m;
    const off=A*Math.pow(Math.sin(Math.PI*t),0.7)*Math.sin(2*Math.PI*k*t);
    pts.push([p[0]-ty*off, p[1]+tx*off]);
  }
  return 'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L');
}

/* argomento stringa per un onclick inline: prima l'escape JavaScript (\ e '), poi quello HTML.
   v8.45.0 FIX: con solo escAttr() un apostrofo diventava &#39; → il browser lo ridecodifica in ' PRIMA di
   compilare l'handler e il termine "Superficie d'attacco" produceva mSel('t','Superficie d'attacco') →
   SyntaxError, quindi il click non faceva nulla e la coppia non si poteva abbinare (98 termini
   con apostrofo nei dati di Abbina). */
function _matchJsArg(s){
  return escAttr(String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"));
}

function _matchTermEl(t){ return document.getElementById('mt_'+String(t).replace(/\W/g,'_')); }

/* icona nella porta della voce: 'ok' (✓ abbinata), 'ko' (✕ errore) o null (vuota) */
function _matchPort(el,kind){
  const p=el&&el.querySelector('.mi-port');
  if(p)p.innerHTML=kind?_MATCH_ICO[kind]:'';
}

function _matchRedrawWires(){
  const s=mState;
  if(!s||gameType!=='match')return;
  const board=document.getElementById('match-board');
  const stage=document.getElementById('match-stage');
  const svg=document.getElementById('match-wires');
  const wrap=document.getElementById('match-cols-wrap');
  if(!board||!stage||!svg||!wrap)return;
  // layout stretto: la classe va impostata PRIMA di misurare (cambia altezze e gutter)
  board.classList.toggle('nar',board.clientWidth<_MATCH_NAR_W);
  const nar=board.classList.contains('nar');
  const sr=stage.getBoundingClientRect();
  if(!sr.width||!sr.height)return;
  const A=nar?3.5:4.5, per=nar?36:42;
  const xy=el=>{
    const p=el.querySelector('.mi-port')||el, r=p.getBoundingClientRect();
    return [r.left+r.width/2-sr.left, r.top+r.height/2-sr.top];
  };
  let g='';
  s.links.forEach(l=>{
    if(!l.te.isConnected||!l.de.isConnected)return;
    const a=xy(l.te), b=xy(l.de), d=_matchWavePath(a[0],a[1],b[0],b[1],A,per);
    g+=`<g class="mw" style="--pair-color:${l.color}"><path class="mw-halo" d="${d}"/><path class="mw-line" d="${d}"/></g>`;
  });
  // anteprima: dalla voce selezionata alla voce sotto il mouse (o, senza mouse, un breve tratto verso l'altra colonna)
  const selEl=s.selT!=null?_matchTermEl(s.selT):(s.selD!=null?document.getElementById('md_'+s.selD):null);
  if(selEl&&selEl.isConnected&&!selEl.classList.contains('matched')){
    const fromT=selEl.classList.contains('mi-t');
    const a=xy(selEl), h=s.hoverEl;
    let b;
    if(h&&h.isConnected&&h.classList.contains(fromT?'mi-d':'mi-t')&&!h.classList.contains('matched')&&!h.classList.contains('locked')){
      b=xy(h);
    }else{
      const cols=wrap.children;
      const gap=cols.length>1?cols[1].getBoundingClientRect().left-cols[0].getBoundingClientRect().right:60;
      b=[a[0]+(fromT?1:-1)*gap*0.42, a[1]];
    }
    const d=_matchWavePath(a[0],a[1],b[0],b[1],A*0.9,34);
    g+=`<g class="mw mw-pv" style="--pair-color:${s.nextPairColor}"><path class="mw-prev" d="${d}"/></g>`;
  }
  svg.setAttribute('width',sr.width.toFixed(1));
  svg.setAttribute('height',sr.height.toFixed(1));
  svg.setAttribute('viewBox','0 0 '+sr.width.toFixed(1)+' '+sr.height.toFixed(1));
  svg.innerHTML=g;
}

/* voce sotto il mouse (solo per l'anteprima del filo) */
function _matchSetHover(el){
  const s=mState;
  if(!s)return;
  const h=(el&&!el.classList.contains('matched')&&!el.classList.contains('locked'))?el:null;
  if(s.hoverEl===h)return;
  s.hoverEl=h;
  if(s.selT!=null||s.selD!=null)_matchRedrawWires();
}

/* pallini di avanzamento nell'intestazione + contatore n/5 */
function _updateMatchProgressUI(){
  const s=mState;
  if(!s)return;
  document.querySelectorAll('#match-pips .match-pip').forEach((p,i)=>{
    const l=s.links[i];
    p.classList.toggle('on',!!l);
    if(l)p.style.setProperty('--pair-color',l.color);else p.style.removeProperty('--pair-color');
  });
  const el=document.getElementById('match-prog-n');
  if(el)el.textContent=s.links.length+'/'+s.pairs.length;
}

let _matchRedrawRaf=0;
if(typeof window!=='undefined'){
  window.addEventListener('resize',()=>{
    if(gameType!=='match'||_matchRedrawRaf)return;
    _matchRedrawRaf=requestAnimationFrame(()=>{_matchRedrawRaf=0;_matchRedrawWires();});
  });
}

function _matchTimeUp(){
  // Tempo scaduto: concludi con punteggio attuale
  if(!gsIs(GS.PLAYING)&&!gsIs(GS.PAUSED))return;
  _matchFinish(false);
}

function _matchFinish(allMatched){
  gsSet(GS.FINISHED);
  stopMatchTimer();
  const s=mState;
  // Bonus tempo: +5 per ogni secondo residuo
  const timeBonus=allMatched?(mTimeLeft*5):0;
  const finalScore=Math.max(0,(s.score||0)+timeBonus);
  s.score=finalScore;

  const detail=allMatched
    ?`${s.matched.size}/${s.pairs.length} coppie · +${timeBonus} bonus tempo · ${finalScore} pt`
    :`${s.matched.size}/${s.pairs.length} coppie abbinate · tempo scaduto · ${finalScore} pt`;

  const scoreMap={};
  players.forEach(p=>{ qScores[p.name]=finalScore; scoreMap[p.name]=finalScore; });
  if(sMode!=='sq'||!matchState.active){
    players.forEach(p=>saveLbEntry(p,finalScore,'match',sMod));
    // v6.5.0: maxCombo alimenta il badge "Combo Perfetta" (×5)
    saveSessionResult('match',sMod,{maxCombo:s.maxCombo||1});save();
  }
  setTimeout(()=>showGameResult('Abbina',detail,scoreMap),600);
}

async function startMatch(cont,mod){
  // Ferma eventuale timer precedente
  stopMatchTimer();

  const isCached=AbbinLoader.isCached(mod);
  if(!isCached) showAbbinLoading(cont,mod);
  let pairs;
  try{
    pairs=await getMatchSet(mod);
  }catch(err){
    console.error('[PixelProf] Abbina load error:',err);
    showAbbinError('Impossibile caricare il gioco Abbina. Riprova o cambia modulo.');
    return;
  }

  gsSet(GS.PLAYING);
  gameType='match';

  const terms=shuffle(pairs.map(p=>p.t));
  const defs=shuffle(pairs.map(p=>p.d));

  mState={
    pairs,
    defs,
    selT:null,
    selD:null,
    matched:new Set(),   // Set of term strings (one per matched pair)
    errors:0,
    combo:1,
    maxCombo:1,          // v6.5.0: combo massimo raggiunto in questa run — per badge "Combo Perfetta"
    score:0,
    pairColorMap:{},     // term → color string
    nextPairColor: PAIR_COLORS[0], // pre-computed color ready for the next match
    links:[],            // v8.45.0: coppie abbinate, in ordine → {t, di, color, te, de}: servono a disegnare i fili
    hoverEl:null,        // v8.45.0: voce sotto il mouse (solo anteprima del filo)
  };

  // Init timer
  mTimeLeft=60;
  mPaused=false;

  const hdr=buildGameHeader(
    `<div class="match-hdr">
      <div class="mem-stat-pill timer-running"><i class="ti ti-clock"></i><span id="match-timer-val">60s</span></div>
      <div class="mem-stat-pill score-pill"><i class="ti ti-star"></i><span id="match-score-val">0</span></div>
      <div class="mem-stat-pill err-pill"><i class="ti ti-x"></i><span id="match-err-val">0</span></div>
      <div class="match-combo-pill x1" id="match-combo-pill">×1</div>
      <button class="mem-pause-btn" id="match-pause-btn" onclick="matchTogglePause()"><i class="ti ti-player-pause" id="match-pause-icon"></i></button>
    </div>`
  ).replace('class="game-header"','class="game-header match-bar"');   // v8.45.0: barra a scheda sotto i 1000px (abbina.css)

  /* v8.45.0 — scacchiera a scheda: intestazione (icona, aiuto, avanzamento), due colonne con le
     porte ai bordi e i fili ondulati nel mezzo, riga di feedback. Gli id e la struttura che usano
     i test e11y/e2e restano: #match-cols-wrap con ESATTAMENTE due <div> figli (termini, poi
     definizioni), ognuno con le sue .match-item; #mfb; #match-paused-overlay; #match-pause-btn.
     L'SVG dei fili (#match-wires) è fratello del wrap dentro #match-stage, PRIMA del wrap nel DOM:
     così sta sotto le voci e i suoi estremi spariscono dietro le porte. */
  /* v8.45.0 FIX: il termine finiva nell'onclick come mSel('t','<termine>') con escAttr(), che protegge solo
     l'HTML: il browser decodifica &#39; PRIMA di eseguire il JS, quindi un apostrofo (o un backslash) nel
     termine chiudeva la stringa → SyntaxError al click e termine non selezionabile. Succedeva con i termini
     tipo "Diritto all'oblio" / "Superficie d'attacco" (119 su 2172 nei file data/). Ora il termine passa come
     stringa JSON (escape corretto di apici, virgolette e backslash) dentro l'attributo HTML-escapato. */
  const n=pairs.length;
  const letter=i=>String.fromCharCode(65+i);
  cont.innerHTML=`${hdr}
    <div class="match-board" id="match-board">
      <div class="match-hd">
        <span class="match-hd-ic" aria-hidden="true"><i class="ti ti-link"></i></span>
        <span class="match-hint">Clicca un termine poi la sua definizione</span>
        <span class="match-prog">
          <span class="match-pips" id="match-pips" aria-hidden="true">${pairs.map(()=>'<span class="match-pip"></span>').join('')}</span>
          <span id="match-prog-n">0/${n}</span>
        </span>
      </div>
      <div class="match-stage" id="match-stage">
        <svg class="match-wires" id="match-wires" aria-hidden="true"></svg>
        <div class="match-cols" id="match-cols-wrap" style="grid-template-rows:auto repeat(${n},auto)">
          <div class="match-col">
            <div class="col-lbl"><span>Termini</span><span class="col-cnt">${n}</span><span class="col-rule"></span></div>
            ${terms.map((t,i)=>`<button class="match-item mi-t" id="mt_${t.replace(/\W/g,'_')}" onclick="mSel('t',${escAttr(JSON.stringify(t))})"><span class="mi-bd" aria-hidden="true">${i+1}</span><span class="mi-tx">${escHtml(t)}</span><span class="mi-port" aria-hidden="true"></span></button>`).join('')}
          </div>
          <div class="match-col">
            <div class="col-lbl"><span>Definizioni</span><span class="col-cnt">${n}</span><span class="col-rule"></span></div>
            ${defs.map((d,i)=>`<button class="match-item mi-d" id="md_${i}" onclick="mSel('d',${i})"><span class="mi-port" aria-hidden="true"></span><span class="mi-tx">${escHtml(d)}</span><span class="mi-bd" aria-hidden="true">${letter(i)}</span></button>`).join('')}
          </div>
        </div>
      </div>
      <div class="match-fb" id="mfb" aria-live="polite"></div>
      <!-- Pause overlay — mirrors Memory/Speed Quiz pattern (v8.45.0: copre tutta la scheda) -->
      <div class="match-paused-overlay hidden" id="match-paused-overlay" onclick="matchTogglePause()">
        <div class="pp-pause-btn">▶</div>
        <div class="pp-pause-text">Premi per continuare</div>
      </div>
    </div>`;

  // Start countdown
  _startMatchInterval();

  // Apply initial color to all chips so :hover and .sel work immediately
  // Must run after innerHTML is set so the DOM elements exist
  _applyNextColor();

  // v8.45.0: anteprima del filo (mouse) + ridisegno dei fili a ogni cambio di misura / font
  const wrap=document.getElementById('match-cols-wrap');
  wrap.addEventListener('pointerover',e=>{ _matchSetHover(e.target.closest?e.target.closest('.match-item'):null); });
  wrap.addEventListener('pointerleave',()=>_matchSetHover(null));
  const board=document.getElementById('match-board');
  if(typeof ResizeObserver!=='undefined'){
    _matchRO=new ResizeObserver(()=>_matchRedrawWires());
    _matchRO.observe(board);
  }
  const _st=mState;
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{ if(mState===_st)_matchRedrawWires(); });
  _matchRedrawWires();
}

/* -- Abbina pause/resume — v4.0.8 I1 fix
   mPaused è gestito solo da pauseMatchTimer()/resumeMatchTimer().
   Non viene più assegnato direttamente qui per evitare double source of truth. -- */
function matchTogglePause(){
  if(gameType!=='match')return;
  if(!gsIs(GS.PLAYING)&&!gsIs(GS.PAUSED))return;
  const overlay=shq('match-paused-overlay');
  const icon=shq('match-pause-icon');
  const btn=shq('match-pause-btn');
  if(gsIs(GS.PLAYING)){
    gsSet(GS.PAUSED);
    pauseMatchTimer();    // imposta mPaused=true internamente
    _setGamePauseLock(true);
    overlay?.classList.remove('hidden');
    if(icon)icon.className='ti ti-player-play';
    if(btn){btn.title='Riprendi';btn.classList.add('is-paused');}
    // Lock all match items
    document.querySelectorAll('.match-item:not(.matched)').forEach(e=>e.classList.add('locked'));
  }else{
    gsSet(GS.PLAYING);
    resumeMatchTimer();   // imposta mPaused=false internamente
    _setGamePauseLock(false);
    overlay?.classList.add('hidden');
    if(icon)icon.className='ti ti-player-pause';
    if(btn){btn.title='Pausa';btn.classList.remove('is-paused');}
    document.querySelectorAll('.match-item:not(.matched)').forEach(e=>e.classList.remove('locked'));
  }
}

/* -- mSel  v2.1.6: combo  scoring  per-pair color
   v8.45.0: niente più stili inline sulle voci (selezione/hover/abbinamento sono classi in abbina.css);
   ogni coppia giusta entra in s.links (→ filo ondulato), aggiorna pallini e porte; la riga di
   feedback usa icone Tabler invece dei caratteri ✓ ✗ e dell'emoji. -- */
function mSel(type,val){
  const s=mState;
  // Block while paused or not playing
  if(!gsIs(GS.PLAYING))return;

  if(type==='t'){
    document.querySelectorAll('[id^=mt_]').forEach(e=>{
      if(!e.classList.contains('matched')) e.classList.remove('sel');
    });
    const el=document.getElementById('mt_'+val.replace(/\W/g,'_'));
    if(el&&!el.classList.contains('matched')&&!el.classList.contains('locked')){
      el.classList.add('sel'); s.selT=val;
    }
  }else{
    document.querySelectorAll('[id^=md_]').forEach(e=>{
      if(!e.classList.contains('matched')) e.classList.remove('sel');
    });
    const el=document.getElementById('md_'+val);
    if(el&&!el.classList.contains('matched')&&!el.classList.contains('locked')){
      el.classList.add('sel'); s.selD=val;
    }
  }

  // una sola voce scelta: mostra l'anteprima del filo e aspetta l'altra
  if(s.selT===null||s.selT===undefined||s.selD===null||s.selD===undefined){
    _matchRedrawWires();
    return;
  }

  const dv=s.defs[s.selD];
  const ok=s.pairs.find(p=>p.t===s.selT&&p.d===dv);
  const fb=shq('mfb');
  const te=document.getElementById('mt_'+s.selT.replace(/\W/g,'_'));
  const de=document.getElementById('md_'+s.selD);

  if(ok){
    // -- CORRECT MATCH --
    // Use the pre-computed color that was ready before this click
    const pairColor = s.nextPairColor || PAIR_COLORS[s.matched.size % PAIR_COLORS.length];
    s.pairColorMap[s.selT]=pairColor;

    // Apply color + matched class to both elements
    [te,de].forEach(el=>{
      if(!el)return;
      el.classList.remove('sel','flash');
      el.classList.add('matched');
      el.style.setProperty('--pair-color',pairColor);
      _matchPort(el,'ok');
    });

    s.matched.add(s.selT);
    if(te&&de)s.links.push({t:s.selT,di:s.selD,color:pairColor,te,de});

    // Compute next color AND write --pair-color on all remaining unmatched chips
    // immediately — so :hover and .sel on the next interaction already show it.
    _applyNextColor();
    _updateMatchProgressUI();

    // Combo
    const _prevCombo=s.combo||1;
    s.combo=Math.min(_prevCombo+1,5);
    s.maxCombo=Math.max(s.maxCombo||1,s.combo); // v6.5.0: per badge "Combo Perfetta"

    // Feedback sonoro — v6.5.0: fanfara dedicata al primo raggiungimento del
    // combo massimo in questa run, altrimenti il click "corretto" standard
    if(typeof AudioManager!=='undefined'){
      const justHitMaxCombo=(_prevCombo<5&&s.combo===5);
      AudioManager.play(justHitMaxCombo?'comboMax':'correct');
    }

    // Score: base 100  combo
    const pts=100*s.combo;
    s.score=(s.score||0)+pts;

    // UI feedback
    const comboLabel=s.combo>1?`[×${s.combo} COMBO +${pts}]`:`[+${pts}]`;
    const allDone=s.matched.size===s.pairs.length;
    if(fb)fb.innerHTML=`<span class="match-fb-ok"><i class="ti ti-check"></i>Corretto! ${comboLabel}</span>`
      +(allDone?'<span class="match-fb-win">Tutti abbinati!</span>':'');

    _updateMatchScoreUI();
    _updateMatchComboUI();

    if(allDone){
      _matchFinish(true);
    }
  }else{
    // -- WRONG MATCH --
    if(typeof AudioManager!=='undefined')AudioManager.play('wrong');
    s.combo=1;
    s.errors=(s.errors||0)+1;
    const penalty=30;
    s.score=Math.max(0,(s.score||0)-penalty);

    [te,de].forEach(el=>{
      if(!el)return;
      el.classList.add('flash');
      _matchPort(el,'ko');
      setTimeout(()=>{
        el.classList.remove('flash','sel');
        if(!el.classList.contains('matched'))_matchPort(el,null);   // se nel frattempo è stata abbinata, la ✓ resta
      },600);
    });
    if(fb)fb.innerHTML=`<span class="match-fb-ko"><i class="ti ti-x"></i>Non corrisponde — −${penalty} pt</span>`;
    _updateMatchScoreUI();
    _updateMatchComboUI();

    // Update error counter
    const errEl=document.getElementById('match-err-val');
    if(errEl)errEl.textContent=s.errors;
  }

  s.selT=null;s.selD=null;s.hoverEl=null;
  _matchRedrawWires();   // fili: nuovo filo se giusta, anteprima rimossa in ogni caso
}

/* ==================================================
   PAUSE UI REGISTRY — Match (Abbina) handler
   Fase 8 M2: registra gli handler UI pausa/ripresa
   per l'Abbina nel registro centralizzato.
   _pauseForDialog/_resumeAfterDialog non contengono
   più if(gameType==='match') — delegano qui.
   _dialogMatchWasPaused: snapshot da game-engine-state.js
   (mTimerInt === null && mTimeLeft > 0 && mTimeLeft < 60).
================================================== */
PauseUIRegistry.register('match', {
  onPause(/* wasManuallyPaused — sempre false da dialog */) {
    _setGamePauseLock(true);
    const mbtn  = shq('match-pause-btn');
    const micon = shq('match-pause-icon');
    if(mbtn){  mbtn.classList.add('is-paused');  mbtn.title = 'Riprendi'; }
    if(micon)  micon.className = 'ti ti-player-play';
    shq('match-paused-overlay')?.classList.remove('hidden');
    document.querySelectorAll('.match-item:not(.matched)').forEach(e => e.classList.add('locked'));
  },
  onResume(/* wasManuallyPaused — sempre false da dialog */) {
    _setGamePauseLock(false);
    const mbtn  = shq('match-pause-btn');
    const micon = shq('match-pause-icon');
    if(mbtn){  mbtn.classList.remove('is-paused'); mbtn.title = 'Pausa'; }
    if(micon)  micon.className = 'ti ti-player-pause';
    // Ripristina overlay solo se il timer non era già fermo
    if(!_dialogMatchWasPaused){
      shq('match-paused-overlay')?.classList.add('hidden');
      document.querySelectorAll('.match-item:not(.matched)').forEach(e => e.classList.remove('locked'));
    }
  },
});
