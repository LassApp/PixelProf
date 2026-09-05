# Riepilogo — Modulo 5: Strutturare il documento

**Area:** ECDL → Word Processing
**Chiave modulo:** `strutturare-il-documento`
**Path base:** `data/ECDL/Word_Processing/modulo5/`
**Fonte:** `Modulo5_Strutturare_il_documento.pdf`

Questo è l'ultimo modulo della sotto-area Word Processing (5 moduli su 5).

## Capitoli coperti dal PDF
1. Interruzioni di pagina (CTRL+INVIO, interruzione di colonna, storia di Donald Knuth e TeX)
2. Navigazione e Ricerca (Trova/Trova e sostituisci, scorciatoie di spostamento, storia di Ken Thompson e grep)
3. Intestazioni e numerazione (header/footer come elementi globali, numerazione dinamica, storia della foliazione medievale)
4. Anteprima di stampa (verifica prima della stampa fisica, storia delle bozze di stampa/galley proofs)

## File generati

| File | Elementi |
|---|---|
| `abbina_strutturare-il-documento.json` | 8 set, 27 coppie termine-definizione |
| `completa_la_frase_strutturare-il-documento.json` | 42 frasi |
| `quiz_strutturare-il-documento.json` | 42 domande |
| `speedquiz_strutturare-il-documento.json` | 42 domande (identiche al quiz, `type: "quiz"`) |
| `vero_o_falso_strutturare-il-documento.json` | 36 affermazioni |

## Note operative
- Il personaggio narrativo **Marco**, protagonista degli scenari del PDF, è stato rimosso da tutti gli elementi generati; le situazioni sono state generalizzate o riformulate in forma impersonale.
- Il volume di contenuti (27 coppie abbina, 42 quiz, 36 vero/falso, 42 completa la frase) è proporzionato alla struttura a 4 capitoli del PDF; leggermente più contenuto rispetto ai Moduli 1/2/4, in linea con la minore densità di sotto-argomenti tecnici per capitolo.
- Le entità storiche reali citate (Donald Knuth, Ken Thompson, Doug McIlroy) sono state mantenute per nome in quanto riferimenti documentati nel PDF, non personaggi narrativi fittizi.
- Validazione (`validate.py`, adattato dai moduli precedenti): ID sequenziali, `module` = `strutturare-il-documento` su tutti gli item, `correctIndex` 0–3, 4 opzioni uniche per quiz, risposta presente nella bank di `completa_la_frase`, `answer` booleano per vero/falso, identità quiz/speedquiz, nessuna domanda/frase duplicata, nessun nome vietato → **0 errori** al primo tentativo.

## Stato sotto-area Word Processing
Con questo modulo si completano tutti e 5 i moduli previsti per ECDL → Word Processing (word-e-ambiente, scrivere-e-salvare, formattare-il-testo, elementi-grafici, strutturare-il-documento).
