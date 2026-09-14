/* ==================================================
   lo-sapevi.js — PixelProf v8.31.0 (Didattica · Lo Sapevi?)
   Seconda "attività didattica" di PixelProf, accanto a Flip Card
   (js/flip-card.js): carosello di curiosità, un solo file JSON per
   modulo (nessun livello Facile/Medio), nessun punteggio — vedi
   Lo_Sapevi.md per lo schema dati completo e la mappa Aree/Moduli/
   Chiavi.

   v8.31.0 — fix e aggiunte dopo il primo test reale di Erasmo (modulo
   con 101 curiosità):
     - RIMOSSA la paginazione a pallini (.ls-dots, un pallino per
       scheda): con moduli grandi diventavano centinaia di elementi,
       overflow della riga di navigazione e frecce prec/succ non più
       raggiungibili — oltre a essere praticamente invisibili in dark
       (rgba(255,255,255,.18) su sfondo scuro, contrasto insufficiente).
       Sostituita con una barra di progresso a larghezza fissa
       (.ls-progress-track/.ls-progress-fill): stesso ingombro
       visivo indipendentemente dal numero di schede (1 o 1000), le
       frecce restano sempre nella loro riga dedicata.
     - AGGIUNTO breadcrumb "Area — Modulo — Sotto-modulo" nell'header
       (vicino a "Esci"), richiesto esplicitamente da Erasmo — anche
       per Flip Card (vedi commento in flip-card.js). Il terzo livello
       (sotto-modulo) è valorizzato SOLO per le chiavi ECDL, dove la
       module map ora porta anche l'etichetta del sotto-modulo di
       provenienza di ciascuna scheda (vedi LOSAPEVI_MODULE_MAP più
       sotto) — dinamico: cambia scheda per scheda scorrendo il
       carosello, perché un modulo ECDL come "CE" concatena le
       curiosità di tutti i suoi sotto-moduli in un unico mazzo.

   v8.30.0: prima implementazione. Isolato in questo file, stessa
   filosofia dichiarata in testa a flip-card.js: fcState/lsState
   sono sistemi separati, nessuna riga toccata in game-engine-state.js
   per il CARICAMENTO dati (loader/module map/render tutti qui).
   ESPANSIONE DI SCOPO ESPLICITA (stesso identico motivo già
   documentato in flip-card.js per isFlipCardActive/
   confirmExitFlipCard): per la conferma di uscita da una sessione
   Lo Sapevi attiva servono 4 piccoli agganci "OR" fuori da questo
   file, altrimenti goHome()/backToDashboardFromApp()/goTab()
   (game-engine-state.js) e "Rivedi il tour guidato" (profile-panel.js)
   navigherebbero via SENZA chiedere conferma, perché controllano solo
   isFlipCardActive(). Le 4 righe aggiunte richiamano solo
   isLoSapeviActive()/confirmExitLoSapevi() definite qui — tutta la
   conoscenza di cosa sia "Lo Sapevi attivo" resta in questo file.

   Differenze volute rispetto a Flip Card, decise con Erasmo sul
   mockup (mockup-lo-sapevi-v2.html, dopo un giro di feedback):
     - Niente flip 3D: l'approfondimento (campo "detail", opzionale)
       si apre IN-CARD verso il basso con "❓ Scopri di più" — apposta
       diverso dal flip, per non far confondere le due modalità.
     - Carosello a 3 card (precedente/attuale/successiva) con velo
       sulle laterali e zoom sulla centrale, non una singola card
       con frecce prec/succ.
     - Nessun livello, nessun punteggio/autovalutazione: solo lettura.
     - Nessuno shuffle di default: ordine originale del JSON (a
       differenza di Flip Card, che mescola sempre) — DOMANDA APERTA
       ancora da confermare con Erasmo (vedi mockup).

   ATTENZIONE CHIAVI — LOSAPEVI_MODULE_MAP usa le chiavi REALMENTE
   valorizzate in sMod a runtime (FLIPCARD_MODULE_MAP/areas-config.js),
   non alla lettera quelle scritte in Lo_Sapevi.md dove le due fonti
   divergono (stesso disallineamento già annotato altrove come "da
   risolvere", mai una scoperta nuova):
     - Cyberbullismo Modulo 6: qui "difendersi-online" (chiave live,
       label "Cittadinanza Digitale"). Lo_Sapevi.md scrive invece
       "cittadinanza-digitale": usarla romperebbe il modulo, perché
       sMod non la valorizza mai a runtime.
     - 7 moduli Intelligenza Artificiale: qui le chiavi corte già live
       (cos-e-ai, come-funziona-ai, llm-fondamenti, provenienza-contenuti,
       verificare-ai, etica-ai, futuro-ai). Lo_Sapevi.md usa varianti
       più lunghe (es. cos-e-l-ai) mai usate da sMod.
     - Spreadsheet "Modulo 6 — Preparare e stampare il foglio"
       (chiave preparare-e-stampare-il-foglio, in Lo_Sapevi.md): NESSUN
       modulo/sMod corrispondente esiste in areas-config.js, né alcun
       file vero_o_falso sorgente in data/Minigiochi/ECDL/Spreadsheet/
       — OMESSO qui finché quel modulo non esiste "a monte" nel resto
       dell'app. Segnalato a Erasmo nel riepilogo di consegna.
   Se Lo_Sapevi.md verrà corretto per allinearsi alle chiavi live,
   andranno aggiornati anche i path qui sotto (solo il nome del file
   finale .json cambierebbe, non la struttura).
   ================================================== */

