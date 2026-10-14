# Colori di PixelProf — riferimento reale (v8.45.0)

Documento ricavato **dal codice** del repository alla v8.44.0 (aggiornato a mano alla v8.45.0 solo dove cambia Abbina, vedi sez. 2.3), non dalla documentazione: `css/tokens.css`, `pixelprof.css`,
`css/*.css`, `css/minigiochi/*.css`, `js/*.js` (bundle escluso) e `index.html`. Ogni valore e ogni "dove" sono stati
verificati sui selettori reali; dove il codice è incoerente o contiene colori fuori palette l'ho scritto (sezione 3).

**Come leggere i conteggi.** "N CSS" = occorrenze letterali del colore nei CSS, come `#hex` oppure come `rgb()/rgba()` della
stessa terna (es. `rgba(122,90,56,.4)` conta come `#7A5A38`); "N JS/HTML" = occorrenze nei file `js/` e in `index.html`
(qui sono soprattutto illustrazioni SVG inline e colori di stato). **Non** sono contati gli usi tramite variabile
(`var(--navy)`, `var(--accent)`, `rgba(var(--accent-rgb),…)`) né le terne `--*-rgb:R,G,B`, elencate a parte (sez. 2.1 e App. B):
quindi per navy/crema/oliva/fango il numero reale di punti d'uso è molto più alto di quello indicato.

---

## 1. Palette e regole di coerenza

### 1.1 Palette base (4 ancore, `css/tokens.css`)

| Token | Valore | Ruolo | Usi letterali |
|---|---|---|---|
| `--navy` | `#17232D` | sfondo pagina in scuro; "ink" (testo/icone) su superfici beige e in chiaro; `--navy-rgb: 23,35,45` per ombre/velature | 100 CSS |
| `--crema` | `#F2E8D5` | sfondo pagina in chiaro; testo in scuro; topbar e pannello profilo in scuro; testo su fango/oliva in entrambi i temi | 241 CSS |
| `--oliva` | `#6E7A50` | `--purple` in scuro; tinta delle superfici in scuro (`--surface-1/2`, bordi: `rgba(110,122,80,…)`); velo in basso delle card poster in scuro | 23 CSS · 27 JS/HTML |
| `--fango` | `#7A5A38` | `--accent` in chiaro; topbar in chiaro; card di contenuto in chiaro; pulsante "Rivedi il tour" | 121 CSS · 43 JS/HTML |

### 1.2 Colori derivati (dove compaiono davvero)

| Famiglia | Valori nel codice | Dove si usa | Usi letterali |
|---|---|---|---|
| Oliva scuro | `#5C6644` | card di contenuto in scuro (`.dm-card`, `.course-card`), card pausa e risultati in scuro, inizio gradiente di form "Nuova aula" e pannello profilo in chiaro; è anche `--purple` in chiaro (`tokens.css`) | 18 CSS |
|  | `#55603F` | hero "Scegli un'attività" in chiaro, form "Nuova aula" in chiaro, card info del pannello profilo e pulsante "Crea" in scuro, "Prof" del logo in topbar scuro | 16 CSS |
|  | `#515B3C` | fine gradiente del pannello profilo in chiaro | 1 CSS |
|  | `#4A5436` | hover del pulsante "Crea" (form Nuova aula) in scuro | 2 CSS |
| Crema chiaro / scuro | `#FBF6EC` | "Prof" del logo in topbar chiara, hover dei pulsanti primari (risultati, "Crea" in chiaro), sfondo KPI dashboard in chiaro, testo dei badge opzione nel quiz | 17 CSS |
|  | `#EADFC6` | fine gradiente dell'hero in scuro e **titolo delle card in hover** (`.dm-card:hover h3`) | 2 CSS |
|  | `#E9DEC5` | fine gradiente del pannello profilo in scuro | 1 CSS |
|  | `#E9DEC7` | fine gradiente della topbar in scuro (scritto `rgba(233,222,199,.96)`) | 1 CSS |
| Sage | `#4E7464` | area ECDL, modulo SS (gradiente barra card), colore giocatore/squadra di default, "Ottima" nella forza password | 17 CSS · 29 JS/HTML |
|  | `#4A6B52` | **successo**: risposta corretta, feedback ok, Vero (`tf-true`), Abbina "matched", Memory "matched", modulo SS, recupero in Panoramica classe | 60 CSS · 38 JS/HTML |
|  | `#8FB09F` | testo di successo su fondo scuro (feedback, Abbina), pallino/pulsante "attivo" docenti; è anche la tinta del livello "Facile" (`143,176,159`) | 9 CSS |
|  | `#3E5A47` | testo di successo su fondo chiaro (feedback, Abbina, opzione corretta del quiz) | 3 CSS |
| Slate | `#54708C` | area Cybersecurity, modulo WP, `--blue`, combo ×2 di Abbina, timer in corsa (Memory), anello profilo "uomo"/predefinito | 66 CSS · 51 JS/HTML |
|  | `#7D99B3` | testo slate su fondo scuro: badge WP, icona genere "uomo", titolo delle card Dashboard Direttore in hover | 7 CSS · 2 JS/HTML |
| Terracotta | `#AB5649` | **errore/pericolo**: azioni distruttive (`.pchip-del-btn`, `.cd-item.danger`, conferma `danger` dei dialog, reset classifica), `.login-error`, dialog `.pp-dialog`, area Malware, modulo IT, `tf-false`, errori di form (JS), `err-pill` | 155 CSS · 78 JS/HTML |
|  | `#8A4038` | testo errore su fondo chiaro (timer rosso, `fb.ko`, `tf-wrong`), pulsante Esci dal profilo in scuro | 39 CSS |
|  | `#C47869` | testo terracotta su fondo scuro (badge IT, "Esci", audio disattivato) | 16 CSS · 3 JS/HTML |
|  | `#D49A8C` | testo errore su fondo scuro nei minigiochi (timer rosso, `fb.ko`, `match-fb-ko`), stato "disattivo" docenti | 11 CSS |
|  | `#C17A70` | testo del ruolo "donna" nel profilo (`profile-panel.js`) e icona genere docenti | 1 CSS · 2 JS/HTML |
| Miele | `#B8935A` | **oro/primo posto**: classifica rank-1, score-pill, badge "👑 Dir", combo MAX, medaglie/achievements, anello ruolo direttore | 54 CSS · 38 JS/HTML |
|  | `#D4B483` | testo miele chiaro: `.mod-badge.ce`, filtro Vero/Falso in classifica, schermate Lo Sapevi | 13 CSS · 9 JS/HTML |
|  | `#E4C48C` | Speed Quiz in scuro: pill timer e punteggio; podio 1° posto; "win" di Abbina | 6 CSS |
| Rame | `#9C6B3E` | modulo PP, classifica rank-3, card poster PP | 18 CSS · 23 JS/HTML |
|  | `#C9976A` | accenti/testo della card poster PP | 6 CSS |
| Viola spento | `#746996` | area Reti e Internet — solo come mirror JS (`AREA_COLOR_HEX`); in CSS vive come terna `116,105,150` (sez. 2.1) e come arrivo di `softColor()` per i vecchi viola neon | 0 CSS · 2 JS/HTML |
| Dusty-rose | `#9D5875` | area Intelligenza Artificiale, modulo OC, card poster OC | 14 CSS · 24 JS/HTML |
|  | `#B07C96` | illustrazioni SVG del modulo OC, badge OC | 3 CSS · 8 JS/HTML |
| Oliva chiaro | `#8B9968` | testo oliva su fondo scuro: `.mod-badge.oe`, combo ×3 e `moves-pill` (scuro), icone degli stati vuoti/errore (Flip Card, Abbina) | 18 CSS · 24 JS/HTML |
|  | `#A3B07F` | Speed Quiz: icona e etichetta dell'attività | 2 CSS |
| Fango scuro | `#6B4E30` | fine gradiente delle card di contenuto/risultati/pausa in chiaro, hover pulsante tour, hover card cat/act in chiaro; testo su chiaro (score-pill, "mai giocato") | 13 CSS |

