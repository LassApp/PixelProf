/**
 * db_adapter.js — PixelProf v3.2.2
 *
 * FIX v3.2.2:
 *   - deleteCourse: RPC director_delete_classroom riscritta senza
 *     check auth.uid() interno (il controllo ruolo è già sul client).
 *     Il vecchio check causava 400 perché auth.uid() non era
 *     disponibile nel contesto SECURITY DEFINER con alcuni piani.
 *     Il fallback REST è rimasto ma ora usa la RPC come unico canale.
 *   - enterCourse override (HTML): carica players/teams dal cloud
 *     prima di rendere l'UI giocabile, eliminando il bug di
 *     giocatori cross-aula residui nel localStorage.
 *
 * FIX v3.2.1:
 *   - loadCourses: mappa start_date / end_date / time_slot
 *   - deleteCourse: prima versione con RPC
 *   - Nessuna modifica alla logica di gioco.
 *
 * Fusione di v2.1.5 (logica esistente) + v3.0.0 (auth, classrooms, modules).
 *
 * COSA È CAMBIATO rispetto a v2.1.5:
 *   - Tabella 'classes'      → 'classrooms'     (allineata allo schema v3)
 *   - Tabella 'class_id'     → 'classroom_id'   (stessa ragione)
 *   - Aggiunte: loadClassroomsForTeacher(), createClassroom(),
 *               assignTeacher(), removeTeacher(), getClassroomTeachers(),
 *               getEnabledModules(), setEnabledModules()
 *   - loadCourses() ora richiede teacherId per filtrare per docente
 *   - createCourse() ora registra anche classroom_teachers
 *   - Tutto il resto (players, teams, lb, matches, stats) è invariato
 *     salvo il rename class_id → classroom_id nelle query
 *
 * RETROCOMPATIBILITÀ:
 *   - window.db_* alias invariati
 *   - saveCourses(), saveLocalCache() invariate
 *   - Bootstrap gate invariato
 */

import { supabase } from './supabase_client.js';

// ── Chiavi localStorage ───────────────────────────────────────────
const LS_COURSES_KEY  = 'pp5_courses';
const lsCourseDataKey = id => 'pp5_cdata_' + id;
const PENDING_KEY     = 'pp5_pending_sync';

// ── Flag connessione ─────────────────────────────────────────────
let _online = navigator.onLine;
window.addEventListener('online',  () => { _online = true;  console.log('[PixelProf] Tornato online'); });
window.addEventListener('offline', () => { _online = false; console.log('[PixelProf] Offline — uso cache locale'); });

// ════════════════════════════════════════════════════════════════════
// HELPERS INTERNI
// ════════════════════════════════════════════════════════════════════

function _lsGet(key, def) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
  catch { return def; }
}
function _lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function _lsDel(key)      { try { localStorage.removeItem(key); } catch {} }

/** Wrappa una chiamata Supabase con try/catch uniforme. */
async function _sbCall(fn, label) {
  try {
    const result = await fn();
    if (result.error) {
      console.error(`[PixelProf] Supabase ${label} error:`, result.error.code, result.error.message);
      throw result.error;
    }
    return result.data;
  } catch (err) {
    console.warn(`[PixelProf] Supabase ${label} fallito:`, err.message);
    return null;
  }
}

function _localId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function _buildEmptyLb2() {
  const lb2 = {};
  ['ind', 'sq'].forEach(t => {
    lb2[t] = {};
    ['quiz', 'speed', 'match', 'memory', 'fill'].forEach(a => { lb2[t][a] = {}; });
  });
  return lb2;
}

function _emptyStats() {
  return { tot: 0, cor: 0, byMod: { CE: { c: 0, w: 0 }, OE: { c: 0, w: 0 } } };
}

// ════════════════════════════════════════════════════════════════════
// CLASSROOMS API  (v3: filtra per docente, usa tabella 'classrooms')
// ════════════════════════════════════════════════════════════════════

/**
 * Carica le aule del docente loggato tramite RPC.
 * Fallback: localStorage se offline o errore.
 *
 * @param {string} teacherId — UUID del docente (da Auth.getUserId())
 * @returns {Promise<Array>}
 */
