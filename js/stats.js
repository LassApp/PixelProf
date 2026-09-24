/* ==================================================
   stats.js — PixelProf v8.38.0
   Stats screen: renderStats, resetStats.
   Storico sessioni: renderHistory, resetHistory, exportHistoryCSV.
   v5.0.2: resetStats include WP; exportHistoryCSV aggiunto.
   v8.38.1: FIX — _mergeCloudModuleStats/_mergeCloudSessions
     trattavano un array cloud vuoto come "fetch fallito" invece che
     come segnale valido di azzeramento avvenuto altrove: un reset da
     un altro dispositivo non si propagava mai qui. Stesso bug corretto
     in badges.js (_mergeCloudBadges) — vedi lì per i dettagli.
   v8.38.0: _mergeCloudModuleStats/_mergeCloudSessions — "Progressi" e
     "Storico sessioni" leggono ora anche l'aggregato cross-device
     (module_stats, matches+scores), non solo db.stats/db.sessions
     locali. reset* azzerano anche il lato cloud. Chiamate da
     courses.js (_enterCourseDirect) e da _doGoTab (game-engine-
     state.js) quando si apre la relativa scheda — vedi
     sql/v8.38.0_progress_sessions_badges_sync.sql.
   Depends on: game-engine-state.js (db global)
================================================== */

