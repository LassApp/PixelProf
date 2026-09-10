# Riepilogo — Modulo "Agenti e Automazione"

## ⚠️ Nota su `module`
Stessa situazione dei Moduli 4 e 5: `agenti-automazione` non è nella mappa ufficiale (sezione 7). Uso il valore indicato nei nomi file, in continuità con `ai-generativa` e `prompt-engineering`. Sono ormai tre chiavi da formalizzare insieme, probabilmente come nuova area "AI" nella mappa.

## Fonte
Esclusivamente il PDF caricato: *Modulo 6 — Agenti e Automazione* (5 capitoli: Chatbot e agenti, Workflow, Agenti autonomi, Integrazioni, Produttività).

## Personaggi narrativi
"Luca" era presente in tutti e 5 gli esempi quotidiani del PDF. Generalizzato in "una persona"/"l'utente" ovunque. Verificato via validazione automatica — nessuna occorrenza residua.

## Conteggi finali (zero invenzione, nessun padding)

| File | Elementi | Note |
|---|---|---|
| `abbina_agenti-automazione.json` | 19 coppie in 4 set | Definizioni core (6), termini tecnici (4), metafore (5), distinzioni concettuali (4) |
| `completa_la_frase_agenti-automazione.json` | 82 | ~16 per capitolo |
| `quiz_agenti-automazione.json` | 50 | 10 per capitolo |
| `speedquiz_agenti-automazione.json` | 50 | Contenuto identico al quiz, `type` resta `"quiz"` |
| `vero_o_falso_agenti-automazione.json` | 42 | 21 vero / 21 falso |

## Validazione eseguita
- JSON sintatticamente validi
- ID progressivi da 1, nessun duplicato
- `correctIndex` nel range 0–3, nessuna opzione duplicata
- Risposta sempre presente (una sola volta) nella `bank`; placeholder `____` verificato in ogni frase
- `answer` booleano in vero/falso
- Contenuto quiz e speedquiz identico
- `module` e `difficulty` corretti su tutti gli elementi
- Nessuna frase/domanda/affermazione duplicata
- Nessun nome di personaggio vietato (Luca, Cristina, Marco, Giulia, Sara)

**0 errori riscontrati.**

## Nota sul modulo successivo
Il PDF si chiude con una transizione esplicita verso il "Modulo 7 — Deepfake e Contenuti Sintetici". Segnalo per riferimento futuro, nel caso il prossimo file caricato corrisponda.
