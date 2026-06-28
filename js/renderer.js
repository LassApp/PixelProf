/* ==================================================
   renderer.js — PixelProf v5.0.0
   Renderer functions: buildResultHTML, buildPodiumHTML,
   renderLbResults, modBadgeHTML, resetLb.
   v5.0.0 N4: exportLbCSV — esporta classifica corrente.
================================================== */

function buildResultHTML(winner,top,tot,pct,elapsed,msg,rank,isSpeed,metrics){
  const stars=pct>=80?'⭐⭐⭐':pct>=60?'⭐⭐':'⭐';
  const time=`${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2,'0')}`;
  const scoreDisplay=`${top} pt`;
  const labelDisplay=isSpeed
    ?`${metrics?.correctCount??0} domande corrette · ×${speedPtsPerQ(sN>0?sN:tot)} pt/risposta`
    :`${pct}% accuratezza · ${metrics?.correctCount??0}/${tot} corrette`;

  // -- Pannello metriche dettagliato (solo Quiz normale, non Speed Quiz) --
  const metricsPanel=(!isSpeed && metrics)
    ?`<div style="
        background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
        border-radius:12px;padding:14px 16px;margin-bottom:16px;
      ">
        <div style="font-size:10px;font-weight:700;color:rgba(0,255,200,.6);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          Analisi sessione
          <span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(0,255,200,.2),transparent)"></span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(0,255,200,.05);border:1px solid rgba(0,255,200,.12);border-radius:9px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:var(--accent);font-family:'Share Tech Mono',monospace">${(Math.round(metrics.avgMs/100)/10).toFixed(1)}s</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">Tempo medio</div>
          </div>
          <div style="background:rgba(255,180,0,.05);border:1px solid rgba(255,180,0,.12);border-radius:9px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#ffb400;font-family:'Share Tech Mono',monospace">${metrics.bestStreak}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">Miglior streak</div>
          </div>
          <div style="background:rgba(0,207,255,.05);border:1px solid rgba(0,207,255,.12);border-radius:9px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#00cfff;font-family:'Share Tech Mono',monospace">+${metrics.totalSpeedBonus}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">Bonus velocità</div>
          </div>
          <div style="background:rgba(255,77,109,.05);border:1px solid rgba(255,77,109,.12);border-radius:9px;padding:10px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#ff6b85;font-family:'Share Tech Mono',monospace">+${metrics.totalStreakBonus}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px">Bonus streak</div>
          </div>
        </div>
      </div>`
    :'';

  return`<div class="result-wrap">
    <div class="result-hero">
      <span class="result-stars">${stars}</span>
      <span class="result-score">${scoreDisplay}</span>
      <span class="result-label">${labelDisplay}</span>
      <span class="result-time"><i class="ti ti-clock" style="font-size:11px"></i> ${time}</span>
    </div>
    ${buildPodiumHTML(rank)}
    ${metricsPanel}
    <p class="result-msg">${msg}</p>
    <div class="btn-row">
      <button class="btn" onclick="goHome()"><i class="ti ti-home"></i> Home</button>
      <button class="btn" onclick="restartActivity()"><i class="ti ti-refresh"></i> Ricomincia</button>
      <button class="btn btn-neon" onclick="goTab('lb')"><i class="ti ti-trophy"></i> Classifica</button>
    </div>
  </div>`;
}

