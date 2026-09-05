# Riepilogo — Modulo 4: Elementi grafici

**Area:** ECDL → Word Processing
**Chiave modulo:** `elementi-grafici`
**Path base:** `data/ECDL/Word_Processing/modulo4/`
**Fonte:** `Modulo4_Elementi_grafici.pdf`

## Capitoli coperti dal PDF
1. Le Immagini (modi di inserimento, ridimensionamento e aspect ratio, storia del formato JPEG)
2. Immagini e testo (immagine in linea vs mobile, opzioni di testo a capo, ancoraggio, storia del wraparound/Ventura Publisher)
3. Le tabelle (righe/colonne/celle, limiti delle tabulazioni, storia del modello relazionale di Edgar F. Codd)
4. Forme e SmartArt (forme semplici vs diagrammi predefiniti, categorie SmartArt, storia dei "process chart" di Gilbreth e dell'ASME)

## File generati

| File | Elementi |
|---|---|
| `abbina_elementi-grafici.json` | 10 set, 32 coppie termine-definizione |
| `completa_la_frase_elementi-grafici.json` | 43 frasi |
| `quiz_elementi-grafici.json` | 44 domande |
| `speedquiz_elementi-grafici.json` | 44 domande (identiche al quiz, `type: "quiz"`) |
| `vero_o_falso_elementi-grafici.json` | 38 affermazioni |

## Note operative
- Il personaggio narrativo **Marco**, protagonista degli scenari del PDF, è stato rimosso da tutti gli elementi generati; le situazioni sono state generalizzate o riformulate in forma impersonale.
- Il volume di contenuti (32 coppie abbina, 44 quiz, 38 vero/falso, 43 completa la frase) è in linea con quello dei Moduli 1 e 2, coerente con la struttura a 4 capitoli del PDF, ciascuno con un caso storico documentato.
- Le entità storiche reali citate (Joint Photographic Experts Group, Ventura Software, Aldus/PageMaker, Edgar F. Codd, IBM, Frank e Lillian Gilbreth, ASME) sono state mantenute per nome in quanto riferimenti documentati nel PDF, non personaggi narrativi fittizi.
- Validazione (`validate.py`, adattato dai moduli precedenti): ID sequenziali, `module` = `elementi-grafici` su tutti gli item, `correctIndex` 0–3, 4 opzioni uniche per quiz, risposta presente nella bank di `completa_la_frase`, `answer` booleano per vero/falso, identità quiz/speedquiz, nessuna domanda/frase duplicata, nessun nome vietato → **0 errori** al primo tentativo.