### 1.3 Regole di coerenza (verificate sui selettori)

Regola generale: **tema chiaro = pagina crema, superfici di "chrome" (topbar, card) fango/oliva con testo crema;
tema scuro = pagina navy, chrome beige (topbar, pannello) e card oliva scuro.** Le due modalità sono speculari.

| Elemento | Tema chiaro | Tema scuro | Dove |
|---|---|---|---|
| **Pagina** (`body`, `--surface-0`) | `#F2E8D5` (crema) | `#17232D` (navy) | `tokens.css` |
| Testo principale / secondario / tenue | navy · `rgba(23,35,45,.65)` · `.5` | crema · `rgba(242,232,213,.58)` · `.37` | `tokens.css` |
| Accento (`--accent`) | `#7A5A38` (fango) | `#F2E8D5` (crema) | `tokens.css` |
| Secondo colore marchio (`--purple`) | `#5C6644` (oliva scurito) | `#6E7A50` (oliva) | `tokens.css` |
| **Topbar in-app** (`.topbar`) | gradiente fango `rgba(122,90,56,.98→.96)` → `rgba(110,80,48,.94)`; testo crema | gradiente beige `rgba(242,232,213,.98→.97)` → `rgba(233,222,199,.96)`; testo navy | `pixelprof.css` (chiaro) · `topbar-profile.css` (scuro) |
| Topbar schermate aule/Direttore (`.cs-topbar`) | `rgba(122,90,56,.97)` | `rgba(242,232,213,.98)` | idem |
| **Logo** — "Pixel" / "Prof" | `#F2E8D5` / `#FBF6EC` (colore pieno) | `#17232D` / `#55603F` | idem |
| Riga versione (`.logo-sub`, `.cs-logo-sub`) e "cambia aula" (`.logo-hint`) | `#F2E8D5` | navy `.8` (`rgba(23,35,45,.8)`) | idem |
| Logo nella schermata di login (`.login-title`) | "Pixel" `--accent` = fango · "Prof" `--purple` = `#5C6644` | "Pixel" crema · "Prof" oliva `#6E7A50` | `tokens.css` |
| **Pannello profilo** — fondo | gradiente oliva `#5C6644` → `#515B3C` | gradiente beige `#F2E8D5` → `#E9DEC5` | `topbar-profile.css` |
| Pannello profilo — card info (ultimo accesso/aula) | beige `#F2E8D5` (testo navy) | oliva `#55603F` (testo crema) | idem |
| Pannello profilo — pulsante "Rivedi il tour" | fango `#7A5A38` (hover `#6B4E30`) | fango `#7A5A38` (hover `#6B4E30`) | idem |
| Pannello profilo — "Esci" | fondo `rgba(171,86,73,.18)`, testo `#FFE3DC` | bordo/testo `#8A4038`, hover pieno `#8A4038` | idem |
| **Blocco "in evidenza"** — hero "Scegli un'attività" (`.act-hero`) | gradiente oliva `#55603F` → `#5C6644` → `#55603F`, testo crema | gradiente beige `#F2E8D5` → `#EADFC6` → `#F2E8D5`, testo navy | `act-select.css` |
| Blocco "in evidenza" — form "Nuova aula" (`.cs-add-form`) | gradiente `#5C6644` → `#55603F`; pulsante Crea `#F2E8D5` | pieno `#F2E8D5`; pulsante Crea `#55603F` (hover `#4A5436`) | `pixelprof.css` |
| **Card di contenuto** — modalità e attività (`.dm-card`) | gradiente fango `#7A5A38` → `#6B4E30` → `#7A5A38` | gradiente oliva scuro `#5C6644` → `#55603F` → `#5C6644` | `flip-card.css` |
| Card di contenuto — aula (`.course-card`) | `#7A5A38` | `#5C6644` | `pixelprof.css` |
| Card poster moduli (`.mod-card`) | fondo per-modulo (scuro) + velo in basso fango `rgba(122,90,56,.4→.97)`, titolo crema | stesso fondo + velo oliva `rgba(110,122,80,.4→.97)` | `mod-cards.css` |
| Testo delle card — titolo a riposo / sottotesto | `.dm-card`: `#F2E8D5` / `rgba(242,232,213,.94)` · `.mod-card`: `#F2E8D5` / `rgba(242,232,213,.8)` | `.dm-card`: idem · `.mod-card`: `#F2E8D5` / `rgba(242,232,213,.75)` | `flip-card.css`, `mod-cards.css` |
| **Titolo card in hover** | `#EADFC6` | `#EADFC6` | `flip-card.css` (`.dm-card:hover h3`) |
| Card risultati / riepilogo partita | `#7A5A38` → `#6B4E30` → `#7A5A38` | `#5C6644` → `#55603F` → `#5C6644` | `minigiochi/risultati.css` (`--res-bg`) |
| Card di pausa (Speed Quiz, Abbina, Memory) | stessi gradienti fango | stessi gradienti oliva | `minigiochi/pausa.css` (`--pz-bg`) |
| Alone del ▶ nella card di pausa | crema `rgba(242,232,213,.34)`, 7 px | crema `rgba(242,232,213,.18)`, 5 px | `minigiochi/pausa.css` (`ppPausePulse`) |
| Alone del pulsante pausa in topbar (invariato, `playPulse`, `rgba(var(--accent-rgb),.18)`) | crema `242,232,213` (accent dell'isola scura: topbar fango) | fango `122,90,56` (accent dell'isola chiara: topbar beige) | `minigiochi/pausa.css` + `tokens.css` |

