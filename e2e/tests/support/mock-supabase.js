/**
 * mock-supabase.js — PixelProf E2E
 *
 * Intercetta OGNI chiamata di rete diretta al progetto Supabase di
 * PixelProf (stesso host di SUPABASE_URL in js/supabase_client.js) e
 * risponde con dati finti, deterministici e istantanei.
 *
 * PERCHÉ mockare invece di usare un account Supabase reale:
 *   - zero credenziali reali nel repo/CI
 *   - zero rischio di scrivere dati di test in produzione
 *   - test veloci e deterministici, eseguibili anche senza rete verso
 *     Supabase (utile in ambienti sandboxed/CI con rete ristretta)
 *
 * COPERTURA — le uniche chiamate che il flusso "login → entra in aula →
 * gioca" ATTENDE in modo sincrono (bloccante per la UI, verificato
 * leggendo js/auth.js, js/app.js, js/courses.js, js/db_adapter.js):
 *   1. POST /auth/v1/token?grant_type=password   → login
 *   2. GET  /rest/v1/profiles?...                → ruolo + account attivo
 *   3. POST /rest/v1/rpc/get_teacher_classrooms   → elenco aule del docente
 *   4. POST /rest/v1/rpc/get_classroom_modules    → whitelist moduli aula
 *
 * Tutto il resto (upsert giocatori/squadre, leaderboard, matches, scores,
 * stats_aggregate, RPC increment_stats/delete_player/delete_team/
 * upsert_leaderboard) è fire-and-forget nel codice applicativo (mai
 * atteso dal flusso di gioco — vedi game_hooks.js) e passa dal
 * catch-all in fondo: risposta 200 "vuota", nessun blocco, nessun
 * errore in console.
 *
 * v8.4.0 — ROADMAP_AREE.md Fase 6 (copertura e2e Sistema Aree):
 *   - get_teacher_classrooms ora risponde con l'array configurabile
 *     `opts.classrooms` invece di un singolo record hardcoded — permette
 *     agli spec di simulare più aule su Aree diverse (vedi areas.spec.js).
 *     Default invariato (stesso singolo record di prima) — zero impatto
 *     sugli spec esistenti che non passano questa opzione.
 *   - GET /rest/v1/profiles ora distingue la query del PROPRIO profilo
 *     (.eq('id', userId).single(), usata da _loadProfile) dalla query
 *     dell'elenco docenti (.eq('role','teacher'), usata da
 *     Auth.listTeachers() nel pannello Direttore) leggendo il parametro
 *     'role' nell'URL — la seconda risponde con `opts.teachersList`
 *     (default: array vuoto, retrocompatibile).
 *
 * ONBOARDING TOUR (js/onboarding.js): al primissimo accesso di un
 * docente, l'app mostra un tour guidato a tutto schermo (#onb-overlay)
 * che blocca i click finché non viene chiuso — comportamento corretto e
 * voluto per un utente reale al primo login. Un browser Playwright
 * pulito parte però SEMPRE senza cronologia salvata, quindi senza il
 * seeding qui sotto ogni test rivedrebbe il tour da capo, bloccando i
 * click sulle card attività (bug del test, non dell'app). Simuliamo
 * quindi "un docente che il tour lo ha già visto/saltato" — lo scenario
 * corretto per uno smoke test che verifica il gameplay, non l'onboarding
 * in sé — pre-popolando la stessa chiave localStorage che onboarding.js
 * legge (pp5_onboarding_<teacherId>) PRIMA che la pagina carichi.
 *
 * Se in futuro cambia il progetto Supabase di PixelProf, aggiorna SOLO
 * SUPABASE_HOST (stesso valore di SUPABASE_URL in js/supabase_client.js).
 */

const SUPABASE_HOST = 'skrgqanqdyrybarinwwr.supabase.co';

