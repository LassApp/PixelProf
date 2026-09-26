/* ==================================================
   game-quiz.js — PixelProf v4.1.0
   Quiz engine: renderQ, ansQ, nextQ, forceEnd, endQuiz.
   Speed Quiz: pause/resume, timer management.
   Also: resetSpeedUI, restartActivity, qzAbort.
   hook_trackAnswer now embedded in ansQ —
   no override chain from app.js.
   v4.1.0 (app v8.39.0): _trackRightQ() ora chiamata con mod+act
     (era solo qText,answer) — serve a _markSeenForProgress()
     (game-engine-state.js) per il completamento preciso di
     "Progressi". Vedi sql/v8.39.0_seen_questions_sync.sql.
   Fase 8: PauseUIRegistry handler registrato (M2).
   Depends on: game-engine-state.js, scoring.js, renderer.js

   v8.34.0 — Redesign visivo Quiz/Speed Quiz (stile in
   css/minigiochi/quiz.css, @layer quiz, scoped a #qz-game):
   renderQ() ora costruisce ogni .opt con badge lettera/testo/segno
   separati (invece del solo textContent "A. ..."), imposta il colore
   del modulo su #qz-qcard/#qz-gem (gemma decorativa) via modColor().
   ansQ() marca risposta corretta/sbagliata con icone SVG nel segno,
   costruisce il feedback con icona+titolo+testo, e nel ramo Quiz
   normale aggiorna anche qz-score-val/qz-score-pill (prima lo faceva
   solo lo Speed Quiz — punteggio live richiesto da Erasmo). Aggiunta
   _qzSetActivityUI(), chiamata da launch()/_startTeamTurn() in
   game-engine-state.js per etichetta/icona della pillola attività.

   v8.33.1 — FIX header "qz-cat" (Quiz + Speed Quiz, stessa
   renderQ()): mostrava un ternario legacy CE/OE ("qualsiasi
   modulo diverso da CE" → sempre "// Online Essentials"),
   residuo di quando l'app aveva solo 2 moduli. Sostituito con
   modLabel() — stesso helper già usato correttamente in
   game-truefalse.js — che risolve QUALSIASI modulo (via
   window.AreasConfig.getModuleInfo) mostrando il nome del
   modulo, non dell'Area. Verificati anche game-fill.js e
   game-match.js (Completa la frase / Abbina): nessun header
   "// ..." presente in quei due — nulla da correggere lì.
================================================== */

/* v8.34.0 — etichetta/icona/sottotitolo della pillola attività nella
   qz-actrow. Chiamata una volta all'avvio sessione (launch()/
   _startTeamTurn() in game-engine-state.js), non ad ogni domanda:
   sAct non cambia durante la sessione. */
function _qzSetActivityUI(act){
  const isSpeed=act==='speed';
  const lbl=shq('qz-act-label');if(lbl)lbl.textContent=isSpeed?'Speed Quiz':'Quiz';
  const ic=shq('qz-act-icon');if(ic)ic.className='ti '+(isSpeed?'ti-bolt':'ti-brain');
  const sub=shq('qz-act-sub');if(sub)sub.textContent=isSpeed?'a tempo — 60s':'+100 punti a domanda';
}

function resetSpeedUI(){
  const overlay=shq('qz-pause-overlay');
  if(overlay)overlay.classList.add('hidden');
  const icon=shq('qz-pause-icon');
  if(icon)icon.className='ti ti-player-pause';
  const btn=shq('qz-pause-btn');
  if(btn){btn.title='Pausa';btn.classList.remove('is-paused');}
  // Restore all opts
  document.querySelectorAll('.opt').forEach(b=>{b.style.pointerEvents='';b.disabled=false;b.style.opacity='';});
  // Reset score pill display
  const sv=shq('qz-score-val');if(sv)sv.textContent='0';
  // Unlock all nav elements
  _setSpeedPauseLock(false);
}

