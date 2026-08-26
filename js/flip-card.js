/* ==================================================
   flip-card.js — PixelProf v8.19.1 (Didattica · Flip Card)
   Prima "attività didattica" di PixelProf, accanto ai
   Minigiochi: mazzo di carte domanda/risposta con flip 3D,
   caricato da CSV dedicati per modulo + livello.

   v8.19.1: exitFlipCardConfirm() ora forza la conferma (niente
   Annulla) quando il tour guidato è esattamente sul passo dedicato —
   vedi js/onboarding.js v2.4.1 e ppConfirmBox() in
   game-engine-state.js (nuova opzione opts.forceConfirm).

   v8.19.0: 3 hook aggiunti per il tour guidato (richiesta
   esplicita utente, vedi js/onboarding.js v2.4.0) —
   _renderFlipCardLevelSelect() → showFlipCardLevelStep(),
   _renderFlipCard() → showFlipCardExitStep(),
   exitFlipCardConfirm() → showFlipCardConfirmStep(). File
   isolato: chiamano solo l'API pubblica già esposta da
   window.OnboardingTour, nessuna modifica ai file core.

   File interamente isolato: nessuna riga di questa
   funzionalità è stata aggiunta ai file "core" di PixelProf
   (game-engine-state.js, app.js, ecc.) — vengono solo letti.

   v8.17.0: introdotto lo step "scegli livello" (Facile/Medio)
   tra la card "Flip Card" e il mazzo. Ogni modulo è ora
   suddiviso in 4 sotto-argomenti (Modulo1..4 secondo
   Flip_Card.md) che vengono concatenati in un unico mazzo per
   livello — nessuna UI di scelta sotto-argomento: la selezione
   avviene già a monte scegliendo il modulo (CE/OE/WP), come
   per i minigiochi.

   Contenuto:
     - FLIPCARD_MODULE_MAP   modulo -> { facile:[path,...],
                              medio:[path,...] }. Ogni livello è
                              un array di path (i 4 sotto-argomenti
                              di quel modulo): FlipCardLoader li
                              scarica e concatena in un mazzo solo,
                              nell'ordine dell'array (Modulo1..4,
                              nessuno shuffle).
     - _fcParseCsv()          parser CSV robusto (RFC4180-ish)
     - _fcRowsToCards()       righe grezze -> [{q,a}]
     - FlipCardLoader         loader dedicato: stessa forma di
                              _createLoader() in
                              game-engine-state.js (cache,
                              moduleMap, stessa risoluzione
                              path via _resolveJsonPath), ma
                              per testo CSV anziché JSON, con
                              fetch+concat di più file per
                              livello anziché un singolo file.
     - selDidattica/_renderFlipCardLevelSelect/fcSelLevel/
       startFlipCard/_renderFlipCard/fcFlip/fcNav
                              entry point, scelta livello,
                              rendering, stato e navigazione
                              del mazzo

   Depends on (letti, MAI modificati): game-engine-state.js
   (sh, shq, escHtml, showScreen, setTb, sMod, modLabel,
   _resolveJsonPath, goStep). Riusa le classi CSS globali
   .act-back-row/.act-back-btn/.act-context-label/.act-grid/
   .act-card già definite in pixelprof.css (step-act,
   step-didattica): nessuna nuova classe CSS per lo step
   "scegli livello".

   Caricamento: aggiunto a BUNDLE_FILES in tools/build.js,
   subito dopo gli altri game-*.js — stesso meccanismo con
   cui il bundle di produzione carica già tutti i minigiochi.
================================================== */

/* Path CSV per modulo e livello. Struttura:
     <MOD>: { facile: [4 path sotto-argomenti], medio: [4 path] }
   Erasmo fornirà i path reali dei moduli man mano che i mazzi
   saranno pronti: finché un modulo non compare qui (o un
   livello ha array vuoto/assente), PixelProf mostra
   correttamente lo stato "nessun mazzo disponibile" o il
   livello disabilitato nello step di scelta (mai un errore JS).
   Path verificati contro il repo reale: cartella "Flip_Card"
   con la F maiuscola (coerente con le altre cartelle area del
   progetto) — ATTENZIONE, Flip_Card.md la documenta in
   minuscolo ("flip_card"): il documento va corretto, i path
   qui sotto usano quella reale, case-sensitive su GitHub Pages. */
