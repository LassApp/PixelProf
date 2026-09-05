# Flip Card

Questo file è la **fonte ufficiale e vincolante** per Flip Card: Aree e Moduli coinvolti, Chiavi tecniche, Path base, naming dei file CSV e stato di attivazione.

> **Nota:** Flip Card non è un mini-gioco, ma un **metodo di apprendimento** che fa parte della didattica di PixelProf, distinto dai mini-giochi (quiz, speedquiz, abbina, completa la frase, vero o falso).

> **Nota:** questo file è distinto da `aree_e_moduli.md`. `aree_e_moduli.md` resta l'unica fonte ufficiale per la definizione di Aree, Moduli e Chiavi tecniche del progetto; `Flip_Card.md` riutilizza quelle stesse Chiavi ma definisce path, naming e stato specifici del mini-gioco Flip Card, che possono differire (es. stato di attivazione) da quelli degli altri mini-giochi.

> **Nota generale:** `Path base` indica la cartella comune ai file del modulo. Ogni file deve essere caricato direttamente in questa cartella; il nome del file costituisce l'ultima parte del relativo path.

---

## 1. Struttura Flip Card

Sezione dedicata ai file CSV del metodo di apprendimento Flip Card, in due livelli di difficoltà (Facile / Medio). La struttura di Aree, Moduli e Chiavi tecniche è la stessa definita in `aree_e_moduli.md`; cambiano solo il path base (`data/Didattica/Flip_Card/...`) e il naming dei file.

**Stato Aree:**
- Tutte le aree: `disattivato`
- Area ECDL: `attivo`

**Esempio di struttura path:**

```text
data/
└── Didattica/
    └── Flip_Card/
        └── ECDL/
             └── Computer_Essentials/
                    └── Modulo1/
                                 Flip_Card_Facile_Modulo_1.csv
                                 Flip_Card_Medio_Modulo_1.csv
```

---

### 🖥️ Area ECDL

**Stato:** attivo

#### Computer Essentials

- **Fondamenti digitali**
  - Chiave: `fondamenti-digitali`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 29 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 47 Flip Card)*

- **CPU e architettura**
  - Chiave: `cpu-architettura`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(creato — 30 Flip Card)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato — 42 Flip Card)*

- **Memorie**
  - Chiave: `memorie`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato — 26 Flip Card)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato — 35 Flip Card)*

- **Software**
  - Chiave: `software`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Computer_Essentials/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato — 21 Flip Card)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato — 30 Flip Card)*

#### Online Essentials

- **La rete e i dati**
  - Chiave: `rete-e-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 23 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 28 Flip Card)*

- **Identità e comunicazione**
  - Chiave: `identita-e-comunicazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Navigazione e tracciamento**
  - Chiave: `navigazione-e-tracciamento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Sicurezza e comportamento online**
  - Chiave: `sicurezza-e-comportamento-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

#### Word

- **Modulo 1 — Word e ambiente**
  - Chiave: `word-e-ambiente`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Modulo 2 — Scrivere e salvare**
  - Chiave: `scrivere-e-salvare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Modulo 3 — Formattare il testo**
  - Chiave: `formattare-il-testo`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Modulo 4 — Elementi grafici**
  - Chiave: `elementi-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Modulo 5 — Strutturare il documento**
  - Chiave: `strutturare-il-documento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

#### Spreadsheet

- **Modulo 1 — Excel e l'ambiente di lavoro**
  - Chiave: `excel-e-l-ambiente-di-lavoro`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Modulo 2 — Inserire e gestire i dati**
  - Chiave: `inserire-e-gestire-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Modulo 3 — Formattare il foglio**
  - Chiave: `formattare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Modulo 4 — Formule e calcoli**
  - Chiave: `formule-e-calcoli`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Modulo 5 — Organizzare e visualizzare i dati**
  - Chiave: `organizzare-e-visualizzare-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

#### Presentation