let _restartLock=false;
function restartActivity(){
  if(_restartLock)return;
  _restartLock=true;
  setTimeout(()=>_restartLock=false,800);
  if(isGameActive()){
    ppConfirmRestart(()=>{
      stopTimer();stopMemTimer();resetSpeedUI();
      gsSet(GS.IDLE);
      // In modalit squadre: reset completo match, poi riciclo
      if(sMode==='sq'){matchReset();launch();return;}
      qScores={};players.forEach(p=>qScores[p.name]=0);prevRank=getRank();
      launch();
    });
    return;
  }
  stopTimer();stopMemTimer();resetSpeedUI();
  if(sMode==='sq'){matchReset();launch();return;}
  qScores={};players.forEach(p=>qScores[p.name]=0);prevRank=getRank();
  launch();
}

/* ==================================================

/* ==================================================
   QUIZ ENGINE
================================================== */
function renderQ(){
  const q=qPool[qIdx];const tot=qPool.length;
  sh('qz-counter').textContent=(qIdx+1)+'/'+tot;
  sh('qz-prog').style.width=(qIdx/tot*100)+'%';
  const mod=getQuestionModule(q);
  sh('qz-cat').textContent='// '+modLabel(mod);
  sh('qz-q').textContent=q.q;
  // v8.34.0: colore del modulo sulla card/gemma decorativa — stesso
  // helper modColor() già usato da mod-badge/cardArt altrove nell'app.
  const qcard=shq('qz-qcard');
  if(qcard&&typeof modColor==='function'){
    const c=modColor(mod);
    qcard.style.setProperty('--qz-mod',c);
    if(typeof _hexToRgb==='function')qcard.style.setProperty('--qz-mod-glow','rgba('+_hexToRgb(c)+',.45)');
  }
  sh('qz-fb').innerHTML='';sh('next-btn').classList.add('hidden');qAnswered=false;renderLiveBar();
  // v2.1.7: marca timestamp inizio domanda per speed bonus
  qQStart=Date.now();
  const cont=sh('qz-opts');cont.innerHTML='';
  const letters=['A','B','C','D'];
  q.opts.forEach((o,i)=>{
    const b=document.createElement('button');
    b.className='opt';
    b.innerHTML='<span class="opt-badge">'+letters[i]+'</span><span class="opt-text">'+escHtml(o)+'</span><span class="opt-mark"></span>';
    b.onclick=()=>ansQ(i);
    cont.appendChild(b);
  });
}

