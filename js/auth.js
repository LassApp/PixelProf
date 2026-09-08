/**
 * auth.js — PixelProf v6.1.0
 *
 * v8.26.0 — "Gestisci Direttore" (nuova card in Dashboard Direttore):
 *   - Nuove funzioni updateOwnProfile()/updateOwnEmail()/getEmail() per
 *     permettere al Direttore di modificare NOME, COGNOME, GENERE ed
 *     EMAIL del PROPRIO account (non è possibile farlo per le aule
 *     assegnate né per lo stato attivo/disattivo — il Direttore ha
 *     sempre accesso a tutte le aule e non può mai essere disattivato).
 *   - updateOwnProfile() scrive DIRETTAMENTE su 'profiles' (nessuna RPC):
 *     a differenza di updateTeacherProfile(), che scrive sul profilo di
 *     UN ALTRO utente e richiede la RPC SECURITY DEFINER per bypassare
 *     RLS, qui la riga aggiornata è la PROPRIA (auth.uid() = id) — le
 *     policy RLS di default permettono già l'UPDATE della propria riga.
 *   - updateOwnEmail() usa l'API self-service supabase.auth.updateUser()
 *     invece dell'Admin API/Edge Function usata da updateTeacherEmail()
 *     (che serve solo per modificare l'email di UN ALTRO utente).
 *     Supabase invia un'email di conferma al nuovo indirizzo prima che
 *     il cambio sia effettivo — non è un cambio immediato come per i
 *     docenti.
 *
 * v8.25.0 — Pannello Profilo in topbar (icona + anello colorato per
 *   ruolo/genere → pannello laterale):
 *   - _loadProfile() seleziona ora anche 'genere, last_login_at,
 *     last_classroom_id' (prima solo id/name/role/active — 'genere'
 *     era già selezionato in listTeachers() per la vista Direttore,
 *     ma mancava per il PROPRIO profilo del docente loggato).
 *   - Nuova funzione touchLoginMeta(classroomId?): chiama la NUOVA RPC
 *     update_own_login_meta(p_classroom_id uuid) (SQL consegnata a
 *     parte, sql/v5.2.0_add_profile_login_meta.sql — RICHIEDE quella
 *     migrazione: aggiunge last_login_at/last_classroom_id a profiles).
 *     Fire-and-forget: fallisce in silenzio (solo console.warn) finché
 *     la migrazione non è applicata, non blocca mai login o cambio aula.
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

// v8.26.4/8.26.6 — FIX conferma cambio email: logout automatico.
//
// PROBLEMA 6: cliccare il link di conferma nella mail genera un evento
//   USER_UPDATED identico a quello emesso al termine di setPassword()
//   (primo accesso via invite). Il vecchio codice trattava OGNI
//   USER_UPDATED come "password impostata" e chiamava __onPasswordSet(),
//   che fa entrare direttamente nell'app con la sessione già aperta —
//   nessun logout, nessun avviso.
//   v8.26.4: prima versione del fix, basata SOLO sul parametro "type"
//   letto dall'URL hash. Rivelatasi inaffidabile: Supabase Cloud ha di
//   default "Secure email change" attivo → arrivano DUE mail (vecchio +
//   nuovo indirizzo), entrambe con link type=email_change, ma il cambio
//   si applica solo dopo il SECONDO click — la sola presenza di "type"
//   non basta a distinguere le due situazioni.
//   v8.26.6: il segnale primario diventa il confronto tra l'email già
//   nota (_currentUser, se presente) e quella nella nuova sessione — se
//   sono diverse, il cambio è realmente avvenuto, indipendentemente dal
//   formato con cui Supabase ha costruito il redirect. Il "type" letto
//   qui resta come fallback solo per una tab nuova senza sessione
//   precedente con cui confrontare. Vedi anche session.user.new_email
//   nel blocco USER_UPDATED più sotto per riconoscere la "prima" delle
//   due conferme e non forzare nulla in quel caso.
//   NON usiamo history.replaceState per ripulire l'hash/query: Supabase
//   deve ancora leggerli per completare lo scambio del token — pulirli
//   prima romperebbe l'intero flusso di conferma.
let _pendingAuthType = null;
try {
  const _hashParams   = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const _searchParams = new URLSearchParams(window.location.search);
  _pendingAuthType = _hashParams.get('type') || _searchParams.get('type');
  // 'email_change' | 'recovery' | 'invite' | 'signup' | null
} catch (e) { /* no-op: ambiente senza location valido */ }

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
      .select('id, name, role, active, genere, last_login_at, last_classroom_id')
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
 * v8.25.0 — Aggiorna last_login_at (sempre, now()) e last_classroom_id
 * (solo se classroomId è passato) sulla riga profilo dell'utente
 * corrente, per il pannello Profilo in topbar. Chiama la RPC
 * update_own_login_meta (sql/v5.2.0_add_profile_login_meta.sql).
 * Fire-and-forget: non lancia mai, solo console.warn se la migrazione
 * non è ancora applicata — non deve MAI bloccare login o cambio aula.
 */
