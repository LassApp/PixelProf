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
        desc: 'Le basi: rischio, minaccia e superficie d\'attacco',
        tags: ['Minacce digitali', 'Rischio e vulnerabilità', 'Superficie d\'attacco', 'Fattore umano'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/quiz_fondamenti-cybersecurity.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/speedquiz_fondamenti-cybersecurity.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/abbina_fondamenti-cybersecurity.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/completa_la_frase_fondamenti-cybersecurity.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo1/vero_o_falso_fondamenti-cybersecurity.json',
        },
      cardArt: `
<!-- shield -->
<path d="M220,28 L266,44 L266,96 Q266,138 220,158 Q174,138 174,96 L174,44 Z"
      fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
<!-- CIA triangle nodes -->
<line x1="220" y1="62" x2="197" y2="108" stroke="currentColor" stroke-width=".8" opacity=".45"/>
<line x1="220" y1="62" x2="243" y2="108" stroke="currentColor" stroke-width=".8" opacity=".45"/>
<line x1="197" y1="108" x2="243" y2="108" stroke="currentColor" stroke-width=".8" opacity=".45"/>
<circle cx="220" cy="62" r="7" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1" opacity=".65"/>
<circle cx="197" cy="108" r="7" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1" opacity=".6"/>
<circle cx="243" cy="108" r="7" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1" opacity=".6"/>
<text x="220" y="66" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor" opacity=".8">C</text>
<text x="197" y="112" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor" opacity=".75">I</text>
<text x="243" y="112" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor" opacity=".75">A</text>
<!-- padlock -->
<rect x="28" y="108" width="36" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
<path d="M34,108 v-10 a12,12 0 0 1 24,0 v10" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/>
<circle cx="46" cy="122" r="2.4" fill="currentColor" opacity=".5"/>
<!-- trace -->
<line x1="64" y1="122" x2="120" y2="122" stroke="currentColor" stroke-width=".8" opacity=".35" stroke-dasharray="2,3"/>
<text x="220" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">CIA</text>
      `,
      },
      {
        key: 'sicurezza-account', label: 'Sicurezza degli Account', icon: '🔑', contentReady: true,
        desc: 'Password, MFA e passkey per accessi sicuri',
        tags: ['Password sicure', 'Password Manager', 'MFA', 'Passkey'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/quiz_sicurezza-account.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/speedquiz_sicurezza-account.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/abbina_sicurezza-account.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/completa_la_frase_sicurezza-account.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo2/vero_o_falso_sicurezza-account.json',
        },
      cardArt: `
<!-- main padlock -->
<rect x="182" y="72" width="72" height="56" rx="8" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
<path d="M194,72 v-14 a24,24 0 0 1 48,0 v14" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".45"/>
<circle cx="207" cy="96" r="3" fill="currentColor" opacity=".55"/>
<circle cx="218" cy="96" r="3" fill="currentColor" opacity=".5"/>
<circle cx="229" cy="96" r="3" fill="currentColor" opacity=".45"/>
<!-- 2FA token chip -->
<rect x="28" y="52" width="66" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
<rect x="34" y="62" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width=".8" opacity=".55"/>
<rect x="46" y="62" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width=".8" opacity=".45"/>
<rect x="58" y="62" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width=".8" opacity=".55"/>
<rect x="70" y="62" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<!-- auth flow dashed link -->
<line x1="94" y1="70" x2="182" y2="96" stroke="currentColor" stroke-width=".8" opacity=".3" stroke-dasharray="3,3"/>
<!-- fingerprint arcs -->
<path d="M45,130 a16,16 0 1 1 0,0.1" fill="none" stroke="currentColor" stroke-width=".8" opacity=".35"/>
<path d="M45,130 m-10,0 a10,10 0 1 1 0,0.1" fill="none" stroke="currentColor" stroke-width=".8" opacity=".3"/>
<text x="218" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">2FA</text>
      `,
      },
      {
        key: 'protezione-dati', label: 'Protezione dei Dati', icon: '🗄️', contentReady: true,
        desc: 'Backup, regola 3-2-1 e cifratura dei dati',
        tags: ['Backup', 'Regola 3-2-1', 'Disaster Recovery', 'Cifratura dati'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/quiz_protezione-dati.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/speedquiz_protezione-dati.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/abbina_protezione-dati.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/completa_la_frase_protezione-dati.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo3/vero_o_falso_protezione-dati.json',
        },
      cardArt: `
<!-- db cylinder -->
<ellipse cx="216" cy="46" rx="42" ry="12" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="174" y1="46" x2="174" y2="122" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
<line x1="258" y1="46" x2="258" y2="122" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
<path d="M174,84 a42,12 0 0 0 84,0" fill="none" stroke="currentColor" stroke-width=".8" opacity=".35"/>
<ellipse cx="216" cy="122" rx="42" ry="12" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<!-- lock overlay (cifratura) -->
<rect x="200" y="104" width="24" height="18" rx="3" fill="#0c1420" stroke="currentColor" stroke-width="1" opacity=".7"/>
<path d="M204,104 v-6 a8,8 0 0 1 16,0 v6" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/>
<!-- backup refresh arrow -->
<path d="M48,90 a20,20 0 1 1 -4,12" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
<polygon points="44,98 48,86 58,94" fill="currentColor" opacity=".45"/>
<!-- data blocks flowing -->
<rect x="90" y="70" width="8" height="8" fill="none" stroke="currentColor" stroke-width=".7" opacity=".4"/>
<rect x="106" y="80" width="8" height="8" fill="none" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<rect x="122" y="70" width="8" height="8" fill="none" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<text x="216" y="148" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".55" font-weight="bold">BACKUP</text>
      `,
      },
      {
        key: 'sicurezza-quotidiana', label: 'Sicurezza Quotidiana', icon: '📱', contentReady: true,
        desc: 'Smartphone, app e Wi-Fi in sicurezza ogni giorno',
        tags: ['QR Code malevoli', 'Chiavette USB', 'Download e allegati', 'Wi-Fi pubblici'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/quiz_sicurezza_quotidiana.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/speedquiz_sicurezza_quotidiana.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/abbina_sicurezza_quotidiana.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/completa_la_frase_sicurezza_quotidiana.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo4/vero_o_falso_sicurezza_quotidiana.json',
        },
      cardArt: `
<!-- phone -->
<rect x="188" y="26" width="66" height="128" rx="11" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
<rect x="196" y="38" width="50" height="86" rx="2" fill="none" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<rect x="213" y="132" width="16" height="3" rx="1.5" fill="currentColor" opacity=".4"/>
<!-- sensor ring -->
<circle cx="221" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/>
<!-- app grid -->
<circle cx="206" cy="52" r="3.4" fill="none" stroke="currentColor" stroke-width=".7" opacity=".45"/>
<circle cx="221" cy="52" r="3.4" fill="none" stroke="currentColor" stroke-width=".7" opacity=".4"/>
<circle cx="236" cy="52" r="3.4" fill="none" stroke="currentColor" stroke-width=".7" opacity=".45"/>
<circle cx="206" cy="67" r="3.4" fill="none" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<circle cx="221" cy="67" r="3.4" fill="none" stroke="currentColor" stroke-width=".7" opacity=".4"/>
<circle cx="236" cy="67" r="3.4" fill="none" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<!-- wifi arcs -->
<circle cx="54" cy="138" r="2.2" fill="currentColor" opacity=".55"/>
<path d="M42,138 a17,17 0 0 1 24,0" fill="none" stroke="currentColor" stroke-width=".9" opacity=".4"/>
<path d="M34,138 a29,29 0 0 1 40,0" fill="none" stroke="currentColor" stroke-width=".8" opacity=".28"/>
<!-- bluetooth glyph -->
<path d="M64,72 v28 l10,-9 l-16,-12 l16,-12 l-10,-9 z" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<text x="221" y="176" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity="0" font-weight="bold">APP</text>
<text x="130" y="30" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".5" font-weight="bold">APP</text>
      `,
      },
      {
        key: 'sicurezza-pagamenti', label: 'Sicurezza dei Pagamenti', icon: '💳', contentReady: true,
        desc: 'Carte, contactless e frodi nei pagamenti digitali',
        tags: ['Contactless e NFC', 'Truffe online', 'Clonazione carta', 'Autenticazione forte'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/quiz_sicurezza-pagamenti.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/speedquiz_sicurezza-pagamenti.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/abbina_sicurezza-pagamenti.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/completa_la_frase_sicurezza-pagamenti.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo5/vero_o_falso_sicurezza-pagamenti.json',
        },
      cardArt: `
<!-- card -->
<rect x="146" y="58" width="112" height="70" rx="9" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
<rect x="146" y="76" width="112" height="10" fill="currentColor" opacity=".14"/>
<rect x="158" y="98" width="20" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/>
<line x1="158" y1="103" x2="178" y2="103" stroke="currentColor" stroke-width=".6" opacity=".4"/>
<line x1="192" y1="112" x2="230" y2="112" stroke="currentColor" stroke-width="1" opacity=".3"/>
<!-- contactless waves -->
<path d="M266,78 a24,24 0 0 1 0,32" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
<path d="M274,70 a36,36 0 0 1 0,48" fill="none" stroke="currentColor" stroke-width=".8" opacity=".3"/>
<!-- shield-check badge -->
<path d="M56,86 L80,94 L80,114 Q80,130 56,140 Q32,130 32,114 L32,94 Z"
      fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1" opacity=".55"/>
<path d="M44,112 l8,8 l14,-16" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".65" stroke-linecap="round" stroke-linejoin="round"/>
<text x="202" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">PAY</text>
      `,
      },
      {
        key: 'privacy-normative', label: 'Privacy e Normative', icon: '⚖️', contentReady: true,
        desc: 'GDPR, cookie e tutela dei dati personali',
        tags: ['GDPR', 'Cookie e tracciamento', 'Profilazione', 'Diritti digitali'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/quiz_privacy-normative.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/speedquiz_privacy-normative.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/abbina_privacy-normative.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/completa_la_frase_privacy-normative.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo6/vero_o_falso_privacy-normative.json',
        },
      cardArt: `
<!-- scale -->
<line x1="216" y1="34" x2="216" y2="122" stroke="currentColor" stroke-width="1.2" opacity=".5"/>
<line x1="176" y1="50" x2="256" y2="50" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="180" y1="50" x2="180" y2="70" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<line x1="252" y1="50" x2="252" y2="70" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<path d="M168,70 a12,10 0 0 0 24,0 z" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
<path d="M240,70 a12,10 0 0 0 24,0 z" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
<polygon points="200,122 232,122 222,134 210,134" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<!-- document -->
<rect x="38" y="46" width="52" height="68" rx="3" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="46" y1="60" x2="82" y2="60" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<line x1="46" y1="70" x2="82" y2="70" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<line x1="46" y1="80" x2="70" y2="80" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<rect x="55" y="92" width="18" height="14" rx="2" fill="#0c1420" stroke="currentColor" stroke-width=".9" opacity=".6"/>
<path d="M58,92 v-5 a6,6 0 0 1 12,0 v5" fill="none" stroke="currentColor" stroke-width=".9" opacity=".55"/>
<text x="216" y="150" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".55" font-weight="bold">GDPR</text>
      `,
      },
      {
        key: 'sicurezza-online-social-network', label: 'Sicurezza Online e Social Network', icon: '💬', contentReady: true,
        desc: 'Reputazione e rischi sui social network',
        tags: ['Oversharing', 'Furto di identità', 'Account compromessi', 'Reputazione digitale'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/quiz_sicurezza-online-social-network.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/speedquiz_sicurezza-online-social-network.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/abbina_sicurezza-online-social-network.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/completa_la_frase_sicurezza-online-social-network.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo7/vero_o_falso_sicurezza-online-social-network.json',
        },
      cardArt: `
<!-- bubble 1 -->
<path d="M182,42 h64 a8,8 0 0 1 8,8 v34 a8,8 0 0 1 -8,8 h-40 l-12,12 v-12 h-12 a8,8 0 0 1 -8,-8 v-34 a8,8 0 0 1 8,-8 z"
      fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="192" y1="58" x2="240" y2="58" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<line x1="192" y1="68" x2="228" y2="68" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<!-- bubble 2 with heart -->
<path d="M204,92 h56 a7,7 0 0 1 7,7 v26 a7,7 0 0 1 -7,7 h-10 v10 l-11,-10 h-35 a7,7 0 0 1 -7,-7 v-26 a7,7 0 0 1 7,-7 z"
      fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".5"/>
<path d="M223,108 c-3,-4 -9,-1 -9,4 c0,5 9,9 9,9 s9,-4 9,-9 c0,-5 -6,-8 -9,-4 z" fill="currentColor" opacity=".4"/>
<!-- network nodes (people) -->
<circle cx="46" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
<path d="M34,92 a12,10 0 0 1 24,0" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<circle cx="46" cy="122" r="6" fill="none" stroke="currentColor" stroke-width=".9" opacity=".4"/>
<path d="M36,140 a10,8 0 0 1 20,0" fill="none" stroke="currentColor" stroke-width=".9" opacity=".35"/>
<line x1="58" y1="75" x2="182" y2="60" stroke="currentColor" stroke-width=".7" opacity=".3" stroke-dasharray="2,3"/>
<line x1="58" y1="118" x2="204" y2="110" stroke="currentColor" stroke-width=".7" opacity=".3" stroke-dasharray="2,3"/>
<text x="222" y="150" text-anchor="middle" font-family="monospace" font-size="8.5" fill="currentColor" opacity=".55" font-weight="bold">SOCIAL</text>
      `,
      },
      {
        key: 'nuove-minacce-digitali', label: 'Nuove Minacce Digitali', icon: '⚠️', contentReady: true,
        desc: 'Deepfake, IA generativa e nuove minacce digitali',
        tags: ['AI generativa', 'Deepfake', 'Clonazione vocale', 'Fake news'],
        dataPaths: {
          quiz: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/quiz_nuove-minacce-digitali.json',
          speed: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/speedquiz_nuove-minacce-digitali.json',
          abbina: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/abbina_nuove-minacce-digitali.json',
          completaFrase: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/completa_la_frase_nuove-minacce-digitali.json',
          veroFalso: 'data/Cybersecurity_Non_solo_antivirus_e_password/modulo8/vero_o_falso_nuove-minacce-digitali.json',
        },
      cardArt: `
<!-- warning triangle -->
<polygon points="236,28 272,90 200,90" fill="currentColor" fill-opacity=".04" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="236" y1="46" x2="236" y2="70" stroke="currentColor" stroke-width="1.4" opacity=".55"/>
<circle cx="236" cy="80" r="1.8" fill="currentColor" opacity=".55"/>
<!-- glitched face -->
<circle cx="80" cy="76" r="26" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
<path d="M54,120 a26,20 0 0 1 52,0" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<line x1="52" y1="66" x2="108" y2="70" stroke="currentColor" stroke-width="1" opacity=".4" stroke-dasharray="6,3"/>
<line x1="48" y1="86" x2="112" y2="82" stroke="currentColor" stroke-width="1" opacity=".35" stroke-dasharray="4,4"/>
<rect x="88" y="60" width="14" height="8" fill="#0c1420" opacity=".85"/>
<!-- circuit brain -->
<path d="M160,120 q-10,-14 4,-20 q4,-8 14,-4 q10,-6 16,4 q12,2 8,14 q6,10 -6,14 q-2,8 -12,4 q-10,6 -16,-4 q-12,0 -8,-8 z"
      fill="none" stroke="currentColor" stroke-width=".9" opacity=".4"/>
<line x1="168" y1="112" x2="178" y2="120" stroke="currentColor" stroke-width=".6" opacity=".35"/>
<line x1="182" y1="110" x2="182" y2="124" stroke="currentColor" stroke-width=".6" opacity=".3"/>
<text x="236" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">AI</text>
      `,
      },
    ],
  },
  {
    key: 'reti-internet',
    label: 'Reti e Internet',
    icon: '🌐',
    description: 'Comprendere come funzionano Internet, le reti e le tecnologie che permettono ai dispositivi di comunicare.',
    modules: [
      {
        key: 'fondamenta-reti', label: 'Le fondamenta delle reti', icon: '🕸️', contentReady: true,
        desc: 'Reti, Internet e come viaggiano i dati',
        tags: ['Tipi di rete', 'Come viaggiano i dati', 'Client e Server', 'Indirizzi IP'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo1/quiz_fondamenta-reti.json',
          speed: 'data/Reti_e_Internet/modulo1/speedquiz_fondamenta-reti.json',
          abbina: 'data/Reti_e_Internet/modulo1/abbina_fondamenta-reti.json',
          completaFrase: 'data/Reti_e_Internet/modulo1/completa_la_frase_fondamenta-reti.json',
          veroFalso: 'data/Reti_e_Internet/modulo1/vero_o_falso_fondamenta-reti.json',
        },
      cardArt: `
<!-- server rack -->
<rect x="196" y="46" width="60" height="80" rx="4" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="204" y1="60" x2="248" y2="60" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<line x1="204" y1="76" x2="248" y2="76" stroke="currentColor" stroke-width=".8" opacity=".35"/>
<line x1="204" y1="92" x2="248" y2="92" stroke="currentColor" stroke-width=".8" opacity=".35"/>
<line x1="204" y1="108" x2="248" y2="108" stroke="currentColor" stroke-width=".8" opacity=".3"/>
<circle cx="212" cy="60" r="1.6" fill="currentColor" opacity=".6"/>
<circle cx="212" cy="76" r="1.6" fill="currentColor" opacity=".55"/>
<!-- client nodes (star topology) -->
<circle cx="60" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
<circle cx="40" cy="94" r="9" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
<circle cx="66" cy="136" r="9" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
<line x1="68" y1="54" x2="196" y2="66" stroke="currentColor" stroke-width=".7" opacity=".3" stroke-dasharray="2,3"/>
<line x1="49" y1="94" x2="196" y2="86" stroke="currentColor" stroke-width=".7" opacity=".3" stroke-dasharray="2,3"/>
<line x1="74" y1="132" x2="196" y2="106" stroke="currentColor" stroke-width=".7" opacity=".3" stroke-dasharray="2,3"/>
<text x="226" y="150" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor" opacity=".55" font-weight="bold">192.168.x.x</text>
      `,
      },
      {
        key: 'tcp-ip', label: 'Il protocollo TCP/IP', icon: '🔀', contentReady: true,
        desc: 'TCP, UDP e il viaggio dei pacchetti dati',
        tags: ['TCP e UDP', 'Porte di rete', 'HTTP e HTTPS', 'Dal browser al server'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo2/quiz_tcp-ip.json',
          speed: 'data/Reti_e_Internet/modulo2/speedquiz_tcp-ip.json',
          abbina: 'data/Reti_e_Internet/modulo2/abbina_tcp-ip.json',
          completaFrase: 'data/Reti_e_Internet/modulo2/completa_la_frase_tcp-ip.json',
          veroFalso: 'data/Reti_e_Internet/modulo2/vero_o_falso_tcp-ip.json',
        },
      cardArt: `
<!-- protocol stack -->
<rect x="176" y="30" width="86" height="18" rx="3" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".5"/>
<rect x="176" y="52" width="86" height="18" rx="3" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".45"/>
<rect x="176" y="74" width="86" height="18" rx="3" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".4"/>
<rect x="176" y="96" width="86" height="18" rx="3" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".35"/>
<text x="219" y="43" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".7">APP</text>
<text x="219" y="65" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".65">TCP/UDP</text>
<text x="219" y="87" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".6">IP</text>
<text x="219" y="109" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".55">LINK</text>
<!-- handshake arrows -->
<line x1="40" y1="60" x2="140" y2="60" stroke="currentColor" stroke-width="1" opacity=".4"/>
<polygon points="140,60 132,56 132,64" fill="currentColor" opacity=".4"/>
<text x="90" y="54" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".5">SYN</text>
<line x1="140" y1="80" x2="40" y2="80" stroke="currentColor" stroke-width="1" opacity=".35"/>
<polygon points="40,80 48,76 48,84" fill="currentColor" opacity=".35"/>
<text x="90" y="94" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".45">ACK</text>
<text x="90" y="140" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">TCP/IP</text>
      `,
      },
      {
        key: 'dns', label: 'DNS: la rubrica di Internet', icon: '📖', contentReady: true,
        desc: 'La rubrica che traduce i nomi in indirizzi IP',
        tags: ['Domini e IP', 'Risoluzione DNS', 'Cache DNS', 'Sicurezza DNS'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo3/quiz_dns.json',
          speed: 'data/Reti_e_Internet/modulo3/speedquiz_dns.json',
          abbina: 'data/Reti_e_Internet/modulo3/abbina_dns.json',
          completaFrase: 'data/Reti_e_Internet/modulo3/completa_la_frase_dns.json',
          veroFalso: 'data/Reti_e_Internet/modulo3/vero_o_falso_dns.json',
        },
      cardArt: `
<!-- address book -->
<rect x="34" y="40" width="60" height="80" rx="5" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="44" y1="56" x2="84" y2="56" stroke="currentColor" stroke-width=".7" opacity=".4"/>
<line x1="44" y1="70" x2="84" y2="70" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<line x1="44" y1="84" x2="84" y2="84" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<line x1="44" y1="98" x2="70" y2="98" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<circle cx="34" cy="56" r="2" fill="currentColor" opacity=".5"/>
<!-- lookup arrow -->
<line x1="100" y1="80" x2="176" y2="80" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
<polygon points="176,80 168,76 168,84" fill="currentColor" opacity=".45"/>
<text x="138" y="72" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".5">query</text>
<!-- domain to ip -->
<rect x="184" y="60" width="86" height="40" rx="6" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".5"/>
<text x="227" y="78" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor" opacity=".65">sito.it</text>
<line x1="200" y1="84" x2="254" y2="84" stroke="currentColor" stroke-width=".6" opacity=".3" stroke-dasharray="2,2"/>
<text x="227" y="94" text-anchor="middle" font-family="monospace" font-size="7" fill="currentColor" opacity=".55">93.184.x.x</text>
<text x="227" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">DNS</text>
      `,
      },
      {
        key: 'router-switch-dispositivi', label: 'Router, Switch e dispositivi di rete', icon: '📡', contentReady: true,
        desc: 'Router, switch e dispositivi che collegano la rete',
        tags: ['Router e Switch', 'NAT', 'DHCP', 'La rete di casa'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo4/quiz_router-switch-dispositivi.json',
          speed: 'data/Reti_e_Internet/modulo4/speedquiz_router-switch-dispositivi.json',
          abbina: 'data/Reti_e_Internet/modulo4/abbina_router-switch-dispositivi.json',
          completaFrase: 'data/Reti_e_Internet/modulo4/completa_la_frase_router-switch-dispositivi.json',
          veroFalso: 'data/Reti_e_Internet/modulo4/vero_o_falso_router-switch-dispositivi.json',
        },
      cardArt: `
<!-- router -->
<rect x="176" y="70" width="90" height="34" rx="6" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<circle cx="188" cy="87" r="2" fill="currentColor" opacity=".55"/>
<circle cx="198" cy="87" r="2" fill="currentColor" opacity=".5"/>
<circle cx="208" cy="87" r="2" fill="currentColor" opacity=".45"/>
<!-- antenna waves -->
<line x1="230" y1="70" x2="230" y2="50" stroke="currentColor" stroke-width="1" opacity=".5"/>
<path d="M216,50 a18,18 0 0 1 28,0" fill="none" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<path d="M208,42 a30,30 0 0 1 44,0" fill="none" stroke="currentColor" stroke-width=".7" opacity=".28"/>
<!-- switch ports row -->
<rect x="186" y="112" width="70" height="14" rx="2" fill="none" stroke="currentColor" stroke-width=".8" opacity=".45"/>
<line x1="192" y1="112" x2="192" y2="126" stroke="currentColor" stroke-width=".6" opacity=".3"/>
<line x1="202" y1="112" x2="202" y2="126" stroke="currentColor" stroke-width=".6" opacity=".3"/>
<line x1="212" y1="112" x2="212" y2="126" stroke="currentColor" stroke-width=".6" opacity=".3"/>
<line x1="222" y1="112" x2="222" y2="126" stroke="currentColor" stroke-width=".6" opacity=".3"/>
<!-- devices left -->
<rect x="34" y="60" width="26" height="18" rx="2" fill="none" stroke="currentColor" stroke-width=".9" opacity=".4"/>
<rect x="34" y="92" width="26" height="18" rx="2" fill="none" stroke="currentColor" stroke-width=".9" opacity=".35"/>
<line x1="60" y1="69" x2="176" y2="82" stroke="currentColor" stroke-width=".6" opacity=".28" stroke-dasharray="2,3"/>
<line x1="60" y1="101" x2="176" y2="92" stroke="currentColor" stroke-width=".6" opacity=".28" stroke-dasharray="2,3"/>
<text x="221" y="150" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".55" font-weight="bold">LAN</text>
      `,
      },
      {
        key: 'wifi-reti-wireless', label: 'Wi-Fi e reti wireless', icon: '📶', contentReady: true,
        desc: 'Wi-Fi, bande di frequenza e sicurezza wireless',
        tags: ['Bande di frequenza', 'SSID e accesso', 'Sicurezza Wi-Fi', 'Segnale e interferenze'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo5/quiz_wifi-reti-wireless.json',
          speed: 'data/Reti_e_Internet/modulo5/speedquiz_wifi-reti-wireless.json',
          abbina: 'data/Reti_e_Internet/modulo5/abbina_wifi-reti-wireless.json',
          completaFrase: 'data/Reti_e_Internet/modulo5/completa_la_frase_wifi-reti-wireless.json',
          veroFalso: 'data/Reti_e_Internet/modulo5/vero_o_falso_wifi-reti-wireless.json',
        },
      cardArt: `
<!-- wifi arcs large -->
<circle cx="220" cy="118" r="2.4" fill="currentColor" opacity=".6"/>
<path d="M204,118 a16,16 0 0 1 32,0" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<path d="M192,118 a28,28 0 0 1 56,0" fill="none" stroke="currentColor" stroke-width="1" opacity=".38"/>
<path d="M180,118 a40,40 0 0 1 80,0" fill="none" stroke="currentColor" stroke-width=".8" opacity=".26"/>
<!-- device -->
<rect x="204" y="122" width="32" height="20" rx="3" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".5"/>
<!-- ssid chip -->
<rect x="34" y="48" width="80" height="24" rx="12" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1" opacity=".45"/>
<text x="74" y="64" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor" opacity=".6">CasaWiFi</text>
<!-- lock -->
<rect x="52" y="90" width="24" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
<path d="M58,90 v-6 a6,6 0 0 1 12,0 v6" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
<text x="220" y="160" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".55" font-weight="bold">WPA3</text>
      `,
      },
      {
        key: 'cloud-networking', label: 'Cloud Networking', icon: '☁️', contentReady: true,
        desc: 'Data center, CDN e scalabilità nel cloud',
        tags: ['Data Center', 'CDN', 'Load Balancing', 'Scalabilità'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo6/quiz_cloud-networking.json',
          speed: 'data/Reti_e_Internet/modulo6/speedquiz_cloud-networking.json',
          abbina: 'data/Reti_e_Internet/modulo6/abbina_cloud-networking.json',
          completaFrase: 'data/Reti_e_Internet/modulo6/completa_la_frase_cloud-networking.json',
          veroFalso: 'data/Reti_e_Internet/modulo6/vero_o_falso_cloud-networking.json',
        },
      cardArt: `
<!-- cloud -->
<path d="M170,70 a18,18 0 0 1 34,-10 a14,14 0 0 1 26,10 a14,14 0 0 1 -4,28 h-52 a13,13 0 0 1 -4,-28 z"
      fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<!-- data center racks below -->
<rect x="184" y="100" width="16" height="26" rx="2" fill="none" stroke="currentColor" stroke-width=".8" opacity=".45"/>
<rect x="204" y="100" width="16" height="26" rx="2" fill="none" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<rect x="224" y="100" width="16" height="26" rx="2" fill="none" stroke="currentColor" stroke-width=".8" opacity=".4"/>
<circle cx="190" cy="107" r="1.4" fill="currentColor" opacity=".55"/>
<circle cx="210" cy="107" r="1.4" fill="currentColor" opacity=".5"/>
<circle cx="230" cy="107" r="1.4" fill="currentColor" opacity=".5"/>
<!-- CDN edge nodes -->
<circle cx="48" cy="60" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
<circle cx="40" cy="102" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<circle cx="66" cy="132" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<line x1="54" y1="64" x2="170" y2="76" stroke="currentColor" stroke-width=".6" opacity=".28" stroke-dasharray="2,3"/>
<line x1="47" y1="102" x2="170" y2="90" stroke="currentColor" stroke-width=".6" opacity=".28" stroke-dasharray="2,3"/>
<line x1="72" y1="128" x2="184" y2="104" stroke="currentColor" stroke-width=".6" opacity=".28" stroke-dasharray="2,3"/>
<text x="210" y="150" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".55" font-weight="bold">CLOUD</text>
      `,
      },
      {
        key: 'vpn', label: 'VPN e comunicazioni sicure', icon: '🔐', contentReady: true,
        desc: 'Tunnel sicuri per proteggere le comunicazioni',
        tags: ['Tunnel VPN', 'Tipi di VPN', 'VPN e privacy', 'Limiti delle VPN'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo7/quiz_vpn.json',
          speed: 'data/Reti_e_Internet/modulo7/speedquiz_vpn.json',
          abbina: 'data/Reti_e_Internet/modulo7/abbina_vpn.json',
          completaFrase: 'data/Reti_e_Internet/modulo7/completa_la_frase_vpn.json',
          veroFalso: 'data/Reti_e_Internet/modulo7/vero_o_falso_vpn.json',
        },
      cardArt: `
<!-- tunnel -->
<line x1="60" y1="70" x2="200" y2="50" stroke="currentColor" stroke-width="1" opacity=".4" stroke-dasharray="4,3"/>
<line x1="60" y1="110" x2="200" y2="110" stroke="currentColor" stroke-width="1" opacity=".4" stroke-dasharray="4,3"/>
<!-- endpoints -->
<circle cx="50" cy="90" r="12" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<circle cx="230" cy="80" r="12" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<!-- lock in middle of tunnel -->
<rect x="126" y="70" width="22" height="17" rx="3" fill="#0c1420" stroke="currentColor" stroke-width="1" opacity=".6"/>
<path d="M130,70 v-6 a7,7 0 0 1 14,0 v6" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/>
<text x="140" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">VPN</text>
      `,
      },
      {
        key: 'troubleshooting-reti', label: 'Troubleshooting delle reti', icon: '🛠️', contentReady: true,
        desc: 'Diagnosticare e risolvere i problemi di rete',
        tags: ['Ping', 'Traceroute', 'Ipconfig e Ifconfig', 'Metodo di diagnosi'],
        dataPaths: {
          quiz: 'data/Reti_e_Internet/modulo8/quiz_troubleshooting-reti.json',
          speed: 'data/Reti_e_Internet/modulo8/speedquiz_troubleshooting-reti.json',
          abbina: 'data/Reti_e_Internet/modulo8/abbina_troubleshooting-reti.json',
          completaFrase: 'data/Reti_e_Internet/modulo8/completa_la_frase_troubleshooting-reti.json',
          veroFalso: 'data/Reti_e_Internet/modulo8/vero_o_falso_troubleshooting-reti.json',
        },
      cardArt: `
<!-- terminal window -->
<rect x="160" y="34" width="106" height="76" rx="6" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<circle cx="170" cy="42" r="1.6" fill="currentColor" opacity=".5"/>
<circle cx="176" cy="42" r="1.6" fill="currentColor" opacity=".45"/>
<line x1="168" y1="58" x2="230" y2="58" stroke="currentColor" stroke-width=".7" opacity=".4"/>
<line x1="168" y1="68" x2="248" y2="68" stroke="currentColor" stroke-width=".7" opacity=".35"/>
<line x1="168" y1="78" x2="220" y2="78" stroke="currentColor" stroke-width=".7" opacity=".3"/>
<text x="168" y="98" font-family="monospace" font-size="7" fill="currentColor" opacity=".55">64 bytes: time=12ms</text>
<!-- wrench -->
<path d="M46,60 a12,12 0 1 1 -8,20 l-18,18 -8,-8 18,-18 a12,12 0 0 1 16,-12 z"
      fill="none" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
<text x="213" y="150" text-anchor="middle" font-family="monospace" font-size="9" fill="currentColor" opacity=".55" font-weight="bold">PING</text>
      `,
      },

    ],
  },
  {
    key: 'malware-minacce',
    label: 'Malware e Minacce Informatiche',
    icon: '🦠',
    description: 'Conoscere le principali minacce informatiche, comprenderne il funzionamento e imparare a prevenirle.',
    modules: [
      {
        key: 'malware-e-minacce-informatiche', label: 'Malware e Minacce Informatiche', icon: '🦠', contentReady: true,
        desc: 'Virus, worm, trojan, spyware e keylogger',
        tags: ['Virus e Worm', 'Trojan', 'Spyware', 'Keylogger'],
        dataPaths: {
          quiz: 'data/Malware_e_Minacce_Informatiche/modulo1/quiz_malware-e-minacce-informatiche.json',
          speed: 'data/Malware_e_Minacce_Informatiche/modulo1/speedquiz_malware-e-minacce-informatiche.json',
          abbina: 'data/Malware_e_Minacce_Informatiche/modulo1/abbina_malware-e-minacce-informatiche.json',
          completaFrase: 'data/Malware_e_Minacce_Informatiche/modulo1/completa_la_frase_malware-e-minacce-informatiche.json',
          veroFalso: 'data/Malware_e_Minacce_Informatiche/modulo1/vero_o_falso_malware-e-minacce-informatiche.json',
        },
      cardArt: `
<!-- virus/bug body -->
<ellipse cx="216" cy="80" rx="26" ry="20" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.1" opacity=".5"/>
<line x1="196" y1="64" x2="184" y2="52" stroke="currentColor" stroke-width="1" opacity=".45"/>
<line x1="236" y1="64" x2="248" y2="52" stroke="currentColor" stroke-width="1" opacity=".45"/>
<line x1="192" y1="80" x2="176" y2="80" stroke="currentColor" stroke-width="1" opacity=".4"/>
<line x1="240" y1="80" x2="256" y2="80" stroke="currentColor" stroke-width="1" opacity=".4"/>
<line x1="196" y1="96" x2="184" y2="108" stroke="currentColor" stroke-width="1" opacity=".4"/>
<line x1="236" y1="96" x2="248" y2="108" stroke="currentColor" stroke-width="1" opacity=".4"/>
<circle cx="208" cy="76" r="2" fill="currentColor" opacity=".5"/>
<circle cx="224" cy="76" r="2" fill="currentColor" opacity=".5"/>
<!-- spreading dots (infection) -->
<circle cx="60" cy="54" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>
<circle cx="42" cy="90" r="4" fill="none" stroke="currentColor" stroke-width=".9" opacity=".35"/>
<circle cx="72" cy="120" r="4.5" fill="none" stroke="currentColor" stroke-width=".9" opacity=".35"/>
<line x1="64" y1="58" x2="192" y2="72" stroke="currentColor" stroke-width=".6" opacity=".25" stroke-dasharray="2,3"/>
<line x1="46" y1="90" x2="192" y2="82" stroke="currentColor" stroke-width=".6" opacity=".25" stroke-dasharray="2,3"/>
<line x1="76" y1="118" x2="196" y2="92" stroke="currentColor" stroke-width=".6" opacity=".25" stroke-dasharray="2,3"/>
<!-- shield hint (mitigation) -->
<path d="M50,110 L64,116 L64,128 Q64,138 50,144 Q36,138 36,128 L36,116 Z" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"/>
<text x="216" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="currentColor" opacity=".55" font-weight="bold">MALWARE</text>
      `,
      },

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
