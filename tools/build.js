#!/usr/bin/env node
/**
 * tools/build.js — PixelProf v1.0.0
 *
 * Concatena + minifica i 17 script "classici" (non-module) caricati
 * in fondo a index.html in un unico file js/app.bundle.min.js, con
 * sourcemap dedicata. Riscrive il tag <script> in index.html in modo
 * idempotente (rieseguibile più volte senza duplicare nulla).
 *
 * COSA NON VIENE TOCCATO (di proposito):
 *   - I 4 script ES module in testa a index.html (supabase_client.js,
 *     auth.js, db_adapter.js, game_hooks.js): sono già deferred per
 *     specifica (type="module"), uno di essi importa da un URL remoto
 *     (esm.sh/@supabase/supabase-js) e bundlarli richiederebbe un vero
 *     module bundler (esbuild/rollup) — fuori perimetro per questa
 *     modifica. Restano 4 file separati, invariati.
 *   - Tutti i sorgenti in js/*.js: NON vengono cancellati né spostati.
 *     Restano la fonte di verità per l'editing — il bundle è un
 *     artefatto generato, mai modificato a mano.
 *
 * PERCHÉ NESSUN mangle DEI NOMI GLOBALI:
 *   index.html usa decine di onclick="nomeFunzione(...)" inline che
 *   chiamano funzioni globali per nome testuale (es. onclick="selMod('CE')").
 *   Se Terser rinominasse gli identificatori di primo livello (mangle
 *   toplevel), quegli onclick smetterebbero di funzionare silenziosamente.
 *   mangle.toplevel resta quindi esplicitamente false: si minificano
 *   spazi/commenti/variabili LOCALI alle funzioni, non i nomi globali.
 *
 * USO:
 *   npm install      (una tantum, o dopo aver aggiornato terser)
 *   npm run build
 *
 * REGOLA D'ORO: dopo QUALSIASI modifica a uno dei file elencati in
 * BUNDLE_FILES, va rilanciato `npm run build` prima di aprire l'app
 * nel browser o lanciare `npm test` in e2e/ — altrimenti si testa/
 * pubblica codice vecchio, perché GitHub Pages serve solo il bundle
 * committato, non i sorgenti js/*.js.
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.resolve(__dirname, '..');
const JS_DIR = path.join(ROOT, 'js');
const OUT_JS = path.join(JS_DIR, 'app.bundle.min.js');
const OUT_MAP = path.join(JS_DIR, 'app.bundle.min.js.map');
const INDEX_HTML = path.join(ROOT, 'index.html');
const PKG = require(path.join(ROOT, 'package.json'));

// Ordine ESATTO in cui questi file compaiono oggi in index.html.
// L'ordine è significativo: sono script classici che condividono lo
// stesso scope globale (var/function di un file sono usati da altri
// file successivi) — cambiare l'ordine può rompere l'app.
const BUNDLE_FILES = [
  'audio-manager.js',
  'theme-manager.js',
  'onboarding.js',
  'game-constants.js',
  'areas-config.js',
  'scoring.js',
  'game-engine-state.js',
  'renderer.js',
  'stats.js',
  'dashboard.js',
  'badges.js',
  'game-quiz.js',
  'game-match.js',
  'game-memory.js',
  'game-fill.js',
  'game-truefalse.js',
  'flip-card.js',
  'act-select.js',
  'courses.js',
  'app.js',
  'csv-import.js',
];

async function build() {
  // ── 1. Verifica presenza di tutti i file prima di procedere ──
  const missing = BUNDLE_FILES.filter(f => !fs.existsSync(path.join(JS_DIR, f)));
  if (missing.length) {
    console.error('[build] File mancante o non disponibile:', missing.join(', '));
    process.exit(1);
  }

  // ── 2. Legge i sorgenti, calcola la dimensione totale pre-build ──
  const sources = {};
  let totalBefore = 0;
  for (const f of BUNDLE_FILES) {
    const content = fs.readFileSync(path.join(JS_DIR, f), 'utf8');
    sources[f] = content;
    totalBefore += Buffer.byteLength(content, 'utf8');
  }

  // ── 3. Minifica tutti i file INSIEME (API multi-file di Terser) ──
  // Passare un oggetto {nomefile: codice} invece di concatenare prima
  // a mano permette a Terser di produrre una sourcemap che punta ai
  // file originali — utile per il debug in DevTools anche a bundle
  // minificato.
  const result = await minify(sources, {
    ecma: 2020,
    module: false,
    compress: {
      // Non tocca side-effect impliciti (window.X=..., IIFE, top-level
      // che leggono il DOM subito) — default conservativo di Terser.
      drop_console: false,   // i log '[PixelProf] ...' restano: servono in produzione per il debug
      drop_debugger: true,
    },
    mangle: {
      toplevel: false,       // CRITICO — vedi commento in testa al file
      keep_fnames: false,    // i nomi locali possono essere accorciati liberamente
    },
    format: {
      comments: false,
      preamble: `/* PixelProf — bundle generato automaticamente da tools/build.js. NON modificare a mano: le modifiche vanno fatte nei singoli file in js/ poi si rilancia "npm run build". v${PKG.version} */`,
    },
    sourceMap: {
      filename: 'app.bundle.min.js',
      url: 'app.bundle.min.js.map',
    },
  });

  if (result.error) {
    console.error('[build] Errore Terser:', result.error);
    process.exit(1);
  }

  fs.writeFileSync(OUT_JS, result.code, 'utf8');
  fs.writeFileSync(OUT_MAP, result.map, 'utf8');

  const totalAfter = Buffer.byteLength(result.code, 'utf8');

  // ── 4. Verifica sintattica del bundle prodotto (node --check equivalente) ──
  try {
    // eslint-disable-next-line no-new-func
    new Function(result.code);
  } catch (e) {
    console.error('[build] Il bundle generato NON è sintatticamente valido:', e.message);
    process.exit(1);
  }

  // ── 5. Riscrive index.html in modo idempotente ──
  let html = fs.readFileSync(INDEX_HTML, 'utf8');
  const newTag = `<script src="js/app.bundle.min.js?v=${PKG.version}"></script>`;
  const bundleTagRegex = /<script src="js\/app\.bundle\.min\.js(\?v=[^"]*)?"><\/script>/;
  const legacyBlockRegex = new RegExp(
    BUNDLE_FILES.map(f => `<script src="js/${f.replace('.', '\\.')}"></script>`).join('\\s*\\r?\\n\\s*')
  );

  if (bundleTagRegex.test(html)) {
    html = html.replace(bundleTagRegex, newTag);
    console.log('[build] index.html: tag bundle esistente aggiornato (versione).');
  } else if (legacyBlockRegex.test(html)) {
    html = html.replace(legacyBlockRegex, newTag);
    console.log('[build] index.html: blocco dei 17 <script> sostituito con il bundle.');
  } else {
    console.error('[build] Impossibile trovare né il blocco <script> legacy né il tag bundle in index.html.');
    console.error('[build] index.html potrebbe essere stato modificato manualmente — controllo necessario prima di procedere.');
    process.exit(1);
  }
  fs.writeFileSync(INDEX_HTML, html, 'utf8');

  // ── 6. Riepilogo ──
  const pct = Math.round((1 - totalAfter / totalBefore) * 100);
  console.log('');
  console.log('[build] OK —', BUNDLE_FILES.length, 'file → 1 bundle');
  console.log(`[build] Dimensione: ${(totalBefore / 1024).toFixed(1)} KB → ${(totalAfter / 1024).toFixed(1)} KB (-${pct}%)`);
  console.log('[build] Output: js/app.bundle.min.js + js/app.bundle.min.js.map');
}

build().catch(err => {
  console.error('[build] Fallito:', err);
  process.exit(1);
});