const LOSAPEVI_MODULE_MAP = {
  // v8.31.0: le chiavi ECDL usano {path,sub} invece di semplici stringhe
  // — "sub" è l'etichetta del sotto-modulo (es. "Fondamenti digitali"),
  // usata per il terzo livello del breadcrumb "Area — Modulo — Sotto-
  // modulo" nell'header di lettura. Le altre chiavi (un solo file, senza
  // sotto-modulo) restano semplici stringhe: il loader normalizza
  // entrambe le forme (vedi _lsNormalizeEntry).
  CE: [
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo1/lo_sapevi_fondamenti-digitali.json', sub: 'Fondamenti digitali' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo2/lo_sapevi_cpu-architettura.json', sub: 'CPU e architettura' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo3/lo_sapevi_memorie.json', sub: 'Memorie' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo4/lo_sapevi_software.json', sub: 'Software' },
  ],
  OE: [
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo1/lo_sapevi_rete-e-dati.json', sub: 'Rete e dati' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo2/lo_sapevi_identita-e-comunicazione.json', sub: 'Identità e comunicazione' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo3/lo_sapevi_navigazione-e-tracciamento.json', sub: 'Navigazione e tracciamento' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo4/lo_sapevi_sicurezza-e-comportamento-online.json', sub: 'Sicurezza e comportamento online' },
  ],
  WP: [
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo1/lo_sapevi_word-e-ambiente.json', sub: 'Word e ambiente' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo2/lo_sapevi_scrivere-e-salvare.json', sub: 'Scrivere e salvare' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo3/lo_sapevi_formattare-il-testo.json', sub: 'Formattare il testo' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo4/lo_sapevi_elementi-grafici.json', sub: 'Elementi grafici' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo5/lo_sapevi_strutturare-il-documento.json', sub: 'Strutturare il documento' },
  ],
  SS: [
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo1/lo_sapevi_excel-e-l-ambiente-di-lavoro.json', sub: "Excel e l'ambiente di lavoro" },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo2/lo_sapevi_inserire-e-gestire-i-dati.json', sub: 'Inserire e gestire i dati' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo3/lo_sapevi_formattare-il-foglio.json', sub: 'Formattare il foglio' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo4/lo_sapevi_formule-e-calcoli.json', sub: 'Formule e calcoli' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo5/lo_sapevi_organizzare-e-visualizzare-i-dati.json', sub: 'Organizzare e visualizzare i dati' },
  ],
  PP: [
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo1/lo_sapevi_creare-una-presentazione.json', sub: 'Creare una presentazione' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo2/lo_sapevi_oggetti-grafici.json', sub: 'Oggetti grafici' },
    { path: 'data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo3/lo_sapevi_preparare-e-presentare.json', sub: 'Preparare e presentare' },
  ],
  'identita-reputazione-digitale': ['data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo1/lo_sapevi_identita-reputazione-digitale.json'],
  'cyberbullismo': ['data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo2/lo_sapevi_cyberbullismo.json'],
  'hate-speech': ['data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo3/lo_sapevi_hate-speech.json'],
  'sexting-revenge-porn': ['data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo4/lo_sapevi_sexting-revenge-porn.json'],
  'grooming': ['data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo5/lo_sapevi_grooming.json'],
  'difendersi-online': ['data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo6/lo_sapevi_difendersi-online.json'],
  'fondamenti-cybersecurity': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/lo_sapevi_fondamenti-cybersecurity.json'],
  'sicurezza-account': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/lo_sapevi_sicurezza-account.json'],
  'protezione-dati': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/lo_sapevi_protezione-dati.json'],
  'sicurezza-quotidiana': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/lo_sapevi_sicurezza-quotidiana.json'],
  'sicurezza-pagamenti': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/lo_sapevi_sicurezza-pagamenti.json'],
  'privacy-normative': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/lo_sapevi_privacy-normative.json'],
  'sicurezza-online-social-network': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/lo_sapevi_sicurezza-online-social-network.json'],
  'nuove-minacce-digitali': ['data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/lo_sapevi_nuove-minacce-digitali.json'],
  'fondamenta-reti': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo1/lo_sapevi_fondamenta-reti.json'],
  'tcp-ip': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo2/lo_sapevi_tcp-ip.json'],
  'dns': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo3/lo_sapevi_dns.json'],
  'router-switch-dispositivi': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo4/lo_sapevi_router-switch-dispositivi.json'],
  'wifi-reti-wireless': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo5/lo_sapevi_wifi-reti-wireless.json'],
  'cloud-networking': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo6/lo_sapevi_cloud-networking.json'],
  'vpn': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo7/lo_sapevi_vpn.json'],
  'troubleshooting-reti': ['data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo8/lo_sapevi_troubleshooting-reti.json'],
  'malware-e-minacce-informatiche': ['data/Didattica/Lo_Sapevi/Malware_e_Minacce_Informatiche/Modulo1/lo_sapevi_malware-e-minacce-informatiche.json'],
  'cos-e-ai': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo1/lo_sapevi_cos-e-ai.json'],
  'come-funziona-ai': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo2/lo_sapevi_come-funziona-ai.json'],
  'llm-fondamenti': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo3/lo_sapevi_llm-fondamenti.json'],
  'ai-generativa': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo4/lo_sapevi_ai-generativa.json'],
  'prompt-engineering': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo5/lo_sapevi_prompt-engineering.json'],
  'agenti-automazione': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo6/lo_sapevi_agenti-automazione.json'],
  'deepfake-contenuti-sintetici': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo7/lo_sapevi_deepfake-contenuti-sintetici.json'],
  'provenienza-contenuti': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo8/lo_sapevi_provenienza-contenuti.json'],
  'verificare-ai': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo9/lo_sapevi_verificare-ai.json'],
  'etica-ai': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo10/lo_sapevi_etica-ai.json'],
  'bias-algoritmici': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo11/lo_sapevi_bias-algoritmici.json'],
  'ai-act': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo12/lo_sapevi_ai-act.json'],
  'futuro-ai': ['data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo13/lo_sapevi_futuro-ai.json'],
};

