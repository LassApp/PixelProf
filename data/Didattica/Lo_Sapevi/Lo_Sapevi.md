# Lo Sapevi?

Questo file è la **fonte ufficiale e vincolante** per Lo Sapevi?: Aree e Moduli coinvolti, Chiavi tecniche, Path base, naming dei file JSON e stato di attivazione.

> **Nota:** Lo Sapevi? non è un mini-gioco, ma un **metodo di apprendimento** che fa parte della didattica di PixelProf, distinto dai mini-giochi (quiz, speedquiz, abbina, completa la frase, vero o falso) e distinto anche da Flip Card, di cui è complementare (stesso principio di card di studio, formato e provenienza dei dati diversi).

> **Nota:** questo file è distinto da `aree_e_moduli.md`. `aree_e_moduli.md` resta l'unica fonte ufficiale per la definizione di Aree, Moduli e Chiavi tecniche del progetto; `Lo_Sapevi.md` riutilizza quelle stesse Chiavi ma definisce path, naming e stato specifici di Lo Sapevi, che possono differire (es. stato di attivazione) da quelli degli altri formati.

> **Nota sulla provenienza dei dati:** ogni scheda Lo Sapevi deriva dal file `vero_o_falso_<chiave>.json` del corrispondente modulo (cartella `data/Minigiochi/...`), trasformato tramite il progetto Claude dedicato "PixelProf — Vero/Falso → Lo Sapevi?". Il campo `source_id` di ogni scheda traccia l'id originale nel file Vero o Falso di provenienza.

> **Nota generale:** `Path base` indica la cartella comune al file del modulo. Il file deve essere caricato direttamente in questa cartella; il nome del file costituisce l'ultima parte del relativo path.

---

## 1. Struttura Lo Sapevi

Sezione dedicata ai file JSON del metodo di apprendimento Lo Sapevi?, un solo file per modulo (a differenza di Flip Card, che ne prevede due per livello di difficoltà). La struttura di Aree, Moduli e Chiavi tecniche è la stessa definita in `aree_e_moduli.md`; cambiano solo il path base (`data/Didattica/Lo_Sapevi/...`) e il naming del file.

**Stato Aree:**
- Tutte le aree: `attivate`
- Contenuto: 58 moduli su 70 realizzati

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
  - File: `lo_sapevi_fondamenti-digitali.json` *(creato)*

- **CPU e architettura**
  - Chiave: `cpu-architettura`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo2/`
  - File: `lo_sapevi_cpu-architettura.json` *(creato)*

- **Memorie**
  - Chiave: `memorie`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo3/`
  - File: `lo_sapevi_memorie.json` *(creato)*

- **Software**
  - Chiave: `software`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Computer_Essentials/Modulo4/`
  - File: `lo_sapevi_software.json` *(creato)*

#### Online Essentials

- **La rete e i dati**
  - Chiave: `rete-e-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo1/`
  - File: `lo_sapevi_rete-e-dati.json` *(creato)*

- **Identità e comunicazione**
  - Chiave: `identita-e-comunicazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo2/`
  - File: `lo_sapevi_identita-e-comunicazione.json` *(creato)*

- **Navigazione e tracciamento**
  - Chiave: `navigazione-e-tracciamento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo3/`
  - File: `lo_sapevi_navigazione-e-tracciamento.json` *(creato)*

- **Sicurezza e comportamento online**
  - Chiave: `sicurezza-e-comportamento-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Essentials/Modulo4/`
  - File: `lo_sapevi_sicurezza-e-comportamento-online.json` *(creato)*

#### Word Processing

- **Word e ambiente**
  - Chiave: `word-e-ambiente`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo1/`
  - File: `lo_sapevi_word-e-ambiente.json` *(creato)*

- **Scrivere e salvare**
  - Chiave: `scrivere-e-salvare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo2/`
  - File: `lo_sapevi_scrivere-e-salvare.json` *(creato)*

- **Formattare il testo**
  - Chiave: `formattare-il-testo`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo3/`
  - File: `lo_sapevi_formattare-il-testo.json` *(creato)*

- **Elementi grafici**
  - Chiave: `elementi-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo4/`
  - File: `lo_sapevi_elementi-grafici.json` *(creato)*

- **Strutturare il documento**
  - Chiave: `strutturare-il-documento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Word_Processing/Modulo5/`
  - File: `lo_sapevi_strutturare-il-documento.json` *(creato)*

#### Spreadsheet

- **Excel e l'ambiente di lavoro**
  - Chiave: `excel-e-l-ambiente-di-lavoro`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo1/`
  - File: `lo_sapevi_excel-e-l-ambiente-di-lavoro.json` *(creato)*