function ansQ(idx){
  if(qAnswered)return;
  // Block input while paused
  if(!gsIs(GS.PLAYING))return;
  qAnswered=true;
  const responseTimeMs=Date.now()-qQStart;
  const q=qPool[qIdx];const ok=idx===q.a;
  if(typeof AudioManager!=='undefined')AudioManager.play(ok?'correct':'wrong');
  document.querySelectorAll('.opt').forEach((b,i)=>{
    b.disabled=true;
    const mark=b.querySelector('.opt-mark');
    if(i===q.a){
      b.classList.add('correct');
      if(mark)mark.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }else if(i===idx){
      b.classList.add('wrong');
      if(mark)mark.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
    }
  });
  const ap=players[0]; // sempre il giocatore/squadra del turno corrente

  if(sAct==='speed'){
    // -- Speed Quiz: logica invariata --
    if(ok){
      const pts=speedPtsPerQ(sN>0?sN:qPool.length);
      qScores[ap.name]=(qScores[ap.name]||0)+pts;
      qAnswerLog.push({questionId:'q'+qIdx,correct:true,responseTimeMs,streak:0,speedBonus:0,streakBonus:0,scoreEarned:pts});
      checkOvertake();
      const sv=sh('qz-score-val');
      if(sv){
        sv.textContent=qScores[ap.name];
        const pill=sh('qz-score-pill');
        if(pill){
          pill.classList.remove('score-bump');
          void pill.offsetWidth;
          pill.classList.add('score-bump');
          pill.addEventListener('animationend',()=>pill.classList.remove('score-bump'),{once:true});
        }
      }
      _trackRightQ(q.q, q.opts[q.a], getQuestionModule(q), 'speed');
    }else{
      qAnswerLog.push({questionId:'q'+qIdx,correct:false,responseTimeMs,streak:0,speedBonus:0,streakBonus:0,scoreEarned:0});
      _trackWrongQ(q.q, q.opts[q.a], getQuestionModule(q), 'speed');
    }
    const mod=getQuestionModule(q);
    db.stats.byMod[mod]=db.stats.byMod[mod]||{c:0,w:0};
    db.stats.tot++;if(ok){db.stats.cor++;db.stats.byMod[mod].c++;}else db.stats.byMod[mod].w++;
    // Cloud hook — fire-and-forget
    if(typeof window.hook_trackAnswer==='function'&&qAnswerLog.length){
      const last=qAnswerLog[qAnswerLog.length-1];
      window.hook_trackAnswer(getQuestionModule(q),last.correct);
    }
    setTimeout(()=>{qIdx++;if(qIdx<qPool.length)renderQ();else endQuiz();},500);
    return;
  }

  // -- Quiz normale: scoring engine v2.1.7 --
  if(ok){
    qStreak++;
    if(qStreak>qBestStreak) qBestStreak=qStreak;
    const{scoreEarned,speedBonus,streakBonus}=calcQuizAnswerScore(true,responseTimeMs,qStreak);
    qScores[ap.name]=(qScores[ap.name]||0)+scoreEarned;
    qTotalSpeedBonus+=speedBonus;
    qTotalStreakBonus+=streakBonus;
    qAnswerLog.push({questionId:'q'+qIdx,correct:true,responseTimeMs,streak:qStreak,speedBonus,streakBonus,scoreEarned});
    checkOvertake();
    // v8.34.0: punteggio live anche nel Quiz normale — prima lo
    // aggiornava solo lo Speed Quiz, stessa animazione "bump".
    const sv=sh('qz-score-val');
    if(sv){
      sv.textContent=qScores[ap.name];
      const pill=sh('qz-score-pill');
      if(pill){
        pill.classList.remove('score-bump');
        void pill.offsetWidth;
        pill.classList.add('score-bump');
        pill.addEventListener('animationend',()=>pill.classList.remove('score-bump'),{once:true});
      }
    }
    _trackRightQ(q.q, q.opts[q.a], getQuestionModule(q), 'quiz');
    // Feedback inline con dettaglio bonus
    const bonusBits=[];
    if(speedBonus>0)  bonusBits.push(`⚡ +${speedBonus} velocità`);
    if(streakBonus>0) bonusBits.push(`🔥 +${streakBonus} streak ×${qStreak}`);
    const bonusLine=bonusBits.length
      ?`<div class="fb-pts">${bonusBits.join(' · ')} &nbsp;<strong>+${scoreEarned} pt totali</strong></div>`
      :`<div class="fb-pts">+${scoreEarned} pt</div>`;
    sh('qz-fb').innerHTML=`<div class="fb ok"><span class="fb-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><div class="fb-title">Corretto!</div><div class="fb-text">${escHtml(q.exp)}</div>${bonusLine}</div></div>`;
  }else{
    qStreak=0;
    qAnswerLog.push({questionId:'q'+qIdx,correct:false,responseTimeMs,streak:0,speedBonus:0,streakBonus:0,scoreEarned:0});
    _trackWrongQ(q.q, q.opts[q.a], getQuestionModule(q), 'quiz');
    sh('qz-fb').innerHTML=`<div class="fb ko"><span class="fb-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span><div><div class="fb-title">Sbagliato.</div><div class="fb-text">${escHtml(q.exp)}</div></div></div>`;
  }

  const mod=getQuestionModule(q);
  db.stats.byMod[mod]=db.stats.byMod[mod]||{c:0,w:0};
  db.stats.tot++;if(ok){db.stats.cor++;db.stats.byMod[mod].c++;}else db.stats.byMod[mod].w++;
  save();renderLiveBar();
  // Cloud hook — fire-and-forget
  if(typeof window.hook_trackAnswer==='function'&&qAnswerLog.length){
    const last=qAnswerLog[qAnswerLog.length-1];
    window.hook_trackAnswer(getQuestionModule(q),last.correct);
  }
  sh('next-btn').classList.remove('hidden');
}

