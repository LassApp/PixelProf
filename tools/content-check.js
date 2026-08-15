#!/usr/bin/env node
/* ==================================================
   content-check.js — PixelProf v1.0.0
   ROADMAP_AREE.md Fase 7.2 — Content tooling.

   Validator/readiness-check per i JSON di gioco dei 31 Moduli
   (5 Aree, vedi js/areas-config.js). Per ciascun modulo verifica i
   6 file attesi (Quiz, Speed Quiz, Abbina, Memory, Completa la
   frase, Vero o Falso):
     - esiste il file?
     - è JSON valido?
     - rispetta lo schema atteso da quel minigioco (stessi controlli
       sostanziali dei `validate` nei 6 loader di game-engine-state.js,
       con qualche controllo aggiuntivo: shape dei singoli item, non
       solo "è un array non vuoto")?
     - per Memory: le immagini referenziate in "term" esistono
       davvero sotto assets/memory/{slug}/?

   Fonte di verità unica: js/areas-config.js (stesso file consumato
   dal browser — vedi export CommonJS aggiunto in coda a quel file,
   guardato da `typeof window`/`typeof module`, zero impatto client).
   Nessun elenco Aree/Moduli duplicato qui.

   Convenzione di naming file (osservata sui 3 moduli ECDL esistenti,
   NOTA 1 in areas-config.js): per i moduli con `dataPaths` esplicito
   (CE/OE/WP + Area Cybersecurity, che usa una struttura a cartelle
   per-modulo dedicata) si usano quei path, tipo per tipo, con fallback
   alla convenzione sotto per i tipi non ancora specificati (es. un
   modulo con "memory" non presente in dataPaths); per tutti gli altri
   moduli (`key` già in forma slug, nessun dataPaths) si deriva:
     data/quiz/{slug}.json
     data/speed_quiz/{slug}.json
     data/abbina/{slug}_abbina.json
     data/memory/{slug}_memory.json
     data/completa_frase/{slug}_completa_frase.json
     data/vero_falso/{slug}.json

   USO:
     node tools/content-check.js            → report leggibile
     node tools/content-check.js --json      → report machine-readable
     npm run content:check                   → alias (package.json)

   EXIT CODE:
     0 → nessuna anomalia (nessun modulo contentReady:true con file
         mancanti/invalidi)
     1 → almeno un'anomalia trovata (utile come step pre-deploy/CI,
         non ancora agganciato a nessun workflow — vedi riepilogo)
   ================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { AREAS } = require(path.join(ROOT, 'js', 'areas-config.js'));

const JSON_FLAG = process.argv.includes('--json');

/* ── Naming convention ──────────────────────────────────────────── */

function slugFor(mod) {
  // CE/OE/WP: slug reale ("computer_essentials", ecc.) diverso dalla
  // key legacy ("CE") — derivato dal dataPaths.quiz già dichiarato.
  if (mod.dataPaths && mod.dataPaths.quiz) {
    return path.basename(mod.dataPaths.quiz, '.json');
  }
  // Tutti gli altri 28 moduli: key già in forma slug (NOTA 1).
  return mod.key;
}

function expectedPaths(mod) {
  const slug = slugFor(mod);
  const conventional = {
    quiz:          `data/quiz/${slug}.json`,
    speed:         `data/speed_quiz/${slug}.json`,
    abbina:        `data/abbina/${slug}_abbina.json`,
    memory:        `data/memory/${slug}_memory.json`,
    completaFrase: `data/completa_frase/${slug}_completa_frase.json`,
    veroFalso:     `data/vero_falso/${slug}.json`,
  };
  if (!mod.dataPaths) return conventional;
  // dataPaths esplicito (oggi CE/OE/WP + Area Cybersecurity, che usa una
  // struttura a cartelle per-modulo diversa dalla convenzione flat sopra):
  // rispettato tipo per tipo, con fallback alla convenzione per i soli
  // tipi non ancora specificati (es. "memory" quando il JSON non esiste
  // ancora) — così un modulo con dataPaths parziale viene comunque
  // controllato correttamente invece di essere dato per "tutto mancante".
  return {
    quiz:          mod.dataPaths.quiz          || conventional.quiz,
    speed:         mod.dataPaths.speed         || conventional.speed,
    abbina:        mod.dataPaths.abbina        || conventional.abbina,
    memory:        mod.dataPaths.memory        || conventional.memory,
    completaFrase: mod.dataPaths.completaFrase || conventional.completaFrase,
    veroFalso:     mod.dataPaths.veroFalso     || conventional.veroFalso,
  };
}

