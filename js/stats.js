/* ==================================================
   stats.js — PixelProf v5.0.0
   Stats screen: renderStats, resetStats.
   Storico sessioni: renderHistory, resetHistory.
   Depends on: game-engine-state.js (db global)
================================================== */

/* ==================================================
   STATS
================================================== */
function renderStats(){
  sh('st-tot').textContent=db.stats.tot;sh('st-cor').textContent=db.stats.cor;
  sh('st-pct').textContent=db.stats.tot>0?Math.round(db.stats.cor/db.stats.tot*100)+'%':'0%';
  sh('st-mods').innerHTML=Object.entries({CE:'Computer Essentials',OE:'Online Essentials',WP:'Word Processing'}).map(([k,n])=>{
    const m=db.stats.byMod[k]||{c:0,w:0};const tot=m.c+m.w;const pct=tot>0?Math.round(m.c/tot*100):0;
    return`<div class="mod-stat"><div class="mod-stat-row"><span>${n}</span><span style="font-family:'Share Tech Mono',monospace;color:#00ffc8">${m.c}/${tot} · ${pct}%</span></div><div class="prog-bar" style="margin:0"><div class="prog-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
}

function resetStats(){
  if(!confirm('Azzerare tutti i progressi?'))return;
  db.stats={tot:0,cor:0,byMod:{CE:{c:0,w:0},OE:{c:0,w:0}}};
  save();
  renderStats();
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
const _HIST_ACT_ICON ={quiz:'🧠',speed:'⚡',match:'🔗',memory:'🃏',fill:'✏️'};
const _HIST_ACT_LABEL={quiz:'Quiz',speed:'Speed Quiz',match:'Abbina',memory:'Memory',fill:'Completa'};
const _HIST_MOD_LABEL={CE:'Computer Essentials',OE:'Online Essentials',MIX:'Mix moduli',WP:'Word Processing'};
const _HIST_MOD_COLOR={CE:'#00cfff',OE:'#7c6aff',MIX:'#00ffc8',WP:'#28a050'};

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
  const modLabel=_HIST_MOD_LABEL[s.mod] ||s.mod||'—';
  const modColor=_HIST_MOD_COLOR[s.mod] ||'rgba(255,255,255,.3)';
  const modeLabel=s.mode==='sq'?'Squadre':'Individuale';
  const modeIcon =s.mode==='sq'?'👥':'👤';

  // Ordina teams per punteggio desc
  const sorted=[...(s.teams||[])].sort((a,b)=>(b.score||0)-(a.score||0));
  const medals=['🥇','🥈','🥉'];

  const teamsHTML=sorted.map((t,i)=>{
    const medal=i<3?medals[i]:'';
    const colorDot=t.color
      ?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${escAttr(t.color)};box-shadow:0 0 5px ${escAttr(t.color)};flex-shrink:0;margin-right:5px"></span>`
      :'';
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);">
      <div style="display:flex;align-items:center;gap:2px;min-width:0">
        <span style="font-size:12px;width:18px;flex-shrink:0">${medal}</span>
        ${colorDot}
        <span style="font-size:12px;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(t.name||'—')}</span>
      </div>
      <span style="font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:700;color:#00ffc8;flex-shrink:0;margin-left:8px">${t.score!=null?t.score+' pt':'—'}</span>
    </div>`;
  }).join('');

  return`<div style="
    background:rgba(255,255,255,.03);
    border:1px solid rgba(255,255,255,.08);
    border-radius:12px;
    padding:14px 16px;
    margin-bottom:10px;
    transition:border-color .18s,background .18s;
    position:relative;overflow:hidden;
  " onmouseenter="this.style.borderColor='rgba(0,255,200,.2)';this.style.background='rgba(0,255,200,.03)'"
     onmouseleave="this.style.borderColor='rgba(255,255,255,.08)';this.style.background='rgba(255,255,255,.03)'">

    <!-- Accent bar top -->
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${modColor};opacity:.5;border-radius:12px 12px 0 0"></div>

    <!-- Header riga: icona attività + label + badge modulo + data -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:20px;line-height:1">${actIcon}</span>
      <span style="font-size:13px;font-weight:700;color:#fff">${escHtml(actLabel)}</span>
      <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
        padding:2px 7px;border-radius:20px;
        background:${modColor}18;border:1px solid ${modColor}40;color:${modColor};
        font-family:'Share Tech Mono',monospace">${escHtml(modLabel)}</span>
      <span style="font-size:9px;color:rgba(255,255,255,.3);font-family:'Share Tech Mono',monospace;
        padding:2px 7px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)">
        ${modeIcon} ${escHtml(modeLabel)}
      </span>
      <span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,.3);font-family:'Share Tech Mono',monospace;white-space:nowrap">
        <i class="ti ti-clock" style="font-size:9px"></i> ${_histFormatDate(s.timestamp)}
      </span>
    </div>

    <!-- Partecipanti + punteggi -->
    <div style="padding:0 2px">${teamsHTML||'<div style="font-size:11px;color:rgba(255,255,255,.25)">Nessun partecipante registrato</div>'}</div>
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

  // Contatore sessioni visibili
  const counter=`<div style="font-size:10px;color:rgba(255,255,255,.3);font-family:'Share Tech Mono',monospace;
    margin-bottom:12px;display:flex;align-items:center;gap:6px">
    <span>${filtered.length} sessione${filtered.length!==1?'i':''} ${filterAct||filterMode?'filtrate':'totali'}</span>
    <span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.08),transparent)"></span>
  </div>`;

  body.innerHTML=counter+filtered.map((s,i)=>_histBuildCard(s,i)).join('');
}

function resetHistory(){
  if(!confirm('Cancellare tutto lo storico sessioni?'))return;
  db.sessions=[];
  save();
  renderHistory();
}

/* ==================================================
   COURSES SYSTEM
================================================== */

