# PixelProf — Nota per la riattivazione di Memory

> Promemoria per quando Memory torna attivo. Filosofia: **pausa, non
> eliminazione** — nessun dato o motore di gioco è stato toccato, solo
> il tasto di avvio è stato disattivato nella UI.

---

## 1. Cosa è successo

- **v8.9.2** — su tua richiesta, il tasto Memory è stato messo in stato
  "coming soon" (disattivato) per tutti i moduli di tutte le Aree.
  `js/game-memory.js`, i loader dati e lo storico (classifiche, sessioni
  passate) **non sono stati toccati**: solo impossibile avviare una
  nuova partita.
- **v8.9.3** — in dark il testo "Trova le coppie · In arrivo" risultava
  poco leggibile (l'opacità dell'intera card si sommava a quella già
  bassa del testo). Corretto: testo a contrasto normale, icona
  desaturata, badge "Soon" ambra ben visibile (`.act-soon-badge`).
- **Bug CI trovato dopo** — il test e2e `smoke.spec.js` cliccava ancora
  `#ac-memory` come parte del giro di fumo su tutti i minigiochi. Con
  il tasto disattivato (`pointer-events:none`), Playwright andava in
  timeout → run GitHub Actions falliva sempre (non flaky, per questo il
  re-run dava lo stesso esito). Corretto commentando SOLO quello step.

## 2. Cosa ho fatto (riepilogo file toccati)

| File | Cosa contiene ora |
|---|---|
| `index.html` (~riga 1216) | `#ac-memory` con `tabindex="-1"`, niente `onclick`/`onkeydown`, `style="cursor:not-allowed;pointer-events:none"`, badge `<span class="act-soon-badge">Soon</span>` |
| `pixelprof.css` (~riga 434) | Nuova classe `.act-soon-badge` (badge ambra ad alto contrasto, riutilizzabile anche altrove) |
| `pixelprof.css` (~riga 2601-2602) | `#ac-memory .ai{...}` (icona desaturata) e `#ac-memory p{...}` (testo leggibile nonostante lo stato disattivato) |
| `pixelprof.css` (~riga 5134-5137) | Override tema chiaro per `#ac-memory p` e `.act-soon-badge` |
| `e2e/tests/smoke.spec.js` | Step "Memory" commentato (blocco `/* ... */`), NON cancellato; commento di testa del file aggiornato |

`js/game-memory.js`, `e2e/tests/support/game-actions.js` (funzioni
`flipTwoMemoryCards`/`togglePauseAndResumeMemory`) e tutti i JSON dati
Memory restano identici a prima — nessuna modifica.

## 3. Cosa devi fare per riattivarlo

### 3.1 — `index.html`
Sostituisci il div `#ac-memory` (~riga 1216) con la versione attiva
(stesso pattern degli altri 5 tasti attività, es. `#ac-fill`):

```html
<div class="act-card act-memory" id="ac-memory" role="button" tabindex="0"
  aria-label="Attività Memory"
  onclick="selAct('memory')"
  onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selAct('memory');}">
  <div class="ai" style="background:rgba(255,77,109,.1)">
    <i class="ti ti-cards" style="color:#ff6b85;font-size:20px"></i>
  </div>
  <div><h3>Memory</h3><p>Trova le coppie</p></div>
</div>
```

(Rimossi: `tabindex="-1"`, `style="cursor:not-allowed;pointer-events:none"`,
il badge `.act-soon-badge`; ripristinati `role="button"`, `tabindex="0"`,
`onclick`, `onkeydown`.)

### 3.2 — `pixelprof.css`
Puoi lasciare `.act-soon-badge` in libreria (non fa male, è generico e
riutilizzabile per il prossimo "coming soon" — es. un futuro modulo non
ancora pronto). Da rimuovere solo le regole specifiche per `#ac-memory`,
ormai inutili una volta tolto lo stile inline:
- riga ~2601-2602: `#ac-memory .ai{...}` e `#ac-memory p{...}`
- riga ~5134: `html[data-theme="light"] #ac-memory p{...}`

### 3.3 — `e2e/tests/smoke.spec.js`
- Rimuovi il blocco `/* ... */` che avvolge lo `step('Memory — gioca...')`
  (righe ~110-120 nella versione attuale) così torna a essere codice
  attivo.
- Nel commento di testa del file, ripristina la riga
  `*   6. Memory             (+ pausa/ripresa via pulsante dedicato)`
  al posto della nota `[SALTATO — v8.9.2: ...]`.

### 3.4 — Verifica finale
- `npm run build` (rigenera bundle + versione in `index.html`)
- `npm run content:check` da root repo
- `cd e2e && npm test` → tutti gli step, incluso Memory, devono passare
- Push su `main` → il workflow "E2E Smoke Test" deve tornare verde

## 4. Decisione ancora aperta — badge "Esploratore" 🗺️

Segnalata in v8.9.2 e mai risolta: il badge "Esploratore" richiede di
aver provato **tutti e 6** i minigiochi. Con Memory in pausa è
impossibile da sbloccare per chi non lo aveva già ottenuto prima.
Quando riattivi Memory il problema si risolve da solo — se invece
Memory resta in pausa a lungo, valuta se abbassare temporaneamente la
soglia a 5/5 disponibili (in `js/badges.js`, `BADGE_DEFS`).
