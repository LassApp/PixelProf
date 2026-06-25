/**
 * auth.js — PixelProf v6.1.0
 *
 * v6.1.0 — Redesign "Gestione Docenti" (solo UI/UX, vedi riepilogo):
 *   - listTeachers() seleziona ora anche 'genere'. RICHIEDE la migrazione SQL
 *     (consegnata a parte): ALTER TABLE public.profiles ADD COLUMN IF NOT
 *     EXISTS genere text CHECK (genere IN ('uomo','donna')). Finché la colonna
 *     non esiste, Supabase erra in SELECT — stesso comportamento fail-soft già
 *     visto con 'active': i chiamanti vanno verificati dopo la migrazione.
 *   - updateTeacherProfile() accetta ora anche updates.genere e chiama la
 *     NUOVA RPC director_update_teacher_profile(p_teacher_id, p_name, p_genere)
 *     al posto della precedente director_update_teacher_name (vedi SQL
 *     consegnata). genere è opzionale — se omesso il valore esistente è
 *     preservato lato DB (COALESCE).
 *   - Nuova funzione listTeacherEmails(): legge le email reali dei docenti
 *     (vivono in auth.users, non in profiles) tramite una NUOVA Edge Function
 *     opzionale 'list_teacher_emails' (Admin API, stesso pattern di
 *     update_teacher_email). Se non deployata, fallisce in silenzio e la UI
 *     mostra un placeholder — nessuna funzionalità esistente ne dipende.
 *
 * auth.js — PixelProf v3.2.0
 *
 * v3.2.0 — Dashboard Direttore (Gestione Docenti):
 *   - _loadProfile / listTeachers selezionano ora anche la colonna 'active'.
 *     RICHIEDE la migrazione SQL (consegnata a parte):
 *       ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
 *     Finché la colonna non esiste, Supabase la ignora/erra in SELECT — in tal
 *     caso _currentProfile.active resta undefined e il codice tratta undefined
 *     come "attivo" (fail-open): nessun docente esistente viene bloccato
 *     accidentalmente prima di eseguire la migrazione.
 *   - login(): dopo il caricamento profilo, se active===false forza il logout e
 *     restituisce errore "Account disabilitato" — blocco lato client, nessuna
 *     Edge Function richiesta.
 *   - listTeachers(includeInactive=false): retrocompatibile — i chiamanti
 *     esistenti (wizard aula, pannello direttore) continuano a vedere SOLO i
 *     docenti attivi senza alcuna modifica al loro codice.
 *   - Nuove funzioni: updateTeacherProfile(), setTeacherActive().
 *   - NOTA: la modifica dell'email docente NON è implementata qui. Richiede
 *     l'Admin API di Supabase (service role) via una Edge Function dedicata,
 *     non presente in questo repo. Vedi riepilogo consegnato per i dettagli.
 *
 * auth.js — PixelProf v3.1.3
 *
 * FIX v3.1.3 — Invite flow bloccato su spinner:
 *
 *   PROBLEMA 1: con type=invite Supabase emette SIGNED_IN (non PASSWORD_RECOVERY).
 *     Il vecchio guard "if (needs && !_needsPasswordSetup)" impediva di chiamare
 *     __onPasswordRecovery se il flag era già true da init() — spinner infinito.
 *     FIX: rimosso il guard, __onPasswordRecovery viene sempre chiamato se needs=true
 *          e lo screen non è già visibile.
 *
 *   PROBLEMA 2: setPassword() chiamava _loadProfile() con _profileLoaded=false ma
 *     poi USER_UPDATED faceva skip perché _profileLoaded era già true dopo setPassword.
 *     FIX: setPassword() NON chiama più _loadProfile() direttamente.
 *          Il profilo viene caricato solo in USER_UPDATED (unica fonte di verità).
 *          __onPasswordSet viene chiamato solo dal listener USER_UPDATED.
 *
 *   PROBLEMA 3: _checkNeedsPassword() usava logiche fragili su created_at/updated_at
 *     che non sono affidabili su tutti i piani Supabase.
 *     FIX: semplificato — controlla SOLO user_metadata.needs_password.
 *
 *   PROBLEMA 4: race condition _profileLoaded tra init() e onAuthStateChange.
 *     FIX: _profileLoaded viene resettato a false a ogni SIGNED_IN/PASSWORD_RECOVERY.
 *
 *   PROBLEMA 5 (v3.1.3): USER_UPDATED non sempre scatta con type=invite.
 *     FIX: esposto checkSession() per polling esterno + aggiornamento _currentUser
 *          anche da USER_UPDATED anche se _profileLoaded era già true.
 */

