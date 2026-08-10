/**
 * game-actions.js — PixelProf E2E
 *
 * Azioni riusabili sopra il DOM reale dell'app (nessuna scorciatoia via
 * window.* — passiamo sempre dai click come farebbe un docente davanti
 * alla LIM). Ogni funzione presume lo stato immediatamente precedente
 * del flusso (documentato nel commento di ciascuna).
 *
 * Selettori verificati contro il repo live LassApp/PixelProf (branch
 * main) — vedi index.html, game-engine-state.js, game-quiz.js,
 * game-match.js, game-memory.js, game-fill.js.
 */

const { expect } = require('@playwright/test');

/** Da #step-mod visibile → clicca il modulo, la categoria "Minigiochi",
 *  poi l'attività richiesta. Atterra su #setup-panel visibile. */
async function goToActivity(page, { module = 'CE', activity }) {
  await page.locator(`#mc-${module}`).click();
  await page.locator('#step-cat').waitFor({ state: 'visible' });
  await page.locator('.cat-card.cat-games').click();
  await page.locator('#step-act').waitFor({ state: 'visible' });
  await page.locator(`#ac-${activity}`).click();
  await page.locator('#setup-panel').waitFor({ state: 'visible' });
}

/** Solo per Quiz/Speed Quiz: sceglie il numero di domande (#setup-num visibile). */
async function selectQuestionCount(page, n = 5) {
  await page.locator(`#nb-${n}`).click();
}

/** Modalità individuale: crea/seleziona un giocatore e avvia la sessione.
 *  Presume che modalità+numero (se richiesto) siano già impostati o
 *  vengano impostati da questa stessa chiamata (modalità sempre qui). */
async function setupIndividualAndStart(page, playerName = 'Alunno E2E') {
  await page.locator('#mb-ind').click();
  await page.locator('#ps-ind').waitFor({ state: 'visible' });
  const input = page.locator('#ind-inp');
  await input.fill(playerName);
  await input.press('Enter'); // onkeydown Enter → addInd()
  const startBtn = page.locator('#start-btn');
  await expect(startBtn).toBeEnabled({ timeout: 10000 });
  await startBtn.click();
}

// ══════════════════════════════════════════════════════════════════
// QUIZ (normale)
// ══════════════════════════════════════════════════════════════════

/** Risponde a `count` domande (clic sulla prima opzione + "Prossima"),
 *  poi attende la schermata risultati. */
async function playQuizQuestions(page, count) {
  await page.locator('#qz-game').waitFor({ state: 'visible' });
  for (let i = 0; i < count; i++) {
    await page.locator('.opt').first().click();
    const nextBtn = page.locator('#next-btn');
    await nextBtn.waitFor({ state: 'visible' });
    await nextBtn.click();
  }
  await page.locator('#qz-result .result-wrap').waitFor({ state: 'visible', timeout: 15000 });
}

// ══════════════════════════════════════════════════════════════════
// SPEED QUIZ — stesso schermo del Quiz normale (#qz-game), ma con
// pulsante pausa (#qz-pause-btn) e avanzamento automatico (no #next-btn)
// ══════════════════════════════════════════════════════════════════

async function answerOneSpeedQuestion(page) {
  await page.locator('.opt').first().click();
  // ansQ() in modalità speed avanza da solo dopo 500ms — attendiamo
  // che la domanda successiva sia pronta (nuove .opt riabilitate) o
  // che si arrivi ai risultati.
  await page.waitForTimeout(700);
}

/** Verifica che la pausa Speed Quiz mostri l'overlay e la ripresa lo nasconda. */
async function togglePauseAndResumeSpeedQuiz(page) {
  const overlay = page.locator('#qz-pause-overlay');
  const pauseBtn = page.locator('#qz-pause-btn');
  await expect(overlay).toBeHidden();
  await pauseBtn.click();
  await expect(overlay).toBeVisible();
  await pauseBtn.click();
  await expect(overlay).toBeHidden();
}

// ══════════════════════════════════════════════════════════════════
// ABBINA (Match)
// ══════════════════════════════════════════════════════════════════

/** Clicca un termine e una definizione qualsiasi (corretto o sbagliato
 *  non importa per uno smoke test: verifichiamo la reattività della UI,
 *  non la correttezza del gioco). */
async function playOneMatchAttempt(page) {
  await page.locator('.match-cols .match-item').first().waitFor({ state: 'visible' });
  const terms = page.locator('#match-cols-wrap > div').nth(0).locator('.match-item');
  const defs = page.locator('#match-cols-wrap > div').nth(1).locator('.match-item');
  await terms.first().click();
  await defs.first().click();
  await page.locator('#mfb').waitFor({ state: 'attached' });
}