/* -- Loader dedicato ----------------------------------------------
   Stessa FORMA di FlipCardLoader (flip-card.js): cache per modulo,
   _resolveJsonPath condiviso (game-engine-state.js). Più semplice
   di FlipCardLoader: un solo "livello" (nessun facile/medio), JSON
   diretto invece di CSV da parsare. Se un path non esiste ancora
   (modulo "da creare", vedi Lo_Sapevi.md) il fetch dà 404 e
   startLoSapevi() lo gestisce mostrando la card "non disponibile",
   mai un errore JS — stesso identico pattern di FlipCardLoader. */
const LoSapeviLoader = (function(){
  const cache = {}; // mod -> [{fact, detail, sub}]
  function _entry(mod){ return LOSAPEVI_MODULE_MAP[mod]; }
  // Normalizza una entry della module map: stringa (un file, nessun
  // sotto-modulo) oppure {path,sub} (moduli ECDL, vedi commento sopra
  // la module map). Isolato qui: il resto del loader non deve sapere
  // quale delle due forme è stata usata per una data chiave.
  function _lsNormalizeEntry(e){ return typeof e === 'string' ? { path: e, sub: null } : e; }
  async function _load(mod){
    if(cache[mod]) return cache[mod];
    const rels = _entry(mod);
    if(!rels || !rels.length) throw new Error('[LoSapevi] Modulo non registrato: "' + mod + '".');
    const items = [];
    for(const rel of rels){
      const { path, sub } = _lsNormalizeEntry(rel);
      const url = _resolveJsonPath(path);
      const res = await fetch(url);
      if(!res.ok) throw new Error(`[LoSapevi] HTTP ${res.status} — ${url}`);
      let data;
      try{ data = await res.json(); }
      catch(e){ throw new Error(`[LoSapevi] JSON non valido in ${url}: ${e.message}`); }
      if(!Array.isArray(data) || !data.length) throw new Error(`[LoSapevi] Dati non validi o vuoti in ${url}`);
      data.forEach(entry => {
        if(entry && entry.fact) items.push({ fact: entry.fact, detail: entry.detail || null, sub });
      });
    }
    return cache[mod] = items;
  }
  return {
    load: async mod => [...(await _load(mod))],
    isCached: mod => !!cache[mod],
    hasModule: mod => !!_entry(mod),
  };
})();

