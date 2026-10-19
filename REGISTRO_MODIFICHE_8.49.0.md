# Registro modifiche — v8.49.0 «Dattilografia operativa»

Base: v8.48.0 (commit locale `122110c`, quello dello zip precedente). Questo file **non fa parte della repo**.
Lo zip contiene **solo i file toccati in questo giro**; gli altri (css/areas.css, game-constants.js, favicon) restano quelli della v8.48.0.
Nessuna modifica a `app.bundle.min.js` né alla sua mappa (li ricostruisce la GitHub Action al push).

## 0. In breve

- Hai scritto «non mettere l'area digcomp "in arrivo"»: ho letto **Dattilografia** (è l'area di cui parlavamo). Se intendevi davvero DigComp, dimmelo: DigComp è già giocabile da v8.41.0.
- I 7 moduli passano da `contentReady:false` a `true`. I file di gioco non ci sono ancora: una partita mostra la schermata di errore del gioco (sez. 4), senza errori JS non gestiti.
- Aggiunti `desc` e `tags` (sintesi del tuo programma) e tutti i percorsi, così quando committi i file l'area funziona senza altre modifiche al codice.

## 1. File modificati (6, interi nello zip)

| File | Che cosa |
|---|---|
| `js/areas-config.js` | 7 moduli: `contentReady:true`, `desc`, `tags`, `dataPaths`; nota v8.49.0 in testa (la nota v8.48.0 marcata «superato in parte») |
| `js/game-engine-state.js` | +35 righe: 7 moduli × 5 loader (Quiz, Speed Quiz, Abbina, Completa la frase, Vero o Falso); nota v8.49.0 |
| `js/flip-card.js` | +7 voci in `FLIPCARD_MODULE_MAP` (Facile + Medio) |
| `js/lo-sapevi.js` | +7 voci in `LOSAPEVI_MODULE_MAP` |
| `index.html` · `package.json` | versione 8.48.0 → 8.49.0 (6 posizioni) |

## 2. Sintesi del programma → `desc` e `tags`

Ogni modulo ha una frase breve (`desc`, mostrata sotto il titolo) e 3–4 chip (`tags`, visibili al passaggio del mouse). Dove gli argomenti erano più di 4 li ho accorpati; nessun argomento è stato scartato.

| Modulo | `desc` | `tags` → argomenti coperti |
|---|---|---|
| 1 La storia della tastiera | Dalla nascita della dattilografia alla tastiera del computer | **Dattilografia e metodo** (1, 2) · **Gare e dattilografe** (3) · **Una tastiera per tutti** (4) · **Dalla macchina al computer** (5) |
| 2 La Tastiera | Layout, tasti principali e scorciatoie: come è fatta la tastiera | **Layout e aree** (2) · **Tasti principali** (3) · **Gruppi, cursore e tasti rari** (4) · **Scorciatoie** (5) · *l'argomento 1, «La tastiera e il computer», è introduttivo e sta nella `desc`* |
| 3 Tipi di tastiera | Tastiere a membrana e meccaniche: pro, contro e come scegliere | **Membrana** (1) · **Meccanica e switch** (2, 3) · **Pro e contro** (4) · **Scegliere e attrezzare** (5) |
| 4 Il corpo e la postazione | Postura, postazione, pause e normativa sui videoterminali | **Postura** (1) · **Postazione, schermo e luce** (2, 4) · **Mani, polsi e mouse** (3) · **Pause e videoterminali** (5, 6) |
| 5 Scrivere senza guardare | Scrivere a tastiera cieca: dita, riga base, ritmo e livelli | **Tastiera cieca** (1) · **Dita e riga base** (2) · **Pollici, mani e ritmo** (3) · **Righe, maiuscole e simboli** (4, 5) |
| 6 Allenamento | Esercizi progressivi dalla riga base ai testi veri, misurando i progressi | **Riga base, indici e mignolo** (1, 2) · **Maiuscole** (3) · **Riga superiore e inferiore** (4) · **Testi veri e progressi** (5, 6) |
| 7 Estensioni | Oltre la tastiera standard: tastierino numerico, smartphone e dettatura | **Numeri e tastierino** (1) · **Smartphone e dettatura** (2) · **Quando la tastiera non basta** (3) |