const TEST_USER_ID = '00000000-0000-4000-8000-000000000001';
const TEST_CLASSROOM_ID = '00000000-0000-4000-8000-0000000000aa';
const TEST_CLASSROOM_NAME = 'Aula Smoke Test';

/** Aula di default restituita da get_teacher_classrooms quando lo spec
 *  non passa opts.classrooms — stesso identico record di prima di v8.4.0. */
const DEFAULT_TEST_CLASSROOM = {
  id: TEST_CLASSROOM_ID,
  name: TEST_CLASSROOM_NAME,
  icon: '🧪',
  color_idx: 0,
  bg_idx: 0,
  created_at: new Date().toISOString(),
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  time_slot: '08:00 – 09:00',
  teachers: [],
};

/** Aule multi-Area — per i test di raggruppamento (Fasi 3/4 Sistema
 *  Aree, vedi areas.spec.js). Copre: Area con 2 aule (ecdl, di cui una
 *  legacy senza area_key), Area con 1 aula (reti-internet), 3 Aree
 *  senza alcuna aula (cyberbullismo-sicurezza-online, cybersecurity,
 *  malware-minacce — le sezioni corrispondenti non devono comparire). */
const AREA_TEST_CLASSROOM_ECDL = {
  id: '00000000-0000-4000-8000-0000000000a1',
  name: 'Aula ECDL E2E',
  icon: '🖥️',
  color_idx: 0,
  bg_idx: 0,
  created_at: new Date().toISOString(),
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  time_slot: '08:00 – 09:00',
  area_key: 'ecdl',
  teachers: [],
};
const AREA_TEST_CLASSROOM_RETI = {
  id: '00000000-0000-4000-8000-0000000000a2',
  name: 'Aula Reti E2E',
  icon: '🌐',
  color_idx: 1,
  bg_idx: 1,
  created_at: new Date().toISOString(),
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  time_slot: '09:00 – 10:00',
  area_key: 'reti-internet',
  teachers: [],
};
const AREA_TEST_CLASSROOM_LEGACY = {
  id: '00000000-0000-4000-8000-0000000000a3',
  name: 'Aula Legacy E2E',
  icon: '🏫',
  color_idx: 2,
  bg_idx: 2,
  created_at: new Date().toISOString(),
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  time_slot: '10:00 – 11:00',
  // area_key assente di proposito: simula una riga creata PRIMA del
  // Sistema Aree, come se lo script di backfill (Fase 5) non fosse
  // ancora stato eseguito in questo ambiente.
  teachers: [],
};
const AREA_TEST_CLASSROOMS = [
  AREA_TEST_CLASSROOM_ECDL,
  AREA_TEST_CLASSROOM_RETI,
  AREA_TEST_CLASSROOM_LEGACY,
];

/** Docente di test per il flusso Direttore → Gestisci Docenti → Docenti
 *  → Scheda Docente (vedi areas.spec.js). */
const AREA_TEST_TEACHER = {
  id: '00000000-0000-4000-8000-0000000000b1',
  name: 'Docente Aree E2E',
  role: 'teacher',
  active: true,
  genere: 'donna',
};

function fakeSession(email) {
  const nowSec = Math.floor(Date.now() / 1000);
  const iso = new Date().toISOString();
  return {
    access_token: 'e2e-fake-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: nowSec + 3600,
    refresh_token: 'e2e-fake-refresh-token',
    user: {
      id: TEST_USER_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: iso,
      phone: '',
      confirmed_at: iso,
      last_sign_in_at: iso,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { needs_password: false },
      identities: [],
      created_at: iso,
      updated_at: iso,
    },
  };
}

async function respondJson(route, status, body) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

