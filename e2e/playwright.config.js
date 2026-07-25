// playwright.config.js — PixelProf E2E
//
// Serve la repo (index.html, js/, data/, assets/, pixelprof.css) così
// com'è — nessun build step, coerente con l'architettura vanilla JS di
// PixelProf. Il server statico è avviato da scripts/serve.js (API
// programmatica di http-server) invece che da un comando shell
// `npx http-server "<path>"`: su Windows un percorso con spazi (molto
// comune, es. "...\App 2026\...") può essere tokenizzato in modo
// scorretto quando passa attraverso più livelli di shell/quoting
// (npx è a sua volta un .cmd che rilancia un altro processo) — lo
// script Node riceve il percorso come stringa JS, senza ambiguità.
const { defineConfig, devices } = require('@playwright/test');

const PORT = Number(process.env.PIXELPROF_E2E_PORT) || 4174;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false, // smoke test sequenziale, log leggibili in ordine
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/serve.js',
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    stdout: 'pipe', // mostra il self-check di serve.js anche durante `npm test`
    stderr: 'pipe',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});