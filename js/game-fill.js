/* ==================================================
   game-fill.js — PixelProf v4.1.1
   Completa la frase game logic.
   Depends on: game-engine-state.js, scoring.js
   v4.1.1 (app v8.50.1): FIX — startFill() applica _filterHard(src,'fill') prima di sN. Senza, il toggle
   "includi domande difficili" non aveva effetto su Completa la frase e "Tutte" caricava facili + difficili
   (es. DigComp modulo 1: 88 frasi invece di 49). Nessun altro comportamento modificato.
   v4.0.9: FIX — applicato sN (selettore "Quante domande?"
   5/10/15/20/Tutte) al pool prima di iniziare la partita,
   come già avviene per Quiz/Speed/Vero o Falso. Prima
   d'ora la partita usava sempre l'intero pool JSON del
   modulo, ignorando la selezione (mai richiesta perché
   'fill' non era incluso in needsNum — vedi game-engine-state.js).
   v4.1.0 (app v8.47.0): rifacimento GRAFICO di Completa la frase (stesso linguaggio di Abbina e Vero o Falso).
     Cambiano il markup di renderFill (scheda unica .cf-board: intestazione con avanzamento e serie, frase con lo
     spazio da completare, quattro parole, piede con Verifica, pannello d'esito) e l'HTML del feedback in
     checkFill (icone Tabler al posto di ✓/✗/🔥, parola giusta mostrata accanto alla risposta sbagliata); in più
     _cfFitBoard() (.nar dalla larghezza REALE della scheda) e cfPick(). Stile in css/minigiochi/completa-frase.css.
     Punteggio, serie, statistiche, tracciamento, audio e salvataggi sono identici (stesse chiamate, stesso ordine).
     Cambiamenti di COMPORTAMENTO, tutti dichiarati nel registro modifiche della consegna:
       · E1a — Verifica parte disattivata a ogni frase e si attiva appena si sceglie UNA delle quattro parole;
         checkFill() ignora la chiamata se lo spazio è vuoto (difesa in profondità, il tasto non lo permette già).
       · E1b — niente digitazione nello spazio: #fi resta la fonte letta da checkFill() ma è readonly e fuori dal
         Tab; si sceglie solo dalle tessere (Tab + Invio/Spazio resta possibile); una seconda tessera sostituisce la prima.
       · Correzione: il vecchio onclick delle tessere inseriva la parola dentro una stringa JS tra apici, che si
         rompeva con l'apostrofo; ora la parola sta in data-w e la legge cfPick() da this.dataset.
       · Proposte logiche approvate: (1) checkFill() ignora un secondo click mentre l'esito è in mostra (prima ogni
         click ripeteva punteggio e avanzamento); (2) dopo una risposta sbagliata si attendono 2,4 s invece di 1 s,
         per leggere la parola giusta (corretta: 1 s); il timer non agisce se la partita è stata nel frattempo
         chiusa o riavviata; (3) la parola giusta nel pannello passa da escHtml; (4) il contatore della barra è «✓ k»
         e si aggiorna subito alla risposta giusta (n/N sta nell'intestazione della scheda).
================================================== */

const _CF_NAR_W = 540;       // sotto questa larghezza della scheda: layout stretto (classe .nar, vedi completa-frase.css)
const _CF_PIPS_MAX = 20;     // fino a tante frasi un pallino ciascuna; oltre, barra continua
const _CF_HINT_MAX = 10;     // oltre tante frasi a pallini la riga di guida non entra accanto a serie e pallini: si nasconde (.cf-many)
const _CF_NAR_PIPS_MAX = 15; // scheda stretta: fino a tante frasi pallini, da 16 a 20 barra continua (.cf-alt)
let _cfRO = null;            // ResizeObserver che tiene .nar allineata alla larghezza reale della scheda

// Testi della riga guida accanto a Verifica (collegata a Verifica con aria-describedby) e piccoli pezzi di markup ripetuti.
const _CF_GUIDE_OFF = '<i class="ti ti-hand-click" aria-hidden="true"></i><span>Scegli una parola per verificare</span>';
const _CF_GUIDE_ON  = '<i class="ti ti-replace" aria-hidden="true"></i><span>Puoi ancora cambiare parola</span>';
const _CF_GUIDE_RES = '<i class="ti ti-arrow-right" aria-hidden="true"></i><span>Tra un attimo si prosegue</span>';
const _CF_SIC  = '<span class="cf-sic" aria-hidden="true"><i class="ti ti-check ic-ok"></i><i class="ti ti-x ic-ko"></i></span>';
const _CF_MARK = '<span class="cf-mark" aria-hidden="true"><i class="ti ti-check ic-ok"></i><i class="ti ti-x ic-ko"></i></span>';
const _CF_TAG  = '<span class="cf-tag"><i class="ti ti-check ic-ok" aria-hidden="true"></i><i class="ti ti-x ic-ko" aria-hidden="true"></i><span class="t-ok">Corretto</span><span class="t-rev">Risposta giusta</span><span class="t-ko">La tua risposta</span></span>';