const FLIPCARD_MODULE_MAP = {
  CE: {
    facile: [
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo1/Flip_Card_Facile_Modulo_1.csv',
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo2/Flip_Card_Facile_Modulo_2.csv',
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo3/Flip_Card_Facile_Modulo_3.csv',
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo4/Flip_Card_Facile_Modulo_4.csv',
    ],
    medio: [
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo1/Flip_Card_Medio_Modulo_1.csv',
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo2/Flip_Card_Medio_Modulo_2.csv',
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo3/Flip_Card_Medio_Modulo_3.csv',
      'data/Flip_Card/ECDL/Computer_Essentials/Modulo4/Flip_Card_Medio_Modulo_4.csv',
    ],
  },
  // OE: { facile: ['data/Flip_Card/ECDL/Online_Essentials/Modulo1/....csv', ...], medio: [...] },
  // WP: { facile: [...], medio: [...] },
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
   (cache, moduleMap, stesso _resolveJsonPath per il path) ma
   riscritto qui perché quello è specifico per JSON (.json())
   e per un solo file per modulo — qui servono più file CSV
   (i 4 sotto-argomenti) concatenati in un mazzo per livello.
   Isolato in questo file: nessuna modifica a
   game-engine-state.js. */
const FlipCardLoader = (function(){
  const cache = {}; // chiave "MOD|livello" -> [{q,a},...]
  const LEVELS = ['facile', 'medio'];
  function _key(mod, liv){ return mod + '|' + liv; }
  function _entry(mod){ return FLIPCARD_MODULE_MAP[mod]; }
  async function _load(mod, liv){
    const k = _key(mod, liv);
    if(cache[k]) return cache[k];
    const rels = (_entry(mod) || {})[liv];
    if(!rels || !rels.length) throw new Error('[FlipCard] Livello non registrato: "' + mod + '/' + liv + '".');
    const cards = [];
    for(const rel of rels){
      const url = _resolveJsonPath(rel);
      const res = await fetch(url);
      if(!res.ok) throw new Error(`[FlipCard] HTTP ${res.status} — ${url}`);
      const text = await res.text();
      cards.push(..._fcRowsToCards(_fcParseCsv(text)));
    }
    return cache[k] = cards;
  }
  return {
    load: async (mod, liv) => [...(await _load(mod, liv))],
    isCached: (mod, liv) => !!cache[_key(mod, liv)],
    hasModule: mod => !!_entry(mod),
    // Livelli con almeno un path registrato per quel modulo,
    // nell'ordine "facile, medio" — usato dallo step di scelta
    // livello per abilitare solo le card con contenuti pronti.
    levelsFor: mod => {
      const entry = _entry(mod);
      if(!entry) return [];
      return LEVELS.filter(l => entry[l] && entry[l].length);
    },
  };
})();

/* -- Stato mazzo corrente ---------------------------------- */
let fcState = null; // { cards, idx, flipped, mod, liv }

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
   -> launch(), che richiede sAct/sMode valorizzati come nei
   minigiochi. Flip Card non ha punteggio né sAct/sMode.
   Classe "fc-exit-btn" aggiuntiva (oltre a game-exit-btn):
   quest'ultima da sola è pensata per stare accanto a
   game-restart-btn (più colorato, fa risaltare l'accoppiata);
   qui è da sola ed era poco visibile in dark — fc-exit-btn le
   dà un contrasto proprio, tema viola coerente con Didattica. */
function _fcHeader(){
  return `<div class="game-header">
    <div class="game-header-left">
      <button class="game-exit-btn fc-exit-btn" onclick="exitFlipCardConfirm()"><i class="ti ti-x"></i> Esci</button>
    </div>
  </div>`;
}

/* Uscita diretta, senza conferma: usata dagli stati vuoto/errore
   (nulla da abbandonare, chiedere conferma sarebbe solo attrito)
   e internamente da exitFlipCardConfirm() una volta confermato. */
function exitFlipCard(){
  fcState = null;
  setTb(null);
  showScreen('tab-home');
  goStep('didattica');
}

/* Uscita dalla sessione attiva: chiede conferma, come richiesto,
   riusando il dialogo generico già presente in game-engine-state.js
   (ppConfirmBox — indipendente da ppConfirm/ppConfirmRestart, che
   sono legati al punteggio partita e non calzano qui). */
async function exitFlipCardConfirm(){
  // v2.4.1 (onboarding.js): mentre il tour guidato è esattamente su
  // questo passo, forziamo la conferma (niente Annulla/click-fuori/Esc)
  // — altrimenti l'utente potrebbe annullare e lasciare il tour con
  // anello/tooltip "orfani", puntati su un pulsante ormai scomparso.
  // Fuori dal tour il dialogo si comporta come sempre (Annulla incluso).
  const forceExit = typeof OnboardingTour !== 'undefined'
    && OnboardingTour.isCurrentStep('flipcardConfirm');
  const p = ppConfirmBox('Uscendo tornerai alla scelta del metodo di studio in Didattica.', {
    title: 'Uscire da Flip Card?',
    icon: '📖',
    yesLabel: 'Sì, esci',
    noLabel: 'Annulla',
    forceConfirm: forceExit,
  });
  // v2.4.0 (onboarding.js): ppConfirmBox() inserisce il markup del
  // dialogo in modo sincrono (_ppBuildModal, prima di restituire la
  // Promise) — #pp-generic-yes esiste già qui, prima dell'await.
  // Niente aggiunto a ppConfirmBox()/game-engine-state.js: restano
  // generici, usati anche altrove nell'app.
  if(typeof OnboardingTour !== 'undefined') OnboardingTour.showFlipCardConfirmStep();
  const ok = await p;
  if(ok) exitFlipCard();
}

/* Entry point chiamato dalla card "Flip Card" in
   step-didattica. Il parametro "type" prepara l'estensione a
   futuri metodi didattici senza dover cambiare questa firma.
   Non carica più il mazzo direttamente: da v8.17.0 mostra
   prima lo step "scegli livello" (Facile/Medio). */
async function selDidattica(type){
  if(type !== 'flipcard') return;
  setTb(null);
  showScreen('tab-games');
  _renderFlipCardLevelSelect(sh('g-area'), sMod);
}

/* Definizione presentazionale dei 2 livelli — riusa i due
   colori già presenti nel tema Flip Card (verde della faccia
   "Risposta", viola della faccia "Domanda"/dell'icona Flip
   Card in step-didattica): nessun colore nuovo introdotto. */
const FC_LEVELS = [
  { key: 'facile', label: 'Facile', desc: 'Concetti base, ripasso rapido', icon: 'ti-mood-smile', rgb: '0,255,150', color: '#00ff96' },
  { key: 'medio', label: 'Medio', desc: 'Approfondimento, dettagli tecnici', icon: 'ti-cards', rgb: '124,106,255', color: '#a996ff' },
];

/* Step "scegli livello": stessa struttura di act-back-row +
   act-grid + act-card già usata da step-act/step-didattica
   (classi globali in pixelprof.css) — nessuna nuova classe
   CSS. Le card dei livelli senza contenuti pronti (es. OE
   finché non ha CSV) restano visibili ma disabilitate, con
   la stessa logica "mai un errore JS" del resto del file. */
function _renderFlipCardLevelSelect(cont, mod){
  if(!FlipCardLoader.hasModule(mod)){
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '🗂️', color: '#a996ff', title: 'Nessun mazzo disponibile',
      msg: `Il modulo "${modLabel(mod)}" non ha ancora un set di carte Flip Card associato.`,
    });
    return;
  }
  const available = FlipCardLoader.levelsFor(mod);
  const cardsHtml = FC_LEVELS.map(l => {
    const ok = available.includes(l.key);
    const icon = `<div class="ai" style="background:rgba(${l.rgb},.12)"><i class="ti ${l.icon}" style="color:${l.color};font-size:20px"></i></div>`;
    const body = `<div><h3>${l.label}</h3><p>${escHtml(ok ? l.desc : 'Non ancora disponibile')}</p></div>`;
    if(!ok){
      return `<div class="act-card" style="opacity:.4;cursor:not-allowed" aria-disabled="true" aria-label="Livello ${l.label}, non disponibile">${icon}${body}</div>`;
    }
    return `<div class="act-card" role="button" tabindex="0" aria-label="Livello ${l.label}"
      onclick="fcSelLevel('${l.key}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fcSelLevel('${l.key}');}">${icon}${body}</div>`;
  }).join('');
  cont.innerHTML = `<div class="act-back-row">
      <button class="act-back-btn" onclick="exitFlipCard()"><i class="ti ti-arrow-left"></i> Didattica</button>
      <span class="act-context-label">Flip Card — scegli il livello</span>
    </div>
    <div class="act-grid">${cardsHtml}</div>`;
  // v2.4.0 (onboarding.js): la card livello appena cliccata ha già fatto
  // avanzare il tour guidato in capture-phase (stesso meccanismo del
  // resto del motore) — a questo punto stato e DOM sono già allineati.
  if(typeof OnboardingTour !== 'undefined') OnboardingTour.showFlipCardLevelStep();
}

