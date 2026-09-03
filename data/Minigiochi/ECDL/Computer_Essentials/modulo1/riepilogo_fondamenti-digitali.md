# Riepilogo — Modulo "Fondamenti digitali"

**Area:** ECDL — Computer Essentials
**Chiave modulo:** `fondamenti-digitali`
**Path base:** `data/ECDL/Computer_Essentials/modulo1/`
**Fonte:** Modulo1_Fondamenti_Digitali.pdf (unica fonte utilizzata)

## Capitoli coperti
1. ICT
2. Hardware e Software
3. Tipologie di computer
4. Input
5. Output

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_fondamenti-digitali.json` | 37 coppie in 9 set | Wrapper `{module, sets}` senza id/type/difficulty |
| `completa_la_frase_fondamenti-digitali.json` | 80 elementi | Array piatto `{sentence, answer, bank}` |
| `quiz_fondamenti-digitali.json` | 50 elementi | id 1–50 |
| `speedquiz_fondamenti-digitali.json` | 50 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_fondamenti-digitali.json` | 39 elementi (26 vere / 13 false) | id 1–39, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati.
- Le persone reali citate come casi documentati (Clyde Dawson, Sharon Buchanan, Douglas Engelbart, Gary Starkweather) sono state mantenute, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori (quiz, speedquiz, bank di completa la frase) sono stati ricavati esclusivamente da concetti presenti nel PDF.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. ruoli invertiti Dawson/Buchanan, dimensioni Osborne 1, metafore dei tipi di computer), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`.
- Il numero di elementi (non forzato a 150) riflette la densità reale di un modulo introduttivo di 5 capitoli.
