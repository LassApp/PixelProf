/**
 * db_adapter.js — PixelProf v2.1.5
 *
 * ADAPTER LAYER: sostituisce localStorage con Supabase.
 *
 * Espone esattamente le stesse funzioni usate dal motore di gioco:
 *   loadCourses()         → legge classi dal cloud
 *   saveCourses()         → non più necessaria (ogni op è atomica)
 *   loadCourseData(id)    → legge players, teams, lb, stats per classe
 *   saveCourseData(id, d) → non più necessaria (ogni op è atomica)
 *   save()                → no-op (compatibilità)
 *
 * STRATEGIA OFFLINE FALLBACK:
 *   Se Supabase non risponde, si legge da localStorage come cache.
 *   Ogni scrittura va sia su Supabase che su localStorage.
 *   Questo garantisce che il gioco funzioni anche offline.
 */

import { supabase } from './supabase_client.js';

// ── Chiavi localStorage (cache locale) ───────────────────────────
const LS_COURSES_KEY = 'pp5_courses';
const lsCourseDataKey = id => 'pp5_cdata_' + id;

// ── Flag: siamo online? ───────────────────────────────────────────
let _online = navigator.onLine;
window.addEventListener('online',  () => { _online = true;  console.log('[PixelProf] Tornato online'); });
window.addEventListener('offline', () => { _online = false; console.log('[PixelProf] Offline — uso cache locale'); });

// ════════════════════════════════════════════════════════════════════
// HELPER INTERNI
// ════════════════════════════════════════════════════════════════════

/** Legge da localStorage con fallback a default. */
function _lsGet(key, defaultVal) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : defaultVal;
  } catch { return defaultVal; }
}

/** Scrive su localStorage silenziosamente. */
function _lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/** Rimuove da localStorage. */
function _lsDel(key) {
  try { localStorage.removeItem(key); } catch {}
}

/**
 * Wrappa una chiamata Supabase con try/catch.
 * In caso di errore, logga e ritorna null.
 */
