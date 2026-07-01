/* ==================================================
   dashboard.js — PixelProf v2.0.0
   "Panoramica Classe" — vista aggregata per il docente.

   Risponde a 3 domande che oggi richiedono di incrociare
   3 schermate diverse (Classifica + Progressi + Storico):
     1. Come sta andando la classe nel complesso?
     2. Su quale modulo conviene fare lezione di ripasso?
     3. Chi ha giocato e chi non si è ancora mai esercitato?

   v2.0.0 — FIX LIMITE CROSS-DEVICE (era il limite noto della v1):
   La v1 leggeva ESCLUSIVAMENTE db.sessions locale (storico per-
   dispositivo, max 100 voci) — su un'aula condivisa da più docenti
   o PC di laboratorio, la vista poteva non riflettere tutte le
   sessioni mai giocate.

   Ora renderDashboard() tenta PRIMA una lettura cloud via
   window.DB.getClassroomOverview() (RPC SECURITY DEFINER
   get_classroom_overview, vedi db_adapter.js), che aggrega
   stats_aggregate + matches + scores + players + teams per
   classroom_id — quindi è vera-aggregazione cross-device,
   cross-docente, indipendente da quale browser ha giocato cosa.

   Se la RPC non è disponibile (offline, oppure non ancora creata
   su Supabase) si ricade in automatico sul calcolo 100% locale
   già esistente in v1 — stesso identico comportamento di prima,
   zero regressioni. I builder HTML (_chdBuildWeakestCard,
   _chdBuildParticipationSection, _chdBuildActivityBreakdown) sono
   condivisi e invariati tra i due percorsi: ricevono sempre le
   stesse forme-dati intermedie, sia che la fonte sia il cloud sia
   che sia il locale.

   Depends on: game-engine-state.js (db, activeCourseId, sh, shq,
   escHtml, escAttr), window.DB (db_adapter.js, opzionale)
================================================== */

const _CHD_MOD_LABEL = { CE: 'Computer Essentials', OE: 'Online Essentials', WP: 'Word Processing' };
const _CHD_MOD_COLOR = { CE: '#00cfff', OE: '#7c6aff', WP: '#28a050' };
const _CHD_ACT_LABEL = { quiz: 'Quiz', speed: 'Speed Quiz', match: 'Abbina', memory: 'Memory', fill: 'Completa la frase' };
const _CHD_ACT_ICON  = { quiz: '🧠', speed: '⚡', match: '🔗', memory: '🃏', fill: '✏️' };

/** Percentuale di accuratezza, o null se non ci sono ancora dati. */
function _chdAccuracy(c, w) {
  const tot = (c || 0) + (w || 0);
  return tot > 0 ? Math.round((c / tot) * 100) : null;
}

/** Data relativa in italiano: Oggi / Ieri / N giorni fa / 12 giu. */
function _chdRelativeDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays <= 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return diffDays + ' giorni fa';
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  } catch { return '—'; }
}

/**
 * Mappa { nomePartecipante: { sessions, lastTs, totalScore, color, type } }
 * costruita scorrendo db.sessions una sola volta.
 * type: 'ind' | 'sq' — preso da s.mode, coerente per tutti i
 * partecipanti della stessa sessione.
 */
function _chdComputeParticipation() {
  const map = {};
  (db.sessions || []).forEach(s => {
    (s.teams || []).forEach(p => {
      if (!p || !p.name) return;
      if (!map[p.name]) map[p.name] = { sessions: 0, lastTs: null, totalScore: 0, color: p.color || null, type: s.mode };
      map[p.name].sessions++;
      map[p.name].totalScore += (p.score || 0);
      if (p.color) map[p.name].color = p.color;
      if (!map[p.name].lastTs || s.timestamp > map[p.name].lastTs) map[p.name].lastTs = s.timestamp;
    });
  });
  return map;
}

/**
 * renderDashboard — v2.0.0 orchestratore.
 * Mostra un breve "Caricamento…", poi tenta la lettura cloud
 * (cross-device) e ricade sul calcolo locale se non disponibile.
 */
