/* ==================================================
   badges.js — PixelProf v1.0.0
   Sistema Traguardi (badge/achievement) per aula.

   Fonte dati: db.sessions (storico partite), db.stats
   (accuratezza aggregata), db.wrongQ (domande difficili/
   recuperate) — tutti già esistenti. Alcuni campi aggiuntivi
   opzionali (bestStreak, maxCombo, perfectRun) vengono ora
   scritti dentro ogni voce di db.sessions da saveSessionResult()
   quando disponibili (vedi game-engine-state.js, game-quiz.js,
   game-fill.js, game-match.js) — additivi e retrocompatibili:
   le sessioni salvate prima di questa versione semplicemente
   non hanno questi campi e vengono trattate come "nessun dato".

   Persistenza sblocchi: db.badges.unlocked = { badgeId: isoTs }
   (schema inizializzato in makeEmptyDb()/migrateDb()).

   Punto di ingresso principale:
     checkAndShowNewBadges()  chiamata da saveSessionResult()
                               dopo ogni sessione salvata — verifica
                               nuovi sblocchi, salva, mostra popup+
                               confetti+suono in coda (se >1 badge
                               sbloccati nella stessa sessione).
     renderBadges()           popola #badges-body (tab Traguardi)
     resetBadges()            azzera db.badges (dialog tematizzato)

   Depends on: game-engine-state.js (db, save, shq, escHtml,
   ppConfirmBox, launchConfetti), audio-manager.js (opzionale,
   guardia difensiva tramite typeof).
================================================== */

/* ==================================================
   CATALOGO BADGE
   Ogni definizione espone calc(ctx) → {unlocked, label, pct}
   - unlocked: bool, condizione di sblocco
   - label:    testo umano dello stato attuale (progresso o esito)
   - pct:      0-100, per la barra di progresso quando bloccato
================================================== */
const BADGE_DEFS = [
  {
    id: 'first_game', icon: '🎮', title: 'Si comincia!',
    desc: 'Completa la tua prima sessione in questa aula.',
    calc(ctx) {
      const n = ctx.sessions.length;
      return { unlocked: n >= 1, label: n >= 1 ? 'Completato' : 'Nessuna sessione ancora', pct: Math.min(n, 1) * 100 };
    }
  },
  {
    id: 'explorer', icon: '🗺️', title: 'Esploratore',
    desc: 'Prova tutti e 5 i minigiochi almeno una volta: Quiz, Speed Quiz, Abbina, Memory, Completa la frase.',
    calc(ctx) {
      const n = ctx.distinctGames.size;
      return { unlocked: n >= 5, label: n + ' / 5 minigiochi provati', pct: Math.min(n / 5, 1) * 100 };
    }
  },
  {
    id: 'polyglot', icon: '🌍', title: 'Tuttologo',
    desc: 'Gioca almeno una volta in ciascuno dei 3 moduli: Computer Essentials, Online Essentials, Word Processing.',
    calc(ctx) {
      const n = ctx.distinctMods.size;
      return { unlocked: n >= 3, label: n + ' / 3 moduli provati', pct: Math.min(n / 3, 1) * 100 };
    }
  },
  {
    id: 'marathon_25', icon: '🏃', title: 'Maratoneta',
    desc: 'Completa 25 sessioni di gioco in questa aula.',
    calc(ctx) {
      const n = ctx.sessions.length;
      return { unlocked: n >= 25, label: Math.min(n, 25) + ' / 25 sessioni', pct: Math.min(n / 25, 1) * 100 };
    }
  },
  {
    id: 'marathon_100', icon: '💯', title: 'Veterano',
    desc: 'Completa 100 sessioni di gioco in questa aula.',
    calc(ctx) {
      const n = ctx.sessions.length;
      return { unlocked: n >= 100, label: Math.min(n, 100) + ' / 100 sessioni', pct: Math.min(n / 100, 1) * 100 };
    }
  },
  {
    id: 'sharpshooter', icon: '🎯', title: 'Cecchino',
    desc: 'Raggiungi almeno il 90% di accuratezza su un minimo di 50 domande (Quiz/Speed Quiz).',
    calc(ctx) {
      const { tot, cor } = ctx.stats;
      if (tot < 50) return { unlocked: false, label: tot + ' / 50 domande risposte', pct: Math.min(tot / 50, 1) * 100 };
      const pctAcc = Math.round(cor / tot * 100);
      return { unlocked: pctAcc >= 90, label: pctAcc + '% di accuratezza (min. 90%)', pct: Math.min(pctAcc / 90, 1) * 100 };
    }
  },
  {
    id: 'encyclopedic', icon: '🧠', title: 'Mente Enciclopedica',
    desc: 'Raggiungi almeno il 95% di accuratezza su un minimo di 150 domande (Quiz/Speed Quiz).',
    calc(ctx) {
      const { tot, cor } = ctx.stats;
      if (tot < 150) return { unlocked: false, label: tot + ' / 150 domande risposte', pct: Math.min(tot / 150, 1) * 100 };
      const pctAcc = Math.round(cor / tot * 100);
      return { unlocked: pctAcc >= 95, label: pctAcc + '% di accuratezza (min. 95%)', pct: Math.min(pctAcc / 95, 1) * 100 };
    }
  },
  {
    id: 'legendary_streak', icon: '🔥', title: 'Streak Leggendaria',
    desc: 'Rispondi correttamente a 10 domande di fila in un Quiz o in Completa la frase.',
    calc(ctx) {
      const n = ctx.bestStreakEver;
      return { unlocked: n >= 10, label: n > 0 ? ('Streak record: ' + n) : 'Nessuna streak registrata', pct: Math.min(n / 10, 1) * 100 };
    }
  },
  {
    id: 'perfect_combo', icon: '⚡', title: 'Combo Perfetta',
    desc: 'Raggiungi la combo massima ×5 in Abbina.',
    calc(ctx) {
      const n = ctx.maxComboEver;
      return { unlocked: n >= 5, label: n > 1 ? ('Combo record: ×' + n) : 'Nessuna combo registrata', pct: Math.min(n / 5, 1) * 100 };
    }
  },
  {
    id: 'perfect_quiz', icon: '🌟', title: 'Quiz Perfetto',
    desc: 'Completa un Quiz o un Completa la frase di almeno 5 domande senza sbagliarne nemmeno una.',
    calc(ctx) {
      const has = ctx.sessions.some(s => (s.game === 'quiz' || s.game === 'fill') && s.perfectRun === true);
      return { unlocked: has, label: has ? 'Raggiunto' : 'Non ancora raggiunto', pct: has ? 100 : 0 };
    }
  },
  {
    id: 'comeback', icon: '🔁', title: 'Rimonta',
    desc: 'Recupera almeno 10 domande che avevi sbagliato in passato.',
    calc(ctx) {
      const n = ctx.wqRecovered;
      return { unlocked: n >= 10, label: n + ' / 10 domande recuperate', pct: Math.min(n / 10, 1) * 100 };
    }
  },
  {
    id: 'no_secrets', icon: '🕵️', title: 'Nessun Segreto',
    desc: 'Azzera la lista delle domande "problematiche" (dopo averne tracciate almeno 10).',
    calc(ctx) {
      if (ctx.wqTotal < 10) return { unlocked: false, label: ctx.wqTotal + ' / 10 domande tracciate', pct: Math.min(ctx.wqTotal / 10, 1) * 100 };
      const label = ctx.wqAllRecovered ? 'Tutte recuperate!' : (ctx.wqRecovered + ' / ' + ctx.wqTotal + ' recuperate');
      return { unlocked: ctx.wqAllRecovered, label, pct: Math.min(ctx.wqRecovered / Math.max(ctx.wqTotal, 1), 1) * 100 };
    }
  },
  {
    id: 'team_spirit', icon: '👥', title: 'Spirito di Squadra',
    desc: 'Gioca almeno 10 sessioni in modalità Squadre.',
    calc(ctx) {
      const n = ctx.sqSessions;
      return { unlocked: n >= 10, label: n + ' / 10 sessioni a squadre', pct: Math.min(n / 10, 1) * 100 };
    }
  },
];

