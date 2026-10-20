# Registro modifiche — v8.50.0 «Disegni di sfondo Dattilografia»

Base: v8.49.0 (commit locale `be0b501`, quello dello zip precedente). Questo file **non fa parte della repo**.
Lo zip contiene **solo i file toccati in questo giro** (3); tutto il resto resta quello della v8.49.0.
Nessuna modifica a `app.bundle.min.js` (lo ricostruisce la GitHub Action al push) né a CSS o a `app.js`.

## 0. In breve

- Le 7 card modulo di Dattilografia hanno ora il disegno di sfondo (`cardArt`), nello stesso formato delle altre Aree: solo il motivo, `currentColor` (quindi teal d'area, in scuro e in chiaro), `viewBox` 300×180, etichetta monospace in basso.
- Composizione fissa per tutti: **motivo secondario piccolo in alto a sinistra** (sopra icona e titolo), **motivo principale a destra**.
- Verificato a schermo con il CSS reale della repo e la vera `_buildGenericModCard` (vedi sez. 5). Non verificato nell'app vera (sez. 6).

## 1. File modificati (3, interi nello zip)

| File | Che cosa |
|---|---|
| `js/areas-config.js` | +7 blocchi `cardArt` (uno per modulo di Dattilografia) + nota v8.50.0 in testa (la riga «Nessun cardArt (da fare a parte)» della v8.49.0 marcata «SUPERATO in parte») |
| `index.html` · `package.json` | versione 8.49.0 → 8.50.0 (6 posizioni: 5 in index.html, 1 in package.json) |

Controllo: i dati di tutte le Aree, `cardArt` escluso, sono **identici** al commit base; i `cardArt` aggiunti sono esattamente 7 e nessun `cardArt` esistente è cambiato (60 moduli totali, 53 con disegno).

## 2. Soggetti dei disegni

| Modulo | Secondario (sinistra) | Principale (destra) | Etichetta |
|---|---|---|---|
| 1 La storia della tastiera | monitor moderno | macchina per scrivere, filo tratteggiato dal monitor | `TYPEWRITER` |
| 2 La Tastiera | scorciatoia Ctrl + C | tastiera con blocco alfanumerico e tastierino evidenziati | `LAYOUT` |
| 3 Tipi di tastiera | membrana (tasto, cupola, strati) | switch meccanico in sezione con molla | `SWITCH` |
| 4 Il corpo e la postazione | orologio (pause) e mouse | figura seduta con angoli a 90°, sedia, scrivania, schermo | `90°` |
| 5 Scrivere senza guardare | occhio barrato | riga base ASDF JKL; con F e J in rilievo e dita sopra | `ASDF JKL;` |
| 6 Allenamento | cronometro | barre in crescita con linea di tendenza | `WPM` |
| 7 Estensioni | tastierino numerico | smartphone con tastiera a schermo, microfono con onde e righe dettate | `NUM · MIC` |

## 3. Come sono costruiti (per chi li dovrà ritoccare)

- Gli attributi comuni stanno su un `<g>` esterno (`fill="none" stroke="currentColor" font-family="monospace" text-anchor="middle"`): i singoli elementi riportano solo ciò che cambia.
- Zone di lavoro nel `viewBox`: secondario x 46–124, y 42–90; principale x 150–290, y 40–135; il badge d'area occupa circa x 224–292, y 26–39.
- Rispettate le regole del formato letto in `_buildGenericModCard`: nessun `id`, solo `currentColor`/`none`, nessun doppio trattino nei commenti SVG, nessun backtick né `${` (sono dentro un template literal).
- **Estensioni** è l'ultima card di una griglia da 7: la regola CSS `#mod-area-catalog-grid > .mod-card:last-child:nth-child(odd)` la rende a tutta larghezza e `slice` ne mostra solo la fascia y≈54–126. Il disegno è quindi tutto dentro y 58–122 (altrimenti il tastierino e lo smartphone venivano tagliati: successo nella prima stesura).

## 4. Dubbi e assunzioni (da confermare)

1. **Peso**: i miei disegni sono più ricchi delle altre Aree (media 3,1 KB per modulo contro ~1,2–1,6 KB; massimo 4,8 KB contro 2,8). `areas-config.js` passa da 149 a 172 KB (+14%); compresso con gzip il guadagno è piccolo (+3,1 KB: 25,0 → 28,1 KB). I più pesanti sono tastiera, riga base e tastierino, che hanno molti tasti. Se preferisci disegni più sobri, si possono ridurre i tasti (dico quali) senza cambiare il soggetto.
2. **Soggetti scelti da me**: non avevi indicato cosa disegnare; i soggetti sono la mia lettura dei titoli e dei tag. Se qualcuno non ti convince (per esempio l'occhio barrato del modulo 5 o l'orologio del 4), lo cambio da solo.
3. **Segni a sinistra**: in alcune card il testo lungo (descrizione) passa sopra la parte bassa del disegno a destra (es. «scegliere» sulla base dello switch, «misurando i progressi» sulle prime barre). Il testo resta leggibile, ed è lo stesso comportamento di altre Aree (Reti: il lucchetto del Wi-Fi sotto la descrizione).
4. Restano da confermare i punti non ancora commentati: colore teal d'area, icone dei moduli, testo della descrizione d'area, nomi/chiavi dei moduli 6 e 7 (v8.48.0 e v8.49.0).

## 5. Verifiche eseguite

`node --check js/areas-config.js` ok · `package.json` JSON valido · ogni `cardArt` letto come XML (`xml.etree`, avvolto in un `<svg>`): **7/7 ben formati**, 0 `id`, solo `currentColor`/`none` · ancore di inserimento tutte uniche (lo script si ferma altrimenti) · confronto dati con il commit base: Aree uguali, 7 `cardArt` aggiunti, 0 cambiati · versione: 0 residui di «8.49.0» in `index.html`/`package.json`.

**Resa a schermo** (Chromium con Playwright, CSS reale della repo e vera `_buildGenericModCard`, schermate guardate una per una): tema scuro e chiaro, larghezza 980 px (2 colonne) e 390 px, hover con i tag visibili. Nella card a tutta larghezza (Estensioni) tutto il disegno è dentro la fascia visibile.

**Confronto con l'Area esistente Reti e Internet** (stessa prova, stesse larghezze) per capire cosa è già così in tutta l'app. Questi tre comportamenti ci sono già nelle altre Aree e **non li ho toccati**:
- **Tema chiaro**: la fascia color fango in basso sbiadisce la metà inferiore del disegno e l'etichetta in basso (`TYPEWRITER`, `SWITCH`…): resta visibile la parte alta.
- **Smartphone stretto (390 px)**: nel banco di prova la griglia resta a 2 colonne, le card sono strette e alte e `slice` mostra solo il centro del disegno; i motivi laterali e le etichette vengono tagliati. La card a tutta larghezza (342 px) mostra invece il disegno quasi intero (Estensioni).
- **Card a tutta larghezza** (ultima di una griglia dispari): zoom ×3 con ritaglio verticale, come per il Wi-Fi o il Troubleshooting di Reti. Se vuoi, si può proporre una modifica CSS (es. `preserveAspectRatio` diverso solo per quella card): non l'ho fatta perché tocca tutte le Aree.

**Nota di layout (non mia, ma visibile)**: i tag sono invisibili (`opacity:0`) ma occupano spazio; se i chip vanno su due righe titolo e descrizione salgono di ~20 px. A 980 px succede in Dattilografia nei moduli 1, 4, 5 e 6; in altre Aree con tag lunghi può succedere lo stesso (non l'ho misurato). Perciò i titoli non sono sempre alla stessa altezza tra card vicine.

**Non eseguito**: Playwright e2e (`cd e2e && npm test`, girano solo in locale da te) e la verifica nell'app vera (login, aula Dattilografia, wizard «Nuova aula»). Le schermate sopra sono del banco di prova, non dell'app.

## 6. Fuori scope, segnalato e non toccato

- `aree_e_moduli.md`, `Flip_Card.md`, `Lo_Sapevi.md` descrivono ancora Dattilografia a 5 moduli (da aggiornare a 7).
- `COLORI_PIXELPROF.md` non include Dattilografia né il teal.
- `css/minigiochi/memory.css` e `mockup/` contengono ancora i vecchi colori neon.
- `package-lock.json` è fermo a 8.40.0.
- `tools/content-check.js` va in crash (`slugFor`, riga 64: `dataPaths.quiz` è un array in alcune Aree), già sul commit base.

## 7. Checklist di test

1. Dopo il push, controllare che la GitHub Action abbia ricostruito `app.bundle.min.js` (la versione `?v=8.50.0` in `index.html` deve caricare il bundle nuovo).
2. `cd e2e && npm test` → 5/5.
3. Aula Dattilografia, scuro: le 7 card hanno il disegno teal; secondario a sinistra sopra icona/titolo, principale a destra, badge «DATTILOGRAFIA» non coperto.
4. Passare il mouse su ogni card: i tag compaiono, il titolo diventa teal, il disegno non salta.
5. Tema chiaro: stesso controllo; è normale che la metà bassa sia sfumata (come Reti).
6. Estensioni (ultima, a tutta larghezza): numpad, smartphone e microfono interi, nessuno tagliato in alto o in basso.
7. Finestra stretta/smartphone: nessun errore, disegno ritagliato come nelle altre Aree.
8. Wizard «Nuova aula» → Dattilografia → step Moduli: le card mostrano gli stessi disegni.
9. Un'Area esistente (es. Reti o DigComp) è identica a prima.
