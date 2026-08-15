# Riepilogo — Modulo 6: Privacy e Normative

**Chiave modulo:** `privacy-normative`
**Fonte:** `Modulo6_Privacy_e_Normative.pdf`
**Difficoltà:** `easy` (unica prevista)

Contenuti generati esclusivamente a partire dal PDF ufficiale, senza invenzioni e senza informazioni esterne.

**Nota sui personaggi narrativi:** l'unico personaggio con nome proprio nel PDF ("Erasmo", nell'esempio della reception della palestra nel capitolo sui cookie) è stato generalizzato in una situazione senza nome, come richiesto dal prompt master. Gli altri riferimenti a fatti reali — Cambridge Analytica (2018), le sanzioni GDPR del 2023, Netflix e Amazon come esempio di profilazione — sono stati mantenuti in quanto casi di cronaca citati dal modulo stesso, non personaggi narrativi.

**Nota sui temi sensibili:** i capitoli su Profilazione e Chat Control toccano argomenti delicati (bolle di filtraggio politiche, dibattito UE sicurezza vs. privacy). I contenuti generati rispecchiano fedelmente il taglio neutrale ed equilibrato già adottato dal PDF stesso — che presenta le tensioni in gioco senza schierarsi — senza aggiungere opinioni. Nell'esempio del modulo sulle filter bubble, l'orientamento politico specifico usato come illustrazione nel PDF è stato reso generico ("un determinato orientamento") per mantenere la massima neutralità, senza alterare il meccanismo descritto (bolla di filtraggio / echo chamber).

---

## 1. Quiz — `modulo6_quiz.json`
**98 elementi**

Distribuzione per capitolo:
- Privacy digitale (introduzione): 5
- Dati personali: 15
- GDPR: 17
- Cookie e tracciamento: 15
- Profilazione: 14
- Diritti digitali: 15
- Chat Control: 14
- Breve chiusura: 3

## 2. SpeedQuiz — `modulo6_speedquiz.json`
**98 elementi** — contenuto identico al Quiz (`"type": "quiz"`), come da vincolo di piattaforma.

## 3. Abbina — `modulo6_abbina.json`
**6 set / 30 coppie termine-definizione**: Dati personali, GDPR, Cookie e tracciamento, Profilazione, Diritti digitali, Chat Control (5 coppie ciascuno).

## 4. Completa la frase — `modulo6_completa_la_frase.json`
**46 elementi**, ciascuno con banca di 4 opzioni.

## 5. Vero o Falso — `modulo6_vero_o_falso.json`
**55 elementi**, con equilibrio tra affermazioni vere e false ottenute invertendo relazioni realmente presenti nel PDF.

---

## Note tematiche

- **Dati personali**: distinzione tra dati direttamente identificativi e indiretti, principio di finalità, caso Cambridge Analytica (2018), metafora della biblioteca.
- **GDPR**: anno di entrata in vigore (2018), i tre principi (trasparenza, minimizzazione, responsabilità), i diritti dei cittadini, sanzioni del 2023.
- **Cookie e tracciamento**: HTTP cookie, identificatore, cookie di prima vs terza parte, banner dei cookie.
- **Profilazione**: processo predittivo, filter bubble ed echo chamber, esempio Netflix/Amazon.
- **Diritti digitali**: le sei leve di controllo (accesso, rettifica, oblio, portabilità, opposizione, limitazione del trattamento).
- **Chat Control**: definizione, crittografia end-to-end, tensione sicurezza/privacy, function creep, esempio della fotografia medica al pediatra.

## Validazione eseguita
- Nessun ID duplicato o fuori sequenza in nessun file
- `correctIndex` sempre nel range 0–3, opzioni sempre 4 e non duplicate all'interno della stessa domanda
- `bank` sempre di 4 elementi contenente la risposta corretta
- Nessuna domanda/affermazione/frase duplicata all'interno dello stesso file
- Round-trip JSON (dump → load) superato su tutti i file
- Campo `module` verificato su ogni elemento contro la mappa ufficiale (`privacy-normative`)
- Quiz e SpeedQuiz verificati come identici elemento per elemento

## Nota tecnica su Abbina
Come per i Moduli 4 e 5, `modulo6_abbina.json` è strutturato come array di oggetti (`id`, `module`, `type`, `difficulty`, `pairs`).