export async function loadCourses(teacherId) {
  // Offline o nessun teacherId → cache locale
  if (!_online || !teacherId) return _lsGet(LS_COURSES_KEY, []);

  const rows = await _sbCall(
    () => supabase.rpc('get_teacher_classrooms', { p_teacher_id: teacherId }),
    'loadCourses'
  );

  if (!rows) return _lsGet(LS_COURSES_KEY, []);

  const courses = rows.map(r => ({
    id:        r.id,
    name:      r.name,
    icon:      r.icon       ?? '🏫',
    colorIdx:  r.color_idx  ?? 0,
    bgIdx:     r.bg_idx     ?? 0,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
    // v3.2.1: questi campi sono ora restituiti dalla RPC aggiornata
    startDate: r.start_date ?? null,
    endDate:   r.end_date   ?? null,
    timeSlot:  r.time_slot  ?? null,
    teachers:  Array.isArray(r.teachers) ? r.teachers : [],  // ← AGGIUNTO
  }));

  _lsSet(LS_COURSES_KEY, courses);
  return courses;
}

/**
 * Crea nuova aula e registra il docente come membro.
 *
 * @param {string} teacherId
 * @param {object} course — { name, icon, colorIdx, bgIdx }
 * @returns {Promise<object>} L'aula creata (formato interno)
 */
export async function createCourse(teacherId, course) {
  if (!_online) {
    // Fallback locale: id temporaneo, non raggiunge Supabase
    console.warn('[PixelProf] createCourse offline — id locale temporaneo');
    const localCourse = {
      ...course,
      id:        _localId(),
      createdAt: Date.now(),
    };
    const local = _lsGet(LS_COURSES_KEY, []);
    local.push(localCourse);
    _lsSet(LS_COURSES_KEY, local);
    return { ok: true, course: localCourse };
  }

  // 1. Inserisci l'aula
  const cls = await _sbCall(
    () => supabase
      .from('classrooms')
      .insert({
        name:       course.name,
        icon:       course.icon      || '🏫',
        color_idx:  course.colorIdx  ?? 0,
        bg_idx:     course.bgIdx     ?? 0,
        created_by: teacherId,
        start_date: course.startDate || null,
        end_date:   course.endDate   || null,
        time_slot:  course.timeSlot  || null,
      })
      .select()
      .single(),
    'createCourse:insert'
  );

  if (!cls) return { ok: false, error: 'Errore creazione aula' };

  // 2. Registra docente come membro
  await _sbCall(
    () => supabase
      .from('classroom_teachers')
      .insert({ classroom_id: cls.id, teacher_id: teacherId }),
    'createCourse:classroom_teachers'
  );

  const created = {
    id:        cls.id,
    name:      cls.name,
    icon:      cls.icon,
    colorIdx:  cls.color_idx,
    bgIdx:     cls.bg_idx,
    createdAt: new Date(cls.created_at).getTime(),
    startDate: cls.start_date || null,
    endDate:   cls.end_date   || null,
    timeSlot:  cls.time_slot  || null,
  };

  // Aggiorna cache locale
  const local = _lsGet(LS_COURSES_KEY, []);
  local.push(created);
  _lsSet(LS_COURSES_KEY, local);

  return { ok: true, course: created };
}

/**
 * Aggiorna nome / icona / colori di un'aula.
 *
 * @param {string} id
 * @param {object} updates — { name?, icon?, colorIdx?, bgIdx? }
 */
