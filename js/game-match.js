/* ==================================================
   game-match.js — PixelProf v4.0.5
   Abbina (match) game: timer, combo scoring, pair logic.
   Depends on: game-engine-state.js, scoring.js
================================================== */

/* -- Match/Abbina global state -- */
var mTimerInt = null;
var mTimeLeft = 0;
var mPaused   = false;

/* -- Per-pair color palette -- */
const PAIR_COLORS=[
  '#00ffc8','#ffb400','#7c6aff','#ff4d6d',
  '#00cfff','#32dc64','#ff64b4','#ffd700'
];

/* ==================================================
   MATCH
================================================== */

/* CODE-03: centralized game header builder */
function buildGameHeader(rightContent){
  return`<div class="game-header"><div class="game-header-left"><button class="game-exit-btn" onclick="ppConfirm(()=>goHome())"><i class="ti ti-x"></i> Esci</button><button class="game-restart-btn" onclick="restartActivity()"><i class="ti ti-refresh"></i> Ricomincia</button></div>${rightContent}</div>`;
}

/* CODE-04: balanced MIX  guarantees at least 2 CE and 2 OE pairs */
async function getMatchSet(mod){
  const sets = await loadAbbinSets(mod);
  if(mod==='CE'||mod==='OE'||mod==='WP'){
    return shuffle(sets[Math.floor(Math.random()*sets.length)]).slice(0,5);
  }
  // MIX: garantisce almeno 2 CE e 2 OE usando il tag _mod iniettato dal loader
  const ceCache = AbbinLoader.getCache()['CE'] || [];
  const oeCache = AbbinLoader.getCache()['OE'] || [];
  const cePairs = shuffle(ceCache.flat()).slice(0,3);
  const oePairs = shuffle(oeCache.flat()).slice(0,2);
  const mix = [...cePairs,...oePairs];
  return shuffle(mix.length>=4 ? mix : shuffle(sets.flat()).slice(0,5));
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

/* Timer state per Abbina  isolato da memTimer/speedTimer */
let mTimerInt=null;
let mTimeLeft=0;
let mPaused=false;

function stopMatchTimer(){
  if(mTimerInt){clearInterval(mTimerInt);mTimerInt=null;}
  mTimeLeft=0;mPaused=false;
}
function pauseMatchTimer(){
  if(!mPaused&&mTimerInt){clearInterval(mTimerInt);mTimerInt=null;mPaused=true;}
}
function resumeMatchTimer(){
  if(mPaused){mPaused=false;_startMatchInterval();}
}
function _startMatchInterval(){
  mTimerInt=setInterval(()=>{
    if(mPaused||!gsIs(GS.PLAYING))return;
    mTimeLeft--;
    _updateMatchTimerUI();
    if(mTimeLeft<=0){clearInterval(mTimerInt);mTimerInt=null;_matchTimeUp();}
  },1000);
}

/* ── Abbina (Match) timer ─────────────────────────
   fnPause:     pauseMatchTimer() se non già paused
   fnResume:    resumeMatchTimer()
   fnStop:      stopMatchTimer()
   fnIsRunning: mTimerInt != null && !mPaused
─────────────────────────────────────────────────── */
TimerManager.register(
  'match',
  /* pause  */ () => { if(!mPaused) pauseMatchTimer(); },
  /* resume */ () => { if(mPaused) resumeMatchTimer(); },
  /* stop   */ () => { stopMatchTimer(); },
  /* isRunning */ () => mTimerInt !== null && !mPaused
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
    saveSessionResult('match',sMod);save();
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
    score:0,
    pairColorMap:{},     // term → color string
  };

  // Init timer
  mTimeLeft=60;
  mPaused=false;

  // Build paircolor map (assigned at match time, not now)
  // so colors appear only when a pair is matched

  const hdr=buildGameHeader(
    `<div class="match-hdr">
      <div class="mem-stat-pill timer-running"><i class="ti ti-clock"></i><span id="match-timer-val">60s</span></div>
      <div class="mem-stat-pill score-pill"><i class="ti ti-star"></i><span id="match-score-val">0</span></div>
      <div class="mem-stat-pill" style="border-color:rgba(255,60,80,.25);color:rgba(255,100,100,.7);background:rgba(255,60,80,.06)"><i class="ti ti-x"></i><span id="match-err-val">0</span></div>
      <div class="match-combo-pill x1" id="match-combo-pill">×1</div>
      <button class="mem-pause-btn" id="match-pause-btn" onclick="matchTogglePause()"><i class="ti ti-player-pause" id="match-pause-icon"></i></button>
    </div>`
  );

  cont.innerHTML=`${hdr}
    <div style="font-size:11px;color:rgba(255,255,255,.3);margin-bottom:10px;font-family:'Share Tech Mono',monospace">
      Clicca un termine poi la sua definizione
    </div>
    <div style="position:relative">
      <div class="match-cols" id="match-cols-wrap">
        <div>
          <div class="col-lbl">Termini</div>
          ${terms.map(t=>`<button class="match-item" id="mt_${t.replace(/\W/g,'_')}" onclick="mSel('t','${escAttr(t)}')">${escHtml(t)}</button>`).join('')}
        </div>
        <div>
          <div class="col-lbl">Definizioni</div>
          ${defs.map((d,i)=>`<button class="match-item" id="md_${i}" onclick="mSel('d',${i})">${escHtml(d)}</button>`).join('')}
        </div>
      </div>
      <!-- Pause overlay — mirrors Memory/Speed Quiz pattern -->
      <div class="match-paused-overlay hidden" id="match-paused-overlay" onclick="matchTogglePause()" style="cursor:pointer">
        <div style="
          width:52px;height:52px;border-radius:50%;
          border:2px solid rgba(0,255,200,.5);
          background:rgba(0,255,200,.08);
          display:flex;align-items:center;justify-content:center;
          font-size:22px;
          box-shadow:0 0 20px rgba(0,255,200,.15);
          animation:playPulse 1.4s ease-in-out infinite;
        ">▶</div>
        <div style="font-size:11px;color:rgba(0,255,200,.7);font-family:'Share Tech Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px">Premi per continuare</div>
      </div>
    </div>
    <div style="margin-top:8px;font-size:12px;color:rgba(255,255,255,.4);min-height:20px" id="mfb"></div>`;

  // Start countdown
  _startMatchInterval();
}

