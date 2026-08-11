/* ==================================================
   areas-config.js — PixelProf v1.0.0
   Fase 1 — ROADMAP_AREE.md — Fondamenta dati.

   Fonte dati: aree_e_moduli.md (Erasmo, consegna Fase 0 — 5 Aree,
   33 Moduli totali).

   Unica fonte di verità per la struttura Area → Moduli. Aggiungere
   una nuova Area o un nuovo Modulo a un'Area esistente richiede SOLO
   di editare l'array AREAS qui sotto — nessun altro file va toccato
   per la sola definizione dei dati (l'eventuale UI che li consuma,
   Fase 2/3, si aggiorna da sola leggendo questo file).

   ──────────────────────────────────────────────────────────────
   NOTA 1 — CHIAVI MODULO ECDL (CE / OE / WP invariate):
   aree_e_moduli.md propone per i 3 moduli ECDL le chiavi slug
   "computer-essentials" / "online-essentials" / "word". NON sono
   state adottate: il progetto usa già CE/OE/WP come chiave canonica
   in >10 punti (i 5 moduleMap dei loader in game-engine-state.js,
   la colonna module_key di classroom_modules su Supabase, db.stats.
   byMod, MOD_LABEL/ACT_META in game-constants.js, i filename dei
   JSON in data/*). Rinominarle avrebbe richiesto una migrazione dati
   Supabase ad alto rischio (righe classroom_modules/stats_aggregate
   già in produzione) per zero beneficio pratico. Tutti i moduli delle
   ALTRE 4 Aree (nuovi, nessun dato legacy) usano invece la chiave
   slug esatta indicata in aree_e_moduli.md.

   NOTA 2 — contentReady:
   true  → esistono già i JSON di gioco (quiz/speed/abbina/memory/
           completa_frase) in data/ — modulo giocabile oggi.
   false → il modulo esiste a livello curriculare (aree_e_moduli.md lo
           marca "attivo") ma i JSON di gioco non sono stati ancora
           creati ("JSON da realizzare": 30 moduli). È lavoro di
           generazione contenuti separato, fuori scope della roadmap
           tecnica Aree (vedi ROADMAP_AREE.md, nota Fase 0). Le fasi
           UI (2/3) devono trattare questi moduli come "in arrivo" e
           non renderli selezionabili per il gioco finché non
           passano a true.

   NOTA 3 — dataPaths:
   Presente solo per i moduli contentReady:true. Rispecchia
   esattamente i path già hardcoded nei 5 moduleMap di
   game-engine-state.js (QuizLoader, SpeedQuizLoader, AbbinLoader,
   MemoryLoader, CompletaFraseLoader) — NON li sostituisce ancora:
   quei 5 moduleMap restano la fonte di verità attiva per il motore
   di gioco in questa fase. dataPaths qui è solo scaffolding
   preparatorio per l'eventuale refactor "moduleMap derivato da
   config unica" (vedi ROADMAP_AREE.md Fase 1, punto 2) — da eseguire
   quando i JSON dei nuovi moduli saranno pronti, per evitare di
   introdurre ora percorsi verso file che non esistono ancora.
   ================================================== */