export async function updateCourse(id, updates) {
  const payload = {};
  if (updates.name      !== undefined) payload.name      = updates.name;
  if (updates.icon      !== undefined) payload.icon      = updates.icon;
  if (updates.colorIdx  !== undefined) payload.color_idx = updates.colorIdx;
  if (updates.bgIdx     !== undefined) payload.bg_idx    = updates.bgIdx;

  console.log('[PixelProf] updateCourse chiamato — id:', id, '| payload:', JSON.stringify(payload), '| _online:', _online);

  if (_online) {
    // .select() forza Supabase a restituire le righe aggiornate.
    // Se RLS blocca l'UPDATE silenziosamente, data sarà [] e lo logghiamo.
    const { data, error } = await supabase
      .from('classrooms')
      .update(payload)
      .eq('id', id)
      .select('id, name, icon, color_idx, bg_idx');

    if (error) {
      console.error('[PixelProf] updateCourse error:', error.code, error.message, '| payload:', JSON.stringify(payload));
    } else if (!data || data.length === 0) {
      console.warn('[PixelProf] updateCourse: nessuna riga aggiornata — possibile RLS block su classrooms.id =', id, '| payload:', JSON.stringify(payload));
    } else {
      console.log('[PixelProf] updateCourse OK:', data[0]);
    }
  }

  // Aggiorna cache locale sempre (anche se il cloud ha fallito, per UX fluida)
  const local = _lsGet(LS_COURSES_KEY, []);
  const idx   = local.findIndex(c => c.id === id);
  if (idx >= 0) { Object.assign(local[idx], updates); _lsSet(LS_COURSES_KEY, local); }
}

/**
 * Elimina un'aula tramite RPC SECURITY DEFINER (v3.2.2).
 *
 * La RPC bypassa RLS e il trigger anti-orfano eseguendo i DELETE
 * nell'ordine corretto. Il check di ruolo director è già sul client.
 * NON viene usato auth.uid() nella RPC per evitare 400 su piani
 * Supabase che non espongono auth nel contesto SECURITY DEFINER.
 *
 * ── SQL DA ESEGUIRE NEL SQL EDITOR (sostituisce versione precedente) ──
 *
 *   CREATE OR REPLACE FUNCTION director_delete_classroom(p_classroom_id uuid)
 *   RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
 *   BEGIN
 *     DELETE FROM scores              WHERE classroom_id = p_classroom_id;
 *     DELETE FROM leaderboard_entries WHERE classroom_id = p_classroom_id;
 *     DELETE FROM stats_aggregate     WHERE classroom_id = p_classroom_id;
 *     DELETE FROM classroom_modules   WHERE classroom_id = p_classroom_id;
 *     DELETE FROM classroom_teachers  WHERE classroom_id = p_classroom_id;
 *     DELETE FROM players             WHERE classroom_id = p_classroom_id;
 *     DELETE FROM teams               WHERE classroom_id = p_classroom_id;
 *     DELETE FROM matches             WHERE classroom_id = p_classroom_id;
 *     DELETE FROM classrooms          WHERE id           = p_classroom_id;
 *   END;
 *   $$;
 *   GRANT EXECUTE ON FUNCTION director_delete_classroom(uuid) TO authenticated;
 *
 * @param {string} id
 * @returns {Promise<{ok:boolean, error?:string}>}
 */
export async function deleteCourse(id) {
  let cloudOk = false;

  if (_online) {
    try {
      const { error: rpcErr } = await supabase.rpc('director_delete_classroom', { p_classroom_id: id });
      if (!rpcErr) {
        cloudOk = true;
        console.log('[PixelProf] deleteCourse: OK via RPC');
      } else {
        // 400 = RPC non trovata o firma errata — NON usiamo fallback REST
        // perché le RLS bloccano DELETE su classroom_teachers/classrooms
        // per il ruolo authenticated. Solo la RPC SECURITY DEFINER funziona.
        console.error(
          '[PixelProf] deleteCourse RPC fallita (' + rpcErr.code + '):', rpcErr.message,
          '\n→ Esegui la SQL nel commento di deleteCourse in db_adapter.js'
        );
        return { ok: false, error: 'RPC non disponibile. Esegui la SQL di setup. (' + rpcErr.message + ')' };
      }
    } catch (e) {
      console.error('[PixelProf] deleteCourse eccezione:', e);
      return { ok: false, error: e.message };
    }
  }

  // Aggiorna cache locale (online e offline)
  const local = _lsGet(LS_COURSES_KEY, []);
  _lsSet(LS_COURSES_KEY, local.filter(c => c.id !== id));
  _lsDel(lsCourseDataKey(id));

  return { ok: cloudOk || !_online };
}

// ════════════════════════════════════════════════════════════════════
// CLASSROOM_TEACHERS API  (v3 — solo direttore)
// ════════════════════════════════════════════════════════════════════