/* -- Stato sessione corrente --------------------------------------
   Niente marks/wrongCount/correctCount (nessun punteggio, a
   differenza di fcState): solo il mazzo e l'indice corrente. */
let lsState = null; // { items: [{fact,detail}], idx, mod }

/* Card di stato (nessun modulo registrato / errore / vuoto) — stesso
   markup di _fcStateHTML() in flip-card.js (riusa .result-wrap già
   in pixelprof.css), pulsante di ritorno a Didattica invece che alla
   home: Lo Sapevi non ha una "sessione" nel senso di gameState. */
function _lsStateHTML({ icon, title, msg, color }){
  return `<div class="result-wrap">
    <div class="result-hero">
      <span class="result-stars" style="font-size:36px">${icon}</span>
      <span class="result-score" style="font-size:20px;color:${color};line-height:1.3">${escHtml(title)}</span>
      <span class="result-label" style="color:${color}99;margin-top:8px;line-height:1.5">${escHtml(msg)}</span>
    </div>
    <div class="btn-row">
      <button class="btn btn-neon" onclick="exitLoSapevi()"><i class="ti ti-arrow-left"></i> Torna a Didattica</button>
    </div>
  </div>`;
}

/* Breadcrumb "Area — Modulo — Sotto-modulo" (il terzo livello solo
   per i moduli ECDL, dove "sub" è valorizzato — vedi LOSAPEVI_MODULE_MAP
   e _lsNormalizeEntry). Usa AreasConfig.getModuleInfo(), già globale
   e popolato da js/areas-config.js: nessun dato duplicato qui. */
function _lsBreadcrumb(mod, sub){
  const info = window.AreasConfig && window.AreasConfig.getModuleInfo(mod);
  if(!info) return '';
  return info.areaLabel + ' — ' + info.label + (sub ? ' — ' + sub : '');
}

function _lsHeader(){
  return `<div class="game-header">
    <div class="game-header-left">
      <button class="game-exit-btn ls-exit-btn" onclick="exitLoSapeviConfirm()"><i class="ti ti-x"></i> Esci</button>
    </div>
    <span class="ls-breadcrumb" id="ls-breadcrumb"></span>
  </div>`;
}

/* Uscita diretta, senza conferma: usata dagli stati vuoto/errore
   (nulla da abbandonare) e internamente da exitLoSapeviConfirm()
   una volta confermato. Stesso pattern di exitFlipCard(). */
