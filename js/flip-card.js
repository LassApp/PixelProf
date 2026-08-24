/* ==================================================
   flip-card.js — PixelProf v8.16.0 (Didattica · Flip Card)
   Prima "attività didattica" di PixelProf, accanto ai
   Minigiochi: mazzo di carte domanda/risposta con flip 3D,
   caricato da un CSV dedicato per modulo.

   File interamente isolato: nessuna riga di questa
   funzionalità è stata aggiunta ai file "core" di PixelProf
   (game-engine-state.js, app.js, ecc.) — vengono solo letti.

   Contenuto:
     - FLIPCARD_MODULE_MAP   associazione modulo -> path CSV
                              (nessun path inventato: solo CE
                              ha un mazzo DEMO per collaudo,
                              vedi commento sotto)
     - _fcParseCsv()          parser CSV robusto (RFC4180-ish)
     - _fcRowsToCards()       righe grezze -> [{q,a}]
     - FlipCardLoader         loader dedicato: stessa forma di
                              _createLoader() in
                              game-engine-state.js (cache,
                              moduleMap, stessa risoluzione
                              path via _resolveJsonPath), ma
                              per testo CSV anziché JSON —
                              l'unica differenza è il formato.
     - selDidattica/startFlipCard/_renderFlipCard/fcFlip/fcNav
                              entry point, rendering, stato e
                              navigazione del mazzo

   Depends on (letti, MAI modificati): game-engine-state.js
   (sh, shq, escHtml, showScreen, setTb, sMod, modLabel,
   _resolveJsonPath, goStep).

   Caricamento: aggiunto a BUNDLE_FILES in tools/build.js,
   subito dopo gli altri game-*.js — stesso meccanismo con
   cui il bundle di produzione carica già tutti i minigiochi.
================================================== */

/* Path CSV per modulo. Erasmo fornirà i path reali dei
   moduli man mano che i mazzi saranno pronti: finché un
   modulo non compare qui, PixelProf mostra correttamente lo
   stato "nessun mazzo disponibile" (mai un errore JS).
   L'unica voce già presente (CE) punta a un mazzo DEMO con
   contenuti segnaposto, incluso solo per collaudare la
   pipeline end-to-end: va sostituita con il CSV reale. */
const FLIPCARD_MODULE_MAP = {
  CE: 'data/flip_card/computer_essentials_flip_DEMO.csv',
  // OE: 'data/flip_card/....csv',
  // WP: 'data/flip_card/....csv',
};

/* -- Parser CSV robusto (RFC4180-ish) --------------------
   Gestisce virgolette, virgolette raddoppiate ("") per il
   escaping, virgole/accenti/apostrofi nel testo, celle
   multilinea tra virgolette, righe vuote e spazi superflui.
   Non presuppone che un semplice split(',') sia sufficiente. */
function _fcParseCsv(text){
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const s = String(text || '').replace(/^\uFEFF/, ''); // rimuove BOM se presente
  for(let i = 0; i < s.length; i++){
    const c = s[i], next = s[i + 1];
    if(inQuotes){
      if(c === '"' && next === '"'){ field += '"'; i++; }
      else if(c === '"'){ inQuotes = false; }
      else field += c;
    } else {
      if(c === '"') inQuotes = true;
      else if(c === ','){ row.push(field); field = ''; }
      else if(c === '\r'){ /* ignorato: il fine riga è gestito da \n */ }
      else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); } // ultima riga senza \n finale
  return rows
    .map(r => r.map(c => c.trim()))
    .filter(r => r.some(c => c.length)); // scarta righe completamente vuote
}

/* Righe grezze -> [{q,a}]. Scarta un'eventuale riga di
   intestazione (domanda,risposta) e le righe senza risposta. */
function _fcRowsToCards(rows){
  if(!rows.length) return [];
  let start = 0;
  const head = (rows[0][0] || '').toLowerCase();
  if(/domanda|question/.test(head)) start = 1;
  const cards = [];
  for(let i = start; i < rows.length; i++){
    const q = rows[i][0], a = rows[i][1];
    if(q && a) cards.push({ q, a });
  }
  return cards;
}