- **Inserire e gestire i dati**
  - Chiave: `inserire-e-gestire-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo2/`
  - File: `lo_sapevi_inserire-e-gestire-i-dati.json` *(creato)*

- **Formattare il foglio**
  - Chiave: `formattare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo3/`
  - File: `lo_sapevi_formattare-il-foglio.json` *(creato)*

- **Formule e calcoli**
  - Chiave: `formule-e-calcoli`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo4/`
  - File: `lo_sapevi_formule-e-calcoli.json` *(creato)*

- **Organizzare e visualizzare i dati**
  - Chiave: `organizzare-e-visualizzare-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo5/`
  - File: `lo_sapevi_organizzare-e-visualizzare-i-dati.json` *(creato)*

- **Preparare e stampare il foglio**
  - Chiave: `preparare-e-stampare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Spreadsheet/Modulo6/`
  - File: `lo_sapevi_preparare-e-stampare-il-foglio.json` *(creato)*

#### Presentation

- **Creare una presentazione**
  - Chiave: `creare-una-presentazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo1/`
  - File: `lo_sapevi_creare-una-presentazione.json` *(creato)*

- **Oggetti grafici**
  - Chiave: `oggetti-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo2/`
  - File: `lo_sapevi_oggetti-grafici.json` *(creato)*

- **Preparare e presentare**
  - Chiave: `preparare-e-presentare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Presentation/Modulo3/`
  - File: `lo_sapevi_preparare-e-presentare.json` *(creato)*

#### IT Security

- **Fondamenti della sicurezza**
  - Chiave: `fondamenti-sicurezza`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/IT_Security/Modulo1/`
  - File: `lo_sapevi_fondamenti-sicurezza.json` *(da creare)*

- **Il malware**
  - Chiave: `malware`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/IT_Security/Modulo2/`
  - File: `lo_sapevi_malware.json` *(da creare)*

- **Reti e accessi**
  - Chiave: `reti-e-accessi`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/IT_Security/Modulo3/`
  - File: `lo_sapevi_reti-e-accessi.json` *(da creare)*

- **Navigazione e comunicazione sicura**
  - Chiave: `navigazione-e-comunicazione-sicura`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/IT_Security/Modulo4/`
  - File: `lo_sapevi_navigazione-e-comunicazione-sicura.json` *(da creare)*

- **Protezione e conservazione dei dati**
  - Chiave: `protezione-e-conservazione-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/IT_Security/Modulo5/`
  - File: `lo_sapevi_protezione-e-conservazione-dati.json` *(da creare)*

#### Online Collaboration

- **Collaborazione online**
  - Chiave: `collaborazione-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo1/`
  - File: `lo_sapevi_collaborazione-online.json` *(da creare)*

- **Cloud e preparazione**
  - Chiave: `cloud-e-preparazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo2/`
  - File: `lo_sapevi_cloud-e-preparazione.json` *(da creare)*

- **Storage e produttività online**
  - Chiave: `storage-e-produttivita-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo3/`
  - File: `lo_sapevi_storage-e-produttivita-online.json` *(da creare)*

- **Calendari e riunioni online**
  - Chiave: `calendari-e-riunioni-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo4/`
  - File: `lo_sapevi_calendari-e-riunioni-online.json` *(da creare)*

- **Social e apprendimento online**
  - Chiave: `social-e-apprendimento-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo5/`
  - File: `lo_sapevi_social-e-apprendimento-online.json` *(da creare)*

- **Dispositivi mobili e connessioni**
  - Chiave: `dispositivi-mobili-e-connessioni`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo6/`
  - File: `lo_sapevi_dispositivi-mobili-e-connessioni.json` *(da creare)*

- **App e sincronizzazione**
  - Chiave: `app-e-sincronizzazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/ECDL/Online_Collaboration/Modulo7/`
  - File: `lo_sapevi_app-e-sincronizzazione.json` *(da creare)*

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
  - File: `lo_sapevi_cyberbullismo.json` *(creato)*