- **Modulo 1 — Creare una presentazione**
  - Chiave: `creare-una-presentazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Presentation/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Modulo 2 — Oggetti grafici**
  - Chiave: `oggetti-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Presentation/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Modulo 3 — Preparare e presentare**
  - Chiave: `preparare-e-presentare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Presentation/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

---

### 🛡️ Area Cyberbullismo e Sicurezza Online

**Stato:** disattivato

- **Identità e reputazione digitale**
  - Chiave: `identita-reputazione-digitale`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Cyberbullismo**
  - Chiave: `cyberbullismo`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Hate Speech**
  - Chiave: `hate-speech`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Sexting e Revenge Porn**
  - Chiave: `sexting-revenge-porn`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Grooming**
  - Chiave: `grooming`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Cittadinanza Digitale**
  - Chiave: `cittadinanza-digitale`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

---

### 👤 Area Cybersecurity — Non solo antivirus e password

**Stato:** disattivato

- **Fondamenti di Cybersecurity**
  - Chiave: `fondamenti-cybersecurity`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 48 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 44 Flip Card)*

- **Sicurezza degli Account**
  - Chiave: `sicurezza-account`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Protezione dei Dati**
  - Chiave: `protezione-dati`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Sicurezza Quotidiana**
  - Chiave: `sicurezza-quotidiana`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Sicurezza dei Pagamenti**
  - Chiave: `sicurezza-pagamenti`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Privacy e Normative**
  - Chiave: `privacy-normative`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

- **Sicurezza Online e Social Network**
  - Chiave: `sicurezza-online-social-network`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_7.csv` *(csv da creare)*

- **Nuove Minacce Digitali**
  - Chiave: `nuove-minacce-digitali`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_8.csv` *(csv da creare)*

---

### 🌐 Area Reti e Internet

**Stato:** disattivato

- **Le fondamenta delle reti**
  - Chiave: `fondamenta-reti`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 32 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 21 Flip Card)*

- **Il protocollo TCP/IP**
  - Chiave: `tcp-ip`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(creato — 46 Flip Card)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato — 26 Flip Card)*

- **DNS: la rubrica di Internet**
  - Chiave: `dns`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato — 40 Flip Card)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato — 20 Flip Card)*

- **Router, Switch e dispositivi di rete**
  - Chiave: `router-switch-dispositivi`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato — 37 Flip Card)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato — 21 Flip Card)*

- **Wi-Fi e reti wireless**
  - Chiave: `wifi-reti-wireless`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(creato — 51 Flip Card)*
    - `Flip_Card_Medio_Modulo_5.csv` *(creato — 28 Flip Card)*

- **Cloud Networking**
  - Chiave: `cloud-networking`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(creato — 42 Flip Card)*
    - `Flip_Card_Medio_Modulo_6.csv` *(creato — 25 Flip Card)*

- **VPN e comunicazioni sicure**
  - Chiave: `vpn`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(creato — 39 Flip Card)*
    - `Flip_Card_Medio_Modulo_7.csv` *(creato — 18 Flip Card)*

- **Troubleshooting delle reti**
  - Chiave: `troubleshooting-reti`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Reti_e_Internet/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_8.csv` *(csv da creare)*

---

### 🦠 Area Malware e Minacce Informatiche

**Stato:** disattivato

- **Malware e Minacce Informatiche**
  - Chiave: `malware-e-minacce-informatiche`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Malware_e_Minacce_Informatiche/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 33 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 25 Flip Card)*

---

### 🤖 Area Intelligenza Artificiale

**Stato:** disattivato

- **Cos'è l'AI**
  - Chiave: `cos-e-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Come funziona l'AI**
  - Chiave: `come-funziona-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Come funzionano gli LLM**
  - Chiave: `come-funzionano-gli-llm`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **AI Generativa**
  - Chiave: `ai-generativa`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Prompt Engineering**
  - Chiave: `prompt-engineering`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Agenti e Automazione**
  - Chiave: `agenti-automazione`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

- **Deepfake e Contenuti Sintetici**
  - Chiave: `deepfake-contenuti-sintetici`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_7.csv` *(csv da creare)*

- **Provenienza dei Contenuti**
  - Chiave: `provenienza-dei-contenuti`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_8.csv` *(csv da creare)*