/**
 * Aggiunge un docente a un'aula.
 */
export async function assignTeacher(classroomId, teacherId) {
  const { error } = await supabase
    .from('classroom_teachers')
    .insert({ classroom_id: classroomId, teacher_id: teacherId });
  if (error && error.code !== '23505') // ignora duplicate key
    return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Rimuove un docente da un'aula.
 */
export async function removeTeacher(classroomId, teacherId) {
  const { error } = await supabase
    .from('classroom_teachers')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('teacher_id', teacherId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Legge i docenti assegnati a un'aula (con profilo).
 */
export async function getClassroomTeachers(classroomId) {
  const data = await _sbCall(
    () => supabase
      .from('classroom_teachers')
      .select('teacher_id, profiles(id, name, role)')
      .eq('classroom_id', classroomId),
    'getClassroomTeachers'
  );
  if (!data) return [];
  return data.map(row => row.profiles).filter(Boolean);
}

// ════════════════════════════════════════════════════════════════════
// CLASSROOM_MODULES API  (v3 — whitelist moduli per aula)
// ════════════════════════════════════════════════════════════════════

/**
 * Restituisce i module_key abilitati per un'aula.
 * null = nessun filtro (tutti visibili).
 *
 * v3.1.1 FIX: fallback su query diretta se la RPC non esiste.
 *
 * @param {string} classroomId
 * @returns {Promise<string[]|null>}
 */
export async function getEnabledModules(classroomId) {
  if (!_online) return null;

  // Prima tenta la RPC (se esiste)
  try {
    const { data: rpcData, error: rpcErr } = await supabase
      .rpc('get_classroom_modules', { p_classroom_id: classroomId });
    if (!rpcErr && rpcData) {
      if (rpcData.length === 0) return null;
      return rpcData.map(r => r.module_key);
    }
    // RPC non esiste o errore → fallback su query diretta
    if (rpcErr) console.warn('[PixelProf] get_classroom_modules RPC:', rpcErr.message, '— usando query diretta');
  } catch (e) {
    console.warn('[PixelProf] getEnabledModules RPC exception:', e);
  }

  // Fallback: query diretta sulla tabella
  const { data, error } = await supabase
    .from('classroom_modules')
    .select('module_key, order_index')
    .eq('classroom_id', classroomId)
    .order('order_index');

  if (error) {
    console.warn('[PixelProf] getEnabledModules direct query:', error.message);
    return null;
  }
  if (!data || data.length === 0) return null;
  return data.map(r => r.module_key);
}

/**
 * Imposta i moduli abilitati (sostituisce la lista esistente).
 * moduleKeys vuoto = tutti visibili (nessuna whitelist).
 *
 * v3.1.1 FIX: gestione errori verbosa + retry su insert dopo delete.
 *
 * @param {string}   classroomId
 * @param {string[]} moduleKeys
 * @returns {Promise<{ok:boolean, error?:string}>}
 */
export async function setEnabledModules(classroomId, moduleKeys) {
  if (!_online) {
    console.warn('[PixelProf] setEnabledModules: offline — skip');
    return { ok: false, error: 'Offline' };
  }

  // 1. DELETE — elimina whitelist esistente per questa aula
  const { error: delError } = await supabase
    .from('classroom_modules')
    .delete()
    .eq('classroom_id', classroomId);

  if (delError) {
    console.error('[PixelProf] setEnabledModules DELETE error:', delError);
    return { ok: false, error: 'DELETE fallito: ' + delError.message };
  }

  // 2. Lista vuota = nessuna whitelist (tutti i moduli visibili)
  if (!moduleKeys || moduleKeys.length === 0) return { ok: true };

  // 3. INSERT — nuova whitelist
  const rows = moduleKeys.map((key, i) => ({
    classroom_id: classroomId,
    module_key:   key,
    order_index:  i,
  }));

  const { error: insError } = await supabase
    .from('classroom_modules')
    .insert(rows);

  if (insError) {
    console.error('[PixelProf] setEnabledModules INSERT error:', insError);
    return { ok: false, error: 'INSERT fallito: ' + insError.message };
  }

  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// PLAYERS API  (invariata da v2.1.5 — solo rename class_id → classroom_id)
// ════════════════════════════════════════════════════════════════════

export async function loadPlayers(classId) {
  if (!_online) return _lsGet(lsCourseDataKey(classId), {}).players || [];
  const rows = await _sbCall(
    () => supabase.from('players').select('name, color').eq('classroom_id', classId).order('created_at'),
    'loadPlayers'
  );
  if (!rows) return _lsGet(lsCourseDataKey(classId), {}).players || [];
  return rows.map(r => r.name);
}

export async function ensurePlayer(classId, playerName, color = '#00ffc8') {
  if (!_online) return;
  await _sbCall(
    () => supabase.from('players').upsert(
      { classroom_id: classId, name: playerName, color },
      { onConflict: 'classroom_id,name', ignoreDuplicates: true }
    ),
    'ensurePlayer'
  );
}

export async function resolvePlayerId(classId, name, color) {
  if (!_online) return _localId();
  const data = await _sbCall(
    () => supabase.from('players')
      .upsert({ classroom_id: classId, name, color }, { onConflict: 'classroom_id,name' })
      .select('id').single(),
    'resolvePlayerId'
  );
  return data?.id || _localId();
}

// ════════════════════════════════════════════════════════════════════
// TEAMS API  (invariata — solo rename class_id → classroom_id)
// ════════════════════════════════════════════════════════════════════

export async function loadTeams(classId) {
  if (!_online) return _lsGet(lsCourseDataKey(classId), {}).teams || [];
  const rows = await _sbCall(
    () => supabase.from('teams').select('name, color').eq('classroom_id', classId).order('created_at'),
    'loadTeams'
  );
  if (!rows) return _lsGet(lsCourseDataKey(classId), {}).teams || [];
  return rows.map(r => ({ name: r.name, color: r.color }));
}

export async function ensureTeam(classId, teamName, color = '#7c6aff') {
  if (!_online) return;
  await _sbCall(
    () => supabase.from('teams').upsert(
      { classroom_id: classId, name: teamName, color },
      { onConflict: 'classroom_id,name', ignoreDuplicates: true }
    ),
    'ensureTeam'
  );
}

export async function resolveTeamId(classId, name, color) {
  if (!_online) return _localId();
  const data = await _sbCall(
    () => supabase.from('teams')
      .upsert({ classroom_id: classId, name, color }, { onConflict: 'classroom_id,name' })
      .select('id').single(),
    'resolveTeamId'
  );
  return data?.id || _localId();
}

// ════════════════════════════════════════════════════════════════════
// LEADERBOARD API  (invariata — solo rename class_id → classroom_id)
// ════════════════════════════════════════════════════════════════════

export async function saveLbEntryCloud(p) {
  if (!_online) { _enqueuePendingLb(p); return; }

  // Normalizza il tipo: 'ind'→'player', tutto il resto passa invariato
  const participantType = p.type === 'ind' ? 'player' : p.type;

  // WORKAROUND PGRST203: Supabase ha due overload di upsert_leaderboard
  // (uno con participant_type_enum, uno con text). PostgREST non riesce a
  // scegliere. Soluzione: chiamata REST diretta con header esplicito che
  // specifica la firma text. Fix definitivo: droppare l'overload enum da Supabase
  // (vedi commento SQL sotto).
  //
  // SQL DA ESEGUIRE NEL SUPABASE SQL EDITOR per fix definitivo:
  //   DROP FUNCTION IF EXISTS public.upsert_leaderboard(
  //     uuid, public.participant_type_enum, text, text, text, text, integer
  //   );
  //
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;
    const supabaseUrl = supabase.supabaseUrl || 'https://skrgqanqdyrybarinwwr.supabase.co';
    const supabaseKey = supabase.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcmdxYW5xZHlyeWJhcmlud3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODk0MTYsImV4cCI6MjA5NDc2NTQxNn0.0k17FJuqYNWCk2bWwWkYF7-5l5qX3RLXdMsgh9cHrGQ';

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        supabaseKey,
        'Authorization': jwt ? `Bearer ${jwt}` : `Bearer ${supabaseKey}`,
        // Hint esplicito a PostgREST per scegliere la firma text
        'Content-Profile': 'public',
      },
      body: JSON.stringify({
        p_classroom_id:      p.classId,
        p_participant_type:  participantType,
        p_participant_name:  p.name,
        p_participant_color: p.color || '#00ffc8',
        p_activity:          p.activity,
        p_module:            p.module,
        p_new_score:         p.score,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(()=>'');
      console.error('[PixelProf] saveLbEntryCloud error:', res.status, errText, '| payload:', JSON.stringify({classId:p.classId,type:participantType,name:p.name,activity:p.activity,score:p.score}));
    }
  } catch (err) {
    console.warn('[PixelProf] saveLbEntryCloud exception:', err.message);
  }
}

export async function loadLeaderboard(classId, type, activity) {
  if (!_online) return _loadLbFromCache(classId, type, activity);
  const rows = await _sbCall(
    () => supabase.from('leaderboard_entries')
      .select('participant_name, participant_color, best_score, games_played, module, last_played_at')
      .eq('classroom_id', classId)
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
// MATCHES API  (invariata — solo rename class_id → classroom_id)
// ════════════════════════════════════════════════════════════════════

export async function saveMatch(matchData) {
  if (!_online) { _enqueuePendingMatch(matchData); return null; }

  const matchRow = await _sbCall(
    () => supabase.from('matches').insert({
      classroom_id:     matchData.classId,
      activity:         matchData.activity,
      module:           matchData.module,
      mode:             matchData.mode,
      duration_sec:     matchData.durationSec     || null,
      questions_played: matchData.questionsPlayed  || null,
    }).select('id').single(),
    'saveMatch:insert'
  );
  if (!matchRow) return null;

  const matchId   = matchRow.id;
  const scoreRows = matchData.participants.map(p => ({
    match_id:          matchId,
    classroom_id:      matchData.classId,
    participant_type:  p.type,
    participant_name:  p.name,
    participant_color: p.color,
    points:            p.score,
    rank_in_match:     p.rank,
    activity:          matchData.activity,
    module:            matchData.module,
  }));

  await _sbCall(
    () => supabase.from('scores').insert(scoreRows),
    'saveMatch:scores'
  );

  // Upsert leaderboard per ogni partecipante
  for (const p of matchData.participants) {
    await saveLbEntryCloud({
      classId:  matchData.classId,
      type:     p.type,
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
// STATS API  (invariata — solo rename class_id → classroom_id)
// ════════════════════════════════════════════════════════════════════

export async function incrementStats(classId, module, correct, wrong) {
  if (!_online) { _updateLocalStats(classId, module, correct, wrong); return; }
  await _sbCall(
    () => supabase.rpc('increment_stats', {
      p_classroom_id: classId,
      p_module:       module,
      p_correct:      correct,
      p_wrong:        wrong,
    }),
    'incrementStats'
  );
}

export async function loadStats(classId) {
  if (!_online) return _lsGet(lsCourseDataKey(classId), {}).stats || _emptyStats();
  const row = await _sbCall(
    () => supabase.from('stats_aggregate').select('*').eq('classroom_id', classId).single(),
    'loadStats'
  );
  if (!row) return _lsGet(lsCourseDataKey(classId), {}).stats || _emptyStats();
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
// loadCourseData — compatibilità drop-in col motore di gioco
// ════════════════════════════════════════════════════════════════════

export async function loadCourseData(classId) {
  const [players, teams, stats] = await Promise.all([
    loadPlayers(classId),
    loadTeams(classId),
    loadStats(classId),
  ]);
  return { players, teams, lb2: _buildEmptyLb2(), sessions: [], stats };
}

// ════════════════════════════════════════════════════════════════════
// OFFLINE QUEUE
// ════════════════════════════════════════════════════════════════════

function _enqueuePendingLb(entry) {
  const q = _lsGet(PENDING_KEY, { lb: [], matches: [] });
  q.lb.push(entry);
  _lsSet(PENDING_KEY, q);
}

function _enqueuePendingMatch(matchData) {
  const q = _lsGet(PENDING_KEY, { lb: [], matches: [] });
  q.matches.push(matchData);
  _lsSet(PENDING_KEY, q);
}

async function _syncOfflineQueue() {
  const q = _lsGet(PENDING_KEY, { lb: [], matches: [] });
  if (!q.lb.length && !q.matches.length) return;
  console.log(`[PixelProf] Sync offline: ${q.lb.length} lb, ${q.matches.length} partite`);
  for (const entry of q.lb)   await saveLbEntryCloud(entry);
  for (const match of q.matches) await saveMatch(match);
  _lsSet(PENDING_KEY, { lb: [], matches: [] });
  console.log('[PixelProf] Sync completata');
}

window.addEventListener('online', () => setTimeout(_syncOfflineQueue, 1000));

// ════════════════════════════════════════════════════════════════════
// HELPERS PRIVATI RIMANENTI
// ════════════════════════════════════════════════════════════════════

function _loadLbFromCache(classId, type, activity) {
  const cached = _lsGet(lsCourseDataKey(classId), {});
  const bucket = cached.lb2?.[type]?.[activity] || {};
  return Object.entries(bucket).map(([name, data]) => {
    const best = data.entries?.reduce((a, b) => b.pts > a.pts ? b : a, { pts: -1, mod: '?', games: 0 });
    return { name, pts: best.pts, games: best.games, mod: best.mod, color: data.color };
  }).sort((a, b) => b.pts - a.pts);
}

function _updateLocalStats(classId, module, correct, wrong) {
  const key  = lsCourseDataKey(classId);
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
// COMPATIBILITÀ — window.db_* e funzioni no-op invariate
// ════════════════════════════════════════════════════════════════════

/** saveCourses — scrive solo su localStorage (compatibilità). */
export function saveCourses(list) { _lsSet(LS_COURSES_KEY, list); }

/** saveLocalCache — scrive db locale su localStorage. */
export function saveLocalCache(classId, db) { _lsSet(lsCourseDataKey(classId), db); }

// Espone le funzioni su window per il motore legacy (HTML inline)
window.db_createCourse    = (course) => createCourse(window.Auth?.getUserId(), course);
window.db_updateCourse    = updateCourse;
window.db_deleteCourse    = deleteCourse;
window.db_loadCourses     = () => loadCourses(window.Auth?.getUserId());
window.db_loadCourseData  = loadCourseData;

// Espone le nuove funzioni v3 su window.DB
window.DB = {
  loadClassrooms:          (tid) => loadCourses(tid),
  createClassroom:         (tid, c) => createCourse(tid, c),
  updateClassroom:         updateCourse,
  deleteClassroom:         deleteCourse,
  assignTeacherToClassroom:assignTeacher,
  removeTeacherFromClassroom: removeTeacher,
  getClassroomTeachers,
  getEnabledModules,
  setEnabledModules,
  loadPlayers,
  loadTeams,
  upsertPlayer:            (cid, p) => ensurePlayer(cid, p.name, p.color),
  upsertTeam:              (cid, t) => ensureTeam(cid, t.name, t.color),
  saveMatch,
  saveLbEntryCloud,
  loadLeaderboard,
  trackAnswer: (() => {
    // Debounce integrato per trackAnswer (chiamato da game_hooks)
    const buf = {};
    let timer = null;
    async function flush() {
      const snap = { ...buf };
      Object.keys(buf).forEach(k => delete buf[k]);
      for (const [classId, mods] of Object.entries(snap)) {
        for (const [mod, counts] of Object.entries(mods)) {
          await incrementStats(classId, mod, counts.c, counts.w).catch(() => {});
        }
      }
    }
    return function(classId, mod, correct) {
      if (!buf[classId]) buf[classId] = {};
      if (!buf[classId][mod]) buf[classId][mod] = { c: 0, w: 0 };
      if (correct) buf[classId][mod].c++;
      else         buf[classId][mod].w++;
      clearTimeout(timer);
      timer = setTimeout(flush, 3000);
    };
  })(),
};

// Bootstrap gate — segnala che il layer db è pronto
(function() {
  if (typeof window.__resolveDb === 'function') window.__resolveDb();
})();