- **Hate Speech**
  - Chiave: `hate-speech`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo3/`
  - File: `lo_sapevi_hate-speech.json` *(creato)*

- **Sexting e Revenge Porn**
  - Chiave: `sexting-revenge-porn`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo4/`
  - File: `lo_sapevi_sexting-revenge-porn.json` *(creato)*

- **Grooming**
  - Chiave: `grooming`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo5/`
  - File: `lo_sapevi_grooming.json` *(creato)*

- **Cittadinanza Digitale**
  - Chiave: `cittadinanza-digitale`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cyberbullismo_e_Sicurezza_Online/Modulo6/`
  - File: `lo_sapevi_cittadinanza-digitale.json` *(creato)*

---

### 👤 Area Cybersecurity — Non solo antivirus e password

**Stato:** attivo

- **Fondamenti di Cybersecurity**
  - Chiave: `fondamenti-cybersecurity`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/`
  - File: `lo_sapevi_fondamenti-cybersecurity.json` *(creato)*

- **Sicurezza degli Account**
  - Chiave: `sicurezza-account`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/`
  - File: `lo_sapevi_sicurezza-account.json` *(creato)*

- **Protezione dei Dati**
  - Chiave: `protezione-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/`
  - File: `lo_sapevi_protezione-dati.json` *(creato)*

- **Sicurezza Quotidiana**
  - Chiave: `sicurezza-quotidiana`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/`
  - File: `lo_sapevi_sicurezza-quotidiana.json` *(creato)*

- **Sicurezza dei Pagamenti**
  - Chiave: `sicurezza-pagamenti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/`
  - File: `lo_sapevi_sicurezza-pagamenti.json` *(creato)*

- **Privacy e Normative**
  - Chiave: `privacy-normative`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/`
  - File: `lo_sapevi_privacy-normative.json` *(creato)*

- **Sicurezza Online e Social Network**
  - Chiave: `sicurezza-online-social-network`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/`
  - File: `lo_sapevi_sicurezza-online-social-network.json` *(creato)*

- **Nuove Minacce Digitali**
  - Chiave: `nuove-minacce-digitali`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/`
  - File: `lo_sapevi_nuove-minacce-digitali.json` *(creato)*

---

### 🌐 Area Reti e Internet

**Stato:** attivo

- **Le fondamenta delle reti**
  - Chiave: `fondamenta-reti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo1/`
  - File: `lo_sapevi_fondamenta-reti.json` *(creato)*

- **Il protocollo TCP/IP**
  - Chiave: `tcp-ip`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo2/`
  - File: `lo_sapevi_tcp-ip.json` *(creato)*

- **DNS: la rubrica di Internet**
  - Chiave: `dns`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo3/`
  - File: `lo_sapevi_dns.json` *(creato)*

- **Router, Switch e dispositivi di rete**
  - Chiave: `router-switch-dispositivi`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo4/`
  - File: `lo_sapevi_router-switch-dispositivi.json` *(creato)*

- **Wi-Fi e reti wireless**
  - Chiave: `wifi-reti-wireless`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo5/`
  - File: `lo_sapevi_wifi-reti-wireless.json` *(creato)*

- **Cloud Networking**
  - Chiave: `cloud-networking`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo6/`
  - File: `lo_sapevi_cloud-networking.json` *(creato)*

- **VPN e comunicazioni sicure**
  - Chiave: `vpn`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo7/`
  - File: `lo_sapevi_vpn.json` *(creato)*

- **Troubleshooting delle reti**
  - Chiave: `troubleshooting-reti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Reti_e_Internet/Modulo8/`
  - File: `lo_sapevi_troubleshooting-reti.json` *(creato)*

---

### 🦠 Area Malware e Minacce Informatiche

**Stato:** attivo

- **Malware e Minacce Informatiche**
  - Chiave: `malware-e-minacce-informatiche`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Malware_e_Minacce_Informatiche/Modulo1/`
  - File: `lo_sapevi_malware-e-minacce-informatiche.json` *(creato)*

---

### 🤖 Area Intelligenza Artificiale

**Stato:** attivo

- **Cos'è l'AI**
  - Chiave: `cos-e-l-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo1/`
  - File: `lo_sapevi_cos-e-l-ai.json` *(creato)*

- **Come funziona l'AI**
  - Chiave: `come-funziona-l-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo2/`
  - File: `lo_sapevi_come-funziona-l-ai.json` *(creato)*

- **Come funzionano gli LLM**
  - Chiave: `come-funzionano-gli-llm`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo3/`
  - File: `lo_sapevi_come-funzionano-gli-llm.json` *(creato)*

