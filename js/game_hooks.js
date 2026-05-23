/**
 * game_hooks.js — PixelProf v3.1.1
 *
 * FIX v3.1.1 — mismatch firme tra HTML e JS (4 hook su 4 erano sbagliati):
 *
 *   HOOK_SAVESESSION:
 *     HTML chiama: (act, mod, sMode, participants, activeCourseId, qCount)
 *     JS vecchio:  (act, mod, mode, _classIdParam, db, matchState, players, qScores, duration, qCount)
 *     → SHIFT: participants→_classIdParam, activeCourseId→db
 *     → CRASH: "Cannot create property 'sessions' on string UUID"
 *     FIX: firma riscritta per corrispondere esattamente all'HTML
 *
 *   HOOK_SAVELBENTRY:
 *     HTML chiama: (player, pts, act, mod)  [4 params — NO classId]
 *     JS vecchio:  (player, pts, act, mod, _classIdParam, db)
 *     FIX: classId letto da window.activeCourseId (già disponibile globalmente)
 *
 *   HOOK_TRACKANSWER:
 *     HTML chiama: (moduleKey, correct)  [2 params]
 *     JS vecchio:  (classId, module, correct, db)  [4 params]
 *     → SHIFT: 'CE'/'OE' finiva in classId → RPC con UUID=stringa modulo → fail silenzioso
 *     FIX: firma riscritta per corrispondere esattamente all'HTML
 *
 *   HOOK_ENSUREPARTICIPANTS:
 *     HTML chiama: ([{name,color,type}])  [1 param: array piatto]
 *     JS vecchio:  (classId, mode, playerName, teams)  [4 params]
 *     → SHIFT TOTALE: array finiva in classId
 *     FIX: firma riscritta per corrispondere esattamente all'HTML
 *
 * REGOLA FONDAMENTALE invariata:
 *   Ogni hook è fire-and-forget — NON blocca mai il flusso di gioco.
 */

import {
  resolvePlayerId,
  resolveTeamId,
  saveMatch,
  incrementStats,
  loadLeaderboard,
  saveLbEntryCloud,
  ensurePlayer,
  ensureTeam,
} from './db_adapter.js';

// ── Legge il classId dal contesto globale ────────────────────────
// window.activeCourseId è impostato da enterCourse() nell'HTML
function _classId() {
  return window.activeCourseId ?? window.appState?.classroom?.id ?? null;
}

// ════════════════════════════════════════════════════════════════════
// HOOK 1 — hook_saveLbEntry
// HTML chiama: hook_saveLbEntry(player, pts, act, mod)
// ════════════════════════════════════════════════════════════════════
async function saveLbEntryAndCloud(player, pts, act, mod) {
  const classId = _classId();

  // ── Persisti su Supabase in background ──
  if (!classId) return;

  const pType = player.type === 'sq' ? 'team' : 'player';
  const participantId = pType === 'team'
    ? await resolveTeamId(classId, player.name, player.color)
    : await resolvePlayerId(classId, player.name, player.color);

  saveLbEntryCloud({
    classId,
    type:     pType,
    id:       participantId,
    name:     player.name,
    color:    player.color,
    activity: act,
    module:   mod,
    score:    pts,
  }).catch(err => console.warn('[PixelProf] saveLbEntryCloud async err:', err));
}

// ════════════════════════════════════════════════════════════════════
// HOOK 2 — hook_saveSession
// HTML chiama: hook_saveSession(act, mod, sMode, participants, activeCourseId, qCount)
//   act          → stringa attività
//   mod          → 'CE'|'OE'|'MIX'
//   sMode        → 'ind'|'sq'
//   participants → [{name,color,score,type}]
//   activeCourseId → UUID aula (già estratto dall'HTML)
//   qCount       → numero domande o null
// ════════════════════════════════════════════════════════════════════
async function saveSessionAndCloud(act, mod, mode, participants, classId, qCount) {
  // Guard: classId deve essere una stringa UUID, non un oggetto
  if (classId !== null && classId !== undefined && typeof classId !== 'string') {
    console.error('[PixelProf] hook_saveSession: classId non è stringa:', classId, '— skip');
    return;
  }

  if (!classId) return; // offline o nessuna aula attiva

  // Risolve gli ID partecipanti in parallelo
  const participantsWithIds = await Promise.all(
    (participants || []).map(async (p) => {
      const pType = p.type === 'sq' ? 'team' : 'player';
      const id = pType === 'team'
        ? await resolveTeamId(classId, p.name, p.color)
        : await resolvePlayerId(classId, p.name, p.color);
      const sorted = [...(participants || [])].sort((a, b) => b.score - a.score);
      const rank   = sorted.findIndex(s => s.name === p.name) + 1;
      return { type: pType, id, name: p.name, color: p.color, score: p.score, rank };
    })
  );

  saveMatch({
    classId,
    activity:        act,
    module:          mod,
    mode,
    durationSec:     0,
    questionsPlayed: qCount || 0,
    participants:    participantsWithIds,
  }).catch(err => console.warn('[PixelProf] saveMatch async err:', err));
}

