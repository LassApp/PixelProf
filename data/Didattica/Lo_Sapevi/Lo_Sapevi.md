# Lo Sapevi?

Questo file è la **fonte ufficiale e vincolante** per Lo Sapevi?: Aree e Moduli coinvolti, Chiavi tecniche, Path base, naming dei file JSON e stato di attivazione.

> **Nota:** Lo Sapevi? non è un mini-gioco, ma un **metodo di apprendimento** che fa parte della didattica di PixelProf, distinto dai mini-giochi (quiz, speedquiz, abbina, completa la frase, vero o falso) e distinto anche da Flip Card, di cui è complementare (stesso principio di card di studio, formato e provenienza dei dati diversi).

> **Nota:** questo file è distinto da `aree_e_moduli.md`. `aree_e_moduli.md` resta l'unica fonte ufficiale per la definizione di Aree, Moduli e Chiavi tecniche del progetto; `Lo_Sapevi.md` riutilizza quelle stesse Chiavi ma definisce path, naming e stato specifici di Lo Sapevi, che possono differire (es. stato di attivazione) da quelli degli altri formati.

> **Nota sulla provenienza dei dati:** ogni scheda Lo Sapevi deriva dal file `vero_o_falso_<chiave>.json` del corrispondente modulo (cartella `data/Minigiochi/...`), trasformato tramite il progetto Claude dedicato "PixelProf — Vero/Falso → Lo Sapevi?". Il campo `source_id` di ogni scheda traccia l'id originale nel file Vero o Falso di provenienza.

> **Nota generale:** `Path base` indica la cartella comune al file del modulo. Il file deve essere caricato direttamente in questa cartella; il nome del file costituisce l'ultima parte del relativo path.

> **Nota sullo scope:** la sotto-area **ECDL — IT Security** non è inclusa in questo file: non esiste ancora un file `vero_o_falso` sorgente per quella sotto-area, quindi al momento non è possibile generare schede Lo Sapevi per essa. Verrà aggiunta quando il minigioco Vero o Falso sarà disponibile anche lì.

---

## 1. Struttura Lo Sapevi

Sezione dedicata ai file JSON del metodo di apprendimento Lo Sapevi?, un solo file per modulo (a differenza di Flip Card, che ne prevede due per livello di difficoltà). La struttura di Aree, Moduli e Chiavi tecniche è la stessa definita in `aree_e_moduli.md`; cambiano solo il path base (`data/Didattica/Lo_Sapevi/...`) e il naming del file.

**Stato Aree:**
- Tutte le aree: `attivate` (tranne ECDL — IT Security, fuori scope)
- Contenuto: 1 modulo su 58 realizzato

**Esempio di struttura path:**

```text
data/
└── Didattica/
    └── Lo_Sapevi/
        └── Cyberbullismo_e_Sicurezza_Online/
             └── Modulo1/
                          lo_sapevi_identita-reputazione-digitale.json
```

---

### 🖥️ Area ECDL

**Stato:** attivo

#### Computer Essentials

- **Fondamenti digitali**
  - Chiave: `fondamenti-digitali`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo1/`
  - File: `lo_sapevi_fondamenti-digitali.json` *(da creare)*

- **CPU e architettura**
  - Chiave: `cpu-architettura`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo2/`
  - File: `lo_sapevi_cpu-architettura.json` *(da creare)*

- **Memorie**
  - Chiave: `memorie`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo3/`
  - File: `lo_sapevi_memorie.json` *(da creare)*

- **Software**
  - Chiave: `software`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo4/`
  - File: `lo_sapevi_software.json` *(da creare)*

#### Online Essentials

- **La rete e i dati**
  - Chiave: `rete-e-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo1/`
  - File: `lo_sapevi_rete-e-dati.json` *(da creare)*

- **Identità e comunicazione**
  - Chiave: `identita-e-comunicazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo2/`
  - File: `lo_sapevi_identita-e-comunicazione.json` *(da creare)*

- **Navigazione e tracciamento**
  - Chiave: `navigazione-e-tracciamento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo3/`
  - File: `lo_sapevi_navigazione-e-tracciamento.json` *(da creare)*

- **Sicurezza e comportamento online**
  - Chiave: `sicurezza-e-comportamento-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo4/`
  - File: `lo_sapevi_sicurezza-e-comportamento-online.json` *(da creare)*

#### Word Processing

- **Word e ambiente**
  - Chiave: `word-e-ambiente`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo1/`
  - File: `lo_sapevi_word-e-ambiente.json` *(da creare)*

- **Scrivere e salvare**
  - Chiave: `scrivere-e-salvare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo2/`
  - File: `lo_sapevi_scrivere-e-salvare.json` *(da creare)*

- **Formattare il testo**
  - Chiave: `formattare-il-testo`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo3/`
  - File: `lo_sapevi_formattare-il-testo.json` *(da creare)*

