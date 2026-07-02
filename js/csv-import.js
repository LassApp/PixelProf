/* ==================================================
   csv-import.js — PixelProf v1.0.0
   Import massivo giocatori da CSV/TXT nel roster
   individuale dell'aula attiva (db.players), in
   alternativa all'inserimento manuale uno-alla-volta
   (addInd()) nella chip-list di #ps-ind.

   FORMATO SUPPORTATO:
     - un nominativo per riga ("Mario Rossi"), oppure
     - CSV a 2 colonne ("Rossi,Mario" / "Rossi;Mario")
       → unite come "Rossi Mario"
     - righe con più di 2 colonne: usate solo le prime
       due (es. classe/data di nascita in colonne extra
       vengono ignorate, non concatenate nel nome)
     - la prima riga viene scartata se sembra
       un'intestazione (Nome, Cognome, Nominativo,
       Studente, Alunno, Name, Surname, ...)
     - righe senza alcuna lettera (solo numeri/simboli,
       es. un ID o una data isolata) vengono scartate
     - encoding: il file viene letto come UTF-8 — export
       da Excel su Windows possono richiedere un
       ri-salvataggio in UTF-8 se i caratteri accentati
       (à, è, ecc.) risultano corrotti nell'anteprima

   FLUSSO:
     1. triggerCsvImport()  → apre il file picker nativo
     2. handleCsvFileSelect() → legge il file (FileReader)
     3. _csvParseContent()  → estrae nominativi puliti,
        deduplicati tra loro (case-insensitive)
     4. _csvOnFileRead()    → separa nuovi/duplicati
        confrontando con db.players esistenti
     5. _csvShowPreview()   → modal di anteprima (riusa
        _ppBuildModal — stesso stile di ppAlert/
        ppConfirmBox in game-engine-state.js) con elenco
        modificabile (× per escludere singoli nominativi)
        PRIMA di scrivere qualsiasi cosa
     6. _csvCommitImport()  → scrive in db.players,
        save(), re-render chips, sync cloud
        fire-and-forget via window.DB.upsertPlayer
        (stesso pattern di deletePlayer/deleteSavedTeam
        in game-engine-state.js)

   Depends on: game-engine-state.js (db, save,
   renderIndChips, checkCanStart, escHtml, shq, ppAlert,
   _ppBuildModal, _ppCloseActiveModal, activeCourseId),
   window.DB (db_adapter.js, opzionale — se assente
   l'import resta comunque valido in locale/offline).
================================================== */

const _CSV_MAX_NAMES = 200; // stesso ordine di grandezza del cap db.wrongQ
const _CSV_MAX_LEN   = 50;  // lunghezza massima per singolo nominativo

/** Apre il file picker nativo collegato all'input nascosto in #ps-ind. */
function triggerCsvImport(){
  const inp = shq('csv-import-input');
  if(inp){ inp.value=''; inp.click(); }
}

/** true se la riga sembra un'intestazione di colonna piuttosto che un nome. */
function _csvLooksLikeHeader(line){
  const norm = line.toLowerCase().replace(/[;,\t]/g,' ').replace(/\s+/g,' ').trim();
  return /^(nome|cognome|nominativo|studente|alunno|allievo|name|surname|full ?name|student)\b/.test(norm);
}

/** Estrae un nome pulito da una riga — 1 colonna = nome intero,
 *  2+ colonne = prime due unite (Cognome+Nome), colonne extra ignorate. */
function _csvParseLine(line){
  const parts = line.split(/[,;\t]/).map(p=>p.trim()).filter(Boolean);
  if(!parts.length) return '';
  const name = parts.length===1 ? parts[0] : (parts[0]+' '+parts[1]);
  return name.replace(/\s+/g,' ').trim();
}

/** Converte il testo grezzo del file in una lista di nominativi puliti
 *  e deduplicati tra loro (case-insensitive). Non tocca db.players. */