function nextQ(){qIdx++;if(qIdx>=qPool.length)endQuiz();else renderQ();}
function forceEnd(){qIdx=qPool.length;endQuiz();}

function endQuiz(){
  stopTimer();
  gsSet(GS.FINISHED);

  // -- MODALIT SQUADRE: accumula punteggio e passa al turno successivo --
  if(sMode==='sq'&&matchState.active){
    _onTeamTurnEnd();
    return;
  }

  // -- MODALIT INDIVIDUALE --
  const tot=qPool.length;const rank=getRank();const winner=rank[0];const top=qScores[winner]||0;
  const correctCount=qAnswerLog.filter(l=>l.correct).length;
  players.forEach(p=>{
    const pts=qScores[p.name]||0;
    saveLbEntry(p,pts,sAct,sMod);
  });
  // v6.5.0: bestStreak/perfectRun alimentano i badge "Streak Leggendaria" e "Quiz Perfetto"
  // (perfectRun richiede almeno 5 domande per non banalizzare il traguardo)
  saveSessionResult(sAct,sMod,{bestStreak:qBestStreak,perfectRun:(tot>=5&&correctCount===tot)});
  save();
  const isSpeed=(sAct==='speed');
  const pct=Math.round(correctCount/Math.max(tot,1)*100);
  const e=Math.floor((Date.now()-qStart)/1000);
  const msg=pct>=80?'Eccellente! Sei pronto per l\'esame ICDL.':pct>=60?'Buon lavoro! Continua ad allenarti.':'Ripassa i concetti e riprova.';
  // Tempo medio risposta
  const avgMs=qAnswerLog.length
    ?Math.round(qAnswerLog.reduce((s,l)=>s+l.responseTimeMs,0)/qAnswerLog.length)
    :0;
  const metrics={
    correctCount,tot,pct,elapsed:e,avgMs,
    bestStreak:    qBestStreak,
    totalSpeedBonus:  qTotalSpeedBonus,
    totalStreakBonus: qTotalStreakBonus,
    totalScore:    top
  };
  sh('qz-game').classList.add('hidden');sh('qz-result').classList.remove('hidden');
  sh('qz-result').innerHTML=buildResultHTML(winner,top,tot,pct,e,msg,rank,isSpeed,metrics);
}



function qzAbort(){
  ppConfirm(()=>{
    matchReset(); // v2.1.4: pulisce sempre il match state (no-op in individuale)
    sh('qz-game').classList.add('hidden');sh('qz-result').classList.add('hidden');goHome();
  });
}

/* Speed Quiz pause/resume  v11 */
/* -- Lock/unlock all navigation UI during Speed Quiz pause -- */
/* -- Unified pause lock  Speed Quiz AND Memory --
   Locks every interactive control except the pause/resume btn itself. */
function _setGamePauseLock(locked){
  const lockTargets=[
    document.querySelector('.logo-wrap'),
    sh('tb-course-badge'),          // badge aula in topbar — v4.0.8
    sh('tb-home'),
    sh('tb-hub-wrap'),               // v5.0.8: hub (Classifica/Progressi/Storico) — copre bottone + menu anche se aperto
    sh('tb-lb'),
    sh('tb-st'),
    sh('tb-dashboard-btn'),           // v8.26.9: "← Dashboard" (solo Direttore) — bloccato in pausa
    sh('tb-profile-btn'),             // v8.26.9: tasto profilo — bloccato in pausa
    // quiz screen
    sh('qz-game')?.querySelector('.game-exit-btn'),
    sh('qz-game')?.querySelector('.game-restart-btn'),
    // games screen (memory / match / fill)
    sh('g-area')?.querySelector('.game-exit-btn'),
    sh('g-area')?.querySelector('.game-restart-btn'),
  ];
  lockTargets.forEach(el=>{
    if(!el)return;
    el.classList.toggle('ui-pause-locked',locked);
  });
}
/* Legacy alias  all existing speed-quiz call-sites still work unchanged */
function _setSpeedPauseLock(locked){ _setGamePauseLock(locked); }

