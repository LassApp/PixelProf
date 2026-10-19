# Registro modifiche — v8.48.0 «Area Dattilografia» + favicon nei colori correnti

Base: `5332ce9` (v8.47.0). Questo file **non fa parte della repo**: sta nello zip accanto ai file interi.
Nessuna modifica a `app.bundle.min.js` né alla sua mappa (li ricostruisce la GitHub Action al push).

## 1. File modificati (8, tutti consegnati per intero)

| File | Che cosa |
|---|---|
| `js/areas-config.js` | nota di release v8.48.0 in testa; nuova Area `dattilografia` in coda ad `AREAS` (8ª Area, 7 moduli) |
| `css/areas.css` | colore d'area in 7 punti (sezione/scheda docente/wizard, catalogo moduli, light, chip filtro dark e light, `:not()` delle aule orfane) |
| `js/game-constants.js` | `AREA_COLOR_HEX['dattilografia']` |
| `public/icons/favicon.svg` · `favicon-48.png` · `favicon.ico` | favicon nei colori correnti (16/32/48 nell'ICO, stessa struttura di prima) |
| `index.html` · `package.json` | versione 8.47.0 → 8.48.0 (6 posizioni: 5 in `index.html` + `package.json`) |

## 2. Area Dattilografia

| # | Chiave | Titolo | Icona |
|---|---|---|---|
| 1 | `la-storia-della-tastiera` | La storia della tastiera | 📜 |
| 2 | `la-tastiera` | La Tastiera | ⌨️ |
| 3 | `tipi-di-tastiera` | Tipi di tastiera | 🖥️ |
| 4 | `il-corpo-e-la-postazione` | Il corpo e la postazione | 🪑 |
| 5 | `scrivere-senza-guardare` | Scrivere senza guardare | 🙈 |
| 6 | `allenamento` | Allenamento | 🏋️ |
| 7 | `estensioni` | Estensioni | 🧩 |

Area: icona `⌨️` / Tabler `ti-keyboard`, badge `DATTILOGRAFIA`. Tutti i moduli `contentReady:false` → «In preparazione» nel wizard, «In arrivo» nei selettori modulo. Nessun `dataPaths`, `desc`, `tags`, `cardArt`.

**Colore d'area** (valore nuovo, nessun "vecchio"):

| Tema | Terna | Hex | Contrasto |
|---|---|---|---|
| Scuro | `62,118,126` | `#3E767E` | 3,12:1 su navy (le altre aree: 3,05–3,99) |
| Chiaro | `57,110,118` | — | 4,71:1 su crema (le altre aree: 4,55–4,76) |

## 3. Favicon — vecchio → nuovo

| Elemento | Prima | Dopo |
|---|---|---|
| Sfondo | `#080c18` | `#17232D` (navy) |
| Esagono esterno, tratto | `#00ffc8` .85 | `#F2E8D5` (crema) .85 |
| Esagono interno, riempimento | `rgba(0,255,200,.10)` | `#6E7A50` (oliva) .45 |
| Esagono interno, tratto | `#00ffc8` .55 | `#F2E8D5` .55 |
| «P» (gambo + occhiello) | `#00ffc8` | `#F2E8D5` |
| Pallino alto a destra | `#7c6aff` .9 | `#8B9968` (oliva chiaro) .9 |
| Pallino in basso a sinistra | `#00ffc8` .65 | `#F2E8D5` .65 |

Regola applicata: tema scuro = navy primario, oliva secondario, dettagli crema. Geometria invariata.

## 4. Dubbi e assunzioni (da confermare)

1. **7 moduli, non 5.** `data/Minigiochi/aree_e_moduli.md`, `Flip_Card.md` e `Lo_Sapevi.md` descrivono Dattilografia con 5 moduli e dicono «JSON realizzati», ma in `data/` della repo non esiste nessuna cartella `Dattilografia`. Ho seguito la tua lista di 7 e ho messo tutti `contentReady:false`. Se i JSON dei moduli 1–5 esistono solo in locale, vanno committati.
2. **Chiavi dei moduli 6 e 7** (`allenamento`, `estensioni`): non compaiono in nessun documento, sono lo slug del titolo. Le chiavi 1–5 sono quelle già previste in `aree_e_moduli.md`.
3. **Colore d'area teal petrolio**: scelta mia (hue 188°, il vuoto più ampio tra sage 155° e slate 210°). Si cambia in 7 terne di `areas.css` + 1 hex.
4. **Icone dei moduli** e **testo della descrizione d'area**: miei. La descrizione riprende quella di `aree_e_moduli.md` aggiungendo «e come ci si allena».
5. **Niente `desc`/`tags`/`cardArt`**: la nota in `_buildGenericModCard` (app.js) chiede l'elenco ufficiale degli argomenti, non dedurlo. Le card rendono icona + titolo.

## 5. Quando arrivano i file di gioco (non fatto ora)

Per ogni modulo: `dataPaths` in `areas-config.js` + flip `contentReady:true` + voci nei 5 `moduleMap` di `game-engine-state.js`, in `FLIPCARD_MODULE_MAP` (`flip-card.js`) e `LOSAPEVI_MODULE_MAP` (`lo-sapevi.js`). Il CSS delle flip card che hai annunciato non è stato toccato.

## 6. Fuori scope, segnalato e non toccato

- `aree_e_moduli.md`, `Flip_Card.md`, `Lo_Sapevi.md`: ancora a 5 moduli.
- `COLORI_PIXELPROF.md`: non include l'area Dattilografia né il teal.
- `css/minigiochi/memory.css` (riga 79, SVG inline) e i file in `mockup/` contengono ancora `#00ffc8`/`#7c6aff`/`#080c18`. `mockup/` non è produzione; `memory.css` sì, ma Memory è disattivato.
- `package-lock.json` è fermo a 8.40.0 (preesistente).
- Non esistono `theme-color`, `apple-touch-icon` né manifest: nessun altro punto da aggiornare per la favicon.

## 7. Verifiche eseguite

`node --check` su `areas-config.js` e `game-constants.js` ok · `areas-config.js` caricato in Node: 8 Aree, 60 moduli, nessuna chiave duplicata, 7 moduli Dattilografia tutti attribuiti all'area giusta, `getReadyModules('dattilografia')` = 0 · `tinycss2` su `areas.css`: 0 errori · graffe 118/118 · `favicon.svg` XML valido · ICO con 16/32/48 · `git diff --stat`: solo gli 8 file sopra.
**Non eseguiti** (non girano in sandbox): Playwright e verifica visiva nell'app.

## 8. Checklist di test

1. Dopo il push, controllare che la GitHub Action abbia ricostruito `app.bundle.min.js` (senza, l'area non compare).
2. `cd e2e && npm test` → 5/5.
3. Nuova aula → step Area: compare «Dattilografia» con icona tastiera e chip «In preparazione», in scuro e in chiaro.
4. Step Moduli: 7 moduli «In arrivo» non selezionabili, «Avanti» abilitato.
5. Dopo aver creato un'aula Dattilografia: sezione area, chip del filtro e blocco in scheda docente col teal, leggibili in entrambi i temi.
6. Versione 8.48.0 visibile in login e sotto il logo.
7. Favicon: ricarica forzata (Ctrl+F5) e, se resta la vecchia, chiudere e riaprire la scheda (i browser la tengono in cache); guardarla su tab chiaro e scuro; aprire anche `/public/icons/favicon.ico` direttamente.