/* -- Abbina pause/resume  mirrors Speed Quiz / Memory pattern -- */
function matchTogglePause(){
  if(gameType!=='match')return;
  if(!gsIs(GS.PLAYING)&&!gsIs(GS.PAUSED))return;
  const overlay=sh('match-paused-overlay');
  const icon=sh('match-pause-icon');
  const btn=sh('match-pause-btn');
  if(gsIs(GS.PLAYING)){
    gsSet(GS.PAUSED);
    pauseMatchTimer();
    mPaused=true;
    _setGamePauseLock(true);
    overlay?.classList.remove('hidden');
    if(icon)icon.className='ti ti-player-play';
    if(btn){btn.title='Riprendi';btn.classList.add('is-paused');}
    // Lock all match items
    document.querySelectorAll('.match-item:not(.matched)').forEach(e=>e.classList.add('locked'));
  }else{
    gsSet(GS.PLAYING);
    mPaused=false;
    resumeMatchTimer();
    _setGamePauseLock(false);
    overlay?.classList.add('hidden');
    if(icon)icon.className='ti ti-player-pause';
    if(btn){btn.title='Pausa';btn.classList.remove('is-paused');}
    document.querySelectorAll('.match-item:not(.matched)').forEach(e=>e.classList.remove('locked'));
  }
}

/* -- mSel  v2.1.6: combo  scoring  per-pair color -- */
function mSel(type,val){
  const s=mState;
  // Block while paused or not playing
  if(!gsIs(GS.PLAYING))return;

  if(type==='t'){
    document.querySelectorAll('[id^=mt_]').forEach(e=>{
      if(!e.classList.contains('matched'))e.classList.remove('sel');
    });
    const el=document.getElementById('mt_'+val.replace(/\W/g,'_'));
    if(el&&!el.classList.contains('matched')&&!el.classList.contains('locked')){
      el.classList.add('sel');s.selT=val;
    }
  }else{
    document.querySelectorAll('[id^=md_]').forEach(e=>{
      if(!e.classList.contains('matched'))e.classList.remove('sel');
    });
    const el=document.getElementById('md_'+val);
    if(el&&!el.classList.contains('matched')&&!el.classList.contains('locked')){
      el.classList.add('sel');s.selD=val;
    }
  }

  if(s.selT===null||s.selT===undefined)return;
  if(s.selD===null||s.selD===undefined)return;

  const dv=s.defs[s.selD];
  const ok=s.pairs.find(p=>p.t===s.selT&&p.d===dv);
  const fb=sh('mfb');
  const te=document.getElementById('mt_'+s.selT.replace(/\W/g,'_'));
  const de=document.getElementById('md_'+s.selD);

  if(ok){
    // -- CORRECT MATCH --
    // Assign pair color (pick next unused color)
    const usedColors=Object.values(s.pairColorMap);
    const availColors=PAIR_COLORS.filter(c=>!usedColors.includes(c));
    const pairColor=availColors.length>0
      ? availColors[0]
      : PAIR_COLORS[s.matched.size % PAIR_COLORS.length];
    s.pairColorMap[s.selT]=pairColor;

    // Apply color + matched class to both elements
    [te,de].forEach(el=>{
      if(!el)return;
      el.classList.remove('sel');
      el.classList.add('matched');
      el.style.setProperty('--pair-color',pairColor);
    });

    s.matched.add(s.selT);

    // Combo
    s.combo=Math.min((s.combo||1)+1,5);

    // Score: base 100  combo
    const pts=100*s.combo;
    s.score=(s.score||0)+pts;

    // UI feedback
    const comboLabel=s.combo>1?` [×${s.combo} COMBO +${pts}]`:`[+${pts}]`;
    const allDone=s.matched.size===s.pairs.length;
    if(fb)fb.innerHTML=`<span style="color:#00ff96">✓ Corretto! ${comboLabel}</span>`
      +(allDone?' <span style="color:#ffd700">🎉 Tutti abbinati!</span>':'');

    _updateMatchScoreUI();
    _updateMatchComboUI();

    if(allDone){
      _matchFinish(true);
    }
  }else{
    // -- WRONG MATCH --
    s.combo=1;
    s.errors=(s.errors||0)+1;
    const penalty=30;
    s.score=Math.max(0,(s.score||0)-penalty);

    [te,de].forEach(el=>{
      if(!el)return;
      el.classList.add('flash');
      setTimeout(()=>el.classList.remove('flash','sel'),600);
    });
    if(fb)fb.innerHTML=`<span style="color:#ff3c50">✗ Non corrisponde — −${penalty} pt</span>`;
    _updateMatchScoreUI();
    _updateMatchComboUI();

    // Update error counter
    const errEl=document.getElementById('match-err-val');
    if(errEl)errEl.textContent=s.errors;
  }

  s.selT=null;s.selD=null;
}