- **Elementi grafici**
  - Chiave: `elementi-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo4/`
  - File: `lo_sapevi_elementi-grafici.json` *(da creare)*

- **Strutturare il documento**
  - Chiave: `strutturare-il-documento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo5/`
  - File: `lo_sapevi_strutturare-il-documento.json` *(da creare)*

#### Spreadsheet

- **Excel e l'ambiente di lavoro**
  - Chiave: `excel-e-l-ambiente-di-lavoro`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo1/`
  - File: `lo_sapevi_excel-e-l-ambiente-di-lavoro.json` *(da creare)*

- **Inserire e gestire i dati**
  - Chiave: `inserire-e-gestire-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo2/`
  - File: `lo_sapevi_inserire-e-gestire-i-dati.json` *(da creare)*

- **Formattare il foglio**
  - Chiave: `formattare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo3/`
  - File: `lo_sapevi_formattare-il-foglio.json` *(da creare)*

- **Formule e calcoli**
  - Chiave: `formule-e-calcoli`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo4/`
  - File: `lo_sapevi_formule-e-calcoli.json` *(da creare)*

- **Organizzare e visualizzare i dati**
  - Chiave: `organizzare-e-visualizzare-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo5/`
  - File: `lo_sapevi_organizzare-e-visualizzare-i-dati.json` *(da creare)*

- **Preparare e stampare il foglio**
  - Chiave: `preparare-e-stampare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo6/`
  - File: `lo_sapevi_preparare-e-stampare-il-foglio.json` *(da creare)*

#### Presentation

- **Creare una presentazione**
  - Chiave: `creare-una-presentazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo1/`
  - File: `lo_sapevi_creare-una-presentazione.json` *(da creare)*

- **Oggetti grafici**
  - Chiave: `oggetti-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo2/`
  - File: `lo_sapevi_oggetti-grafici.json` *(da creare)*

- **Preparare e presentare**
  - Chiave: `preparare-e-presentare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo3/`
  - File: `lo_sapevi_preparare-e-presentare.json` *(da creare)*

---

### 🛡️ Area Cyberbullismo e Sicurezza Online

**Stato:** attivo

- **Identità e reputazione digitale**
  - Chiave: `identita-reputazione-digitale`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo1/`
  - File: `lo_sapevi_identita-reputazione-digitale.json` *(creato — 38 schede)*

- **Cyberbullismo**
  - Chiave: `cyberbullismo`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo2/`
  - File: `lo_sapevi_cyberbullismo.json` *(da creare)*

- **Hate Speech**
  - Chiave: `hate-speech`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo3/`
  - File: `lo_sapevi_hate-speech.json` *(da creare)*

- **Sexting e Revenge Porn**
  - Chiave: `sexting-revenge-porn`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo4/`
  - File: `lo_sapevi_sexting-revenge-porn.json` *(da creare)*

- **Grooming**
  - Chiave: `grooming`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo5/`
  - File: `lo_sapevi_grooming.json` *(da creare)*

- **Cittadinanza Digitale**
  - Chiave: `cittadinanza-digitale`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo6/`
  - File: `lo_sapevi_cittadinanza-digitale.json` *(da creare)*

---

### 👤 Area Cybersecurity — Non solo antivirus e password

**Stato:** attivo

- **Fondamenti di Cybersecurity**
  - Chiave: `fondamenti-cybersecurity`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/`
  - File: `lo_sapevi_fondamenti-cybersecurity.json` *(da creare)*

- **Sicurezza degli Account**
  - Chiave: `sicurezza-account`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/`
  - File: `lo_sapevi_sicurezza-account.json` *(da creare)*

- **Protezione dei Dati**
  - Chiave: `protezione-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/`
  - File: `lo_sapevi_protezione-dati.json` *(da creare)*

- **Sicurezza Quotidiana**
  - Chiave: `sicurezza-quotidiana`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/`
  - File: `lo_sapevi_sicurezza-quotidiana.json` *(da creare)*

- **Sicurezza dei Pagamenti**
  - Chiave: `sicurezza-pagamenti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/`
  - File: `lo_sapevi_sicurezza-pagamenti.json` *(da creare)*

- **Privacy e Normative**
  - Chiave: `privacy-normative`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/`
  - File: `lo_sapevi_privacy-normative.json` *(da creare)*

- **Sicurezza Online e Social Network**
  - Chiave: `sicurezza-online-social-network`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/`
  - File: `lo_sapevi_sicurezza-online-social-network.json` *(da creare)*

- **Nuove Minacce Digitali**
  - Chiave: `nuove-minacce-digitali`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/`
  - File: `lo_sapevi_nuove-minacce-digitali.json` *(da creare)*

---

### 🌐 Area Reti e Internet

**Stato:** attivo

