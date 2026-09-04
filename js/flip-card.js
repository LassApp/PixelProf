/* ==================================================
   flip-card.js — PixelProf v8.23.0 (Didattica · Flip Card)
   Prima "attività didattica" di PixelProf, accanto ai
   Minigiochi: mazzo di carte domanda/risposta con flip 3D,
   caricato da CSV dedicati per modulo + livello.

   v8.23.0: FIX path di caricamento CSV (bug segnalato — Flip Card
   funzionava solo per Computer Essentials, "Errore caricamento" o
   card grigia per tutto il resto).
     - FLIPCARD_MODULE_MAP: a CE (unico modulo presente finora)
       mancava il segmento "Didattica/" nel path — puntava a
       data/Flip_Card/... invece di data/Didattica/Flip_Card/...
       (root reale, confermata da Flip_Card.md e dal repo).
     - Aggiunte le 40 chiavi mancanti (OE/WP/SS/PP + 8 Cybersecurity +
       8 Reti_e_Internet + 1 Malware + 6 Cyberbullismo + 13 AI) — path
       "pronti" verso i CSV, che Erasmo caricherà mano a mano. Finché
       assenti, il fetch dà 404 → startFlipCard() lo gestisce già
       (vedi più sotto) mostrando la card "Flip Card non disponibile",
       mai un errore JS. Stesso pattern già adottato in
       game-engine-state.js v5.1.0 per i minigiochi JSON.
     - ATTENZIONE naming: la cartella Word Processing per Flip Card è
       "ECDL/Word" (NON "ECDL/Word_Processing" come nei minigiochi
       JSON) — così documentato in Flip_Card.md, rispettato alla
       lettera pur essendo asimmetrico rispetto ai path JSON.
     - ATTENZIONE chiavi: per Cyberbullismo e Intelligenza Artificiale,
       Flip_Card.md usa alcune Chiavi diverse da quelle già presenti
       in areas-config.js (es. doc 'cittadinanza-digitale' vs codice
       'difendersi-online'; 7 casi simili in AI). Usate qui le chiavi
       già in areas-config.js (uniche che il motore riconosce per
       instradare sMod) — stesso disallineamento già segnalato per i
       minigiochi JSON, non ancora risolto da Erasmo.

   v8.20.0: richiesta esplicita utente, indipendente dal tour guidato —
   torna ai moduli/Hub (Classifica/Progressi/Storico/Panoramica Classe/
   Traguardi) ora chiedono conferma prima di interrompere una sessione
   Flip Card attiva, stessa UX già presente per i minigiochi (isGameActive
   + ppConfirm) e per il pulsante Esci di questo file (ppConfirmBox).
   Nuove isFlipCardActive()/confirmExitFlipCard() qui; goHome()/goTab()
   in game-engine-state.js le richiamano con un ramo aggiuntivo ciascuna —
   ESPANSIONE DI SCOPO ESPLICITA, rompe volutamente l'isolamento
   dichiarato più sotto ("nessuna riga aggiunta ai file core"): vedi
   commento esteso sopra isFlipCardActive() per il perché è inevitabile.

   v8.19.3: bug segnalato — anche il tasto Hub (apre il menu con
   Classifica/Progressi/Storico/Panoramica Classe) soffriva dello stesso
   problema del v8.19.2 qui sotto: durante il gap di caricamento restava
   cliccabile per davvero, e da lì si poteva navigare via da Flip Card
   (es. verso Classifica) rompendo il tour. Aggiunto #tb-hub-btn a
   FC_TOUR_RISK_SELECTORS — stesso identico meccanismo, nessun altro
   cambiamento.

   v8.19.2: bug segnalato — gap di 1-2s tra l'avanzamento del tour
   guidato al click sulla card livello e il caricamento reale del mazzo
   CSV, durante cui il pulsante Esci (già presente nel placeholder di
   caricamento) e la topbar (torna ai moduli/logo PixelProf/logout)
   restavano cliccabili per davvero senza alcuna protezione del tour —
   un click reale su uno di questi rompeva il tour in modo
   irrecuperabile. Nuovi helper _fcFreezeNavForTour()/
   _fcUnfreezeNavForTour(), richiamati da startFlipCard() solo durante il
   gap reale e solo se l'utente ha ancora il tour da fare
   (OnboardingTour.isActive(), nuovo in onboarding.js v2.5.2). Vedi
   commenti inline più sotto per il dettaglio.

   v8.19.1: exitFlipCardConfirm() ora forza la conferma (niente
   Annulla) quando il tour guidato è esattamente sul passo dedicato —
   vedi js/onboarding.js v2.4.1 e ppConfirmBox() in
   game-engine-state.js (nuova opzione opts.forceConfirm).

   v8.19.0: 3 hook aggiunti per il tour guidato (richiesta
   esplicita utente, vedi js/onboarding.js v2.4.0) —
   _renderFlipCardLevelSelect() → showFlipCardLevelStep(),
   _renderFlipCard() → showFlipCardExitStep(),
   exitFlipCardConfirm() → showFlipCardConfirmStep(). File
   isolato: chiamano solo l'API pubblica già esposta da
   window.OnboardingTour, nessuna modifica ai file core.

   File isolato FINO a v8.19.x: nessuna riga di quelle
   funzionalità era stata aggiunta ai file "core" di PixelProf
   (game-engine-state.js, app.js, ecc.) — venivano solo letti.
   Da v8.20.0 non è più vero al 100%: goHome()/goTab() in
   game-engine-state.js hanno un ramo aggiuntivo ciascuna (vedi
   changelog v8.20.0 più sopra) — scelta consapevole, l'unico
   punto dove intercettare quei 6 pulsanti è dove già decidono
   se confermare per i minigiochi.

   v8.17.0: introdotto lo step "scegli livello" (Facile/Medio)
   tra la card "Flip Card" e il mazzo. Ogni modulo è ora
   suddiviso in 4 sotto-argomenti (Modulo1..4 secondo
   Flip_Card.md) che vengono concatenati in un unico mazzo per
   livello — nessuna UI di scelta sotto-argomento: la selezione
   avviene già a monte scegliendo il modulo (CE/OE/WP), come
   per i minigiochi.

   Contenuto:
     - FLIPCARD_MODULE_MAP   modulo -> { facile:[path,...],
                              medio:[path,...] }. Ogni livello è
                              un array di path (i 4 sotto-argomenti
                              di quel modulo): FlipCardLoader li
                              scarica e concatena in un mazzo solo,
                              nell'ordine dell'array (Modulo1..4,
                              nessuno shuffle).
     - _fcParseCsv()          parser CSV robusto (RFC4180-ish)
     - _fcRowsToCards()       righe grezze -> [{q,a}]
     - FlipCardLoader         loader dedicato: stessa forma di
                              _createLoader() in
                              game-engine-state.js (cache,
                              moduleMap, stessa risoluzione
                              path via _resolveJsonPath), ma
                              per testo CSV anziché JSON, con
                              fetch+concat di più file per
                              livello anziché un singolo file.
     - selDidattica/_renderFlipCardLevelSelect/fcSelLevel/
       startFlipCard/_renderFlipCard/fcFlip/fcNav
                              entry point, scelta livello,
                              rendering, stato e navigazione
                              del mazzo

   Depends on (letti, MAI modificati): game-engine-state.js
   (sh, shq, escHtml, showScreen, setTb, sMod, modLabel,
   _resolveJsonPath, goStep). Riusa le classi CSS globali
   .act-back-row/.act-back-btn/.act-context-label/.act-grid/
   .act-card già definite in pixelprof.css (step-act,
   step-didattica): nessuna nuova classe CSS per lo step
   "scegli livello".

   Caricamento: aggiunto a BUNDLE_FILES in tools/build.js,
   subito dopo gli altri game-*.js — stesso meccanismo con
   cui il bundle di produzione carica già tutti i minigiochi.
================================================== */

