/* ==================================================
   game-truefalse.js — PixelProf v1.0.0
   Vero o Falso: startTrueFalse, renderTF, checkTF.
   Una domanda alla volta, nessun timer, punteggio a
   fine sessione — stesso pattern di game-fill.js.
   Depends on: game-engine-state.js, scoring.js,
   game-match.js (buildGameHeader)
   v1.1.0 (app v8.36.0): applicato _filterHard() (game-engine-state.js)
   al pool prima dello shuffle — rispetta il toggle "includi domande
   difficili" del setup-panel, salvato per aula in db.diffPrefs.truefalse.
   v1.1.1 (app v8.39.0): _trackRightQ() ora chiamata con sMod+'truefalse'
     (era solo q.q,risposta) — serve al completamento preciso di "Progressi".
   v1.2.0 (app v8.46.0): rifacimento GRAFICO, nessuna modifica alla logica. Cambiano solo il markup di
     renderTF (scheda unica .tf-board: intestazione con avanzamento, domanda, pulsanti) e l'HTML del
     feedback in checkTF (icone Tabler al posto dei caratteri ✓/✗ e dell'emoji 🔥, spiegazione in un
     blocco a parte, _tfExpHtml); in più _tfFitBoard() che mette .nar sulla scheda in base alla sua
     larghezza REALE (come Abbina). Punteggio, serie, statistiche, salvataggi, audio, tracciamento e flusso
     renderTF → checkTF → nextTF sono identici. Stile in css/minigiochi/vero-falso.css.
     Il contatore della barra in alto è ora «✓ k» (corrette); n/N è nell'intestazione della scheda.
================================================== */

const _TF_NAR_W = 540;    // sotto questa larghezza della scheda: layout stretto (classe .nar, vedi vero-falso.css)
const _TF_PIPS_MAX = 20;  // fino a tante domande un pallino ciascuna; oltre, barra continua
const _TF_HINT_MAX = 10;  // oltre tante domande a pallini la riga di guida non entra accanto a serie e pallini: si nasconde (.tf-many)
const _TF_NAR_PIPS_MAX = 15; // scheda stretta: fino a tante domande pallini, da 16 a 20 barra continua (.tf-alt)
let _tfRO = null;         // ResizeObserver che tiene .nar allineata alla larghezza reale della scheda

/* Imposta .nar sulla scheda in base alla sua larghezza REALE (non al viewport: l'area di gioco può essere
   stretta anche su schermi larghi). Un solo observer per volta; si stacca da solo quando la scheda
   esce dal DOM (nuova domanda, Esci, cambio schermata). Solo presentazione. */
function _tfFitBoard(){
  if(_tfRO){ _tfRO.disconnect(); _tfRO = null; }
  const board = document.getElementById('tf-board');
  if(!board) return;
  board.classList.toggle('nar', board.clientWidth < _TF_NAR_W);
  if(typeof ResizeObserver === 'undefined') return;
  _tfRO = new ResizeObserver(() => {
    if(!board.isConnected){ if(_tfRO){ _tfRO.disconnect(); _tfRO = null; } return; }
    board.classList.toggle('nar', board.clientWidth < _TF_NAR_W);
  });
  _tfRO.observe(board);
}

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
  src = _filterHard(src, 'truefalse'); // v8.36.0
  gsSet(GS.PLAYING);
  gameType = 'truefalse';
  tfStreak = 0; tfBestStreak = 0; tfTotalScore = 0; tfAnswerLog = [];
  // sN: numero domande scelto in setup-num (0 = "Tutte") — stesso comportamento del Quiz.
  const n = sN > 0 ? Math.min(sN, src.length) : src.length;
  tfState = { qs: shuffle([...src]).slice(0, n), idx: 0, score: 0, mod };
  renderTF(cont);
}

/* Blocco «Spiegazione» del pannello d'esito (solo markup; il testo passa sempre da escHtml).
   Senza spiegazione nei dati il blocco non compare. */