const TYPE_LABELS = {
  quiz: 'Quiz', speed: 'Speed Quiz', abbina: 'Abbina',
  memory: 'Memory', completaFrase: 'Completa la frase', veroFalso: 'Vero o Falso',
};

/* ── Validatori per tipo — stessi controlli sostanziali dei 6 loader
   in game-engine-state.js (validate/normalize), con in più il check
   di forma sui singoli item, non solo "array non vuoto". ─────────── */

function validateQuizLike(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return 'atteso un array non vuoto';
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    if (!r || typeof r.question !== 'string' || !r.question.trim())
      return `item ${i}: "question" mancante o vuota`;
    if (!Array.isArray(r.options) || r.options.length !== 4)
      return `item ${i}: "options" deve avere esattamente 4 elementi`;
    if (!Number.isInteger(r.correctIndex) || r.correctIndex < 0 || r.correctIndex > 3)
      return `item ${i}: "correctIndex" deve essere un intero 0-3`;
    if (typeof r.explanation !== 'string' || !r.explanation.trim())
      return `item ${i}: "explanation" mancante o vuota`;
  }
  return null;
}

function validateAbbina(raw) {
  if (!raw || !Array.isArray(raw.sets) || raw.sets.length === 0)
    return '"sets" mancante o vuoto';
  for (let i = 0; i < raw.sets.length; i++) {
    const set = raw.sets[i];
    if (!Array.isArray(set) || set.length < 2)
      return `sets[${i}]: deve avere almeno 2 coppie term/definition`;
    for (let j = 0; j < set.length; j++) {
      const p = set[j];
      if (!p || typeof p.term !== 'string' || !p.term.trim())
        return `sets[${i}][${j}]: "term" mancante o vuoto`;
      if (typeof p.definition !== 'string' || !p.definition.trim())
        return `sets[${i}][${j}]: "definition" mancante o vuota`;
    }
  }
  return null;
}

/** Ritorna {error, missingImages}. missingImages non invalida di per
 *  sé il JSON (può essere colmato dopo, vedi assets/memory/README2.txt)
 *  — segnalato separatamente come warning nel report. */
function validateMemory(raw, slug) {
  if (!Array.isArray(raw) || raw.length === 0)
    return { error: 'atteso un array non vuoto', missingImages: [] };
  const missingImages = [];
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    if (!r || typeof r.term !== 'string' || !r.term.trim())
      return { error: `item ${i}: "term" (nome file immagine) mancante`, missingImages };
    if (typeof r.definition !== 'string' || !r.definition.trim())
      return { error: `item ${i}: "definition" mancante o vuota`, missingImages };
    const imgAbs = path.join(ROOT, 'assets', 'memory', slug, r.term);
    if (!fs.existsSync(imgAbs)) missingImages.push(r.term);
  }
  return { error: null, missingImages };
}

function validateCompletaFrase(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return 'atteso un array non vuoto';
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    if (!r || typeof r.sentence !== 'string' || !r.sentence.includes('____'))
      return `item ${i}: "sentence" mancante o senza placeholder "____"`;
    if (typeof r.answer !== 'string' || !r.answer.trim())
      return `item ${i}: "answer" mancante o vuota`;
    if (!Array.isArray(r.bank) || !r.bank.includes(r.answer))
      return `item ${i}: "bank" deve contenere il valore di "answer"`;
  }
  return null;
}

function validateVeroFalso(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return 'atteso un array non vuoto';
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    if (!r || typeof r.statement !== 'string' || !r.statement.trim())
      return `item ${i}: "statement" mancante o vuoto`;
    if (typeof r.answer !== 'boolean')
      return `item ${i}: "answer" deve essere booleano (true/false)`;
    if (typeof r.explanation !== 'string' || !r.explanation.trim())
      return `item ${i}: "explanation" mancante o vuota`;
  }
  return null;
}

/* ── Check di un singolo file ───────────────────────────────────── */

function checkFile(relPath, type, slug) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return { status: 'missing', path: relPath };

  let raw;
  try { raw = JSON.parse(fs.readFileSync(abs, 'utf8')); }
  catch (e) { return { status: 'invalid', path: relPath, detail: `JSON non valido: ${e.message}` }; }

  let err = null, missingImages = null;
  if (type === 'quiz' || type === 'speed')       err = validateQuizLike(raw);
  else if (type === 'abbina')                     err = validateAbbina(raw);
  else if (type === 'completaFrase')               err = validateCompletaFrase(raw);
  else if (type === 'veroFalso')                   err = validateVeroFalso(raw);
  else if (type === 'memory') {
    const r = validateMemory(raw, slug);
    err = r.error;
    missingImages = r.missingImages;
  }

  if (err) return { status: 'invalid', path: relPath, detail: err };
  return { status: 'ok', path: relPath, missingImages: (missingImages && missingImages.length) ? missingImages : null };
}