async function touchLoginMeta(classroomId) {
  try {
    const { error } = await supabase.rpc('update_own_login_meta', {
      p_classroom_id: classroomId || null
    });
    if (error) {
      console.warn('[Auth] touchLoginMeta RPC error (migrazione sql/v5.2.0_add_profile_login_meta.sql applicata?):', error.message);
      return;
    }
    if (_currentProfile) {
      _currentProfile.last_login_at = new Date().toISOString();
      if (classroomId) _currentProfile.last_classroom_id = classroomId;
    }
  } catch (err) {
    console.warn('[Auth] touchLoginMeta eccezione:', err.message);
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

    // ── USER_UPDATED: conferma cambio email OPPURE password impostata ──
    if (event === 'USER_UPDATED' && session?.user) {
      const _authType = _pendingAuthType;
      _pendingAuthType = null; // consumato una tantum, non deve influenzare eventi futuri

      // v8.26.7 — FIX: sia il confronto _currentUser (fallisce su una tab
      // nuova, senza sessione precedente) sia il controllo su "type"
      // nell'URL (si è rivelato NON rilevabile in questo progetto — vedi
      // log diagnostico sotto, "authType" risultava sempre null anche
      // sul link di conferma) non bastavano da soli. Aggiunto un terzo
      // segnale, il più affidabile: un marker in localStorage — scritto
      // da updateOwnEmail() nel momento stesso in cui il cambio viene
      // richiesto, con l'email di destinazione — che è CONDIVISO tra
      // tutte le tab della stessa origine (quindi visibile anche in una
      // tab nuova aperta dal link nella mail) e NON dipende in alcun modo
      // dal formato dell'URL di redirect costruito da Supabase.
      let _pendingMarker = null;
      try {
        const _raw = localStorage.getItem('pp_pending_email_change');
        if (_raw) _pendingMarker = JSON.parse(_raw);
      } catch (e) { /* no-op */ }
      // Validità 24h: tempo ragionevole per aprire la mail di conferma.
      const _markerFresh   = !!(_pendingMarker && (Date.now() - (_pendingMarker.requestedAt || 0)) < 24 * 60 * 60 * 1000);
      const _markerMatches = !!(_markerFresh && _pendingMarker.newEmail && session.user.email === _pendingMarker.newEmail);

      const _previousEmail = _currentUser?.email || null;
      const _newEmail      = session.user.email || null;
      const _pendingSecondConfirmation = !!(session.user.new_email);
      const _emailActuallyChanged = !!(_previousEmail && _newEmail && _previousEmail !== _newEmail);
      const _isEmailChangeConfirm = !_pendingSecondConfirmation &&
        (_markerMatches || _emailActuallyChanged || (!_previousEmail && _authType === 'email_change'));

      console.debug('[PixelProf] USER_UPDATED', {
        rawHref: window.location.href,
        authType: _authType,
        previousEmail: _previousEmail,
        newEmail: _newEmail,
        pendingField_new_email: session.user.new_email || null,
        pendingSecondConfirmation: _pendingSecondConfirmation,
        markerMatches: _markerMatches,
        isEmailChangeConfirm: _isEmailChangeConfirm
      });

      if (_isEmailChangeConfirm) {
        try { localStorage.removeItem('pp_pending_email_change'); } catch (e) { /* no-op */ }
        if (typeof window.__onEmailChangeConfirmed === 'function') {
          window.__onEmailChangeConfirmed();
        }
        return;
      }

      if (_pendingSecondConfirmation) {
        // Secure Email Change: manca ancora l'altra conferma (vecchio o
        // nuovo indirizzo, a seconda di quale link è stato cliccato per
        // primo). Il cambio non è ancora effettivo: non tocchiamo la
        // sessione corrente e non mostriamo alcun messaggio.
        return;
      }

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
// GESTISCI DIRETTORE — v8.26.0 (il Direttore modifica il PROPRIO account)
// ════════════════════════════════════════════════════════════════════

/**
 * Aggiorna 'name' e 'genere' della riga 'profiles' dell'utente
 * CORRENTE. Nessuna RPC: le policy RLS di default già permettono a un
 * utente di scrivere sulla propria riga (auth.uid() = id) — il
 * problema che rende necessaria una RPC per updateTeacherProfile() è
 * che lì il Direttore scrive sul profilo di un ALTRO utente.
 * Ristretto a isDirector() perché questa funzione alimenta solo lo
 * screen "Gestisci Direttore", accessibile esclusivamente al ruolo
 * Direttore.
 */
async function updateOwnProfile(updates) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  const id = getUserId();
  if (!id) return { ok: false, error: 'Sessione non valida' };
  const name = (updates.name ?? '').trim();
  if (!name) return { ok: false, error: 'Nessun campo da aggiornare' };
  const genere = updates.genere === 'uomo' || updates.genere === 'donna' ? updates.genere : null;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ name, genere })
      .eq('id', id);
    if (error) throw error;
    if (_currentProfile) { _currentProfile.name = name; _currentProfile.genere = genere; }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Cambia l'email dell'account CORRENTE tramite l'API self-service di
 * Supabase Auth (auth.updateUser) — NON l'Admin API/Edge Function usata
 * da updateTeacherEmail() per modificare l'email di un ALTRO utente.
 * Supabase invia un'email di conferma al nuovo indirizzo (ed
 * eventualmente anche al vecchio, se "Secure email change" è attivo sul
 * progetto): il cambio NON è immediato, il chiamante deve informarne
 * l'utente.
 */
