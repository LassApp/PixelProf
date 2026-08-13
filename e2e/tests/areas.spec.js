/**
 * areas.spec.js — PixelProf E2E
 * ROADMAP_AREE.md · Fase 6 — copertura automatizzata del raggruppamento
 * per Area introdotto in Fase 3 (Docente — "Scegli Aula", js/courses.js
 * _csBuildAreaSection) e Fase 4 (Direttore — Scheda Docente, js/app.js
 * _tmdBuildAreaBlock).
 *
 * Con Supabase completamente mockato (vedi support/mock-supabase.js),
 * simula 3 aule su Aree diverse:
 *   - "Aula ECDL E2E"    → area_key = 'ecdl'
 *   - "Aula Reti E2E"    → area_key = 'reti-internet'
 *   - "Aula Legacy E2E"  → area_key ASSENTE (simula una riga creata
 *     prima del Sistema Aree, come se il backfill di Fase 5 non fosse
 *     ancora stato eseguito) → deve ricadere nel blocco ECDL per
 *     fallback, MAI in una sezione a parte.
 *
 * Verifica, in entrambe le schermate:
 *   1. le sezioni/blocchi vengono creati solo per le Aree che hanno
 *      almeno un'aula (nessuna sezione vuota per le altre 3 Aree);
 *   2. l'ordine delle sezioni segue l'ordine di window.AREAS;
 *   3. l'aula legacy senza area_key finisce nel blocco ECDL.
 *
 * Non copre l'interazione con l'assegnazione aula→docente (toggle):
 * quella è logica invariata, già in uso da prima della Fase 4 e non
 * toccata dal raggruppamento in sé.
 */
const { test, expect } = require('@playwright/test');
const {
  mockSupabase,
  AREA_TEST_CLASSROOM_ECDL,
  AREA_TEST_CLASSROOM_RETI,
  AREA_TEST_CLASSROOM_LEGACY,
  AREA_TEST_CLASSROOMS,
  AREA_TEST_TEACHER,
} = require('./support/mock-supabase');

// Aree senza alcuna aula di test — le sezioni/blocchi corrispondenti
// non devono MAI comparire nel DOM (niente sezioni vuote).
const EMPTY_AREA_KEYS = ['cyberbullismo-sicurezza-online', 'cybersecurity', 'malware-minacce'];

test.describe('Sistema Aree — raggruppamento per Area (ROADMAP_AREE.md Fasi 3-4)', () => {
  test('Docente — "Scegli Aula" raggruppa le aule per Area (Fase 3)', async ({ page }) => {
    await mockSupabase(page, { role: 'teacher', classrooms: AREA_TEST_CLASSROOMS });
    await page.goto('/');

    await page.locator('#screen-login').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('#login-email').fill('docente.e2e@pixelprof.test');
    await page.locator('#login-pwd').fill('qualsiasi-password');
    await page.locator('#login-submit-btn').click();
    await page.locator('#screen-courses').waitFor({ state: 'visible', timeout: 20000 });

    // Sezione ECDL: 2 aule — quella con area_key='ecdl' + quella legacy
    // senza area_key (fallback).
    const ecdlSection = page.locator('.cs-area-section[data-area-key="ecdl"]');
    await expect(ecdlSection).toBeVisible();
    await expect(ecdlSection.locator('.course-card')).toHaveCount(2);
    await expect(ecdlSection.locator(`[data-course-id="${AREA_TEST_CLASSROOM_ECDL.id}"]`)).toBeVisible();
    await expect(ecdlSection.locator(`[data-course-id="${AREA_TEST_CLASSROOM_LEGACY.id}"]`)).toBeVisible();

    // Sezione Reti e Internet: 1 aula.
    const retiSection = page.locator('.cs-area-section[data-area-key="reti-internet"]');
    await expect(retiSection).toBeVisible();
    await expect(retiSection.locator('.course-card')).toHaveCount(1);
    await expect(retiSection.locator(`[data-course-id="${AREA_TEST_CLASSROOM_RETI.id}"]`)).toBeVisible();

    // Nessuna sezione vuota per le Aree senza aule.
    for (const key of EMPTY_AREA_KEYS) {
      await expect(page.locator(`.cs-area-section[data-area-key="${key}"]`)).toHaveCount(0);
    }

    // Ordine sezioni = ordine window.AREAS (ecdl prima di reti-internet).
    const sectionKeys = await page
      .locator('.cs-area-section')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-area-key')));
    expect(sectionKeys).toEqual(['ecdl', 'reti-internet']);
  });

  test('Direttore — Scheda Docente raggruppa le aule esistenti per Area (Fase 4)', async ({ page }) => {
    await mockSupabase(page, {
      role: 'director',
      classrooms: AREA_TEST_CLASSROOMS,
      teachersList: [AREA_TEST_TEACHER],
    });
    await page.goto('/');

    await page.locator('#screen-login').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('#login-email').fill('direttore.e2e@pixelprof.test');
    await page.locator('#login-pwd').fill('qualsiasi-password');
    await page.locator('#login-submit-btn').click();
    await page.locator('#screen-director-dashboard').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('.dd-docenti').click();
    await page.locator('#screen-teacher-mgmt').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('.dd-teacher-list').click();
    await page.locator('#screen-teacher-list').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('.tdc-card').first().waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('.tdc-card').first().click();
    await page.locator('#screen-teacher-detail').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('#tmd-aule-grid .tdc-area-block').first().waitFor({ state: 'visible', timeout: 20000 });

    // Blocco ECDL: 2 aule (idem sopra — incluso il fallback legacy).
    const ecdlBlock = page.locator('#tmd-aule-grid .tdc-area-block[data-area-key="ecdl"]');
    await expect(ecdlBlock).toBeVisible();
    await expect(ecdlBlock.locator('.tdc-aula-toggle-btn')).toHaveCount(2);

    // Blocco Reti e Internet: 1 aula.
    const retiBlock = page.locator('#tmd-aule-grid .tdc-area-block[data-area-key="reti-internet"]');
    await expect(retiBlock).toBeVisible();
    await expect(retiBlock.locator('.tdc-aula-toggle-btn')).toHaveCount(1);

    // Nessun blocco vuoto per le Aree senza aule.
    for (const key of EMPTY_AREA_KEYS) {
      await expect(page.locator(`#tmd-aule-grid .tdc-area-block[data-area-key="${key}"]`)).toHaveCount(0);
    }

    // Ordine blocchi = ordine window.AREAS.
    const blockKeys = await page
      .locator('#tmd-aule-grid .tdc-area-block')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-area-key')));
    expect(blockKeys).toEqual(['ecdl', 'reti-internet']);
  });
});
