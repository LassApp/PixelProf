/**
 * fixtures.js — PixelProf E2E
 *
 * Estende il `test` di Playwright con una fixture `aulaPage`: una pagina
 * già loggata come docente (Supabase mockato, vedi mock-supabase.js) e
 * già entrata nell'aula di test, ferma su #step-mod (scegli il modulo).
 * Ogni spec che testa un minigioco riparte da qui — zero duplicazione
 * del flusso login→aula in ogni file di test.
 */

const base = require('@playwright/test');
const { mockSupabase, TEST_CLASSROOM_ID } = require('./mock-supabase');

const TEST_EMAIL = 'docente.e2e@pixelprof.test';
// Il mock non verifica la password — qualunque valore non vuoto va bene.
const TEST_PASSWORD = 'e2e-smoke-test-password';

/** Compila e invia il form di login, presumendo #screen-login già visibile. */
async function login(page, { email = TEST_EMAIL, password = TEST_PASSWORD } = {}) {
  await page.goto('/');
  await page.locator('#screen-login').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-pwd').fill(password);
  await page.locator('#login-submit-btn').click();
}

/** Entra nell'aula di test dalla griglia #cs-grid e attende lo step Modulo. */
async function enterTestClassroom(page) {
  await page.locator('#screen-courses').waitFor({ state: 'visible', timeout: 20000 });
  await page
    .locator(`[data-course-id="${TEST_CLASSROOM_ID}"]`)
    .waitFor({ state: 'visible', timeout: 20000 });
  await page.locator(`[data-course-id="${TEST_CLASSROOM_ID}"]`).click();
  await page.locator('#step-mod').waitFor({ state: 'visible', timeout: 20000 });
}

const test = base.test.extend({
  // Pagina già loggata come Docente e già dentro l'aula di test, ferma
  // su #step-mod visibile — punto di partenza standard per ogni
  // spec che deve testare un modulo/minigioco.
  // eslint-disable-next-line no-empty-pattern
  aulaPage: async ({ page }, use) => {
    await mockSupabase(page, { role: 'teacher' });
    await login(page);
    await enterTestClassroom(page);
    await use(page);
  },
});

module.exports = {
  test,
  expect: base.expect,
  login,
  enterTestClassroom,
  TEST_EMAIL,
  TEST_PASSWORD,
};