Le card di contenuto e i risultati usano sempre testo crema: crema su fango = 5,16:1, su oliva scuro ≈ 5,0–5,5:1 (rapporti riportati nei commenti dei file).

### 1.4 Token di tema (`css/tokens.css`)

| Token | Scuro (default) | Chiaro (`data-theme="light"`) |
|---|---|---|
| `--surface-0` | `var(--navy)` | `var(--crema)` |
| `--surface-1` / `--surface-2` / `--surface-hover` | `rgba(110,122,80,.08 / .14 / .18)` | `rgba(23,35,45,.045 / .08 / .1)` |
| `--border-subtle` / `--border-mid` | `rgba(110,122,80,.15 / .25)` | `rgba(23,35,45,.1 / .16)` |
| `--text-primary` | crema | navy |
| `--text-muted` / `--text-dim` | `rgba(242,232,213,.58 / .37)` | `rgba(23,35,45,.65 / .5)` |
| `--accent` (+ `-rgb`, `-dim`, `-glow`, `-border`) | crema (`242,232,213`; .12 / .25 / .35) | fango (`122,90,56`; .12 / .25 / .35) |
| `--purple` (+ `-rgb`) | oliva `#6E7A50` (`110,122,80`) | `#5C6644` (`92,102,68`) |
| `--purple-dim` / `--purple-border` | `rgba(110,122,80,.12 / .35)` | invariati |
| `--shadow-card` | `0 4px 24px rgba(0,0,0,.35), 0 1px 0 rgba(242,232,213,.05) inset` | `0 2px 14px rgba(23,35,45,.08), 0 1px 0 rgba(255,255,255,.6) inset` |

**Isole di superficie** (stesso file): dentro `.topbar`, `.cs-topbar` e `.profile-panel` i token vengono ridichiarati per il colore *della superficie*, non del tema:

| Isola | `--accent` | `--purple` | testo (`--text-primary` / `-muted` / `-dim`) |
|---|---|---|---|
| Chiaro → topbar/profilo **scuri** | crema `242,232,213` | `#FBF6EC` | crema · `.96` · `.94` |
| Scuro → topbar/profilo **chiari** | fango `122,90,56` | `#5C6644` | navy · `rgba(23,35,45,.8)` · `.72` |

---

## 2. Colori funzionali (non sono token di tema)

### 2.1 Aree (`css/areas.css`, mirror JS in `js/game-constants.js` → `AREA_COLOR_HEX`)

Terne `--area-rgb` (dark vivida; light più scura, valida solo per `.cs-area-section` e i chip filtro):

