# Riepilogo — Modulo "Identità e comunicazione"

**Area:** ECDL — Online Essentials
**Chiave modulo:** `identita-e-comunicazione`
**Path base:** `data/ECDL/Online_Essentials/modulo2/`
**Fonte:** Modulo2_Identità_e_comunicazione.pdf (unica fonte utilizzata)
**Schema:** aggiornato (id/module/type/difficulty su tutti e 5 i file)

## Capitoli coperti
1. L'IP pubblico
2. VPN
3. Client/Server
4. HTTP e HTTPS
5. L'URL

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_identita-e-comunicazione.json` | 30 coppie in 7 set | `{id, module, type:"matching", difficulty:"easy", sets}` |
| `completa_la_frase_identita-e-comunicazione.json` | 51 elementi | Ogni item con `{id, module, type:"fillblank", difficulty:"easy", sentence, answer, bank}` |
| `quiz_identita-e-comunicazione.json` | 50 elementi | id 1–50 |
| `speedquiz_identita-e-comunicazione.json` | 50 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_identita-e-comunicazione.json` | 36 elementi (22 vere / 14 false) | id 1–36, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati.
- Le persone, aziende ed eventi reali citati come casi documentati (MaxMind/caso Potwin Kansas, Cody Kretsinger/LulzSec/HideMyAss, Tim Berners-Lee/primo server web CERN, Eric Butler/Firesheep, Symbolics/primo dominio .com) sono stati mantenuti, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori sono stati ricavati esclusivamente da concetti, date, aziende e nomi propri realmente presenti nel PDF (inclusi i riferimenti incrociati ai casi reali di moduli precedenti, es. Paul Mockapetris, citato come distrattore plausibile).
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. ambito di validità IP locale/pubblico, comportamento di HideMyAss di fronte all'ordine del tribunale, utilità di client/server senza controparte, data di pubblicazione del primo Web, metafore scambiate tra HTTP e HTTPS), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo su tutti e 5 i file: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`, e presenza corretta di id/module/type/difficulty su tutti i file.

## Stato area Online Essentials
Completati modulo1 (`rete-e-dati`) e modulo2 (`identita-e-comunicazione`). Restano modulo3 (`navigazione-e-tracciamento`) e modulo4 (`sicurezza-e-comportamento-online`).