Le `desc` dei moduli 4 e 6 contengono parole che non sono nel tuo elenco alla lettera («normativa», «misurando i progressi»): sono la resa di «I videoterminali e la legge» e «Misurare i progressi».

## 3. Dove vanno i file (percorsi già collegati)

Per il modulo N con chiave `<k>`:

| Gioco | Percorso |
|---|---|
| Quiz | `data/Minigiochi/Dattilografia/moduloN/quiz_<k>.json` |
| Speed Quiz | `data/Minigiochi/Dattilografia/moduloN/speedquiz_<k>.json` |
| Abbina | `data/Minigiochi/Dattilografia/moduloN/abbina_<k>.json` |
| Completa la frase | `data/Minigiochi/Dattilografia/moduloN/completa_la_frase_<k>.json` |
| Vero o Falso | `data/Minigiochi/Dattilografia/moduloN/vero_o_falso_<k>.json` |
| Flip Card | `data/Didattica/Flip_Card/Dattilografia/ModuloN/Flip_Card_Facile_Modulo_N.csv` e `…_Medio_Modulo_N.csv` |
| Lo sapevi? | `data/Didattica/Lo_Sapevi/Dattilografia/ModuloN/lo_sapevi_<k>.json` |

| N | `<k>` |
|---|---|
| 1 | `la-storia-della-tastiera` |
| 2 | `la-tastiera` |
| 3 | `tipi-di-tastiera` |
| 4 | `il-corpo-e-la-postazione` |
| 5 | `scrivere-senza-guardare` |
| 6 | `allenamento` |
| 7 | `estensioni` |

Memory non è collegato (come per tutte le Aree non-ECDL, resta in pausa app-wide).

## 4. Comportamento finché i file mancano