- **AI Generativa**
  - Chiave: `ai-generativa`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo4/`
  - File: `lo_sapevi_ai-generativa.json` *(creato)*

- **Prompt Engineering**
  - Chiave: `prompt-engineering`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo5/`
  - File: `lo_sapevi_prompt-engineering.json` *(creato)*

- **Agenti e Automazione**
  - Chiave: `agenti-automazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo6/`
  - File: `lo_sapevi_agenti-automazione.json` *(creato)*

- **Deepfake e Contenuti Sintetici**
  - Chiave: `deepfake-contenuti-sintetici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo7/`
  - File: `lo_sapevi_deepfake-contenuti-sintetici.json` *(creato)*

- **Provenienza dei Contenuti**
  - Chiave: `provenienza-dei-contenuti`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo8/`
  - File: `lo_sapevi_provenienza-dei-contenuti.json` *(creato)*

- **Verificare l'AI**
  - Chiave: `verificare-l-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo9/`
  - File: `lo_sapevi_verificare-l-ai.json` *(creato)*

- **Etica dell'AI**
  - Chiave: `etica-dell-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo10/`
  - File: `lo_sapevi_etica-dell-ai.json` *(creato)*

- **Bias Algoritmici**
  - Chiave: `bias-algoritmici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo11/`
  - File: `lo_sapevi_bias-algoritmici.json` *(creato)*

- **AI Act**
  - Chiave: `ai-act`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo12/`
  - File: `lo_sapevi_ai-act.json` *(creato)*

- **Il Futuro dell'AI**
  - Chiave: `futuro-dell-ai`
  - Stato: `attivo`
  - Path base: `data/Didattica/Lo_Sapevi/Intelligenza_Artificiale/Modulo13/`
  - File: `lo_sapevi_futuro-dell-ai.json` *(creato)*

---

## 2. Moduli completi e da creare

### 🖥️ ECDL — Computer Essentials — COMPLETO (4/4)
- Modulo 1 — Fondamenti digitali ✅
- Modulo 2 — CPU e architettura ✅
- Modulo 3 — Memorie ✅
- Modulo 4 — Software ✅

### 🖥️ ECDL — Online Essentials — COMPLETO (4/4)
- Modulo 1 — La rete e i dati ✅
- Modulo 2 — Identità e comunicazione ✅
- Modulo 3 — Navigazione e tracciamento ✅
- Modulo 4 — Sicurezza e comportamento online ✅

### 🖥️ ECDL — Word Processing — COMPLETO (5/5)
- Modulo 1 — Word e ambiente ✅
- Modulo 2 — Scrivere e salvare ✅
- Modulo 3 — Formattare il testo ✅
- Modulo 4 — Elementi grafici ✅
- Modulo 5 — Strutturare il documento ✅

### 🖥️ ECDL — Spreadsheet — COMPLETO (6/6)
- Modulo 1 — Excel e l'ambiente di lavoro ✅
- Modulo 2 — Inserire e gestire i dati ✅
- Modulo 3 — Formattare il foglio ✅
- Modulo 4 — Formule e calcoli ✅
- Modulo 5 — Organizzare e visualizzare i dati ✅
- Modulo 6 — Preparare e stampare il foglio ✅

### 🖥️ ECDL — Presentation — COMPLETO (3/3)
- Modulo 1 — Creare una presentazione ✅
- Modulo 2 — Oggetti grafici ✅
- Modulo 3 — Preparare e presentare ✅

### 🔒 ECDL — IT Security — DA CREARE (0/5)
- Modulo 1 — Fondamenti della sicurezza
- Modulo 2 — Il malware
- Modulo 3 — Reti e accessi
- Modulo 4 — Navigazione e comunicazione sicura
- Modulo 5 — Protezione e conservazione dei dati

