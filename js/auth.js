/**
 * auth.js — PixelProf v3.1.2
 *
 * NUOVO v3.1.2 — Password onboarding flow:
 *   Quando un docente entra tramite magic link (invite), Supabase emette
 *   l'evento PASSWORD_RECOVERY (o SIGNED_IN con flag no-password).
 *   In quel caso l'app mostra lo screen "imposta password" PRIMA di
 *   entrare nell'app. Solo dopo aver impostato la password con
 *   supabase.auth.updateUser({ password }) l'utente accede normalmente.
 *
 *   Il flag viene rilevato in due modi:
 *     1. evento onAuthStateChange === 'PASSWORD_RECOVERY'
 *     2. user.user_metadata.needs_password === true  (settato dall'Edge Function)
 *
 *   window.Auth.needsPasswordSetup() → true se il docente deve impostare la password
 *   window.Auth.setPassword(pwd)     → imposta la password e risolve il flag
 */

import { supabase } from './supabase_client.js';

// ── State interno ────────────────────────────────────────────────
let _currentUser       = null;
let _currentProfile    = null;
let _profileLoaded     = false;
let _needsPasswordSetup = false;  // v3.1.2: flag "primo accesso"

// ════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    _currentUser = session.user;
    _needsPasswordSetup = _checkNeedsPassword(session.user);
    if (!_needsPasswordSetup) {
      await _loadProfile(session.user.id);
    }
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session?.user) {
      // Docente arrivato tramite link di invito/reset
      _currentUser        = session.user;
      _needsPasswordSetup = true;
      _profileLoaded      = false;
      // Segnala all'app di mostrare lo screen "imposta password"
      if (typeof window.__onPasswordRecovery === 'function') {
        window.__onPasswordRecovery();
      }
    } else if (event === 'SIGNED_IN' && session?.user) {
      _currentUser = session.user;
      const needs = _checkNeedsPassword(session.user);
      if (needs && !_needsPasswordSetup) {
        _needsPasswordSetup = true;
        if (typeof window.__onPasswordRecovery === 'function') {
          window.__onPasswordRecovery();
        }
      } else if (!needs) {
        await _loadProfile(session.user.id);
      }
    } else if (event === 'USER_UPDATED' && session?.user) {
      // Password aggiornata con successo
      _currentUser        = session.user;
      _needsPasswordSetup = false;
      await _loadProfile(session.user.id);
      if (typeof window.__onPasswordSet === 'function') {
        window.__onPasswordSet();
      }
    } else if (event === 'SIGNED_OUT') {
      _currentUser        = null;
      _currentProfile     = null;
      _profileLoaded      = false;
      _needsPasswordSetup = false;
    }
  });
}

// ── Controlla se l'utente non ha ancora una password ─────────────
// Supabase setta last_sign_in_type='magiclink' o needs_password nei metadata
function _checkNeedsPassword(user) {
  if (!user) return false;
  // Metadata settato dall'Edge Function invite_teacher
  if (user.user_metadata?.needs_password === true) return true;
  // Supabase setta questo quando l'utente non ha mai fatto login con password
  if (user.app_metadata?.provider === 'email' &&
      user.identities?.length > 0 &&
      !user.last_sign_in_at &&
      user.created_at === user.updated_at) return true;
  return false;
}

// ── Carica profilo UNA SOLA VOLTA per sessione ────────────────────
async function _loadProfile(userId) {
  if (_profileLoaded) return;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', userId)
      .single();
    if (!error && data) {
      _currentProfile = data;
      _profileLoaded  = true;
      console.log('[PROFILE INIT]', _currentProfile);
      console.log('[ROLE BEFORE CLASSROOM]', _currentProfile.role);
    }
  } catch (err) {
    console.warn('[Auth] _loadProfile fallito:', err.message);
  }
}

// ════════════════════════════════════════════════════════════════════
// LOGIN — email + password
// ════════════════════════════════════════════════════════════════════
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  _currentUser        = data.user;
  _needsPasswordSetup = false;
  await _loadProfile(data.user.id);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// SET PASSWORD — usata dallo screen onboarding
// ════════════════════════════════════════════════════════════════════
async function setPassword(newPassword) {
  if (!_currentUser) return { ok: false, error: 'Nessun utente attivo' };
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'Password troppo corta (minimo 6 caratteri)' };
  }
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { needs_password: false },
  });
  if (error) return { ok: false, error: error.message };
  _currentUser        = data.user;
  _needsPasswordSetup = false;
  await _loadProfile(data.user.id);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════════
async function logout() {
  await supabase.auth.signOut();
  _currentUser        = null;
  _currentProfile     = null;
  _profileLoaded      = false;
  _needsPasswordSetup = false;
}

// ════════════════════════════════════════════════════════════════════
// INVITA DOCENTE
// ════════════════════════════════════════════════════════════════════
async function inviteTeacher(email, name) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { ok: false, error: 'Sessione non valida' };
    const res = await fetch(
      `https://skrgqanqdyrybarinwwr.supabase.co/functions/v1/invite_teacher`,
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
    const json = await res.json();
    return json;
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
function getUser()             { return _currentUser; }
function getProfile()          { return _currentProfile; }
function getUserId()           { return _currentUser?.id ?? null; }
function getName()             { return _currentProfile?.name ?? _currentUser?.email ?? ''; }
function isLoggedIn()          { return !!_currentUser; }
function isDirector()          { return _currentProfile?.role === 'director'; }
function needsPasswordSetup()  { return _needsPasswordSetup; }

// ════════════════════════════════════════════════════════════════════
// ESPORTAZIONE su window.Auth
// ════════════════════════════════════════════════════════════════════
window.Auth = {
  init,
  login,
  logout,
  setPassword,
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
