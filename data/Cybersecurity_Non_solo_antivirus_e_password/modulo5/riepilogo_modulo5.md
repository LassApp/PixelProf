# Riepilogo — Modulo 5: Sicurezza dei Pagamenti

**Chiave modulo:** `sicurezza-pagamenti`
**Fonte:** `Modulo5_Sicurezza_Dei_Pagamenti.pdf`
**Difficoltà:** `easy` (unica prevista)

Contenuti generati esclusivamente a partire dal PDF ufficiale, senza invenzioni e senza informazioni esterne. I personaggi narrativi usati dal PDF negli esempi quotidiani (una persona che acquista online, che riceve un messaggio sospetto, che paga con lo smartphone, ecc.) sono stati generalizzati e non compaiono nei contenuti generati. Le aziende ed episodi reali citati come casi di studio (Colonial Pipeline, Target Corporation, Home Depot, Intesa Sanpaolo, l'episodio delle proteste in Canada, il riferimento alla serie *Better Call Saul*) sono stati mantenuti in quanto fatti reali/di cronaca riportati dal modulo stesso, non personaggi narrativi da generalizzare.

---

## 1. Quiz — `modulo5_quiz.json`
**102 elementi**

Distribuzione per capitolo:
- Sicurezza dei pagamenti (introduzione): 5
- Pagamenti digitali: 15
- Carte di pagamento e protezione dei dati: 16
- Contactless e NFC: 14
- Pagamenti tramite smartphone: 12
- Truffe nei pagamenti online: 13
- Clonazione della carta: 13
- Autenticazione forte e sicurezza bancaria: 14

## 2. SpeedQuiz — `modulo5_speedquiz.json`
**102 elementi** — contenuto identico al Quiz (`"type": "quiz"`), come da vincolo di piattaforma.

## 3. Abbina — `modulo5_abbina.json`
**7 set / 35 coppie termine-definizione**, un set per ciascun capitolo tematico: Pagamenti digitali, Carte di pagamento, Contactless e NFC, Pagamenti tramite smartphone, Truffe nei pagamenti online, Clonazione della carta, Autenticazione forte (5 coppie ciascuno).

## 4. Completa la frase — `modulo5_completa_la_frase.json`
**44 elementi**, ciascuno con banca di 4 opzioni (risposta corretta + 3 distrattori tematici).

## 5. Vero o Falso — `modulo5_vero_o_falso.json`
**54 elementi**, con equilibrio tra affermazioni vere e false; le affermazioni false sono ottenute invertendo relazioni realmente presenti nel PDF (es. "il chip EMV elimina ogni rischio" → falso), senza introdurre concetti nuovi.

---

## Note tematiche

- **Pagamenti digitali**: soggetti coinvolti (circuito, banca, sistema di autorizzazione), vantaggi, casi reali Colonial Pipeline (2021) e proteste dei camionisti in Canada (2022).
- **Carte di pagamento**: le tre tipologie (debito/credito/prepagata), dati sensibili (numero, scadenza, CVV), caso Target Corporation (2013), riferimento a *Better Call Saul*, precauzioni per foto della carta.
- **Contactless e NFC**: funzionamento NFC, tokenizzazione, rischio POS portatili, caso delle vulnerabilità 2019.
- **Pagamenti tramite smartphone**: wallet digitali, token, verifica biometrica, confronto di sicurezza con la carta fisica.
- **Truffe nei pagamenti online**: phishing, ingegneria sociale, strategia della carta prepagata dedicata, caso Intesa Sanpaolo (2022).
- **Clonazione della carta**: skimming, chip EMV, caso Home Depot (2014).
- **Autenticazione forte**: le tre categorie di fattori (SCA), monitoraggio bancario, caso phishing 2023 sui codici OTP.

## Validazione eseguita
- Nessun ID duplicato o fuori sequenza in nessun file
- `correctIndex` sempre nel range 0–3, opzioni sempre 4 e non duplicate all'interno della stessa domanda
- `bank` sempre di 4 elementi contenente la risposta corretta
- Nessuna domanda/affermazione/frase duplicata all'interno dello stesso file
- Round-trip JSON (dump → load) superato su tutti i file
- Campo `module` verificato su ogni elemento contro la mappa ufficiale (`sicurezza-pagamenti`)
- Quiz e SpeedQuiz verificati come identici elemento per elemento

## Nota tecnica su Abbina
Come per il Modulo 4, ho strutturato `modulo5_abbina.json` come array di oggetti (`id`, `module`, `type`, `difficulty`, `pairs`), coerente con lo schema già usato nel modulo precedente.
