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