/* Click su una card livello nello step precedente: passa a
   sMod (fissato all'ingresso in selDidattica, come i
   minigiochi) + il livello scelto. */
function fcSelLevel(liv){
  startFlipCard(sh('g-area'), sMod, liv);
}

async function startFlipCard(cont, mod, liv){
  if(!FlipCardLoader.hasModule(mod) || !FlipCardLoader.levelsFor(mod).includes(liv)){
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '🗂️', color: '#a996ff', title: 'Nessun mazzo disponibile',
      msg: `Il modulo "${modLabel(mod)}" non ha ancora un set di carte Flip Card associato per questo livello.`,
    });
    return;
  }
  if(!FlipCardLoader.isCached(mod, liv)){
    cont.innerHTML = _fcHeader() + '<div class="fc-loading">Caricamento mazzo…</div>';
  }
  let cards;
  try{
    cards = await FlipCardLoader.load(mod, liv);
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
      msg: 'I file CSV sono stati trovati ma non contengono righe valide (colonne domanda,risposta).',
    });
    return;
  }
  fcState = { cards, idx: 0, flipped: false, mod, liv };
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
  // v2.4.0 (onboarding.js): pulsante Esci pronto in DOM — 1 tick per
  // coerenza con lo stesso pattern usato altrove nel motore del tour.
  if(typeof OnboardingTour !== 'undefined') setTimeout(()=>OnboardingTour.showFlipCardExitStep(), 0);
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