function speedTogglePause(){
  if(sAct!=='speed')return;
  if(!gsIs(GS.PLAYING)&&!gsIs(GS.PAUSED))return;
  const icon=shq('qz-pause-icon');
  const btn=shq('qz-pause-btn');
  const overlay=shq('qz-pause-overlay');
  if(gsIs(GS.PLAYING)){
    //  PAUSE
    gsSet(GS.PAUSED);
    stopTimer();
    _setSpeedPauseLock(true);
    if(overlay)overlay.classList.remove('hidden');
    if(icon)icon.className='ti ti-player-play';
    if(btn){btn.title='Riprendi';btn.classList.add('is-paused');}
    // Disable all unanswered opts
    document.querySelectorAll('.opt:not(.correct):not(.wrong)').forEach(b=>{b.disabled=true;b.style.opacity='.35';});
  }else{
    //  PLAYING
    gsSet(GS.PLAYING);
    _restartSpeedTimer();
    _setSpeedPauseLock(false);
    if(overlay)overlay.classList.add('hidden');
    if(icon)icon.className='ti ti-player-pause';
    if(btn){btn.title='Pausa';btn.classList.remove('is-paused');}
    // Re-enable opts
    document.querySelectorAll('.opt:not(.correct):not(.wrong)').forEach(b=>{b.disabled=false;b.style.opacity='';});
  }
}

function _restartSpeedTimer(){
  stopTimer();
  if(qSpeedLeft<=0)return;
  qTimerInt=setInterval(()=>{
    if(!gsIs(GS.PLAYING))return;
    qSpeedLeft--;
    const el=shq('qz-timer');
    if(el){el.textContent=qSpeedLeft+'s';el.classList.toggle('red',qSpeedLeft<=10);}
    if(qSpeedLeft<=0){clearInterval(qTimerInt);forceEnd();}
  },1000);
}

/* ==================================================
   PAUSE UI REGISTRY — Speed Quiz handler
   Fase 8 M2: registra gli handler UI pausa/ripresa
   per lo Speed Quiz nel registro centralizzato.
   _pauseForDialog/_resumeAfterDialog non contengono
   più if(gameType==='speed') — delegano qui.
================================================== */
PauseUIRegistry.register('speed', {
  onPause(/* wasManuallyPaused — sempre false da dialog */) {
    const overlay = shq('qz-pause-overlay');
    const btn     = shq('qz-pause-btn');
    const icon    = shq('qz-pause-icon');
    if(overlay) overlay.classList.remove('hidden');
    if(btn)     btn.classList.add('is-paused');
    if(icon)    icon.className = 'ti ti-player-play';
    document.querySelectorAll('.opt:not(.correct):not(.wrong)').forEach(b=>{b.disabled=true;b.style.opacity='.35';});
    _setSpeedPauseLock(true);
  },
  onResume(/* wasManuallyPaused — sempre false da dialog */) {
    if(qSpeedLeft <= 0 || qAnswered) return;
    const wasActive = !document.getElementById('qz-game')?.classList.contains('hidden');
    if(!wasActive) return;
    const icon    = shq('qz-pause-icon');
    const overlay = shq('qz-pause-overlay');
    const btn     = shq('qz-pause-btn');
    if(icon)    icon.className = 'ti ti-player-pause';
    if(overlay) overlay.classList.add('hidden');
    if(btn)     { btn.title = 'Pausa'; btn.classList.remove('is-paused'); }
    document.querySelectorAll('.opt:not(.correct):not(.wrong)').forEach(b=>{b.disabled=false;b.style.opacity='';});
    _setSpeedPauseLock(false);
  },
});
