/* ==================================================
   game-fill.js — PixelProf v4.0.8
   Completa la frase game logic.
   Depends on: game-engine-state.js, scoring.js
================================================== */

/* ==================================================
   FILL
================================================== */
async function startFill(cont,mod){
  // Mostra spinner solo se non in cache
  const isCached=CompletaFraseLoader.isCached(mod);
  if(!isCached) showCompletaFraseLoading(cont,mod);
  let src;
  try{
    src=await loadCompletaFrasePool(mod);
  }catch(err){
    console.error('[PixelProf] CompletaFrase load error:',err);
    showCompletaFraseError('Impossibile caricare il gioco Completa la frase. Riprova o cambia modulo.');
    return;
  }
  fillState={qs:shuffle([...src]),idx:0,score:0,mod};renderFill(cont);
}

function renderFill(cont){
  const s=fillState;
  if(s.idx>=s.qs.length){
    gsSet(GS.FINISHED);
    // v2.1.7: punteggio basato su 100 pt/risposta + streak bonus
    const fillScore=fillTotalScore>0?fillTotalScore:s.score*100;
    const fillAcc=Math.round(s.score/Math.max(s.qs.length,1)*100);
    const fillDetail=`${s.score}/${s.qs.length} corrette · ${fillAcc}% · ${fillScore} pt · 🔥 streak ${fillBestStreak}`;
    const fillScoreMap={};
    // Imposta qScores  necessario per _onTeamTurnEnd() in modalit squadre
    players.forEach(p=>{ qScores[p.name]=fillScore; fillScoreMap[p.name]=fillScore; });
    // In modalit individuale salva subito; in squadre lo far _onTeamTurnEnd
    if(sMode!=='sq'||!matchState.active){
      players.forEach(p=>saveLbEntry(p,fillScore,'fill',sMod));
      saveSessionResult('fill',sMod);save();
    }
    showGameResult('Completa la frase',fillDetail,fillScoreMap);return;
  }
  const q=s.qs[s.idx];const pts=q.t.split('____');
  const hdr=buildGameHeader(`<span style="font-size:11px;color:rgba(255,255,255,.35);font-family:'Share Tech Mono',monospace">${s.idx+1}/${s.qs.length} · ✓ ${s.score}</span>`,"startFill(sh('g-area'),sMod)");
  cont.innerHTML=`${hdr}<div class="q-card"><div class="fill-sent">${escHtml(pts[0])}<input class="blank-in" id="fi" placeholder="..."/>${escHtml(pts[1]||'')}</div></div><div style="font-size:10px;color:rgba(0,255,200,.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px">Scegli dalla banca:</div><div class="word-bank">${shuffle([...q.bank]).map(w=>`<button class="chip" onclick="document.getElementById('fi').value='${escAttr(w)}'">${escHtml(w)}</button>`).join('')}</div><div id="ffb"></div><div style="margin-top:10px"><button class="btn btn-neon" onclick="checkFill()">Verifica <i class="ti ti-arrow-right"></i></button></div>`;
}

function checkFill(){
  const s=fillState;const q=s.qs[s.idx];const val=sh('fi').value.trim();
  const ok=val.toLowerCase()===q.b.toLowerCase();
  if(ok){
    fillStreak++;
    if(fillStreak>fillBestStreak) fillBestStreak=fillStreak;
    const{scoreEarned,streakBonus}=calcFillAnswerScore(true,fillStreak);
    fillTotalScore+=scoreEarned;
    fillAnswerLog.push({questionId:'f'+s.idx,correct:true,streak:fillStreak,streakBonus,scoreEarned});
    s.score++;
    const bonusLine=streakBonus>0
      ?`<div style="font-size:11px;color:rgba(0,255,200,.75);margin-top:3px">🔥 +${streakBonus} streak ×${fillStreak} &nbsp;<strong>+${scoreEarned} pt totali</strong></div>`
      :`<div style="font-size:11px;color:rgba(0,255,200,.55);margin-top:3px">+${scoreEarned} pt</div>`;
    sh('ffb').innerHTML=`<div class="fb ok" style="margin-top:6px">✓ Corretto!${bonusLine}</div>`;
  }else{
    fillStreak=0;
    fillAnswerLog.push({questionId:'f'+s.idx,correct:false,streak:0,streakBonus:0,scoreEarned:0});
    sh('ffb').innerHTML=`<div class="fb ko" style="margin-top:6px">✗ Era: ${q.b}</div>`;
  }
  setTimeout(()=>{s.idx++;renderFill(sh('g-area'));},1000);
}

/* ==================================================
   GAME RESULT (non-quiz: match, memory, fill)
   v2.1.6: in modalit squadre delega a _onTeamTurnEnd()
   invece di mostrare il risultato finale individuale.
================================================== */
