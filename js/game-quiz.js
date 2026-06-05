/* ==================================================
   game-quiz.js — PixelProf v4.0.8
   Quiz engine: renderQ, ansQ, nextQ, forceEnd, endQuiz.
   Speed Quiz: pause/resume, timer management.
   Also: resetSpeedUI, restartActivity, qzAbort.
   hook_trackAnswer now embedded in ansQ —
   no override chain from app.js.
   Depends on: game-engine-state.js, scoring.js, renderer.js
================================================== */

function resetSpeedUI(){
  const overlay=sh('qz-pause-overlay');
  if(overlay)overlay.classList.add('hidden');
  const icon=sh('qz-pause-icon');
  if(icon)icon.className='ti ti-player-pause';
  const btn=sh('qz-pause-btn');
  if(btn){btn.title='Pausa';btn.classList.remove('is-paused');}
  // Restore all opts
  document.querySelectorAll('.opt').forEach(b=>{b.style.pointerEvents='';b.disabled=false;b.style.opacity='';});
  // Reset score pill display
  const sv=sh('qz-score-val');if(sv)sv.textContent='0';
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
  sh('qz-cat').textContent=getQuestionModule(q)==='CE'?'// Computer Essentials':'// Online Essentials';
  sh('qz-q').textContent=q.q;
  sh('qz-fb').innerHTML='';sh('next-btn').classList.add('hidden');qAnswered=false;renderLiveBar();
  // v2.1.7: marca timestamp inizio domanda per speed bonus
  qQStart=Date.now();
  const cont=sh('qz-opts');cont.innerHTML='';
  q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';b.textContent=['A','B','C','D'][i]+'. '+o;b.onclick=()=>ansQ(i);cont.appendChild(b);});
}

function ansQ(idx){
  if(qAnswered)return;
  // Block input while paused
  if(!gsIs(GS.PLAYING))return;
  qAnswered=true;
  const responseTimeMs=Date.now()-qQStart;
  const q=qPool[qIdx];const ok=idx===q.a;
  document.querySelectorAll('.opt').forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add('correct');else if(i===idx)b.classList.add('wrong');});
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
    }else{
      qAnswerLog.push({questionId:'q'+qIdx,correct:false,responseTimeMs,streak:0,speedBonus:0,streakBonus:0,scoreEarned:0});
    }
    const mod=getQuestionModule(q);
    db.stats.tot++;if(ok){db.stats.cor++;db.stats.byMod[mod].c++;}else db.stats.byMod[mod].w++;
    save();renderLiveBar();
    sh('qz-fb').innerHTML=`<div class="fb ${ok?'ok':'ko'}">${ok?'✓ Corretto! ':'✗ Sbagliato. '}${q.exp}</div>`;
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
    // Feedback inline con dettaglio bonus
    const bonusBits=[];
    if(speedBonus>0)  bonusBits.push(`⚡ +${speedBonus} velocità`);
    if(streakBonus>0) bonusBits.push(`🔥 +${streakBonus} streak ×${qStreak}`);
    const bonusLine=bonusBits.length
      ?`<div style="font-size:11px;color:rgba(0,255,200,.75);margin-top:3px">${bonusBits.join(' · ')} &nbsp;<strong>+${scoreEarned} pt totali</strong></div>`
      :`<div style="font-size:11px;color:rgba(0,255,200,.55);margin-top:3px">+${scoreEarned} pt</div>`;
    sh('qz-fb').innerHTML=`<div class="fb ok">✓ Corretto! ${q.exp}${bonusLine}</div>`;
  }else{
    qStreak=0;
    qAnswerLog.push({questionId:'q'+qIdx,correct:false,responseTimeMs,streak:0,speedBonus:0,streakBonus:0,scoreEarned:0});
    sh('qz-fb').innerHTML=`<div class="fb ko">✗ Sbagliato. ${q.exp}</div>`;
  }

  const mod=getQuestionModule(q);
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
  players.forEach(p=>{
    const pts=qScores[p.name]||0;
    saveLbEntry(p,pts,sAct,sMod);
  });
  saveSessionResult(sAct,sMod);
  save();
  const isSpeed=(sAct==='speed');
  const correctCount=qAnswerLog.filter(l=>l.correct).length;
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
    sh('tb-lb'),
    sh('tb-st'),
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
  const icon=sh('qz-pause-icon');
  const btn=sh('qz-pause-btn');
  const overlay=sh('qz-pause-overlay');
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
    const el=sh('qz-timer');
    if(el){el.textContent=qSpeedLeft+'s';el.classList.toggle('red',qSpeedLeft<=10);}
    if(qSpeedLeft<=0){clearInterval(qTimerInt);forceEnd();}
  },1000);
}