/* Path CSV per modulo e livello. Struttura:
     <MOD>: { facile: [N path sotto-argomenti], medio: [N path] }
   Fonte: Flip_Card.md (fonte ufficiale e vincolante per Aree/Moduli/
   Chiavi/Path/naming di Flip Card — NON modificare questo file senza
   prima allinearlo lì). Tutti i 41 moduli documentati sono mappati:
   solo Computer Essentials ha CSV reali caricati (8 file); tutti gli
   altri (Online Essentials, Word/Spreadsheet/Presentation, Cybersecurity,
   Reti e Internet, Malware, Cyberbullismo, Intelligenza Artificiale)
   hanno path "pronti" verso CSV non ancora creati — finché Erasmo non
   li carica, il fetch darà 404 e PixelProf mostrerà correttamente la
   card "Errore caricamento" (mai un errore JS non gestito).
   v8.23.0: nota precedente ("path verificati... ATTENZIONE Flip_Card.md
   la documenta in minuscolo, il documento va corretto") superata — il
   file Flip_Card.md è la fonte corretta (data/Didattica/Flip_Card/...,
   F maiuscola); era questo file ad avere il path sbagliato (mancava
   il segmento "Didattica/"), ora corretto. */
const FLIPCARD_MODULE_MAP = {
  CE: {
    facile: [
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo1/Flip_Card_Facile_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo2/Flip_Card_Facile_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo3/Flip_Card_Facile_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo4/Flip_Card_Facile_Modulo_4.csv',
    ],
    medio: [
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo1/Flip_Card_Medio_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo2/Flip_Card_Medio_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo3/Flip_Card_Medio_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo4/Flip_Card_Medio_Modulo_4.csv',
    ],
  },
  OE: {
    facile: [
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo1/Flip_Card_Facile_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo2/Flip_Card_Facile_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo3/Flip_Card_Facile_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo4/Flip_Card_Facile_Modulo_4.csv',
    ],
    medio: [
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo1/Flip_Card_Medio_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo2/Flip_Card_Medio_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo3/Flip_Card_Medio_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo4/Flip_Card_Medio_Modulo_4.csv',
    ],
  },
  WP: {
    facile: [
      'data/Didattica/Flip_Card/ECDL/Word/Modulo1/Flip_Card_Facile_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo2/Flip_Card_Facile_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo3/Flip_Card_Facile_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo4/Flip_Card_Facile_Modulo_4.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo5/Flip_Card_Facile_Modulo_5.csv',
    ],
    medio: [
      'data/Didattica/Flip_Card/ECDL/Word/Modulo1/Flip_Card_Medio_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo2/Flip_Card_Medio_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo3/Flip_Card_Medio_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo4/Flip_Card_Medio_Modulo_4.csv',
      'data/Didattica/Flip_Card/ECDL/Word/Modulo5/Flip_Card_Medio_Modulo_5.csv',
    ],
  },
  SS: {
    facile: [
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo1/Flip_Card_Facile_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo2/Flip_Card_Facile_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo3/Flip_Card_Facile_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo4/Flip_Card_Facile_Modulo_4.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo5/Flip_Card_Facile_Modulo_5.csv',
    ],
    medio: [
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo1/Flip_Card_Medio_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo2/Flip_Card_Medio_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo3/Flip_Card_Medio_Modulo_3.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo4/Flip_Card_Medio_Modulo_4.csv',
      'data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo5/Flip_Card_Medio_Modulo_5.csv',
    ],
  },
  PP: {
    facile: [
      'data/Didattica/Flip_Card/ECDL/Presentation/Modulo1/Flip_Card_Facile_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Presentation/Modulo2/Flip_Card_Facile_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Presentation/Modulo3/Flip_Card_Facile_Modulo_3.csv',
    ],
    medio: [
      'data/Didattica/Flip_Card/ECDL/Presentation/Modulo1/Flip_Card_Medio_Modulo_1.csv',
      'data/Didattica/Flip_Card/ECDL/Presentation/Modulo2/Flip_Card_Medio_Modulo_2.csv',
      'data/Didattica/Flip_Card/ECDL/Presentation/Modulo3/Flip_Card_Medio_Modulo_3.csv',
    ],
  },
  'fondamenti-cybersecurity': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/Flip_Card_Facile_Modulo_1.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/Flip_Card_Medio_Modulo_1.csv'] },
  'sicurezza-account': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/Flip_Card_Facile_Modulo_2.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/Flip_Card_Medio_Modulo_2.csv'] },
  'protezione-dati': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/Flip_Card_Facile_Modulo_3.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/Flip_Card_Medio_Modulo_3.csv'] },
  'sicurezza-quotidiana': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/Flip_Card_Facile_Modulo_4.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/Flip_Card_Medio_Modulo_4.csv'] },
  'sicurezza-pagamenti': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/Flip_Card_Facile_Modulo_5.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/Flip_Card_Medio_Modulo_5.csv'] },
  'privacy-normative': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/Flip_Card_Facile_Modulo_6.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/Flip_Card_Medio_Modulo_6.csv'] },
  'sicurezza-online-social-network': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/Flip_Card_Facile_Modulo_7.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/Flip_Card_Medio_Modulo_7.csv'] },
  'nuove-minacce-digitali': { facile: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/Flip_Card_Facile_Modulo_8.csv'], medio: ['data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/Flip_Card_Medio_Modulo_8.csv'] },
  'fondamenta-reti': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo1/Flip_Card_Facile_Modulo_1.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo1/Flip_Card_Medio_Modulo_1.csv'] },
  'tcp-ip': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo2/Flip_Card_Facile_Modulo_2.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo2/Flip_Card_Medio_Modulo_2.csv'] },
  'dns': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo3/Flip_Card_Facile_Modulo_3.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo3/Flip_Card_Medio_Modulo_3.csv'] },
  'router-switch-dispositivi': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo4/Flip_Card_Facile_Modulo_4.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo4/Flip_Card_Medio_Modulo_4.csv'] },
  'wifi-reti-wireless': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo5/Flip_Card_Facile_Modulo_5.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo5/Flip_Card_Medio_Modulo_5.csv'] },
  'cloud-networking': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo6/Flip_Card_Facile_Modulo_6.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo6/Flip_Card_Medio_Modulo_6.csv'] },
  'vpn': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo7/Flip_Card_Facile_Modulo_7.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo7/Flip_Card_Medio_Modulo_7.csv'] },
  'troubleshooting-reti': { facile: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo8/Flip_Card_Facile_Modulo_8.csv'], medio: ['data/Didattica/Flip_Card/Reti_e_Internet/Modulo8/Flip_Card_Medio_Modulo_8.csv'] },
  'malware-e-minacce-informatiche': { facile: ['data/Didattica/Flip_Card/Malware_e_Minacce_Informatiche/Modulo1/Flip_Card_Facile_Modulo_1.csv'], medio: ['data/Didattica/Flip_Card/Malware_e_Minacce_Informatiche/Modulo1/Flip_Card_Medio_Modulo_1.csv'] },
  'identita-reputazione-digitale': { facile: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo1/Flip_Card_Facile_Modulo_1.csv'], medio: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo1/Flip_Card_Medio_Modulo_1.csv'] },
  'cyberbullismo': { facile: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo2/Flip_Card_Facile_Modulo_2.csv'], medio: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo2/Flip_Card_Medio_Modulo_2.csv'] },
  'hate-speech': { facile: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo3/Flip_Card_Facile_Modulo_3.csv'], medio: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo3/Flip_Card_Medio_Modulo_3.csv'] },
  'sexting-revenge-porn': { facile: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo4/Flip_Card_Facile_Modulo_4.csv'], medio: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo4/Flip_Card_Medio_Modulo_4.csv'] },
  'grooming': { facile: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo5/Flip_Card_Facile_Modulo_5.csv'], medio: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo5/Flip_Card_Medio_Modulo_5.csv'] },
  'difendersi-online': { facile: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo6/Flip_Card_Facile_Modulo_6.csv'], medio: ['data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo6/Flip_Card_Medio_Modulo_6.csv'] },
  'cos-e-ai': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo1/Flip_Card_Facile_Modulo_1.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo1/Flip_Card_Medio_Modulo_1.csv'] },
  'come-funziona-ai': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo2/Flip_Card_Facile_Modulo_2.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo2/Flip_Card_Medio_Modulo_2.csv'] },
  'llm-fondamenti': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo3/Flip_Card_Facile_Modulo_3.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo3/Flip_Card_Medio_Modulo_3.csv'] },
  'ai-generativa': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo4/Flip_Card_Facile_Modulo_4.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo4/Flip_Card_Medio_Modulo_4.csv'] },
  'prompt-engineering': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo5/Flip_Card_Facile_Modulo_5.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo5/Flip_Card_Medio_Modulo_5.csv'] },
  'agenti-automazione': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo6/Flip_Card_Facile_Modulo_6.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo6/Flip_Card_Medio_Modulo_6.csv'] },
  'deepfake-contenuti-sintetici': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo7/Flip_Card_Facile_Modulo_7.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo7/Flip_Card_Medio_Modulo_7.csv'] },
  'provenienza-contenuti': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo8/Flip_Card_Facile_Modulo_8.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo8/Flip_Card_Medio_Modulo_8.csv'] },
  'verificare-ai': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo9/Flip_Card_Facile_Modulo_9.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo9/Flip_Card_Medio_Modulo_9.csv'] },
  'etica-ai': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo10/Flip_Card_Facile_Modulo_10.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo10/Flip_Card_Medio_Modulo_10.csv'] },
  'bias-algoritmici': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo11/Flip_Card_Facile_Modulo_11.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo11/Flip_Card_Medio_Modulo_11.csv'] },
  'ai-act': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo12/Flip_Card_Facile_Modulo_12.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo12/Flip_Card_Medio_Modulo_12.csv'] },
  'futuro-ai': { facile: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo13/Flip_Card_Facile_Modulo_13.csv'], medio: ['data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo13/Flip_Card_Medio_Modulo_13.csv'] },
};

/* -- Parser CSV robusto (RFC4180-ish) --------------------
   Gestisce virgolette, virgolette raddoppiate ("") per il
   escaping, virgole/accenti/apostrofi nel testo, celle
   multilinea tra virgolette, righe vuote e spazi superflui.
   Non presuppone che un semplice split(',') sia sufficiente. */
function _fcParseCsv(text){
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const s = String(text || '').replace(/^\uFEFF/, ''); // rimuove BOM se presente
  for(let i = 0; i < s.length; i++){
    const c = s[i], next = s[i + 1];
    if(inQuotes){
      if(c === '"' && next === '"'){ field += '"'; i++; }
      else if(c === '"'){ inQuotes = false; }
      else field += c;
    } else {
      if(c === '"') inQuotes = true;
      else if(c === ','){ row.push(field); field = ''; }
      else if(c === '\r'){ /* ignorato: il fine riga è gestito da \n */ }
      else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); } // ultima riga senza \n finale
  return rows
    .map(r => r.map(c => c.trim()))
    .filter(r => r.some(c => c.length)); // scarta righe completamente vuote
}

/* Righe grezze -> [{q,a}]. Scarta un'eventuale riga di
   intestazione (domanda,risposta) e le righe senza risposta. */
function _fcRowsToCards(rows){
  if(!rows.length) return [];
  let start = 0;
  const head = (rows[0][0] || '').toLowerCase();
  if(/domanda|question/.test(head)) start = 1;
  const cards = [];
  for(let i = start; i < rows.length; i++){
    const q = rows[i][0], a = rows[i][1];
    if(q && a) cards.push({ q, a });
  }
  return cards;
}

/* -- Loader CSV dedicato -----------------------------------
   Stessa FORMA di _createLoader() in game-engine-state.js
   (cache, moduleMap, stesso _resolveJsonPath per il path) ma
   riscritto qui perché quello è specifico per JSON (.json())
   e per un solo file per modulo — qui servono più file CSV
   (i 4 sotto-argomenti) concatenati in un mazzo per livello.
   Isolato in questo file: nessuna modifica a
   game-engine-state.js. */
const FlipCardLoader = (function(){
  const cache = {}; // chiave "MOD|livello" -> [{q,a},...]
  const LEVELS = ['facile', 'medio'];
  function _key(mod, liv){ return mod + '|' + liv; }
  function _entry(mod){ return FLIPCARD_MODULE_MAP[mod]; }
  async function _load(mod, liv){
    const k = _key(mod, liv);
    if(cache[k]) return cache[k];
    const rels = (_entry(mod) || {})[liv];
    if(!rels || !rels.length) throw new Error('[FlipCard] Livello non registrato: "' + mod + '/' + liv + '".');
    const cards = [];
    for(const rel of rels){
      const url = _resolveJsonPath(rel);
      const res = await fetch(url);
      if(!res.ok) throw new Error(`[FlipCard] HTTP ${res.status} — ${url}`);
      const text = await res.text();
      cards.push(..._fcRowsToCards(_fcParseCsv(text)));
    }
    return cache[k] = cards;
  }
  return {
    load: async (mod, liv) => [...(await _load(mod, liv))],
    isCached: (mod, liv) => !!cache[_key(mod, liv)],
    hasModule: mod => !!_entry(mod),
    // Livelli con almeno un path registrato per quel modulo,
    // nell'ordine "facile, medio" — usato dallo step di scelta
    // livello per abilitare solo le card con contenuti pronti.
    levelsFor: mod => {
      const entry = _entry(mod);
      if(!entry) return [];
      return LEVELS.filter(l => entry[l] && entry[l].length);
    },
  };
})();

/* -- Stato mazzo corrente ---------------------------------- */
let fcState = null; // { cards, idx, flipped, mod, liv }

/* Card di stato (nessun mazzo / vuoto / errore) — riusa le
   stesse classi CSS di _showGameError (.result-wrap, ecc.,
   già in pixelprof.css) per coerenza visiva, ma con un
   pulsante che torna a Didattica invece che alla home: Flip
   Card non ha una "sessione" da abbandonare, quindi non ha
   senso mandare l'utente fino a step-mod. */
function _fcStateHTML({ icon, title, msg, color }){
  return `<div class="result-wrap">
    <div class="result-hero">
      <span class="result-stars" style="font-size:36px">${icon}</span>
      <span class="result-score" style="font-size:20px;color:${color};line-height:1.3">${escHtml(title)}</span>
      <span class="result-label" style="color:${color}99;margin-top:8px;line-height:1.5">${escHtml(msg)}</span>
    </div>
    <div class="btn-row">
      <button class="btn btn-neon" onclick="exitFlipCard()"><i class="ti ti-arrow-left"></i> Torna a Didattica</button>
    </div>
  </div>`;
}

/* Header minimo dedicato — NON riusa buildGameHeader()
   (game-match.js): lì "Ricomincia" chiama restartActivity()
   -> launch(), che richiede sAct/sMode valorizzati come nei
   minigiochi. Flip Card non ha punteggio né sAct/sMode.
   Classe "fc-exit-btn" aggiuntiva (oltre a game-exit-btn):
   quest'ultima da sola è pensata per stare accanto a
   game-restart-btn (più colorato, fa risaltare l'accoppiata);
   qui è da sola ed era poco visibile in dark — fc-exit-btn le
   dà un contrasto proprio, tema viola coerente con Didattica. */
function _fcHeader(){
  return `<div class="game-header">
    <div class="game-header-left">
      <button class="game-exit-btn fc-exit-btn" onclick="exitFlipCardConfirm()"><i class="ti ti-x"></i> Esci</button>
    </div>
  </div>`;
}

/* Uscita diretta, senza conferma: usata dagli stati vuoto/errore
   (nulla da abbandonare, chiedere conferma sarebbe solo attrito)
   e internamente da exitFlipCardConfirm() una volta confermato. */
function exitFlipCard(){
  fcState = null;
  setTb(null);
  showScreen('tab-home');
  goStep('didattica');
}

/* v8.20.0 — richiesta esplicita utente (indipendente dal tour): durante
   una partita ai minigiochi attiva, i pulsanti Hub (Classifica/Progressi/
   Storico/Panoramica Classe/Traguardi) e "torna ai moduli" chiedono
   sempre conferma prima di interrompere — vedi isGameActive()/ppConfirm()
   in game-engine-state.js, richiamati da goHome()/goTab() lì. Durante
   una sessione Flip Card attiva questo non accadeva mai: Flip Card non
   tocca gameState (usa fcState, sistema separato), quindi isGameActive()
   non la vede mai attiva.
   ESPANSIONE DI SCOPO ESPLICITA: per intercettare questi 6 pulsanti serve
   toccare goHome()/goTab() in game-engine-state.js — sono loro a
   decidere se confermare, stessa cosa già succede per i minigiochi.
   Rompe volutamente l'isolamento dichiarato in testa a questo file
   ("nessuna riga aggiunta ai file core"): inevitabile per questa
   richiesta, non c'è modo di intercettarli altrove. Modifica lì ridotta
   al minimo indispensabile: un solo ramo aggiuntivo per funzione, che si
   limita a richiamare le due funzioni qui sotto — tutta la conoscenza di
   cosa sia "Flip Card attiva" e come si comunica resta qui.
   isFlipCardActive(): vero solo quando ci sono DAVVERO carte in
   visualizzazione (fcState valorizzato) — non durante lo step "scegli
   livello" (ancora nessun mazzo caricato, come lo step di setup/scelta
   modalità dei minigiochi, dove infatti isGameActive() è false a sua
   volta: nessuna "sessione" ancora da perdere) né durante il breve gap
   di caricamento (fcState non è ancora stato valorizzato in quel momento
   — coerente col fix v8.19.2/v8.19.3 qui sopra, che copre esattamente
   quella finestra separatamente, solo durante il tour). */
function isFlipCardActive(){
  return document.getElementById('tab-games')?.classList.contains('active') && fcState !== null;
}

/* Stessa identica UX del pulsante Esci (ppConfirmBox, "Uscire da Flip
   Card?"): unica differenza, il testo non presuppone dove si finisce
   dopo (qui può essere ai moduli, in Classifica, ecc. — non sempre "la
   scelta del metodo di studio" come per exitFlipCardConfirm()). Se
   confermato, azzera fcState (nessun'altra pulizia di stato serve: Flip
   Card non ha timer/punteggio) e poi esegue davvero la navigazione
   originale, passata da game-engine-state.js. */
async function confirmExitFlipCard(continueFn){
  const ok = await ppConfirmBox('Stai per lasciare la sessione Flip Card in corso.', {
    title: 'Uscire da Flip Card?',
    icon: '📖',
    yesLabel: 'Sì, esci',
    noLabel: 'Annulla',
  });
  if(ok){
    fcState = null;
    continueFn();
  }
}

/* Uscita dalla sessione attiva: chiede conferma, come richiesto,
   riusando il dialogo generico già presente in game-engine-state.js
   (ppConfirmBox — indipendente da ppConfirm/ppConfirmRestart, che
   sono legati al punteggio partita e non calzano qui). */
async function exitFlipCardConfirm(){
  // v2.4.1 (onboarding.js): mentre il tour guidato è esattamente su
  // questo passo, forziamo la conferma (niente Annulla/click-fuori/Esc)
  // — altrimenti l'utente potrebbe annullare e lasciare il tour con
  // anello/tooltip "orfani", puntati su un pulsante ormai scomparso.
  // Fuori dal tour il dialogo si comporta come sempre (Annulla incluso).
  const forceExit = typeof OnboardingTour !== 'undefined'
    && OnboardingTour.isCurrentStep('flipcardConfirm');
  const p = ppConfirmBox('Uscendo tornerai alla scelta del metodo di studio in Didattica.', {
    title: 'Uscire da Flip Card?',
    icon: '📖',
    yesLabel: 'Sì, esci',
    noLabel: 'Annulla',
    forceConfirm: forceExit,
  });
  // v2.4.0 (onboarding.js): ppConfirmBox() inserisce il markup del
  // dialogo in modo sincrono (_ppBuildModal, prima di restituire la
  // Promise) — #pp-generic-yes esiste già qui, prima dell'await.
  // Niente aggiunto a ppConfirmBox()/game-engine-state.js: restano
  // generici, usati anche altrove nell'app.
  if(typeof OnboardingTour !== 'undefined') OnboardingTour.showFlipCardConfirmStep();
  const ok = await p;
  if(ok) exitFlipCard();
}

/* Entry point chiamato dalla card "Flip Card" in
   step-didattica. Il parametro "type" prepara l'estensione a
   futuri metodi didattici senza dover cambiare questa firma.
   Non carica più il mazzo direttamente: da v8.17.0 mostra
   prima lo step "scegli livello" (Facile/Medio). */
async function selDidattica(type){
  if(type !== 'flipcard') return;
  setTb(null);
  showScreen('tab-games');
  _renderFlipCardLevelSelect(sh('g-area'), sMod);
}

/* Definizione presentazionale dei 2 livelli — riusa i due
   colori già presenti nel tema Flip Card (verde della faccia
   "Risposta", viola della faccia "Domanda"/dell'icona Flip
   Card in step-didattica): nessun colore nuovo introdotto.
   emoji sostituisce icon/color (Tabler) da v8.19.3: le card
   ora sono .dm-card come quella di step-didattica, che usa
   icone emoji (.dm-icon) invece del box .ai. */
const FC_LEVELS = [
  { key: 'facile', label: 'Facile', desc: 'Concetti base, ripasso rapido', emoji: '🙂', rgb: '0,255,150' },
  { key: 'medio', label: 'Medio', desc: 'Approfondimento, dettagli tecnici', emoji: '🧠', rgb: '124,106,255' },
];

/* Sfondo decorativo SVG per le due card livello — stessa
   tecnica del motivo "carte" di step-didattica (griglia +
   forme + glow, viewBox 660x180, xMidYMid slice), motivo
   diverso per dare identità a colpo d'occhio: una carta sola
   con spunta per Facile ("un concetto alla volta"), tre carte
   sovrapposte per Medio ("più livelli di dettaglio"). */
const FC_LEVEL_BG = {
  facile: `<svg class="bg" viewBox="0 0 660 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="grid-fac" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0L0 0 0 24" fill="none" stroke="#00ff96" stroke-width=".4" opacity=".18"/>
    </pattern></defs>
    <rect width="660" height="180" fill="url(#grid-fac)"/>
    <rect x="500" y="34" width="120" height="112" rx="12" fill="rgba(0,255,150,.06)" stroke="#00ff96" stroke-width="1.2" opacity=".5"/>
    <path d="M528 92l16 16 32-36" fill="none" stroke="#00ff96" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
    <ellipse cx="560" cy="90" rx="90" ry="58" fill="rgba(0,255,150,.05)"/>
  </svg>`,
  medio: `<svg class="bg" viewBox="0 0 660 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="grid-med" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0L0 0 0 24" fill="none" stroke="#7c6aff" stroke-width=".4" opacity=".22"/>
    </pattern></defs>
    <rect width="660" height="180" fill="url(#grid-med)"/>
    <rect x="486" y="50" width="108" height="80" rx="10" transform="rotate(-11 540 90)" fill="rgba(124,106,255,.04)" stroke="#7c6aff" stroke-width="1" opacity=".28"/>
    <rect x="498" y="42" width="108" height="80" rx="10" transform="rotate(-4 552 82)" fill="rgba(124,106,255,.05)" stroke="#7c6aff" stroke-width="1" opacity=".4"/>
    <rect x="512" y="36" width="108" height="80" rx="10" fill="rgba(124,106,255,.07)" stroke="#a996ff" stroke-width="1.2" opacity=".55"/>
    <ellipse cx="560" cy="88" rx="90" ry="58" fill="rgba(124,106,255,.05)"/>
  </svg>`,
};

/* Step "scegli livello": v8.19.3, stesso design della card
   Flip Card in step-didattica (.dm-card, definita in
   css/flip-card.css) — stesso hover viola su entrambe le
   card per coerenza visiva con l'ingresso Flip Card; badge
   e sfondo decorativo tinti per livello (verde/viola, via
   l.rgb) per distinguerle a colpo d'occhio. Le card dei
   livelli senza contenuti pronti (es. OE finché non ha CSV)
   restano visibili ma disabilitate, come prima. */
function _renderFlipCardLevelSelect(cont, mod){
  if(!FlipCardLoader.hasModule(mod)){
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '🗂️', color: '#a996ff', title: 'Nessun mazzo disponibile',
      msg: `Il modulo "${modLabel(mod)}" non ha ancora un set di carte Flip Card associato.`,
    });
    return;
  }
  const available = FlipCardLoader.levelsFor(mod);
  const cardsHtml = FC_LEVELS.map(l => {
    const ok = available.includes(l.key);
    const badge = `<span class="dm-badge" style="background:rgba(${l.rgb},.12);border-color:rgba(${l.rgb},.35);color:${l.key==='facile'?'#00ff96':'#b4a0ff'}">Livello</span>`;
    const body = `<div class="dm-content">
        <span class="dm-icon" style="filter:drop-shadow(0 0 8px rgba(${l.rgb},.35))">${l.emoji}</span>
        <h3>${l.label}</h3>
        <p>${escHtml(ok ? l.desc : 'Non ancora disponibile')}</p>
      </div>`;
    if(!ok){
      return `<div class="act-card dm-card" style="opacity:.4;cursor:not-allowed" aria-disabled="true" aria-label="Livello ${l.label}, non disponibile">${badge}${FC_LEVEL_BG[l.key]}${body}</div>`;
    }
    return `<div class="act-card dm-card" role="button" tabindex="0" aria-label="Livello ${l.label}"
      onclick="fcSelLevel('${l.key}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fcSelLevel('${l.key}');}">${badge}${FC_LEVEL_BG[l.key]}${body}</div>`;
  }).join('');
  cont.innerHTML = `<div class="act-back-row">
      <button class="act-back-btn" onclick="exitFlipCard()"><i class="ti ti-arrow-left"></i> Didattica</button>
      <span class="act-context-label">Flip Card — scegli il livello</span>
    </div>
    <div class="act-grid">${cardsHtml}</div>`;
  // v2.4.0 (onboarding.js): la card livello appena cliccata ha già fatto
  // avanzare il tour guidato in capture-phase (stesso meccanismo del
  // resto del motore) — a questo punto stato e DOM sono già allineati.
  if(typeof OnboardingTour !== 'undefined') OnboardingTour.showFlipCardLevelStep();
}