Letto nel codice (la schermata a video non l'ho vista, vedi sez. 7). Il loader solleva sempre `HTTP 404 — <URL del file>`, ma ogni gioco lo mostra in modo diverso:

| Gioco | Cosa vede il giocatore | URL del file mancante |
|---|---|---|
| Quiz | «Errore caricamento quiz» + messaggio `[Quiz] HTTP 404 — …/modulo1/quiz_la-storia-della-tastiera.json` + «Verifica che i file siano presenti in `data/quiz/`…» + «Torna alla home» | a video |
| Speed Quiz | «Speed Quiz non disponibile» + «Impossibile caricare lo speed quiz…» | solo console |
| Abbina | «Abbina non disponibile» + «Impossibile caricare il gioco Abbina. Riprova o cambia modulo.» | solo console |
| Completa la frase | messaggio «Impossibile caricare il gioco Completa la frase. Riprova o cambia modulo.» | solo console |
| Vero o Falso | messaggio «Impossibile caricare Vero o Falso. Riprova o cambia modulo.» | solo console |
| Flip Card | «Flip Card non disponibile» + «Impossibile caricare il mazzo. Riprova o cambia modulo.» | solo console |
| Lo sapevi? | «Errore caricamento» + «Verifica che i file siano presenti in `data/Didattica/Lo_Sapevi/` e ricarica la pagina.» | solo console |

- Il percorso `data/quiz/` mostrato dal Quiz è un suggerimento generico preesistente (non è il percorso di Dattilografia): non l'ho toccato.
- «Progressi» (stats.js) usa `Promise.allSettled` ed è già pensato per moduli con file mancanti: per Dattilografia mostra «N risposte» invece di «n/tot · %».
- Il contatore delle «domande difficili» nella scelta attività resta vuoto (fallimento silenzioso già previsto dal codice).
- Nel wizard «Nuova aula» l'area ora mostra «7/7 moduli pronti» (non più «In preparazione») e almeno un modulo va selezionato. È la conseguenza voluta di «renderlo giocabile».

## 5. Dubbi e assunzioni (da confermare)

1. **Moduli 6 e 7**: i nomi file e le cartelle `modulo6`/`modulo7` seguono lo stesso schema dei moduli 1–5 (che vengono da `aree_e_moduli.md`). Se i tuoi file hanno altri nomi, o le chiavi `allenamento`/`estensioni` non ti vanno, vanno cambiati in 3 punti per modulo (areas-config, 5 mappe del motore, Flip Card/Lo sapevi).
2. **`cardArt` non fatto**: le card dell'area hanno icona + titolo + descrizione + chip, ma senza il disegno di sfondo che hanno le altre aree. Lo preparo se me lo chiedi.
3. **Interpretazione di «digcomp»** (vedi sez. 0).
4. Restano da confermare i punti della v8.48.0 non ancora commentati da te: colore teal, icone dei moduli, testo della descrizione d'area.

## 6. Fuori scope, segnalato e non toccato

- `aree_e_moduli.md`, `Flip_Card.md`, `Lo_Sapevi.md` descrivono ancora Dattilografia a 5 moduli e `Lo_Sapevi.md`/`Flip_Card.md` la danno «da creare»: da aggiornare a 7 moduli con i nomi di sez. 3.
- `tools/content-check.js` va in crash (`slugFor`, riga 64: `dataPaths.quiz` è un array per CE/OE/WP/SS/PP) già sul commit base, quindi non dipende da questo giro. Quando lo sistemerai, segnalerà come mancanti i 35 file di gioco di Dattilografia finché non li committi: è il suo scopo.
- `COLORI_PIXELPROF.md` non include ancora l'area Dattilografia.

## 7. Verifiche eseguite

`node --check` su `areas-config.js`, `game-engine-state.js`, `flip-card.js`, `lo-sapevi.js`, `game-constants.js` ok · ogni ancora di modifica compariva esattamente una volta (lo script si fermava altrimenti) · `dataPaths` ↔ 5 mappe del motore: **35/35 identici** · `FLIPCARD_MODULE_MAP` e `LOSAPEVI_MODULE_MAP`: 7/7 chiavi · `getReadyModules('dattilografia')` = 7 · nessuna chiave duplicata tra le Aree (60 moduli prima del giro, 60 dopo: invariato) · **simulazione con il loader reale** (`_createLoader` + `_resolveJsonPath` estratti dal file, `fetch` → 404, URL base GitHub Pages): `[Quiz] HTTP 404 — …/modulo1/quiz_la-storia-della-tastiera.json`, idem Vero o Falso e modulo 7; una chiave non registrata continua a dare «Modulo non registrato».
· `stats.js`, `dashboard.js`, `app.js` (wizard e filtro moduli) letti: nessuna dipendenza dall'esistenza dei file, tranne i punti elencati in sez. 4.
**Non eseguiti** (non girano in sandbox): Playwright e la verifica visiva nell'app. Le schermate di errore di sez. 4 le ho ricavate leggendo il codice, non le ho viste a schermo.

## 8. Checklist di test

1. Dopo il push, controllare che la GitHub Action abbia ricostruito `app.bundle.min.js`.
2. `cd e2e && npm test` → 5/5.
3. Nuova aula → step Area: «Dattilografia» con chip «7/7 moduli pronti»; step Moduli: 7 moduli selezionabili, nessuno «In arrivo».
4. Entrare in un'aula Dattilografia: le 7 card modulo compaiono, con descrizione sotto il titolo e i chip al passaggio del mouse, in scuro e in chiaro.
5. Scegliere un modulo → una modalità → Quiz → «Inizia sessione»: compare «Errore caricamento quiz» con `HTTP 404` e il percorso del file; ripetere con Speed Quiz, Abbina, Completa la frase, Vero o Falso (messaggio generico, percorso in console) come da tabella di sez. 4.
6. Didattica → Flip Card e Lo sapevi?: «Flip Card non disponibile» e «Errore caricamento» (nessun errore JS non gestito in console, solo l'errore di rete registrato).
7. Aprire «Progressi» in un'aula Dattilografia: 7 moduli con «0 risposte», nessun «NaN» né errori.
8. Committare **un** file di prova (es. il quiz del modulo 1) e verificare che quel gioco parta; gli altri restano in errore.
9. Un'aula di un'altra area (es. DigComp) continua a funzionare come prima.