const AREAS = [
  {
    key: 'ecdl',
    label: 'ECDL',
    icon: '🖥️',
    description: "Acquisire le competenze fondamentali per utilizzare computer, applicazioni e servizi digitali.",
    modules: [
      {
        key: 'CE', label: 'Computer Essentials', contentReady: true,
        dataPaths: {
          quiz: 'data/quiz/computer_essentials.json',
          speed: 'data/speed_quiz/computer_essentials.json',
          abbina: 'data/abbina/computer_essentials_abbina.json',
          memory: 'data/memory/computer_essentials_memory.json',
          completaFrase: 'data/completa_frase/computer_essentials_completa_frase.json',
        },
      },
      {
        key: 'OE', label: 'Online Essentials', contentReady: true,
        dataPaths: {
          quiz: 'data/quiz/online_essentials.json',
          speed: 'data/speed_quiz/online_essentials.json',
          abbina: 'data/abbina/online_essentials_abbina.json',
          memory: 'data/memory/online_essentials_memory.json',
          completaFrase: 'data/completa_frase/online_essentials_completa_frase.json',
        },
      },
      {
        key: 'WP', label: 'Word Processing', contentReady: true,
        dataPaths: {
          quiz: 'data/quiz/word_processing.json',
          speed: 'data/speed_quiz/word_processing.json',
          abbina: 'data/abbina/word_processing_abbina.json',
          memory: 'data/memory/word_processing_memory.json',
          completaFrase: 'data/completa_frase/word_processing_completa_frase.json',
        },
      },
    ],
  },
  {
    key: 'cyberbullismo-sicurezza-online',
    label: 'Cyberbullismo e Sicurezza Online',
    icon: '🛡️',
    description: 'Riconoscere i rischi nelle relazioni digitali e imparare a proteggersi e agire responsabilmente online.',
    modules: [
      { key: 'identita-reputazione-digitale', label: 'Identità e reputazione digitale', contentReady: false },
      { key: 'cyberbullismo',                 label: 'Cyberbullismo',                   contentReady: false },
      { key: 'hate-speech',                   label: 'Hate Speech',                     contentReady: false },
      { key: 'sexting-revenge-porn',          label: 'Sexting e Revenge Porn',          contentReady: false },
      { key: 'grooming',                      label: 'Grooming',                        contentReady: false },
      { key: 'difendersi-online',             label: 'Difendersi online',               contentReady: false },
    ],
  },
  {
    key: 'cybersecurity',
    label: 'Cybersecurity — Non solo antivirus e password',
    icon: '👤',
    description: 'Sviluppare consapevolezza e competenze per proteggere identità, account, dati e attività digitali.',
    modules: [
      { key: 'fondamenti-cybersecurity',        label: 'Fondamenti di Cybersecurity',       contentReady: false },
      { key: 'sicurezza-account',               label: 'Sicurezza degli Account',           contentReady: false },
      { key: 'protezione-dati',                 label: 'Protezione dei Dati',               contentReady: false },
      { key: 'sicurezza-quotidiana',            label: 'Sicurezza Quotidiana',              contentReady: false },
      { key: 'sicurezza-pagamenti',             label: 'Sicurezza dei Pagamenti',           contentReady: false },
      { key: 'privacy-normative',               label: 'Privacy e Normative',               contentReady: false },
      { key: 'sicurezza-online-social-network', label: 'Sicurezza Online e Social Network', contentReady: false },
      { key: 'nuove-minacce-digitali',          label: 'Nuove Minacce Digitali',            contentReady: false },
    ],
  },
  {
    key: 'reti-internet',
    label: 'Reti e Internet',
    icon: '🌐',
    description: 'Comprendere come funzionano Internet, le reti e le tecnologie che permettono ai dispositivi di comunicare.',
    modules: [
      { key: 'fondamenta-reti',           label: 'Le fondamenta delle reti',             contentReady: false },
      { key: 'tcp-ip',                    label: 'Il protocollo TCP/IP',                 contentReady: false },
      { key: 'dns',                       label: 'DNS: la rubrica di Internet',          contentReady: false },
      { key: 'router-switch-dispositivi', label: 'Router, Switch e dispositivi di rete', contentReady: false },
      { key: 'wifi-reti-wireless',        label: 'Wi-Fi e reti wireless',                contentReady: false },
      { key: 'cloud-networking',          label: 'Cloud Networking',                     contentReady: false },
      { key: 'vpn',                       label: 'VPN e comunicazioni sicure',           contentReady: false },
      { key: 'troubleshooting-reti',      label: 'Troubleshooting delle reti',           contentReady: false },
    ],
  },
  {
    key: 'malware-minacce',
    label: 'Malware e Minacce Informatiche',
    icon: '🦠',
    description: 'Conoscere le principali minacce informatiche, comprenderne il funzionamento e imparare a prevenirle.',
    modules: [
      { key: 'virus',      label: 'Virus',      contentReady: false },
      { key: 'worm',       label: 'Worm',       contentReady: false },
      { key: 'trojan',     label: 'Trojan',     contentReady: false },
      { key: 'spyware',    label: 'Spyware',    contentReady: false },
      { key: 'keylogger',  label: 'Keylogger',  contentReady: false },
      { key: 'ransomware', label: 'Ransomware', contentReady: false },
    ],
  },
];

/* ==================================================
   HELPERS DI LOOKUP
================================================== */

/** Restituisce l'oggetto Area a cui appartiene un modulo, o null. */
function getAreaForModule(moduleKey) {
  return AREAS.find(a => a.modules.some(m => m.key === moduleKey)) || null;
}

/** Restituisce l'array di Moduli di un'Area (chiave), o []. */
function getModulesForArea(areaKey) {
  const area = AREAS.find(a => a.key === areaKey);
  return area ? area.modules : [];
}

/** Restituisce il Modulo (con areaKey/areaLabel/areaIcon aggiunti), o null. */
function getModuleInfo(moduleKey) {
  for (const area of AREAS) {
    const mod = area.modules.find(m => m.key === moduleKey);
    if (mod) return { ...mod, areaKey: area.key, areaLabel: area.label, areaIcon: area.icon };
  }
  return null;
}

/** Restituisce l'oggetto Area dalla sua chiave, o null. */
function getAreaByKey(areaKey) {
  return AREAS.find(a => a.key === areaKey) || null;
}

/** Solo i moduli con contenuti di gioco già pronti (per Area, o su tutte se areaKey omesso). */
function getReadyModules(areaKey) {
  const pool = areaKey ? getModulesForArea(areaKey) : AREAS.flatMap(a => a.modules);
  return pool.filter(m => m.contentReady === true);
}

// Esposizione globale — script classico (non ES module), stesso pattern
// di game-constants.js / game-engine-state.js. Caricare PRIMA di
// courses.js/app.js nelle fasi che consumeranno AREAS (Fase 2+).
window.AREAS = AREAS;
window.AreasConfig = {
  AREAS,
  getAreaForModule,
  getModulesForArea,
  getModuleInfo,
  getAreaByKey,
  getReadyModules,
};