- **Le fondamenta delle reti**
  - Chiave: `fondamenta-reti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo1/`
  - File: `lo_sapevi_fondamenta-reti.json` *(da creare)*

- **Il protocollo TCP/IP**
  - Chiave: `tcp-ip`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo2/`
  - File: `lo_sapevi_tcp-ip.json` *(da creare)*

- **DNS: la rubrica di Internet**
  - Chiave: `dns`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo3/`
  - File: `lo_sapevi_dns.json` *(da creare)*

- **Router, Switch e dispositivi di rete**
  - Chiave: `router-switch-dispositivi`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo4/`
  - File: `lo_sapevi_router-switch-dispositivi.json` *(da creare)*

- **Wi-Fi e reti wireless**
  - Chiave: `wifi-reti-wireless`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo5/`
  - File: `lo_sapevi_wifi-reti-wireless.json` *(da creare)*

- **Cloud Networking**
  - Chiave: `cloud-networking`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo6/`
  - File: `lo_sapevi_cloud-networking.json` *(da creare)*

- **VPN e comunicazioni sicure**
  - Chiave: `vpn`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo7/`
  - File: `lo_sapevi_vpn.json` *(da creare)*

- **Troubleshooting delle reti**
  - Chiave: `troubleshooting-reti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo8/`
  - File: `lo_sapevi_troubleshooting-reti.json` *(da creare)*

---

### 🦠 Area Malware e Minacce Informatiche

**Stato:** attivo

- **Malware e Minacce Informatiche**
  - Chiave: `malware-e-minacce-informatiche`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Malware_e_Minacce_Informatiche/Modulo1/`
  - File: `lo_sapevi_malware-e-minacce-informatiche.json` *(da creare)*

---

### 🤖 Area Intelligenza Artificiale

**Stato:** attivo

- **Cos'è l'AI**
  - Chiave: `cos-e-l-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo1/`
  - File: `lo_sapevi_cos-e-l-ai.json` *(da creare)*

- **Come funziona l'AI**
  - Chiave: `come-funziona-l-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo2/`
  - File: `lo_sapevi_come-funziona-l-ai.json` *(da creare)*

- **Come funzionano gli LLM**
  - Chiave: `come-funzionano-gli-llm`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo3/`
  - File: `lo_sapevi_come-funzionano-gli-llm.json` *(da creare)*

- **AI Generativa**
  - Chiave: `ai-generativa`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo4/`
  - File: `lo_sapevi_ai-generativa.json` *(da creare)*

- **Prompt Engineering**
  - Chiave: `prompt-engineering`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo5/`
  - File: `lo_sapevi_prompt-engineering.json` *(da creare)*

- **Agenti e Automazione**
  - Chiave: `agenti-automazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo6/`
  - File: `lo_sapevi_agenti-automazione.json` *(da creare)*

- **Deepfake e Contenuti Sintetici**
  - Chiave: `deepfake-contenuti-sintetici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo7/`
  - File: `lo_sapevi_deepfake-contenuti-sintetici.json` *(da creare)*

- **Provenienza dei Contenuti**
  - Chiave: `provenienza-dei-contenuti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo8/`
  - File: `lo_sapevi_provenienza-dei-contenuti.json` *(da creare)*

- **Verificare l'AI**
  - Chiave: `verificare-l-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo9/`
  - File: `lo_sapevi_verificare-l-ai.json` *(da creare)*

- **Etica dell'AI**
  - Chiave: `etica-dell-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo10/`
  - File: `lo_sapevi_etica-dell-ai.json` *(da creare)*

- **Bias Algoritmici**
  - Chiave: `bias-algoritmici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo11/`
  - File: `lo_sapevi_bias-algoritmici.json` *(da creare)*