/* Click su una card livello nello step precedente: passa a
   sMod (fissato all'ingresso in selDidattica, come i
   minigiochi) + il livello scelto. */
function fcSelLevel(liv){
  startFlipCard(sh('g-area'), sMod, liv);
}

/* v8.19.2 — bug segnalato: gap 1-2s tra l'avanzamento del tour guidato
   (già gestito da onboarding.js al click sulla card livello) e il
   caricamento reale del mazzo CSV. Durante il gap _fcHeader() ha già
   creato il vero pulsante Esci nel placeholder "Caricamento mazzo…" —
   ma il tour non ha ancora renderizzato il passo "flipcardExit"
   (showFlipCardExitStep() arriva solo a caricamento concluso, dentro
   _renderFlipCard()), quindi né l'Esci né la topbar (torna ai
   moduli/logo PixelProf/logout/Hub — v8.19.3) hanno alcuna protezione:
   un click reale su uno di questi pulsanti naviga per davvero altrove
   mentre il tour è già avanzato internamente al passo successivo — tour
   irrecuperabile.
   v8.19.3 — bug segnalato: anche il tasto Hub (apre il menu con
   Classifica/Progressi/Storico/Panoramica Classe, ognuna delle quali
   naviga via da Flip Card) soffriva dello stesso problema — aggiunto
   alla lista, stesso trattamento identico agli altri 4.
   Congela/scongela SOLO questi 5 selettori, SOLO durante il gap
   (chiamato da startFlipCard() più sotto): pointer-events + opacità,
   stesso linguaggio visivo già usato qui sotto per le card livello
   disabilitate (style="opacity:.4;cursor:not-allowed"). dataset come
   guardia anti-doppio-congelamento e per ripristinare l'esatto valore
   inline precedente (di norma nessuno, ma non si sa mai). */