| Area | Terna scuro → hex | Terna chiaro → hex | JS (`AREA_COLOR_HEX`) |
|---|---|---|---|
| ECDL | `78,116,100` → `#4E7464` | `73,110,95` → `#496E5F` | `#4e7464` |
| Cyberbullismo e sicurezza online | `136,103,58` → `#88673A` | `129,98,55` → `#816237` | `#88673a` |
| Cybersecurity | `84,112,140` → `#54708C` | `80,107,134` → `#506B86` | `#54708c` |
| Reti e Internet | `116,105,150` → `#746996` | `107,96,138` → `#6B608A` | `#746996` |
| Malware e minacce | `171,86,73` → `#AB5649` | `157,79,67` → `#9D4F43` | `#ab5649` |
| Intelligenza artificiale | `157,88,117` → `#9D5875` | `150,84,112` → `#965470` | `#9d5875` |
| DigComp | `126,132,58` → `#7E843A` | `102,108,46` → `#666C2E` | `#7e843a` |
| Aula orfana/legacy (solo chiaro) | — | `16,24,42` → `#10182A` | fallback JS `#8a8fa3` |

Dove: icona/badge/linea della sezione area nelle aule (`.cs-area-section`), tessere area nella scheda docente (`.tdc-area-block`) e nel wizard Nuova aula (`.cw-area-btn`), chip filtro (`.cs-area-filter-chip`), catalogo moduli (`#mod-area-catalog`), card generiche dei moduli extra-ECDL (`.mod-card.generic-card`), eyebrow di modalità/attività.

### 2.2 Moduli

| Modulo | `MOD_COLOR_HEX` (`game-constants.js`) | Stats/Storico (`stats.js`) e Panoramica (`dashboard.js`) | Card poster (`mod-cards.css`) |
|---|---|---|---|
| CE | `#7A5A38` | **`#B8935A`** (vedi sez. 3, punto 1) | fondo `#332B20→#2c2208`, barra `#7A5A38→#B8935A`, badge `#B8935A` |
| OE | `#6E7A50` | `#6E7A50` | barra `--purple→#8B9968`, badge `#8B9968` |
| WP | `#54708C` | `#54708C` | barra `#54708C`, badge `#7D99B3` |
| SS | `#4A6B52` | `#4A6B52` | barra `#4E7464→#4A6B52`, badge `#44c76a` (vedi sez. 3, punto 3) |
| PP | `#9C6B3E` | `#9C6B3E` | barra `#9C6B3E→#C9976A`, badge `#C9976A` |
| IT | `#AB5649` | — | barra `#AB5649→#C47869`, badge `#C47869` |
| OC | `#9D5875` | — | barra `#9D5875→#B07C96`, badge `#B07C96` |
| altri moduli | colore dell'area (`modColor()` → `AREA_COLOR_HEX`), altrimenti `#8a8fa3` | | |

Usati per: badge in Classifica/Domande difficili, barre Progressi e Panoramica classe, chip Storico.

### 2.3 Giocatori, squadre, coppie

- Giocatori/squadre (`COLORS`, coriandoli): `#4E7464`, `#6E7A50`, `#AB5649`, `#7A5A38`, `#54708C`. Default DB (`ensurePlayer`): `#4E7464`; (`ensureTeam`): `#6E7A50`.
- `softColor()` riporta i vecchi colori neon salvati sulla famiglia più vicina: rosso/rosa → `#AB5649`, arancio → `#9C6B3E`, giallo → `#B8935A`, verde/teal → `#4E7464`, blu → `#54708C`, viola → `#746996`, magenta → `#9D5875`.
- Abbina (`PAIR_COLORS`, `game-match.js`, **v8.45.0**): `#4E7464`, `#7A5A38`, `#54708C`, `#9D5875`, `#B8935A`, `#6E7A50`, `#4A6B52` (7 tinte; in un round ci sono al massimo 5 coppie e le prime 5 sono di famiglie diverse). Tolta la terracotta `#AB5649`: è il colore dell'errore e una coppia giusta non deve sembrare sbagliata. La tinta (`--pair-color`, scritta dal JS sulle voci) **non colora mai il testo**: tinge bordo, fondo (12% selezionata, 17% abbinata), badge, porta, filo ondulato e pallino di avanzamento, nella versione "inchiostro" `--pc-ink` = tinta mescolata al colore del testo del tema (24% in scuro → crema, 16% in chiaro → navy), che tiene ≥ 3,4:1 sulla scheda (`abbina.css`). Superfici e linee della scheda derivano da `--text-primary` a bassa opacità (3–17%); in chiaro la scheda è `#FBF6EC`, come le altre superfici crema chiaro.
- **Conteggi non ricalcolati dopo la v8.45.0**: le tabelle della sez. 1.2 e dell'Appendice A sono quelle della v8.44.0. `abbina.css` è stato riscritto (meno `#4A6B52` e `#AB5649` letterali, più `#FBF6EC` nei 3 punti dove la scheda è crema chiaro): i numeri di quei tre colori sono quindi sfasati di qualche unità.
- Schermate di errore dei giochi (`game-engine-state.js`): Quiz `#AB5649`, Speed Quiz `#7A5A38`, Abbina `#8B9968`, Memory `#AB5649`, Completa `#54708C`, Vero/Falso `#7A5A38`.

### 2.4 Stati

