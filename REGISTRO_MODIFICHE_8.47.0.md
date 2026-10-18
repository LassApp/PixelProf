# Registro modifiche — v8.47.0 «Completa la frase», nuova grafica

Base: `c714ebb` (v8.46.0). Questo file **non fa parte della repo**: sta nello zip accanto ai file interi.
Numeri di riga: «prima» = `HEAD`, «dopo» = file consegnato.

## 0. Cosa è cambiato, in breve

- **Grafica**: scheda unica (intestazione con n/N, pallini e serie · frase con lo spazio incavato · quattro tessere · piede con Verifica · pannello d'esito), stesso linguaggio di Abbina (8.45.0) e Vero o Falso (8.46.0). Tema scuro e chiaro, `.nar` dalla larghezza reale della scheda.
- **Logica**: punteggio, serie, `fillAnswerLog`, statistiche, salvataggi, audio e tracciamento sono **identici** (verificato: sez. 6). Cambia solo ciò che è elencato in sez. 1.
- **Non toccati**: `feedback.css`, `quiz.css`, `.q-card`, `buildGameHeader` (la classe si aggiunge con `.replace('class="game-header"','class="game-header cf-bar"')`), `app.bundle.min.js` e la sua mappa.

## 1. Cambiamenti di comportamento (tutti dichiarati)

| # | Che cosa | Dove | Stato |
|---|---|---|---|
| E1a | **Verifica** parte disattivata (`disabled` nativo) a ogni frase e si attiva appena si sceglie **una** delle quattro parole; testo guida «Scegli una parola per verificare» collegato con `aria-describedby`. In più `checkFill()` esce se lo spazio è vuoto (difesa in profondità: il tasto non lo permette già). | `renderFill`, `cfPick`, `checkFill` | richiesto (eccezione E1) |
| E1b | **Niente digitazione nello spazio**: `#fi` resta la fonte letta da `checkFill`, ma è `readonly tabindex="-1" inputmode="none" autocomplete="off"` e invisibile; lo spazio visibile è uno `<span>` che lo rispecchia. Tab + Invio/Spazio sulle tessere funziona; una seconda tessera **sostituisce** la prima; riclic sulla stessa **non** deseleziona. | `renderFill`, `cfPick` | richiesto + approvato |
| C1 | **Correzione**: il vecchio `onclick="…value='${escAttr(w)}'"` metteva la parola dentro una stringa JS tra apici; con un apostrofo («diritto all'oblio») il gestore non era più JS valido. Ora `data-w` + `cfPick(this)` → `this.dataset.w`. | `renderFill`, `cfPick` | dichiarata e approvata |
| C2 | `cfPick` **ignora i clic a esito già mostrato** (`#fi` non cambia mentre si legge il risultato). | `cfPick` | dichiarata e approvata |
| P1 | **`busy`**: `checkFill()` ignora un secondo click mentre l'esito è in mostra (prima ogni click ripeteva punteggio e avanzamento). | `checkFill` | proposta logica approvata |
| P2 | **Attesa dopo una risposta sbagliata: 2,4 s** invece di 1 s (la giusta resta 1 s), per leggere la parola giusta. | `checkFill` | proposta logica approvata |
| P3 | La parola giusta nel pannello passa da `escHtml` (prima `${q.b}` grezzo nell'HTML). | `checkFill` | proposta logica approvata |
| P4 | **Contatore in barra «✓ k»**; n/N si sposta nell'intestazione della scheda. Il numero si aggiorna **subito** alla risposta giusta (prima solo al ridisegno della frase dopo). | `renderFill`, `checkFill` | proposta logica approvata — *questa lettura del punto (aggiornamento immediato) è mia: se intendevi solo lo spostamento di n/N, si toglie una riga* |
| X1 | **Guardia sul timer**: `if(fillState!==s) return;` — se la partita è stata chiusa/riavviata durante l'attesa il timer non fa nulla. Necessaria perché l'attesa più lunga (P2) allarga la finestra: senza, dopo «Esci» il vecchio timer lancia un `TypeError` (riprodotto sul build vecchio: `Cannot read properties of undefined (reading 'length')`) e dopo «Ricomincia» ridisegna la frase corrente della nuova partita. | `checkFill` | **mia aggiunta, da confermare** |
| X2 | Pallini di avanzamento: leggono le **ultime `s.idx` voci** di `fillAnswerLog` (non le prime), perché il registro non viene azzerato da «Ricomincia» (vedi sez. 7, punto 1). Solo lettura. | `renderFill` | mia scelta di sola presentazione |

## 2. `js/game-fill.js` — riga prima → riga dopo → motivo

| Riga prima | Riga dopo | Motivo |
|---|---|---|
| 2 `game-fill.js — PixelProf v4.0.9` | 2 `… v4.1.0` | versione del file |
| 10 (ultima riga della storia, prima di `*/`) | 11–28 nuova nota v4.1.0 | documenta rifacimento grafico e cambiamenti di sez. 1 |
| — | 31–35 `_CF_NAR_W=540`, `_CF_PIPS_MAX=20`, `_CF_HINT_MAX=10`, `_CF_NAR_PIPS_MAX=15`, `let _cfRO` | stesse soglie di Vero o Falso (pallini fino a 20, scheda stretta < 540px) |
| — | 38–43 `_CF_GUIDE_OFF/ON/RES`, `_CF_SIC`, `_CF_MARK`, `_CF_TAG` | testi della riga guida e pezzi di markup ripetuti (icone Tabler, niente emoji) |
| — | 48–62 `_cfFitBoard()` | mette `.nar` dalla larghezza **reale** della scheda con un solo `ResizeObserver` (come Abbina/VF); si stacca quando la scheda esce dal DOM |
| 55 `const hdr=buildGameHeader(\`<span class="game-counter-pill">${s.idx+1}/${s.qs.length} · ✓ ${s.score}</span>\`,…)` | 105–108 `buildGameHeader(\`…✓ ${s.score}…\`,…).replace('class="game-header"','class="game-header cf-bar"')` | P4; la barra prende `.cf-bar` senza toccare `buildGameHeader` |
| — | 112–126 `nQ`, `runLog`, `cfTrack`, `cfAlt`, `cfProg`, `cfStreakChip`, `cfScale` | pallini/barra (X2), chip «Serie ×k» da ×2, scalino del corpo dalla lunghezza della frase (`cf-s2` >100, `cf-s3` >140, `cf-s4` >180 caratteri), nessuna misura a runtime |
| 56 `cont.innerHTML=\`${hdr}<div class="q-card"><div class="fill-sent">…<input class="blank-in" id="fi" placeholder="..."/>…\`` (tessere con `onclick="document.getElementById('fi').value='${escAttr(w)}'"`, `<div class="fill-bank-lbl">`, `<div style="margin-top:10px"><button class="btn btn-neon" onclick="checkFill()">Verifica …`) | 127–148 tessere `<button type="button" class="chip cf-chip" data-w="${escAttr(w)}" aria-pressed onclick="cfPick(this)">` · `cont.innerHTML` con `.cf-board` (`.cf-hd`, `.cf-q` con `.cf-sent` + `.cf-slot#cf-slot` + `#fi.cf-fi`, `.cf-lbl`, `.word-bank.cf-bank`, `.cf-foot` con `.cf-guide` e `.btn.btn-neon.cf-verify[disabled][aria-describedby]`, `#ffb.cf-fb[aria-live]`) | scheda unica; E1a, E1b, C1. Restano `#fi`, `#ffb`, `.word-bank`, `.chip`, `.btn-neon`, testo «Verifica», `onclick="checkFill()"` (usati da logica e test) |
| — | 148 `_cfFitBoard();` | `.nar` prima del primo paint |
| — | 154–176 `cfPick(btn)` | E1a, E1b, C1, C2 |
| — | 180–205 `_cfShowResult(ok,q,picked,panelHtml)` | solo presentazione dell'esito: classi su scheda/tessere/spazio, parola giusta accanto alla sbagliata, riga guida, pannello |
| 59–60 `function checkFill(){ const s=fillState;const q=s.qs[s.idx];const val=sh('fi').value.trim();` | 207–216 stesse variabili + guardie `if(!s\|\|!s.qs\|\|s.busy) return;`, `if(!q\|\|!fiEl) return;`, `if(!val) return;`, `s.busy=true` | P1, E1a |
| 61–70 e 75–78 calcolo `ok`, audio, streak, `calcFillAnswerScore`, `fillTotalScore`, `fillAnswerLog.push`, `s.score++`, `_trackRightQ` / `_trackWrongQ` | 217–227 e 235–237 **invariati** (stesse chiamate, stesso ordine) | la logica non cambia |
| 71–74 `bonusLine` con `🔥 … &nbsp;` e `<div class="fb ok" style="margin-top:6px">✓ Corretto!${bonusLine}</div>` | 228–231 `bonusLine` con `<i class="ti ti-flame">`, pannello `.fb.ok > .cf-vd` con cerchio ✓, «Corretto», punti | niente emoji/caratteri-icona, niente stile inline |
| — | 232 aggiorna `.cf-score-n` nella barra (anche se è in topbar: `document.querySelector`) | P4 |
| 79 `<div class="fb ko" style="margin-top:6px">✗ Era: ${q.b}</div>` | 238 `.fb.ko > .cf-vd` con cerchio ✕, «Sbagliato», «Risposta giusta: **${escHtml(q.b)}**» | P3; mai solo colore |
| — | 240 `_cfShowResult(ok,q,picked,panel)` | presentazione |
| 81 `setTimeout(()=>{s.idx++;renderFill(sh('g-area'));},1000);` | 243 `setTimeout(()=>{ if(fillState!==s) return; s.idx++;s.busy=false;renderFill(sh('g-area')); },ok?1000:2400);` | P2, X1 |
| 12–52, 83–end | invariate (`startFill`, ramo di fine partita di `renderFill`, `showGameResult` …) | — |

## 3. `css/minigiochi/completa-frase.css` — riscritto (37 righe → 431)

| Riga prima | Dopo | Motivo |
|---|---|---|
| 1–9 intestazione v8.43.0 | 1–57 intestazione v8.47.0 (principi, contrasti misurati, compatibilità) | documentazione |
| 11 `.fill-sent{font-size:14px;line-height:2.4;margin-bottom:8px;color:#e2e8f0}` | `.cf-sent` 26px / 21px stretto, riga 36em, colore `var(--text-primary)`; scalini `.cf-s2/.cf-s3/.cf-s4` (23/20/18px) | la frase è l'eroe; **tolto `#e2e8f0`** (fuori palette) |
| 12–13 `.blank-in…` (input visibile) | `.cf-slot` (incavo in linea; `.on` neutro; `.cf-ok` pieno ✓; `.cf-ko` tratteggiato ✕ + parola barrata; `.cf-fix`) e `.cf-fi` (input invisibile ma nel DOM) | E1b; mai solo colore |
| 14 `.word-bank{display:flex;flex-wrap:wrap;gap:6px}` | `.cf-bank` griglia 2 colonne (1 in `.nar`) | tessere grandi, bersagli ≥ 56px |
| 15–26 `.chip` pillola 12px con filo che compare al passaggio del mouse | `.cf-bank .chip` tessera 19px, cerchio-segno, stati `.sel` (neutro) / `.cf-ok` / `.cf-ko`, etichetta d'esito `.cf-tag` a cavallo del bordo | il colore arriva solo con l'esito; hover neutro |
| 28–31 `.fill-bank-lbl` | `.cf-lbl` (mono 11px, `--text-muted`) | stesso colore |
| 35–36 override tema chiaro di `.chip` e `.fill-sent` | **tolti**: i colori derivano da `--text-primary`, che il tema già cambia | meno regole per-tema |
| — | variabili `--cf-*` (scuro + chiaro), scheda, intestazione, pallini/barra, serie, piede, Verifica (disabilitato con lucchetto, non solo opacità), `.nar`, `prefers-reduced-motion` — in `@layer completafrase` | stesso schema di `vero-falso.css` |
| — | `@layer theme`: pannello `#g-area .cf-board .fb` (sostituisce `feedback.css` solo dentro la scheda) e barra `#g-area .cf-bar` (solo in pagina, < 1000px; sopra, la topbar dà l'aspetto) | `theme` è dopo `feedback`, `#g-area` vince su `html[data-theme="light"] …` |

Colori letterali nel file: solo palette (`#4A6B52`, `#AB5649`, `#8FB09F`, `#D49A8C`, `#3E5A47`, `#8A4038`, `#E4C48C`, `#7A5A38`, `#FBF6EC`) e ombre/incavo neutri (`rgba(0,0,0,.26/.35/.38)`, `rgba(23,35,45,.10/.14)`, `rgba(251,246,236,.92)`).

## 4. Test e2e della repo

| File · riga prima | Dopo | Motivo |
|---|---|---|
| `e2e/tests/support/game-actions.js` · 149 `await page.waitForTimeout(1100); // checkFill() attende 1s…` | 149–151 `waitForTimeout(2600)` + commento | P2: dopo una sbagliata si attendono 2,4 s; la prima tessera può essere giusta o sbagliata. Il test intero dura ~3 s in più |
| `e2e/tests/smoke.spec.js` · 131 `expect(page.locator('.fill-sent')).toBeVisible()` | `'.cf-sent'` | `.fill-sent` non esiste più (classe della vecchia frase) |

## 5. Versione e documento colori

| File | Prima | Dopo |
|---|---|---|
| `package.json:3` | `"version": "8.46.0"` | `8.47.0` |
| `index.html:6, 122, 695, 969` | `v8.46.0` (titolo, login, selezione aula, logo) | `v8.47.0` |
| `index.html:1978` | `js/app.bundle.min.js?v=8.46.0` | `?v=8.47.0` |
| `COLORI_PIXELPROF.md` | titolo e intro a v8.46.0; sez. 2.4 «Dove»; sez. 2.5; nota conteggi; App. A riga `#E2E8F0` (7 CSS) | titolo/intro v8.47.0; `completa-frase.css` aggiunto in 2.4; nuovo punto «Completa la frase» in 2.5; nota conteggi estesa; `#E2E8F0` → 6 CSS (tolto da `completa-frase.css`) |

## 6. Che cosa ho verificato, e come

Tutto in Chromium headless, offline (librerie esterne e font instradati su copie locali, Supabase mockato con il mock della repo).

- **Sintassi**: `node --check` su `game-fill.js`, `smoke.spec.js`, `game-actions.js`: ok. CSS con `tinycss2`: 0 errori (145 regole, 8 at-rule, 567 dichiarazioni); graffe 153/153.
- **E1 e comportamento, nel browser: 139 controlli, 0 falliti.** Partita vera da 10 frasi con 2 errori: Verifica disattivata a ogni frase; `#fi` readonly/`tabindex -1`/`inputmode none`; digitare con `#fi` a fuoco non cambia nulla; Tab non raggiunge `#fi` e salta Verifica disabilitata; Invio e Spazio sulle tessere scelgono; la seconda tessera sostituisce; riclic non deseleziona; triplo click su Verifica = un solo esito; a esito dato le tessere non cambiano `#fi`; attese misurate 1008–1033 ms (giusta) e 2409 ms (sbagliata); contatore «✓ k» aggiornato.
- **Tutte le 4848 frasi**: 0 anomalie (un solo spazio, 4 tessere = banca, la risposta giusta presente una sola volta, scelta → `#fi`/spazio/tessera con la parola esatta, Verifica attiva dopo la scelta). Apostrofi, virgolette, `&`, `<b>` nelle parole: corretti; HTML nella risposta giusta: non interpretato. `checkFill` reale su 404 frasi (una ogni 12), ciascuna con risposta giusta e con risposta sbagliata (808 chiamate): esito, registro +1 e classi corretti.
- **Regressione vecchio (HEAD ricostruito) ↔ nuovo, stesse frasi e stesse risposte, 3 scenari** (10 frasi con 2 errori; 12 giuste di fila, che tocca i bonus ×3/×5/×10; 6 sbagliate): per ogni risposta punteggio, serie, serie migliore, totale e voce di registro; testo della schermata risultato; `db.lb2` e `db.stats`: **identici**, 17 controlli, 0 falliti. (Frasi senza apostrofo, perché il vecchio gestore non le sa scegliere; nel vecchio il valore è scritto direttamente in `#fi`.)
- **Difetti del vecchio, riprodotti sul build vecchio**: apostrofo (`pageerror: Unexpected identifier 'oblio'`, `#fi` resta vuoto); doppio click su Verifica (punteggio +2, registro +2, salta una frase); timer dopo «Esci» (`TypeError`).
- **Layout, 90 controlli, 0 falliti**: 1280×800, 1280×720, 800×600, 390×844 · scuro e chiaro · frase media, la più lunga (236 caratteri), parola da 40 caratteri, apostrofi · vuoto/scelta/giusta/sbagliata (media: tutti e 4; le altre: vuoto e sbagliata). Scheda sempre dentro la finestra; barra in topbar da 1000px, in pagina sotto; `.nar` solo a 390px; `.nar` segue la larghezza reale 1280→390→1280→800 senza ridisegnare (ResizeObserver). Ho guardato le schermate una per una.
- **Contrasti, 94 misure sul DOM dell'app (47 per tema)**, tutti gli stati: testi ≥ 4,89:1, componenti ≥ 3,18:1, nessuna misura sotto soglia (valori in intestazione del CSS).
- **E2E della repo**: `smoke.spec.js` (copia fedele; unica modifica, in `fixtures.js` della copia: instradamento offline delle librerie esterne) **passa in 23,2 s** (limite 60 s) sul build finale.
- **Uscita e riavvio durante l'attesa**: dopo «Esci» confermato il timer non ridisegna e non dà errori; dopo «Ricomincia» la nuova partita resta alla frase 1 e la parola scelta subito non viene cancellata; «No, continua» fa proseguire alla frase 2 e si può rispondere ancora (busy azzerato).

## 7. Segnalazioni e cose NON verificate

1. **Difetto già presente, NON corretto (fuori perimetro): «Ricomincia» non azzera serie e punteggio.** `startFill` non azzera `fillStreak`, `fillBestStreak`, `fillTotalScore`, `fillAnswerLog` (lo fa `startTrueFalse`; qui li azzera solo `resetSessionState`, usato da «Esci»). Riprodotto, identico vecchio e nuovo: dopo la prima partita con 850 pt e serie 3, la seconda parte con totale 850 e serie 3. Effetti: la classifica della seconda partita include i punti della prima; nella nuova grafica il chip «Serie ×3» compare già alla prima frase (nel vecchio la serie non si vedeva). Correzione proposta, 1 riga in `startFill` prima di `fillState={…}`: `fillStreak=0;fillBestStreak=0;fillTotalScore=0;fillAnswerLog=[];`. Dimmi se la vuoi nella 8.47.1.
2. **Bundle**: `js/app.bundle.min.js` e la mappa **non** sono nello zip né nel commit (si rigenerano con `npm run build`; ci pensa anche l'Action). Per lanciare l'e2e in locale, prima `npm run build`.
3. **Frase da 733px su LIM 720px**: con la parola da 40 caratteri e l'esito sbagliato il fondo della scheda sta a 733px su 720 (13px sotto la linea) a 1280×720; le altre frasi peggiori stanno a 676–687px.
4. **Topbar a 390px**: la pagina ha scorrimento orizzontale (499px su 390) per la topbar dell'app; **identico nel build vecchio**, non toccato.
5. **Non provati**: modalità squadre con questo gioco (percorso `_showTeamTurnSplash` invariato ma non eseguito); Firefox e Safari (solo Chromium); screen reader (gli attributi ARIA ci sono, non li ho ascoltati); tocco su dispositivo reale; la LIM vera. I font e le icone dei test sono copie locali.
6. **`auth.spec.js` e `areas.spec.js`** non li ho potuti far girare offline (non usano la fixture con le librerie instradate): falliscono allo stesso modo col build vecchio, quindi è l'ambiente, non il cambio. Lanciali tu.
7. **Attesa dopo l'errore (2,4 s) e pausa**: se si apre il dialogo di uscita durante l'attesa e si preme «No, continua», il passaggio alla frase successiva avviene comunque (come prima, solo con la finestra più lunga).
