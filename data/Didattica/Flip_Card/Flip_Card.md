# Flip Card

Questo file è la **fonte ufficiale e vincolante** per Flip Card: Aree e Moduli coinvolti, Chiavi tecniche, Path base, naming dei file CSV e stato di attivazione.

> **Nota:** Flip Card non è un mini-gioco, ma un **metodo di apprendimento** che fa parte della didattica di PixelProf, distinto dai mini-giochi (quiz, speedquiz, abbina, completa la frase, vero o falso).

> **Nota:** questo file è distinto da `aree_e_moduli.md`. `aree_e_moduli.md` resta l'unica fonte ufficiale per la definizione di Aree, Moduli e Chiavi tecniche del progetto; `Flip_Card.md` riutilizza quelle stesse Chiavi ma definisce path, naming e stato specifici del mini-gioco Flip Card, che possono differire (es. stato di attivazione) da quelli degli altri mini-giochi.

> **Nota generale:** `Path base` indica la cartella comune ai file del modulo. Ogni file deve essere caricato direttamente in questa cartella; il nome del file costituisce l'ultima parte del relativo path.

---

## 1. Struttura Flip Card

Sezione dedicata ai file CSV del metodo di apprendimento Flip Card, in due livelli di difficoltà (Facile / Medio). La struttura di Aree, Moduli e Chiavi tecniche è la stessa definita in `aree_e_moduli.md`; cambiano solo il path base (`data/Didattica/Flip_Card/...`) e il naming dei file.

**Stato Aree:**
- Tutte le aree: `attivate`
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
    - `Flip_Card_Facile_Modulo_2.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato)*

- **Navigazione e tracciamento**
  - Chiave: `navigazione-e-tracciamento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato)*

- **Sicurezza e comportamento online**
  - Chiave: `sicurezza-e-comportamento-online`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Online_Essentials/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato)*

#### Word

- **Modulo 1 — Word e ambiente**
  - Chiave: `word-e-ambiente`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato)*

- **Modulo 2 — Scrivere e salvare**
  - Chiave: `scrivere-e-salvare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato)*

- **Modulo 3 — Formattare il testo**
  - Chiave: `formattare-il-testo`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato)*

- **Modulo 4 — Elementi grafici**
  - Chiave: `elementi-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato)*

- **Modulo 5 — Strutturare il documento**
  - Chiave: `strutturare-il-documento`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Word/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_5.csv` *(creato)*

#### Spreadsheet

- **Modulo 1 — Excel e l'ambiente di lavoro**
  - Chiave: `excel-e-l-ambiente-di-lavoro`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 31 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 31 Flip Card)*

- **Modulo 2 — Inserire e gestire i dati**
  - Chiave: `inserire-e-gestire-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(creato — 41 Flip Card)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato — 27 Flip Card)*

- **Modulo 3 — Formattare il foglio**
  - Chiave: `formattare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato — 22 Flip Card)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato — 14 Flip Card)*

- **Modulo 4 — Formule e calcoli**
  - Chiave: `formule-e-calcoli`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato — 33 Flip Card)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato — 27 Flip Card)*

- **Modulo 5 — Organizzare e visualizzare i dati**
  - Chiave: `organizzare-e-visualizzare-i-dati`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv creato)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv creato)*

- **Modulo 6 — Preparare e stampare il foglio**
  - Chiave: `preparare-e-stampare-il-foglio`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Spreadsheet/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv creato)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv creato)*

#### Presentation

- **Modulo 1 — Creare una presentazione**
  - Chiave: `creare-una-presentazione`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Presentation/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv creato)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv creato)*

- **Modulo 2 — Oggetti grafici**
  - Chiave: `oggetti-grafici`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Presentation/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv creato)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv creato)*

- **Modulo 3 — Preparare e presentare**
  - Chiave: `preparare-e-presentare`
  - Stato: `attivo`
  - Path base: `data/Didattica/Flip_Card/ECDL/Presentation/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv creato)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv creato)*

---

### 🛡️ Area Cyberbullismo e Sicurezza Online

**Stato:** disattivato

- **Identità e reputazione digitale**
  - Chiave: `identita-reputazione-digitale`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(creato — 31 Flip Card)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato — 31 Flip Card)*

- **Cyberbullismo**
  - Chiave: `cyberbullismo`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(creato — 33 Flip Card)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato — 33 Flip Card)*

- **Hate Speech**
  - Chiave: `hate-speech`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato — 29 Flip Card)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato — 28 Flip Card)*