| Stato | Sfondo / bordo | Testo su scuro | Testo su chiaro | Dove |
|---|---|---|---|---|
| Successo | `#4A6B52` | `#8FB09F` | `#3E5A47` | `feedback.css`, `quiz.css` (opzione corretta), `abbina.css`, `vero-falso.css`, `app.js` (messaggi form) |
| Errore | `#AB5649` | `#D49A8C` | `#8A4038` | idem + `pixelprof.css` (`.pp-dialog`, elimina), validazione form (`app.js`) |
| Attenzione / punteggio | `#B8935A` | `#E4C48C` | `#6B4E30` | `quiz.css` (score/timer-pill), `abbina.css` (combo MAX), `memory.css` |
| Informazione | `#54708C` | `#7D99B3` (solo dove usato come testo) | `#54708C` (nessun override chiaro) | combo ×2, timer in corsa |
| Forza password (`app.js`) | 25% `#AB5649` · 50% `#7A5A38` · 70% `#54708C` · 88% `#6E7A50` · 100% `#4E7464` | | | form cambio password |

### 2.5 Minigiochi (dettaglio)

- **Speed Quiz** (`quiz.css`): pill punteggio e timer: testo `#E4C48C` su velo miele `rgba(184,147,90,.1/.14)` in scuro; in chiaro testo `#6B4E30` (timer su velo fango `rgba(122,90,56,.1)`, punteggio sul velo miele); timer rosso `#D49A8C` scuro / `#8A4038` chiaro; categoria domanda (scuro) = `color-mix(var(--qz-mod) 55%, #F2E8D5)`; icona/etichetta attività `#A3B07F` (scuro) / `#55603F` (chiaro).
- **Pill in topbar (≥1000 px)** (`topbar-profile.css` 436–447, via `--pp-rgb`): timer in corsa slate `84,112,140`; timer in scadenza e errori terracotta `171,86,73` (con `comboPulse`); punteggio miele `184,147,90`; mosse oliva `110,122,80`; combo ×1 navy `23,35,45`, ×2 slate, ×3 oliva, ×4 terracotta, MAX miele.
- **Risultati** (`risultati.css`): podio 1° miele `#B8935A` con bordo `#E4C48C`; riquadri statistiche `st-slate` `129,160,190`, `st-miele` `214,176,112`, `st-terra` `208,120,104`.
- **Memory** (`memory.css`): carta abbinata `#4A6B52`; carta girata e retro in viola/neon: vedi sez. 3, punti 2 e 7.
- **Vero o Falso** (`vero-falso.css`): Vero `#4A6B52` (testo chiaro `#0A8F5A`), Falso `#AB5649` (testo chiaro `#8A4038`).

### 2.6 Ruoli profilo (`js/profile-panel.js`)

| Ruolo | Anello | Testo | Sfondo |
|---|---|---|---|
| Direttore | `#B8935A` | `#B8935A` | `rgba(184,147,90,.12)` |
| Uomo | `#54708C` | `#7D99B3` | `rgba(84,112,140,.12)` |
| Donna | `#AB5649` | `#C17A70` | `rgba(171,86,73,.12)` |
| Predefinito | `#54708C` | `#54708C` | `rgba(84,112,140,.1)` |

### 2.7 Neutri

`#FFFFFF` (350 CSS · 34 JS/HTML) compare quasi solo come `rgba(255,255,255,x)` per bordi, velature e testo tenue sulle superfici scure dei dialog/overlay; `#000000` (90 CSS) solo per ombre `rgba(0,0,0,x)`.

---

## 3. Anomalie e colori fuori palette (da decidere, non modificati)

Elenco di ciò che ho trovato leggendo il codice. Nessuno è stato cambiato in questa versione.

1. **Colore del modulo CE incoerente.** `MOD_COLOR_HEX.CE` è fango `#7A5A38` (`game-constants.js`), mentre `stats.js` (`_HIST_MOD_COLOR`) e `dashboard.js` (`_CHD_MOD_COLOR`) usano miele `#B8935A`: lo stesso modulo appare di due colori in schermate diverse.
2. **Viola neon residui.** `rgba(106,79,214,.05)` (= `#6A4FD6`) nel gradiente di sfondo del tema chiaro (`pixelprof.css`, 3 occorrenze); `.mem-c.flip` di Memory usa `#6450DC` / testo `#C4BAFF` (`memory.css`); `#0A0E1E`/`#0E142C`/`#080C1C` come fondi carta Memory.
3. **Verdi/rosa saturi nelle card poster** (`mod-cards.css`): tag/badge SS `#44c76a` e `#5AD47A`, tag OC `#FFB4D7` / `#FFC2E0`, più i fondi per-modulo `#0a0618→#140928` (OE), `#060e1c→#0a1a30` (WP), `#1E2B1F→#091610` (SS), `#1c0414→#300a26` (OC): non fanno parte della palette.
4. **Verdi non di palette** in tema chiaro: `#0A8F5A` (Vero/corretta, `vero-falso.css`), `#12805A` (Memory matched), `#0A3D26` (opzione corretta quiz).
5. **Fondi "notturni" ereditati** (blu/viola quasi neri) in `pixelprof.css`: `#04060F`, `#0A0F1E`, `#0A1022`, `#10162A`, `#0C1224`, `#0D1224`, `#0C1020`, `#080A16`, `#060812` … usati per overlay, dialog, tooltip e skeleton; più le classi `.hero-quiz/-speed/-match/-memory/-fill/-truefalse` (gradienti nero-blu/viola, `pixelprof.css`): `game-constants.js` le assegna ancora (`heroClass`), ma lo sfondo reale dell'hero lo decide `act-select.css` (sez. 1.3), quindi quei gradienti non sono più visibili.
6. **Variabili legacy inutilizzate** in `:root` di `pixelprof.css`: `--blue` (`#54708C`), `--glow-ce: rgba(84,112,140,.4)` e `--glow-wp: rgba(78,116,100,.38)` — nessun `var(--blue)`/`var(--glow-*)` nel codice; per di più i nomi non corrispondono ai colori attuali dei moduli (CE fango/miele, WP slate). Candidate alla rimozione.
7. **Neon nascosti in un data-URI**: `%2300ffc8` (5 volte, ciano neon) e `%237c6aff` (1 volta, viola) dentro il background SVG di `.mem-c.hide::before` (`memory.css`). Nell'SVG il `#` è scritto `%23`, quindi non compaiono nelle scansioni per `#hex` e **non sono nell'Appendice A**.
8. **Due beige quasi uguali**: fine gradiente topbar scura `rgba(233,222,199)` (=`#E9DEC7`) e fine gradiente pannello scuro `#E9DEC5`.