const FC_TOUR_RISK_SELECTORS = ['.fc-exit-btn', '#tb-course-badge', '.logo-wrap', '.cs-logout-btn', '#tb-hub-btn'];

function _fcFreezeNavForTour(){
  FC_TOUR_RISK_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if(el.dataset.fcFrozen) return; // già congelato, non sovrascrivere i valori salvati
      el.dataset.fcFrozen = '1';
      el.dataset.fcPrevPe = el.style.pointerEvents;
      el.dataset.fcPrevOp = el.style.opacity;
      el.style.pointerEvents = 'none';
      el.style.opacity = '.4';
      el.setAttribute('aria-disabled', 'true');
    });
  });
}

function _fcUnfreezeNavForTour(){
  FC_TOUR_RISK_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if(!el.dataset.fcFrozen) return;
      el.style.pointerEvents = el.dataset.fcPrevPe || '';
      el.style.opacity = el.dataset.fcPrevOp || '';
      el.removeAttribute('aria-disabled');
      delete el.dataset.fcFrozen;
      delete el.dataset.fcPrevPe;
      delete el.dataset.fcPrevOp;
    });
  });
}

async function startFlipCard(cont, mod, liv){
  if(!FlipCardLoader.hasModule(mod) || !FlipCardLoader.levelsFor(mod).includes(liv)){
    cont.innerHTML = _fcHeader() + _fcStateHTML({
      icon: '🗂️', color: '#a996ff', title: 'Nessun mazzo disponibile',
      msg: `Il modulo "${modLabel(mod)}" non ha ancora un set di carte Flip Card associato per questo livello.`,
    });
    return;
  }
  // v8.19.2 — guardTour true solo se il gap è reale (mazzo non già in
  // cache: se è in cache l'await sotto risolve subito, nessun gap) e solo
  // se questo utente ha ancora il tour da fare (OnboardingTour.isActive(),
  // onboarding.js v2.5.2) — chi l'ha già completato/saltato non viene
  // toccato, i 4 pulsanti restano sempre e comunque cliccabili per lui.
  const guardTour = typeof OnboardingTour !== 'undefined'
    && OnboardingTour.isActive()
    && !FlipCardLoader.isCached(mod, liv);
  if(!FlipCardLoader.isCached(mod, liv)){
    cont.innerHTML = _fcHeader() + '<div class="fc-loading">Caricamento mazzo…</div>';
    if(guardTour) _fcFreezeNavForTour();
  }
  try{
    let cards;
    try{
      cards = await FlipCardLoader.load(mod, liv);
    }catch(err){
      console.error('[PixelProf] FlipCard load error:', err);
      cont.innerHTML = _fcHeader() + _fcStateHTML({
        icon: '⚠️', color: '#a996ff', title: 'Flip Card non disponibile',
        msg: 'Impossibile caricare il mazzo. Riprova o cambia modulo.',
      });
      return;
    }
    if(!cards.length){
      cont.innerHTML = _fcHeader() + _fcStateHTML({
        icon: '📭', color: '#a996ff', title: 'Mazzo vuoto',
        msg: 'I file CSV sono stati trovati ma non contengono righe valide (colonne domanda,risposta).',
      });
      return;
    }
    fcState = { cards, idx: 0, flipped: false, mod, liv };
    _renderFlipCard(cont);
  } finally {
    // v8.19.2 — scongela SEMPRE (successo, errore o mazzo vuoto): la
    // topbar non viene mai ricreata da _renderFlipCard() (è fuori da
    // #g-area), quindi senza questo finally resterebbe congelata per
    // sempre in caso di errore/mazzo vuoto. .fc-exit-btn invece viene
    // comunque ricreato da zero (nuovo nodo, mai congelato) da
    // _fcHeader() dentro ognuno dei rami sopra — lo scongelamento qui è
    // per lui ridondante ma innocuo (guardia dataset.fcFrozen).
    // setTimeout(...,0) anziché chiamata diretta: nel ramo di successo,
    // _renderFlipCard() qui sopra ha già schedulato il PROPRIO
    // setTimeout(...,0) per mostrare il velo reale del passo
    // (showFlipCardExitStep()) — schedulandolo qui, il nostro arriva in
    // coda DOPO il suo (stesso ritardo, ordine di schedulazione FIFO):
    // il velo è già su quando la topbar torna cliccabile, azzerando
    // anche il margine teorico di un frame tra le due cose.
    if(guardTour) setTimeout(_fcUnfreezeNavForTour, 0);
  }
}