async function updateOwnEmail(newEmail) {
  if (!isDirector()) return { ok: false, error: 'Permesso negato' };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!newEmail || !emailRe.test(newEmail)) return { ok: false, error: 'Indirizzo email non valido' };
  try {
    // v8.26.4: emailRedirectTo esplicito. Senza questa opzione Supabase usa
    // il "Site URL" configurato nel Dashboard come default: se quel valore
    // non include il path della GitHub Pages project site (/PixelProf/),
    // il link nell'email di conferma atterra sulla root del dominio
    // (https://lassapp.github.io/) che risponde 404 "There isn't a GitHub
    // Pages site here" — il cambio email lato Supabase può comunque essere
    // andato a buon fine, ma l'utente non vede mai la pagina che completa
    // il flusso lato client (detectSessionInUrl in supabase_client.js).
    // NB: perché funzioni, l'URL corrente deve essere anche in whitelist su
    // Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: window.location.origin + window.location.pathname }
    );
    if (error) throw error;

    // v8.26.7: marker in localStorage con l'email target, per riconoscere
    // la conferma in QUALSIASI tab (anche una nuova, senza sessione
    // precedente con cui confrontare) senza dipendere dal formato esatto
    // dell'URL di redirect. Vedi PROBLEMA 6 più sopra per il contesto
    // completo: il rilevamento basato solo su "type" nell'URL si è
    // rivelato inaffidabile in questo progetto.
    try {
      localStorage.setItem('pp_pending_email_change', JSON.stringify({
        newEmail: newEmail,
        requestedAt: Date.now()
      }));
    } catch (e) { /* no-op: storage non disponibile */ }

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
function getEmail()           { return _currentUser?.email ?? ''; }
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
  updateOwnProfile,
  updateOwnEmail,
  getUser,
  getProfile,
  getUserId,
  getName,
  getEmail,
  isLoggedIn,
  isDirector,
  needsPasswordSetup,
  touchLoginMeta,
};

await init();
if (typeof window.__resolveAuth === 'function') window.__resolveAuth();