/* ==================================================
   CONTESTO DI CALCOLO
   Costruito una volta per render/check, riusato da tutti i badge.
================================================== */
function _bdgBuildContext() {
  const sessions = db.sessions || [];
  const stats = db.stats || { tot: 0, cor: 0, byMod: {} };
  const wrongQ = db.wrongQ || {};
  const distinctGames = new Set(sessions.map(s => s.game).filter(Boolean));
  const distinctMods = new Set(sessions.map(s => s.mod).filter(m => m === 'CE' || m === 'OE' || m === 'WP'));
  const sqSessions = sessions.filter(s => s.mode === 'sq').length;
  const bestStreakEver = sessions.reduce((mx, s) => Math.max(mx, s.bestStreak || 0), 0);
  const maxComboEver = sessions.reduce((mx, s) => Math.max(mx, s.maxCombo || 0), 0);
  const wqEntries = Object.values(wrongQ);
  const wqRecovered = wqEntries.filter(e => e.right > 0).length;
  const wqTotal = wqEntries.length;
  const wqAllRecovered = wqTotal > 0 && wqEntries.every(e => e.right > 0);
  return { sessions, stats, wrongQ, distinctGames, distinctMods, sqSessions, bestStreakEver, maxComboEver, wqRecovered, wqTotal, wqAllRecovered };
}

/* ==================================================
   SBLOCCO — chiamata da saveSessionResult() dopo ogni sessione
================================================== */
function checkAndShowNewBadges() {
  if (!db) return;
  if (!db.badges) db.badges = { unlocked: {} };
  if (!db.badges.unlocked) db.badges.unlocked = {};
  const ctx = _bdgBuildContext();
  const newly = [];
  BADGE_DEFS.forEach(def => {
    if (db.badges.unlocked[def.id]) return; // già sbloccato
    const r = def.calc(ctx);
    if (r.unlocked) {
      db.badges.unlocked[def.id] = new Date().toISOString();
      newly.push(def);
    }
  });
  if (newly.length) {
    save();
    _bdgQueueToasts(newly);
  }
}

