# Riepilogo — Modulo "Sicurezza e comportamento online"

**Area:** ECDL — Online Essentials
**Chiave modulo:** `sicurezza-e-comportamento-online`
**Path base:** `data/ECDL/Online_Essentials/modulo4/`
**Fonte:** Modulo4_Sicurezza_e_comportamento_online.pdf (unica fonte utilizzata)
**Schema:** aggiornato (id/module/type/difficulty su tutti e 5 i file)

## Capitoli coperti
1. Password
2. E-mail e ingegneria sociale
3. Phishing
4. Malware
5. Netiquette

## File generati e conteggi

| File | Elementi | Note |
|---|---|---|
| `abbina_sicurezza-e-comportamento-online.json` | 26 coppie in 7 set | `{id, module, type:"matching", difficulty:"easy", sets}` |
| `completa_la_frase_sicurezza-e-comportamento-online.json` | 49 elementi | Ogni item con `{id, module, type:"fillblank", difficulty:"easy", sentence, answer, bank}` |
| `quiz_sicurezza-e-comportamento-online.json` | 50 elementi | id 1–50 |
| `speedquiz_sicurezza-e-comportamento-online.json` | 50 elementi | Identico a quiz, `type: "quiz"` |
| `vero_o_falso_sicurezza-e-comportamento-online.json` | 36 elementi (24 vere / 12 false) | id 1–36, `type: "truefalse"` |

## Note operative
- Nessun personaggio narrativo (Marco) presente nei contenuti generati: tutti gli scenari sono stati generalizzati e verificati anche con un controllo testuale aggiuntivo su tutti i file.
- Le persone, aziende e organizzazioni reali citate come casi documentati (RockYou.com/"igigi"/rockyou.txt, Mat Honan/Amazon-Apple, John Podesta/Fancy Bear, WannaCry/EternalBlue/NSA/NHS, Virginia Shea/IETF RFC 1855) sono state mantenute, trattandosi di soggetti reali di casi storici presenti nel PDF.
- Tutti i distrattori sono stati ricavati esclusivamente da concetti, date, aziende e nomi propri realmente presenti nel PDF.
- Le affermazioni false del vero/falso sono state costruite invertendo relazioni reali del PDF (es. cifratura delle password RockYou, bersaglio dell'ingegneria sociale, causa dell'attacco a Mat Honan, reazione del supporto informatico nel caso Podesta, comportamento di virus vs ransomware, disponibilità della patch Microsoft prima di WannaCry, natura non legale della netiquette, metafora scambiata tra password ed email), senza introdurre concetti esterni.
- Nota sul primo tentativo: un PDF caricato in precedenza in questa conversazione (Modulo4_Software.pdf) non corrispondeva alla chiave `sicurezza-e-comportamento-online` richiesta; la generazione è stata sospesa fino alla ricezione del PDF corretto, per rispettare la fedeltà alla fonte.
- Validazione automatica eseguita con esito positivo su tutti e 5 i file: nessun duplicato, id progressivi, `correctIndex` in range 0–3, 4 opzioni uniche per quiz, risposta sempre presente nella bank, campo booleano corretto per vero/falso, contenuto quiz/speedquiz identico, chiave modulo conforme a `aree_e_moduli.md`, e presenza corretta di id/module/type/difficulty su tutti i file.

## Stato area Online Essentials
Con questo modulo si completa l'intera area **Online Essentials** (4/4 moduli): `rete-e-dati`, `identita-e-comunicazione`, `navigazione-e-tracciamento`, `sicurezza-e-comportamento-online`.