function buildPodiumHTML(rank, scoreMap){
  // scoreMap: optional { playerName: pts }  falls back to qScores if not provided
  if(!rank||rank.length===0)return'';
  const getScore=(name)=>(scoreMap&&scoreMap[name]!=null?scoreMap[name]:qScores[name])||0;
  const top3=rank.slice(0,3);
  const medals=['🥇','🥈','🥉'];
  if(top3.length===1){
    const n=top3[0];const pts=getScore(n);
    return`<div class="podium-wrap"><div class="podium-title">Risultato finale</div><div style="text-align:center;padding:1rem"><div style="font-size:40px;margin-bottom:8px">🥇</div><div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px">${escHtml(n)}</div><div style="font-size:13px;color:rgba(255,255,255,.4);font-family:'Share Tech Mono',monospace">${pts} pt</div></div><div class="podium-floor"></div></div>`;
  }
  const order=top3.length>=3?[top3[1],top3[0],top3[2]]:top3.length===2?[top3[1],top3[0],null]:[top3[0],null,null];
  const orderPos=top3.length>=3?['p2','p1','p3']:top3.length===2?['p2','p1',null]:['p1',null,null];
  const orderMedals=top3.length>=3?[medals[1],medals[0],medals[2]]:top3.length===2?[medals[1],medals[0],null]:[medals[0],null,null];
  const cols=order.map((name,i)=>{
    if(!name)return`<div class="podium-col ${orderPos[i]||''}"></div>`;
    const pts=getScore(name);const pos=orderPos[i];
    return`<div class="podium-col ${pos}"><div class="podium-avatar">${orderMedals[i]}</div><div class="podium-name">${escHtml(name)}</div><div class="podium-pts">${pts} pt</div><div class="podium-base"><div class="podium-rank">${orderMedals[i]}</div></div></div>`;
  }).join('');
  return`<div class="podium-wrap"><div class="podium-title">Classifica finale — Top 3</div><div class="podium-stage">${cols}</div><div class="podium-floor"></div></div>`;
}

function renderLbResults(type,act){
  const bucket=db.lb2?.[type]?.[act]||{};
  const body=sh('lb-results-body');

  // Flatten all entries into a sortable list
  // Each row: { name, pts, mod, games, color }
  const rows=[];
  Object.entries(bucket).forEach(([name,data])=>{
    // Best entry across all modules
    const best=data.entries.reduce((a,b)=>b.pts>a.pts?b:a,{pts:-1,mod:'?',games:0});
    rows.push({name,pts:best.pts,mod:best.mod,games:best.games,color:data.color||null,allEntries:data.entries});
  });
  rows.sort((a,b)=>b.pts-a.pts);

  if(rows.length===0){
    body.innerHTML=`<div class="lb-empty"><div class="le-icon">${ACT_ICON[act]||'📋'}</div><div class="le-title">Nessun risultato ancora</div><div class="le-sub">Gioca una partita di ${ACT_LABEL[act]} per vedere la classifica</div></div>`;
    return;
  }

  const medals=['🥇','🥈','🥉'];
  const rankClass=['rank-1','rank-2','rank-3'];

  const tableHeader=`<div class="lb-table-header">
    <div class="lb-th pos"></div>
    <div class="lb-th name">Giocatore</div>
    <div class="lb-th mod">Modulo</div>
    <div class="lb-th pts">Punti</div>
  </div>`;

  const tableRows=rows.map((r,i)=>{
    const pos=i<3?medals[i]:String(i+1);
    const rCls=i<3?rankClass[i]:'';
    const modBadge=modBadgeHTML(r.mod);
    const colorDot=r.color?`<span class="color-dot" style="background:${escAttr(r.color)};box-shadow:0 0 5px ${escAttr(r.color)}"></span>`:'';
    const sub=`${r.games} ${r.games===1?'partita':'partite'}`;
    return`<div class="lb-entry ${rCls}">
      <div class="lb-td pos">${pos}</div>
      <div class="lb-td name">${colorDot}<div><div class="player-name">${escHtml(r.name)}</div><div class="player-sub">${sub}</div></div></div>
      <div class="lb-td mod">${modBadge}</div>
      <div class="lb-td pts">${r.pts}</div>
    </div>`;
  }).join('');

  // Bottone export CSV — contestuale alla vista corrente
  const typeLabel=type==='ind'?'Individuale':'Squadre';
  const actLabel=ACT_LABEL[act]||act;
  const exportBtn=`<div style="display:flex;justify-content:flex-end;margin-bottom:10px">
    <button onclick="exportLbCSV('${escAttr(type)}','${escAttr(act)}')"
      style="display:inline-flex;align-items:center;gap:6px;
        padding:5px 12px;border-radius:8px;
        background:rgba(0,255,200,.06);border:1px solid rgba(0,255,200,.2);
        color:rgba(0,255,200,.8);font-size:11px;font-family:'Share Tech Mono',monospace;
        cursor:pointer;transition:background .18s,border-color .18s;letter-spacing:.3px"
      onmouseover="this.style.background='rgba(0,255,200,.12)';this.style.borderColor='rgba(0,255,200,.4)'"
      onmouseout="this.style.background='rgba(0,255,200,.06)';this.style.borderColor='rgba(0,255,200,.2)'">
      <i class="ti ti-download" style="font-size:12px"></i> Esporta CSV
    </button>
  </div>`;

  body.innerHTML=exportBtn+tableHeader+tableRows;
}