/* ==================================================
   POPUP DI SBLOCCO — coda sequenziale (se più badge insieme)
================================================== */
let _bdgToastQueue = [];
let _bdgToastBusy = false;

function _bdgQueueToasts(defs) {
  _bdgToastQueue.push(...defs);
  if (!_bdgToastBusy) _bdgShowNextToast();
}

function _bdgShowNextToast() {
  if (!_bdgToastQueue.length) { _bdgToastBusy = false; return; }
  _bdgToastBusy = true;
  const def = _bdgToastQueue.shift();
  const el = shq('badge-unlock-popup');
  if (!el) { setTimeout(_bdgShowNextToast, 10); return; }
  const iconEl = shq('bup-icon'), titleEl = shq('bup-title'), descEl = shq('bup-desc');
  if (iconEl) iconEl.textContent = def.icon;
  if (titleEl) titleEl.textContent = def.title;
  if (descEl) descEl.textContent = def.desc;
  if (typeof AudioManager !== 'undefined') AudioManager.play('badge');
  if (typeof launchConfetti === 'function') launchConfetti();
  el.classList.remove('hidden');
  requestAnimationFrame(() => { el.classList.add('bup-show'); });
  setTimeout(() => {
    el.classList.remove('bup-show');
    setTimeout(() => { el.classList.add('hidden'); _bdgShowNextToast(); }, 420);
  }, 3200);
}

/* ==================================================
   RENDER — scheda Traguardi (#tab-badges > #badges-body)
================================================== */
function renderBadges() {
  const body = shq('badges-body');
  if (!body) return;
  const ctx = _bdgBuildContext();
  const unlockedMap = (db.badges && db.badges.unlocked) || {};

  const results = BADGE_DEFS.map(def => {
    const r = def.calc(ctx);
    const isUnlocked = !!unlockedMap[def.id];
    return { def, r, isUnlocked, unlockedAt: unlockedMap[def.id] || null };
  });

  const unlockedCount = results.filter(x => x.isUnlocked).length;
  const totalCount = BADGE_DEFS.length;
  const summaryPct = totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0;

  // Sbloccati prima (più recenti in cima), poi bloccati per % di completamento decrescente
  results.sort((a, b) => {
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
    if (a.isUnlocked && b.isUnlocked) return (b.unlockedAt || '').localeCompare(a.unlockedAt || '');
    return (b.r.pct || 0) - (a.r.pct || 0);
  });

  if (!ctx.sessions.length) {
    body.innerHTML = `<div class="chd-empty">
      <div class="chd-empty-icon">🏆</div>
      <div class="chd-empty-title">Nessun traguardo ancora</div>
      <div class="chd-empty-sub">Gioca la tua prima sessione in questa aula per iniziare a sbloccare i badge.</div>
    </div>`;
    return;
  }

  const summary = `<div class="bdg-summary">
    <div class="bdg-summary-icon">🏆</div>
    <div class="bdg-summary-text">
      <div class="bdg-summary-count"><strong>${unlockedCount}</strong> / ${totalCount} traguardi sbloccati</div>
      <div class="prog-bar"><div class="prog-fill" style="width:${summaryPct}%;background:linear-gradient(90deg,#ffd700,#ffb400)"></div></div>
    </div>
  </div>`;

  const cards = results.map(({ def, r, isUnlocked, unlockedAt }) => {
    const dateLabel = unlockedAt ? _bdgFormatDate(unlockedAt) : '';
    const progressHtml = isUnlocked
      ? `<div class="bdg-unlock-date"><i class="ti ti-check"></i> Sbloccato ${dateLabel}</div>`
      : `<div class="bdg-progress-wrap">
           <div class="bdg-progress-label"><span>${escHtml(r.label)}</span></div>
           <div class="prog-bar" style="margin:0"><div class="prog-fill" style="width:${Math.round(r.pct || 0)}%"></div></div>
         </div>`;
    return `<div class="bdg-card${isUnlocked ? ' unlocked' : ' locked'}">
      <div class="bdg-card-top">
        <div class="bdg-icon">${def.icon}</div>
        <div class="bdg-title-wrap">
          <div class="bdg-title">${escHtml(def.title)}</div>
          <div class="bdg-desc">${escHtml(def.desc)}</div>
        </div>
      </div>
      ${progressHtml}
    </div>`;
  }).join('');

  body.innerHTML = summary + `<div class="bdg-grid">${cards}</div>`;
}

function _bdgFormatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) { return ''; }
}

/* ==================================================
   RESET — dialog tematizzato (stesso pattern di resetLb/
   resetStats/resetHistory/resetWrongQ), mai confirm() nativo.
================================================== */
async function resetBadges() {
  const ok = await ppConfirmBox(
    'Tutti i traguardi sbloccati in questa aula verranno azzerati. Potranno essere sbloccati di nuovo giocando.',
    { title: 'Azzerare i traguardi?', icon: '🏆', yesLabel: 'Sì, azzera tutto', danger: true }
  );
  if (!ok) return;
  db.badges = { unlocked: {} };
  save();
  renderBadges();
}
