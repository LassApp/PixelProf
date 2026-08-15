# Riepilogo — Modulo 7: Sicurezza Online e Social Network

**Chiave modulo:** `sicurezza-online-social-network`
**Fonte:** `Modulo7_Sicurezza_Online_e_Social_Network.pdf`
**Difficoltà:** `easy` (unica prevista)

Contenuti generati esclusivamente a partire dal PDF ufficiale, senza invenzioni e senza informazioni esterne.

**Nota sui personaggi narrativi:** i personaggi con nome proprio usati dal PDF negli esempi quotidiani ("Marco" nel furto di identità, "Giulia" negli account compromessi, "Luca" e "Sara" nella reputazione digitale, oltre al profilo anonimo con nickname "@marti.travel" nel capitolo sull'oversharing) sono stati generalizzati in scenari senza nome, come richiesto dal prompt master.

**Nota sui riferimenti reali mantenuti:** Cambridge Analytica (2018), il caso Amouranth (2022), gli account Twitter compromessi nel 2020 (Elon Musk, Barack Obama, Bill Gates), la violazione dati di Twitch (2021) e il caso Roseanne Barr (2018) sono episodi di cronaca reale citati esplicitamente dal PDF come casi di studio, non personaggi narrativi: sono stati mantenuti fedelmente, così come il riferimento al libro *La psicologia dei soldi* di Morgan Housel usato come fonte dell'analogia del "paradosso dell'auto".

**Nota sul capitolo Oversharing:** lo scenario di deanonimizzazione (tag di localizzazione, foto ospedaliera, riconoscimento di un monumento) è presentato dal PDF stesso in chiave di sensibilizzazione ai rischi, non come guida operativa. I contenuti generati riflettono lo stesso registro: testano la comprensione del concetto (perché la combinazione di dettagli è rischiosa) senza aggiungere alcun dettaglio tecnico ulteriore rispetto a quanto già presente nel PDF.

---

## 1. Quiz — `modulo7_quiz.json`
**88 elementi**

Distribuzione per capitolo:
- Introduzione (generale): 5
- Social media: 15
- Oversharing: 18
- Furto di identità: 15
- Account compromessi: 15
- Reputazione digitale: 16
- Breve chiusura: 4

## 2. SpeedQuiz — `modulo7_speedquiz.json`
**88 elementi** — contenuto identico al Quiz (`"type": "quiz"`), come da vincolo di piattaforma.

## 3. Abbina — `modulo7_abbina.json`
**6 set / 30 coppie termine-definizione**: Social media, Oversharing, Furto di identità, Account compromessi, Reputazione digitale, Generale/Chiusura (5 coppie ciascuno).

## 4. Completa la frase — `modulo7_completa_la_frase.json`
**42 elementi**, ciascuno con banca di 4 opzioni.

## 5. Vero o Falso — `modulo7_vero_o_falso.json`
**50 elementi**, con equilibrio tra affermazioni vere e false ottenute invertendo relazioni realmente presenti nel PDF.

---

## Note tematiche

- **Social media**: raccolta dati tramite interazioni (like, ricerche, tempo di visione), "paradosso dell'auto" di Morgan Housel, caso Cambridge Analytica.
- **Oversharing**: ricostruzione dell'identità tramite dettagli combinati (tag di luogo, foto ospedaliera), caso Amouranth.
- **Furto di identità**: origine del furto (dati pubblici, phishing, violazioni), caso degli account Twitter compromessi nel 2020.
- **Account compromessi**: cause, segnali di allarme, azioni da compiere, caso Twitch (2021).
- **Reputazione digitale**: memoria lunga di Internet, domanda-guida prima di pubblicare, caso Roseanne Barr (2018).

## Validazione eseguita
- Nessun ID duplicato o fuori sequenza in nessun file
- `correctIndex` sempre nel range 0–3, opzioni sempre 4 e non duplicate all'interno della stessa domanda
- `bank` sempre di 4 elementi contenente la risposta corretta
- Nessuna domanda/affermazione/frase duplicata all'interno dello stesso file
- Round-trip JSON (dump → load) superato su tutti i file
- Campo `module` verificato su ogni elemento contro la mappa ufficiale (`sicurezza-online-social-network`)
- Quiz e SpeedQuiz verificati come identici elemento per elemento

## Nota tecnica su Abbina
Come per i moduli precedenti, `modulo7_abbina.json` è strutturato come array di oggetti (`id`, `module`, `type`, `difficulty`, `pairs`).
