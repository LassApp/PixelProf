# Riepilogo — Modulo "La rete e i dati"

**Area:** ECDL — Online Essentials
**Chiave modulo:** `rete-e-dati`
**Path base:** `data/ECDL/Online_Essentials/modulo1/`
**Fonte:** Modulo1_La_rete_e_i_dati.pdf (unica fonte utilizzata)
**Schema:** aggiornato (id/module/type/difficulty su tutti e 5 i file, come per il modulo `software`)

## Capitoli coperti
1. Cos'è una rete
2. Tipi di rete (LAN, MAN, WAN)
3. Viaggio dei dati (instradamento/routing)
4. Indirizzo IP
5. DNS

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_rete-e-dati.json` | 28 coppie in 7 set | `{id, module, type:"matching", difficulty:"easy", sets}` |
| `completa_la_frase_rete-e-dati.json` | 53 elementi | Ogni item con `{id, module, type:"fillblank", difficulty:"easy", sentence, answer, bank}` |
| `quiz_rete-e-dati.json` | 50 elementi | id 1–50 |
| `speedquiz_rete-e-dati.json` | 50 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_rete-e-dati.json` | 36 elementi (25 vere / 11 false) | id 1–36, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati.
- Le persone, organizzazioni ed eventi reali citati come casi documentati (Leonard Kleinrock e Charley Kline/primo messaggio ARPANET 1969, Bill Duvall, Robert Metcalfe e team Xerox PARC/Ethernet 1973, blackout Facebook-Instagram-WhatsApp 2021, IANA/esaurimento IPv4 2011, Paul Mockapetris e Jon Postel/DNS 1983) sono stati mantenuti, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori sono stati ricavati esclusivamente da concetti, date, organizzazioni e nomi propri realmente presenti nel PDF.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. causa del blackout 2021, cosa distribuì IANA nel 2011, chi tra Kleinrock/Kline e Duvall era da che parte, centralizzazione pre/post DNS, metafore scambiate tra instradamento e DNS), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo su tutti e 5 i file: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`, e presenza corretta di id/module/type/difficulty su tutti i file.

## Stato area Online Essentials
Con questo modulo si avvia la generazione dell'area **Online Essentials** (4 moduli totali secondo `aree_e_moduli.md`): completato modulo1 (`rete-e-dati`). Restano modulo2 (`identita-e-comunicazione`), modulo3 (`navigazione-e-tracciamento`) e modulo4 (`sicurezza-e-comportamento-online`).