async function renderDashboard() {
  const body = shq('dash-body');
  if (!body) return;

  body.innerHTML = `<div style="text-align:center;padding:2.5rem 1rem;color:rgba(255,255,255,.3);
    font-size:12px;font-family:'Share Tech Mono',monospace;letter-spacing:.5px">
    <i class="ti ti-loader-2" style="font-size:20px;animation:spin .8s linear infinite;display:block;margin-bottom:10px"></i>
    Caricamento panoramica…
  </div>`;

  let cloud = null;
  if (window.DB?.getClassroomOverview && activeCourseId) {
    cloud = await window.DB.getClassroomOverview(activeCourseId).catch(() => null);
  }

  if (cloud) {
    _renderDashboardFromCloud(cloud);
  } else {
    _renderDashboardFromLocal();
  }
}

/**
 * _renderDashboardFromCloud — v2.0.0
 * Sorgente: RPC get_classroom_overview — aggregazione VERA
 * cross-device/cross-docente su scores+matches+stats_aggregate+
 * players+teams per questa aula. Adatta il payload alle stesse
 * forme-dati intermedie usate dal percorso locale, poi richiama
 * gli STESSI builder HTML — zero duplicazione di markup.
 */
function _renderDashboardFromCloud(cloud) {
  const body = shq('dash-body');
  if (!body) return;

  const stats = cloud.stats || { tot: 0, cor: 0, byMod: {} };
  const totalSessions = cloud.totalSessions || 0;

  if (totalSessions === 0 && stats.tot === 0) {
    body.innerHTML = _chdEmptyState();
    return;
  }

  const totalPlayers  = cloud.totalPlayers  || 0;
  const activePlayers = cloud.activePlayers || 0;
  const participation = cloud.participation || [];
  const neverPlayed    = cloud.neverPlayedNames || [];

  const quizAcc = _chdAccuracy(stats.cor, stats.tot);
  const lastActivityLabel = cloud.lastSessionAt ? _chdRelativeDate(cloud.lastSessionAt) : 'nessuna sessione';

  let kpi2Val, kpi2Lbl;
  if (totalPlayers > 0) {
    kpi2Val = `${activePlayers}/${totalPlayers}`;
    kpi2Lbl = 'Giocatori attivi';
  } else {
    kpi2Val = String(participation.length);
    kpi2Lbl = 'Partecipanti unici';
  }

  const modAccs = ['CE', 'OE', 'WP'].map(k => {
    const m = stats.byMod?.[k] || { c: 0, w: 0 };
    return { key: k, label: _CHD_MOD_LABEL[k], color: _CHD_MOD_COLOR[k], acc: _chdAccuracy(m.c, m.w), tot: m.c + m.w };
  });
  const modsWithData = modAccs.filter(m => m.tot > 0);
  const weakest = modsWithData.length ? modsWithData.reduce((a, b) => (b.acc < a.acc ? b : a)) : null;

  // participant_type cloud: 'player'|'team' → stessa convenzione 'ind'|'sq' usata dal builder
  const partRows = participation
    .map(p => ({
      name: p.name,
      type: p.type === 'team' ? 'sq' : 'ind',
      color: p.color,
      sessions: p.sessions || 0,
      totalScore: p.totalScore || 0,
      lastTs: p.lastPlayedAt,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  const actCounts = cloud.activityCounts || {};
  const actRows = Object.entries(actCounts).sort((a, b) => b[1] - a[1]);
  const maxActCount = actRows.length ? actRows[0][1] : 0;

  body.innerHTML = `
    <div class="chd-kpi-grid">
      <div class="chd-kpi-card">
        <div class="chd-kpi-icon">🎯</div>
        <div class="chd-kpi-val">${quizAcc != null ? quizAcc + '%' : '—'}</div>
        <div class="chd-kpi-lbl">Accuratezza Quiz</div>
      </div>
      <div class="chd-kpi-card">
        <div class="chd-kpi-icon">👥</div>
        <div class="chd-kpi-val">${kpi2Val}</div>
        <div class="chd-kpi-lbl">${kpi2Lbl}</div>
      </div>
      <div class="chd-kpi-card">
        <div class="chd-kpi-icon">🎮</div>
        <div class="chd-kpi-val">${totalSessions}</div>
        <div class="chd-kpi-lbl">Sessioni · ${escHtml(lastActivityLabel)}</div>
      </div>
    </div>

    ${_chdBuildWeakestCard(weakest, modAccs)}
    ${_chdBuildParticipationSection(partRows, neverPlayed)}
    ${_chdBuildActivityBreakdown(actRows, maxActCount)}
    ${_chdBuildWrongQ()}

    <div class="chd-footnote">
      <i class="ti ti-cloud-check"></i>
      Dati aggregati su tutti i dispositivi e docenti di questa aula.
    </div>
  `;
}

/**
 * _renderDashboardFromLocal — v1.0.0 (invariata, ora usata solo come
 * fallback quando il cloud non è disponibile — offline, o RPC non
 * ancora creata su Supabase). FONTE: db.stats / db.sessions /
 * db.players / db.teams, già caricati localmente per l'aula attiva.
 */
function _renderDashboardFromLocal() {
  const body = shq('dash-body');
  if (!body) return;

  const stats = db.stats || { tot: 0, cor: 0, byMod: {} };
  const sessions = db.sessions || [];
  const totalSessions = sessions.length;

  // ── Se non c'è proprio nessun dato, mostra solo l'empty state ──
  if (totalSessions === 0 && stats.tot === 0) {
    body.innerHTML = _chdEmptyState();
    return;
  }

  // ── 1. PARTECIPAZIONE (calcolata una volta, riusata da KPI + tabella) ──
  const participationMap = _chdComputeParticipation();
  const indSessionNames = new Set();
  sessions.forEach(s => { if (s.mode === 'ind') (s.teams || []).forEach(p => p?.name && indSessionNames.add(p.name)); });
  const totalPlayers = (db.players || []).length;
  const activePlayers = (db.players || []).filter(p => indSessionNames.has(p)).length;
  const neverPlayed = (db.players || []).filter(p => !indSessionNames.has(p));

  // ── 2. KPI HERO ──
  const quizAcc = _chdAccuracy(stats.cor, stats.tot);
  const lastSession = sessions[sessions.length - 1];
  const lastActivityLabel = lastSession ? _chdRelativeDate(lastSession.timestamp) : 'nessuna sessione';

  let kpi2Val, kpi2Lbl;
  if (totalPlayers > 0) {
    kpi2Val = `${activePlayers}/${totalPlayers}`;
    kpi2Lbl = 'Giocatori attivi';
  } else {
    kpi2Val = String(Object.keys(participationMap).length);
    kpi2Lbl = 'Partecipanti unici';
  }

  // ── 3. MODULO PIÙ DEBOLE ──
  const modAccs = ['CE', 'OE', 'WP'].map(k => {
    const m = stats.byMod?.[k] || { c: 0, w: 0 };
    return { key: k, label: _CHD_MOD_LABEL[k], color: _CHD_MOD_COLOR[k], acc: _chdAccuracy(m.c, m.w), tot: m.c + m.w };
  });
  const modsWithData = modAccs.filter(m => m.tot > 0);
  const weakest = modsWithData.length ? modsWithData.reduce((a, b) => (b.acc < a.acc ? b : a)) : null;

  // ── 4. TABELLA PARTECIPAZIONE ──
  const partRows = Object.entries(participationMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.sessions - a.sessions);

  // ── 5. ATTIVITÀ PIÙ GIOCATE ──
  const actCounts = {};
  sessions.forEach(s => { actCounts[s.game] = (actCounts[s.game] || 0) + 1; });
  const actRows = Object.entries(actCounts).sort((a, b) => b[1] - a[1]);
  const maxActCount = actRows.length ? actRows[0][1] : 0;

  body.innerHTML = `
    <div class="chd-kpi-grid">
      <div class="chd-kpi-card">
        <div class="chd-kpi-icon">🎯</div>
        <div class="chd-kpi-val">${quizAcc != null ? quizAcc + '%' : '—'}</div>
        <div class="chd-kpi-lbl">Accuratezza Quiz</div>
      </div>
      <div class="chd-kpi-card">
        <div class="chd-kpi-icon">👥</div>
        <div class="chd-kpi-val">${kpi2Val}</div>
        <div class="chd-kpi-lbl">${kpi2Lbl}</div>
      </div>
      <div class="chd-kpi-card">
        <div class="chd-kpi-icon">🎮</div>
        <div class="chd-kpi-val">${totalSessions}</div>
        <div class="chd-kpi-lbl">Sessioni · ${escHtml(lastActivityLabel)}</div>
      </div>
    </div>

    ${_chdBuildWeakestCard(weakest, modAccs)}
    ${_chdBuildParticipationSection(partRows, neverPlayed)}
    ${_chdBuildActivityBreakdown(actRows, maxActCount)}
    ${_chdBuildWrongQ()}

    <div class="chd-footnote">
      <i class="ti ti-device-desktop"></i>
      Modalità offline: dati limitati alle ultime ${Math.min(totalSessions, 100)} sessioni salvate su questo dispositivo per questa aula.
    </div>
  `;
}

function _chdEmptyState() {
  return `<div class="chd-empty">
    <div class="chd-empty-icon">🔭</div>
    <div class="chd-empty-title">Nessun dato ancora</div>
    <div class="chd-empty-sub">Gioca almeno una sessione in questa aula per vedere la panoramica della classe qui.</div>
  </div>`;
}

function _chdBuildWeakestCard(weakest, modAccs) {
  const bars = modAccs.map(m => {
    const noData = m.tot === 0;
    const pct = noData ? 0 : m.acc;
    return `<div class="chd-mod-row${noData ? ' chd-mod-nodata' : ''}">
      <div class="chd-mod-row-top">
        <span class="chd-mod-dot" style="background:${m.color}"></span>
        <span class="chd-mod-name">${escHtml(m.label)}</span>
        <span class="chd-mod-pct" style="color:${m.color}">${noData ? '—' : pct + '%'}</span>
      </div>
      <div class="prog-bar" style="margin:0"><div class="prog-fill" style="width:${pct}%;background:${m.color}"></div></div>
    </div>`;
  }).join('');

  const headline = weakest
    ? `<span style="color:${weakest.color}">${escHtml(weakest.label)}</span> è il modulo da rafforzare nella prossima lezione`
    : `Servono più sessioni di Quiz/Speed Quiz per individuare il modulo più debole`;

  return `<div class="chd-section">
    <div class="chd-section-title">⚠️ Modulo più debole</div>
    <div class="chd-weak-card">
      <div class="chd-weak-headline">${headline}</div>
      ${bars}
    </div>
  </div>`;
}

function _chdBuildParticipationSection(rows, neverPlayed) {
  if (!rows.length && !neverPlayed.length) return '';

  const rowsHtml = rows.map(r => {
    const typeIcon = r.type === 'sq' ? '👥' : '👤';
    const colorDot = r.color
      ? `<span class="chd-color-dot" style="background:${escAttr(r.color)};box-shadow:0 0 5px ${escAttr(r.color)}"></span>`
      : '';
    const avg = r.sessions > 0 ? Math.round(r.totalScore / r.sessions) : 0;
    return `<div class="chd-part-row">
      <div class="chd-part-name"><span class="chd-type-icon">${typeIcon}</span>${colorDot}${escHtml(r.name)}</div>
      <div class="chd-part-sessions">${r.sessions}</div>
      <div class="chd-part-avg">${avg} pt</div>
      <div class="chd-part-last">${escHtml(_chdRelativeDate(r.lastTs))}</div>
    </div>`;
  }).join('');

  const table = rows.length ? `<div class="chd-part-table">
      <div class="chd-part-row chd-part-header">
        <div class="chd-part-name">Nome</div>
        <div class="chd-part-sessions">Sessioni</div>
        <div class="chd-part-avg">Media</div>
        <div class="chd-part-last">Ultima</div>
      </div>
      ${rowsHtml}
    </div>` : '';

  const neverHtml = neverPlayed.length ? `<div class="chd-never-played">
      <i class="ti ti-alert-triangle"></i>
      <span>${neverPlayed.length} giocator${neverPlayed.length === 1 ? 'e' : 'i'} non ha${neverPlayed.length === 1 ? '' : 'nno'} ancora mai giocato: ${neverPlayed.map(n => escHtml(n)).join(', ')}</span>
    </div>` : '';

  return `<div class="chd-section">
    <div class="chd-section-title">👥 Partecipazione</div>
    ${table}
    ${neverHtml}
  </div>`;
}

function _chdBuildActivityBreakdown(actRows, maxCount) {
  if (!actRows.length) return '';
  const rows = actRows.map(([act, count]) => {
    const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
    return `<div class="chd-act-row">
      <span class="chd-act-icon">${_CHD_ACT_ICON[act] || '🎮'}</span>
      <span class="chd-act-name">${escHtml(_CHD_ACT_LABEL[act] || act)}</span>
      <div class="chd-act-bar-wrap"><div class="chd-act-bar" style="width:${pct}%"></div></div>
      <span class="chd-act-count">${count}</span>
    </div>`;
  }).join('');

  return `<div class="chd-section">
    <div class="chd-section-title">🎮 Attività più giocate</div>
    <div class="chd-act-list">${rows}</div>
  </div>`;
}

/* ==================================================
   DOMANDE DIFFICILI — v6.2.0
   Legge db.wrongQ (campo locale per-aula) e costruisce
   la sezione "Domande difficili" nella dashboard.
   Ordina per tasso di errore (wrong / (wrong+right))
   e mostra le top-10 più problematiche.
   Un badge "recuperata ✓" appare se right > 0.
   Bottone "Azzera" cancella db.wrongQ e aggiorna la vista.
================================================== */

/**
 * Costruisce l'HTML della sezione "Domande difficili".
 * Non richiede parametri — legge direttamente db.wrongQ.
 */
function _chdBuildWrongQ() {
  const wq = db.wrongQ || {};
  const entries = Object.values(wq);

  if (!entries.length) return '';

  // Ordina per numero di errori desc, poi per tasso di errore desc
  const sorted = [...entries].sort((a, b) => {
    const rateA = a.wrong / Math.max(a.wrong + a.right, 1);
    const rateB = b.wrong / Math.max(b.wrong + b.right, 1);
    if (rateB !== rateA) return rateB - rateA;
    return b.wrong - a.wrong;
  }).slice(0, 10);

  const MOD_COLOR = { CE: '#00cfff', OE: '#7c6aff', WP: '#28a050' };
  const ACT_ICON  = { quiz: '🧠', speed: '⚡', fill: '✏️' };

  const rows = sorted.map(e => {
    const total = e.wrong + e.right;
    const errPct = Math.round((e.wrong / Math.max(total, 1)) * 100);
    const recovered = e.right > 0;
    const modCol = MOD_COLOR[e.mod] || 'rgba(255,255,255,.4)';
    const actIcon = ACT_ICON[e.act] || '🎮';

    return `<div class="chd-wq-row${recovered ? ' chd-wq-recovered' : ''}">
      <div class="chd-wq-header">
        <span class="chd-wq-act-icon">${actIcon}</span>
        <span class="chd-wq-mod" style="color:${modCol}">${escHtml(e.mod || '—')}</span>
        ${recovered ? '<span class="chd-wq-badge-ok">recuperata ✓</span>' : ''}
        <span class="chd-wq-errs">${e.wrong} ${e.wrong === 1 ? 'errore' : 'errori'}</span>
      </div>
      <div class="chd-wq-question">${escHtml(e.q || '—')}</div>
      <div class="chd-wq-answer">Risposta corretta: <strong>${escHtml(e.answer || '—')}</strong></div>
      <div class="chd-wq-bar-wrap">
        <div class="chd-wq-bar" style="width:${errPct}%"></div>
      </div>
    </div>`;
  }).join('');

  const total = entries.length;
  const recoveredCount = entries.filter(e => e.right > 0).length;

  return `<div class="chd-section">
    <div class="chd-section-title" style="justify-content:space-between">
      <span>❓ Domande difficili</span>
      <button onclick="resetWrongQ()" class="chd-wq-reset-btn" title="Azzera storico domande sbagliate">
        <i class="ti ti-trash"></i> Azzera
      </button>
    </div>
    <div class="chd-wq-summary">
      <span>${total} domand${total === 1 ? 'a' : 'e'} problematic${total === 1 ? 'a' : 'he'}</span>
      ${recoveredCount > 0 ? `<span class="chd-wq-summary-ok">${recoveredCount} recuperat${recoveredCount === 1 ? 'a' : 'e'} ✓</span>` : ''}
    </div>
    <div class="chd-wq-list">${rows}</div>
    ${total > 10 ? `<div class="chd-wq-more">+${total - 10} altre domande non mostrate</div>` : ''}
  </div>`;
}

/**
 * Azzera db.wrongQ e aggiorna la dashboard.
 * Esposta globalmente (chiamata da onclick inline).
 */
function resetWrongQ() {
  if (!confirm('Azzerare lo storico delle domande sbagliate?')) return;
  db.wrongQ = {};
  save();
  renderDashboard();
}