/* ==================================================
   EXPORT CLASSIFICA CSV — v5.0.0 N4
   Esporta la vista corrente (tipo + attività) come
   file .csv scaricabile. Compatibile con Excel e
   Google Sheets. Separatore: virgola. Encoding: UTF-8
   con BOM per compatibilità Excel su Windows.
   Colonne: Posizione, Giocatore, Modulo migliore,
            Miglior punteggio, Partite giocate.
================================================== */
function exportLbCSV(type, act){
  const bucket=db.lb2?.[type]?.[act]||{};
  const MOD_LABEL_MAP={CE:'Computer Essentials',OE:'Online Essentials',WP:'Word Processing'};
  const ACT_LABEL_MAP={quiz:'Quiz',speed:'Speed Quiz',match:'Abbina',memory:'Memory',fill:'Completa la frase'};

  // Costruisce le righe ordinate per punteggio desc
  const rows=[];
  Object.entries(bucket).forEach(([name,data])=>{
    const best=data.entries.reduce((a,b)=>b.pts>a.pts?b:a,{pts:-1,mod:'?',games:0});
    rows.push({name,pts:best.pts,mod:best.mod,games:best.games});
  });
  rows.sort((a,b)=>b.pts-a.pts);

  if(!rows.length){
    ppAlert('Non ci sono punteggi da esportare per questa classifica.', { title:'Nessun dato da esportare', icon:'🏆' });
    return;
  }

  // Metadata intestazione
  const typeLabel=type==='ind'?'Individuale':'Squadre';
  const actLabel=ACT_LABEL_MAP[act]||act;
  const dateStr=new Date().toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'});

  // Escape CSV: racchiude in virgolette se contiene virgola, virgolette o newline
  const csvCell=v=>{
    const s=String(v??'');
    return(s.includes(',')||s.includes('"')||s.includes('\n'))?`"${s.replace(/"/g,'""')}"`:s;
  };

  const lines=[
    // Metadati (righe commento leggibili)
    `# PixelProf — Classifica ${csvCell(typeLabel)} · ${csvCell(actLabel)}`,
    `# Esportata il ${dateStr}`,
    ``,
    // Intestazione colonne
    ['Posizione','Giocatore','Modulo migliore','Miglior punteggio','Partite giocate'].map(csvCell).join(','),
    // Dati
    ...rows.map((r,i)=>[
      i+1,
      csvCell(r.name),
      csvCell(MOD_LABEL_MAP[r.mod]||r.mod||'—'),
      r.pts,
      r.games,
    ].join(','))
  ];

  // BOM UTF-8 per compatibilità Excel Windows + blob download
  const bom='\uFEFF';
  const csv=bom+lines.join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  // Nome file: classifica_Quiz_Individuale_07-06-2025.csv
  const safeDate=dateStr.replace(/\//g,'-');
  a.href=url;
  a.download=`classifica_${actLabel.replace(/\s+/g,'_')}_${typeLabel}_${safeDate}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},200);
}

function modBadgeHTML(mod){
  if(!mod||mod==='?')return'<span class="mod-badge mix">—</span>';
  const cls={CE:'ce',OE:'oe',WP:'wp'}[mod]||'mix';
  const short={CE:'Computer',OE:'Online',WP:'Word'}[mod]||mod;
  return`<span class="mod-badge ${cls}">${short}</span>`;
}

async function resetLb(){
  const ok = await ppConfirmBox(
    'Tutti i punteggi salvati in classifica (Individuale e Squadre, tutte le attività) verranno eliminati definitivamente.',
    { title:'Azzerare la classifica?', icon:'🏆', yesLabel:'Sì, azzera tutto', danger:true }
  );
  if(!ok) return;
  db.lb2=makeEmptyLb2();save();
  lbType=null;lbAct=null;lbShowStep('type');
}
