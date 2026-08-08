/* ==================================================
   game-truefalse.js — PixelProf v1.0.0
   Vero o Falso: startTrueFalse, renderTF, checkTF.
   Una domanda alla volta, nessun timer, punteggio a
   fine sessione — stesso pattern di game-fill.js.
   Depends on: game-engine-state.js, scoring.js,
   game-match.js (buildGameHeader)
================================================== */

async function startTrueFalse(cont, mod){
  // Mostra spinner solo se non in cache
  const isCached = TrueFalseLoader.isCached(mod);
  if(!isCached) showTrueFalseLoading(cont, mod);
  let src;
  try{
    src = await loadTrueFalsePool(mod);
  }catch(err){
    console.error('[PixelProf] VeroFalso load error:', err);
    showTrueFalseError(cont, 'Impossibile caricare Vero o Falso. Riprova o cambia modulo.');
    return;
  }
  gsSet(GS.PLAYING);
  gameType = 'truefalse';
  tfStreak = 0; tfBestStreak = 0; tfTotalScore = 0; tfAnswerLog = [];
  tfState = { qs: shuffle([...src]).slice(0, 10), idx: 0, score: 0, mod };
  renderTF(cont);
}

function renderTF(cont){
  const s = tfState;
  if(s.idx >= s.qs.length){
    gsSet(GS.FINISHED);
    const tfScore = tfTotalScore > 0 ? tfTotalScore : s.score * 100;
    const tfAcc = Math.round(s.score / Math.max(s.qs.length, 1) * 100);
    const tfDetail = `${s.score}/${s.qs.length} corrette · ${tfAcc}% · ${tfScore} pt · 🔥 streak ${tfBestStreak}`;
    const tfScoreMap = {};
    // Imposta qScores — necessario per _onTeamTurnEnd() in modalità squadre
    players.forEach(p => { qScores[p.name] = tfScore; tfScoreMap[p.name] = tfScore; });
    // In modalità individuale salva subito; in squadre lo farà _onTeamTurnEnd
    if(sMode !== 'sq' || !matchState.active){
      players.forEach(p => saveLbEntry(p, tfScore, 'truefalse', sMod));
      saveSessionResult('truefalse', sMod, { bestStreak: tfBestStreak, perfectRun: (s.qs.length >= 5 && s.score === s.qs.length) });
      save();
    }
    showGameResult('Vero o Falso', tfDetail, tfScoreMap);
    return;
  }

  const q = s.qs[s.idx];
  const hdr = buildGameHeader(
    `<span style="font-size:11px;color:rgba(255,255,255,.35);font-family:'Share Tech Mono',monospace">${s.idx+1}/${s.qs.length} · ✓ ${s.score}</span>`,
    "startTrueFalse(sh('g-area'),sMod)"
  );
  cont.innerHTML = `${hdr}
    <div class="q-card tf-card">
      <div class="q-cat">// ${escHtml(MOD_LABEL[getQuestionModule(q)]||'')}</div>
      <div class="q-text">${escHtml(q.q)}</div>
    </div>
    <div class="tf-btns">
      <button class="tf-btn tf-true" onclick="checkTF(true)"><i class="ti ti-check"></i> Vero</button>
      <button class="tf-btn tf-false" onclick="checkTF(false)"><i class="ti ti-x"></i> Falso</button>
    </div>
    <div id="tffb"></div>`;
}

function checkTF(choice){
  const s = tfState;
  // Blocca doppio click / stato non valido (stesso pattern di guard degli altri minigiochi)
  if(!s || !gsIs(GS.PLAYING)) return;
  const q = s.qs[s.idx];
  const ok = choice === q.a;
  document.querySelectorAll('.tf-btn').forEach(b => b.disabled = true);
  document.querySelector(choice ? '.tf-true' : '.tf-false')?.classList.add(ok ? 'tf-correct' : 'tf-wrong');
  if(!ok){
    // Evidenzia comunque la risposta corretta quando l'utente sbaglia
    document.querySelector(q.a ? '.tf-true' : '.tf-false')?.classList.add('tf-correct');
  }
  if(typeof AudioManager !== 'undefined') AudioManager.play(ok ? 'correct' : 'wrong');

  if(ok){
    tfStreak++;
    if(tfStreak > tfBestStreak) tfBestStreak = tfStreak;
    const { scoreEarned, streakBonus } = calcTrueFalseAnswerScore(true, tfStreak);
    tfTotalScore += scoreEarned;
    tfAnswerLog.push({ questionId: 'tf'+s.idx, correct: true, streak: tfStreak, streakBonus, scoreEarned });
    s.score++;
    if(typeof _trackRightQ === 'function') _trackRightQ(q.q, q.a ? 'Vero' : 'Falso');
    const bonusLine = streakBonus > 0
      ? `<div style="font-size:11px;color:rgba(0,255,200,.75);margin-top:3px">🔥 +${streakBonus} streak ×${tfStreak} &nbsp;<strong>+${scoreEarned} pt totali</strong></div>`
      : `<div style="font-size:11px;color:rgba(0,255,200,.55);margin-top:3px">+${scoreEarned} pt</div>`;
    sh('tffb').innerHTML = `<div class="fb ok">✓ Corretto! ${escHtml(q.exp||'')}${bonusLine}</div>`;
  }else{
    tfStreak = 0;
    tfAnswerLog.push({ questionId: 'tf'+s.idx, correct: false, streak: 0, streakBonus: 0, scoreEarned: 0 });
    if(typeof _trackWrongQ === 'function') _trackWrongQ(q.q, q.a ? 'Vero' : 'Falso', sMod, 'truefalse');
    sh('tffb').innerHTML = `<div class="fb ko">✗ Sbagliato. ${escHtml(q.exp||'')}</div>`;
  }

  // Progressi (Panoramica accuratezza per modulo) — Vero o Falso alimenta db.stats
  // come Quiz/Speed Quiz, a differenza di Completa la frase che non lo fa.
  const mod = getQuestionModule(q);
  db.stats.tot++; if(ok){ db.stats.cor++; db.stats.byMod[mod].c++; } else db.stats.byMod[mod].w++;
  save();

  setTimeout(() => { s.idx++; renderTF(sh('g-area')); }, 1200);
}
