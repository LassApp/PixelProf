/**
 * auth.js — PixelProf v3.0.0
 *
 * Gestione autenticazione docente con Supabase Auth nativo.
 * Espone window.Auth — usato dall'HTML inline.
 *
 * NUOVO in v3: questo file non esisteva nelle versioni precedenti.
 */

import { supabase } from './supabase_client.js';

// ── State interno ────────────────────────────────────────────────
let _currentUser    = null;   // oggetto auth.User di Supabase
let _currentProfile = null;   // riga da profiles { id, name, role }

// ════════════════════════════════════════════════════════════════════
// INIT — ripristina la sessione esistente al caricamento pagina
// ════════════════════════════════════════════════════════════════════
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    _currentUser = session.user;
    await _loadProfile(session.user.id);
  }

  // Ascolta cambiamenti di sessione (logout da altro tab, token refresh…)
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      _currentUser = session.user;
      await _loadProfile(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      _currentUser    = null;
      _currentProfile = null;
    }
  });
}

// ── Carica profilo (name, role) dalla tabella profiles ────────────
async function _loadProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', userId)
      .single();
    if (!error && data) _currentProfile = data;
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
  _currentUser = data.user;
  await _loadProfile(data.user.id);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════════
async function logout() {
  await supabase.auth.signOut();
  _currentUser    = null;
  _currentProfile = null;
}

// ════════════════════════════════════════════════════════════════════
// INVITA DOCENTE — solo direttore
// Usa inviteUserByEmail: manda email con link per impostare la password.
// Il trigger handle_new_user imposta role = 'teacher' di default.
// ════════════════════════════════════════════════════════════════════
async function inviteTeacher(email, name) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name, role: 'teacher' },
    });
    if (error) throw error;
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════════════
// LISTA DOCENTI — solo direttore, per il pannello assegnazione aule
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
// GETTERS pubblici
// ════════════════════════════════════════════════════════════════════
function getUser()    { return _currentUser; }
function getProfile() { return _currentProfile; }
function getUserId()  { return _currentUser?.id ?? null; }
function getName()    { return _currentProfile?.name ?? _currentUser?.email ?? ''; }
function isLoggedIn() { return !!_currentUser; }
function isDirector() { return _currentProfile?.role === 'director'; }

// ════════════════════════════════════════════════════════════════════
// ESPORTAZIONE su window.Auth
// L'HTML inline (non ES module) usa window.Auth.login() ecc.
// ════════════════════════════════════════════════════════════════════
window.Auth = {
  init,
  login,
  logout,
  inviteTeacher,
  listTeachers,
  getUser,
  getProfile,
  getUserId,
  getName,
  isLoggedIn,
  isDirector,
};

// Auto-init appena il modulo viene caricato
await init();

// Segnala al bootstrap gate che Auth è pronto
if (typeof window.__resolveAuth === 'function') window.__resolveAuth();