async function _sbCall(fn, label) {
  try {
    const result = await fn();
    if (result.error) throw result.error;
    return result.data;
  } catch (err) {
    console.warn(`[PixelProf] Supabase ${label} fallito:`, err.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════
// CLASSES API
// ════════════════════════════════════════════════════════════════════

/**
 * Carica tutte le classi dal cloud.
 * Fallback: localStorage se offline o errore.
 *
 * @returns {Promise<Array>} Array di classi nel formato interno PixelProf
 */
export async function loadCourses() {
  if (!_online) {
    console.log('[PixelProf] Offline — classi da cache locale');
    return _lsGet(LS_COURSES_KEY, []);
  }

  const rows = await _sbCall(
    () => supabase.from('classes').select('*').order('created_at', { ascending: true }),
    'loadCourses'
  );

  if (!rows) {
    // Fallback locale
    return _lsGet(LS_COURSES_KEY, []);
  }

  // Converti dal formato Supabase al formato interno PixelProf
  const courses = rows.map(r => ({
    id:        r.id,
    name:      r.name,
    icon:      r.icon,
    colorIdx:  r.color_idx,
    bgIdx:     r.bg_idx,
    createdAt: new Date(r.created_at).getTime(),
  }));

  // Aggiorna cache locale
  _lsSet(LS_COURSES_KEY, courses);
  return courses;
}

/**
 * Crea una nuova classe su Supabase.
 *
 * @param {object} course - { name, icon, colorIdx, bgIdx }
 * @returns {Promise<object|null>} La classe creata con id assegnato
 */
export async function createCourse(course) {
  const payload = {
    name:      course.name,
    icon:      course.icon      || '🏫',
    color_idx: course.colorIdx  ?? 0,
    bg_idx:    course.bgIdx     ?? 0,
  };

  const data = await _sbCall(
    () => supabase.from('classes').insert(payload).select().single(),
    'createCourse'
  );

  if (!data) {
    // Fallback locale: genera id temporaneo
    console.warn('[PixelProf] createCourse fallback locale');
    const localCourse = { ...course, id: _localId(), createdAt: Date.now() };
    const local = _lsGet(LS_COURSES_KEY, []);
    local.push(localCourse);
    _lsSet(LS_COURSES_KEY, local);
    return localCourse;
  }

  const created = {
    id:        data.id,
    name:      data.name,
    icon:      data.icon,
    colorIdx:  data.color_idx,
    bgIdx:     data.bg_idx,
    createdAt: new Date(data.created_at).getTime(),
  };

  // Aggiorna cache
  const local = _lsGet(LS_COURSES_KEY, []);
  local.push(created);
  _lsSet(LS_COURSES_KEY, local);

  return created;
}

/**
 * Aggiorna una classe esistente (nome, icona, colori).
 *
 * @param {string} id - UUID della classe
 * @param {object} updates - campi da aggiornare
 */
export async function updateCourse(id, updates) {
  const payload = {};
  if (updates.name      !== undefined) payload.name      = updates.name;
  if (updates.icon      !== undefined) payload.icon      = updates.icon;
  if (updates.colorIdx  !== undefined) payload.color_idx = updates.colorIdx;
  if (updates.bgIdx     !== undefined) payload.bg_idx    = updates.bgIdx;

  if (_online) {
    await _sbCall(
      () => supabase.from('classes').update(payload).eq('id', id),
      'updateCourse'
    );
  }

  // Aggiorna cache locale sempre
  const local = _lsGet(LS_COURSES_KEY, []);
  const idx = local.findIndex(c => c.id === id);
  if (idx >= 0) {
    Object.assign(local[idx], updates);
    _lsSet(LS_COURSES_KEY, local);
  }
}

/**
 * Elimina una classe e tutti i dati correlati (CASCADE sul DB).
 *
 * @param {string} id - UUID della classe
 */
export async function deleteCourse(id) {
  if (_online) {
    await _sbCall(
      () => supabase.from('classes').delete().eq('id', id),
      'deleteCourse'
    );
  }

  // Rimuovi da cache locale
  const local = _lsGet(LS_COURSES_KEY, []);
  _lsSet(LS_COURSES_KEY, local.filter(c => c.id !== id));
  _lsDel(lsCourseDataKey(id));
}

// ════════════════════════════════════════════════════════════════════
// PLAYERS API
// ════════════════════════════════════════════════════════════════════

/**
 * Carica tutti i giocatori di una classe.
 *
 * @param {string} classId
 * @returns {Promise<string[]>} Array di nomi giocatori
 */
export async function loadPlayers(classId) {
  if (!_online) {
    const cached = _lsGet(lsCourseDataKey(classId), {});
    return cached.players || [];
  }

  const rows = await _sbCall(
    () => supabase.from('players').select('name, color').eq('class_id', classId).order('created_at'),
    'loadPlayers'
  );

  if (!rows) {
    const cached = _lsGet(lsCourseDataKey(classId), {});
    return cached.players || [];
  }

  // Ritorna solo i nomi (formato attuale del motore)
  return rows.map(r => r.name);
}

/**
 * Aggiunge un giocatore a una classe se non esiste già.
 *
 * @param {string} classId
 * @param {string} playerName
 * @param {string} color
 * @returns {Promise<void>}
 */
export async function ensurePlayer(classId, playerName, color = '#00ffc8') {
  if (_online) {
    await _sbCall(
      () => supabase
        .from('players')
        .upsert(
          { class_id: classId, name: playerName, color },
          { onConflict: 'class_id, name', ignoreDuplicates: true }
        ),
      'ensurePlayer'
    );
  }
}

// ════════════════════════════════════════════════════════════════════
// TEAMS API
// ════════════════════════════════════════════════════════════════════

/**
 * Carica tutte le squadre di una classe.
 *
 * @param {string} classId
 * @returns {Promise<Array<{name: string, color: string}>>}
 */
export async function loadTeams(classId) {
  if (!_online) {
    const cached = _lsGet(lsCourseDataKey(classId), {});
    return cached.teams || [];
  }

  const rows = await _sbCall(
    () => supabase.from('teams').select('name, color').eq('class_id', classId).order('created_at'),
    'loadTeams'
  );

  if (!rows) {
    const cached = _lsGet(lsCourseDataKey(classId), {});
    return cached.teams || [];
  }

  return rows.map(r => ({ name: r.name, color: r.color }));
}

/**
 * Aggiunge una squadra se non esiste già.
 *
 * @param {string} classId
 * @param {string} teamName
 * @param {string} color
 */
export async function ensureTeam(classId, teamName, color = '#7c6aff') {
  if (_online) {
    await _sbCall(
      () => supabase
        .from('teams')
        .upsert(
          { class_id: classId, name: teamName, color },
          { onConflict: 'class_id, name', ignoreDuplicates: true }
        ),
      'ensureTeam'
    );
  }
}

// ════════════════════════════════════════════════════════════════════
// LEADERBOARD API
// ════════════════════════════════════════════════════════════════════

/**
 * Salva o aggiorna il miglior punteggio di un partecipante.
 * Usa la funzione PostgreSQL upsert_leaderboard per atomicità.
 *
 * @param {object} p - { classId, type: 'player'|'team', id, name, color, activity, module, score }
 */
export async function saveLbEntryCloud(p) {
  if (!_online) {
    // Scrivi su cache locale — sync quando torna online
    _enqueuePendingLb(p);
    return;
  }

  await _sbCall(
    () => supabase.rpc('upsert_leaderboard', {
      p_class_id:          p.classId,
      p_participant_type:  p.type,
      p_participant_id:    p.id,
      p_participant_name:  p.name,
      p_participant_color: p.color,
      p_activity:          p.activity,
      p_module:            p.module,
      p_new_score:         p.score,
    }),
    'saveLbEntryCloud'
  );
}

/**
 * Carica la classifica per una classe, tipo e attività.
 *
 * @param {string} classId
 * @param {'player'|'team'} type
 * @param {string} activity  - 'quiz' | 'speed' | 'match' | 'memory' | 'fill'
 * @returns {Promise<Array>} Array ordinato per best_score DESC
 */
export async function loadLeaderboard(classId, type, activity) {
  if (!_online) {
    return _loadLbFromCache(classId, type, activity);
  }

  const rows = await _sbCall(
    () => supabase
      .from('leaderboard_entries')
      .select('participant_name, participant_color, best_score, games_played, module, last_played_at')
      .eq('class_id', classId)
      .eq('participant_type', type)
      .eq('activity', activity)
      .order('best_score', { ascending: false }),
    'loadLeaderboard'
  );

  if (!rows) return _loadLbFromCache(classId, type, activity);

  return rows.map(r => ({
    name:       r.participant_name,
    color:      r.participant_color,
    pts:        r.best_score,
    games:      r.games_played,
    mod:        r.module,
    lastPlayed: r.last_played_at,
  }));
}

// ════════════════════════════════════════════════════════════════════
// MATCHES & SCORES API
// ════════════════════════════════════════════════════════════════════

/**
 * Registra una partita completata con tutti i punteggi.
 *
 * @param {object} matchData
 *   {
 *     classId:  string,
 *     activity: string,   // 'quiz' | 'speed' | ...
 *     module:   string,   // 'CE' | 'OE' | 'MIX'
 *     mode:     string,   // 'ind' | 'sq'
 *     durationSec: number,
 *     questionsPlayed: number,
 *     participants: Array<{
 *       type: 'player'|'team',
 *       id:   string,
 *       name: string,
 *       color: string,
 *       score: number,
 *       rank:  number,    // 1 = vincitore
 *     }>
 *   }
 * @returns {Promise<string|null>} match_id o null se fallisce
 */
export async function saveMatch(matchData) {
  if (!_online) {
    _enqueuePendingMatch(matchData);
    return null;
  }

  // 1. Inserisci il match
  const matchRow = await _sbCall(
    () => supabase.from('matches').insert({
      class_id:         matchData.classId,
      activity:         matchData.activity,
      module:           matchData.module,
      mode:             matchData.mode,
      duration_sec:     matchData.durationSec    || null,
      questions_played: matchData.questionsPlayed || null,
    }).select('id').single(),
    'saveMatch:insert'
  );

  if (!matchRow) return null;

  const matchId = matchRow.id;

  // 2. Inserisci tutti i punteggi in batch
  const scoreRows = matchData.participants.map(p => ({
    match_id:         matchId,
    class_id:         matchData.classId,
    participant_type: p.type,
    participant_id:   p.id,
    participant_name: p.name,
    participant_color: p.color,
    points:           p.score,
    rank_in_match:    p.rank,
    activity:         matchData.activity,
    module:           matchData.module,
  }));

  await _sbCall(
    () => supabase.from('scores').insert(scoreRows),
    'saveMatch:scores'
  );

  // 3. Upsert leaderboard per ogni partecipante
  for (const p of matchData.participants) {
    await saveLbEntryCloud({
      classId:  matchData.classId,
      type:     p.type,
      id:       p.id,
      name:     p.name,
      color:    p.color,
      activity: matchData.activity,
      module:   matchData.module,
      score:    p.score,
    });
  }

  return matchId;
}

// ════════════════════════════════════════════════════════════════════
// STATS API
// ════════════════════════════════════════════════════════════════════

/**
 * Aggiorna le statistiche aggregate della classe.
 *
 * @param {string} classId
 * @param {'CE'|'OE'} module
 * @param {number} correct
 * @param {number} wrong
 */
export async function incrementStats(classId, module, correct, wrong) {
  if (!_online) {
    _updateLocalStats(classId, module, correct, wrong);
    return;
  }

  await _sbCall(
    () => supabase.rpc('increment_stats', {
      p_class_id: classId,
      p_module:   module,
      p_correct:  correct,
      p_wrong:    wrong,
    }),
    'incrementStats'
  );
}

/**
 * Carica le statistiche aggregate per una classe.
 *
 * @param {string} classId
 * @returns {Promise<object>} Struttura compatibile con db.stats
 */
export async function loadStats(classId) {
  if (!_online) {
    const cached = _lsGet(lsCourseDataKey(classId), {});
    return cached.stats || _emptyStats();
  }

  const row = await _sbCall(
    () => supabase
      .from('stats_aggregate')
      .select('*')
      .eq('class_id', classId)
      .single(),
    'loadStats'
  );

  if (!row) {
    const cached = _lsGet(lsCourseDataKey(classId), {});
    return cached.stats || _emptyStats();
  }

  return {
    tot: row.total_questions,
    cor: row.correct_answers,
    byMod: {
      CE: { c: row.ce_correct, w: row.ce_wrong },
      OE: { c: row.oe_correct, w: row.oe_wrong },
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// FUNZIONE PRINCIPALE: loadCourseData (compatibilità drop-in)
// ════════════════════════════════════════════════════════════════════

/**
 * Carica tutti i dati di una classe dal cloud.
 * Restituisce la stessa struttura di makeEmptyDb() per compatibilità.
 *
 * @param {string} classId
 * @returns {Promise<object>} { players, teams, lb2, sessions, stats }
 */
export async function loadCourseData(classId) {
  const [players, teams, stats] = await Promise.all([
    loadPlayers(classId),
    loadTeams(classId),
    loadStats(classId),
  ]);

  // Carica lb2 in memoria — struttura compatibile col motore
  // I dati reali vengono caricati on-demand in renderLbResults()
  const lb2 = _buildEmptyLb2();

  return {
    players,
    teams,
    lb2,       // struttura vuota — la classifica è caricata separatamente
    sessions:  [],
    stats,
  };
}

// ════════════════════════════════════════════════════════════════════
// PLAYER/TEAM ID RESOLVER
// Il motore di gioco usa nomi come chiavi, Supabase usa UUID.
// Questi helper resolvono o creano il record e ritornano l'UUID.
// ════════════════════════════════════════════════════════════════════

/**
 * Recupera (o crea) l'UUID di un giocatore.
 *
 * @param {string} classId
 * @param {string} name
 * @param {string} color
 * @returns {Promise<string>} UUID del giocatore
 */
export async function resolvePlayerId(classId, name, color) {
  if (!_online) return _localId(); // UUID fake per offline

  // Upsert: se esiste già restituisce l'esistente
  const data = await _sbCall(
    () => supabase
      .from('players')
      .upsert({ class_id: classId, name, color }, { onConflict: 'class_id, name' })
      .select('id')
      .single(),
    'resolvePlayerId'
  );

  return data?.id || _localId();
}

/**
 * Recupera (o crea) l'UUID di una squadra.
 *
 * @param {string} classId
 * @param {string} name
 * @param {string} color
 * @returns {Promise<string>} UUID della squadra
 */
export async function resolveTeamId(classId, name, color) {
  if (!_online) return _localId();

  const data = await _sbCall(
    () => supabase
      .from('teams')
      .upsert({ class_id: classId, name, color }, { onConflict: 'class_id, name' })
      .select('id')
      .single(),
    'resolveTeamId'
  );

  return data?.id || _localId();
}

// ════════════════════════════════════════════════════════════════════
// OFFLINE QUEUE — sync dei dati quando si torna online
// ════════════════════════════════════════════════════════════════════

const PENDING_KEY = 'pp5_pending_sync';

function _enqueuePendingLb(entry) {
  const queue = _lsGet(PENDING_KEY, { lb: [], matches: [] });
  queue.lb.push(entry);
  _lsSet(PENDING_KEY, queue);
}

function _enqueuePendingMatch(matchData) {
  const queue = _lsGet(PENDING_KEY, { lb: [], matches: [] });
  queue.matches.push(matchData);
  _lsSet(PENDING_KEY, queue);
}

/**
 * Sincronizza la coda offline quando si torna online.
 * Chiamata automaticamente all'evento 'online'.
 */
async function _syncOfflineQueue() {
  const queue = _lsGet(PENDING_KEY, { lb: [], matches: [] });
  if (!queue.lb.length && !queue.matches.length) return;

  console.log(`[PixelProf] Sincronizzazione offline: ${queue.lb.length} lb, ${queue.matches.length} partite`);

  // Sync leaderboard entries
  for (const entry of queue.lb) {
    await saveLbEntryCloud(entry);
  }

  // Sync partite
  for (const match of queue.matches) {
    await saveMatch(match);
  }

  // Svuota la coda
  _lsSet(PENDING_KEY, { lb: [], matches: [] });
  console.log('[PixelProf] Sync completata');
}

window.addEventListener('online', () => {
  setTimeout(_syncOfflineQueue, 1000); // piccolo delay per attendere la connessione
});

// ════════════════════════════════════════════════════════════════════
// HELPERS PRIVATI
// ════════════════════════════════════════════════════════════════════

/** Genera un UUID locale temporaneo (offline). */
function _localId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

/** Struttura lb2 vuota (compatibilità motore di gioco). */
function _buildEmptyLb2() {
  const lb2 = {};
  ['ind', 'sq'].forEach(t => {
    lb2[t] = {};
    ['quiz', 'speed', 'match', 'memory', 'fill'].forEach(a => { lb2[t][a] = {}; });
  });
  return lb2;
}

/** Statistiche vuote (compatibilità). */
function _emptyStats() {
  return { tot: 0, cor: 0, byMod: { CE: { c: 0, w: 0 }, OE: { c: 0, w: 0 } } };
}

/** Fallback lb da localStorage. */
function _loadLbFromCache(classId, type, activity) {
  const cached = _lsGet(lsCourseDataKey(classId), {});
  const bucket = cached.lb2?.[type]?.[activity] || {};
  return Object.entries(bucket).map(([name, data]) => {
    const best = data.entries?.reduce((a, b) => b.pts > a.pts ? b : a, { pts: -1, mod: '?', games: 0 });
    return { name, pts: best.pts, games: best.games, mod: best.mod, color: data.color };
  }).sort((a, b) => b.pts - a.pts);
}

/** Aggiorna statistiche in localStorage (offline). */
function _updateLocalStats(classId, module, correct, wrong) {
  const key = lsCourseDataKey(classId);
  const data = _lsGet(key, {});
  if (!data.stats) data.stats = _emptyStats();
  data.stats.tot += correct + wrong;
  data.stats.cor += correct;
  data.stats.byMod[module] = data.stats.byMod[module] || { c: 0, w: 0 };
  data.stats.byMod[module].c += correct;
  data.stats.byMod[module].w += wrong;
  _lsSet(key, data);
}

// ════════════════════════════════════════════════════════════════════
// COMPATIBILITÀ DROP-IN: saveCourses, save (no-op o già gestiti)
// ════════════════════════════════════════════════════════════════════

/**
 * saveCourses — deprecata, ogni operazione è ora atomica.
 * Mantenuta per compatibilità: scrive solo su localStorage come cache.
 */
export function saveCourses(list) {
  _lsSet(LS_COURSES_KEY, list);
}
/* ── Bootstrap gate: segnala al gioco che il layer db è pronto ── */
(function() {
  if (typeof window !== 'undefined' && typeof window.__resolveDb === 'function') {
    window.__resolveDb();
  }
})();

/**
 * save — compatibilità: scrive il db locale su localStorage.
 * Con Supabase ogni scrittura è già stata fatta atomicamente.
 */
export function saveLocalCache(classId, db) {
  _lsSet(lsCourseDataKey(classId), db);
}
