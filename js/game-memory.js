/* ==================================================
   game-memory.js — PixelProf v4.0.7
   Memory game: image helpers, scoring, startMemory,
   memTogglePause, memFlip.
   _updateMemTimerUI, _updateMemScoreUI, stopMemTimer,
   pauseMemTimer, resumeMemTimer, _startMemInterval
   → live in game-engine-state.js (TimerManager block).
   Depends on: game-engine-state.js, scoring.js
================================================== */

/* ==================================================
   MEMORY  v9: timer, scoring, stable lifecycle
================================================== */
/* -- Memory image helpers -- */

/* Determina se un termine Memory  un'immagine (filename .png) */
function _isMemoryImage(term){
  return typeof term==='string' && term.endsWith('.png');
}

/* Risolve il path asset per un'immagine Memory.
   Il modulo (CE/OE/MIX) determina dinamicamente la cartella.
   Per MIX il modulo  codificato nel nome file stesso:
     memory_computer_essentials_N.png  assets/memory/computer_essentials/
     memory_online_essentials_N.png    assets/memory/online_essentials/
   Questo evita qualsiasi hardcoding — il path è sempre derivato dal filename. */
function _resolveMemoryAsset(filename){
  // Estrae il modulo dal naming convention: memory_[modulo]_N.png
  // es. "memory_computer_essentials_1.png"  "computer_essentials"
  const match=filename.match(/^memory_(.+)_\d+\.png$/);
  const folder=match?match[1]:'unknown';
  return _BASE_URL+'assets/memory/'+folder+'/'+filename;
}

/* Costruisce l'innerHTML di una carta girata  IMG o testo */
function _memCardFaceHTML(txt){
  if(_isMemoryImage(txt)){
    const src=_resolveMemoryAsset(txt);
    return`<img src="${escAttr(src)}" alt="${escAttr(txt)}"
      class="mem-c-img"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      loading="eager">
      <div class="mem-c-img-fallback" style="display:none">
        <i class="ti ti-photo-off"></i>
      </div>`;
  }
  return escHtml(txt);
}

function calcMemScore(pairs, moves, seconds){
  const base=pairs*10;
  // Move efficiency: ideal = pairs moves, penalize extra
  const idealMoves=pairs;
  const extraMoves=Math.max(0,moves-idealMoves);
  const movePenalty=Math.floor(extraMoves*2);
  // Time bonus: faster = more points (up to 50 extra)
  const timeBonus=Math.max(0,Math.floor(50-seconds/3));
  return Math.max(pairs,base-movePenalty+timeBonus);
}

function _memTimerLabel(){
  const m=Math.floor(memElapsed/60);const s=memElapsed%60;
  return(m>0?(m+':'):'')+(s<10?'0':'')+s;
}

async function startMemory(cont,mod){
  // Mostra spinner solo se non in cache
  const isCached=MemoryLoader.isCached(mod);
  if(!isCached) showMemoryLoading(cont,mod);

  let src;
  try{
    src=await loadMemoryPairs(mod);
  }catch(err){
    console.error('[PixelProf] Memory load error:',err);
    showMemoryError(cont,'Impossibile caricare il gioco Memory. Riprova o cambia modulo.');
    return;
  }

  // v10: sempre pulito il timer precedente prima di iniziare
  stopMemTimer();
  gsSet(GS.PLAYING);
  gameType='memory';

  const pairs=shuffle(src).slice(0,6);
  const cards=shuffle(pairs.flatMap(p=>[{txt:p[0],pair:p[0]},{txt:p[1],pair:p[0]}]));
  memState={cards,flipped:[],matched:new Set(),lock:false,moves:0,pairs:pairs.length};
  memElapsed=0;memPaused=false;

  const hdr=buildGameHeader(
    `<div class="mem-hdr" style="gap:6px">
      <div class="mem-stat-pill timer-running"><i class="ti ti-clock"></i><span id="mem-timer-pill">00</span></div>
      <div class="mem-stat-pill score-pill"><i class="ti ti-star"></i><span id="mem-score-pill">—</span></div>
      <div class="mem-stat-pill moves-pill"><i class="ti ti-route"></i><span id="mem-moves-pill">0</span> mosse</div>
      <button class="mem-pause-btn" id="mem-pause-btn" onclick="memTogglePause()"><i class="ti ti-player-pause" id="mem-pause-icon"></i></button>
    </div>`,
    "startMemory(sh('g-area'),sMod)"
  );

  cont.innerHTML=`${hdr}
    <div style="position:relative">
      <div class="mem-board" id="mem-board-grid">${cards.map((_,i)=>`<div class="mem-c hide" id="mc${i}" onclick="memFlip(${i})"></div>`).join('')}</div>
      <div class="mem-paused-overlay hidden" id="mem-paused-overlay">
        <div class="po-icon">⏸</div>
        <div class="po-text">Pausa</div>
      </div>
    </div>
    <div style="margin-top:8px;font-size:12px;text-align:center;color:rgba(0,255,200,.6)" id="mem-msg"></div>`;

  // Start timer
  _startMemInterval();
}

