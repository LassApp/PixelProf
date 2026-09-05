# Riepilogo — Modulo 3: Formattare il testo

**Area:** ECDL → Word Processing
**Chiave modulo:** `formattare-il-testo`
**Path base:** `data/ECDL/Word_Processing/modulo3/`
**Fonte:** `Modulo3_Formattare_il_testo.pdf`

## Capitoli coperti dal PDF (9 capitoli — modulo più ricco dei precedenti)
1. Selezionare il testo (metodi di selezione, storia di Bravo/Tim Mott/Douglas Engelbart)
2. Formattare il carattere (grassetto/corsivo/sottolineato/apice/pedice, storia del corsivo di Aldo Manuzio)
3. Font e tipografia (serif/sans serif, punti tipografici, storia del Times New Roman)
4. Paragrafi ed elenchi (i quattro allineamenti, rientro, elenchi, storia della Bibbia a 42 linee di Gutenberg)
5. Modelli (.dotx vs .docx, storia del termine "boilerplate")
6. Interlinea e spaziatura (differenza interlinea/spaziatura, errore degli INVIO multipli, storia del "leading")
7. Gli stili (Titolo 1, struttura e modifica globale, storia di GML/SGML e le origini dell'HTML)
8. Il pilcrow (segni di formattazione invisibili, storia dal paragraphos greco ai rubricatori medievali)
9. Le tabulazioni (i quattro tipi, storia del tasto TAB da Edward Hess a James Koca)

## File generati

| File | Elementi |
|---|---|
| `abbina_formattare-il-testo.json` | 15 set, 56 coppie termine-definizione |
| `completa_la_frase_formattare-il-testo.json` | 87 frasi |
| `quiz_formattare-il-testo.json` | 101 domande |
| `speedquiz_formattare-il-testo.json` | 101 domande (identiche al quiz, `type: "quiz"`) |
| `vero_o_falso_formattare-il-testo.json` | 72 affermazioni |

## Note operative
- Il personaggio narrativo **Marco**, protagonista degli scenari del PDF, è stato rimosso da tutti gli elementi generati; le situazioni sono state generalizzate o riformulate in forma impersonale.
- Il modulo è sensibilmente più ricco dei precedenti (9 capitoli, ciascuno con un caso storico documentato autonomo), il che spiega il volume maggiore di elementi generati rispetto ai Moduli 1 e 2, pur restando al di sotto della quota indicativa di 150 per fedeltà al materiale realmente disponibile.
- Tutte le entità storiche reali citate (Butler Lampson, Douglas Engelbart, Tim Mott, Aldo Manuzio, Francesco Griffo, Stanley Morison, Victor Lardent, William Starling Burgess, Johannes Gutenberg, Charles Goldfarb, Edward Mosher, Raymond Lorie, Wilhelm Haas, Edward Hess, James Koca) sono state mantenute per nome in quanto riferimenti documentati nel PDF, non personaggi narrativi fittizi.
- Validazione (`validate.py`, adattato da quello dei moduli precedenti): ID sequenziali, `module` = `formattare-il-testo` su tutti gli item, `correctIndex` 0–3, 4 opzioni uniche per quiz, risposta presente nella bank di `completa_la_frase`, `answer` booleano per vero/falso, identità quiz/speedquiz, nessuna domanda/frase duplicata, nessun nome vietato → **0 errori** al primo tentativo.
