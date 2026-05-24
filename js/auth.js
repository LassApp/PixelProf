/**
 * auth.js — PixelProf v3.1.1
 *
 * FIX v3.1.1:
 *   1. Aggiunto flag _profileLoaded: il profilo (e il ruolo) viene caricato
 *      UNA SOLA VOLTA dopo il login. onAuthStateChange SIGNED_IN (token refresh)
 *      NON sovrascrive più il profilo → risolve il bug director→teacher.
 *   2. Rimosso auth.admin.inviteUserByEmail (richiede service_role, causa 403).
 *      Sostituito con Edge Function 'invite_teacher' (fetch + Bearer token).
 *   3. Aggiunto logout() che resetta anche _profileLoaded per permettere
 *      un nuovo login corretto.
 */

import { supabase } from './supabase_client.js';

// ── State interno ────────────────────────────────────────────────
let _currentUser    = null;   // oggetto auth.User di Supabase
let _currentProfile = null;   // riga da profiles { id, name, role }
let _profileLoaded  = false;  // LOCK: profilo caricato una sola volta per sessione

// ════════════════════════════════════════════════════════════════════
// INIT — ripristina la sessione esistente al caricamento pagina
// ════════════════════════════════════════════════════════════════════
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    _currentUser = session.user;
    await _loadProfile(session.user.id);
  }

  // Ascolta cambiamenti di sessione
  // ATTENZIONE: SIGNED_IN viene emesso anche su token refresh — NON ricaricare
  // il profilo in quel caso, altrimenti il ruolo potrebbe cambiare a runtime.
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      _currentUser = session.user;
      // _loadProfile ha il guard interno: se già caricato, non fa nulla
      await _loadProfile(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      _currentUser    = null;
      _currentProfile = null;
      _profileLoaded  = false;  // reset lock: permette nuovo login
    }
  });
}

// ── Carica profilo UNA SOLA VOLTA per sessione ────────────────────
async function _loadProfile(userId) {
  if (_profileLoaded) {
    // Token refresh o doppia chiamata: NON sovrascrivere il profilo esistente
    console.log('[Auth] _loadProfile skip — profilo già caricato, ruolo immutabile');
    return;
  }
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
  _currentUser = data.user;
  await _loadProfile(data.user.id);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════
// LOGOUT — resetta tutto incluso il lock profilo
// ════════════════════════════════════════════════════════════════════
async function logout() {
  await supabase.auth.signOut();
  _currentUser    = null;
  _currentProfile = null;
  _profileLoaded  = false;
}

// ════════════════════════════════════════════════════════════════════
// INVITA DOCENTE — solo direttore
// Chiama la Edge Function 'invite_teacher' che usa service_role server-side.
// L'Edge Function verifica il JWT e il ruolo prima di procedere.
// ════════════════════════════════════════════════════════════════════
async function inviteTeacher(email, name) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  try {
    // Recupera la sessione corrente per il Bearer token
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
    return json; // { ok: true, user_id } oppure { ok: false, error }
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
