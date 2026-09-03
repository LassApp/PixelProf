/* ==================================================
   onboarding.js — PixelProf v2.6.1
   Tour guidato al primo accesso docente ("dove clicco?").

   v2.0.0 — RISCRITTURA MOTORE (richiesta esplicita utente):
     - Esc e click-fuori-dal-tooltip NON chiudono più il tour.
       L'unica uscita anticipata è il pulsante "Salta il tour".
     - Vero LOCK dell'interfaccia durante il tour: invece del
       vecchio overlay pieno che bloccava anche l'elemento
       evidenziato (l'utente poteva avanzare SOLO col pulsante
       "Avanti" del tooltip), ora un singolo velo a tutto schermo
       usa clip-path per ritagliare un "buco" ESATTAMENTE sopra
       il target del passo corrente. Tutto il resto dell'app
       (compresi gli altri pulsanti dello stesso schermo, es. le
       altre card della dashboard) resta fisicamente non cliccabile
       finché il velo copre quell'area — senza bisogno di aggiungere
       classi "disabled" sparse sui bottoni reali dell'app: un solo
       target alla volta è sempre l'unico elemento passante.
     - Due tipi di passo:
         'action' → il target è realmente cliccabile (buco nel velo);
                    l'avanzamento avviene con un click REALE
                    sull'elemento evidenziato (nessun pulsante
                    "Avanti" nel tooltip — solo "Salta il tour").
         'info'   → nessun buco (l'anello resta solo visivo, il
                    velo copre anche il target): si avanza col
                    pulsante "Avanti"/"Fatto" del tooltip.
     - Sequenza completamente ridisegnata per Direttore (11 passi:
       Gestisci Aule → form nuova aula [back disabilitato] → torna
       alla dashboard → Gestisci Docenti → Nuovo Docente → Docenti
       già creati → torna alla dashboard → Scegli Aula → seleziona
       aula → scegli modulo → Hub) e Docente (4 passi: scegli aula
       [tutte le card abilitate] → scegli modulo → scegli modalità
       → Hub).
     - Stato persistito: {done, idx} — idx è l'indice nell'array
       di passi del ruolo corrente (DIRECTOR_STEPS/TEACHER_STEPS).
       Schema precedente ({done, step}) non è più compatibile: se
       rilevato in localStorage, 'done' viene preservato (chi aveva
       già completato/saltato il tour non lo rivede), altrimenti si
       riparte da idx 0 sotto il nuovo schema.

   v2.1.0 — Fase 7.3 Sistema Aree (ROADMAP_AREE.md): il tour non
     menzionava mai il concetto di "Area" introdotto nelle Fasi 2-4,
     né nel wizard, né in "Scegli Aula", né in "Scheda Docente".
     Solo testo dei passi aggiornato (nessun nuovo screen/hook):
       - DIRECTOR_STEPS[1] (wizard/#cs-add-form-wrap): corretto
         "tre semplici passi" → "quattro passi" (nome, area, moduli,
         docenti) — il conteggio era rimasto quello pre-Fase 2.
       - DIRECTOR_STEPS[5] (teacherMgmt/.dd-teacher-list): aggiunto
         cenno al raggruppamento per area delle aule in Scheda Docente.
       - DIRECTOR_STEPS[8] e TEACHER_STEPS[0] (entrambi
         coursesSelect/.course-card): aggiunto cenno al raggruppamento
         per area in "Scegli Aula" (Fase 3).
     Deliberatamente NON aggiunto un passo dedicato dentro il modale
     wizard (step Area vero e proprio) né dentro "Scheda Docente"
     (blocchi .tdc-area-block): il primo richiederebbe scriptare la
     validazione di nome/date/orari obbligatori dello step 1 per poter
     avanzare; il secondo richiederebbe almeno un docente già esistente,
     non garantito nel percorso di primo accesso Direttore (il passo
     "Nuovo Docente" del tour è 'info', non crea davvero un account).
     Entrambi restano possibili in un secondo momento se richiesti
     esplicitamente.

   v2.1.1 — richiesta esplicita utente: le 6 aree didattiche sono ora
     considerate tutte attive (i JSON dei contenuti arrivano
     progressivamente). Rimosso l'unico residuo testuale non generico:
     DIRECTOR_STEPS[9] e TEACHER_STEPS[1] (entrambi homeModule) dicevano
     "alcuni moduli ICDL", presupponendo che tutti i moduli appartenessero
     all'area ECDL — non più vero con Cybersecurity/Reti/Malware/
     Cyberbullismo/AI. Testo generalizzato a "alcuni moduli" (invariato
     tutto il resto: nessun nuovo screen/hook, nessun riferimento
     hardcoded al nome o al conteggio delle aree). Scelta deliberata,
     richiesta esplicitamente: così facendo il tour NON necessita più
     di aggiornamenti quando in futuro verrà aggiunta una nuova area in
     js/areas-config.js — a differenza di altri punti dell'app (es. i
     filtri Dashboard) che invece enumerano le aree esplicitamente.

   v2.1.2 — bug segnalato (solo Direttore): nei passi 'info' il target
     restava coperto dal velo scuro sfocato (by design, v2.0.0) — si
     vedeva solo il bordo dell'anello su sfondo nero, senza distinguere
     cosa venisse indicato. Richiesta esplicita utente: "uguale alle
     altre, stesso comportamento di docente" (cioè come i passi
     'action' già esistenti, e come l'unico passo analogo già presente
     in TEACHER_STEPS — "Scegli il modulo", già di tipo 'action').
       - DIRECTOR_STEPS[4] .dd-new-teacher, [5] .dd-teacher-list,
         [9] .mod-grid: da 'info' ad 'action'. Target singoli con
         un'azione univoca (aprono un'altra schermata/vista) — il
         motore del tour già gestisce il caso in cui il target del
         passo successivo non sia immediatamente visibile dopo la
         navigazione (si riallinea al prossimo show*Step() rilevante),
         stesso meccanismo già in uso per gli altri passi 'action'.
       - DIRECTOR_STEPS[1] #cs-add-form-wrap: NON convertito ad
         'action'. Il target è l'intero form di creazione aula
         multi-campo (nome, area, moduli, docenti): un click reale in
         un punto qualsiasi al suo interno (es. il campo nome) non ha
         un significato univoco di "ho finito con questo passo", e
         avrebbe fatto avanzare il tour al passo successivo ("Tutto
         pronto ✅ — torna al pannello") ancora a wizard non concluso.
         Introdotta invece la proprietà revealTarget:true (solo per
         passi 'info'): il velo ottiene comunque il buco reale — il
         form torna visibile e utilizzabile, non più nascosto dietro
         un riquadro nero — ma l'avanzamento resta legato
         esclusivamente al pulsante "Avanti" del tooltip, non al click
         sul form. Vedi commento SEQUENZE sopra per il dettaglio.
       - DIRECTOR_STEPS[10] #tb-hub-btn (ultimo passo): lasciato
         invariato — resta 'info' esattamente come l'analogo ultimo
         passo di TEACHER_STEPS, quindi già "uguale al docente".

   v2.1.3 — bug segnalato: allo step 6 (.dd-teacher-list) il tour finiva
     fuori schermo, impossibile continuare. Causa: in _position(), il
     ramo top=union.bottom+18 non aveva un limite superiore — se il
     target è più alto del viewport (lista docenti lunga, dopo aver
     creato più account nei test), union.bottom supera
     window.innerHeight e il tooltip si piazza sotto il bordo visibile,
     irraggiungibile (bottoni "Avanti"/"Salta il tour" inclusi). Fix
     generale, non specifico a questo step: clamp finale che tiene il
     tooltip sempre dentro il viewport verticale, qualunque sia
     l'altezza del target — stesso principio già in uso per il clamp
     orizzontale (left) poco sotto.

   v2.1.4 — il fix v2.1.3 (clamp verticale) non risolveva il bug
     realmente segnalato: "step 6, tour fuori schermo, impossibile
     continuare" persisteva. Causa reale, diversa: il click-listener di
     avanzamento è registrato in CAPTURE-phase su document (vedi
     _renderStep sotto), quindi scatta PRIMA dell'onclick nativo
     dell'elemento (bubble-phase). .dd-teacher-list ha onclick="tmGoList()"
     e .dd-new-teacher onclick="tmGoCreate()" — entrambi nascondono
     screen-teacher-mgmt e mostrano un'altra sezione. _advance() calcolava
     "stesso screen del passo precedente" (vero, sono entrambi
     'teacherMgmt') e renderizzava SUBITO il passo successivo — ma in
     quel preciso istante l'onclick nativo non aveva ancora navigato,
     quindi il target risultava temporaneamente ancora visibile; un
     istante dopo l'onclick nativo eseguiva e la sezione spariva,
     lasciando l'anello/tooltip già posizionati orfani sulla schermata
     nuova. Fix in _advance(): il controllo di render viene rimandato di
     un tick (setTimeout 0) così avviene DOPO che l'intero dispatch del
     click, incluso l'onclick nativo, è già completato — vede quindi lo
     stato reale del DOM. Il fix v2.1.3 resta comunque valido come
     protezione generale per target più alti del viewport, indipendente
     da questo bug.

   v2.2.0 — richiesta esplicita utente: 2 nuovi step nel tour Direttore
     (ora 13 invece di 11), per coprire i pulsanti "indietro" delle due
     sottoschermate raggiunte dai passi 5 e 7 (ex 6):
       - Nuovo screen:'teacherCreate', target:'#screen-teacher-create
         .back-link' — inserito subito dopo ".dd-new-teacher" (nuovo
         passo 6/13). Aggancio in tmGoCreate() (js/app.js), stesso
         pattern già usato in openTeacherManagement().
       - Nuovo screen:'teacherList', target:'#screen-teacher-list
         .back-link' — inserito subito dopo ".dd-teacher-list" (nuovo
         passo 8/13). Aggancio in tmGoList() (js/app.js).
     Aggiunti showTeacherCreateStep()/showTeacherListStep() all'API
     pubblica, stesso pattern delle altre show*Step(). Entrambi i nuovi
     passi sono 'action' (si avanza cliccando il pulsante "← Docenti"
     stesso) — al ritorno sulla schermata teacherMgmt il tour si
     riallinea correttamente al passo successivo tramite l'hook già
     esistente in openTeacherManagement(). Il contatore "X di N" nel
     tooltip è calcolato dinamicamente da list.length: passa da solo a
     "di 13", nessun valore hardcoded da aggiornare altrove.

   v2.2.1 — bug segnalato: "scelta aula" (Direttore step 11/13, Docente
     step 1/4), scroll bloccato. Unico step del tour il cui selettore
     (.course-card) può matchare MOLTE card contemporaneamente (tutte le
     aule) — a differenza degli altri step, tutti su target singoli.
     Diagnosi non confermata al 100% senza test live (Playwright bloccato
     nel sandbox): due cause plausibili affrontate insieme, entrambe a
     rischio nullo/basso indipendentemente da quale sia quella reale:
       1) _position() ricalcola i rect di OGNI card e ricostruisce
          l'intero clip-path a ogni evento 'scroll' grezzo — su una
          lista lunga di aule, durante uno scroll fluido/inerziale
          questo evento può scattare decine di volte al secondo,
          causando scatti pesanti percepibili come "scroll bloccato" sui
          dispositivi più lenti. Throttling a un ricalcolo per
          requestAnimationFrame.
       2) .onb-overlay è un div fixed a tutto schermo senza touch-action
          esplicito: su alcuni browser mobile il gesto di scroll che
          parte su un elemento fixed non scrollabile può non propagarsi
          correttamente alla pagina sottostante. Aggiunto
          touch-action:pan-y (pixelprof.css) per garantire lo scroll
          verticale touch sempre, anche fuori dai "buchi" ritagliati.
     Se il problema persiste dopo questo fix, serve sapere se il test è
     su desktop (rotellina/trackpad) o mobile (touch) per restringere
     ulteriormente la diagnosi.

   v2.2.2 — il fix v2.2.1 (throttling + touch-action) non risolveva il
     bug realmente segnalato ("scelta aula" bloccato, testato su
     desktop/rotellina). Diagnosi corretta, confermata confrontando con
     "scelta modulo" (che invece funziona): #screen-courses è
     position:fixed + overflow-y:auto PROPRIO (scroll interno al
     pannello), mentre #tab-home (dove vive .mod-grid) è un semplice div
     a flusso normale che scrolla insieme al body. Il velo del tour è
     sempre figlio diretto di <body> — per #tab-home questo lo rende
     ANTENATO del body che scrolla (la catena nativa del browser
     funziona), ma per #screen-courses lo rende FRATELLO del pannello
     con lo scroll proprio, mai suo antenato: lo scroll nativo non può
     strutturalmente raggiungerlo, indipendentemente da throttling o
     touch-action. Vera soluzione: _findScrollableAncestor() risale dal
     target reale del passo corrente fino a trovare il contenitore con
     overflow-y effettivo, e wheel/touchmove sul velo vengono inoltrati
     manualmente lì (scrollTop +=), invece di affidarsi alla catena
     nativa che qui non esiste. Generale, non specifico a
     #screen-courses: funziona per qualunque schermata futura con lo
     stesso pattern position:fixed+overflow-y:auto proprio.

   v2.3.0 — richiesta esplicita utente: attivata la Didattica (Flip Card),
     il tour va aggiornato per coprirla. Due interventi:
       1) DOCENTE — riordino dei passi esistenti: il passo Hub (ex 4/4)
          diventa il passo 3/10; il passo "Scegli la modalità" (ex 3/4,
          .cat-games) diventa il passo 4/10, ritestato per parlare solo
          di Minigiochi (Didattica ha ora i suoi passi dedicati sotto).
       2) ENTRAMBI I RUOLI — 6 nuovi passi dopo Hub (Direttore 14-20/20,
          Docente 4-10/10, stessa sequenza):
            Minigiochi (.cat-games, action) → panoramica delle modalità
            di gioco (#step-act .act-grid, info revealTarget) → pulsante
            "← Modalità" di step-act (action) → Didattica (.cat-didattica,
            action) → Flip Card (#step-didattica .act-card, info
            revealTarget) → pulsante "← Modalità" di step-didattica
            (action) → messaggio finale "Tour completato" (.cat-grid,
            info, ultimo passo).
     Testo dei due pulsanti "indietro" rinominato da "Categoria" a
     "Modalità" in index.html (step-act e step-didattica): riportano
     entrambi alla schermata "Scegli la modalità", non a una "categoria"
     — testo ora coerente.
     Nuovo aggancio in game-engine-state.js: goStep('didattica') ora
     chiama anche OnboardingTour.showDidatticaStep() (nuova, stesso
     pattern del ramo 'cat' esistente) — prima assente perché Flip Card
     non aveva ancora passi del tour dedicati.
     _advance(): nuova condizione afterHub, mirror di hubTarget ma
     valutata sul passo PRECEDENTE invece che sul successivo. Necessaria
     perché il passo Hub ('info', bottone sempre presente in topbar) può
     ora essere seguito da altri passi invece di essere l'ultimo: la
     schermata dietro al suo tooltip è già garantita attiva (il passo Hub
     si limita a spiegare il pulsante topbar, non naviga altrove), quindi
     sicuro renderizzare subito il passo successivo — stesso principio già
     applicato a hubTarget, solo speculare.

   v2.3.1 — 2 bug segnalati dal test live (Direttore + Docente) sui passi
     introdotti in v2.3.0:
       1) "Hub — c'è il focus ma non si vede" (passo Hub, entrambi i
          ruoli): il passo era 'info' SENZA revealTarget, quindi il velo
          copriva anche il pulsante Hub stesso — restava visibile solo
          l'anello, non il pulsante che indica. Fix: aggiunto
          revealTarget:true (stesso trattamento già usato dal passo
          wizard #cs-add-form-wrap) — il velo ottiene un buco reale, il
          pulsante Hub torna visibile sotto l'anello. Il pulsante resta
          comunque cliccabile (apre il vero menu Hub) ma questo non è un
          problema: a differenza di Flip Card/act-grid sotto, aprire il
          menu Hub non naviga via dalla schermata corrente, quindi non
          orfanizza il tooltip (stesso principio già valido per il passo
          wizard, che ha campi realmente compilabili).
       2) "Flip Card: cliccandoci parte la flipcard ma il tour non
          prosegue" (passo 18/20 Direttore, 8/10 Docente — stesso bug,
          per lo stesso motivo, sul passo "sui minigiochi" #step-act
          .act-grid): erano 'info' con revealTarget:true, quindi il buco
          nel velo rendeva il target realmente cliccabile — click che
          lanciava la vera azione dell'app (Flip Card / setup minigioco)
          — ma l'avanzamento del tour è cablato solo su 'action'
          (_renderStep, isAction) o sul pulsante "Avanti" dei passi
          'info': un 'info' non registra MAI il listener di avanzamento
          su click, quindi il tour restava fermo. Fix: entrambi i passi
          diventano 'action' (revealTarget non serve più: 'action' apre
          comunque il buco nel velo, via isInteractive) — cliccare il
          target reale ora avanza anche il tour, coerente con tutti gli
          altri passi di scelta della sequenza (Minigiochi, Didattica,
          pulsanti "torna alla modalità"). Il passo successivo (pulsante
          "torna alla modalità") non troverà da subito il proprio target
          se l'utente naviga davvero dentro un minigioco/Flip Card — non
          è un problema nuovo: è lo stesso comportamento "auto-riparante"
          già usato ovunque nel motore (si riallinea al prossimo
          show*Step() rilevante, quando l'utente torna sulla schermata
          giusta).

   v2.4.0 — richiesta esplicita utente: dopo "Flip Card" (ora 'action')
     il tour saltava direttamente al pulsante "torna alla modalità",
     incoerente con quanto succede davvero in app. 3 nuovi passi
     'action' inseriti tra "Flip Card" e "torna alla modalità" (Direttore
     19-21/23, Docente 9-11/13), che seguono il flusso reale:
       - flipcardLevel  #g-area .act-grid          "Scegli il livello"
       - flipcardExit   .fc-exit-btn               "Uscire in ogni momento"
       - flipcardConfirm #pp-generic-yes           "Conferma richiesta"
     Hook dedicati in js/flip-card.js (file isolato, nessuna modifica ai
     file core, stesso principio già dichiarato in testa a quel file):
       - _renderFlipCardLevelSelect() → showFlipCardLevelStep(), subito
         dopo cont.innerHTML: la card del livello appena cliccata ha già
         fatto avanzare il tour in CAPTURE-phase (stesso meccanismo
         v2.1.4), quindi al momento di questa chiamata target e stato
         sono già allineati — nessun ritardo necessario.
       - _renderFlipCard() → showFlipCardExitStep(), 1 tick dopo la fine
         del render (stesso studio delle carte, hook aggiunto solo qui e
         non anche negli stati di caricamento/errore di startFlipCard():
         il modulo CE ha già i mazzi reali per entrambi i livelli, quindi
         questo è il percorso che verrà davvero testato — se in futuro
         serve coprire anche gli stati vuoti/errore, stesso hook lì).
       - exitFlipCardConfirm() → showFlipCardConfirmStep() chiamata
         SUBITO dopo aver invocato ppConfirmBox() ma PRIMA di attenderne
         la Promise: _ppBuildModal() dentro ppConfirmBox() inserisce il
         markup del dialogo in modo sincrono, quindi #pp-generic-yes
         esiste già a quel punto — niente aggiunto a ppConfirmBox() né a
         game-engine-state.js, che restano generici e usati anche altrove
         nell'app.

   v2.4.1 — 2 bug segnalati dal test live sul passo "Conferma richiesta"
     (Flip Card, Direttore 21/23, Docente 11/13):
       1) "il tooltip si colloca sotto il dialog di conferma,
          impossibilitando il completamento del tour": .pp-generic-overlay
          (ppConfirmBox, game-engine-state.js) usa z-index:9800 — sopra
          l'intero stack onboarding (9750/60/70). Fix: z-index dello
          stack alzato a 9850/60/70 in pixelprof.css (vedi commento lì
          per il dettaglio). Nessuna modifica di logica, solo stacking.
       2) Richiesta esplicita: "disattivare il tasto annulla del dialog
          di conferma uscita da flip card per forzare su sì esci"
          durante il tour — altrimenti l'utente poteva annullare
          l'uscita, lasciando anello/tooltip "orfani" puntati su un
          pulsante ormai scomparso (nessun passo successivo raggiunto,
          nessun modo di tornare a quello attuale). Fix in due parti:
            a) nuova query isCurrentStep(screenName) qui sotto — sola
               lettura, non renderizza nulla, dice al chiamante se il
               tour è ESATTAMENTE su un dato passo;
            b) nuova opzione generica opts.forceConfirm su ppConfirmBox()
               (game-engine-state.js) — nasconde Annulla e disattiva
               click-fuori/Esc, restando "Sì" l'unica uscita dal
               dialogo. Opt-in, retrocompatibile: tutte le chiamate
               esistenti restano invariate.
            js/flip-card.js, exitFlipCardConfirm(): passa
            forceConfirm:true a ppConfirmBox() solo quando
            OnboardingTour.isCurrentStep('flipcardConfirm') è vero —
            fuori dal tour il dialogo si comporta come sempre.

   v2.5.0 — richiesta esplicita utente: 6 nuovi passi finali per entrambi
     i ruoli (Direttore 24-29/30, Docente 14-19/20), inseriti subito dopo
     l'ultimo "Torna alla modalità ↩️" esistente e prima del messaggio di
     chiusura ("Tour completato" diventa così l'ultimo passo, 30/30 e
     20/20 anziché 24/24 e 14/14). Spiegano gli elementi PERMANENTI della
     topbar, mai toccati finora dal tour: nome utente, tasto tema
     chiaro/scuro, tasto audio, badge aula (torna ai moduli), logo
     PixelProf (cambia aula) e il dialogo di conferma che il logo apre.
       - I 4 passi "di lettura" (nome, tema, audio, badge aula) sono
         'info' con revealTarget:true: elementi reali e cliccabili (tema
         e audio lo sono davvero), ma nessuno dei due ha un click con
         significato univoco di "passo successivo" richiesto per essere
         'action' — si avanza solo col pulsante "Avanti" del tooltip,
         stesso principio già discusso per #tb-hub-btn più sopra.
       - Il passo sul logo PixelProf è invece 'action': serve il click
         REALE per aprire davvero il dialogo di conferma richiesto dal
         passo successivo — un 'info' con solo revealTarget non
         garantirebbe che il dialogo sia già aperto al momento del render
         del passo dopo. Il fix v2.1.4 (avanzamento rimandato di un tick
         in _advance()) garantisce che l'onclick nativo di
         goCoursesFromApp() sia già stato eseguito quando il passo
         successivo viene renderizzato.
       - L'ultimo passo (dialogo #pp-dialog-no/#pp-dialog-yes) torna
         'info' con revealTarget:true: il dialogo ha due pulsanti con
         esiti opposti, nessuno dei due ha un significato univoco di "ho
         finito qui" (stesso principio già discusso per
         #cs-add-form-wrap più sopra). Essendo il dialogo VERO (aperto dal
         passo precedente), entrambi i pulsanti restano realmente
         cliccabili: se durante questo passo l'utente preme davvero "Sì,
         cambia aula", l'app esce per davvero dall'aula e il tour resta
         con tooltip orfano (nessun passo successivo raggiungibile finché
         non si rientra in un'aula) — stesso comportamento "esplorabile
         ma a rischio" già accettato per il passo Hub più sopra, nessun
         workaround introdotto di proposito.
     Tutti e 6 i nuovi passi restano dichiarati con screen:'homeCategory',
     lo stesso già usato dal passo "Torna alla modalità" prima e da "Tour
     completato" dopo: la topbar (nome, tema, audio, badge aula, logo) è
     sempre visibile qualunque sia lo step-X/tab-X attivo sotto di essa,
     quindi la catena di 6 passi si auto-renderizza da sola tramite il
     controllo "stesso screen" già presente in _advance() — nessun nuovo
     show*Step(), nessuna modifica ad app.js o game-engine-state.js,
     nessuna nuova voce nell'API pubblica. Verificato inoltre lo stacking
     z-index: .pp-dialog-overlay è a 9700 (pixelprof.css), sotto lo stack
     onboarding 9850/60/70 già alzato in v2.4.1 — stesso principio che
     risolveva il caso analogo di .pp-generic-overlay (9800), qui con
     margine ulteriore, nessuna modifica CSS necessaria.

   v2.5.1 — due bug segnalati da test manuale sul passo del dialogo
     cambio-aula (v2.5.0, "Scegli cosa fare") + un nuovo passo richiesto:
       1) I due pulsanti reali del dialogo risultavano cliccabili per
          davvero durante il passo (revealTarget dava un buco vero, quindi
          hit-test vero) — ma dovevano restare solo visibili, con
          avanzamento possibile solo da "Avanti". Introdotta la nuova
          proprietà di passo blockClicks (vedi doc del formato più sopra):
          uno "scudo" trasparente per target, posizionato sul buco come i
          rings, che intercetta e ignora il click reale senza coprire
          visivamente il target. Generico, riusabile da qualsiasi passo
          futuro con lo stesso bisogno (target vero ma non azionabile).
       2) Lasciando il passo del dialogo con "Avanti" (senza premere per
          davvero uno dei due pulsanti — cosa impossibile comunque dopo il
          fix del punto 1), il dialogo VERO restava aperto: il velo suo
          proprio non spariva e il passo finale "Tour completato" appariva
          comunque sopra, sovrapposto. Introdotta la nuova proprietà di
          passo onLeave (funzione, opzionale — vedi doc più sopra):
          richiamata da _advance() e _markDone() subito prima di lasciare
          il passo corrente. Il passo del dialogo la usa per chiuderlo per
          davvero simulando un click reale su "No, continua" — riusa la
          logica vera già scritta in goCoursesFromApp()
          (game-engine-state.js), zero duplicazione.
       3) Nuovo passo richiesto, focus sul tasto logout (.cs-logout-btn),
          inserito subito dopo il passo del dialogo e prima di "Tour
          completato" (Direttore 30/31, Docente 20/21). Stesso trattamento
          blockClicks del punto 1 (pulsante vero, uscita immediata
          dall'account: non deve essere azionabile per sbaglio durante il
          tour) — qui senza onLeave, perché il passo non apre nulla e
          blockClicks da solo basta a neutralizzare l'unico effetto
          collaterale possibile.
       4) Richiesta successiva: anche il passo "Torna ai moduli 🏫"
          (#tb-course-badge) aveva lo stesso problema del punto 1 — è
          l'unico momento dell'intero tour in cui quel pulsante ha
          davvero un buco nel velo (fuori da questo passo il velo lo
          copre già come qualsiasi altro elemento della pagina, quindi è
          già di fatto non cliccabile). Stesso trattamento del punto 3:
          aggiunto blockClicks:true, nessun onLeave necessario (nessun
          effetto collaterale da annullare, il click viene semplicemente
          ignorato). Testo del passo aggiornato di conseguenza (non più
          "premilo in qualsiasi momento", ma invito a usare "Avanti").
     Nessuna modifica a app.js/game-engine-state.js/index.html/CSS: tutto
     contenuto in onboarding.js (motore + step-data).

   v2.5.2 — bug segnalato: passo "flipcardExit" (Uscire in ogni momento).
     Tra il click sulla card livello (che fa già avanzare il tour) e il
     caricamento effettivo del mazzo CSV (1-2s, dipende dalla rete) c'è un
     gap in cui js/flip-card.js mostra già il pulsante Esci reale
     (_fcHeader(), sempre presente anche nel placeholder "Caricamento
     mazzo…") ma il tour non ha ancora renderizzato questo passo
     (showFlipCardExitStep() arriva solo a caricamento concluso) — durante
     il gap né l'Esci né la topbar (torna ai moduli/logo PixelProf/logout)
     hanno alcuna protezione, un click reale su uno di questi rompe il
     tour in modo irrecuperabile. Fix interamente in js/flip-card.js
     (file isolato, invariato il resto): i 4 pulsanti a rischio vengono
     congelati (pointer-events + opacità, stesso linguaggio visivo già
     usato lì per le card livello disabilitate) subito prima di avviare il
     caricamento e scongelati in un finally non appena il caricamento
     termina (successo, errore o mazzo vuoto) — da quel momento in poi ci
     pensa di nuovo il velo reale del passo, invariato. Attivo solo se il
     gap è reale (mazzo non già in cache) e solo per chi ha ancora il tour
     da fare — nuovo metodo pubblico isActive() (sopra) usato apposta per
     non toccare nulla a chi l'ha già completato o saltato.

   v2.6.0 — richiesta esplicita utente: il passo "Il tuo Hub" (subito dopo
     "Scegli il modulo") non era coerente con gli altri elementi permanenti
     della topbar (nome, tema, audio, badge aula, logo, logout), spiegati
     tutti insieme più avanti nel tour. Spostato lì, subito prima di
     "Torna ai moduli", e trasformato da 'info' ad 'action': il click
     reale sul pulsante Hub apre per davvero il menu a tendina (stesso
     meccanismo già discusso per il logo PixelProf, v2.1.4 — avanzamento
     rimandato di un tick in _advance() garantisce che l'onclick nativo
     toggleHubMenu() sia già stato eseguito quando il passo successivo
     viene renderizzato). Aggiunti 10 nuovi passi che esplorano il menu
     appena aperto: 5 coppie che alternano una vista d'insieme del
     pannello (target #tb-hub-menu) a un dettaglio su ciascuna delle 5
     voci (#tb-lb Classifica, #tb-st Progressi, #tb-hist Storico, #tb-dash
     Panoramica Classe, #tb-badges Traguardi) — tutti 'info' con
     revealTarget:true e blockClicks:true, stesso trattamento già usato
     per il badge aula e il dialogo cambio-aula: i pulsanti sono reali e
     cliccabili ma il click viene ignorato, si avanza solo con "Avanti"
     (ognuno chiuderebbe il menu e/o navigherebbe altrove, rompendo la
     sequenza). Il menu resta aperto per tutta la sequenza; onLeave
     sull'ultimo passo (Traguardi) lo richiude per davvero prima di
     passare a "Torna ai moduli" — stesso principio già discusso per
     onLeave sul passo del dialogo cambio-aula. Sequenza totale: Direttore
     31→41 passi, Docente 21→31 passi. Nessuna modifica al motore
     (_advance/_renderStep invariati: gli stessi controlli sameScreen/
     hubTarget/afterHub già presenti bastano) né a app.js/
     game-engine-state.js/index.html/CSS: tutto contenuto in
     onboarding.js (solo dati dei passi).

   v2.6.1 — bug segnalato (test Direttore, passo 27/41 "Il pannello si
     apre"): premendo "Avanti" il tour si bloccava senza passare al passo
     successivo né chiudersi in modo pulito. Causa: toggleHubMenu() in
     js/app.js registra un listener reale (document, click, {once:true},
     10ms di ritardo dall'apertura) che chiude il menu Hub al primo click
     fuori da #tb-hub-wrap — e il pulsante "Avanti" del tour, nel tooltip,
     è per costruzione fuori da #tb-hub-wrap. Il click su "Avanti" chiude
     quindi per davvero il menu prima ancora che il passo successivo
     (#tb-lb) venga renderizzato, che non trova più un target visibile e
     rinuncia in silenzio — i blockClicks già presenti non bastavano,
     proteggono solo i click sui target del tour, non questo listener
     esterno che ascolta l'intero documento. Fix: nuova proprietà generica
     onEnter (funzione, opzionale, simmetrica a onLeave — vedi
     _renderStep()) richiamata una sola volta al primo render effettivo di
     un passo; usata solo sul passo "Il pannello si apre" per rimuovere
     quel listener con 50ms di ritardo (> i 10ms di app.js, per essere
     sicuri che sia già stato registrato quando lo rimuoviamo — altrimenti
     la rimozione sarebbe un no-op). Nessuna modifica ad app.js: il fix
     resta interamente in onboarding.js.

   PERSISTENZA: localStorage, chiave per-docente
   (pp5_onboarding_<teacherId>) — invariata.

   INDIPENDENZA: nessuna dipendenza da altri file (helper minimi
   locali, es. _escHtml) — puramente difensivo, dato che questo
   script è caricato molto presto (subito dopo theme-manager.js,
   prima di game-engine-state.js) e le sue funzioni pubbliche
   vengono comunque chiamate solo a runtime, molto più tardi.

   INTEGRAZIONE (chiamate nei file esistenti):
     app.js:
       _afterLogin()            → OnboardingTour.init() (invariato)
                                   + OnboardingTour.showCoursesSelectStep()
                                     (ramo Docente, nuovo)
       openDirectorDashboard()  → OnboardingTour.showDashboardStep()
       ddGoGestisciAule()       → OnboardingTour.showWizardStep()
       ddGoSceltaAula()         → OnboardingTour.showCoursesSelectStep() (nuovo)
       openTeacherManagement()  → OnboardingTour.showTeacherMgmtStep() (nuovo)
     game-engine-state.js:
       goStep('mod')       → OnboardingTour.showHomeModuleStep()
       goStep('cat')       → OnboardingTour.showHomeCategoryStep() (nuovo)
       goStep('act')       → OnboardingTour.recheck() (nuovo, rete di
                              sicurezza per il passo Hub, già raggiungibile
                              comunque in modo opportunistico da _advance())
       goStep('didattica') → OnboardingTour.showDidatticaStep() (nuovo,
                              v2.3.0 — stesso pattern del ramo 'cat')

   API pubblica:
     OnboardingTour.init(teacherId, isDirector)
     OnboardingTour.showDashboardStep()
     OnboardingTour.showWizardStep()
     OnboardingTour.showTeacherMgmtStep()
     OnboardingTour.showCoursesSelectStep()
     OnboardingTour.showHomeModuleStep()
     OnboardingTour.showHomeCategoryStep()
     OnboardingTour.showDidatticaStep()   — (v2.3.0)
     OnboardingTour.recheck()             — ri-tenta il render del passo
                                             corrente, no-op se non pertinente
     OnboardingTour.skip()                — chiude il passo attivo e
                                             completa il tour (unica uscita
                                             anticipata possibile)
     OnboardingTour.reset()               — [debug/QA] riazzera lo stato per
                                             l'utente corrente. Console:
                                               OnboardingTour.reset()
                                             poi ricaricare la pagina.
================================================== */
const OnboardingTour = (function () {
  const KEY_PREFIX = 'pp5_onboarding_';

  let _teacherId  = null;
  let _isDirector = false;
  let _state = { done: false, idx: 0 };
  let _renderedIdx = -1; // idx attualmente mostrato — evita re-render/flicker

  // Nodi DOM del passo attivo (velo, anelli, tooltip) — un solo passo alla volta.
  let _domNodes = [];
  // Handler in capture-phase per i passi 'action' — un solo listener globale
  // alla volta, attivo solo mentre un passo 'action' è mostrato.
  let _actionCaptureHandler = null;
  let _reposition = null;

  function _escHtml(s) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(s == null ? '' : s)));
    return d.innerHTML;
  }

  function _key() { return KEY_PREFIX + (_teacherId || 'anon'); }

  function _load() {
    _state = { done: false, idx: 0 };
    try {
      const raw = localStorage.getItem(_key());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Migrazione dallo schema precedente {done, step}: 'done' resta
          // valido così com'è (chi aveva già finito/saltato non lo rivede),
          // 'idx' riparte da 0 se assente — i due schemi di numerazione
          // dei passi non sono confrontabili tra loro.
          _state.done = !!parsed.done;
          _state.idx  = (typeof parsed.idx === 'number') ? parsed.idx : 0;
        }
      }
    } catch (e) {}
  }

  function _save() {
    try { localStorage.setItem(_key(), JSON.stringify(_state)); } catch (e) {}
  }

  function init(teacherId, isDirector) {
    _teacherId  = teacherId || 'anon';
    _isDirector = !!isDirector;
    _renderedIdx = -1;
    _load();
  }

  function _markDone() {
    // v2.5.1 — copre l'uscita via "Salta il tour" mentre il passo attivo
    // ha un onLeave (es. il dialogo cambio-aula bloccato da blockClicks):
    // _advance() gestisce il caso "avanzamento normale", ma il pulsante
    // Salta chiama _markDone() direttamente, bypassando _advance().
    // Guardia su _state.idx < list.length: quando _markDone() arriva QUI
    // già chiamata da _advance() (fine naturale del tour), _state.idx è
    // già oltre l'ultimo passo — nessun onLeave da richiamare due volte.
    if (!_state.done) {
      const list = _stepList();
      const curDef = _state.idx < list.length ? list[_state.idx] : null;
      if (curDef && typeof curDef.onLeave === 'function') {
        try { curDef.onLeave(); } catch (e) {}
      }
    }
    _state.done = true;
    _save();
    _teardown();
  }

  /** Chiude il passo attivo (se presente) e completa definitivamente il tour.
   *  Unico modo per uscire dal tour prima del suo completamento naturale —
   *  Esc e click fuori dal tooltip NON hanno alcun effetto (per scelta). */
  function skip() { _markDone(); }

  /** [debug/QA] Riazzera il tour per l'utente corrente — vedi commento API sopra. */
  function reset() {
    _state = { done: false, idx: 0 };
    _renderedIdx = -1;
    _save();
  }

  /* ================================================
     SEQUENZE — un array dichiarativo per ruolo.
     Ogni passo: { screen, target, type, title, body }
       screen  stringa libera, usata SOLO per decidere se avanzare
               al passo successivo È SICURO farlo immediatamente
               dopo un click/Avanti (stesso screen = nessuna
               transizione di pagina in corso, sicuro renderizzare
               subito) oppure se conviene aspettare la chiamata
               esplicita show*Step() dal punto di navigazione
               dell'app (screen diverso = potenziale animazione/
               reload in corso).
       target  selettore CSS. Se seleziona più elementi (es. tutte
               le card aula), TUTTI diventano contemporaneamente
               il "buco" nel velo per i passi 'action'.
       type    'action' → serve un click reale sul target per
                           avanzare (nessun pulsante Avanti). Il
                           target ottiene sempre un buco reale nel
                           velo (vedi revealTarget).
               'info'   → si avanza col pulsante Avanti/Fatto. Di
                           default il target resta coperto dal velo
                           (solo l'anello lo indica visivamente) —
                           vedi revealTarget per il caso contrario.
       revealTarget  (opzionale, solo per passi 'info') → true forza
               comunque il buco reale nel velo (target visibile e
               fisicamente interagibile, es. digitabile) SENZA
               collegare il click all'avanzamento del tour, che
               resta legato solo al pulsante Avanti. Usato per i
               passi 'info' il cui target non è un singolo elemento
               con un'azione univoca (es. un form multi-campo): un
               click reale su un punto qualsiasi al suo interno non
               ha un significato univoco di "ho finito qui", quindi
               non deve far avanzare il tour da solo — ma il target
               non deve comunque restare nascosto dietro un riquadro
               nero (v2.1.2, richiesta esplicita utente).
       blockClicks  (opzionale, v2.5.1, solo insieme a revealTarget:true)
               → true aggiunge uno "scudo" trasparente sopra ciascun
               target, con lo stesso rettangolo del buco nel velo:
               il target resta visibile (il buco c'è comunque, per
               via di revealTarget) ma i click reali su di esso
               vengono intercettati e ignorati invece di raggiungere
               l'elemento vero sottostante. Usato quando il target è
               un elemento REALE e funzionante che però, in questo
               punto specifico del tour, non deve poter essere
               azionato per davvero (es. i due pulsanti di un dialogo
               di conferma reale, dove nessuno dei due deve poter
               essere premuto sul serio finché il tour è a questo
               passo — richiesta esplicita utente).
       onLeave (opzionale) → funzione richiamata una sola volta,
               subito PRIMA di lasciare questo passo (sia avanzando
               col pulsante Avanti, sia con "Salta il tour" mentre il
               passo è quello attivo). Serve a ripulire un effetto
               collaterale reale innescato da questo stesso passo (es.
               chiudere per davvero un dialogo reale rimasto aperto
               perché blockClicks impediva di chiuderlo cliccandolo
               per davvero) — vedi _advance()/_markDone() più sotto.
  ================================================ */
  const DIRECTOR_STEPS = [
    { screen:'dashboard', target:'.dd-aule', type:'action',
      title:'Benvenuto in PixelProf! 👋',
      body:'Inizia da qui: premi su "Gestisci Aule" per creare la tua prima aula e scegliere quali moduli rendere disponibili ai docenti.' },
    { screen:'wizard', target:'#cs-add-form-wrap', type:'info', revealTarget:true,
      title:'Crea la tua prima aula 🏫',
      body:'Da qui avvii la creazione guidata in quattro passi: nome, area didattica, moduli abilitati e docenti da assegnare. L\'area scelta determina quali moduli saranno disponibili.' },
    { screen:'wizard', target:'#cs-back-dashboard-btn', type:'action',
      title:'Tutto pronto ✅',
      body:'Premi qui per tornare al pannello di controllo.' },
    { screen:'dashboard', target:'.dd-docenti', type:'action',
      title:'Gestisci i docenti 👩\u200d🏫',
      body:'Da qui puoi creare nuovi account e gestire quelli esistenti. Premi per continuare.' },
    { screen:'teacherMgmt', target:'.dd-new-teacher', type:'action',
      title:'Crea un nuovo account 🆕',
      body:'Qui puoi inserire un nuovo docente: bastano nome, cognome ed email — riceverà un invito automatico per impostare la password.' },
    { screen:'teacherCreate', target:'#screen-teacher-create .back-link', type:'action',
      title:'Puoi tornare indietro quando vuoi ↩️',
      body:'Se cambi idea, questo pulsante ti riporta alla gestione docenti senza creare nulla.' },
    { screen:'teacherMgmt', target:'.dd-teacher-list', type:'action',
      title:'Docenti già creati 👥',
      body:'Qui trovi i docenti già registrati: da ogni scheda puoi assegnarli alle aule già create (raggruppate per area didattica), modificarne i dati o disattivarli.' },
    { screen:'teacherList', target:'#screen-teacher-list .back-link', type:'action',
      title:'Torna alla gestione docenti ↩️',
      body:'Questo pulsante ti riporta al pannello principale della gestione docenti.' },
    { screen:'teacherMgmt', target:'#screen-teacher-mgmt .back-link', type:'action',
      title:'Torniamo alla dashboard ✅',
      body:'Premi qui per tornare al pannello di controllo.' },
    { screen:'dashboard', target:'.dd-scegli', type:'action',
      title:'Entra in un\'aula 🎮',
      body:'Da qui puoi accedere a un\'aula ed esercitarti esattamente come farebbe un docente.' },
    { screen:'coursesSelect', target:'.course-card', type:'action',
      title:'Scegli un\'aula 🏫',
      body:'Le aule sono raggruppate per area didattica: seleziona una qualsiasi aula tra quelle disponibili per continuare.' },
    { screen:'homeModule', target:'.mod-grid', type:'action',
      title:'Scegli il modulo 📚',
      body:'Ogni aula può abilitare solo alcuni moduli: qui vedi solo quelli disponibili per questa classe.' },
    // v2.3.0 — coprono il flusso Minigiochi/Didattica raggiunto dopo la
    // scelta del modulo. Testo identico ai corrispondenti passi di
    // TEACHER_STEPS: stessa schermata, stesso flusso, indipendente dal
    // ruolo. (Il passo Hub che era qui è stato spostato più sotto, subito
    // prima di "Torna ai moduli" — v2.6.0, vedi commento là.)
    { screen:'homeCategory', target:'.cat-games', type:'action',
      title:'Minigiochi 🎮',
      body:'Premi qui per scegliere tra le modalità di gioco: Quiz, Speed Quiz, Abbina, Completa la frase e Vero o Falso.' },
    { screen:'act', target:'#step-act .act-grid', type:'action',
      title:'Le modalità di gioco 🕹️',
      body:'Scegli quella più adatta alla lezione: dopo deciderai il numero di domande e se far giocare la classe in Individuale o a Squadre.' },
    // v8.20.4: la v8.20.3 aveva reso questo passo 'info' (si avanzava
    // con "Avanti" senza interagire col pulsante "← Modalità", coperto
    // dal pannello impostazioni aperto dal passo precedente) ma
    // lasciava l'utente bloccato dopo: chiuso il velo del tour restava
    // comunque sul pannello aperto, senza sapere come chiuderlo per
    // arrivare al passo dopo (.cat-didattica, screen 'homeCategory' —
    // irraggiungibile finché il pannello resta aperto sopra step-act).
    // Ora due azioni reali in sequenza: prima si chiude il pannello con
    // la × (passo qui sotto), poi "← Modalità" torna visibile e
    // cliccabile per davvero (passo successivo, di nuovo 'action') —
    // niente più salti "a sorpresa" nell'interfaccia.
    { screen:'act', target:'.setup-close-btn', type:'action',
      title:'Chiudi le impostazioni ✖️',
      body:'Il pannello si è aperto cliccando sulla card. Chiudilo con questa ×: tornerai alla scelta dei minigiochi.' },
    // La variante gemella di questo passo dentro Flip Card (poco più
    // sotto, target '#step-didattica .act-back-btn') resta invariata,
    // 'action': quel pulsante non è mai coperto da nessun overlay,
    // nessun problema lì.
    { screen:'act', target:'#step-act .act-back-btn', type:'action',
      title:'Torna alla modalità ↩️',
      body:'Questo pulsante ti riporta alla scelta tra Minigiochi e Didattica.' },
    { screen:'homeCategory', target:'.cat-didattica', type:'action',
      title:'Didattica 📖',
      body:'L\'alternativa ai minigiochi: qui la classe ripassa con le Flip Card, domanda su un lato e risposta sull\'altro.' },
    { screen:'didattica', target:'#step-didattica .act-card', type:'action',
      title:'Flip Card 🃏',
      body:'Per ora è l\'unico metodo disponibile: scegli il livello e la classe potrà ripassare voltando le carte.' },
    // v2.4.0 — 3 nuovi passi (richiesta esplicita utente): coprono il
    // flusso REALE dentro Flip Card, raggiunto cliccando la card sopra
    // (ora 'action', v2.3.1) — prima il tour saltava direttamente al
    // pulsante "torna alla modalità", incoerente con quanto succede
    // davvero in app (scelta livello, poi sessione con pulsante Esci e
    // relativa conferma). Hook dedicati in js/flip-card.js (file isolato,
    // nessuna modifica ai file core): vedi showFlipCardLevelStep/
    // showFlipCardExitStep/showFlipCardConfirmStep più sotto.
    { screen:'flipcardLevel', target:'#g-area .act-grid', type:'action',
      title:'Scegli il livello 🎚️',
      body:'Facile o Medio: la classe può scegliere il livello di approfondimento prima di iniziare.' },
    { screen:'flipcardExit', target:'.fc-exit-btn', type:'action',
      title:'Uscire in ogni momento ✖️',
      body:'Da qui la classe può interrompere la sessione e tornare alla scelta del metodo di studio quando vuole.' },
    { screen:'flipcardConfirm', target:'#pp-generic-yes', type:'action',
      title:'Conferma richiesta ✅',
      body:'Per evitare uscite accidentali viene sempre chiesta una conferma prima di abbandonare la sessione.' },
    { screen:'didattica', target:'#step-didattica .act-back-btn', type:'action',
      title:'Torna alla modalità ↩️',
      body:'Anche da qui puoi tornare alla scelta tra Minigiochi e Didattica.' },
    // v2.5.0 — 6 nuovi passi finali (richiesta esplicita utente): vedi
    // changelog in testa al file per il dettaglio del ragionamento
    // (screen:'homeCategory' condiviso, action solo sul logo, dialogo
    // reale con entrambi i pulsanti realmente cliccabili).
    { screen:'homeCategory', target:'#tb-user-name', type:'info', revealTarget:true,
      title:'Il tuo nome 👤',
      body:'In alto a destra vedi sempre il ruolo e il nome con cui hai effettuato l\'accesso.' },
    { screen:'homeCategory', target:'.theme-toggle-btn', type:'info', revealTarget:true,
      title:'Tema chiaro o scuro 🌗',
      body:'Passa dal tema scuro a quello chiaro, e viceversa, in qualsiasi momento con un tocco.' },
    { screen:'homeCategory', target:'.audio-toggle-btn:not(.theme-toggle-btn)', type:'info', revealTarget:true,
      title:'Audio on/off 🔊',
      body:'Attiva o disattiva gli effetti sonori del gioco quando vuoi.' },
    // v2.6.0 — richiesta esplicita utente: il passo Hub (era qui) è stato
    // spostato subito prima di "Torna ai moduli" più sotto, insieme ai 10
    // nuovi passi che ne esplorano il contenuto — coerenza con gli altri
    // pulsanti permanenti della topbar spiegati in quella stessa zona. Ora
    // è 'action': il click reale apre per davvero il menu a tendina, così
    // i 10 passi successivi possono mostrarne il contenuto esploso. Stesso
    // meccanismo già usato per il logo PixelProf più sotto (v2.1.4,
    // avanzamento rimandato di un tick in _advance()): quando il passo
    // "Il pannello si apre" viene renderizzato, l'onclick nativo
    // toggleHubMenu() ha già rimosso la classe "hidden" dal menu.
    { screen:'homeCategory', target:'#tb-hub-btn', type:'action',
      title:'Il tuo Hub 🎯',
      body:'Raggruppa Classifica, Progressi, Storico, Panoramica Classe e Traguardi. Premilo per scoprire cosa contiene.' },
    // v2.6.0 — 10 nuovi passi (richiesta esplicita utente): esplorano il
    // menu Hub appena aperto dal passo precedente, alternando una vista
    // d'insieme del pannello (#tb-hub-menu, blockClicks:true come per il
    // badge aula e il dialogo cambio-aula più sotto — i 5 pulsanti reali
    // non devono navigare via per sbaglio durante il tour) a un dettaglio
    // su ciascuna delle 5 voci. Il menu resta aperto per tutta la
    // sequenza; onLeave sull'ultimo passo (Traguardi) lo richiude per
    // davvero prima di passare a "Torna ai moduli".
    // v2.6.1 — bug segnalato: cliccando "Avanti" su questo passo il tour
    // si bloccava (nessun passo successivo, nessuna chiusura pulita). Causa:
    // toggleHubMenu() (js/app.js) registra un listener reale
    // document.addEventListener('click', _hubOutsideClick, {once:true}) con
    // 10ms di ritardo dopo l'apertura, per chiudere il menu al primo click
    // fuori da #tb-hub-wrap — e il pulsante "Avanti" del tour (nel
    // tooltip, fuori da #tb-hub-wrap per definizione) lo soddisfa: il click
    // chiude per davvero il menu prima ancora che il passo successivo
    // (#tb-lb) venga renderizzato, che quindi non trova più un target
    // visibile e rinuncia in silenzio. Fix: onEnter su questo passo rimuove
    // quel listener — con un ritardo di 50ms (> i 10ms di app.js) per
    // essere sicuri che sia già stato registrato quando lo rimuoviamo, o la
    // rimozione sarebbe un no-op e app.js lo ri-registrerebbe comunque poco
    // dopo. Da qui in poi il menu resta aperto "per davvero" fino
    // all'onLeave del passo Traguardi, che lo richiude esplicitamente.
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Il pannello si apre 📂',
      body:'Ecco le cinque scorciatoie dell\'Hub. Iniziamo dalla prima.',
      onEnter: function () {
        setTimeout(function () {
          if (typeof _hubOutsideClick === 'function') {
            document.removeEventListener('click', _hubOutsideClick);
          }
        }, 50);
      } },
    { screen:'homeCategory', target:'#tb-lb', type:'info', revealTarget:true, blockClicks:true,
      title:'Classifica 🏆',
      body:'Il podio della classe per ogni minigioco, sia in modalità Individuale che a Squadre.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Torniamo al pannello 📂',
      body:'Passiamo alla voce successiva.' },
    { screen:'homeCategory', target:'#tb-st', type:'info', revealTarget:true, blockClicks:true,
      title:'Progressi 📊',
      body:'Le tue statistiche personali: domande totali, risposte corrette e andamento per modulo.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Ancora nel pannello 📂',
      body:'Avanti con la prossima sezione.' },
    { screen:'homeCategory', target:'#tb-hist', type:'info', revealTarget:true, blockClicks:true,
      title:'Storico 🕐',
      body:'L\'elenco delle sessioni giocate, filtrabile per attività e modalità.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Un passo alla volta 📂',
      body:'Manca ancora qualche voce.' },
    { screen:'homeCategory', target:'#tb-dash', type:'info', revealTarget:true, blockClicks:true,
      title:'Panoramica Classe 📈',
      body:'La vista d\'insieme della classe: risultati, partecipazione e le domande più difficili.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Ultima voce nel pannello 📂',
      body:'Chiudiamo con l\'ultima sezione.' },
    { screen:'homeCategory', target:'#tb-badges', type:'info', revealTarget:true, blockClicks:true,
      title:'Traguardi 🏅',
      body:'I badge sbloccati dalla classe e il progresso verso i prossimi.',
      // v2.6.0 — il menu Hub è stato aperto per davvero dal passo "Il tuo
      // Hub" (v. sopra) e non è più servito da allora: va richiuso per
      // davvero prima del passo successivo ("Torna ai moduli"), altrimenti
      // resterebbe aperto sopra la topbar. Stesso principio già discusso
      // per onLeave sul passo del dialogo cambio-aula più sotto.
      onLeave: function () {
        if (typeof closeHubMenu === 'function') { closeHubMenu(); }
      } },
    { screen:'homeCategory', target:'#tb-course-badge', type:'info', revealTarget:true, blockClicks:true,
      title:'Torna ai moduli 🏫',
      body:'Il nome dell\'aula in alto: da qui puoi sempre tornare alla scelta dei moduli. Per ora premi "Avanti" per continuare il tour.' },
    { screen:'homeCategory', target:'.logo-wrap', type:'action',
      title:'Il logo PixelProf 🔄',
      body:'Premilo in alto a sinistra per uscire da questa aula e sceglierne un\'altra.' },
    { screen:'homeCategory', target:'#pp-dialog-no, #pp-dialog-yes', type:'info', revealTarget:true, blockClicks:true,
      title:'Scegli cosa fare ✅',
      body:'"No, continua" annulla e resta qui; "Sì, cambia aula" ti porta alla schermata di selezione aule.',
      // v2.5.1 — richiesta esplicita utente: il dialogo è vero (aperto dal
      // passo precedente) ma i suoi due pulsanti non devono essere
      // azionabili per davvero durante questo passo, solo "Avanti" deve
      // far proseguire il tour (blockClicks, vedi doc più sopra). Se il
      // dialogo è ancora aperto quando si lascia questo passo, onLeave lo
      // chiude per davvero simulando un click reale su "No, continua":
      // riusa la logica vera già scritta in goCoursesFromApp()
      // (game-engine-state.js), niente da duplicare qui.
      onLeave: function () {
        var overlay = document.getElementById('pp-dialog-overlay');
        var noBtn = document.getElementById('pp-dialog-no');
        if (overlay && !overlay.classList.contains('hidden') && noBtn) { noBtn.click(); }
      } },
    // v2.5.1 — nuovo passo richiesto: focus sul tasto logout, subito
    // prima della chiusura del tour. blockClicks:true come sopra: il
    // pulsante è vero e realmente funzionante (uscita immediata
    // dall'account), quindi non deve poter essere azionato per sbaglio
    // solo perché il tour lo sta mostrando — nessun onLeave necessario
    // qui: a differenza del passo del dialogo, questo passo non apre
    // nulla, blockClicks da solo basta a impedire l'unico effetto
    // collaterale possibile (il logout stesso).
    { screen:'homeCategory', target:'.cs-logout-btn', type:'info', revealTarget:true, blockClicks:true,
      title:'Esci dall\'account 🚪',
      body:'Il pulsante per uscire dal tuo account, sempre disponibile. Per ora premi "Avanti" per continuare il tour.' },
    { screen:'homeCategory', target:'.cat-grid', type:'info',
      title:'Tour completato! 🎉',
      body:'Ora conosci tutti gli strumenti di PixelProf. Buona lezione!' },
  ];

  const TEACHER_STEPS = [
    { screen:'coursesSelect', target:'.course-card', type:'action',
      title:'Benvenuto in PixelProf! 👋',
      body:'Le aule sono raggruppate per area didattica: scegli una qualsiasi aula tra quelle disponibili per iniziare a esercitarti.' },
    { screen:'homeModule', target:'.mod-card', type:'action',
      title:'Scegli il modulo 📚',
      body:'Ogni aula può abilitare solo alcuni moduli: qui vedi solo quelli disponibili per questa classe.' },
    // v2.3.0 — ex passo "Scegli la modalità" (era qui, prima di Hub):
    // ritestato per parlare solo di Minigiochi, dato che Didattica ha ora
    // il suo passo dedicato più sotto. (Il passo Hub che era qui è stato
    // spostato più sotto, subito prima di "Torna ai moduli" — v2.6.0,
    // vedi commento là.)
    { screen:'homeCategory', target:'.cat-games', type:'action',
      title:'Minigiochi 🎮',
      body:'Premi qui per scegliere tra le modalità di gioco: Quiz, Speed Quiz, Abbina, Completa la frase e Vero o Falso.' },
    { screen:'act', target:'#step-act .act-grid', type:'action',
      title:'Le modalità di gioco 🕹️',
      body:'Scegli quella più adatta alla lezione: dopo deciderai il numero di domande e se far giocare la classe in Individuale o a Squadre.' },
    // v8.20.4: la v8.20.3 aveva reso questo passo 'info' (si avanzava
    // con "Avanti" senza interagire col pulsante "← Modalità", coperto
    // dal pannello impostazioni aperto dal passo precedente) ma
    // lasciava l'utente bloccato dopo: chiuso il velo del tour restava
    // comunque sul pannello aperto, senza sapere come chiuderlo per
    // arrivare al passo dopo (.cat-didattica, screen 'homeCategory' —
    // irraggiungibile finché il pannello resta aperto sopra step-act).
    // Ora due azioni reali in sequenza: prima si chiude il pannello con
    // la × (passo qui sotto), poi "← Modalità" torna visibile e
    // cliccabile per davvero (passo successivo, di nuovo 'action') —
    // niente più salti "a sorpresa" nell'interfaccia.
    { screen:'act', target:'.setup-close-btn', type:'action',
      title:'Chiudi le impostazioni ✖️',
      body:'Il pannello si è aperto cliccando sulla card. Chiudilo con questa ×: tornerai alla scelta dei minigiochi.' },
    // La variante gemella di questo passo dentro Flip Card (poco più
    // sotto, target '#step-didattica .act-back-btn') resta invariata,
    // 'action': quel pulsante non è mai coperto da nessun overlay,
    // nessun problema lì.
    { screen:'act', target:'#step-act .act-back-btn', type:'action',
      title:'Torna alla modalità ↩️',
      body:'Questo pulsante ti riporta alla scelta tra Minigiochi e Didattica.' },
    { screen:'homeCategory', target:'.cat-didattica', type:'action',
      title:'Didattica 📖',
      body:'L\'alternativa ai minigiochi: qui la classe ripassa con le Flip Card, domanda su un lato e risposta sull\'altro.' },
    { screen:'didattica', target:'#step-didattica .act-card', type:'action',
      title:'Flip Card 🃏',
      body:'Per ora è l\'unico metodo disponibile: scegli il livello e la classe potrà ripassare voltando le carte.' },
    // v2.4.0 — 3 nuovi passi (richiesta esplicita utente): coprono il
    // flusso REALE dentro Flip Card, raggiunto cliccando la card sopra
    // (ora 'action', v2.3.1) — prima il tour saltava direttamente al
    // pulsante "torna alla modalità", incoerente con quanto succede
    // davvero in app (scelta livello, poi sessione con pulsante Esci e
    // relativa conferma). Hook dedicati in js/flip-card.js (file isolato,
    // nessuna modifica ai file core): vedi showFlipCardLevelStep/
    // showFlipCardExitStep/showFlipCardConfirmStep più sotto.
    { screen:'flipcardLevel', target:'#g-area .act-grid', type:'action',
      title:'Scegli il livello 🎚️',
      body:'Facile o Medio: la classe può scegliere il livello di approfondimento prima di iniziare.' },
    { screen:'flipcardExit', target:'.fc-exit-btn', type:'action',
      title:'Uscire in ogni momento ✖️',
      body:'Da qui la classe può interrompere la sessione e tornare alla scelta del metodo di studio quando vuole.' },
    { screen:'flipcardConfirm', target:'#pp-generic-yes', type:'action',
      title:'Conferma richiesta ✅',
      body:'Per evitare uscite accidentali viene sempre chiesta una conferma prima di abbandonare la sessione.' },
    { screen:'didattica', target:'#step-didattica .act-back-btn', type:'action',
      title:'Torna alla modalità ↩️',
      body:'Anche da qui puoi tornare alla scelta tra Minigiochi e Didattica.' },
    // v2.5.0 — 6 nuovi passi finali (richiesta esplicita utente): vedi
    // changelog in testa al file per il dettaglio del ragionamento
    // (screen:'homeCategory' condiviso, action solo sul logo, dialogo
    // reale con entrambi i pulsanti realmente cliccabili).
    { screen:'homeCategory', target:'#tb-user-name', type:'info', revealTarget:true,
      title:'Il tuo nome 👤',
      body:'In alto a destra vedi sempre il ruolo e il nome con cui hai effettuato l\'accesso.' },
    { screen:'homeCategory', target:'.theme-toggle-btn', type:'info', revealTarget:true,
      title:'Tema chiaro o scuro 🌗',
      body:'Passa dal tema scuro a quello chiaro, e viceversa, in qualsiasi momento con un tocco.' },
    { screen:'homeCategory', target:'.audio-toggle-btn:not(.theme-toggle-btn)', type:'info', revealTarget:true,
      title:'Audio on/off 🔊',
      body:'Attiva o disattiva gli effetti sonori del gioco quando vuoi.' },
    // v2.6.0 — richiesta esplicita utente: il passo Hub (era qui) è stato
    // spostato subito prima di "Torna ai moduli" più sotto, insieme ai 10
    // nuovi passi che ne esplorano il contenuto — coerenza con gli altri
    // pulsanti permanenti della topbar spiegati in quella stessa zona. Ora
    // è 'action': il click reale apre per davvero il menu a tendina, così
    // i 10 passi successivi possono mostrarne il contenuto esploso. Stesso
    // meccanismo già usato per il logo PixelProf più sotto (v2.1.4,
    // avanzamento rimandato di un tick in _advance()): quando il passo
    // "Il pannello si apre" viene renderizzato, l'onclick nativo
    // toggleHubMenu() ha già rimosso la classe "hidden" dal menu.
    { screen:'homeCategory', target:'#tb-hub-btn', type:'action',
      title:'Il tuo Hub 🎯',
      body:'Raggruppa Classifica, Progressi, Storico, Panoramica Classe e Traguardi. Premilo per scoprire cosa contiene.' },
    // v2.6.0 — 10 nuovi passi (richiesta esplicita utente): esplorano il
    // menu Hub appena aperto dal passo precedente, alternando una vista
    // d'insieme del pannello (#tb-hub-menu, blockClicks:true come per il
    // badge aula e il dialogo cambio-aula più sotto — i 5 pulsanti reali
    // non devono navigare via per sbaglio durante il tour) a un dettaglio
    // su ciascuna delle 5 voci. Il menu resta aperto per tutta la
    // sequenza; onLeave sull'ultimo passo (Traguardi) lo richiude per
    // davvero prima di passare a "Torna ai moduli".
    // v2.6.1 — bug segnalato: cliccando "Avanti" su questo passo il tour
    // si bloccava (nessun passo successivo, nessuna chiusura pulita). Causa:
    // toggleHubMenu() (js/app.js) registra un listener reale
    // document.addEventListener('click', _hubOutsideClick, {once:true}) con
    // 10ms di ritardo dopo l'apertura, per chiudere il menu al primo click
    // fuori da #tb-hub-wrap — e il pulsante "Avanti" del tour (nel
    // tooltip, fuori da #tb-hub-wrap per definizione) lo soddisfa: il click
    // chiude per davvero il menu prima ancora che il passo successivo
    // (#tb-lb) venga renderizzato, che quindi non trova più un target
    // visibile e rinuncia in silenzio. Fix: onEnter su questo passo rimuove
    // quel listener — con un ritardo di 50ms (> i 10ms di app.js) per
    // essere sicuri che sia già stato registrato quando lo rimuoviamo, o la
    // rimozione sarebbe un no-op e app.js lo ri-registrerebbe comunque poco
    // dopo. Da qui in poi il menu resta aperto "per davvero" fino
    // all'onLeave del passo Traguardi, che lo richiude esplicitamente.
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Il pannello si apre 📂',
      body:'Ecco le cinque scorciatoie dell\'Hub. Iniziamo dalla prima.',
      onEnter: function () {
        setTimeout(function () {
          if (typeof _hubOutsideClick === 'function') {
            document.removeEventListener('click', _hubOutsideClick);
          }
        }, 50);
      } },
    { screen:'homeCategory', target:'#tb-lb', type:'info', revealTarget:true, blockClicks:true,
      title:'Classifica 🏆',
      body:'Il podio della classe per ogni minigioco, sia in modalità Individuale che a Squadre.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Torniamo al pannello 📂',
      body:'Passiamo alla voce successiva.' },
    { screen:'homeCategory', target:'#tb-st', type:'info', revealTarget:true, blockClicks:true,
      title:'Progressi 📊',
      body:'Le tue statistiche personali: domande totali, risposte corrette e andamento per modulo.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Ancora nel pannello 📂',
      body:'Avanti con la prossima sezione.' },
    { screen:'homeCategory', target:'#tb-hist', type:'info', revealTarget:true, blockClicks:true,
      title:'Storico 🕐',
      body:'L\'elenco delle sessioni giocate, filtrabile per attività e modalità.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Un passo alla volta 📂',
      body:'Manca ancora qualche voce.' },
    { screen:'homeCategory', target:'#tb-dash', type:'info', revealTarget:true, blockClicks:true,
      title:'Panoramica Classe 📈',
      body:'La vista d\'insieme della classe: risultati, partecipazione e le domande più difficili.' },
    { screen:'homeCategory', target:'#tb-hub-menu', type:'info', revealTarget:true, blockClicks:true,
      title:'Ultima voce nel pannello 📂',
      body:'Chiudiamo con l\'ultima sezione.' },
    { screen:'homeCategory', target:'#tb-badges', type:'info', revealTarget:true, blockClicks:true,
      title:'Traguardi 🏅',
      body:'I badge sbloccati dalla classe e il progresso verso i prossimi.',
      // v2.6.0 — il menu Hub è stato aperto per davvero dal passo "Il tuo
      // Hub" (v. sopra) e non è più servito da allora: va richiuso per
      // davvero prima del passo successivo ("Torna ai moduli"), altrimenti
      // resterebbe aperto sopra la topbar. Stesso principio già discusso
      // per onLeave sul passo del dialogo cambio-aula più sotto.
      onLeave: function () {
        if (typeof closeHubMenu === 'function') { closeHubMenu(); }
      } },
    { screen:'homeCategory', target:'#tb-course-badge', type:'info', revealTarget:true, blockClicks:true,
      title:'Torna ai moduli 🏫',
      body:'Il nome dell\'aula in alto: da qui puoi sempre tornare alla scelta dei moduli. Per ora premi "Avanti" per continuare il tour.' },
    { screen:'homeCategory', target:'.logo-wrap', type:'action',
      title:'Il logo PixelProf 🔄',
      body:'Premilo in alto a sinistra per uscire da questa aula e sceglierne un\'altra.' },
    { screen:'homeCategory', target:'#pp-dialog-no, #pp-dialog-yes', type:'info', revealTarget:true, blockClicks:true,
      title:'Scegli cosa fare ✅',
      body:'"No, continua" annulla e resta qui; "Sì, cambia aula" ti porta alla schermata di selezione aule.',
      // v2.5.1 — vedi commento gemello in DIRECTOR_STEPS più sopra.
      onLeave: function () {
        var overlay = document.getElementById('pp-dialog-overlay');
        var noBtn = document.getElementById('pp-dialog-no');
        if (overlay && !overlay.classList.contains('hidden') && noBtn) { noBtn.click(); }
      } },
    // v2.5.1 — vedi commento gemello in DIRECTOR_STEPS più sopra.
    { screen:'homeCategory', target:'.cs-logout-btn', type:'info', revealTarget:true, blockClicks:true,
      title:'Esci dall\'account 🚪',
      body:'Il pulsante per uscire dal tuo account, sempre disponibile. Per ora premi "Avanti" per continuare il tour.' },
    { screen:'homeCategory', target:'.cat-grid', type:'info',
      title:'Tour completato! 🎉',
      body:'Ora conosci tutti gli strumenti di PixelProf. Buona lezione!' },
  ];

  function _stepList() { return _isDirector ? DIRECTOR_STEPS : TEACHER_STEPS; }

  /* ================================================
     TEARDOWN / RISOLUZIONE TARGET
  ================================================ */
  function _teardown() {
    if (_reposition) {
      window.removeEventListener('resize', _reposition);
      window.removeEventListener('scroll', _reposition, true);
      _reposition = null;
    }
    if (_actionCaptureHandler) {
      document.removeEventListener('click', _actionCaptureHandler, true);
      _actionCaptureHandler = null;
    }
    _domNodes.forEach(n => { try { n.remove(); } catch (e) {} });
    _domNodes = [];
  }

  /** Elementi che matchano il selettore E sono realmente visibili
   *  (offsetParent non nullo — falso per display:none a qualunque
   *  livello di antenato, che è esattamente come questa app nasconde
   *  le schermate tramite la classe .hidden). Evita falsi positivi
   *  su elementi statici presenti nel DOM ma dietro a uno schermo
   *  ancora nascosto. */
  function _resolveVisibleTargets(sel) {
    try {
      return Array.from(document.querySelectorAll(sel)).filter(el => el.offsetParent !== null);
    } catch (e) { return []; }
  }

  function _unionRect(rects) {
    const left   = Math.min.apply(null, rects.map(r => r.left));
    const top    = Math.min.apply(null, rects.map(r => r.top));
    const right  = Math.max.apply(null, rects.map(r => r.right));
    const bottom = Math.max.apply(null, rects.map(r => r.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  /** v8.15.7 — bug segnalato: "scelta aula", scroll bloccato (solo
   *  desktop, rotellina). Causa reale: alcune schermate (es.
   *  #screen-courses) sono pannelli position:fixed con overflow-y:auto
   *  PROPRIO — lo scroll avviene AL LORO INTERNO, non sul body. Il velo
   *  del tour (.onb-overlay) è aggiunto come figlio diretto di <body>,
   *  quindi è un FRATELLO di questi pannelli, mai un loro discendente:
   *  lo scroll naturale del browser (che risale la catena di ANTENATI
   *  dell'elemento sotto il cursore, dal velo verso <body>) non incontra
   *  mai quel overflow-y:auto e non trova nient'altro da scrollare —
   *  bloccato. Altre schermate (es. #tab-home/.mod-grid) sono invece
   *  semplici <div> a flusso normale: lì è il body stesso a scrollare
   *  ed essendo il velo figlio di body la catena funziona già da sola —
   *  per questo lì "funziona". Risolto individuando qui il vero
   *  contenitore con overflow e inoltrandoci manualmente wheel/touch
   *  dal velo (vedi _renderStep). */
  function _findScrollableAncestor(el) {
    let node = el && el.parentElement;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1) {
        return node;
      }
      node = node.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  /** Costruisce un clip-path (regola evenodd) = intero viewport MENO un
   *  rettangolo per ciascun rect fornito, con pad px di margine. Il
   *  risultato ritaglia SIA il rendering SIA l'hit-test dell'elemento a
   *  cui viene applicato: le aree "bucate" non ricevono più click, che
   *  passano diretti all'elemento reale sottostante. */
  function _buildClipPath(rects, pad) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let d = `M0 0H${vw}V${vh}H0Z`;
    rects.forEach(r => {
      const x0 = Math.max(0, r.left - pad);
      const y0 = Math.max(0, r.top - pad);
      const x1 = Math.min(vw, r.right + pad);
      const y1 = Math.min(vh, r.bottom + pad);
      const w = x1 - x0, h = y1 - y0;
      if (w > 0 && h > 0) d += `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
    });
    return `path(evenodd, "${d}")`;
  }

  /* ================================================
     AVANZAMENTO
  ================================================ */
  function _advance() {
    const list = _stepList();
    const prevDef = list[_state.idx];
    // v2.5.1 — vedi doc di onLeave più sopra: richiamata qui, prima di
    // lasciare davvero il passo, per il percorso "Avanti"/"Fatto".
    if (prevDef && typeof prevDef.onLeave === 'function') {
      try { prevDef.onLeave(); } catch (e) {}
    }
    _state.idx++;
    _save();
    _renderedIdx = -1;
    _teardown();
    const nextDef = list[_state.idx];
    if (!nextDef) { _markDone(); return; }
    // Sicuro renderizzare SUBITO (senza aspettare l'hook esplicito
    // dell'app) in due casi: stesso "screen" del passo appena concluso
    // (nessuna transizione di pagina in mezzo), oppure il target è
    // l'Hub — sempre presente nella topbar qualunque sia lo step-*
    // attivo in quel momento, quindi sempre sicuro da controllare.
    const sameScreen = prevDef && nextDef.screen === prevDef.screen;
    const hubTarget  = nextDef.target === '#tb-hub-btn';
    // v2.3.0 — mirror di hubTarget ma sul passo PRECEDENTE: il passo Hub
    // (sempre 'info') può ora essere seguito da altri passi invece di
    // essere l'ultimo. Il suo tooltip si limita a spiegare il pulsante
    // topbar sempre presente, senza mai navigare altrove — quindi la
    // schermata dietro di esso (qualunque step-mod/cat/act/didattica fosse
    // già attivo PRIMA che Hub venisse mostrato) è garantita ancora
    // quella, sicuro controllare subito anche in questo caso.
    const afterHub = prevDef && prevDef.target === '#tb-hub-btn';
    if (sameScreen || hubTarget || afterHub) {
      // v2.1.4 — bug segnalato: "step 6, tour fuori schermo, impossibile
      // continuare". Causa: questo _advance() viene chiamato dal listener
      // di click in CAPTURE-phase (vedi sotto), che scatta PRIMA
      // dell'eventuale onclick nativo dell'elemento (bubble-phase). Per
      // target come .dd-teacher-list/.dd-new-teacher — stesso "screen"
      // del passo successivo, ma il cui onclick nativo (tmGoList(),
      // tmGoCreate()...) nasconde la sezione corrente e ne mostra
      // un'altra — renderizzare qui in modo sincrono catturava il DOM
      // ancora nello stato "vecchio" (pre-navigazione): il tooltip/anello
      // veniva posizionato su un target che, un istante dopo, spariva
      // dietro la nuova schermata — overlay orfano, mal posizionato,
      // apparentemente "fuori schermo". Rimandando di un tick (dopo che
      // l'intero dispatch sincrono del click, incluso l'onclick nativo,
      // è già completato) il controllo vede lo stato REALE del DOM: se
      // il target è sparito, non renderizza nulla (si riallinea più
      // tardi tramite l'hook già presente, es. openTeacherManagement());
      // se è ancora visibile, renderizza correttamente come prima.
      setTimeout(_tryRenderCurrentStep, 0);
    }
  }

  function _tryRenderCurrentStep() {
    if (_state.done) return false;
    const list = _stepList();
    if (_state.idx >= list.length) { _markDone(); return false; }
    if (_renderedIdx === _state.idx && _domNodes.length) return true; // già mostrato
    const def = list[_state.idx];
    const targets = _resolveVisibleTargets(def.target);
    if (!targets.length) return false; // schermata non ancora pronta — si riprova dopo
    _renderStep(def, targets);
    _renderedIdx = _state.idx;
    return true;
  }

  /* ================================================
     RENDERING — velo con clip-path + anello/i + tooltip
  ================================================ */
  function _renderStep(def, targets) {
    _teardown(); // sicurezza, normalmente già vuoto

    // v2.6.1 — nuova proprietà generica onEnter (funzione, opzionale),
    // simmetrica a onLeave: richiamata una sola volta qui, nel momento in
    // cui il passo viene effettivamente renderizzato per la prima volta
    // (protetta dal controllo _renderedIdx in _tryRenderCurrentStep, come
    // per onLeave). Introdotta per il bug del passo "Il pannello si apre"
    // — vedi commento sul relativo passo in DIRECTOR_STEPS/TEACHER_STEPS.
    if (typeof def.onEnter === 'function') {
      try { def.onEnter(); } catch (e) {}
    }

    const list = _stepList();
    const idx = _state.idx;
    const isLast = idx === list.length - 1;
    const pct = Math.round(((idx + 1) / list.length) * 100);
    const stepLabel = (idx + 1) + ' di ' + list.length;
    const isAction = def.type === 'action';
    // Passi 'info' con revealTarget:true ottengono comunque il buco reale
    // (target visibile/interagibile) ma NON il pulsante Avanti nascosto né
    // il listener di avanzamento-su-click: l'avanzamento resta legato
    // esclusivamente al pulsante "Avanti" del tooltip (v2.1.2).
    const isInteractive = isAction || def.revealTarget === true;

    const veil = document.createElement('div');
    veil.className = 'onb-overlay';
    document.body.appendChild(veil);
    _domNodes.push(veil);

    // v8.15.7: inoltro manuale dello scroll — vedi commento su
    // _findScrollableAncestor per il perché è necessario.
    const scrollHost = _findScrollableAncestor(targets[0]);
    const _forwardWheel = (e) => { scrollHost.scrollTop += e.deltaY; e.preventDefault(); };
    let _touchY = null;
    const _forwardTouchStart = (e) => { _touchY = e.touches[0] ? e.touches[0].clientY : null; };
    const _forwardTouchMove = (e) => {
      if (_touchY === null || !e.touches[0]) return;
      const y = e.touches[0].clientY;
      scrollHost.scrollTop += (_touchY - y);
      _touchY = y;
      e.preventDefault();
    };
    veil.addEventListener('wheel', _forwardWheel, { passive: false });
    veil.addEventListener('touchstart', _forwardTouchStart, { passive: true });
    veil.addEventListener('touchmove', _forwardTouchMove, { passive: false });

    const rings = targets.map(() => {
      const r = document.createElement('div');
      r.className = 'onb-ring' + (isAction ? ' onb-ring-pulse' : '');
      document.body.appendChild(r);
      _domNodes.push(r);
      return r;
    });

    // v2.5.1 — blockClicks: uno "scudo" trasparente per target, posizionato
    // esattamente sul buco del velo (vedi _position()). Sta sopra il target
    // reale (z-index) e intercetta il click prima che lo raggiunga, senza
    // coprirlo visivamente (background trasparente: il buco resta visibile
    // come con un revealTarget normale). Il target resta quindi visibile
    // ma non azionabile per davvero — l'unico avanzamento resta "Avanti".
    const blockClicks = def.blockClicks === true;
    const shields = blockClicks ? targets.map(() => {
      const s = document.createElement('div');
      s.style.cssText = 'position:fixed;z-index:9865;background:transparent;cursor:not-allowed;';
      s.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
      document.body.appendChild(s);
      _domNodes.push(s);
      return s;
    }) : [];

    const tooltip = document.createElement('div');
    tooltip.className = 'onb-tooltip';
    tooltip.setAttribute('role', 'dialog');
    tooltip.setAttribute('aria-modal', 'true');
    const nextBtnHtml = isAction ? '' :
      `<button type="button" class="onb-next">${isLast ? 'Fatto' : 'Avanti'} <i class="ti ti-arrow-right"></i></button>`;
    tooltip.innerHTML = `
      <div class="onb-progress"><div class="onb-progress-fill" style="width:${pct}%"></div></div>
      <div class="onb-step-label">${_escHtml(stepLabel)}</div>
      <div class="onb-title">${_escHtml(def.title || '')}</div>
      <div class="onb-body">${_escHtml(def.body || '')}</div>
      <div class="onb-actions">
        <button type="button" class="onb-skip">Salta il tour</button>
        ${nextBtnHtml}
      </div>`;
    document.body.appendChild(tooltip);
    _domNodes.push(tooltip);

    function _position() {
      const rects = targets.map(t => t.getBoundingClientRect());
      const union = _unionRect(rects);
      const pad = 8;

      rects.forEach((r, i) => {
        const ring = rings[i];
        ring.style.top    = (r.top - pad) + 'px';
        ring.style.left   = (r.left - pad) + 'px';
        ring.style.width  = (r.width + pad * 2) + 'px';
        ring.style.height = (r.height + pad * 2) + 'px';
        if (blockClicks) {
          const s = shields[i];
          s.style.top    = ring.style.top;
          s.style.left   = ring.style.left;
          s.style.width  = ring.style.width;
          s.style.height = ring.style.height;
        }
      });

      // 'action' (sempre) e 'info' con revealTarget:true → buco reale nel
      // velo (target visibile e fisicamente interagibile). 'info' senza
      // revealTarget → nessun buco, il velo copre anche il target (resta
      // solo visivamente cerchiato dall'anello sopra).
      veil.style.clipPath = isInteractive ? _buildClipPath(rects, pad) : '';

      const ttRect = tooltip.getBoundingClientRect();
      const ttW = ttRect.width || 290, ttH = ttRect.height || 170;
      const spaceBelow = window.innerHeight - union.bottom;
      let top, arrowCls;
      if (spaceBelow > ttH + 28 || union.top < ttH + 28) {
        top = union.bottom + 18; arrowCls = 'onb-arrow-top';
      } else {
        top = union.top - ttH - 18; arrowCls = 'onb-arrow-bottom';
      }
      // Clamp verticale finale, sempre applicato: se il target è più alto
      // del viewport (es. .dd-teacher-list con molti docenti registrati),
      // union.bottom può superare window.innerHeight e mandare il tooltip
      // fuori schermo, irraggiungibile — tour bloccato. Il tooltip resta
      // sempre entro i bordi visibili, qualunque sia l'altezza del target
      // (v2.1.3, bug segnalato: "step 6, tour fuori schermo, impossibile
      // continuare").
      top = Math.max(12, Math.min(top, window.innerHeight - ttH - 12));
      tooltip.classList.remove('onb-arrow-top', 'onb-arrow-bottom');
      tooltip.classList.add(arrowCls);

      let left = union.left + union.width / 2 - ttW / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - ttW - 12));
      tooltip.style.top  = top + 'px';
      tooltip.style.left = left + 'px';
    }

    _position();
    requestAnimationFrame(_position); // ricalcola con le dimensioni reali del tooltip
    // v8.15.6 — bug segnalato: "scelta aula, non funziona lo scroll" (sia
    // Direttore che Docente, unico step con selettore che può matchare
    // MOLTE card contemporaneamente — tutte le aule). _position()
    // ricalcola i rect di ogni target e ricostruisce l'intero clip-path:
    // agganciato direttamente all'evento scroll grezzo, su una lista
    // lunga di aule questo può scattare decine di volte al secondo
    // durante uno scroll fluido/inerziale, causando scatti pesanti che
    // sui dispositivi più lenti si percepiscono come scroll bloccato.
    // Throttling a un ricalcolo per frame (invariato tutto il resto).
    let _rafPending = false;
    const _throttledPosition = () => {
      if (_rafPending) return;
      _rafPending = true;
      requestAnimationFrame(() => { _rafPending = false; _position(); });
    };
    _reposition = _throttledPosition;
    window.addEventListener('resize', _reposition);
    window.addEventListener('scroll', _reposition, true);

    try { targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    setTimeout(_position, 320); // ricalcola dopo l'eventuale scroll-into-view

    // Nessun handler per Escape né per click fuori dal tooltip: l'unica
    // uscita anticipata dal tour è il pulsante "Salta il tour" qui sotto.
    tooltip.querySelector('.onb-skip').addEventListener('click', () => _markDone());

    const nextBtn = tooltip.querySelector('.onb-next');
    if (nextBtn) nextBtn.addEventListener('click', () => _advance());

    if (isAction) {
      // Delegazione in CAPTURE phase su document: garantisce che il nostro
      // avanzamento di stato avvenga PRIMA di qualunque onclick nativo
      // dell'app collegato allo stesso elemento (l'ordine dei listener
      // sullo stesso nodo segue l'ordine di registrazione, e l'onclick
      // inline dell'app è sempre registrato molto prima di questo — la
      // capture-phase su un antenato bypassa il problema alla radice).
      _actionCaptureHandler = (e) => {
        const hit = targets.some(t => t === e.target || t.contains(e.target));
        if (hit) _advance();
      };
      document.addEventListener('click', _actionCaptureHandler, true);
    }

    const focusTarget = nextBtn || tooltip.querySelector('.onb-skip');
    setTimeout(() => focusTarget && focusTarget.focus(), 60);
  }

  /* ================================================
     API PUBBLICA — ogni show*Step()/recheck() è idempotente:
     se il passo corrente non riguarda questa schermata, o è già
     mostrato, non fa nulla. Sicuro richiamarle da qualunque punto
     di navigazione, anche più volte.
  ================================================ */
  function showDashboardStep()     { _tryRenderCurrentStep(); }
  function showWizardStep()        { _tryRenderCurrentStep(); }
  function showTeacherMgmtStep()   { _tryRenderCurrentStep(); }
  function showTeacherCreateStep() { _tryRenderCurrentStep(); }
  function showTeacherListStep()   { _tryRenderCurrentStep(); }
  function showCoursesSelectStep() { _tryRenderCurrentStep(); }
  function showHomeModuleStep()    { _tryRenderCurrentStep(); }
  function showHomeCategoryStep()  { _tryRenderCurrentStep(); }
  function showDidatticaStep()     { _tryRenderCurrentStep(); } // v2.3.0
  function showFlipCardLevelStep()   { _tryRenderCurrentStep(); } // v2.4.0
  function showFlipCardExitStep()    { _tryRenderCurrentStep(); } // v2.4.0
  function showFlipCardConfirmStep() { _tryRenderCurrentStep(); } // v2.4.0

  // v2.4.1: query di sola lettura sullo stato del tour — non
  // renderizza nulla, serve a chi chiama (es. js/flip-card.js) per
  // decidere un comportamento condizionale (es. forzare la conferma
  // d'uscita solo mentre il tour è esattamente su questo passo).
  function isCurrentStep(screenName) {
    if (_state.done) return false;
    const list = _stepList();
    const def = list[_state.idx];
    return !!def && def.screen === screenName;
  }

  // v2.5.2 — nuovo, richiesto da js/flip-card.js (file isolato): sapere se
  // QUESTO utente ha ancora il tour da fare (non l'ha già completato né
  // saltato in una sessione precedente o in questa), senza dover leggere
  // _state direttamente né duplicare la logica di isCurrentStep(). true
  // dall'init() fino al completamento/skip incluso — stesso significato
  // di "non ancora _state.done" usato internamente in tutto il file.
  function isActive() { return !_state.done; }

  function recheck()               { _tryRenderCurrentStep(); }

  return {
    init,
    showDashboardStep, showWizardStep, showTeacherMgmtStep,
    showTeacherCreateStep, showTeacherListStep,
    showCoursesSelectStep, showHomeModuleStep, showHomeCategoryStep,
    showDidatticaStep,
    showFlipCardLevelStep, showFlipCardExitStep, showFlipCardConfirmStep,
    isCurrentStep, isActive,
    recheck, skip, reset,
  };
})();
window.OnboardingTour = OnboardingTour;
