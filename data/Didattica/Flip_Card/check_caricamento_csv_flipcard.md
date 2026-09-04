# Check Caricamento CSV Flip Card — PixelProf

Procedura per verificare via browser (DevTools → Network) che Flip Card
(Didattica) carichi i CSV dai path corretti (`data/Didattica/Flip_Card/...`).
Da riusare ogni volta che si caricano nuovi mazzi o si tocca `flip-card.js`.

---

## Procedura (6 punti)

### 1. Apri i DevTools
Nel browser (Chrome/Edge) premi **F12**, oppure tasto destro sulla pagina →
**Ispeziona**. Si apre un pannello: clicca sulla scheda **Network** (Rete)
in alto.

### 2. Filtra solo i file CSV
Nella barra dei filtri del pannello Network scrivi **"csv"** (o clicca sul
filtro **Fetch/XHR** se presente). Così vedi solo le richieste ai file
dati, non CSS/immagini/altro.

### 3. Svuota la lista
Clicca l'icona 🚫 (**Clear**) per pulire le richieste precedenti, così è
più facile leggere quelle nuove generate dal test.

### 4. Avvia Flip Card da testare
Nell'app, entra nel modulo da verificare → scegli **Didattica** (invece di
Minigiochi) → scegli un livello (**Facile** o **Medio**).

### 5. Controlla i path nella colonna Name
Guarda la colonna **Name**: per un modulo con N sotto-argomenti dovresti
vedere N richieste, es. per Computer Essentials Facile (4 sotto-moduli):
`Flip_Card_Facile_Modulo_1.csv`, `..._Modulo_2.csv`, `..._Modulo_3.csv`,
`..._Modulo_4.csv`.

Passa il mouse (o clicca) sulla riga per vedere l'URL completo: deve
iniziare con `.../data/Didattica/Flip_Card/<Area>/<Sotto-Area>/ModuloN/...`.

⚠️ Se l'URL non contiene il segmento **"Didattica/"** (es.
`.../data/Flip_Card/...`), il fix non è attivo — probabile cache del
bundle vecchia: fai uno svuota-cache duro (**Ctrl+Shift+R** / Ctrl+F5) e
ripeti.

### 6. Controlla lo status
Colonna **Status**: deve essere **200** (verde).
- **404** (rosso) → il path è sbagliato o il CSV non esiste ancora sul
  server. Se il modulo è tra quelli "CSV da creare" (vedi tabella sotto)
  è atteso, mostrerà la card "Flip Card non disponibile" in-app (mai un
  errore JS non gestito).
- Se un modulo marcato come "pronto" dà 404 → copiare l'URL esatto e
  segnalarlo: è un bug nel path, non un file mancante.

---

## Stato atteso per area (riferimento rapido)

| Area / Modulo ECDL | Sotto-moduli | Path base | Stato atteso |
|---|---|---|---|
| Computer Essentials (CE) | 4 | `data/Didattica/Flip_Card/ECDL/Computer_Essentials/` | ✅ 200 (8/8 CSV creati) |
| Online Essentials (OE) | 4 | `data/Didattica/Flip_Card/ECDL/Online_Essentials/` | ⏳ 404 (CSV da creare) |
| Word Processor (WP) | 5 | `data/Didattica/Flip_Card/ECDL/Word/` *(non "Word_Processing")* | ⏳ 404 (CSV da creare) |
| Spreadsheets (SS) | 5 | `data/Didattica/Flip_Card/ECDL/Spreadsheet/` | ⏳ 404 (CSV da creare) |
| Power Point (PP) | 3 | `data/Didattica/Flip_Card/ECDL/Presentation/` | ⏳ 404 (CSV da creare) |
| Cybersecurity | 8 | `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/` | ⏳ 404 (CSV da creare) |
| Reti e Internet | 8 | `data/Didattica/Flip_Card/Reti_e_Internet/` | ⏳ 404 (CSV da creare) |
| Malware e Minacce Informatiche | 1 | `data/Didattica/Flip_Card/Malware_e_Minacce_Informatiche/` | ⏳ 404 (CSV da creare) |
| Cyberbullismo e Sicurezza Online | 6 | `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/` | ⏳ 404 (CSV da creare) |
| Intelligenza Artificiale | 13 | `data/Didattica/Flip_Card/Intelligenza_Artificiale/` | ⏳ 404 (CSV da creare) |

Legenda: ✅ contenuto reale caricato · ⏳ path pronto, CSV in arrivo (mostra
"Flip Card non disponibile" se selezionato).

⚠️ **Differenza da tenere a mente rispetto ai minigiochi JSON:** per Flip
Card, tutti i moduli sopra sono già raggiungibili dalla UI (Didattica non
è filtrata da `contentReady` come i minigiochi) — quindi anche i moduli
non ancora "pronti" per i minigiochi (es. Cyberbullismo, Intelligenza
Artificiale) mostrano comunque le card Facile/Medio cliccabili in Flip
Card, che daranno il 404 atteso.

---

## Log test

| Data | Area testata | Esito | Note |
|---|---|---|---|
| — | — | — | v8.23.0 — fix path `Didattica/` mancante + 40 chiavi "terreno pronto" |