---

## Appendice A — tutti i colori letterali (hex / rgb / rgba) con conteggio e file principali

Classificazione: **palette** = ancore; **derivato** = tinte nominate in sez. 1.2; **area** = colori d'area; **neutro**; **da verificare** = non riconducibili alle famiglie nominate in sez. 1.2: possono essere tinte volute (es. `#FFE3DC`, testo chiaro su terracotta) oppure residui del vecchio tema neon — la colonna "famiglia" è stimata automaticamente dalla tinta, quindi va letta come indicazione, non come giudizio.

| Colore | Classe | Famiglia | Usi | File principali |
|---|---|---|---|---|
| `#FFFFFF` | neutro | bianco (overlay rgba) | 350 CSS · 34 JS/HTML | `pixelprof.css` (152), `classhealth.css` (26), `topbar-profile.css` (25) |
| `#F2E8D5` | palette | crema | 241 CSS | `pixelprof.css` (66), `topbar-profile.css` (32), `docenti.css` (27) |
| `#AB5649` | derivato | terracotta | 155 CSS · 78 JS/HTML | `pixelprof.css` (53), `app.js` (30), `index.html` (19) |
| `#7A5A38` | palette | fango | 121 CSS · 43 JS/HTML | `pixelprof.css` (31), `index.html` (27), `mod-cards.css` (20) |
| `#54708C` | derivato | slate | 66 CSS · 51 JS/HTML | `index.html` (29), `mod-cards.css` (19), `pixelprof.css` (18) |
| `#17232D` | palette | navy | 100 CSS | `flip-card.css` (18), `topbar-profile.css` (14), `pixelprof.css` (13) |
| `#4A6B52` | derivato | sage | 60 CSS · 38 JS/HTML | `index.html` (21), `flip-card.css` (13), `quiz.css` (9) |
| `#B8935A` | derivato | miele | 54 CSS · 38 JS/HTML | `index.html` (26), `achievements.css` (15), `lo-sapevi.css` (13) |
| `#000000` | neutro | nero (ombre) | 90 CSS · 1 JS/HTML | `pixelprof.css` (50), `mod-cards.css` (8), `topbar-profile.css` (6) |
| `#6E7A50` | palette | oliva | 23 CSS · 27 JS/HTML | `tokens.css` (8), `index.html` (8), `flip-card.js` (7) |
| `#4E7464` | derivato | sage | 17 CSS · 29 JS/HTML | `mod-cards.css` (14), `index.html` (12), `game-constants.js` (10) |
| `#8B9968` | derivato | oliva chiaro | 18 CSS · 24 JS/HTML | `index.html` (14), `mod-cards.css` (9), `flip-card.js` (6) |
| `#9C6B3E` | derivato | rame | 18 CSS · 23 JS/HTML | `index.html` (19), `mod-cards.css` (16), `pixelprof.css` (2) |
| `#8A4038` | derivato | terracotta scuro | 39 CSS | `pixelprof.css` (11), `topbar-profile.css` (11), `dashboard.css` (8) |
| `#9D5875` | derivato | dusty-rose | 14 CSS · 24 JS/HTML | `index.html` (20), `mod-cards.css` (14), `game-constants.js` (3) |
| `#D4B483` | derivato | miele chiaro | 13 CSS · 9 JS/HTML | `index.html` (9), `lo-sapevi.css` (6), `pixelprof.css` (5) |
| `#C47869` | derivato | terracotta chiaro | 16 CSS · 3 JS/HTML | `mod-cards.css` (8), `pixelprof.css` (4), `index.html` (3) |
| `#5C6644` | derivato | oliva scuro | 18 CSS | `flip-card.css` (4), `docenti.css` (3), `pixelprof.css` (2) |
| `#FBF6EC` | derivato | crema chiaro | 17 CSS | `pixelprof.css` (4), `dashboard.css` (4), `quiz.css` (4) |
| `#55603F` | derivato | oliva scuro | 16 CSS | `pixelprof.css` (6), `topbar-profile.css` (4), `act-select.css` (2) |
| `#6B4E30` | derivato | fango scuro | 13 CSS | `topbar-profile.css` (3), `pixelprof.css` (2), `quiz.css` (2) |
| `#D49A8C` | derivato | terracotta chiaro | 11 CSS | `quiz.css` (5), `docenti.css` (4), `abbina.css` (1) |
| `#B07C96` | derivato | dusty-rose chiaro | 3 CSS · 8 JS/HTML | `index.html` (8), `mod-cards.css` (3) |
| `#04060F` | da verificare | scuro freddo (blu/viola) | 10 CSS | `pixelprof.css` (8), `onboarding.css` (1), `topbar-profile.css` (1) |
| `#8FB09F` | derivato | sage chiaro | 9 CSS | `quiz.css` (4), `docenti.css` (3), `abbina.css` (1) |
| `#7D99B3` | derivato | slate chiaro | 7 CSS · 2 JS/HTML | `mod-cards.css` (3), `docenti.css` (2), `profile-panel.js` (2) |
| `#E2E8F0` | da verificare | tinta senza nome in palette | 7 CSS · 1 JS/HTML | `pixelprof.css` (5), `flip-card.css` (1), `completa-frase.css` (1) |
| `#E4C48C` | derivato | miele chiaro | 6 CSS | `risultati.css` (3), `quiz.css` (2), `abbina.css` (1) |
| `#C9976A` | derivato | rame chiaro | 6 CSS | `mod-cards.css` (6) |
| `#2C3A33` | da verificare | tinta senza nome in palette | 0 CSS · 6 JS/HTML | `areas-config.js` (6) |
| `#3A3024` | da verificare | scuro caldo (marrone/bordeaux) | 5 CSS | `flip-card.css` (2), `act-select.css` (1), `dialogs.css` (1) |
| `#C0C0C0` | da verificare | grigio | 4 CSS | `pixelprof.css` (4) |
| `#3A2A24` | da verificare | scuro caldo (marrone/bordeaux) | 4 CSS | `mod-cards.css` (4) |
| `#332B20` | da verificare | scuro caldo (marrone/bordeaux) | 4 CSS | `lo-sapevi.css` (2), `mod-cards.css` (2) |
| `#10162A` | da verificare | scuro freddo (blu/viola) | 4 CSS | `pixelprof.css` (4) |
| `#0A1022` | da verificare | scuro freddo (blu/viola) | 4 CSS | `pixelprof.css` (4) |
| `#0A0F1E` | da verificare | scuro freddo (blu/viola) | 4 CSS | `pixelprof.css` (2), `onboarding.css` (2) |
| `#FFE3DC` | da verificare | rosa chiaro | 3 CSS | `topbar-profile.css` (3) |
| `#FFB4D7` | da verificare | rosa chiaro | 3 CSS | `mod-cards.css` (3) |
| `#E8A89A` | da verificare | rosa chiaro | 3 CSS | `pixelprof.css` (3) |
| `#C17A70` | derivato | terracotta chiaro | 1 CSS · 2 JS/HTML | `profile-panel.js` (2), `docenti.css` (1) |
| `#6A4FD6` | da verificare | viola | 3 CSS | `pixelprof.css` (3) |
| `#3E5A47` | derivato | sage scuro | 3 CSS | `abbina.css` (1), `feedback.css` (1), `quiz.css` (1) |
| `#233A2E` | da verificare | scuro verdastro | 3 CSS | `flip-card.css` (3) |
| `#EADFC6` | derivato | crema scuro | 2 CSS | `act-select.css` (1), `flip-card.css` (1) |
| `#A3B07F` | derivato | oliva chiaro | 2 CSS | `quiz.css` (2) |
| `#A096BE` | da verificare | viola | 0 CSS · 2 JS/HTML | `index.html` (2) |
| `#8C5A3A` | da verificare | tinta senza nome in palette | 2 CSS | `pixelprof.css` (2) |
| `#746996` | derivato | viola spento | 0 CSS · 2 JS/HTML | `game-constants.js` (2) |
| `#4A5436` | derivato | oliva scuro (hover) | 2 CSS | `pixelprof.css` (2) |
| `#44C76A` | da verificare | tinta senza nome in palette | 2 CSS | `mod-cards.css` (2) |
| `#1E2B1F` | da verificare | scuro verdastro | 2 CSS | `mod-cards.css` (2) |
| `#1C0414` | da verificare | scuro caldo (marrone/bordeaux) | 2 CSS | `mod-cards.css` (2) |
| `#12805A` | da verificare | verde saturo | 2 CSS | `flip-card.css` (1), `memory.css` (1) |
| `#0A8F5A` | da verificare | verde saturo | 2 CSS | `vero-falso.css` (2) |
| `#0A101C` | da verificare | scuro freddo (blu/viola) | 2 CSS | `pixelprof.css` (1), `achievements.css` (1) |
| `#0A0E1C` | da verificare | scuro freddo (blu/viola) | 2 CSS | `pixelprof.css` (1), `topbar-profile.css` (1) |
| `#FFC2E0` | da verificare | rosa chiaro | 1 CSS | `mod-cards.css` (1) |
| `#F1EDE0` | da verificare | tinta senza nome in palette | 1 CSS | `lo-sapevi.css` (1) |
| `#E9DEC7` | derivato | crema scuro | 1 CSS | `topbar-profile.css` (1) |
| `#E9DEC5` | derivato | crema scuro | 1 CSS | `topbar-profile.css` (1) |
| `#C8FFE8` | da verificare | verde saturo | 1 CSS | `pixelprof.css` (1) |
| `#C4CBA8` | da verificare | tinta senza nome in palette | 1 CSS | `quiz.css` (1) |
| `#C4BAFF` | da verificare | tinta senza nome in palette | 1 CSS | `memory.css` (1) |
| `#BE829B` | da verificare | rosso/rosa | 1 CSS | `mod-cards.css` (1) |
| `#A8B588` | da verificare | tinta senza nome in palette | 1 CSS | `pixelprof.css` (1) |
| `#8A8FA3` | da verificare | grigio | 0 CSS · 1 JS/HTML | `game-constants.js` (1) |
| `#8A5C31` | da verificare | tinta senza nome in palette | 1 CSS | `dashboard.css` (1) |
| `#88673A` | area | cyberbullismo (ocra) | 0 CSS · 1 JS/HTML | `game-constants.js` (1) |
| `#7E843A` | area | digcomp (oliva-lime) | 0 CSS · 1 JS/HTML | `game-constants.js` (1) |
| `#7A352D` | da verificare | rosso/rosa | 1 CSS | `quiz.css` (1) |
| `#6E5030` | da verificare | tinta senza nome in palette | 1 CSS | `pixelprof.css` (1) |
| `#6450DC` | da verificare | tinta senza nome in palette | 1 CSS | `memory.css` (1) |
| `#5E5380` | da verificare | viola | 1 CSS | `flip-card.css` (1) |
| `#5AD47A` | da verificare | tinta senza nome in palette | 1 CSS | `mod-cards.css` (1) |
| `#515B3C` | derivato | oliva scuro | 1 CSS | `topbar-profile.css` (1) |
| `#4A5438` | da verificare | tinta senza nome in palette | 1 CSS | `flip-card.css` (1) |
| `#3A0810` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `mod-cards.css` (1) |
| `#332B3D` | da verificare | viola | 1 CSS | `flip-card.css` (1) |
| `#300A26` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `mod-cards.css` (1) |
| `#2E1006` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `mod-cards.css` (1) |
| `#2C2208` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `mod-cards.css` (1) |
| `#2A2000` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#221A00` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#221500` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#220B16` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#1F2E3A` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#1C1600` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#1A1000` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#1A0810` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#180F00` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#180610` | da verificare | scuro caldo (marrone/bordeaux) | 1 CSS | `pixelprof.css` (1) |
| `#160D2A` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#140928` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#0E142C` | da verificare | scuro freddo (blu/viola) | 1 CSS | `memory.css` (1) |
| `#0E0A20` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#0D1224` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#0C2535` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#0C1224` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#0C1020` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#0C101C` | da verificare | scuro freddo (blu/viola) | 0 CSS · 1 JS/HTML | `game-engine-state.js` (1) |
| `#0C0818` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#0A3D26` | da verificare | scuro verdastro | 1 CSS | `quiz.css` (1) |
| `#0A1A30` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#0A0E1E` | da verificare | scuro freddo (blu/viola) | 1 CSS | `memory.css` (1) |
| `#0A0618` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#091610` | da verificare | scuro verdastro | 1 CSS | `mod-cards.css` (1) |
| `#090518` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#080C1C` | da verificare | scuro freddo (blu/viola) | 1 CSS | `memory.css` (1) |
| `#080A16` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#071E30` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#071A22` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#06101E` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#060E1C` | da verificare | scuro freddo (blu/viola) | 1 CSS | `mod-cards.css` (1) |
| `#060812` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#060810` | da verificare | scuro freddo (blu/viola) | 1 CSS | `lo-sapevi.css` (1) |
| `#00786A` | da verificare | tinta senza nome in palette | 1 CSS | `pixelprof.css` (1) |
| `#001E2A` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#001A22` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |
| `#001520` | da verificare | scuro freddo (blu/viola) | 1 CSS | `pixelprof.css` (1) |