/* -- Loader CSV dedicato -----------------------------------
   Stessa FORMA di _createLoader() in game-engine-state.js
   (cache per modulo, moduleMap, stesso _resolveJsonPath per
   il path) ma riscritto qui perché quello è specifico per
   JSON (.json()) — qui serve testo CSV. Isolato in questo
   file: nessuna modifica a game-engine-state.js. */
const FlipCardLoader = (function(){
  const cache = {};
  async function _load(mod){
    if(cache[mod]) return cache[mod];
    const rel = FLIPCARD_MODULE_MAP[mod];
    if(!rel) throw new Error('[FlipCard] Modulo non registrato: "' + mod + '".');
    const url = _resolveJsonPath(rel);
    const res = await fetch(url);
    if(!res.ok) throw new Error(`[FlipCard] HTTP ${res.status} — ${url}`);
    const text = await res.text();
    const cards = _fcRowsToCards(_fcParseCsv(text));
    return cache[mod] = cards;
  }
  return {
    load: async mod => [...(await _load(mod))],
    isCached: mod => !!cache[mod],
    hasModule: mod => !!FLIPCARD_MODULE_MAP[mod],
  };
})();

/* -- Stato mazzo corrente ---------------------------------- */
let fcState = null; // { cards, idx, flipped, mod }

/* Card di stato (nessun mazzo / vuoto / errore) — riusa le
   stesse classi CSS di _showGameError (.result-wrap, ecc.,
   già in pixelprof.css) per coerenza visiva, ma con un
   pulsante che torna a Didattica invece che alla home: Flip
   Card non ha una "sessione" da abbandonare, quindi non ha
   senso mandare l'utente fino a step-mod. */
function _fcStateHTML({ icon, title, msg, color }){
  return `<div class="result-wrap">
    <div class="result-hero">
      <span class="result-stars" style="font-size:36px">${icon}</span>
      <span class="result-score" style="font-size:20px;color:${color};line-height:1.3">${escHtml(title)}</span>
      <span class="result-label" style="color:${color}99;margin-top:8px;line-height:1.5">${escHtml(msg)}</span>
    </div>
    <div class="btn-row">
      <button class="btn btn-neon" onclick="exitFlipCard()"><i class="ti ti-arrow-left"></i> Torna a Didattica</button>
    </div>
  </div>`;
}

/* Header minimo dedicato — NON riusa buildGameHeader()
   (game-match.js): lì "Ricomincia" chiama restartActivity()
   -> launch(), che richiede sAct/sMod/sMode valorizzati come
   nei minigiochi, e "Esci" apre ppConfirm(()=>goHome()) con
   un testo pensato per un punteggio da perdere. Flip Card non
   ha punteggio né sAct/sMode: uscire torna direttamente a
   step-didattica, senza dialogo di conferma. */
function _fcHeader(){
  return `<div class="game-header">
    <div class="game-header-left">
      <button class="game-exit-btn" onclick="exitFlipCard()"><i class="ti ti-x"></i> Esci</button>
    </div>
  </div>`;
}

function exitFlipCard(){
  fcState = null;
  setTb(null);
  showScreen('tab-home');
  goStep('didattica');
}

/* Entry point chiamato dalla card "Flip Card" in
   step-didattica. Il parametro "type" prepara l'estensione a
   futuri metodi didattici senza dover cambiare questa firma. */
async function selDidattica(type){
  if(type !== 'flipcard') return;
  setTb(null);
  showScreen('tab-games');
  await startFlipCard(sh('g-area'), sMod);
}