### ☁️ ECDL — Online Collaboration — DA CREARE (0/7)
- Modulo 1 — Collaborazione online
- Modulo 2 — Cloud e preparazione
- Modulo 3 — Storage e produttività online
- Modulo 4 — Calendari e riunioni online
- Modulo 5 — Social e apprendimento online
- Modulo 6 — Dispositivi mobili e connessioni
- Modulo 7 — App e sincronizzazione

### 🛡️ Cyberbullismo e Sicurezza Online — COMPLETO (6/6)
- Modulo 1 — Identità e reputazione digitale ✅
- Modulo 2 — Cyberbullismo ✅
- Modulo 3 — Hate Speech ✅
- Modulo 4 — Sexting e Revenge Porn ✅
- Modulo 5 — Grooming ✅
- Modulo 6 — Cittadinanza Digitale ✅

### 👤 Cybersecurity — Non solo antivirus e password — COMPLETO (8/8)
- Modulo 1 — Fondamenti di Cybersecurity ✅
- Modulo 2 — Sicurezza degli Account ✅
- Modulo 3 — Protezione dei Dati ✅
- Modulo 4 — Sicurezza Quotidiana ✅
- Modulo 5 — Sicurezza dei Pagamenti ✅
- Modulo 6 — Privacy e Normative ✅
- Modulo 7 — Sicurezza Online e Social Network ✅
- Modulo 8 — Nuove Minacce Digitali ✅

### 🌐 Reti e Internet — COMPLETO (8/8)
- Modulo 1 — Le fondamenta delle reti ✅
- Modulo 2 — Il protocollo TCP/IP ✅
- Modulo 3 — DNS: la rubrica di Internet ✅
- Modulo 4 — Router, Switch e dispositivi di rete ✅
- Modulo 5 — Wi-Fi e reti wireless ✅
- Modulo 6 — Cloud Networking ✅
- Modulo 7 — VPN e comunicazioni sicure ✅
- Modulo 8 — Troubleshooting delle reti ✅

### 🦠 Malware e Minacce Informatiche — COMPLETO (1/1)
- Modulo 1 — Malware e Minacce Informatiche ✅

### 🤖 Intelligenza Artificiale — COMPLETO (13/13)
- Modulo 1 — Cos'è l'AI ✅
- Modulo 2 — Come funziona l'AI ✅
- Modulo 3 — Come funzionano gli LLM ✅
- Modulo 4 — AI Generativa ✅
- Modulo 5 — Prompt Engineering ✅
- Modulo 6 — Agenti e Automazione ✅
- Modulo 7 — Deepfake e Contenuti Sintetici ✅
- Modulo 8 — Provenienza dei Contenuti ✅
- Modulo 9 — Verificare l'AI ✅
- Modulo 10 — Etica dell'AI ✅
- Modulo 11 — Bias Algoritmici ✅
- Modulo 12 — AI Act ✅
- Modulo 13 — Il Futuro dell'AI ✅

---

## 3. Resoconto

| Area / Sotto-area | Moduli | File attesi | Creati | Da creare | Stato area |
|---|---:|---:|---:|---:|---|
| ECDL — Computer Essentials | 4 | 4 | 4 | 0 | completo |
| ECDL — Online Essentials | 4 | 4 | 4 | 0 | completo |
| ECDL — Word Processing | 5 | 5 | 5 | 0 | completo |
| ECDL — Spreadsheet | 6 | 6 | 6 | 0 | completo |
| ECDL — Presentation | 3 | 3 | 3 | 0 | completo |
| ECDL — IT Security | 5 | 5 | 0 | 5 | attivo (da creare) |
| ECDL — Online Collaboration | 7 | 7 | 0 | 7 | attivo (da creare) |
| Cyberbullismo e Sicurezza Online | 6 | 6 | 6 | 0 | completo |
| Cybersecurity — Non solo antivirus e password | 8 | 8 | 8 | 0 | completo |
| Reti e Internet | 8 | 8 | 8 | 0 | completo |
| Malware e Minacce Informatiche | 1 | 1 | 1 | 0 | completo |
| Intelligenza Artificiale | 13 | 13 | 13 | 0 | completo |
| **Totale** | **70** | **70** | **58** | **12** | — |

- **Moduli totali mappati (scope Lo Sapevi):** 70
- **Moduli completi:** 58
- **Moduli da creare:** 12
- **File JSON creati:** 58
- **File JSON da creare:** 12
- **File JSON totali attesi:** 70