function _csvParseContent(text){
  const lines = String(text||'').split(/\r\n|\r|\n/);
  const seen  = new Set();
  const names = [];
  lines.forEach((raw, idx)=>{
    const line = raw.trim();
    if(!line) return;
    if(idx===0 && _csvLooksLikeHeader(line)) return;
    let name = _csvParseLine(line);
    if(!name) return;
    if(!/[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(name)) return; // scarta righe senza lettere
    if(name.length > _CSV_MAX_LEN) name = name.slice(0, _CSV_MAX_LEN).trim();
    const key = name.toLowerCase();
    if(seen.has(key)) return;
    seen.add(key);
    names.push(name);
  });
  return names.slice(0, _CSV_MAX_NAMES);
}

function handleCsvFileSelect(evt){
  const file = evt.target.files && evt.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload  = () => _csvOnFileRead(String(reader.result||''));
  reader.onerror = () => ppAlert('Impossibile leggere il file selezionato. Riprova con un file .csv o .txt.', {title:'Errore lettura file', icon:'⚠️'});
  reader.readAsText(file, 'UTF-8');
}

function _csvOnFileRead(text){
  const parsed = _csvParseContent(text);
  if(!parsed.length){
    ppAlert('Nessun nominativo valido trovato nel file. Formato atteso: un nome per riga, oppure Cognome,Nome separati da virgola.', {title:'Nessun dato trovato', icon:'📭'});
    return;
  }
  const existing = new Set((db.players||[]).map(p=>p.toLowerCase()));
  const fresh = [];
  let dupCount = 0;
  parsed.forEach(n=>{
    if(existing.has(n.toLowerCase())) dupCount++;
    else fresh.push(n);
  });
  if(!fresh.length){
    ppAlert('Tutti i '+parsed.length+' nominativi trovati sono già presenti nel roster di questa aula.', {title:'Nessun nuovo giocatore', icon:'✅'});
    return;
  }
  _csvShowPreview(fresh, dupCount);
}

/** Modal di anteprima — riusa _ppBuildModal (game-engine-state.js):
 *  stesso overlay/box/animazione di ppAlert/ppConfirmBox, contenuto
 *  personalizzato con elenco modificabile prima della conferma. */
function _csvShowPreview(names, dupCount){
  let list = [...names];

  const dupNote = dupCount>0
    ? `<div class="csv-import-dupnote"><i class="ti ti-info-circle"></i> ${dupCount} nominativ${dupCount===1?'o':'i'} già presente${dupCount===1?'':'i'} in questa aula ${dupCount===1?'è stato':'sono stati'} escluso${dupCount===1?'':'i'} automaticamente.</div>`
    : '';

  const renderRows = () => list.length
    ? list.map((n,i)=>`
        <div class="csv-import-row" data-idx="${i}">
          <span class="csv-import-row-name">${escHtml(n)}</span>
          <button class="csv-import-row-del" data-idx="${i}" title="Escludi"><i class="ti ti-x"></i></button>
        </div>`).join('')
    : `<div class="csv-import-empty-list">Nessun nominativo selezionato.</div>`;

  const overlay = _ppBuildModal(`
    <div class="pp-generic-icon">📋</div>
    <div class="pp-generic-title">Importa giocatori</div>
    <div class="pp-generic-msg">Trovati <strong>${list.length}</strong> nuovi nominativi da aggiungere all'aula.</div>
    ${dupNote}
    <div class="csv-import-list" id="csv-import-list">${renderRows()}</div>
    <div class="pp-generic-btns">
      <button class="pp-generic-btn cancel" id="csv-import-cancel">Annulla</button>
      <button class="pp-generic-btn confirm" id="csv-import-confirm">Importa <span id="csv-import-count">${list.length}</span></button>
    </div>`);

  const listEl     = overlay.querySelector('#csv-import-list');
  const countEl    = overlay.querySelector('#csv-import-count');
  const confirmBtn = overlay.querySelector('#csv-import-confirm');
  const cancelBtn  = overlay.querySelector('#csv-import-cancel');

  listEl.addEventListener('click', e=>{
    const btn = e.target.closest('.csv-import-row-del');
    if(!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    list.splice(idx, 1);
    listEl.innerHTML = renderRows();
    countEl.textContent = list.length;
    confirmBtn.disabled = list.length===0;
  });

  const _cancel = () => _ppCloseActiveModal();
  cancelBtn.addEventListener('click', _cancel);
  overlay.addEventListener('mousedown', e => { if(e.target===overlay) _cancel(); });
  overlay._onKey = e => { if(e.key==='Escape'){ e.preventDefault(); _cancel(); } };
  document.addEventListener('keydown', overlay._onKey);

  confirmBtn.addEventListener('click', ()=>{
    if(!list.length) return;
    const toImport = [...list];
    _ppCloseActiveModal();
    _csvCommitImport(toImport);
  });
}

/** Scrive i nuovi nominativi in db.players, salva, aggiorna la UI,
 *  sincronizza col cloud (fire-and-forget — stesso pattern di
 *  deletePlayer/deleteSavedTeam in game-engine-state.js). */
function _csvCommitImport(names){
  if(!db.players) db.players = [];
  let added = 0;
  names.forEach(n=>{
    if(!db.players.includes(n)){ db.players.push(n); added++; }
  });
  save();
  renderIndChips();
  checkCanStart();

  if(window.DB && activeCourseId){
    names.forEach(n=>{
      window.DB.upsertPlayer(activeCourseId, {name:n}).catch(e=>
        console.warn('[PixelProf] csv import upsertPlayer err:', n, e)
      );
    });
  }

  ppAlert(
    added + ' giocator' + (added===1?'e':'i') + ' aggiunt' + (added===1?'o':'i') + ' al roster di questa aula.',
    {title:'Import completato', icon:'✅', okLabel:'Perfetto'}
  );
}
