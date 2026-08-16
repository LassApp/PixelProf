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
      /* contentReady:true dal 15/08/2026 — JSON committati da Erasmo in
         data/Cybersecurity_Non_solo_antivirus_e_password/moduloN/.
         AbbinLoader (game-engine-state.js) supporta due formati per il
         gioco Abbina: "sets" (modulo1-3, storico CE/OE/WP) e "pairs"
         (modulo4-8, nuovo formato con difficulty per round — quello che
         Erasmo userà anche per aggiornare modulo1-3 ed ECDL in seguito).
         Manca solo il file "memory" per tutti gli 8 moduli (non ancora
         creato): dataPaths quindi NON include la chiave memory — stesso
         pattern già in uso per WP (contentReady:true con giochi
         parzialmente pronti). Il pulsante Memory in UI resta visibile per
         uniformità con gli altri moduli; il loader mostrerà la card "non
         disponibile" già prevista per i moduli senza file, finché il
         JSON memory non arriva. */
      {
        key: 'fondamenti-cybersecurity', label: 'Fondamenti di Cybersecurity', icon: '🛡️', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/quiz_fondamenti-cybersecurity.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/speedquiz_fondamenti-cybersecurity.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/abbina_fondamenti-cybersecurity.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/completa_la_frase_fondamenti-cybersecurity.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/vero_o_falso_fondamenti-cybersecurity.json',
        },
      },
      {
        key: 'sicurezza-account', label: 'Sicurezza degli Account', icon: '🔑', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/quiz_sicurezza-account.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/speedquiz_sicurezza-account.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/abbina_sicurezza-account.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/completa_la_frase_sicurezza-account.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/vero_o_falso_sicurezza-account.json',
        },
      },
      {
        key: 'protezione-dati', label: 'Protezione dei Dati', icon: '🗄️', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/quiz_protezione-dati.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/speedquiz_protezione-dati.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/abbina_protezione-dati.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/completa_la_frase_protezione-dati.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/vero_o_falso_protezione-dati.json',
        },
      },
      {
        key: 'sicurezza-quotidiana', label: 'Sicurezza Quotidiana', icon: '📱', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/quiz_sicurezza_quotidiana.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/speedquiz_sicurezza_quotidiana.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/abbina_sicurezza_quotidiana.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/completa_la_frase_sicurezza_quotidiana.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/vero_o_falso_sicurezza_quotidiana.json',
        },
      },
      {
        key: 'sicurezza-pagamenti', label: 'Sicurezza dei Pagamenti', icon: '💳', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/quiz_sicurezza-pagamenti.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/speedquiz_sicurezza-pagamenti.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/abbina_sicurezza-pagamenti.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/completa_la_frase_sicurezza-pagamenti.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/vero_o_falso_sicurezza-pagamenti.json',
        },
      },
      {
        key: 'privacy-normative', label: 'Privacy e Normative', icon: '⚖️', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/quiz_privacy-normative.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/speedquiz_privacy-normative.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/abbina_privacy-normative.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/completa_la_frase_privacy-normative.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/vero_o_falso_privacy-normative.json',
        },
      },
      {
        key: 'sicurezza-online-social-network', label: 'Sicurezza Online e Social Network', icon: '💬', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/quiz_sicurezza-online-social-network.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/speedquiz_sicurezza-online-social-network.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/abbina_sicurezza-online-social-network.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/completa_la_frase_sicurezza-online-social-network.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/vero_o_falso_sicurezza-online-social-network.json',
        },
      },
      {
        key: 'nuove-minacce-digitali', label: 'Nuove Minacce Digitali', icon: '⚠️', contentReady: true,
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/quiz_nuove-minacce-digitali.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/speedquiz_nuove-minacce-digitali.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/abbina_nuove-minacce-digitali.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/completa_la_frase_nuove-minacce-digitali.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/vero_o_falso_nuove-minacce-digitali.json',
        },
      },
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
// `typeof window` è undefined in Node (tooling, vedi sotto) — guardato
// per evitare ReferenceError lì, zero impatto nel browser dove window
// esiste sempre.
if (typeof window !== 'undefined') {
  window.AREAS = AREAS;
  window.AreasConfig = {
    AREAS,
    getAreaForModule,
    getModulesForArea,
    getModuleInfo,
    getAreaByKey,
    getReadyModules,
  };
}

// Export CommonJS — SOLO per tooling Node (es. tools/content-check.js,
// Fase 7.2). `typeof module` è undefined nel browser: questo branch non
// viene mai eseguito lato client, zero impatto sul runtime dell'app.
// Evita di duplicare l'array AREAS in un secondo file di config per il
// tool: stessa unica fonte di verità di NOTA 1 in cima a questo file.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AREAS,
    getAreaForModule,
    getModulesForArea,
    getModuleInfo,
    getAreaByKey,
    getReadyModules,
  };
}
