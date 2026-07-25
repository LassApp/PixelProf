/**
 * scripts/serve.js — PixelProf E2E
 *
 * Avvia il server statico sulla radice della repo usando l'API
 * programmatica del pacchetto http-server, invece che passare il
 * percorso come argomento da riga di comando (`npx http-server "<path>"`).
 *
 * PERCHÉ: su Windows un percorso con spazi (es. "...\App 2026\...")
 * passato tramite npx/cmd.exe può essere tokenizzato in modo scorretto
 * a seconda del livello di shell/quoting coinvolto — qui il percorso
 * resta una semplice stringa JavaScript passata alla API.
 *
 * SELF-CHECK: prima di avviare il server, verifica esplicitamente che
 * i file chiave siano fisicamente presenti nella radice calcolata — se
 * manca qualcosa (es. un file spostato per errore in una sottocartella)
 * lo dice subito e chiaramente in console, invece di lasciare che il
 * sintomo emerga solo più tardi come 404 silenzioso nei test.
 */
const fs = require('fs');
const path = require('path');
const httpServer = require('http-server');

// e2e/scripts/serve.js → risale di 2 livelli fino alla radice della repo
// (quella che contiene index.html, pixelprof.css, js/, data/, assets/).
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.PIXELPROF_E2E_PORT) || 4174;

console.log(`[e2e] Radice servita: ${REPO_ROOT}`);

const filesToCheck = ['index.html', 'pixelprof.css', 'js/app.js', 'data/quiz/computer_essentials.json'];
let anyMissing = false;
for (const rel of filesToCheck) {
  const full = path.join(REPO_ROOT, rel);
  const exists = fs.existsSync(full);
  if (!exists) anyMissing = true;
  console.log(`[e2e]   ${rel.padEnd(40)} ${exists ? 'OK' : 'MANCANTE ✗'}`);
}
if (anyMissing) {
  console.error('[e2e] ATTENZIONE: uno o più file attesi non sono nella radice sopra —');
  console.error('[e2e] il server risponderà 404 per quei file. Verifica che e2e/ sia');
  console.error('[e2e] annidata esattamente dentro la radice della repo PixelProf.');
}

const server = httpServer.createServer({
  root: REPO_ROOT,
  cache: -1, // nessuna cache lato browser — utile mentre si modifica l'app
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[e2e] Server statico avviato su http://127.0.0.1:${PORT}`);
});