- **Sexting e Revenge Porn**
  - Chiave: `sexting-revenge-porn`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato — 28 Flip Card)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato — 25 Flip Card)*

- **Grooming**
  - Chiave: `grooming`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(creato — 9 Flip Card)*
    - `Flip_Card_Medio_Modulo_5.csv` *(creato — 12 Flip Card)*

- **Cittadinanza Digitale**
  - Chiave: `cittadinanza-digitale`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(creato — 9 Flip Card)*
    - `Flip_Card_Medio_Modulo_6.csv` *(creato — 8 Flip Card)*

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
    - `Flip_Card_Facile_Modulo_2.csv` *(creato — conteggio da confermare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato — conteggio da confermare)*

- **Protezione dei Dati**
  - Chiave: `protezione-dati`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato — conteggio da confermare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato — conteggio da confermare)*

- **Sicurezza Quotidiana**
  - Chiave: `sicurezza-quotidiana`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato — conteggio da confermare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato — conteggio da confermare)*

- **Sicurezza dei Pagamenti**
  - Chiave: `sicurezza-pagamenti`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(creato — conteggio da confermare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(creato — conteggio da confermare)*

- **Privacy e Normative**
  - Chiave: `privacy-normative`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(creato — 28 Flip Card)*
    - `Flip_Card_Medio_Modulo_6.csv` *(creato — 28 Flip Card)*

- **Sicurezza Online e Social Network**
  - Chiave: `sicurezza-online-social-network`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(creato — 15 Flip Card)*
    - `Flip_Card_Medio_Modulo_7.csv` *(creato — 18 Flip Card)*

- **Nuove Minacce Digitali**
  - Chiave: `nuove-minacce-digitali`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(creato — 17 Flip Card)*
    - `Flip_Card_Medio_Modulo_8.csv` *(creato — 15 Flip Card)*

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
    - `Flip_Card_Facile_Modulo_8.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_8.csv` *(creato)*

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
    - `Flip_Card_Facile_Modulo_1.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_1.csv` *(creato)*

- **Come funziona l'AI**
  - Chiave: `come-funziona-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_2.csv` *(creato)*

- **Come funzionano gli LLM**
  - Chiave: `come-funzionano-gli-llm`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_3.csv` *(creato)*

- **AI Generativa**
  - Chiave: `ai-generativa`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_4.csv` *(creato)*

- **Prompt Engineering**
  - Chiave: `prompt-engineering`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_5.csv` *(creato)*

- **Agenti e Automazione**
  - Chiave: `agenti-automazione`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(creato — 42 Flip Card)*
    - `Flip_Card_Medio_Modulo_6.csv` *(creato — 28 Flip Card)*

- **Deepfake e Contenuti Sintetici**
  - Chiave: `deepfake-contenuti-sintetici`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(creato — 32 Flip Card)*
    - `Flip_Card_Medio_Modulo_7.csv` *(creato — 21 Flip Card)*

- **Provenienza dei Contenuti**
  - Chiave: `provenienza-dei-contenuti`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(creato — 29 Flip Card)*
    - `Flip_Card_Medio_Modulo_8.csv` *(creato — 18 Flip Card)*

- **Verificare l'AI**
  - Chiave: `verificare-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo9/`
  - File:
    - `Flip_Card_Facile_Modulo_9.csv` *(creato — 26 Flip Card)*
    - `Flip_Card_Medio_Modulo_9.csv` *(creato — 17 Flip Card)*

- **Etica dell'AI**
  - Chiave: `etica-dell-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo10/`
  - File:
    - `Flip_Card_Facile_Modulo_10.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_10.csv` *(creato)*

- **Bias Algoritmici**
  - Chiave: `bias-algoritmici`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo11/`
  - File:
    - `Flip_Card_Facile_Modulo_11.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_11.csv` *(creato)*

- **AI Act**
  - Chiave: `ai-act`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo12/`
  - File:
    - `Flip_Card_Facile_Modulo_12.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_12.csv` *(creato)*

- **Il Futuro dell'AI**
  - Chiave: `futuro-dell-ai`
  - Stato: `disattivato`
  - Path base: `data/Didattica/Flip_Card/Intelligenza_Artificiale/Modulo13/`
  - File:
    - `Flip_Card_Facile_Modulo_13.csv` *(creato)*
    - `Flip_Card_Medio_Modulo_13.csv` *(creato)*

---

## 2. Moduli completi e da creare

### 🖥️ ECDL — Computer Essentials — COMPLETO
- Modulo 1 — Fondamenti digitali
- Modulo 2 — CPU e architettura
- Modulo 3 — Memorie
- Modulo 4 — Software

### 🌐 ECDL — Online Essentials — COMPLETO
- Modulo 1 — La rete e i dati
- Modulo 2 — Identità e comunicazione
- Modulo 3 — Navigazione e tracciamento
- Modulo 4 — Sicurezza e comportamento online

### 📄 ECDL — Word — COMPLETO
- Modulo 1 — Word e ambiente
- Modulo 2 — Scrivere e salvare
- Modulo 3 — Formattare il testo
- Modulo 4 — Elementi grafici
- Modulo 5 — Strutturare il documento

### 📊 ECDL — Spreadsheet — COMPLETO
- Modulo 1 — Excel e l'ambiente di lavoro
- Modulo 2 — Inserire e gestire i dati
- Modulo 3 — Formattare il foglio
- Modulo 4 — Formule e calcoli
- Modulo 5 — Organizzare e visualizzare i dati
- Modulo 6 — Preparare e stampare il foglio

### 📽️ ECDL — Presentation — COMPLETO
- Modulo 1 — Creare una presentazione
- Modulo 2 — Oggetti grafici
- Modulo 3 — Preparare e presentare

### 🛡️ Cyberbullismo e Sicurezza Online — COMPLETO
- Modulo 1 — Identità e reputazione digitale
- Modulo 2 — Cyberbullismo
- Modulo 3 — Hate Speech
- Modulo 4 — Sexting e Revenge Porn
- Modulo 5 — Grooming
- Modulo 6 — Cittadinanza Digitale

### 👤 Cybersecurity — Non solo antivirus e password — COMPLETO
- Modulo 1 — Fondamenti di Cybersecurity
- Modulo 2 — Sicurezza degli Account
- Modulo 3 — Protezione dei Dati
- Modulo 4 — Sicurezza Quotidiana
- Modulo 5 — Sicurezza dei Pagamenti
- Modulo 6 — Privacy e Normative
- Modulo 7 — Sicurezza Online e Social Network
- Modulo 8 — Nuove Minacce Digitali

### 🌐 Reti e Internet — COMPLETO
- Modulo 1 — Le fondamenta delle reti
- Modulo 2 — Il protocollo TCP/IP
- Modulo 3 — DNS: la rubrica di Internet
- Modulo 4 — Router, Switch e dispositivi di rete
- Modulo 5 — Wi-Fi e reti wireless
- Modulo 6 — Cloud Networking
- Modulo 7 — VPN e comunicazioni sicure
- Modulo 8 — Troubleshooting delle reti

### 🦠 Malware e Minacce Informatiche — COMPLETO
- Modulo 1 — Malware e Minacce Informatiche

### 🤖 Intelligenza Artificiale — COMPLETO
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

**Riepilogo:**
- **Moduli completi:** 58
- **Moduli da creare:** 0
- **Moduli totali:** 58

*Per i moduli indicati come "DA CREARE", entrambi i file — Facile e Medio — sono ancora da creare.*

## 3. Resoconto

| Area / Sotto-area | Moduli | File attesi | Creati | Da creare | Stato area |
|---|---:|---:|---:|---:|---|
| ECDL — Computer Essentials | 4 | 8 | 8 | 0 | attivo |
| ECDL — Online Essentials | 4 | 8 | 8 | 0 | attivo |
| ECDL — Word | 5 | 10 | 10 | 0 | attivo |
| ECDL — Spreadsheet | 6 | 12 | 12 | 0 | attivo |
| ECDL — Presentation | 3 | 6 | 6 | 0 | attivo |
| Cyberbullismo e Sicurezza Online | 6 | 12 | 12 | 0 | attivo |
| Cybersecurity — Non solo antivirus e password | 8 | 16 | 16 | 0 | attivo |
| Reti e Internet | 8 | 16 | 16 | 0 | attivo |
| Malware e Minacce Informatiche | 1 | 2 | 2 | 0 | attivo |
| Intelligenza Artificiale | 13 | 26 | 26 | 0 | attivo |
| **Totale** | **58** | **116** | **116** | **0** | — |

- **Moduli totali mappati:** 58
- **Moduli completi:** 58
- **Moduli da creare:** 0
- **File CSV creati:** 116
- **File CSV da creare:** 0
- **File CSV totali attesi:** 116