/**
 * Attiva il mock Supabase su una pagina Playwright e pre-popola il
 * localStorage in modo che il tour guidato risulti già completato.
 * Va chiamato PRIMA di page.goto(), altrimenti le prime richieste
 * (es. getSession all'avvio) non verrebbero intercettate in tempo e il
 * seeding del localStorage arriverebbe dopo il primo caricamento.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [opts]
 * @param {'teacher'|'director'} [opts.role='teacher']
 * @param {boolean} [opts.active=true]              account disattivato dal direttore?
 * @param {boolean} [opts.wrongCredentials=false]    forza sempre login fallito (400)
 * @param {string}  [opts.email='docente.e2e@pixelprof.test']
 * @param {boolean} [opts.skipOnboarding=true]       simula tour già visto/saltato
 * @param {object[]} [opts.classrooms=[DEFAULT_TEST_CLASSROOM]] aule restituite da
 *   get_teacher_classrooms (sia per il docente sia, con lo stesso teacherId
 *   coincidente col Direttore loggato, per "tutte le aule" lato Direttore)
 * @param {object[]} [opts.teachersList=[]]  docenti restituiti da
 *   Auth.listTeachers() — lista di /rest/v1/profiles?role=eq.teacher
 */
async function mockSupabase(page, opts = {}) {
  const {
    role = 'teacher',
    active = true,
    wrongCredentials = false,
    email = 'docente.e2e@pixelprof.test',
    skipOnboarding = true,
    classrooms = [DEFAULT_TEST_CLASSROOM],
    teachersList = [],
  } = opts;

  if (skipOnboarding) {
    await page.addInitScript((storageKey) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ done: true, idx: 0 }));
      } catch (e) {
        /* localStorage non disponibile — non bloccante, il tour al più ricomparirà */
      }
    }, `pp5_onboarding_${TEST_USER_ID}`);
  }

  await page.route(`https://${SUPABASE_HOST}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const path = url.pathname;

    // 1. LOGIN -----------------------------------------------------------
    if (path === '/auth/v1/token' && method === 'POST') {
      if (wrongCredentials) {
        return respondJson(route, 400, {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        });
      }
      return respondJson(route, 200, fakeSession(email));
    }

    // 2. PROFILO (ruolo + stato account) ----------------------------------
    if (path === '/rest/v1/profiles' && method === 'GET') {
      // Auth.listTeachers() interroga .eq('role','teacher') → attende un
      // array. Il fetch del PROPRIO profilo (_loadProfile) interroga
      // .eq('id', userId).single() → attende un oggetto singolo. Si
      // distinguono guardando il parametro 'role' nell'URL.
      if (url.searchParams.get('role') === 'eq.teacher') {
        return respondJson(route, 200, teachersList);
      }
      return respondJson(route, 200, {
        id: TEST_USER_ID,
        name: role === 'director' ? 'Direttore E2E' : 'Docente E2E',
        role,
        active,
      });
    }

    // 3. AULE DEL DOCENTE (o, per il Direttore che vede "tutte le aule",
    //    stessa RPC chiamata col proprio id — vedi js/app.js _tmdRenderAule)
    // ------------------------------------------------------------------
    if (path === '/rest/v1/rpc/get_teacher_classrooms' && method === 'POST') {
      return respondJson(route, 200, classrooms);
    }

    // 4. MODULI ABILITATI PER L'AULA (whitelist vuota = tutti visibili) ---
    if (path === '/rest/v1/rpc/get_classroom_modules' && method === 'POST') {
      return respondJson(route, 200, []);
    }

    // CATCH-ALL — tutto il resto è fire-and-forget: risposta vuota, mai
    // un errore che possa comparire come "unhandled" nei log del test.
    if (method === 'GET') return respondJson(route, 200, []);
    return respondJson(route, 200, {});
  });
}

module.exports = {
  mockSupabase,
  TEST_USER_ID,
  TEST_CLASSROOM_ID,
  TEST_CLASSROOM_NAME,
  AREA_TEST_CLASSROOM_ECDL,
  AREA_TEST_CLASSROOM_RETI,
  AREA_TEST_CLASSROOM_LEGACY,
  AREA_TEST_CLASSROOMS,
  AREA_TEST_TEACHER,
};