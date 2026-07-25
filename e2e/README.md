# PixelProf — Smoke test E2E (Playwright)

Suite di smoke test automatizzati per PixelProf. Copre in un'unica corsa
il flusso critico dell'app:

```
login → entra in aula → Quiz → Speed Quiz → Abbina → Memory
      → Completa la frase → (pausa/riprendi per ognuno) → uscita
```

Nata per evitare di dover ripetere manualmente questi check ad ogni
release — negli ultimi sviluppi sono stati trovati 3 bug diversi solo
testando a mano l'Hub; questo script li avrebbe intercettati in ~25
secondi.

## Come funziona (importante da capire prima di modificarla)

**Nessuna chiamata di rete reale verso Supabase.** `tests/support/mock-supabase.js`
intercetta le 4 chiamate che il flusso login→aula attende in modo
sincrono (login, profilo/ruolo, elenco aule, moduli abilitati) e
risponde con dati finti e istantanei. Tutto il resto (salvataggio
punteggi, giocatori, statistiche — sempre "fire-and-forget" nel codice
applicativo) riceve una risposta 200 generica dal catch-all.

Vantaggi di questo approccio:
- zero credenziali Supabase reali nel repo o in CI;
- zero rischio di scrivere dati di test nel progetto Supabase vero;
- test deterministici e veloci, non dipendenti dalla latenza di rete;
- eseguibili anche in ambienti con accesso a internet limitato (es.
  sandbox CI ristrette) — l'unico traffico esterno reale è verso
  `esm.sh` (libreria supabase-js), Google Fonts e l'icon font Tabler,
  nessuno dei quali è indispensabile per l'interattività testata.

I file JSON delle domande (`data/quiz/*.json` ecc.) **non** sono
mockati: vengono serviti realmente dal server statico locale, quindi i
test usano gli stessi identici dati che vede un docente in produzione.

Se in futuro cambia il progetto Supabase di PixelProf, l'unica riga da
aggiornare è `SUPABASE_HOST` in `tests/support/mock-supabase.js`.

## Struttura

```
e2e/
├── playwright.config.js       configurazione + avvio server statico locale
├── package.json
├── tests/
│   ├── auth.spec.js           login riuscito / credenziali errate
│   ├── smoke.spec.js          IL flusso completo (roadmap)
│   └── support/
│       ├── mock-supabase.js   mock di rete per Supabase
│       ├── fixtures.js        fixture "aulaPage" (login+aula già pronti)
│       └── game-actions.js    azioni riusabili sui 5 minigiochi
└── README.md                  questo file
```

## Installazione (una tantum)

Dalla cartella `e2e/`:

```bash
npm install
npm run install:browsers   # scarica Chromium per Playwright (~150MB)
```

> Il comando sopra richiede accesso a `cdn.playwright.dev`. Se lo lanci
> da una rete/sandbox molto ristretta e fallisce, esegui la suite da un
> ambiente con accesso internet normale (il tuo PC, o CI standard tipo
> GitHub Actions — vedi `.github/workflows/e2e-smoke.yml`).

## Esecuzione

```bash
npm test                # esegue tutta la suite, headless
npm run test:headed     # stessa cosa ma con il browser visibile
npm run test:ui         # UI interattiva di Playwright (consigliata per debug)
npm run test:debug      # step-by-step con inspector
npm run report          # riapre l'ultimo report HTML generato
```

Il server statico locale (porta 4173) viene avviato/fermato
automaticamente da Playwright — non serve lanciarlo a mano.

## Cosa aspettarsi da una corsa riuscita

```
Running 3 tests using 1 worker

  ✓  auth.spec.js:15 › login riuscito porta alla schermata "Seleziona aula"
  ✓  auth.spec.js:28 › login con credenziali errate mostra un messaggio d'errore
  ✓  smoke.spec.js:47 › flusso completo: login → entra in aula → ... → uscita

  3 passed (25s circa)
```

Se qualcosa si rompe, il report HTML (`npm run report`) mostra
esattamente in quale `test.step()` (fase) è avvenuto il fallimento —
schermata, traccia e video sono allegati automaticamente
(`retain-on-failure`), niente bisogno di riprodurre il bug a mano per
capire dove si è rotto qualcosa.

## Estendere la suite

- **Nuovo minigioco o nuova modalità**: aggiungi una funzione in
  `game-actions.js` seguendo lo stesso pattern (naviga, interagisci,
  eventualmente pausa/riprendi, esci) e richiamala da uno step in
  `smoke.spec.js`.
- **Modalità Squadre**: non ancora coperta (la roadmap chiedeva il
  flusso base individuale) — stesso pattern di `setupIndividualAndStart`
  ma con `#mb-sq` + righe squadra, se in futuro vuoi aggiungerla.
- **Ruolo Direttore / Dashboard Direttore / Gestione Docenti**: non
  coperto da questa suite (fuori dallo scope "login → aula → gioco"
  della roadmap) — `mock-supabase.js` supporta già `role: 'director'`
  come base di partenza se vorrai aggiungerlo.
