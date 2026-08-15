# Riepilogo — Modulo 8: Nuove Minacce Digitali

**Chiave modulo:** `nuove-minacce-digitali`
**Fonte:** `Modulo8_Nuove_Minacce_Digitali.pdf`
**Difficoltà:** `easy` (unica prevista)

Contenuti generati esclusivamente a partire dal PDF ufficiale, senza invenzioni e senza informazioni esterne.

**Nota etica importante — caso reale del 2025 (capitolo Deepfake):** il PDF cita, con nome e cognome, una ragazza italiana di 19 anni vittima di immagini pornografiche false create con l'AI a partire da sue fotografie pubblicate sui social, poi diffuse con dati personali e messaggi offensivi. Si tratta di una vittima reale e identificabile di abuso di immagini a sfondo sessuale non consensuali. Per non contribuire a un'ulteriore diffusione della sua identità in un nuovo contesto — un database di quiz che potrebbe essere consultato da molti studenti — **il nome reale non è mai stato riportato in nessuno dei file generati**: la persona è descritta genericamente come "una giovane italiana di 19 anni" o "la vittima". Il valore didattico dell'esempio (bastano poche fotografie pubblicate online per diventare bersaglio di un deepfake, e il danno psicologico è reale anche se le immagini sono false) è stato pienamente preservato. Ho aggiunto un controllo automatico nello script di generazione che verifica l'assenza del nome reale in ogni elemento prodotto, in tutti e cinque i file.

Gli altri riferimenti a persone pubbliche e fatti reali (le immagini AI dell'arresto di Donald Trump nel 2023, la telefonata deepfake su Joe Biden nel 2024, il caso Silicon Valley Bank nel 2023, SynthID di Google) sono episodi di cronaca ampiamente documentati citati dal PDF come casi di studio, trattati in modo fattuale e neutro, così come li presenta il modulo stesso.

---

## 1. Quiz — `modulo8_quiz.json`
**83 elementi**

Distribuzione per capitolo:
- Introduzione (generale): 4
- AI generativa: 13
- Deepfake: 16
- Clonazione vocale: 14
- Contenuti sintetici: 8
- Fake news: 15
- Identificazione dei contenuti AI: 9
- Breve chiusura: 4

## 2. SpeedQuiz — `modulo8_speedquiz.json`
**83 elementi** — contenuto identico al Quiz (`"type": "quiz"`), come da vincolo di piattaforma.

## 3. Abbina — `modulo8_abbina.json`
**6 set / 30 coppie termine-definizione**: AI generativa, Deepfake, Clonazione vocale, Contenuti sintetici, Fake news, Identificazione dei contenuti AI (5 coppie ciascuno).

## 4. Completa la frase — `modulo8_completa_la_frase.json`
**42 elementi**, ciascuno con banca di 4 opzioni.

## 5. Vero o Falso — `modulo8_vero_o_falso.json`
**48 elementi**, con equilibrio tra affermazioni vere e false ottenute invertendo relazioni realmente presenti nel PDF.

---

## Note tematiche

- **AI generativa**: differenza rispetto a un motore di ricerca, funzionamento di ChatGPT, metafora dello chef.
- **Deepfake**: definizione, usi legittimi vs. rischi, caso Trump 2023, caso di deepfake pornografico 2025 (anonimizzato).
- **Clonazione vocale**: truffe telefoniche, verifica su secondo canale, caso della telefonata deepfake su Biden (2024).
- **Contenuti sintetici**: categoria più ampia dei deepfake, usi legittimi, importanza di verificare la fonte.
- **Fake news**: leva emotiva, ruolo dell'AI, caso Silicon Valley Bank (marzo 2023).
- **Identificazione dei contenuti AI**: SynthID, filigrana digitale, limiti dello strumento.

## Validazione eseguita
- Nessun ID duplicato o fuori sequenza in nessun file
- `correctIndex` sempre nel range 0–3, opzioni sempre 4 e non duplicate all'interno della stessa domanda
- `bank` sempre di 4 elementi contenente la risposta corretta
- Nessuna domanda/affermazione/frase duplicata all'interno dello stesso file
- Round-trip JSON (dump → load) superato su tutti i file
- Campo `module` verificato su ogni elemento contro la mappa ufficiale (`nuove-minacce-digitali`)
- Quiz e SpeedQuiz verificati come identici elemento per elemento
- **Controllo automatico aggiuntivo**: verifica che il nome reale della vittima del caso 2025 non compaia in nessun elemento di nessun file

## Nota tecnica su Abbina
Come per i moduli precedenti, `modulo8_abbina.json` è strutturato come array di oggetti (`id`, `module`, `type`, `difficulty`, `pairs`).