- **Verificare l'AI**
  - Chiave: `verificare-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo9/`
  - File:
    - `Flip_Card_Facile_Modulo_9.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_9.csv` *(csv da creare)*

- **Etica dell'AI**
  - Chiave: `etica-dell-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo10/`
  - File:
    - `Flip_Card_Facile_Modulo_10.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_10.csv` *(csv da creare)*

- **Bias Algoritmici**
  - Chiave: `bias-algoritmici`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo11/`
  - File:
    - `Flip_Card_Facile_Modulo_11.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_11.csv` *(csv da creare)*

- **AI Act**
  - Chiave: `ai-act`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo12/`
  - File:
    - `Flip_Card_Facile_Modulo_12.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_12.csv` *(csv da creare)*

- **Il Futuro dell'AI**
  - Chiave: `futuro-dell-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo13/`
  - File:
    - `Flip_Card_Facile_Modulo_13.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_13.csv` *(csv da creare)*

---

## 2. Resoconto

| Area / Sotto-area | Moduli | File attesi | Creati | Da creare | Stato area |
|---|---|---|---|---|---|
| ECDL — Computer Essentials | 4 | 8 | 8 | 0 | attivo |
| ECDL — Online Essentials | 4 | 8 | 2 | 6 | attivo |
| ECDL — Word | 5 | 10 | 0 | 10 | attivo |
| ECDL — Spreadsheet | 5 | 10 | 0 | 10 | attivo |
| ECDL — Presentation | 3 | 6 | 0 | 6 | attivo |
| Cyberbullismo e Sicurezza Online | 6 | 12 | 0 | 12 | disattivato |
| Cybersecurity — Non solo antivirus e password | 8 | 16 | 2 | 14 | disattivato |
| Reti e Internet | 8 | 16 | 14 | 2 | disattivato |
| Malware e Minacce Informatiche | 1 | 2 | 2 | 0 | disattivato |
| Intelligenza Artificiale | 13 | 26 | 0 | 26 | disattivato |
| **Totale** | **57** | **114** | **28** | **86** | — |

- **Moduli totali mappati:** 57
- **File CSV creati:** 28 (8 in Computer Essentials — area completa; 2 in Online Essentials — La rete e i dati Modulo1; 2 in Malware e Minacce Informatiche — Modulo1, area completa; 14 in Reti e Internet — Le fondamenta delle reti Modulo1, Il protocollo TCP/IP Modulo2, DNS la rubrica di Internet Modulo3, Router Switch e dispositivi di rete Modulo4, Wi-Fi e reti wireless Modulo5, Cloud Networking Modulo6 e VPN e comunicazioni sicure Modulo7; 2 in Cybersecurity — Non solo antivirus e password — Fondamenti di Cybersecurity Modulo1)
- **File CSV da creare:** 86
- **File CSV totali attesi:** 114

*Nota: il conteggio "Creati" di Computer Essentials era stato inizialmente corretto da 8 a 2 perché l'elenco dettagliato segnava tutti i file come "da creare" nonostante la tabella li indicasse già completi. Con il completamento di tutti i quattro moduli tramite generazione da PDF/Markdown, il conteggio di 8/8 per Computer Essentials è ora effettivamente verificato riga per riga. La stessa discrepanza è emersa anche per Online Essentials, che la tabella indicava come 8/8 completi mentre l'elenco dettagliato segnava tutti i file come "da creare": con la generazione del primo modulo (La rete e i dati) il conteggio reale risulta invece 2/8, corretto di conseguenza. Restano da verificare gli altri tre moduli di Online Essentials (Identità e comunicazione, Navigazione e tracciamento, Sicurezza e comportamento online). Con la generazione del Modulo5 (Wi-Fi e reti wireless), del Modulo6 (Cloud Networking) e del Modulo7 (VPN e comunicazioni sicure), l'area Reti e Internet passa da 8/16 a 14/16 file creati; resta da completare solo il Modulo8 (Troubleshooting delle reti). Con la generazione del Modulo1 (Fondamenti di Cybersecurity) l'area Cybersecurity — Non solo antivirus e password passa da 0/16 a 2/16 file creati; restano da completare i Moduli 2-8.*