import { supabase } from './supabase_client.js';

// ── State interno ────────────────────────────────────────────────
let _currentUser        = null;
let _currentProfile     = null;
let _profileLoaded      = false;
let _needsPasswordSetup = false;

// ── Guard anti-doppio-trigger per onPasswordRecovery ─────────────
let _recoveryScreenShown = false;

// ════════════════════════════════════════════════════════════════════
// HELPERS PRIVATI
// ════════════════════════════════════════════════════════════════════

/**
 * Controlla se l'utente deve ancora impostare una password.
 * Controlla SOLO il metadata esplicito settato dall'Edge Function.
 */
function _checkNeedsPassword(user) {
  if (!user) return false;
  return user.user_metadata?.needs_password === true;
}

/**
 * Carica il profilo da Supabase.
 * Forza il reload se force=true (usato dopo USER_UPDATED).
 */
async function _loadProfile(userId, force = false) {
  if (_profileLoaded && !force) return;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, active')
      .eq('id', userId)
      .single();
    if (!error && data) {
      _currentProfile = data;
      _profileLoaded  = true;
      console.log('[Auth] Profilo caricato:', _currentProfile);
    } else {
      console.warn('[Auth] _loadProfile errore:', error?.message);
    }
  } catch (err) {
    console.warn('[Auth] _loadProfile eccezione:', err.message);
  }
}

/**
 * Mostra lo screen "imposta password" — chiamato UNA SOLA VOLTA.
 */
function _triggerPasswordRecovery() {
  if (_recoveryScreenShown) return;
  _recoveryScreenShown = true;
  if (typeof window.__onPasswordRecovery === 'function') {
    window.__onPasswordRecovery();
  }
}

// ════════════════════════════════════════════════════════════════════
// INIT — eseguito all'avvio del modulo
// ════════════════════════════════════════════════════════════════════
async function init() {
  // Leggi la sessione corrente (può essere già presente via URL hash)
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    _currentUser = session.user;
    _needsPasswordSetup = _checkNeedsPassword(session.user);
    if (!_needsPasswordSetup) {
      await _loadProfile(session.user.id);
    }
    // Non triggeriamo __onPasswordRecovery qui: lo farà onAuthStateChange
    // che viene emesso subito dopo getSession() in modo sincrono.
  }

  // ── Listener eventi Supabase ─────────────────────────────────────
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[Auth] onAuthStateChange:', event, session?.user?.email);

    // ── PASSWORD_RECOVERY: reset password / magic link classico ──
    if (event === 'PASSWORD_RECOVERY') {
      _currentUser        = session?.user ?? _currentUser;
      _needsPasswordSetup = true;
      _profileLoaded      = false;
      _triggerPasswordRecovery();
      return;
    }

    // ── SIGNED_IN: login normale O primo accesso via invite ───────
    if (event === 'SIGNED_IN' && session?.user) {
      _currentUser = session.user;
      const needs  = _checkNeedsPassword(session.user);

      if (needs) {
        // Primo accesso via link invite → mostra screen imposta password
        _needsPasswordSetup = true;
        _profileLoaded      = false;
        _triggerPasswordRecovery();
      } else {
        // Login normale
        _needsPasswordSetup = false;
        await _loadProfile(session.user.id);
      }
      return;
    }

    // ── USER_UPDATED: password impostata con successo ─────────────
    if (event === 'USER_UPDATED' && session?.user) {
      _currentUser        = session.user;
      _needsPasswordSetup = false;
      _profileLoaded      = false;      // forza reload profilo aggiornato
      _recoveryScreenShown = false;     // reset guard per eventuali sessioni future

      await _loadProfile(session.user.id, true);

      // Notifica l'app → entra nell'app
      if (typeof window.__onPasswordSet === 'function') {
        window.__onPasswordSet();
      }
      return;
    }

    // ── SIGNED_OUT ────────────────────────────────────────────────
    if (event === 'SIGNED_OUT') {
      _currentUser         = null;
      _currentProfile      = null;
      _profileLoaded       = false;
      _needsPasswordSetup  = false;
      _recoveryScreenShown = false;
    }
  });
}

