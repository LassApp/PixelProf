# Riepilogo — Modulo 2: Scrivere e salvare

**Area:** ECDL → Word Processing
**Chiave modulo:** `scrivere-e-salvare`
**Path base:** `data/ECDL/Word_Processing/modulo2/`
**Fonte:** `Modulo2_Scrivere_e_Salvare.pdf`

## Capitoli coperti dal PDF
1. Scrivere e copiare (copia/incolla, appunti/clipboard, CTRL+C/X/V, storia di Larry Tesler e Gypsy)
2. Muoversi nel documento (testo riempitivo `=lorem()`, scroll, zoom, righello, barra di stato, storia del Lorem Ipsum)
3. I margini (definizione, area stampabile, percorso Layout→Imposta pagina→Margini, storia del formato A4/DIN 476/ISO 216)
4. Salvare (RAM vs memoria di massa, Salva vs Salva con nome, serializzazione/deserializzazione, caso reale Toy Story 2/Pixar)
5. Chiudere e riaprire (definizione, modalità di riapertura, storia .doc → .docx/XML, standard ISO 2008)

## File generati

| File | Elementi |
|---|---|
| `abbina_scrivere-e-salvare.json` | 9 set, 34 coppie termine-definizione |
| `completa_la_frase_scrivere-e-salvare.json` | 48 frasi |
| `quiz_scrivere-e-salvare.json` | 48 domande |
| `speedquiz_scrivere-e-salvare.json` | 48 domande (identiche al quiz, `type: "quiz"`) |
| `vero_o_falso_scrivere-e-salvare.json` | 44 affermazioni |

## Note operative
- Il personaggio narrativo **Marco**, protagonista degli scenari del PDF, è stato rimosso da tutti gli elementi generati; le situazioni sono state generalizzate o riformulate in forma impersonale.
- **Nota trasparente sul controllo nomi:** durante la validazione, il controllo automatico dei nomi vietati ha inizialmente segnalato un falso positivo su "Marco Tullio Cicerone" (l'oratore romano autore del testo da cui deriva il Lorem Ipsum), poiché contiene la sottostringa "Marco". Si tratta di un'entità storica reale documentata nel PDF, non del personaggio narrativo fittizio, quindi è stata correttamente mantenuta come riferimento storico legittimo; il validatore è stato aggiornato con un'eccezione esplicita per questo caso.
- Le altre entità storiche reali citate (Larry Tesler, Tim Mott, Richard McClintock, Galyn Susman, Deutsches Institut für Normung, Letraset, Aldus Corporation, Pixar) sono state mantenute per nome in quanto riferimenti documentati, non personaggi narrativi.
- Il numero di elementi (34 coppie abbina, 48 quiz, 44 vero/falso, 48 completa la frase) riflette la densità reale del contenuto: modulo di 5 sotto-capitoli, ciascuno con definizioni tecniche e un caso storico/reale documentato, senza forzare la quota di 150.
- Validazione (`validate.py`): ID sequenziali, `module` = `scrivere-e-salvare` su tutti gli item, `correctIndex` 0–3, 4 opzioni uniche per quiz, risposta presente nella bank di `completa_la_frase`, `answer` booleano per vero/falso, identità quiz/speedquiz, nessuna domanda/frase duplicata, nessun nome vietato (con l'eccezione documentata) → **0 errori**.
