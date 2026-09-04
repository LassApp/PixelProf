# Check Caricamento JSON — PixelProf

Procedura per verificare via browser (DevTools → Network) che i minigiochi
carichino i JSON dai path corretti (`data/Minigiochi/...`). Da riusare ogni
volta che si caricano nuovi contenuti o si toccano `areas-config.js` /
`game-engine-state.js`.

---

## Procedura (6 punti)

### 1. Apri i DevTools
Nel browser (Chrome/Edge) premi **F12**, oppure tasto destro sulla pagina →
**Ispeziona**. Si apre un pannello: clicca sulla scheda **Network** (Rete)
in alto.

### 2. Filtra solo i file JSON
Nella barra dei filtri del pannello Network scrivi **"json"** (o clicca sul
filtro **Fetch/XHR** se presente). Così vedi solo le richieste ai file
dati, non CSS/immagini/altro.

### 3. Svuota la lista
Clicca l'icona 🚫 (**Clear**) per pulire le richieste precedenti, così è
più facile leggere quelle nuove generate dal test.

### 4. Avvia il gioco da testare
Nell'app, entra nel modulo da verificare e avvia un minigioco (Quiz, Speed
Quiz, Abbina, Completa la frase, Vero o Falso).

### 5. Controlla i path nella colonna Name
Guarda la colonna **Name**: per un modulo con N sotto-moduli dovresti
vedere N richieste, es. per Computer Essentials (4 sotto-moduli):
`quiz_fondamenti-digitali.json`, `quiz_cpu-architettura.json`,
`quiz_memorie.json`, `quiz_software.json`.

Passa il mouse (o clicca) sulla riga per vedere l'URL completo: deve
iniziare con `.../data/Minigiochi/<Area>/<Sotto-Area>/moduloN/...`.

⚠️ Se vedi invece un unico file tipo `.../data/quiz/computer_essentials.json`
(vecchia struttura flat), il fix non è attivo — probabile cache del bundle
vecchia: fai uno svuota-cache duro (**Ctrl+Shift+R** / Ctrl+F5) e ripeti.

### 6. Controlla lo status
Colonna **Status**: deve essere **200** (verde).
- **404** (rosso) → il path è sbagliato o il file non esiste ancora sul
  server. Se il modulo è tra quelli "JSON da realizzare" (vedi tabella
  sotto) è atteso, mostrerà "Errore caricamento" in-app.
- Se un modulo marcato come "pronto" dà 404 → copiare l'URL esatto e
  segnalarlo: è un bug nel path, non un file mancante.

---

## Stato atteso per area (riferimento rapido)

| Area / Modulo ECDL | Sotto-moduli | Path base | Stato atteso |
|---|---|---|---|
| Computer Essentials (CE) | 4 | `data/Minigiochi/ECDL/Computer_Essentials/` | ✅ 200 |
| Online Essentials (OE) | 4 | `data/Minigiochi/ECDL/Online_Essentials/` | ✅ 200 |
| Word Processor (WP) | 5 | `data/Minigiochi/ECDL/Word_Processing/` | ⏳ 404 (JSON da realizzare) |
| Spreadsheets (SS) | 5 | `data/Minigiochi/ECDL/Spreadsheet/` | ⏳ 404 (JSON da realizzare) |
| Power Point (PP) | 3 | `data/Minigiochi/ECDL/Presentation/` | ⏳ 404 (JSON da realizzare) |
| Cybersecurity | 8 | `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/` | ✅ 200 |
| Reti e Internet | 8 | `data/Minigiochi/Reti_e_Internet/` | ✅ 200 |
| Malware e Minacce Informatiche | 1 | `data/Minigiochi/Malware_e_Minacce_Informatiche/` | ✅ 200 |
| Cyberbullismo e Sicurezza Online | 6 | `data/Minigiochi/Cyberbullismo_e_Sicurezza_Online/` *(da confermare)* | 🔒 non selezionabile (`contentReady:false`) |
| Intelligenza Artificiale | 13 | `data/Minigiochi/Intelligenza_Artificiale/` | 🔒 non selezionabile (`contentReady:false`) |

Legenda: ✅ contenuto reale caricato · ⏳ path pronto, JSON in arrivo (mostra
"Errore caricamento" se selezionato) · 🔒 modulo non ancora selezionabile in UI.

---

## Log test

| Data | Area testata | Esito | Note |
|---|---|---|---|
| 2026-09-03 | CE, OE, Cybersecurity, Reti e Internet, Malware, WP | ✅ 6/6 superati | v8.22.0 — fix path `Minigiochi/` + merge multi-file CE/OE |
