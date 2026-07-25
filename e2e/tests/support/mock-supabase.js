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
 */
async function mockSupabase(page, opts = {}) {
  const {
    role = 'teacher',
    active = true,
    wrongCredentials = false,
    email = 'docente.e2e@pixelprof.test',
    skipOnboarding = true,
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
      return respondJson(route, 200, {
        id: TEST_USER_ID,
        name: role === 'director' ? 'Direttore E2E' : 'Docente E2E',
        role,
        active,
      });
    }

    // 3. AULE DEL DOCENTE --------------------------------------------------
    if (path === '/rest/v1/rpc/get_teacher_classrooms' && method === 'POST') {
      return respondJson(route, 200, [
        {
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
        },
      ]);
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
};