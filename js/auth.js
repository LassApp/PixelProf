/**
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
      .select('id, name, role')
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
  // onAuthStateChange SIGNED_IN caricherà il profilo
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
// LISTA DOCENTI
// ════════════════════════════════════════════════════════════════════
async function listTeachers() {
  if (!isDirector()) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('role', 'teacher')
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Auth] listTeachers fallito:', err.message);
    return [];
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