/* ── Scan completo ──────────────────────────────────────────────── */

function scan() {
  const report = { areas: [], summary: { totalModules: 0, fullyReady: 0, inProgress: 0, notStarted: 0, anomalies: [] } };

  AREAS.forEach(area => {
    const areaReport = { key: area.key, label: area.label, icon: area.icon, modules: [] };
    area.modules.forEach(mod => {
      const slug = slugFor(mod);
      const paths = expectedPaths(mod);
      const files = {};
      let okCount = 0;
      Object.keys(paths).forEach(type => {
        const res = checkFile(paths[type], type, slug);
        files[type] = res;
        if (res.status === 'ok') okCount++;
      });

      const modReport = { key: mod.key, label: mod.label, slug, contentReady: !!mod.contentReady, okCount, files };
      areaReport.modules.push(modReport);

      report.summary.totalModules++;
      if (okCount === 6) report.summary.fullyReady++;
      else if (okCount === 0) report.summary.notStarted++;
      else report.summary.inProgress++;

      // Anomalia: contentReady:true dichiarato ma non tutti i 6 file OK.
      if (mod.contentReady && okCount < 6) {
        const problems = Object.keys(paths)
          .filter(t => files[t].status !== 'ok')
          .map(t => `${TYPE_LABELS[t]} (${files[t].status === 'missing' ? 'mancante' : files[t].detail})`);
        report.summary.anomalies.push({ area: area.label, module: mod.label, key: mod.key, problems });
      }
    });
    report.areas.push(areaReport);
  });

  return report;
}

/* ── Output leggibile ───────────────────────────────────────────── */

function printReport(report) {
  console.log('\n=== PixelProf — Content Readiness Check (Fase 7.2) ===\n');

  report.areas.forEach(area => {
    console.log(`${area.icon}  ${area.label}`);
    area.modules.forEach(mod => {
      const icon = mod.okCount === 6 ? '✅' : mod.okCount === 0 ? '⬜' : '⚠️ ';
      const readyTag = mod.contentReady ? '' : '  (in arrivo — contentReady:false)';
      console.log(`  ${icon} ${mod.label.padEnd(38)} ${mod.okCount}/6${readyTag}`);

      // Dettaglio riga-per-riga solo se non è "tutto ok" e non è "tutto vuoto atteso"
      const showDetail = mod.okCount > 0 && mod.okCount < 6;
      const showAnomaly = mod.contentReady && mod.okCount < 6;
      if (showDetail || showAnomaly) {
        Object.keys(mod.files).forEach(type => {
          const f = mod.files[type];
          const fIcon = f.status === 'ok' ? '✅' : f.status === 'missing' ? '❌' : '❌';
          const label = f.status === 'ok'
            ? (f.missingImages ? `OK (${f.missingImages.length} immagine/i mancante/i: ${f.missingImages.join(', ')})` : 'OK')
            : f.status === 'missing' ? 'FILE MANCANTE' : f.detail;
          console.log(`      ${fIcon} ${TYPE_LABELS[type].padEnd(20)} ${f.path.padEnd(52)} ${label}`);
        });
      }
    });
    console.log('');
  });

  console.log('=== RIEPILOGO ===');
  console.log(`Moduli totali:                 ${report.summary.totalModules}`);
  console.log(`Completi e validi (6/6):       ${report.summary.fullyReady}`);
  console.log(`In lavorazione (1-5/6):        ${report.summary.inProgress}`);
  console.log(`Non iniziati (0/6):            ${report.summary.notStarted}`);

  if (report.summary.anomalies.length) {
    console.log(`\n⚠️  ANOMALIE — contentReady:true ma con file mancanti/invalidi: ${report.summary.anomalies.length}`);
    report.summary.anomalies.forEach(a => {
      console.log(`   - [${a.area}] ${a.module} (${a.key}): ${a.problems.join('; ')}`);
    });
  } else {
    console.log('\n✅ Nessuna anomalia: tutti i moduli contentReady:true hanno i 6 file completi e validi.');
  }
  console.log('');
}

/* ── Entry point ─────────────────────────────────────────────────── */

const report = scan();

if (JSON_FLAG) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printReport(report);
}

process.exit(report.summary.anomalies.length ? 1 : 0);
