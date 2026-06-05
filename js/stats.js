/* ==================================================
   stats.js — PixelProf v4.0.7
   Stats screen: renderStats, resetStats.
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
   COURSES SYSTEM
================================================== */
