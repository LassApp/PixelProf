# Riepilogo — Modulo "Software"

**Area:** ECDL — Computer Essentials
**Chiave modulo:** `software`
**Path base:** `data/ECDL/Computer_Essentials/modulo4/`
**Fonte:** Modulo4_Software.pdf (unica fonte utilizzata)

## ⚠️ Schema aggiornato in questo modulo
Su richiesta esplicita, **tutti e 5 i file** ora includono i tag `id`, `module`, `type`, `difficulty` — inclusi abbina e completa la frase, che nei moduli precedenti (1, 2, 3) ne erano privi. Nel dettaglio:
- **Abbina**: i quattro tag sono ora a livello di file (`{id, module, type: "matching", difficulty: "easy", sets: [...]}`), mentre le singole coppie restano `{term, definition}`.
- **Completa la frase**: ogni elemento dell'array ora è `{id, module, type: "fillblank", difficulty: "easy", sentence, answer, bank}`.
- **Quiz / Speedquiz / Vero o falso**: schema invariato, già conforme (`type: "quiz"` per entrambi, `type: "truefalse"` per vero/falso).

Ho salvato questa convenzione nella memoria per applicarla automaticamente ai prossimi moduli. I moduli 1-3 (fondamenti-digitali, cpu-architettura, memorie) restano con lo schema precedente, a meno che non mi chiedi di rigenerarli.

## Capitoli coperti
1. Il software
2. Il sistema operativo
3. Il software applicativo
4. Le licenze software
5. L'EULA e accettazione

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_software.json` | 33 coppie in 7 set | `{id, module, type:"matching", difficulty:"easy", sets}` |
| `completa_la_frase_software.json` | 58 elementi | Ogni item con `{id, module, type:"fillblank", difficulty:"easy", sentence, answer, bank}` |
| `quiz_software.json` | 50 elementi | id 1–50 |
| `speedquiz_software.json` | 50 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_software.json` | 34 elementi (22 vere / 12 false) | id 1–34, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati.
- Le persone, aziende e organizzazioni reali citate come casi documentati (Margaret Hamilton/Apollo 11, causa antitrust USA-Microsoft, Dan Bricklin e Bob Frankston/VisiCalc, Richard Stallman/GNU e Free Software Foundation, Mark Russinovich/Sony BMG XCP, Facebook-WhatsApp) sono state mantenute, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori sono stati ricavati esclusivamente da concetti, date, aziende e nomi propri realmente presenti nel PDF.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. ruoli invertiti software di sistema/applicativo, quota di mercato Windows, esito dell'emergenza Apollo 11, evoluzione del modello WhatsApp), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo su tutti e 5 i file: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`, e presenza corretta di id/module/type/difficulty su tutti i file secondo il nuovo schema.