function _renderFlipCard(cont){
  cont.innerHTML = `${_fcHeader()}
    <div class="fc-scene">
      <div class="fc-card" id="fc-card"
        role="button" tabindex="0"
        aria-label="Carta domanda e risposta, tocca o premi Invio per girare"
        onclick="fcFlip()"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fcFlip();}
                   if(event.key==='ArrowLeft'){event.preventDefault();fcNav(-1);}
                   if(event.key==='ArrowRight'){event.preventDefault();fcNav(1);}">
        <div class="fc-card-inner">
          <div class="fc-face fc-front">
            <div class="fc-eyebrow">// Domanda</div>
            <div class="fc-text" id="fc-q"></div>
            <div class="fc-hint">↻ tocca per la risposta</div>
          </div>
          <div class="fc-face fc-back">
            <div class="fc-eyebrow">// Risposta</div>
            <div class="fc-text" id="fc-a"></div>
            <div class="fc-hint">↻ tocca per tornare alla domanda</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fc-nav">
      <button class="fc-nav-btn" id="fc-prev" onclick="fcNav(-1)" aria-label="Card precedente"><i class="ti ti-chevron-left"></i></button>
      <span class="fc-counter-nav" id="fc-counter-nav"></span>
      <button class="fc-nav-btn" id="fc-next" onclick="fcNav(1)" aria-label="Card successiva"><i class="ti ti-chevron-right"></i></button>
    </div>`;
  _fcUpdateFaces();
  // v2.4.0 (onboarding.js): pulsante Esci pronto in DOM — 1 tick per
  // coerenza con lo stesso pattern usato altrove nel motore del tour.
  if(typeof OnboardingTour !== 'undefined') setTimeout(()=>OnboardingTour.showFlipCardExitStep(), 0);
}