// ════════════════════════════════════════════════════════════════════
// LOGIN — email + password
// ════════════════════════════════════════════════════════════════════
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  // onAuthStateChange SIGNED_IN caricherà il profilo in modo asincrono.
  // Attende brevemente (max ~1s) che _loadProfile completi, poi verifica
  // il flag 'active'. Se la colonna non esiste ancora (pre-migrazione),
  // active resta undefined → fail-open, nessun blocco (vedi header v3.2.0).
  for (let i = 0; i < 10 && !_profileLoaded; i++) {
    await new Promise(r => setTimeout(r, 100));
  }
  if (_currentProfile && _currentProfile.active === false) {
    await supabase.auth.signOut();
    _currentUser = null; _currentProfile = null; _profileLoaded = false;
    return { ok: false, error: 'Account disabilitato. Contatta il direttore.' };
  }
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// SET PASSWORD — usata dallo screen onboarding
//
// NON chiama più _loadProfile() né __onPasswordSet() direttamente.
// Tutto viene gestito dall'evento USER_UPDATED in onAuthStateChange.
// ════════════════════════════════════════════════════════════════════
async function setPassword(newPassword) {
  if (!_currentUser) return { ok: false, error: 'Nessun utente attivo. Ricarica la pagina.' };
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'Password troppo corta (minimo 6 caratteri).' };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
    data:     { needs_password: false },   // rimuove il flag dal metadata
  });

  if (error) return { ok: false, error: error.message };

  // Aggiorna _currentUser e metadata immediatamente dalla risposta
  if (data?.user) {
    _currentUser        = data.user;
    _needsPasswordSetup = false;   // aggiornamento immediato — non aspettiamo USER_UPDATED
  }

  // Il listener USER_UPDATED (se scatta) chiamerà __onPasswordSet()
  // Il polling nel HTML userà checkSession() come meccanismo di backup
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// CHECK SESSION — polling: verifica se needs_password è cambiato
// Usato da doSetPassword() nel HTML come meccanismo di backup
// quando USER_UPDATED non scatta (problema noto con type=invite).
// ════════════════════════════════════════════════════════════════════
async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;
    // Aggiorna _currentUser con i dati più recenti dal server
    _currentUser = session.user;
    return session.user;
  } catch (e) {
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════════
async function logout() {
  await supabase.auth.signOut();
  _currentUser         = null;
  _currentProfile      = null;
  _profileLoaded       = false;
  _needsPasswordSetup  = false;
  _recoveryScreenShown = false;
}

// ════════════════════════════════════════════════════════════════════
// INVITA DOCENTE (via Edge Function)
// ════════════════════════════════════════════════════════════════════
async function inviteTeacher(email, name) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { ok: false, error: 'Sessione non valida' };
    const res = await fetch(
      'https://skrgqanqdyrybarinwwr.supabase.co/functions/v1/invite_teacher',
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey':        supabase.supabaseKey,
        },
        body: JSON.stringify({ email, name: name || email }),
      }
    );
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════════════
// CAMBIA EMAIL DOCENTE — v6.0.1 (via Edge Function, Admin API)
//
// L'email vive in auth.users, non in profiles — non è raggiungibile
// con un semplice UPDATE lato client (serve la service_role key).
// Richiede il deploy della Edge Function 'update_teacher_email'
// (vedi supabase/functions/update_teacher_email/index.ts consegnata
// a parte). Stesso pattern di chiamata di inviteTeacher().
// ════════════════════════════════════════════════════════════════════
async function updateTeacherEmail(teacherId, newEmail) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { ok: false, error: 'Sessione non valida' };
    const res = await fetch(
      'https://skrgqanqdyrybarinwwr.supabase.co/functions/v1/update_teacher_email',
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey':        supabase.supabaseKey,
        },
        body: JSON.stringify({ teacherId, newEmail }),
      }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status} — ${txt || 'Edge Function non disponibile (deploy necessario?)'}` };
    }
    return await res.json();
  } catch (err) {
    // Un fetch bloccato da CORS (perché l'endpoint non esiste ancora —
    // la function non è stata deployata) arriva qui come generico
    // "TypeError: Failed to fetch", senza alcun dettaglio HTTP utile.
    // Lo riconosciamo e diamo un messaggio azionabile invece del crudo
    // errore del browser.
    const isNetworkFailure = err instanceof TypeError;
    const msg = isNetworkFailure
      ? 'Edge Function "update_teacher_email" non raggiungibile. Verifica di averla deployata su Supabase (supabase functions deploy update_teacher_email) — vedi il file .ts consegnato.'
      : err.message;
    return { ok: false, error: msg };
  }
}

// ════════════════════════════════════════════════════════════════════
// LISTA DOCENTI
// v3.2.0: includeInactive=false (default) → filtra i docenti disattivati.
// Retrocompatibile: tutti i chiamanti esistenti (wizard, pannello direttore)
// non passano alcun argomento e continuano a vedere solo i docenti attivi.
// ════════════════════════════════════════════════════════════════════
async function listTeachers(includeInactive = false) {
  if (!isDirector()) return [];
  try {
    let q = supabase
      .from('profiles')
      .select('id, name, role, active, genere')
      .eq('role', 'teacher')
      .order('name');
    if (!includeInactive) q = q.eq('active', true);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Auth] listTeachers fallito:', err.message);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════
// GESTIONE DOCENTI — v3.2.0 (Dashboard Direttore)
// ════════════════════════════════════════════════════════════════════

/**
 * Aggiorna i campi modificabili di un docente: 'name' e, dalla v6.1.0,
 * anche 'genere' (uomo|donna). L'email richiede l'Admin API di Supabase
 * (vedi updateTeacherEmail) e NON passa da qui.
 *
 * v3.2.1 FIX: l'UPDATE diretto su 'profiles' falliva in silenzio — le
 * policy RLS di default permettono a un utente di scrivere solo sulla
 * PROPRIA riga (auth.uid() = id), quindi un Direttore che tentava di
 * rinominare un ALTRO profilo veniva bloccato da RLS. Supabase NON
 * restituisce errore in questo caso (riga semplicemente invisibile
 * all'UPDATE) — il client riceveva {ok:true} ma zero righe erano state
 * realmente modificate. STESSO bug-pattern di updateCourse/classrooms.
 *
 * v6.1.0: la vecchia RPC director_update_teacher_name (solo nome) è
 * sostituita da director_update_teacher_profile(p_teacher_id, p_name,
 * p_genere), che aggiorna entrambi i campi in una sola chiamata —
 * stesso pattern SECURITY DEFINER, stessa semantica di errore
 * (RAISE EXCEPTION se zero righe aggiornate). Vedi SQL consegnata.
 * updates.genere è opzionale: se assente/null, il valore esistente
 * lato DB viene preservato (COALESCE nella RPC).
 */
async function updateTeacherProfile(teacherId, updates) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  const name = (updates.name ?? '').trim();
  if (!name) return { ok: false, error: 'Nessun campo da aggiornare' };
  const genere = updates.genere === 'uomo' || updates.genere === 'donna' ? updates.genere : null;
  try {
    const { error } = await supabase.rpc('director_update_teacher_profile', {
      p_teacher_id: teacherId,
      p_name: name,
      p_genere: genere,
    });
    if (error) {
      console.error('[Auth] director_update_teacher_profile RPC error — code:', error.code, '| message:', error.message, '| details:', error.details, '| hint:', error.hint);
      throw error;
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Attiva/disattiva un docente (flag logico — nessuna cancellazione).
 * Il docente disattivato non comparirà più in listTeachers() di default
 * e non potrà più effettuare login (vedi login()).
 *
 * v3.2.1 FIX: stesso bug-pattern di updateTeacherProfile — l'UPDATE
 * diretto era silenziosamente bloccato da RLS. Ora passa dalla RPC
 * SECURITY DEFINER director_set_teacher_active.
 */
async function setTeacherActive(teacherId, active) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  try {
    const { error } = await supabase.rpc('director_set_teacher_active', {
      p_teacher_id: teacherId,
      p_active: !!active,
    });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════════════
// LISTA EMAIL DOCENTI — v6.1.0 (via Edge Function, Admin API)
//
// L'email vive in auth.users, non in profiles (vedi updateTeacherEmail).
// Per mostrarla nelle card del redesign "Gestione Docenti" serve una
// lettura Admin API — stessa Edge Function family di update_teacher_email,
// ma in sola lettura. OPZIONALE: se la function 'list_teacher_emails' non
// è deployata, ritorna semplicemente {} e la UI mostra un placeholder —
// nessun'altra funzionalità è bloccata da questa mancanza.
// ════════════════════════════════════════════════════════════════════
async function listTeacherEmails(teacherIds) {
  if (!isDirector()) return {};
  if (!Array.isArray(teacherIds) || !teacherIds.length) return {};
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return {};
    const res = await fetch(
      'https://skrgqanqdyrybarinwwr.supabase.co/functions/v1/list_teacher_emails',
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey':        supabase.supabaseKey,
        },
        body: JSON.stringify({ teacherIds }),
      }
    );
    if (!res.ok) return {};
    const body = await res.json().catch(() => null);
    return body?.ok ? (body.emails || {}) : {};
  } catch (err) {
    // Edge Function non deployata / rete assente — fallimento silenzioso per design.
    return {};
  }
}

// ════════════════════════════════════════════════════════════════════
// GETTERS
// ════════════════════════════════════════════════════════════════════
function getUser()            { return _currentUser; }
function getProfile()         { return _currentProfile; }
function getUserId()          { return _currentUser?.id ?? null; }
function getName()            { return _currentProfile?.name ?? _currentUser?.email ?? ''; }
function isLoggedIn()         { return !!_currentUser; }
function isDirector()         { return _currentProfile?.role === 'director'; }
function needsPasswordSetup() { return _needsPasswordSetup; }

// ════════════════════════════════════════════════════════════════════
// ESPORTAZIONE su window.Auth
// ════════════════════════════════════════════════════════════════════
window.Auth = {
  init,
  login,
  logout,
  setPassword,
  checkSession,
  inviteTeacher,
  listTeachers,
  updateTeacherProfile,
  setTeacherActive,
  updateTeacherEmail,
  listTeacherEmails,
  getUser,
  getProfile,
  getUserId,
  getName,
  isLoggedIn,
  isDirector,
  needsPasswordSetup,
};

await init();
if (typeof window.__resolveAuth === 'function') window.__resolveAuth();
