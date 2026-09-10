# Riepilogo — Modulo "Prompt Engineering"

## ⚠️ Nota su `module`
Stessa situazione del Modulo 4: `prompt-engineering` non è nella mappa ufficiale (sezione 7). Uso il valore indicato nei nomi file richiesti, in continuità con `ai-generativa`. Consiglio di formalizzare entrambe le chiavi nella mappa (probabile nuova area "AI" accanto a Cybersecurity e Reti).

## Fonte
Esclusivamente il PDF caricato: *Modulo 5 — Prompt Engineering* (6 capitoli: Istruzioni, Contesto, Ruolo, Esempi, Tecniche avanzate, Progetti).

## Personaggi narrativi
Il PDF conteneva due personaggi: "Luca" (presente in tutti e 6 gli esempi quotidiani) e "Sara" (nella transizione capitolo 5→6). Entrambi generalizzati in "una persona"/"l'utente"/riformulazioni impersonali. Verificato via validazione automatica — nessuna occorrenza residua di nessuno dei due nomi.

## Riferimenti tecnici reali preservati
- **GPT** e **Large Language Models**, citati nel modulo a proposito della ricerca su few-shot learning — mantenuti come nel testo, essendo riferimenti fattuali generici e non persone reali.

## Conteggi finali (zero invenzione, nessun padding)

| File | Elementi | Note |
|---|---|---|
| `abbina_prompt-engineering.json` | 20 coppie in 4 set | Definizioni core (6), termini tecnici (4), metafore (6), distinzioni concettuali (4) |
| `completa_la_frase_prompt-engineering.json` | 81 | ~13-15 per capitolo |
| `quiz_prompt-engineering.json` | 60 | 10 per capitolo |
| `speedquiz_prompt-engineering.json` | 60 | Contenuto identico al quiz, `type` resta `"quiz"` |
| `vero_o_falso_prompt-engineering.json` | 44 | 25 vero / 19 falso |

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