function _fcUpdateFaces(){
  const s = fcState;
  if(!s) return;
  const card = s.cards[s.idx];
  const qEl = shq('fc-q'), aEl = shq('fc-a');
  if(qEl) qEl.textContent = card.q;
  if(aEl) aEl.textContent = card.a;
  const label = (s.idx + 1) + '/' + s.cards.length;
  const counterEl = shq('fc-counter-nav'); if(counterEl) counterEl.textContent = label;
  const prevBtn = shq('fc-prev'); if(prevBtn) prevBtn.disabled = s.idx === 0;
  const nextBtn = shq('fc-next'); if(nextBtn) nextBtn.disabled = s.idx === s.cards.length - 1;
  const cardEl = shq('fc-card');
  if(cardEl){
    cardEl.classList.toggle('flipped', s.flipped);
    const front = cardEl.querySelector('.fc-front');
    const back = cardEl.querySelector('.fc-back');
    // Evita che i lettori di schermo leggano contemporaneamente
    // le due facce sovrapposte: solo quella visibile resta esposta.
    if(front) front.setAttribute('aria-hidden', s.flipped ? 'true' : 'false');
    if(back) back.setAttribute('aria-hidden', s.flipped ? 'false' : 'true');
  }
}

function fcFlip(){
  if(!fcState) return;
  fcState.flipped = !fcState.flipped;
  _fcUpdateFaces();
}

function fcNav(dir){
  const s = fcState;
  if(!s) return;
  const n = s.idx + dir;
  if(n < 0 || n >= s.cards.length) return; // niente loop ai bordi
  s.idx = n;
  s.flipped = false;
  _fcUpdateFaces();
}