// ════════════════════════════════════════════════════════════════════
// HOOK 3 — hook_trackAnswer
// HTML chiama: hook_trackAnswer(moduleKey, correct)
//   moduleKey → 'CE' o 'OE'
//   correct   → boolean
// ════════════════════════════════════════════════════════════════════
function trackAnswerAndCloud(moduleKey, correct) {
  const classId = _classId();
  if (!classId) return; // offline

  // ── Debounce verso Supabase ──
  _statsBuffer.classId = classId;
  _statsBuffer[moduleKey] = _statsBuffer[moduleKey] || { c: 0, w: 0 };
  if (correct) _statsBuffer[moduleKey].c++;
  else         _statsBuffer[moduleKey].w++;
  _statsBuffer.count = (_statsBuffer.count || 0) + 1;

  if (_statsBuffer.count >= 5) {
    _flushStatsBuffer();
  } else {
    clearTimeout(_statsFlushTimer);
    _statsFlushTimer = setTimeout(_flushStatsBuffer, 10000);
  }
}

const _statsBuffer = {};
let _statsFlushTimer = null;

function _flushStatsBuffer() {
  clearTimeout(_statsFlushTimer);
  const classId = _statsBuffer.classId;
  if (!classId) return;

  // Raccoglie tutti i moduli bufferizzati e invia
  const modules = Object.keys(_statsBuffer).filter(k => k !== 'classId' && k !== 'count');
  modules.forEach(mod => {
    const c = _statsBuffer[mod]?.c || 0;
    const w = _statsBuffer[mod]?.w || 0;
    if (c + w === 0) return;
    _statsBuffer[mod] = { c: 0, w: 0 };
    incrementStats(classId, mod, c, w)
      .catch(err => console.warn('[PixelProf] incrementStats async err:', err));
  });
  _statsBuffer.classId = null;
  _statsBuffer.count   = 0;
}

window.addEventListener('beforeunload', _flushStatsBuffer);

// ════════════════════════════════════════════════════════════════════
// HOOK 4 — hook_loadLeaderboard (firma invariata — non chiamato dall'HTML direttamente)
// ════════════════════════════════════════════════════════════════════
async function loadLeaderboardForRender(classId, type, activity) {
  const cid = classId || _classId();
  if (!cid) return [];
  const participantType = type === 'sq' ? 'team' : 'player';
  return loadLeaderboard(cid, participantType, activity);
}

// ════════════════════════════════════════════════════════════════════
// HOOK 5 — hook_ensureParticipants
// HTML chiama: hook_ensureParticipants([{name, color, type}])
//   participants → array piatto di oggetti
// ════════════════════════════════════════════════════════════════════
async function ensureParticipants(participants) {
  const classId = _classId();
  if (!classId || !Array.isArray(participants)) return;

  for (const p of participants) {
    if (!p?.name?.trim()) continue;
    if (p.type === 'sq') {
      ensureTeam(classId, p.name.trim(), p.color).catch(() => {});
    } else {
      ensurePlayer(classId, p.name.trim(), p.color || '#00ffc8').catch(() => {});
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// ESPOSIZIONE su window.hook_*
// ════════════════════════════════════════════════════════════════════
window.hook_saveLbEntry        = saveLbEntryAndCloud;
window.hook_saveSession        = saveSessionAndCloud;
window.hook_trackAnswer        = trackAnswerAndCloud;
window.hook_loadLeaderboard    = loadLeaderboardForRender;
window.hook_ensureParticipants = ensureParticipants;

// Bootstrap gate — segnala che gli hook sono pronti
if (typeof window.__resolveHooks === 'function') window.__resolveHooks();