/* Imposta .nar sulla scheda in base alla sua larghezza REALE (non al viewport: l'area di gioco può essere
   stretta anche su schermi larghi). Un solo observer per volta; si stacca da solo quando la scheda
   esce dal DOM (nuova frase, Esci, cambio schermata). Solo presentazione. */
function _cfFitBoard(){
  if(_cfRO){ _cfRO.disconnect(); _cfRO = null; }
  const board = document.getElementById('cf-board');
  if(!board) return;
  board.classList.toggle('nar', board.clientWidth < _CF_NAR_W);
  if(typeof ResizeObserver === 'undefined') return;
  _cfRO = new ResizeObserver(() => {
    if(!board.isConnected){ if(_cfRO){ _cfRO.disconnect(); _cfRO = null; } return; }
    board.classList.toggle('nar', board.clientWidth < _CF_NAR_W);
  });
  _cfRO.observe(board);
}

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
  // v4.1.1 (app v8.50.1): FIX — il filtro difficoltà va applicato PRIMA di sN. Prima startFill() non
  // chiamava _filterHard(), quindi il toggle "includi domande difficili" era ignorato e "Tutte" usava
  // l'intero pool (facili + difficili). Ora "Tutte" = tutte le frasi della difficoltà selezionata.
  src=_filterHard(src,'fill');
  gsSet(GS.PLAYING);
  // sN: numero frasi scelto in setup-num (0 = "Tutte") — stesso comportamento di Quiz/Vero o Falso.
  let pool=_weightedShuffleFillPool([...src]);
  if(sN>0) pool=pool.slice(0,Math.min(sN,pool.length));
  fillState={qs:pool,idx:0,score:0,mod};renderFill(cont);
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
      // v6.5.0: bestStreak/perfectRun alimentano i badge "Streak Leggendaria" e "Quiz Perfetto"
      saveSessionResult('fill',sMod,{bestStreak:fillBestStreak,perfectRun:(s.qs.length>=5&&s.score===s.qs.length)});save();
    }
    showGameResult('Completa la frase',fillDetail,fillScoreMap);return;
  }
  const q=s.qs[s.idx];const pts=q.t.split('____');
  // v8.47.0 (solo grafica): la barra prende .cf-bar (la firma di buildGameHeader non cambia) e il contatore
  // mostra solo le corrette; n/N e la serie stanno nell'intestazione della scheda.
  const hdr=buildGameHeader(
    `<span class="game-counter-pill" title="Risposte corrette"><i class="ti ti-check" aria-hidden="true"></i><span class="cf-sr">Corrette </span><span class="cf-score-n">${s.score}</span></span>`,
    "startFill(sh('g-area'),sMod)"
  ).replace('class="game-header"','class="game-header cf-bar"');
  // avanzamento: un pallino per frase (giusta / sbagliata / corrente) fino a _CF_PIPS_MAX, poi barra continua.
  // Legge soltanto fillAnswerLog (una voce per frase già risposta, nell'ordine): nessuna scrittura. Si prendono le
  // ultime s.idx voci perché il registro non viene azzerato da «Ricomincia» (vedi nota nella consegna).
  const nQ=s.qs.length;
  const runLog=fillAnswerLog.slice(Math.max(0,fillAnswerLog.length-s.idx));
  const cfTrack=cls=>`<span class="cf-track${cls}" aria-hidden="true"><span class="cf-fill" style="--p:${Math.round((s.idx+1)/nQ*100)}%"></span></span>`;
  const cfAlt=nQ>_CF_NAR_PIPS_MAX;   // 16–20: la scheda stretta sostituisce i pallini con la barra (solo CSS)
  const cfProg=nQ<=_CF_PIPS_MAX
    ?`<span class="cf-pips${cfAlt?' cf-alt':''}" aria-hidden="true">${s.qs.map((_,i)=>
        `<span class="cf-pip${i<s.idx?(runLog[i]?(runLog[i].correct?' ok':' ko'):''):(i===s.idx?' cur':'')}"></span>`).join('')}</span>${cfAlt?cfTrack(' cf-alt'):''}`
    :cfTrack('');
  const cfStreakChip=fillStreak>=2
    ?`<span class="cf-streak"><i class="ti ti-flame" aria-hidden="true"></i><span class="cf-sr">Serie </span>×${fillStreak}</span>`
    :'';
  // frasi lunghe: il corpo scende a scalini scelti dalla lunghezza (nessuna misura a runtime), per restare nella LIM
  const cfScale=q.t.length>180?' cf-s4':q.t.length>140?' cf-s3':q.t.length>100?' cf-s2':'';
  // La parola sta in data-w e la legge cfPick() da this.dataset: nessuna stringa JS dentro l'attributo onclick
  // (CORREZIONE: prima un apostrofo nella parola spezzava il gestore). Il testo passa sempre da escHtml/escAttr.
  const chips=shuffle([...q.bank]).map(w=>`<button type="button" class="chip cf-chip" data-w="${escAttr(w)}" aria-pressed="false" onclick="cfPick(this)">${_CF_MARK}<span class="cf-w">${escHtml(w)}</span>${_CF_TAG}</button>`).join('');
  cont.innerHTML=`${hdr}
    <div class="cf-board${cfScale}${nQ>_CF_HINT_MAX&&nQ<=_CF_PIPS_MAX?' cf-many':''}" id="cf-board">
      <div class="cf-hd">
        <span class="cf-hd-ic" aria-hidden="true"><i class="ti ti-puzzle"></i></span>
        <p class="cf-hint">Scegli la parola che completa la frase</p>
        ${cfStreakChip}
        <span class="cf-prog">${cfProg}<span><span class="cf-sr">Frase </span>${s.idx+1}/${nQ}</span></span>
      </div>
      <div class="cf-q">
        <p class="cf-sent">${escHtml(pts[0])}<span class="cf-slot" id="cf-slot" role="img" aria-label="Spazio vuoto da completare">${_CF_SIC}<span class="cf-sw"></span></span>${escHtml(pts[1]||'')}</p>
        <input class="cf-fi" id="fi" readonly tabindex="-1" inputmode="none" autocomplete="off" aria-hidden="true">
      </div>
      <p class="cf-lbl" id="cf-lbl">Scegli dalla banca:</p>
      <div class="word-bank cf-bank" role="group" aria-labelledby="cf-lbl">${chips}</div>
      <div class="cf-foot">
        <p class="cf-guide" id="cf-guide">${_CF_GUIDE_OFF}</p>
        <button class="btn btn-neon cf-verify" onclick="checkFill()" disabled aria-describedby="cf-guide">Verifica <i class="ti ti-lock ic-lock" aria-hidden="true"></i><i class="ti ti-arrow-right ic-go" aria-hidden="true"></i></button>
      </div>
      <div id="ffb" class="cf-fb" aria-live="polite"></div>
    </div>`;
  _cfFitBoard();   // .nar dalla larghezza reale della scheda, prima del primo paint
}

