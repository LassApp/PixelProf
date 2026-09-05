# Riepilogo — Modulo 1: Word e ambiente

**Area:** ECDL → Word Processing
**Chiave modulo:** `word-e-ambiente`
**Path base:** `data/ECDL/Word_Processing/modulo1/`
**Fonte:** `Modulo1_Word_e_ambiente.pdf`

## Capitoli coperti dal PDF
1. Cos'è Word (definizione, WYSIWYG, storia di Word 1981–1983, WordPerfect/WordStar)
2. Il primo avvio (schermata iniziale, documento vuoto vs modello, margini, barra multifunzione/Office 2007)
3. La tastiera (definizione, QWERTY, tastiere italiane, storia di Sholes/Remington)
4. I tasti principali (INVIO, SHIFT, CAPS LOCK, CTRL, CANC, BACKSPACE, TAB, ALT, ALT GR + storia)

## File generati

| File | Elementi |
|---|---|
| `abbina_word-e-ambiente.json` | 7 set, 32 coppie termine-definizione |
| `completa_la_frase_word-e-ambiente.json` | 43 frasi |
| `quiz_word-e-ambiente.json` | 41 domande |
| `speedquiz_word-e-ambiente.json` | 41 domande (identiche al quiz, `type: "quiz"`) |
| `vero_o_falso_word-e-ambiente.json` | 36 affermazioni |

## Note operative
- Il personaggio narrativo **Marco**, presente nel PDF come protagonista degli scenari, è stato rimosso da tutti gli elementi generati e le situazioni sono state generalizzate ("una persona", ecc.), oppure eliminate se il contesto era puramente narrativo senza contenuto didattico autonomo.
- Nessun'altra entità del PDF richiedeva anonimizzazione: i nomi presenti (Charles Simonyi, Richard Brodie, Christopher Latham Sholes, Carlos Glidden, Samuel Soulé) sono personaggi storici reali documentati, non protagonisti narrativi fittizi, e sono stati mantenuti come riferimenti storici legittimi.
- Il numero di elementi (32 coppie abbina, 41 quiz, 36 vero/falso, 43 completa la frase) riflette la densità reale del contenuto: il PDF è un modulo introduttivo di 4 sotto-capitoli, più breve rispetto ai moduli Cybersecurity/Reti già completati, quindi non è stato forzato verso quota 150.
- Validazione (`validate.py`): ID sequenziali, `module` = `word-e-ambiente` su tutti gli item, `correctIndex` 0–3, 4 opzioni uniche per quiz, risposta presente nella bank di `completa_la_frase`, `answer` booleano per vero/falso, identità quiz/speedquiz, nessuna domanda/frase duplicata, nessun nome vietato → **0 errori**.