async function startFlipCard(cont, mod){
  if(!FlipCardLoader.hasModule(mod)){
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '🗂️', color: '#a996ff', title: 'Nessun mazzo disponibile',
      msg: `Il modulo "${modLabel(mod)}" non ha ancora un set di carte Flip Card associato.`,
    });
    return;
  }
  if(!FlipCardLoader.isCached(mod)){
    cont.innerHTML = _fcHeader() + '<div class="fc-loading">Caricamento mazzo…</div>';
  }
  let cards;
  try{
    cards = await FlipCardLoader.load(mod);
  }catch(err){
    console.error('[PixelProf] FlipCard load error:', err);
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '⚠️', color: '#a996ff', title: 'Flip Card non disponibile',
      msg: 'Impossibile caricare il mazzo. Riprova o cambia modulo.',
    });
    return;
  }
  if(!cards.length){
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '📭', color: '#a996ff', title: 'Mazzo vuoto',
      msg: 'Il file CSV è stato trovato ma non contiene righe valide (colonne domanda,risposta).',
    });
    return;
  }
  fcState = { cards, idx: 0, flipped: false, mod };
  _renderFlipCard(cont);
}

function _renderFlipCard(cont){
  cont.innerHTML = `${_fcHeader()}
    <div class="fc-scene">
      <div class="fc-card" id="fc-card"
        role="button" tabindex="0"
        aria-label="Carta domanda e risposta, tocca o premi Invio per girare"
        onclick="fcFlip()"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fcFlip();}
                   if(event.key==='ArrowLeft'){event.preventDefault();fcNav(-1);}
                   if(event.key==='ArrowRight'){event.preventDefault();fcNav(1);}">
        <div class="fc-card-inner">
          <div class="fc-face fc-front">
            <div class="fc-eyebrow">// Domanda</div>
            <div class="fc-text" id="fc-q"></div>
            <div class="fc-hint">↻ tocca per la risposta</div>
          </div>
          <div class="fc-face fc-back">
            <div class="fc-eyebrow">// Risposta</div>
            <div class="fc-text" id="fc-a"></div>
            <div class="fc-hint">↻ tocca per tornare alla domanda</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fc-nav">
      <button class="fc-nav-btn" id="fc-prev" onclick="fcNav(-1)" aria-label="Card precedente"><i class="ti ti-chevron-left"></i></button>
      <span class="fc-counter-nav" id="fc-counter-nav"></span>
      <button class="fc-nav-btn" id="fc-next" onclick="fcNav(1)" aria-label="Card successiva"><i class="ti ti-chevron-right"></i></button>
    </div>`;
  _fcUpdateFaces();
}

function _fcUpdateFaces(){
  const s = fcState;
  if(!s) return;
  const card = s.cards[s.idx];
  const qEl = shq('fc-q'), aEl = shq('fc-a');
  if(qEl) qEl.textContent = card.q;
  if(aEl) aEl.textContent = card.a;
  const label = (s.idx + 1) + '/' + s.cards.length;
  const counterEl = shq('fc-counter-nav'); if(counterEl) counterEl.textContent = label;
  const prevBtn = shq('fc-prev'); if(prevBtn) prevBtn.disabled = s.idx === 0;
  const nextBtn = shq('fc-next'); if(nextBtn) nextBtn.disabled = s.idx === s.cards.length - 1;
  const cardEl = shq('fc-card');
  if(cardEl){
    cardEl.classList.toggle('flipped', s.flipped);
    const front = cardEl.querySelector('.fc-front');
    const back = cardEl.querySelector('.fc-back');
    // Evita che i lettori di schermo leggano contemporaneamente
    // le due facce sovrapposte: solo quella visibile resta esposta.
    if(front) front.setAttribute('aria-hidden', s.flipped ? 'true' : 'false');
    if(back) back.setAttribute('aria-hidden', s.flipped ? 'false' : 'true');
  }
}

function fcFlip(){
  if(!fcState) return;
  fcState.flipped = !fcState.flipped;
  _fcUpdateFaces();
}

function fcNav(dir){
  const s = fcState;
  if(!s) return;
  const n = s.idx + dir;
  if(n < 0 || n >= s.cards.length) return; // niente loop ai bordi
  s.idx = n;
  s.flipped = false;
  _fcUpdateFaces();
}