function _tfExpHtml(q){
  return q.exp
    ? `<div class="tf-exp"><p class="tf-exp-l"><i class="ti ti-bulb" aria-hidden="true"></i>Spiegazione</p><p class="tf-exp-t">${escHtml(q.exp)}</p></div>`
    : '';
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
  // v8.46.0 (solo grafica): la barra prende .tf-bar (la firma di buildGameHeader non cambia) e il
  // contatore mostra solo le corrette; n/N e la serie stanno nell'intestazione della scheda.
  const hdr = buildGameHeader(
    `<span class="game-counter-pill" title="Risposte corrette"><i class="ti ti-check" aria-hidden="true"></i><span class="tf-sr">Corrette </span>${s.score}</span>`,
    "startTrueFalse(sh('g-area'),sMod)"
  ).replace('class="game-header"', 'class="game-header tf-bar"');
  // avanzamento: un pallino per domanda (giusta / sbagliata / corrente) fino a _TF_PIPS_MAX, poi barra continua.
  // Legge soltanto tfAnswerLog (una voce per domanda già risposta, nell'ordine): nessuna scrittura.
  const nQ = s.qs.length;
  const tfTrack = cls => `<span class="tf-track${cls}" aria-hidden="true"><span class="tf-fill" style="--p:${Math.round((s.idx + 1) / nQ * 100)}%"></span></span>`;
  const tfAlt = nQ > _TF_NAR_PIPS_MAX;   // 16–20: la scheda stretta sostituisce i pallini con la barra (solo CSS)
  const tfProg = nQ <= _TF_PIPS_MAX
    ? `<span class="tf-pips${tfAlt ? ' tf-alt' : ''}" aria-hidden="true">${s.qs.map((_, i) =>
        `<span class="tf-pip${i < s.idx ? (tfAnswerLog[i] ? (tfAnswerLog[i].correct ? ' ok' : ' ko') : '') : (i === s.idx ? ' cur' : '')}"></span>`).join('')}</span>${tfAlt ? tfTrack(' tf-alt') : ''}`
    : tfTrack('');
  const tfStreakChip = tfStreak >= 2
    ? `<span class="tf-streak"><i class="ti ti-flame" aria-hidden="true"></i><span class="tf-sr">Serie </span>×${tfStreak}</span>`
    : '';
  cont.innerHTML = `${hdr}
    <div class="tf-board${nQ > _TF_HINT_MAX && nQ <= _TF_PIPS_MAX ? ' tf-many' : ''}" id="tf-board">
      <div class="tf-hd">
        <span class="tf-hd-ic" aria-hidden="true"><i class="ti ti-scale"></i></span>
        <p class="tf-hint">Leggi l'affermazione e scegli</p>
        ${tfStreakChip}
        <span class="tf-prog">${tfProg}<span><span class="tf-sr">Domanda </span>${s.idx+1}/${nQ}</span></span>
      </div>
      <div class="tf-q">
        <p class="tf-cat">${escHtml(modLabel(getQuestionModule(q)))}</p>
        <p class="tf-text">${escHtml(q.q)}</p>
      </div>
      <div class="tf-btns">
        <button class="tf-btn tf-true" onclick="checkTF(true)"><span class="tf-bi" aria-hidden="true"><i class="ti ti-check"></i></span><span class="tf-bl">Vero</span><span class="tf-bt"><i class="ti ti-check ic-ok" aria-hidden="true"></i><i class="ti ti-x ic-ko" aria-hidden="true"></i><span class="tf-t-ok">Corretto</span><span class="tf-t-rev">Risposta giusta</span><span class="tf-t-ko">La tua risposta</span></span></button>
        <button class="tf-btn tf-false" onclick="checkTF(false)"><span class="tf-bi" aria-hidden="true"><i class="ti ti-x"></i></span><span class="tf-bl">Falso</span><span class="tf-bt"><i class="ti ti-check ic-ok" aria-hidden="true"></i><i class="ti ti-x ic-ko" aria-hidden="true"></i><span class="tf-t-ok">Corretto</span><span class="tf-t-rev">Risposta giusta</span><span class="tf-t-ko">La tua risposta</span></span></button>
      </div>
      <div id="tffb" class="tf-fb" aria-live="polite"></div>
      <div class="tf-foot">
        <button class="tf-next hidden" id="tf-next-btn" onclick="nextTF()">Prosegui <i class="ti ti-arrow-right" aria-hidden="true"></i></button>
      </div>
    </div>`;
  _tfFitBoard();   // .nar dalla larghezza reale della scheda, prima del primo paint
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
    if(typeof _trackRightQ === 'function') _trackRightQ(q.q, q.a ? 'Vero' : 'Falso', sMod, 'truefalse');
    const bonusLine = streakBonus > 0
      ? `<div class="fb-bonus"><i class="ti ti-flame" aria-hidden="true"></i><span>+${streakBonus} streak ×${tfStreak}</span><strong>+${scoreEarned} pt totali</strong></div>`
      : `<div class="fb-bonus"><strong>+${scoreEarned} pt</strong></div>`;
    sh('tffb').innerHTML = `<div class="fb ok"><div class="tf-vd"><span class="tf-vi" aria-hidden="true"><i class="ti ti-check"></i></span><strong class="tf-vt">Corretto</strong>${bonusLine}</div>${_tfExpHtml(q)}</div>`;
  }else{
    tfStreak = 0;
    tfAnswerLog.push({ questionId: 'tf'+s.idx, correct: false, streak: 0, streakBonus: 0, scoreEarned: 0 });
    if(typeof _trackWrongQ === 'function') _trackWrongQ(q.q, q.a ? 'Vero' : 'Falso', sMod, 'truefalse');
    sh('tffb').innerHTML = `<div class="fb ko"><div class="tf-vd"><span class="tf-vi" aria-hidden="true"><i class="ti ti-x"></i></span><strong class="tf-vt">Sbagliato</strong><div class="tf-vx">Risposta giusta: <strong>${q.a ? 'Vero' : 'Falso'}</strong></div></div>${_tfExpHtml(q)}</div>`;
  }

  // Progressi (Panoramica accuratezza per modulo) — Vero o Falso alimenta db.stats
  // come Quiz/Speed Quiz, a differenza di Completa la frase che non lo fa.
  const mod = getQuestionModule(q);
  db.stats.byMod[mod] = db.stats.byMod[mod] || { c: 0, w: 0 };
  db.stats.tot++; if(ok){ db.stats.cor++; db.stats.byMod[mod].c++; } else db.stats.byMod[mod].w++;
  save();
  // v8.38.0 — FIX: mancava la replica cloud che Quiz/Speed Quiz hanno già
  // (window.hook_trackAnswer, vedi game-quiz.js). Senza questa riga Vero o
  // Falso aggiornava db.stats in locale ma non arrivava mai a
  // stats_aggregate/module_stats — "Progressi" sottostimava sempre questa
  // attività su un secondo dispositivo.
  if(typeof window.hook_trackAnswer==='function') window.hook_trackAnswer(mod, ok);

  // Niente auto-avanzamento: il docente decide quando proseguire (tempo per
  // leggere la spiegazione / commentarla in classe) — stesso principio del
  // tasto "Prossima" nel Quiz normale.
  sh('tf-next-btn')?.classList.remove('hidden');
}

function nextTF(){
  const s = tfState;
  if(!s) return;
  s.idx++;
  renderTF(sh('g-area'));
}
