# Riepilogo — Modulo "Navigazione e tracciamento"

**Area:** ECDL — Online Essentials
**Chiave modulo:** `navigazione-e-tracciamento`
**Path base:** `data/ECDL/Online_Essentials/modulo3/`
**Fonte:** Modulo3_Navigazione_e_tracciamento.pdf (unica fonte utilizzata)
**Schema:** aggiornato (id/module/type/difficulty su tutti e 5 i file)

## Capitoli coperti
1. Browser
2. Motore di ricerca
3. Browser e motore di ricerca (differenze)
4. Cookie
5. Cache
6. Personalizzazione e tracciamento

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_navigazione-e-tracciamento.json` | 28 coppie in 8 set | `{id, module, type:"matching", difficulty:"easy", sets}` |
| `completa_la_frase_navigazione-e-tracciamento.json` | 59 elementi | Ogni item con `{id, module, type:"fillblank", difficulty:"easy", sentence, answer, bank}` |
| `quiz_navigazione-e-tracciamento.json` | 60 elementi | id 1–60 |
| `speedquiz_navigazione-e-tracciamento.json` | 60 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_navigazione-e-tracciamento.json` | 38 elementi (25 vere / 13 false) | id 1–38, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati. Durante la validazione automatica è stato individuato e corretto un riferimento residuo a "Marco" in un elemento di completa la frase (capitolo 6), poi generalizzato in "l'utente".
- Le persone e le aziende reali citate come casi documentati (Marc Andreessen ed Eric Bina/Mosaic, Larry Page e Sergey Brin/Google e PageRank, giudice Amit Mehta/sentenza antitrust Google 2024, Lou Montulli/invenzione del cookie, Tim Berners-Lee/sfida MIT 1995, Akamai/Tom Leighton e Danny Lewin, Cambridge Analytica) sono state mantenute, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori sono stati ricavati esclusivamente da concetti, date, aziende e nomi propri realmente presenti nel PDF.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. Mosaic finestre separate vs unite, cosa "contiene" un motore di ricerca, comportamento del cookie/cache, permanenza della cache, idea centrale di Akamai, cosa sa davvero Internet dell'utente), senza introdurre concetti esterni.
- Validazione automatica eseguita con esito positivo su tutti e 5 i file dopo la correzione: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`, e presenza corretta di id/module/type/difficulty su tutti i file.

## Stato area Online Essentials
Completati modulo1 (`rete-e-dati`), modulo2 (`identita-e-comunicazione`) e modulo3 (`navigazione-e-tracciamento`). Resta modulo4 (`sicurezza-e-comportamento-online`).
