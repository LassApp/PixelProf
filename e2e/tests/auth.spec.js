/**
 * auth.spec.js — PixelProf E2E
 *
 * Copre il primissimo passo del flusso richiesto dalla roadmap
 * ("login → entra in aula → ..."): login riuscito con reindirizzo alla
 * schermata aule, e login fallito con messaggio d'errore visibile.
 * Non copre il ramo Direttore (Dashboard Direttore) — lo smoke test
 * principale (smoke.spec.js) usa il ruolo Docente, che è il percorso
 * più diretto verso "entra in aula".
 */
const { test, expect } = require('@playwright/test');
const { mockSupabase } = require('./support/mock-supabase');

test.describe('Login', () => {
  test('login riuscito porta alla schermata "Seleziona aula"', async ({ page }) => {
    await mockSupabase(page, { role: 'teacher' });
    await page.goto('/');

    await page.locator('#screen-login').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('#login-email').fill('docente.e2e@pixelprof.test');
    await page.locator('#login-pwd').fill('qualsiasi-password');
    await page.locator('#login-submit-btn').click();

    await expect(page.locator('#screen-courses')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#cs-grid .course-card')).toHaveCount(1);
  });

  test('login con credenziali errate mostra un messaggio d\'errore', async ({ page }) => {
    await mockSupabase(page, { wrongCredentials: true });
    await page.goto('/');

    await page.locator('#screen-login').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('#login-email').fill('docente.e2e@pixelprof.test');
    await page.locator('#login-pwd').fill('password-sbagliata');
    await page.locator('#login-submit-btn').click();

    const err = page.locator('#login-error');
    await expect(err).toBeVisible({ timeout: 10000 });
    // La schermata di login deve restare quella attiva — nessun accesso indebito.
    await expect(page.locator('#screen-login')).toBeVisible();
    await expect(page.locator('#screen-courses')).toBeHidden();
  });
});