/* Scelta di una parola (E1b): sostituisce la precedente, scrive la parola in #fi (la fonte che legge checkFill),
   la rispecchia nello spazio della frase e attiva Verifica (E1a). Riscegliere la stessa tessera non cambia nulla
   (nessuna deselezione). A esito già mostrato non fa più niente: #fi non cambia mentre si legge il risultato. */
function cfPick(btn){
  const board=document.getElementById('cf-board');
  const fi=document.getElementById('fi');
  if(!board||!fi||!btn||!btn.dataset||btn.dataset.w===undefined) return;
  if(board.classList.contains('cf-res-ok')||board.classList.contains('cf-res-ko')) return;
  const w=btn.dataset.w;
  const changed=fi.value!==w;
  board.querySelectorAll('.word-bank .chip').forEach(c=>{
    const on=c===btn;
    c.classList.toggle('sel',on);
    c.setAttribute('aria-pressed',on?'true':'false');
  });
  fi.value=w;
  const slot=document.getElementById('cf-slot');
  if(slot){
    slot.querySelector('.cf-sw').textContent=w;     // textContent: nessun HTML dalla parola
    slot.classList.add('on');
    slot.setAttribute('aria-label','Spazio completato con: '+w);
    if(changed){ slot.classList.remove('cf-pop'); void slot.offsetWidth; slot.classList.add('cf-pop'); }
  }
  const v=board.querySelector('.cf-verify'); if(v) v.disabled=false;
  const g=document.getElementById('cf-guide'); if(g) g.innerHTML=_CF_GUIDE_ON;
}

/* Marcatura dell'esito sul DOM già disegnato (solo presentazione): classi sulla scheda, sulle tessere e sullo spazio,
   parola giusta accanto alla scelta sbagliata, riga guida, pannello in #ffb. Nessun calcolo: ok e bonus arrivano già fatti. */
