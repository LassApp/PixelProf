/**
 * game_hooks.js — PixelProf v3.0.0
 *
 * Fusione di v2.1.5 (logica esistente) + v3.0.0 (contesto appState).
 *
 * COSA È CAMBIATO rispetto a v2.1.5:
 *   - classId viene letto da window.appState.classroom.id
 *     invece di essere passato come parametro (il motore non lo passa)
 *   - window.hook_* hanno la stessa firma di v2.1.5 per compatibilità
 *   - Aggiunto window.__resolveHooks() al termine
 *   - Tutto il resto (debounce, beforeunload, resolvePlayerId) invariato
 *
 * REGOLA FONDAMENTALE:
 *   Ogni hook è fire-and-forget — NON blocca mai il flusso di gioco.
 *   Il db locale viene aggiornato prima (comportamento originale),
 *   Supabase riceve i dati in background.
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

// ── Legge il classId dal contesto globale (impostato da enterCourse) ──
function _classId() {
  return window.appState?.classroom?.id ?? null;
}

// ════════════════════════════════════════════════════════════════════
// HOOK 1 — saveLbEntryAndCloud
// Firma invariata rispetto a v2.1.5.
// classId viene ora letto da appState invece di essere passato.
// ════════════════════════════════════════════════════════════════════

async function saveLbEntryAndCloud(player, pts, act, mod, _classIdParam, db) {
  // classId: usa il parametro se fornito, altrimenti legge da appState
  const classId = _classIdParam || _classId();

  // ── Aggiorna lb2 in memoria (comportamento originale invariato) ──
  if (db) {
    const type = player.type === 'sq' ? 'sq' : 'ind';
    if (!db.lb2[type])      db.lb2[type]      = {};
    if (!db.lb2[type][act]) db.lb2[type][act] = {};
    const bucket   = db.lb2[type][act];
    const key      = player.name;
    const existing = bucket[key];
    if (!existing) {
      bucket[key] = { entries: [{ pts, mod, games: 1 }], color: player.color || null };
    } else {
      const idx = existing.entries.findIndex(e => e.mod === mod);
      if (idx >= 0) {
        existing.entries[idx].games++;
        if (pts > existing.entries[idx].pts) existing.entries[idx].pts = pts;
      } else {
        existing.entries.push({ pts, mod, games: 1 });
      }
      if (player.color) existing.color = player.color;
    }
  }

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
// HOOK 2 — saveSessionAndCloud
// Firma invariata rispetto a v2.1.5.
// ════════════════════════════════════════════════════════════════════

async function saveSessionAndCloud(
  act, mod, mode, _classIdParam, db,
  matchState, players, qScores,
  duration = 0, qCount = 0
) {
  const classId = _classIdParam || _classId();

  // ── Aggiorna sessions in memoria ──
  if (db) {
    if (!db.sessions) db.sessions = [];
    const teamsSnapshot = mode === 'sq' && matchState?.teams?.length
      ? matchState.teams.map(t => ({ name: t.name, color: t.color, score: matchState.scores?.[t.name] || 0 }))
      : (players || []).map(p => ({ name: p.name, color: p.color, score: qScores?.[p.name] || 0 }));
    db.sessions.push({
      course:    classId || null,
      game:      act,
      mod,
      mode,
      teams:     teamsSnapshot,
      timestamp: new Date().toISOString(),
    });
    if (db.sessions.length > 100) db.sessions = db.sessions.slice(-100);
  }

  // ── Persisti su Supabase in background ──
  if (!classId) return;

  const teamsSnapshot = mode === 'sq' && matchState?.teams?.length
    ? matchState.teams.map(t => ({ name: t.name, color: t.color, score: matchState.scores?.[t.name] || 0, type: 'team' }))
    : (players || []).map(p => ({ name: p.name, color: p.color, score: qScores?.[p.name] || 0, type: 'player' }));

  const participantsWithIds = await Promise.all(
    teamsSnapshot.map(async (p) => {
      const id = p.type === 'team'
        ? await resolveTeamId(classId, p.name, p.color)
        : await resolvePlayerId(classId, p.name, p.color);
      const sorted = [...teamsSnapshot].sort((a, b) => b.score - a.score);
      const rank   = sorted.findIndex(s => s.name === p.name) + 1;
      return { type: p.type, id, name: p.name, color: p.color, score: p.score, rank };
    })
  );

  saveMatch({
    classId,
    activity:        act,
    module:          mod,
    mode,
    durationSec:     Math.round(duration || 0),
    questionsPlayed: qCount || 0,
    participants:    participantsWithIds,
  }).catch(err => console.warn('[PixelProf] saveMatch async err:', err));
}

// ════════════════════════════════════════════════════════════════════
// HOOK 3 — trackAnswerAndCloud
// Firma invariata rispetto a v2.1.5.
// classId viene ora letto da appState se non passato.
// ════════════════════════════════════════════════════════════════════

function trackAnswerAndCloud(classId, module, correct, db) {
  const cid = classId || _classId();

  // ── Aggiorna stats in memoria ──
  if (db) {
    db.stats.tot++;
    if (correct) { db.stats.cor++; db.stats.byMod[module].c++; }
    else           db.stats.byMod[module].w++;
  }

  // ── Debounce verso Supabase ──
  _statsBuffer.classId  = cid;
  _statsBuffer.module   = module;
  _statsBuffer[module]  = _statsBuffer[module] || { c: 0, w: 0 };
  if (correct) _statsBuffer[module].c++;
  else         _statsBuffer[module].w++;
  _statsBuffer.count    = (_statsBuffer.count || 0) + 1;

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
  if (!_statsBuffer.classId || !_statsBuffer.module) return;
  const classId = _statsBuffer.classId;
  const module  = _statsBuffer.module;
  const c = _statsBuffer[module]?.c || 0;
  const w = _statsBuffer[module]?.w || 0;
  if (c + w === 0) return;
  _statsBuffer.classId    = null;
  _statsBuffer.module     = null;
  _statsBuffer[module]    = { c: 0, w: 0 };
  _statsBuffer.count      = 0;
  incrementStats(classId, module, c, w)
    .catch(err => console.warn('[PixelProf] incrementStats async err:', err));
}

window.addEventListener('beforeunload', _flushStatsBuffer);

// ════════════════════════════════════════════════════════════════════
// HOOK 4 — loadLeaderboardForRender
// Firma invariata rispetto a v2.1.5.
// classId viene ora letto da appState se non passato.
// ════════════════════════════════════════════════════════════════════

async function loadLeaderboardForRender(classId, type, activity) {
  const cid = classId || _classId();
  if (!cid) return [];
  const participantType = type === 'sq' ? 'team' : 'player';
  return loadLeaderboard(cid, participantType, activity);
}

// ════════════════════════════════════════════════════════════════════
// HOOK 5 — ensureParticipants
// Firma invariata rispetto a v2.1.5.
// classId viene ora letto da appState se non passato.
// ════════════════════════════════════════════════════════════════════

async function ensureParticipants(classId, mode, playerName, teams) {
  const cid = classId || _classId();
  if (!cid) return;
  if (mode === 'ind' && playerName) {
    ensurePlayer(cid, playerName, '#00ffc8').catch(() => {});
  } else if (mode === 'sq' && teams?.length) {
    for (const t of teams) {
      ensureTeam(cid, t.name.trim(), t.color).catch(() => {});
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// ESPOSIZIONE su window.hook_*
// Firma identica a v2.1.5 — nessuna modifica richiesta nel motore.
// ════════════════════════════════════════════════════════════════════
window.hook_saveLbEntry        = saveLbEntryAndCloud;
window.hook_saveSession        = saveSessionAndCloud;
window.hook_trackAnswer        = trackAnswerAndCloud;
window.hook_loadLeaderboard    = loadLeaderboardForRender;
window.hook_ensureParticipants = ensureParticipants;

// Bootstrap gate — segnala che gli hook sono pronti
if (typeof window.__resolveHooks === 'function') window.__resolveHooks();