async function togglePauseAndResumeMatch(page) {
  const overlay = page.locator('#match-paused-overlay');
  const pauseBtn = page.locator('#match-pause-btn');
  await expect(overlay).toBeHidden();
  await pauseBtn.click();
  await expect(overlay).toBeVisible();
  await pauseBtn.click();
  await expect(overlay).toBeHidden();
}

// ══════════════════════════════════════════════════════════════════
// MEMORY
// ══════════════════════════════════════════════════════════════════

/** Gira due carte qualsiasi (coppia o meno non importa per lo smoke test). */
async function flipTwoMemoryCards(page) {
  await page.locator('#mem-board-grid .mem-c').first().waitFor({ state: 'visible' });
  await page.locator('#mc0').click();
  await page.waitForTimeout(150);
  await page.locator('#mc1').click();
}

async function togglePauseAndResumeMemory(page) {
  const overlay = page.locator('#mem-paused-overlay');
  const pauseBtn = page.locator('#mem-pause-btn');
  await expect(overlay).toBeHidden();
  await pauseBtn.click();
  await expect(overlay).toBeVisible();
  await pauseBtn.click();
  await expect(overlay).toBeHidden();
}

// ══════════════════════════════════════════════════════════════════
// COMPLETA LA FRASE (Fill)
// ══════════════════════════════════════════════════════════════════

/** Risponde a `count` frasi scegliendo sempre la prima parola della
 *  banca (giusta o sbagliata non importa per lo smoke test). */
async function playFillQuestions(page, count) {
  for (let i = 0; i < count; i++) {
    await page.locator('.word-bank .chip').first().waitFor({ state: 'visible' });
    await page.locator('.word-bank .chip').first().click();
    await page.locator('#g-area button.btn-neon:has-text("Verifica")').click();
    await page.waitForTimeout(1100); // checkFill() attende 1s prima di passare alla successiva
  }
}

/** Vero o Falso: risponde sempre "Vero" per `count` domande e clicca
 *  "Prosegui" dopo ciascuna (nessun auto-avanzamento — il docente decide
 *  quando passare oltre). Non verifica la correttezza — è compito dei
 *  test unitari; qui verifichiamo solo che il flusso di gioco avanzi
 *  senza bloccarsi. */
async function playTrueFalseQuestions(page, count) {
  for (let i = 0; i < count; i++) {
    await page.locator('.tf-btn.tf-true').waitFor({ state: 'visible' });
    await page.locator('.tf-btn.tf-true').click();
    const nextBtn = page.locator('#tf-next-btn');
    await nextBtn.waitFor({ state: 'visible' });
    await nextBtn.click();
  }
}

// ══════════════════════════════════════════════════════════════════
// USCITA DA UN MINIGIOCO — dialog di conferma condiviso da tutti
// (raddoppia anche da test di pausa/ripresa "universale": aprire il
// dialog mette in pausa il gioco sottostante, "No, continua" lo riprende).
// ══════════════════════════════════════════════════════════════════

/** Clicca "Esci" nell'header di gioco, verifica il dialog, poi annulla
 *  ("No, continua") — usato come ulteriore verifica pausa/ripresa.
 *  NOTA: ":visible" è necessario perché sia il Quiz (#qz-game) sia i
 *  giochi in #g-area (Abbina/Memory/Completa) montano un proprio
 *  `.game-exit-btn` nello stesso DOM — quello inattivo resta presente
 *  ma nascosto (display:none), non rimosso. Senza ":visible" il
 *  locator generico risolve a 2 elementi → strict mode violation. */
async function exitDialogCancelIsResume(page, exitButtonSelector) {
  await page.locator(`${exitButtonSelector}:visible`).click();
  const overlay = page.locator('#pp-dialog-overlay');
  await expect(overlay).toBeVisible();
  await page.locator('#pp-dialog-no').click();
  await expect(overlay).toBeHidden();
}

/** Clicca "Esci", conferma "Sì, esci" → torna a #step-mod. */
async function exitGameConfirm(page, exitButtonSelector) {
  await page.locator(`${exitButtonSelector}:visible`).click();
  const overlay = page.locator('#pp-dialog-overlay');
  await expect(overlay).toBeVisible();
  await page.locator('#pp-dialog-yes').click();
  await page.locator('#step-mod').waitFor({ state: 'visible', timeout: 15000 });
}

module.exports = {
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
};
