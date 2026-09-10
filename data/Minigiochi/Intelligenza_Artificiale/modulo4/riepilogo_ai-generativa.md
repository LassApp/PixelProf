# Riepilogo — Modulo "AI Generativa"

## ⚠️ Nota su `module`
La chiave `ai-generativa` **non è presente** nella mappa ufficiale (sezione 7 del prompt master). Nessuna delle otto categorie mappate copre la generazione AI (testo/immagini/audio/video/codice) come argomento a sé stante — la voce più vicina, `nuove-minacce-digitali`, riguarda specificamente le minacce, non le capacità generative in generale. Ho usato `ai-generativa` perché è il valore che hai indicato esplicitamente nei nomi dei file richiesti, ma va aggiunto formalmente alla mappa (o corretto) per restare coerente con la regola "mai inventare la chiave".

## Fonte
Esclusivamente il PDF caricato: *Modulo 4 — AI Generativa* (5 capitoli: Testo, Immagini, Audio, Video, Codice).

## Personaggi narrativi
Il personaggio "Luca", presente in tutti e 5 gli esempi quotidiani del PDF, è stato generalizzato in "una persona"/"l'utente" in ogni elemento generato. Verificato via validazione automatica (nessuna occorrenza residua).

## Distrattori — nota di qualità
Per le domande su casi reali (Pentagono 2023, voce di Biden 2024, video di Zelenskyj 2024, GitHub Copilot) ho evitato distrattori con nomi propri esterni al PDF (es. altri politici, altri tool AI), sostituendoli con distrattori "incrociati" tratti da altri casi reali dello stesso PDF o con formulazioni generiche. Questo rispetta la regola "distrattori ricavati esclusivamente dal PDF" in modo più stringente rispetto ad alcuni pattern usati nei moduli precedenti.

## Conteggi finali (zero invenzione, nessun padding)

| File | Elementi | Note |
|---|---|---|
| `abbina_ai-generativa.json` | 18 coppie in 4 set | Definizioni core (5), termini/tecniche (4), casi reali (4), metafore (5) |
| `completa_la_frase_ai-generativa.json` | 68 | ~13-16 per capitolo |
| `quiz_ai-generativa.json` | 50 | 10 per capitolo |
| `speedquiz_ai-generativa.json` | 50 | Contenuto identico al quiz, `type` resta `"quiz"` |
| `vero_o_falso_ai-generativa.json` | 38 | 22 vero / 16 falso |

## Validazione eseguita
- JSON sintatticamente validi
- ID progressivi da 1, nessun duplicato
- `correctIndex` nel range 0–3, nessuna opzione duplicata
- Risposta sempre presente (una sola volta) nella `bank`
- `answer` booleano in vero/falso
- Contenuto quiz e speedquiz identico
- `module` e `difficulty` corretti su tutti gli elementi
- Nessuna frase/domanda/affermazione duplicata
- Nessun nome di personaggio vietato (Luca, Cristina, Marco, Giulia, Sara)

**0 errori riscontrati.**

## Casi reali documentati preservati fattualmente
- Immagine AI della presunta esplosione al Pentagono (2023)
- Telefonate con voce artificiale di Joe Biden, elettori del New Hampshire (2024)
- Video deepfake di Volodymyr Zelenskyj (2024)
- GitHub Copilot (GitHub + OpenAI)
