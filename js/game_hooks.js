/**
 * game_hooks.js — PixelProf v2.1.5
 *
 * Questo file contiene le funzioni che il motore di gioco
 * deve chiamare al posto delle vecchie funzioni localStorage.
 *
 * Ogni funzione è un "hook" che:
 *   1. Aggiorna il db locale in memoria (compatibilità immediata)
 *   2. Persiste su Supabase in background (async, non bloccante)
 *   3. Aggiorna localStorage come cache offline
 *
 * COME USARE:
 *   Sostituisci le chiamate esistenti nel motore con queste.
 *   Il motore di gioco NON deve essere riscritto da zero:
 *   basta aggiornare 4-5 punti di integrazione.
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

// ════════════════════════════════════════════════════════════════════
// HOOK 1 — saveLbEntryAndCloud
// Sostituisce: saveLbEntry(player, pts, act, mod)
//
//  Chiamata alla fine di ogni partita.
//  Aggiorna il db in memoria (lb2) E salva su Supabase.
// ════════════════════════════════════════════════════════════════════

/**
 * Salva un punteggio in classifica (memoria + cloud).
 *
 * @param {object} player  - { name, color, type: 'ind'|'sq' }
 * @param {number} pts
 * @param {string} act     - attività (es. 'quiz')
 * @param {string} mod     - modulo (es. 'CE')
 * @param {string} classId - UUID della classe attiva
 * @param {object} db      - riferimento al db in memoria
 */
export async function saveLbEntryAndCloud(player, pts, act, mod, classId, db) {
  // ── Aggiorna lb2 in memoria (comportamento originale) ──
  const type = player.type === 'sq' ? 'sq' : 'ind';
  if (!db.lb2[type]) db.lb2[type] = {};
  if (!db.lb2[type][act]) db.lb2[type][act] = {};
  const bucket = db.lb2[type][act];
  const key = player.name;
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

  // ── Persisti su Supabase in background ──
  if (classId) {
    const participantId = type === 'sq'
      ? await resolveTeamId(classId, player.name, player.color)
      : await resolvePlayerId(classId, player.name, player.color);

    saveLbEntryCloud({
      classId,
      type,
      id:       participantId,
      name:     player.name,
      color:    player.color,
      activity: act,
      module:   mod,
      score:    pts,
    }).catch(err => console.warn('[PixelProf] saveLbEntryCloud async err:', err));
  }
}

// ════════════════════════════════════════════════════════════════════
// HOOK 2 — saveSessionAndCloud
//  Sostituisce: saveSessionResult(act, mod)
//
//  Chiamata alla fine di ogni partita per registrare
//  la sessione completa nel db.
// ════════════════════════════════════════════════════════════════════

/**
 * Salva la sessione completa su Supabase.
 *
 * @param {string} act         - attività
 * @param {string} mod         - modulo
 * @param {string} mode        - 'ind' | 'sq'
 * @param {string} classId     - UUID della classe
 * @param {object} db          - db in memoria
 * @param {object} matchState  - stato del motore (per squadre)
 * @param {Array}  players     - array giocatori del turno corrente
 * @param {object} qScores     - punteggi { nome: pts }
 * @param {number} duration    - durata in secondi
 * @param {number} qCount      - numero domande giocate
 */
export async function saveSessionAndCloud(
  act, mod, mode, classId, db,
  matchState, players, qScores,
  duration = 0, qCount = 0
) {
  // ── Aggiorna sessions in memoria (comportamento originale) ──
  if (!db.sessions) db.sessions = [];
  const teamsSnapshot = mode === 'sq' && matchState?.teams?.length
    ? matchState.teams.map(t => ({ name: t.name, color: t.color, score: matchState.scores?.[t.name] || 0 }))
    : players.map(p => ({ name: p.name, color: p.color, score: qScores?.[p.name] || 0 }));

  db.sessions.push({
    course:    classId || null,
    game:      act,
    mod,
    mode,
    teams:     teamsSnapshot,
    timestamp: new Date().toISOString(),
  });
  if (db.sessions.length > 100) db.sessions = db.sessions.slice(-100);

  // ── Persisti su Supabase in background ──
  if (!classId) return; // nessuna classe attiva

  // Risolvi gli ID dei partecipanti
  const participantsWithIds = await Promise.all(
    teamsSnapshot.map(async (p, i) => {
      const pType = mode === 'sq' ? 'team' : 'player';
      const id = pType === 'team'
        ? await resolveTeamId(classId, p.name, p.color)
        : await resolvePlayerId(classId, p.name, p.color);

      // Ordina per score per assegnare il rank
      const sortedScores = [...teamsSnapshot].sort((a, b) => b.score - a.score);
      const rank = sortedScores.findIndex(s => s.name === p.name) + 1;

      return { type: pType, id, name: p.name, color: p.color, score: p.score, rank };
    })
  );

  saveMatch({
    classId,
    activity:        act,
    module:          mod,
    mode,
    durationSec:     Math.round(duration),
    questionsPlayed: qCount,
    participants:    participantsWithIds,
  }).catch(err => console.warn('[PixelProf] saveMatch async err:', err));
}