function exitLoSapevi(){
  lsState = null;
  setTb(null);
  showScreen('tab-home');
  goStep('didattica');
}

/* Vero solo quando ci sono DAVVERO curiosità in visualizzazione
   (lsState valorizzato) — non durante il breve gap di caricamento,
   stesso identico criterio di isFlipCardActive(). */
function isLoSapeviActive(){
  return document.getElementById('tab-games')?.classList.contains('active') && lsState !== null;
}

/* Stessa UX di confirmExitFlipCard(): usata dagli agganci in
   game-engine-state.js/profile-panel.js (goHome/backToDashboardFromApp/
   goTab/"Rivedi il tour guidato") per chiedere conferma prima di
   navigare via da una sessione Lo Sapevi attiva. */
async function confirmExitLoSapevi(continueFn){
  const ok = await ppConfirmBox('Stai per lasciare la sessione Lo Sapevi in corso.', {
    title: 'Uscire da Lo Sapevi?',
    icon: '💡',
    yesLabel: 'Sì, esci',
    noLabel: 'Annulla',
  });
  if(ok){
    lsState = null;
    continueFn();
  }
}

/* Uscita dal pulsante "Esci" in header — stessa UX di
   exitFlipCardConfirm() (ppConfirmBox generico di game-engine-state.js). */
async function exitLoSapeviConfirm(){
  const ok = await ppConfirmBox('Uscendo tornerai alla scelta del metodo di studio in Didattica.', {
    title: 'Uscire da Lo Sapevi?',
    icon: '💡',
    yesLabel: 'Sì, esci',
    noLabel: 'Annulla',
  });
  if(ok) exitLoSapevi();
}

/* Entry point chiamato da selDidattica('losapevi') in flip-card.js.
   A differenza di Flip Card non c'è uno step "scegli livello": un
   solo file per modulo, si entra direttamente nella lettura. */
async function startLoSapevi(cont, mod){
  if(!LoSapeviLoader.hasModule(mod)){
    cont.innerHTML = _lsStateHTML({
      icon: '💡', title: 'Lo Sapevi? non disponibile',
      msg: 'Questo modulo non ha ancora curiosità caricate per Lo Sapevi.',
      color: '#ffcc33',
    });
    return;
  }
  if(!LoSapeviLoader.isCached(mod)){
    cont.innerHTML = _lsStateHTML({
      icon: '💡', title: 'Caricamento…',
      msg: 'Sto preparando le curiosità di questo modulo.',
      color: '#ffcc33',
    });
  }
  let items;
  try{
    items = await LoSapeviLoader.load(mod);
  } catch(e){
    console.error('[PixelProf] Lo Sapevi load error:', e);
    cont.innerHTML = _lsStateHTML({
      icon: '⚠️', title: 'Errore caricamento',
      msg: 'Verifica che i file siano presenti in data/Didattica/Lo_Sapevi/ e ricarica la pagina.',
      color: '#ff6b6b',
    });
    return;
  }
  if(!items.length){
    cont.innerHTML = _lsStateHTML({
      icon: '💡', title: 'Nessuna curiosità trovata',
      msg: 'Il file di questo modulo esiste ma è vuoto.',
      color: '#ffcc33',
    });
    return;
  }
  lsState = { items, idx: 0, mod };
  _renderLoSapevi(cont);
}

/* Distanza in px tra il centro di due card adiacenti, come % della
   larghezza PROPRIA di ciascuna card (self-relative, non del
   contenitore): vedi css/lo-sapevi.css, .ls-slide usa width in %/min()
   del contenitore, quindi un translateX in % di sé stessa resta
   sempre coerente e responsive senza bisogno di un resize listener. */
const _LS_STEP_PCT = 105;

