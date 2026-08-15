# Riepilogo — Modulo 4: Sicurezza Quotidiana

**Chiave modulo:** `sicurezza-quotidiana`
**Fonte:** `Modulo4_Sicurezza_Quotidiana.pdf`
**Difficoltà:** `easy` (unica prevista)

Contenuti generati esclusivamente a partire dal PDF ufficiale, senza invenzioni, senza personaggi narrativi (il PDF non ne contiene) e senza informazioni esterne. Il numero di elementi per ciascun mini-gioco riflette la ricchezza reale del materiale, non un valore forzato a 150.

---

## 1. Quiz — `modulo4_quiz.json`
**91 elementi**

Distribuzione per capitolo:
- Smartphone e tablet: 14
- App sicure: 14
- QR Code Malevoli: 12
- Chiavette USB: 12
- Download e Allegati: 16
- Wi-Fi pubblici: 17
- Sicurezza quotidiana (introduzione/chiusura): 6

## 2. SpeedQuiz — `modulo4_speedquiz.json`
**91 elementi** — contenuto identico al Quiz (`"type": "quiz"`), come da vincolo di piattaforma.

## 3. Abbina — `modulo4_abbina.json`
**6 set / 31 coppie termine-definizione**, un set per ciascun capitolo tematico ricco: Smartphone e tablet (5), App sicure (5), QR Code Malevoli (5), Chiavette USB (5), Download e Allegati (5), Wi-Fi pubblici (6).

## 4. Completa la frase — `modulo4_completa_la_frase.json`
**38 elementi**, ciascuno con banca di 4 opzioni (risposta corretta + 3 distrattori tematici).

## 5. Vero o Falso — `modulo4_vero_o_falso.json`
**48 elementi**, con equilibrio tra affermazioni vere e false; le affermazioni false sono ottenute invertendo relazioni realmente presenti nel PDF (es. "la VPN protegge da tutto" → falso), senza introdurre concetti nuovi.

---

## Note tematiche

- **Smartphone e tablet**: tre livelli di sicurezza (accesso, aggiornamenti, consapevolezza), rischio del dispositivo incustodito, metodi di sblocco.
- **App sicure**: store ufficiali, permessi coerenti vs eccessivi, i due esempi reali (app rifiutata in fase di aggiornamento; app malevole rimosse dagli store).
- **QR Code Malevoli**: QR statici vs dinamici, sostituzione fisica del codice, parallelo con le manomissioni dei distributori di carburante.
- **Chiavette USB**: USB baiting, caso storico Stuxnet (2010), buona pratica dell'analisi antivirus preventiva.
- **Download e Allegati**: rischio legato all'apertura e non all'aspetto del file, casi storici ILOVEYOU (2000) e campagne malware via Facebook Messenger.
- **Wi-Fi pubblici**: pacchetti dati, cifratura, sniffer, ruolo (e limiti) della VPN, attacchi evil twin.

## Validazione eseguita
- Nessun ID duplicato o fuori sequenza in nessun file
- `correctIndex` sempre nel range 0–3, opzioni sempre 4 e non duplicate all'interno della stessa domanda
- `bank` sempre di 4 elementi contenente la risposta corretta
- Nessuna domanda/affermazione/frase duplicata all'interno dello stesso file
- Round-trip JSON (dump → load) superato su tutti i file
- Campo `module` verificato su ogni elemento contro la mappa ufficiale (`sicurezza-quotidiana`)
- Quiz e SpeedQuiz verificati come identici elemento per elemento

## Nota tecnica su Abbina
Ho strutturato `modulo4_abbina.json` come **array di oggetti**, ciascuno con `id`, `module`, `type`, `difficulty` e un array `pairs` (invece della struttura a oggetto singolo con `sets` annidati mostrata come esempio nel prompt), per rispettare la regola che vuole questi quattro campi obbligatori su *ogni* elemento generato. Se i Moduli 1–3 usano una struttura diversa per l'abbina, segnalamelo e allineo il formato.