- **AI Act**
  - Chiave: `ai-act`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo12/`
  - File: `lo_sapevi_ai-act.json` *(da creare)*

- **Il Futuro dell'AI**
  - Chiave: `futuro-dell-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo13/`
  - File: `lo_sapevi_futuro-dell-ai.json` *(da creare)*

---

### 🔒 ECDL — IT Security

> **Fuori scope.** Nessun file `vero_o_falso` sorgente disponibile per questa sotto-area (5 moduli pianificati in Flip Card, ma senza minigioco Vero o Falso corrispondente). Nessuna scheda Lo Sapevi può essere generata finché non esisterà il file sorgente.

---

## 2. Moduli completi e da creare

### 🖥️ ECDL — Computer Essentials — DA CREARE (0/4)
- Modulo 1 — Fondamenti digitali
- Modulo 2 — CPU e architettura
- Modulo 3 — Memorie
- Modulo 4 — Software

### 🖥️ ECDL — Online Essentials — DA CREARE (0/4)
- Modulo 1 — La rete e i dati
- Modulo 2 — Identità e comunicazione
- Modulo 3 — Navigazione e tracciamento
- Modulo 4 — Sicurezza e comportamento online

### 🖥️ ECDL — Word Processing — DA CREARE (0/5)
- Modulo 1 — Word e ambiente
- Modulo 2 — Scrivere e salvare
- Modulo 3 — Formattare il testo
- Modulo 4 — Elementi grafici
- Modulo 5 — Strutturare il documento

### 🖥️ ECDL — Spreadsheet — DA CREARE (0/6)
- Modulo 1 — Excel e l'ambiente di lavoro
- Modulo 2 — Inserire e gestire i dati
- Modulo 3 — Formattare il foglio
- Modulo 4 — Formule e calcoli
- Modulo 5 — Organizzare e visualizzare i dati
- Modulo 6 — Preparare e stampare il foglio

### 🖥️ ECDL — Presentation — DA CREARE (0/3)
- Modulo 1 — Creare una presentazione
- Modulo 2 — Oggetti grafici
- Modulo 3 — Preparare e presentare

### 🛡️ Cyberbullismo e Sicurezza Online — PARZIALE (1/6)
- Modulo 1 — Identità e reputazione digitale ✅
- Modulo 2 — Cyberbullismo
- Modulo 3 — Hate Speech
- Modulo 4 — Sexting e Revenge Porn
- Modulo 5 — Grooming
- Modulo 6 — Cittadinanza Digitale

### 👤 Cybersecurity — Non solo antivirus e password — DA CREARE (0/8)
- Modulo 1 — Fondamenti di Cybersecurity
- Modulo 2 — Sicurezza degli Account
- Modulo 3 — Protezione dei Dati
- Modulo 4 — Sicurezza Quotidiana
- Modulo 5 — Sicurezza dei Pagamenti
- Modulo 6 — Privacy e Normative
- Modulo 7 — Sicurezza Online e Social Network
- Modulo 8 — Nuove Minacce Digitali

### 🌐 Reti e Internet — DA CREARE (0/8)
- Modulo 1 — Le fondamenta delle reti
- Modulo 2 — Il protocollo TCP/IP
- Modulo 3 — DNS: la rubrica di Internet
- Modulo 4 — Router, Switch e dispositivi di rete
- Modulo 5 — Wi-Fi e reti wireless
- Modulo 6 — Cloud Networking
- Modulo 7 — VPN e comunicazioni sicure
- Modulo 8 — Troubleshooting delle reti

### 🦠 Malware e Minacce Informatiche — DA CREARE (0/1)
- Modulo 1 — Malware e Minacce Informatiche

### 🤖 Intelligenza Artificiale — DA CREARE (0/13)
- Modulo 1 — Cos'è l'AI
- Modulo 2 — Come funziona l'AI
- Modulo 3 — Come funzionano gli LLM
- Modulo 4 — AI Generativa
- Modulo 5 — Prompt Engineering
- Modulo 6 — Agenti e Automazione
- Modulo 7 — Deepfake e Contenuti Sintetici
- Modulo 8 — Provenienza dei Contenuti
- Modulo 9 — Verificare l'AI
- Modulo 10 — Etica dell'AI
- Modulo 11 — Bias Algoritmici
- Modulo 12 — AI Act
- Modulo 13 — Il Futuro dell'AI

---

## 3. Resoconto

| Area / Sotto-area | Moduli | File attesi | Creati | Da creare | Stato area |
|---|---:|---:|---:|---:|---|
| ECDL — Computer Essentials | 4 | 4 | 0 | 4 | attivo (da creare) |
| ECDL — Online Essentials | 4 | 4 | 0 | 4 | attivo (da creare) |
| ECDL — Word Processing | 5 | 5 | 0 | 5 | attivo (da creare) |
| ECDL — Spreadsheet | 6 | 6 | 0 | 6 | attivo (da creare) |
| ECDL — Presentation | 3 | 3 | 0 | 3 | attivo (da creare) |
| Cyberbullismo e Sicurezza Online | 6 | 6 | 1 | 5 | attivo (in corso) |
| Cybersecurity — Non solo antivirus e password | 8 | 8 | 0 | 8 | attivo (da creare) |
| Reti e Internet | 8 | 8 | 0 | 8 | attivo (da creare) |
| Malware e Minacce Informatiche | 1 | 1 | 0 | 1 | attivo (da creare) |
| Intelligenza Artificiale | 13 | 13 | 0 | 13 | attivo (da creare) |
| ECDL — IT Security | — | — | — | — | fuori scope (nessuna sorgente) |
| **Totale** | **58** | **58** | **1** | **57** | — |

- **Moduli totali mappati (scope Lo Sapevi):** 58
- **Moduli completi:** 1
- **Moduli da creare:** 57
- **File JSON creati:** 1
- **File JSON da creare:** 57
- **File JSON totali attesi:** 58