/**
 * smoke.spec.js — PixelProf E2E
 *
 * "Uno script che ripete questi check ad ogni release" (roadmap:
 * Infrastruttura/qualità → Smoke test automatizzato).
 *
 * Copre in un'unica corsa, con Supabase completamente mockato
 * (vedi support/mock-supabase.js):
 *   1. Login docente
 *   2. Ingresso in aula
 *   3. Quiz               (+ pausa/ripresa via dialog di uscita)
 *   4. Speed Quiz         (+ pausa/ripresa via pulsante dedicato)
 *   5. Abbina             (+ pausa/ripresa via pulsante dedicato)
 *   6. [SALTATO — v8.9.2: Memory in pausa, tasto disattivato in tutta
 *      l'app. Vedi blocco commentato più sotto: NON cancellato, va
 *      riattivato non appena il tasto #ac-memory torna cliccabile.]
 *   7. Completa la frase  (+ pausa/ripresa via dialog di uscita)
 *   8. Vero o Falso       (+ pausa/ripresa via dialog di uscita)
 *   9. Uscita dall'app (logout)
 *
 * Ogni fase è isolata con test.step() per una lettura rapida del report
 * HTML in caso di fallimento — si vede subito QUALE fase si è rotta,
 * come i 3 bug diversi trovati testando manualmente l'hub in passato.
 *
 * Non verifica la correttezza del punteggio/della logica di gioco
 * (quello è compito dei test unitari) — verifica che l'utente possa
 * effettivamente attraversare ogni schermata senza restare bloccato,
 * che i pulsanti di pausa mostrino/nascondano l'overlay corretto, e
 * che si possa sempre uscire in sicurezza.
 */
const { test, expect } = require('./support/fixtures');
const {
  goToActivity,
  selectQuestionCount,
  setupIndividualAndStart,
  playQuizQuestions,
  answerOneSpeedQuestion,
  togglePauseAndResumeSpeedQuiz,
  playOneMatchAttempt,
  togglePauseAndResumeMatch,
  flipTwoMemoryCards,
  togglePauseAndResumeMemory,
  playFillQuestions,
  playTrueFalseQuestions,
  exitDialogCancelIsResume,
  exitGameConfirm,
} = require('./support/game-actions');

test.setTimeout(60000);

test('flusso completo: login → entra in aula → ogni minigioco → pausa/riprendi → uscita', async ({
  aulaPage: page,
}) => {
  // La fixture aulaPage ha già eseguito login + ingresso in aula:
  // siamo su #step-mod visibile.
  await test.step('Ingresso in aula riuscito (#step-mod visibile)', async () => {
    await expect(page.locator('#step-mod')).toBeVisible();
    await expect(page.locator('#tb-course-name')).toHaveText('Aula Smoke Test');
  });

  await test.step('Quiz — gioca, pausa/riprendi via dialog di uscita, termina', async () => {
    await goToActivity(page, { module: 'CE', activity: 'quiz' });
    await selectQuestionCount(page, 5);
    await setupIndividualAndStart(page, 'Alunno Quiz');
    await expect(page.locator('#qz-game')).toBeVisible();

    // Prima domanda
    await page.locator('.opt').first().click();
    await page.locator('#next-btn').click();

    // A metà quiz: il dialog di uscita deve mettere in pausa, "No,
    // continua" deve riprendere lasciando il quiz esattamente dov'era.
    await exitDialogCancelIsResume(page, '#qz-game .game-exit-btn');
    await expect(page.locator('#qz-game')).toBeVisible();
    await expect(page.locator('.opt').first()).toBeEnabled();

    // Completa le 4 domande rimanenti
    await playQuizQuestions(page, 4);
    await expect(page.locator('#qz-result .result-wrap')).toBeVisible();

    await page.locator('.result-wrap .btn-row button:has-text("Home")').click();
    await expect(page.locator('#step-mod')).toBeVisible();
  });

  await test.step('Speed Quiz — gioca, pausa/riprendi via pulsante dedicato, esci', async () => {
    await goToActivity(page, { module: 'CE', activity: 'speed' });
    await selectQuestionCount(page, 5);
    await setupIndividualAndStart(page, 'Alunno Speed');
    await expect(page.locator('#qz-game')).toBeVisible();
    await expect(page.locator('#qz-timer')).toBeVisible();

    await answerOneSpeedQuestion(page);
    await togglePauseAndResumeSpeedQuiz(page);
    await exitGameConfirm(page, '#qz-game .game-exit-btn');
  });

  await test.step('Abbina — gioca, pausa/riprendi via pulsante dedicato, esci', async () => {
    await goToActivity(page, { module: 'CE', activity: 'match' });
    await setupIndividualAndStart(page, 'Alunno Abbina');
    await expect(page.locator('#match-cols-wrap')).toBeVisible();

    await playOneMatchAttempt(page);
    await togglePauseAndResumeMatch(page);
    await exitGameConfirm(page, '.game-exit-btn');
  });

  // v8.9.2: Memory è in pausa (tasto #ac-memory disattivato in tutta
  // l'app, index.html). Step commentato, NON cancellato — riattivare
  // rimuovendo il blocco /* */ non appena il tasto torna cliccabile.
  /*
  await test.step('Memory — gioca, pausa/riprendi via pulsante dedicato, esci', async () => {
    await goToActivity(page, { module: 'CE', activity: 'memory' });
    await setupIndividualAndStart(page, 'Alunno Memory');
    await expect(page.locator('#mem-board-grid')).toBeVisible();

    await flipTwoMemoryCards(page);
    await togglePauseAndResumeMemory(page);
    await exitGameConfirm(page, '.game-exit-btn');
  });
  */

  await test.step('Completa la frase — gioca, pausa/riprendi via dialog di uscita, esci', async () => {
    await goToActivity(page, { module: 'CE', activity: 'fill' });
    // v8.12.1: 'fill' ora richiede la selezione "Quante domande?" (era
    // mancante — vedi game-engine-state.js needsNum) prima che
    // #start-btn si abiliti, stesso comportamento di quiz/speed/truefalse.
    await selectQuestionCount(page, 5);
    await setupIndividualAndStart(page, 'Alunno Fill');
    await expect(page.locator('.fill-sent')).toBeVisible();

    await playFillQuestions(page, 2);

    await exitDialogCancelIsResume(page, '.game-exit-btn');
    await exitGameConfirm(page, '.game-exit-btn');
  });

  await test.step('Vero o Falso — gioca, pausa/riprendi via dialog di uscita, esci', async () => {
    await goToActivity(page, { module: 'CE', activity: 'truefalse' });
    await selectQuestionCount(page, 5);
    await setupIndividualAndStart(page, 'Alunno VeroFalso');
    await expect(page.locator('.tf-btns')).toBeVisible();

    await playTrueFalseQuestions(page, 2);

    await exitDialogCancelIsResume(page, '.game-exit-btn');
    await exitGameConfirm(page, '.game-exit-btn');
  });

  await test.step('Uscita dall\'app (logout)', async () => {
    await expect(page.locator('#step-mod')).toBeVisible();
    await page.locator('#tb-user-badge .cs-logout-btn').click();

    const overlay = page.locator('#pp-dialog-overlay');
    await expect(overlay).toBeVisible();
    await page.locator('#pp-dialog-yes').click();

    await expect(page.locator('#screen-login')).toBeVisible({ timeout: 15000 });
  });
});
