# Riepilogo — Modulo "CPU e architettura"

**Area:** ECDL — Computer Essentials
**Chiave modulo:** `cpu-architettura`
**Path base:** `data/ECDL/Computer_Essentials/modulo2/`
**Fonte:** Computer_Essentials_modulo2.pdf (unica fonte utilizzata)

## Capitoli coperti
1. Componenti di un computer
2. CPU
3. CPU Multicore
4. Velocità della CPU
5. Dal processore ai dati

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_cpu-architettura.json` | 34 coppie in 7 set | Wrapper `{module, sets}` senza id/type/difficulty |
| `completa_la_frase_cpu-architettura.json` | 59 elementi | Array piatto `{sentence, answer, bank}` |
| `quiz_cpu-architettura.json` | 50 elementi | id 1–50 |
| `speedquiz_cpu-architettura.json` | 50 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_cpu-architettura.json` | 38 elementi (24 vere / 14 false) | id 1–38, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati.
- Le persone e le aziende reali citate come casi documentati (IBM, Project Chess, Intel 4004, Federico Faggin, Ted Hoff, Stanley Mazor, Masatoshi Shima, AMD, Gordon Moore, Werner Buchholz) sono state mantenute, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori (quiz, speedquiz, bank di completa la frase) sono stati ricavati esclusivamente da concetti presenti nel PDF, incluse date, aziende e nomi propri realmente citati nel modulo.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. ruolo di RAM/scheda madre, architettura chiusa vs aperta dell'IBM PC 5150, stima di Moore, peso in byte di "CIAO"), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`.
- Il numero di elementi (non forzato a 150) riflette la densità reale di un modulo di 5 capitoli, in linea con la densità già osservata nel modulo 1.