// ════════════════════════════════════════════════════════════════════
// HOOK 3 — trackAnswerAndCloud
//  Sostituisce: aggiornamento di db.stats dopo ogni risposta
//
//  Chiamata in ansQ() dopo ogni risposta data.
// ════════════════════════════════════════════════════════════════════

/**
 * Traccia una risposta (corr/sbagliata) localmente e su cloud.
 *
 * @param {string} classId
 * @param {string} module  - 'CE' | 'OE'
 * @param {boolean} correct
 * @param {object} db      - db in memoria
 */
export function trackAnswerAndCloud(classId, module, correct, db) {
  // ── Aggiorna stats in memoria ──
  db.stats.tot++;
  if (correct) {
    db.stats.cor++;
    db.stats.byMod[module].c++;
  } else {
    db.stats.byMod[module].w++;
  }

  // ── Persisti su Supabase (debounced: ogni 5 risposte per ridurre chiamate) ──
  _statsBuffer.classId = classId;
  _statsBuffer.module  = module;
  _statsBuffer[module] = _statsBuffer[module] || { c: 0, w: 0 };
  if (correct) _statsBuffer[module].c++;
  else         _statsBuffer[module].w++;
  _statsBuffer.count = (_statsBuffer.count || 0) + 1;

  if (_statsBuffer.count >= 5) {
    _flushStatsBuffer();
  } else {
    // Flush entro 10s comunque
    clearTimeout(_statsFlushTimer);
    _statsFlushTimer = setTimeout(_flushStatsBuffer, 10000);
  }
}

// Buffer stats per ridurre le API call durante quiz rapidi
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

  // Reset buffer
  _statsBuffer.classId = null;
  _statsBuffer.module  = null;
  _statsBuffer[module] = { c: 0, w: 0 };
  _statsBuffer.count   = 0;

  incrementStats(classId, module, c, w)
    .catch(err => console.warn('[PixelProf] incrementStats async err:', err));
}

// Flush al beforeunload per non perdere risposte
window.addEventListener('beforeunload', _flushStatsBuffer);

// ════════════════════════════════════════════════════════════════════
// HOOK 4 — loadLeaderboardForRender
//  Sostituisce: renderLbResults(type, act) che legge db.lb2
//
//  Carica la classifica dal cloud e la trasforma nel formato
//  atteso da renderLbResults.
// ════════════════════════════════════════════════════════════════════

/**
 * Carica la classifica dal cloud e la prepara per il rendering.
 *
 * @param {string} classId
 * @param {'ind'|'sq'} type    - 'ind' = individuale, 'sq' = squadre
 * @param {string} activity
 * @returns {Promise<Array>}   Array di { name, pts, games, mod, color }
 *                             ordinato per pts DESC
 */
export async function loadLeaderboardForRender(classId, type, activity) {
  // Converti 'ind' → 'player', 'sq' → 'team'
  const participantType = type === 'sq' ? 'team' : 'player';
  return loadLeaderboard(classId, participantType, activity);
}

// ════════════════════════════════════════════════════════════════════
// HOOK 5 — ensurePlayersAndTeams
//  Chiamata in launch() dopo validazione giocatori/squadre.
//  Garantisce che tutti i partecipanti esistano nel DB cloud.
// ════════════════════════════════════════════════════════════════════

/**
 * Assicura che tutti i partecipanti della sessione esistano nel DB.
 *
 * @param {string}  classId
 * @param {'ind'|'sq'} mode
 * @param {string}  playerName  - se mode === 'ind'
 * @param {Array}   teams       - se mode === 'sq', array di { name, color }
 */
export async function ensureParticipants(classId, mode, playerName, teams) {
  if (!classId) return;

  if (mode === 'ind' && playerName) {
    ensurePlayer(classId, playerName, '#00ffc8').catch(() => {});
  } else if (mode === 'sq' && teams?.length) {
    for (const t of teams) {
      ensureTeam(classId, t.name.trim(), t.color).catch(() => {});
    }
  }
}
/* ── Espone gli hook su window per il motore di gioco legacy ──
   Il motore usa script inline (non ES module), quindi non può
   fare import diretto. Questi alias su window colmano il gap. */
window.hook_saveLbEntry       = saveLbEntryAndCloud;
window.hook_saveSession       = saveSessionAndCloud;
window.hook_trackAnswer       = trackAnswerAndCloud;
window.hook_loadLeaderboard   = loadLeaderboardForRender;
window.hook_ensureParticipants= ensureParticipants;