function _renderLoSapevi(cont){
  const s = lsState;
  cont.innerHTML = `${_lsHeader()}
    <div class="ls-counter" id="ls-counter"></div>
    <div class="ls-progress-track"><div class="ls-progress-fill" id="ls-progress-fill"></div></div>
    <div class="ls-carousel"><div class="ls-carousel-track" id="ls-track"></div></div>
    <div class="ls-nav-row">
      <button class="ls-nav-btn" id="ls-prev" onclick="lsNav(-1)" aria-label="Curiosità precedente"><i class="ti ti-chevron-left"></i></button>
      <button class="ls-nav-btn" id="ls-next" onclick="lsNav(1)" aria-label="Curiosità successiva"><i class="ti ti-chevron-right"></i></button>
    </div>`;
  const track = document.getElementById('ls-track');
  track.innerHTML = s.items.map((item, i) => `
    <div class="ls-slide" data-idx="${i}">
      <div class="ls-veil"></div>
      <div class="ls-eyebrow">// Lo sapevi?</div>
      <div class="ls-fact-text">${escHtml(item.fact)}</div>
      ${item.detail ? `
        <button class="ls-reveal-btn" onclick="lsToggleDetail(event)">❓ <span>Scopri di più</span></button>
        <div class="ls-detail-panel"><div class="ls-detail-inner">${escHtml(item.detail)}</div></div>
      ` : ''}
    </div>`).join('');
  _lsRenderPositions();
}

/* Riposiziona TUTTE le card ad ogni navigazione: offset = distanza
   dall'indice corrente. offset 0 = centrale (scala piena, nessun
   velo); |offset| 1 = laterale visibile (velata, più piccola, non
   interattiva); |offset| >= 2 = fuori vista (invisibile, pronta a
   scorrere dentro al prossimo giro). Un solo aggiornamento simultaneo
   di transform/opacity su tutte le card produce lo zoom-in sulla
   nuova centrale e lo zoom-out sulle altre richiesto da Erasmo, via
   la transition CSS già dichiarata su .ls-slide — nessuna animazione
   gestita manualmente in JS. */
function _lsRenderPositions(){
  const s = lsState;
  document.querySelectorAll('.ls-slide').forEach(el => {
    const i = parseInt(el.dataset.idx, 10);
    const offset = i - s.idx;
    const abs = Math.abs(offset);
    let scale, opacity, blur, z, pe;
    if(offset === 0){ scale = 1; opacity = 1; blur = 0; z = 5; pe = 'auto'; el.classList.remove('side'); }
    else if(abs === 1){ scale = .72; opacity = .55; blur = .6; z = 3; pe = 'none'; el.classList.add('side'); }
    else { scale = .58; opacity = 0; blur = 1; z = 1; pe = 'none'; el.classList.add('side'); }
    el.style.transform = `translateX(-50%) translateX(${offset * _LS_STEP_PCT}%) scale(${scale})`;
    el.style.opacity = opacity;
    el.style.filter = `blur(${blur}px)`;
    el.style.zIndex = z;
    el.style.pointerEvents = pe;
  });
  const counter = document.getElementById('ls-counter');
  if(counter) counter.textContent = 'Curiosità ' + (s.idx + 1) + ' di ' + s.items.length;
  const fill = document.getElementById('ls-progress-fill');
  if(fill) fill.style.width = ((s.idx + 1) / s.items.length * 100) + '%';
  const crumb = document.getElementById('ls-breadcrumb');
  if(crumb) crumb.textContent = _lsBreadcrumb(s.mod, s.items[s.idx].sub);
  const prev = document.getElementById('ls-prev'), next = document.getElementById('ls-next');
  if(prev) prev.disabled = s.idx === 0;
  if(next) next.disabled = s.idx === s.items.length - 1;
}

function _lsCloseAllDetails(){
  document.querySelectorAll('.ls-detail-panel.open').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.ls-reveal-btn span').forEach(sp => sp.textContent = 'Scopri di più');
}

function lsNav(dir){
  if(!lsState) return;
  const n = lsState.idx + dir;
  if(n < 0 || n >= lsState.items.length) return;
  lsState.idx = n;
  _lsCloseAllDetails();
  _lsRenderPositions();
}

function lsToggleDetail(evt){
  const btn = evt.currentTarget;
  const panel = btn.nextElementSibling;
  const span = btn.querySelector('span');
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open');
  span.textContent = opening ? 'Nascondi' : 'Scopri di più';
}