function _cfShowResult(ok,q,picked,panelHtml){
  const board=document.getElementById('cf-board');
  if(!board) return;
  board.classList.add(ok?'cf-res-ok':'cf-res-ko');
  const chips=[...board.querySelectorAll('.word-bank .chip')];
  const pickEl=board.querySelector('.word-bank .chip.sel')||chips.find(c=>c.dataset.w===picked)||null;
  const rightEl=(ok&&pickEl)?pickEl:chips.find(c=>c.dataset.w.toLowerCase()===q.b.toLowerCase())||null;
  chips.forEach(c=>c.classList.remove('sel'));
  if(rightEl) rightEl.classList.add('cf-ok');
  if(!ok&&pickEl) pickEl.classList.add('cf-ko');
  if(pickEl) pickEl.setAttribute('aria-pressed','true');
  const slot=document.getElementById('cf-slot');
  if(slot){
    slot.classList.remove('on','cf-pop');
    slot.classList.add(ok?'cf-ok':'cf-ko');
    slot.setAttribute('aria-label',ok?'Spazio completato correttamente con: '+q.b:'Spazio completato con la tua risposta, sbagliata: '+picked);
    if(!ok&&rightEl){    // la parola giusta compare accanto alla sbagliata, dentro la frase
      const fix=document.createElement('span');
      fix.className='cf-slot cf-ok cf-fix'; fix.setAttribute('role','img'); fix.setAttribute('aria-label','Risposta giusta: '+q.b);
      fix.innerHTML=_CF_SIC+'<span class="cf-sw"></span>'; fix.querySelector('.cf-sw').textContent=rightEl.dataset.w;
      slot.after(fix);
    }
  }
  const g=document.getElementById('cf-guide'); if(g) g.innerHTML=_CF_GUIDE_RES;
  const fb=document.getElementById('ffb'); if(fb) fb.innerHTML=panelHtml;
}

function checkFill(){
  const s=fillState;
  // Guardie: stato non valido, esito già in mostra (un secondo click ripeteva punteggio e avanzamento) oppure
  // spazio vuoto (E1a: Verifica è disattivata finché non si sceglie una parola; qui solo difesa in profondità).
  if(!s||!s.qs||s.busy) return;
  const q=s.qs[s.idx];const fiEl=sh('fi');
  if(!q||!fiEl) return;
  const picked=fiEl.value;const val=picked.trim();
  if(!val) return;
  s.busy=true;
  const ok=val.toLowerCase()===q.b.toLowerCase();
  if(typeof AudioManager!=='undefined')AudioManager.play(ok?'correct':'wrong');
  let panel;
  if(ok){
    fillStreak++;
    if(fillStreak>fillBestStreak) fillBestStreak=fillStreak;
    const{scoreEarned,streakBonus}=calcFillAnswerScore(true,fillStreak);
    fillTotalScore+=scoreEarned;
    fillAnswerLog.push({questionId:'f'+s.idx,correct:true,streak:fillStreak,streakBonus,scoreEarned});
    s.score++;
    _trackRightQ(q.t, q.b);
    const bonusLine=streakBonus>0
      ?`<div class="fb-bonus"><i class="ti ti-flame" aria-hidden="true"></i><span>+${streakBonus} streak ×${fillStreak}</span><strong>+${scoreEarned} pt totali</strong></div>`
      :`<div class="fb-bonus"><strong>+${scoreEarned} pt</strong></div>`;
    panel=`<div class="fb ok"><div class="cf-vd"><span class="cf-vi" aria-hidden="true"><i class="ti ti-check"></i></span><strong class="cf-vt">Corretto</strong>${bonusLine}</div></div>`;
    const sc=document.querySelector('.cf-bar .game-counter-pill .cf-score-n');   // la barra può stare in topbar: cerca nel documento
    if(sc) sc.textContent=s.score;
  }else{
    fillStreak=0;
    fillAnswerLog.push({questionId:'f'+s.idx,correct:false,streak:0,streakBonus:0,scoreEarned:0});
    _trackWrongQ(q.t, q.b, sMod, 'fill');
    panel=`<div class="fb ko"><div class="cf-vd"><span class="cf-vi" aria-hidden="true"><i class="ti ti-x"></i></span><strong class="cf-vt">Sbagliato</strong><div class="cf-vx"><span>Risposta giusta:</span><strong>${escHtml(q.b)}</strong></div></div></div>`;
  }
  _cfShowResult(ok,q,picked,panel);
  // Dopo una risposta sbagliata 2,4 s (si deve poter leggere la parola giusta), dopo una giusta 1 s come prima.
  // Se nel frattempo la partita è stata chiusa o riavviata (fillState sostituito) il timer non fa nulla.
  setTimeout(()=>{ if(fillState!==s) return; s.idx++;s.busy=false;renderFill(sh('g-area')); },ok?1000:2400);
}

/* ==================================================
   GAME RESULT (non-quiz: match, memory, fill)
   v2.1.6: in modalit squadre delega a _onTeamTurnEnd()
   invece di mostrare il risultato finale individuale.
================================================== */