## Appendice B — terne RGB come custom property

| Variabile | Valori | File |
|---|---|---|
| `--navy-rgb` | `23,35,45` | `tokens.css` |
| `--accent-rgb` | `242,232,213` (scuro) · `122,90,56` (chiaro e isole chiare) | `tokens.css` |
| `--purple-rgb` | `110,122,80` (scuro) · `92,102,68` (chiaro, isola chiara in scuro) · `251,246,236` (isola scura in chiaro) | `tokens.css` |
| `--area-rgb` | 7 aree × 2 temi: vedi sez. 2.1 | `areas.css` |
| `--dm-accent-rgb` / `--dm-accent-text-rgb` (→ `--dma-*`) | accento per-card di `.dm-card`; fallback `110,122,80` / `196,203,168` (le card attività lo ereditano); inline in `index.html` sulle due card modalità: Minigiochi `78,116,100` / `78,116,100`, Flip Card `122,90,56` / `196,168,120` | `flip-card.css`, `index.html` |
| `--pp-rgb` | colore delle pill minigioco in topbar: vedi sez. 2.5 | `topbar-profile.css` |
| `--st` | `242,232,213` (default) · `129,160,190` · `214,176,112` · `208,120,104` | `minigiochi/risultati.css` |

## Come è stato generato

Scansione automatica (tinycss2 sui CSS, regex su JS/HTML) di ogni `#hex` e `rgb()/rgba()`, con selettore e proprietà, poi controllo a mano dei selettori citati nelle sezioni 1–2. Non è un file generato a ogni build: va riletto o rigenerato quando si aggiungono colori.