/* ==================================================
   STATS
================================================== */
function renderStats(){
  sh('st-tot').textContent=db.stats.tot;sh('st-cor').textContent=db.stats.cor;
  sh('st-pct').textContent=db.stats.tot>0?Math.round(db.stats.cor/db.stats.tot*100)+'%':'0%';

  // v8.8.0 — moduli mostrati dinamici in base all'Area dell'aula attiva
  // (prima erano fissi a CE/OE/WP per qualunque aula: un'aula Cybersecurity
  // mostrava sempre "Word/Computer/Online Essentials" con dati a zero).
  const course   = (typeof activeCourseId!=='undefined' && activeCourseId) ? loadCourses().find(c=>c.id===activeCourseId) : null;
  const areaKey  = course?.areaKey || 'ecdl';
  const areaInfo = window.AreasConfig?.getAreaByKey(areaKey);
  const mods = areaInfo
    ? areaInfo.modules.filter(m=>m.contentReady===true).map(m=>({key:m.key,label:m.label}))
    : [{key:'CE',label:'Computer Essentials'},{key:'OE',label:'Online Essentials'},{key:'WP',label:'Word Processor'},{key:'SS',label:'Spreadsheets'},{key:'PP',label:'Power Point'}];

  sh('st-mods').innerHTML=mods.map(({key:k,label:n})=>{
    const m=db.stats.byMod[k]||{c:0,w:0};const tot=m.c+m.w;const pct=tot>0?Math.round(m.c/tot*100):0;
    return`<div class="mod-stat"><div class="mod-stat-row"><span>${escHtml(n)}</span><span style="font-family:'Share Tech Mono',monospace;color:var(--accent)">${m.c}/${tot} · ${pct}%</span></div><div class="prog-bar" style="margin:0"><div class="prog-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
}

async function resetStats(){
  const ok = await ppConfirmBox(
    'Questa azione azzera definitivamente domande totali, risposte corrette e accuratezza per modulo di questa aula.',
    { title:'Azzerare i progressi?', icon:'📊', yesLabel:'Sì, azzera', danger:true }
  );
  if(!ok) return;
  db.stats={tot:0,cor:0,byMod:{}};
  save();
  // v8.38.0: azzera anche module_stats sul cloud — atteso prima del
  // re-render, altrimenti il prossimo _mergeCloudModuleStats potrebbe
  // rileggere numeri non ancora cancellati.
  if(window.DB?.resetClassroomModuleStats && activeCourseId){
    await window.DB.resetClassroomModuleStats(activeCourseId).catch(()=>null);
  }
  renderStats();
}

/**
 * v8.38.0 — arricchisce db.stats con l'aggregato cross-device da
 * module_stats (per-modulo, copre anche le aree non-ECDL — a
 * differenza di stats_aggregate che ha colonne fisse CE/OE/WP — vedi
 * sql/v8.38.0_progress_sessions_badges_sync.sql). Fire-and-forget:
 * renderStats() ha già disegnato con i dati locali; qui aggiorniamo
 * SOLO se il cloud porta numeri più alti (l'aggregato cross-device è
 * sempre ≥ al locale, mai inferiore).
 */
async function _mergeCloudModuleStats(id){
  if(typeof window.DB?.getClassroomModuleStats!=='function') return;
  let rows;
  try{ rows=await window.DB.getClassroomModuleStats(id); }
  catch(err){ console.warn('[PixelProf] _mergeCloudModuleStats errore:',err); return; }
  // v8.38.1 — FIX: stesso bug di _mergeCloudBadges (vedi badges.js) —
  // array vuoto = azzerato altrove, non fallimento.
  if(!Array.isArray(rows)) return;
  if(typeof activeCourseId!=='undefined' && activeCourseId!==id) return;
  let changed=false;
  if(!rows.length){
    if(Object.keys(db.stats.byMod).length || db.stats.tot || db.stats.cor){
      db.stats={tot:0,cor:0,byMod:{}};
      changed=true;
    }
  }else{
    rows.forEach(r=>{
      if(!r.module) return;
      const local=db.stats.byMod[r.module]||{c:0,w:0};
      const c=Math.max(local.c, r.correct||0);
      const w=Math.max(local.w, r.wrong||0);
      if(c!==local.c||w!==local.w){ db.stats.byMod[r.module]={c,w}; changed=true; }
    });
    if(changed){
      // Ricalcola i totali dalla somma di TUTTI i moduli noti (locali +
      // cloud), non solo quelli tornati da module_stats — così non si
      // perdono moduli giocati offline e mai sincronizzati.
      let tot=0,cor=0;
      Object.values(db.stats.byMod).forEach(m=>{ tot+=(m.c+m.w); cor+=m.c; });
      db.stats.tot=Math.max(db.stats.tot,tot);
      db.stats.cor=Math.max(db.stats.cor,cor);
    }
  }
  if(changed){
    save();
    if(shq('st-tot')) renderStats();
  }
}

/* ==================================================
   STORICO SESSIONI — v5.0.0 N3
   Legge db.sessions (array append-only, max 100 voci)
   e le visualizza in ordine cronologico inverso
   (più recente in cima), con filtri per attività e
   modalità. Ogni card mostra: gioco, modulo, modalità,
   partecipanti + punteggi, data/ora.
================================================== */

/* Label e icone coerenti con game-constants.js */
const _HIST_ACT_ICON ={quiz:'🧠',speed:'⚡',match:'🔗',memory:'🃏',fill:'✏️',truefalse:'⚖️'};
const _HIST_ACT_LABEL={quiz:'Quiz',speed:'Speed Quiz',match:'Abbina',memory:'Memory',fill:'Completa',truefalse:'Vero o Falso'};
const _HIST_MOD_LABEL={CE:'Computer Essentials',OE:'Online Essentials',WP:'Word Processor',SS:'Spreadsheets',PP:'Power Point'};
const _HIST_MOD_COLOR={CE:'#ffcf5c',OE:'#7c6aff',WP:'#00cfff',SS:'#44c76a',PP:'#ffa564'};

function _histFormatDate(iso){
  if(!iso)return'—';
  try{
    const d=new Date(iso);
    const oggi=new Date();
    const ieri=new Date(oggi);ieri.setDate(ieri.getDate()-1);
    const isSameDay=(a,b)=>a.getDate()===b.getDate()&&a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear();
    const timeStr=d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    if(isSameDay(d,oggi)) return'Oggi · '+timeStr;
    if(isSameDay(d,ieri)) return'Ieri · '+timeStr;
    return d.toLocaleDateString('it-IT',{day:'2-digit',month:'short'})+' · '+timeStr;
  }catch{return iso;}
}

function _histBuildCard(s,idx){
  const actIcon =_HIST_ACT_ICON[s.game] ||'🎮';
  const actLabel=_HIST_ACT_LABEL[s.game]||s.game;
  const modLabelTxt=_HIST_MOD_LABEL[s.mod] ||(typeof modLabel==='function'?modLabel(s.mod):null)||s.mod||'—';
  const modColor=_HIST_MOD_COLOR[s.mod] ||'rgba(255,255,255,.3)';
  const modeLabel=s.mode==='sq'?'Squadre':'Individuale';
  const modeIcon =s.mode==='sq'?'👥':'👤';

  // Ordina teams per punteggio desc
  const sorted=[...(s.teams||[])].sort((a,b)=>(b.score||0)-(a.score||0));
  const medals=['🥇','🥈','🥉'];

  const teamsHTML=sorted.map((t,i)=>{
    const medal=i<3?medals[i]:'';
    const colorDot=t.color
      ?`<span class="hist-color-dot" style="background:${escAttr(t.color)};box-shadow:0 0 5px ${escAttr(t.color)}"></span>`
      :'';
    return`<div class="hist-team-row">
      <div class="hist-team-left">
        <span class="hist-team-medal">${medal}</span>
        ${colorDot}
        <span class="hist-team-name">${escHtml(t.name||'—')}</span>
      </div>
      <span class="hist-team-pts">${t.score!=null?t.score+' pt':'—'}</span>
    </div>`;
  }).join('');

  return`<div class="hist-card">

    <!-- Accent bar top — colore dinamico per modulo, resta inline -->
    <div class="hist-card-accent" style="background:${modColor}"></div>

    <!-- Header riga: icona attività + label + badge modulo + data -->
    <div class="hist-card-header">
      <span class="hist-card-icon">${actIcon}</span>
      <span class="hist-card-title">${escHtml(actLabel)}</span>
      <span class="hist-card-modtag" style="background:${modColor}18;border:1px solid ${modColor}40;color:${modColor}">${escHtml(modLabelTxt)}</span>
      <span class="hist-card-modetag">${modeIcon} ${escHtml(modeLabel)}</span>
      <span class="hist-card-date">
        <i class="ti ti-clock" style="font-size:9px"></i> ${_histFormatDate(s.timestamp)}
      </span>
    </div>

    <!-- Partecipanti + punteggi -->
    <div class="hist-card-body">${teamsHTML||'<div class="hist-card-empty">Nessun partecipante registrato</div>'}</div>
  </div>`;
}

function renderHistory(){
  const body=shq('hist-body');
  if(!body)return;

  const filterAct =(shq('hist-filter-act') ?.value)||'';
  const filterMode=(shq('hist-filter-mode')?.value)||'';

  // db.sessions è in ordine cronologico ascendente — invertiamo per mostrare il più recente in cima
  const sessions=[...(db.sessions||[])].reverse();

  const filtered=sessions.filter(s=>{
    if(filterAct  && s.game!==filterAct)  return false;
    if(filterMode && s.mode!==filterMode) return false;
    return true;
  });

  if(!filtered.length){
    const hasAny=(db.sessions||[]).length>0;
    body.innerHTML=`<div style="text-align:center;padding:3rem 1rem">
      <div style="font-size:36px;margin-bottom:14px;opacity:.4">📋</div>
      <div style="font-size:14px;font-weight:600;color:rgba(255,255,255,.35);margin-bottom:6px">
        ${hasAny?'Nessuna sessione corrisponde ai filtri':'Nessuna sessione registrata'}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,.2);font-family:'Share Tech Mono',monospace">
        ${hasAny?'Prova a cambiare i filtri':'Gioca una partita per vedere lo storico qui'}
      </div>
    </div>`;
    return;
  }

  // Contatore sessioni visibili + bottone export
  const counter=`<div class="hist-count-label" style="font-size:10px;font-family:'Share Tech Mono',monospace;
    margin-bottom:12px;display:flex;align-items:center;gap:6px">
    <span>${filtered.length} sessione${filtered.length!==1?'i':''} ${filterAct||filterMode?'filtrate':'totali'}</span>
    <span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.08),transparent)"></span>
    <button class="csv-export-btn csv-export-btn-sm" onclick="exportHistoryCSV()">
      <i class="ti ti-download" style="font-size:11px"></i> Esporta CSV
    </button>
  </div>`;

  body.innerHTML=counter+filtered.map((s,i)=>_histBuildCard(s,i)).join('');
}

async function resetHistory(){
  const ok = await ppConfirmBox(
    'Tutte le sessioni salvate nello storico di questa aula verranno eliminate definitivamente.',
    { title:'Cancellare lo storico?', icon:'📋', yesLabel:'Sì, cancella tutto', danger:true }
  );
  if(!ok) return;
  db.sessions=[];
  save();
  // v8.38.0: azzera anche matches/scores sul cloud — ATTENZIONE: sono le
  // stesse tabelle lette dalle KPI di partecipazione della Panoramica
  // Classe, quindi azzerare lo storico riduce anche quei conteggi.
  if(window.DB?.resetClassroomSessions && activeCourseId){
    await window.DB.resetClassroomSessions(activeCourseId).catch(()=>null);
  }
  renderHistory();
}

/**
 * v8.38.0 — arricchisce db.sessions con le sessioni giocate su ALTRI
 * dispositivi (matches+scores già su Supabase via saveMatch, mai
 * riletti finora — vedi sql/v8.38.0_progress_sessions_badges_sync.sql).
 * Raggruppa le righe flat per match_id nella stessa forma già usata
 * localmente ({game,mod,mode,teams,timestamp}), poi unisce evitando
 * duplicati (stesso timestamp+game+mod = sessione già nota — stesso
 * criterio "abbastanza buono" già visto altrove in questo progetto).
 * Rispetta il cap locale di 100 voci (le più recenti, come
 * saveSessionResult). LIMITE NOTO: le sessioni ricostruite dal cloud
 * non portano bestStreak/maxCombo/perfectRun (mai salvati su
 * matches/scores) — i badge legati a streak/combo restano quindi
 * basati solo sui dati del dispositivo che li ha effettivamente
 * raggiunti, non su un ipotetico record cross-device.
 */
async function _mergeCloudSessions(id){
  if(typeof window.DB?.getClassroomSessions!=='function') return;
  let rows;
  try{ rows=await window.DB.getClassroomSessions(id); }
  catch(err){ console.warn('[PixelProf] _mergeCloudSessions errore:',err); return; }
  // v8.38.1 — FIX: stesso bug di _mergeCloudBadges (vedi badges.js) —
  // array vuoto = azzerato altrove, non fallimento.
  if(!Array.isArray(rows)) return;
  if(typeof activeCourseId!=='undefined' && activeCourseId!==id) return;
  if(!db.sessions)db.sessions=[];
  let changed=false;
  if(!rows.length){
    if(db.sessions.length){ db.sessions=[]; changed=true; }
  }else{
    const byMatch={};
    rows.forEach(r=>{
      if(!byMatch[r.match_id]) byMatch[r.match_id]={course:id,game:r.activity,mod:r.module,mode:r.mode,timestamp:r.created_at,teams:[]};
      byMatch[r.match_id].teams.push({name:r.participant_name,color:r.participant_color,score:r.points});
    });
    const known=new Set(db.sessions.map(s=>`${s.timestamp}|${s.game}|${s.mod}`));
    Object.values(byMatch).forEach(cs=>{
      const k=`${cs.timestamp}|${cs.game}|${cs.mod}`;
      if(!known.has(k)){ db.sessions.push(cs); known.add(k); changed=true; }
    });
    if(changed){
      db.sessions.sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
      if(db.sessions.length>100) db.sessions=db.sessions.slice(-100);
    }
  }
  if(changed){
    save();
    if(shq('hist-body')) renderHistory();
    if(typeof checkAndShowNewBadges==='function') checkAndShowNewBadges();
  }
}

/* ==================================================
   EXPORT STORICO CSV — v5.0.2
   Esporta le sessioni visibili (con filtri applicati)
   come file .csv scaricabile. Pattern identico a
   exportLbCSV() in renderer.js.
   Colonne: Data, Attività, Modulo, Modalità,
            Giocatore/Squadra, Punteggio, Posizione.
   Una riga per partecipante → facile da pivottare
   in Excel / Google Sheets.
================================================== */
function exportHistoryCSV(){
  const filterAct =(shq('hist-filter-act') ?.value)||'';
  const filterMode=(shq('hist-filter-mode')?.value)||'';

  const sessions=[...(db.sessions||[])].reverse();
  const filtered=sessions.filter(s=>{
    if(filterAct  && s.game!==filterAct)  return false;
    if(filterMode && s.mode!==filterMode) return false;
    return true;
  });

  if(!filtered.length){
    ppAlert('Non ci sono sessioni da esportare con i filtri selezionati.', { title:'Nessun dato da esportare', icon:'📋' });
    return;
  }

  const ACT_LABEL_MAP ={quiz:'Quiz',speed:'Speed Quiz',match:'Abbina',memory:'Memory',fill:'Completa la frase',truefalse:'Vero o Falso'};
  const MOD_LABEL_MAP ={CE:'Computer Essentials',OE:'Online Essentials',MIX:'Mix moduli',WP:'Word Processor',SS:'Spreadsheets',PP:'Power Point'};
  const MODE_LABEL_MAP={ind:'Individuale',sq:'Squadre'};

  const csvCell=v=>{
    const s=String(v??'');
    return(s.includes(',')||s.includes('"')||s.includes('\n'))?`"${s.replace(/"/g,'""')}"`:s;
  };

  const dateStr=new Date().toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'});
  const filterDesc=(filterAct||filterMode)
    ?` — filtrato: ${filterAct?ACT_LABEL_MAP[filterAct]||filterAct:''}${filterAct&&filterMode?' · ':''}${filterMode?MODE_LABEL_MAP[filterMode]||filterMode:''}`
    :'';

  const lines=[
    `# PixelProf — Storico sessioni${csvCell(filterDesc)}`,
    `# Esportato il ${dateStr}`,
    ``,
    ['Data','Attività','Modulo','Modalità','Partecipante','Punteggio','Posizione'].map(csvCell).join(','),
  ];

  filtered.forEach(s=>{
    const dataFmt=s.timestamp
      ? new Date(s.timestamp).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
      : '—';
    const act  = ACT_LABEL_MAP [s.game]||s.game||'—';
    const mod  = MOD_LABEL_MAP [s.mod] ||s.mod ||'—';
    const mode = MODE_LABEL_MAP[s.mode]||s.mode||'—';

    // Ordina partecipanti per punteggio desc per calcolare posizione
    const sorted=[...(s.teams||[])].sort((a,b)=>(b.score||0)-(a.score||0));
    sorted.forEach((t,i)=>{
      lines.push([
        csvCell(dataFmt),
        csvCell(act),
        csvCell(mod),
        csvCell(mode),
        csvCell(t.name||'—'),
        t.score!=null?t.score:'—',
        i+1,
      ].join(','));
    });
  });

  const bom='\uFEFF';
  const csv=bom+lines.join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const safeDate=dateStr.replace(/\//g,'-');
  a.href=url;
  a.download=`storico_sessioni_${safeDate}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},200);
}

/* ==================================================
   COURSES SYSTEM
================================================== */
