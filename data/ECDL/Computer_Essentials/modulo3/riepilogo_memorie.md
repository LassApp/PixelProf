# Riepilogo — Modulo "Le memorie del computer"

**Area:** ECDL — Computer Essentials
**Chiave modulo:** `memorie`
**Path base:** `data/ECDL/Computer_Essentials/modulo3/`
**Fonte:** Modulo3_Memorie.pdf (unica fonte utilizzata)

## Capitoli coperti
1. Le memorie di massa: conservare i dati nel tempo
2. L'Hard Disk (HDD): la memoria che cerca
3. L'SSD: la memoria che risponde
4. La RAM: il presente del computer
5. La ROM: la memoria che non dimentica mai
6. L'avvio del sistema e i dispositivi esterni

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_memorie.json` | 33 coppie in 7 set | Wrapper `{module, sets}` senza id/type/difficulty |
| `completa_la_frase_memorie.json` | 65 elementi | Array piatto `{sentence, answer, bank}` |
| `quiz_memorie.json` | 60 elementi | id 1–60 |
| `speedquiz_memorie.json` | 60 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_memorie.json` | 40 elementi (26 vere / 14 false) | id 1–40, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati.
- Le persone e le aziende reali citate come casi documentati (IBM 350/305 RAMAC, ST-506/Shugart-Seagate, Fujio Masuoka/Toshiba, Robert Dennard/DRAM, virus CIH/Chen Ing-hau, Dov Moran/M-Systems, Trek Technology, Netac) sono state mantenute, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori (quiz, speedquiz, bank di completa la frase) sono stati ricavati esclusivamente da concetti, date, aziende e nomi propri realmente presenti nel PDF.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. peso IBM 350, ordine NOR/NAND, comportamento RAM vs ROM a computer spento, velocità SSD vs HDD in fase di boot, unicità del "protagonista" della chiavetta USB), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`.
- Il numero di elementi (non forzato a 150) riflette la densità reale di un modulo di 6 capitoli, superiore ai moduli 1 e 2 grazie al maggior numero di casi reali documentati.