function memTogglePause(){
  const s=memState;
  if(!s||s.matched?.size===s.pairs)return; // don't pause after win
  if(!gsIs(GS.PLAYING)&&!gsIs(GS.PAUSED))return;
  const overlay=sh('mem-paused-overlay');
  const icon=sh('mem-pause-icon');
  const btn=sh('mem-pause-btn');
  if(gsIs(GS.PLAYING)){
    // PAUSE — v4.0.7 I1 fix: memPaused gestito solo da pauseMemTimer()
    gsSet(GS.PAUSED);
    pauseMemTimer();          // imposta memPaused=true internamente
    _setGamePauseLock(true);
    overlay?.classList.remove('hidden');
    if(icon)icon.className='ti ti-player-play';
    if(btn){btn.title='Riprendi';btn.classList.add('is-paused');}
    document.querySelectorAll('.mem-c.flip').forEach(el=>el.classList.add('paused-hidden'));
  }else{
    // PLAYING — v4.0.7 I1 fix: memPaused gestito solo da resumeMemTimer()
    gsSet(GS.PLAYING);
    resumeMemTimer();         // imposta memPaused=false internamente
    _setGamePauseLock(false);
    overlay?.classList.add('hidden');
    if(icon)icon.className='ti ti-player-pause';
    if(btn){btn.title='Pausa';btn.classList.remove('is-paused');}
    document.querySelectorAll('.mem-c.flip').forEach(el=>el.classList.remove('paused-hidden'));
  }
}

function memFlip(i){
  const s=memState;
  // v10: block flips if not PLAYING (catches PAUSED, FINISHED, IDLE)
  if(!gsIs(GS.PLAYING)||s.lock||s.flipped.includes(i)||s.matched.has(i))return;
  const el=document.getElementById('mc'+i);
  if(!el)return;
  // Render condizionale: IMG per carte-immagine, testo per carte-definizione
  el.innerHTML=_memCardFaceHTML(s.cards[i].txt);
  // Aggiunge classe img-card per CSS differenziato
  el.classList.toggle('mem-c-image',_isMemoryImage(s.cards[i].txt));
  el.classList.remove('hide');
  el.classList.add('flip');
  s.flipped.push(i);

  if(s.flipped.length===2){
    s.lock=true;s.moves++;
    // Update moves display
    const mv=sh('mem-moves-pill');if(mv)mv.textContent=s.moves;
    const[a,b]=s.flipped;
    if(s.cards[a].pair===s.cards[b].pair){
      [a,b].forEach(x=>document.getElementById('mc'+x)?.classList.add('matched'));
      s.matched.add(a);s.matched.add(b);
      s.flipped=[];s.lock=false;
      // update live score with bump animation on each pair found
      _updateMemScoreUI(true);
      if(s.matched.size===s.cards.length){
        // v10: set FINISHED, stop timer
        gsSet(GS.FINISHED);
        pauseMemTimer();
        const secs=memElapsed;
        const score=calcMemScore(s.pairs,s.moves,secs);
        const msg=sh('mem-msg');
        if(msg)msg.textContent='🎉 Completato in '+s.moves+' mosse · '+_memTimerLabel()+'!';
        // Build scoreMap so podium shows correct value
        const memScoreMap={};
        // Imposta qScores  necessario per _onTeamTurnEnd() in modalit squadre
        players.forEach(p=>{ qScores[p.name]=score; memScoreMap[p.name]=score; });
        // In modalit individuale salva subito; in squadre lo far _onTeamTurnEnd
        if(sMode!=='sq'||!matchState.active){
          players.forEach(p=>saveLbEntry(p,score,'memory',sMod));
          saveSessionResult('memory',sMod);
          save();
        }
        setTimeout(()=>showGameResult('Memory',s.moves+' mosse · '+_memTimerLabel()+' · '+score+' pt',memScoreMap),700);
      }
    }else{
      setTimeout(()=>{
        [a,b].forEach(x=>{
          const e=document.getElementById('mc'+x);
          if(e){e.innerHTML='';e.classList.remove('flip','mem-c-image');e.classList.add('hide');}
        });
        s.flipped=[];s.lock=false;
      },850);
    }
  }
}
