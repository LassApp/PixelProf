# Flip Card

Questo file è la **fonte ufficiale e vincolante** per Flip Card: Aree e Moduli coinvolti, Chiavi tecniche, Path base, naming dei file CSV e stato di attivazione.

> **Nota:** Flip Card non è un mini-gioco, ma un **metodo di apprendimento** che fa parte della didattica di PixelProf, distinto dai mini-giochi (quiz, speedquiz, abbina, completa la frase, vero o falso).

> **Nota:** questo file è distinto da `aree_e_moduli.md`. `aree_e_moduli.md` resta l'unica fonte ufficiale per la definizione di Aree, Moduli e Chiavi tecniche del progetto; `Flip_Card.md` riutilizza quelle stesse Chiavi ma definisce path, naming e stato specifici del mini-gioco Flip Card, che possono differire (es. stato di attivazione) da quelli degli altri mini-giochi.

> **Nota generale:** `Path base` indica la cartella comune ai file del modulo. Ogni file deve essere caricato direttamente in questa cartella; il nome del file costituisce l'ultima parte del relativo path.

---

## 1. Struttura Flip Card

Sezione dedicata ai file CSV del metodo di apprendimento Flip Card, in due livelli di difficoltà (Facile / Medio). La struttura di Aree, Moduli e Chiavi tecniche è la stessa definita in `aree_e_moduli.md`; cambiano solo il path base (`data/Flip_Card/...`) e il naming dei file.

**Stato Aree:**
- Tutte le aree: `disattivato`
- Area ECDL: `attivo`

**Esempio di struttura path:**

```text
data/
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
  - Path base: `data/Flip_Card/ECDL/Computer_Essentials/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **CPU e architettura**
  - Chiave: `cpu-architettura`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Computer_Essentials/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Memorie**
  - Chiave: `memorie`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Computer_Essentials/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Software**
  - Chiave: `software`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Computer_Essentials/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

#### Online Essentials

- **La rete e i dati**
  - Chiave: `rete-e-dati`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Online_Essentials/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Identità e comunicazione**
  - Chiave: `identita-e-comunicazione`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Online_Essentials/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Navigazione e tracciamento**
  - Chiave: `navigazione-e-tracciamento`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Online_Essentials/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Sicurezza e comportamento online**
  - Chiave: `sicurezza-e-comportamento-online`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Online_Essentials/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

#### Word

- **Word**
  - Chiave: `word`
  - Stato: `attivo`
  - Path base: `data/Flip_Card/ECDL/Word/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

---

### 🛡️ Area Cyberbullismo e Sicurezza Online

**Stato:** disattivato

- **Identità e reputazione digitale**
  - Chiave: `identita-reputazione-digitale`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Cyberbullismo**
  - Chiave: `cyberbullismo`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Hate Speech**
  - Chiave: `hate-speech`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Sexting e Revenge Porn**
  - Chiave: `sexting-revenge-porn`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Grooming**
  - Chiave: `grooming`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Cittadinanza Digitale**
  - Chiave: `cittadinanza-digitale`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cyberbullismo_e_Sicurezza_Online/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

---

### 👤 Area Cybersecurity — Non solo antivirus e password

**Stato:** disattivato

- **Fondamenti di Cybersecurity**
  - Chiave: `fondamenti-cybersecurity`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Sicurezza degli Account**
  - Chiave: `sicurezza-account`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Protezione dei Dati**
  - Chiave: `protezione-dati`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Sicurezza Quotidiana**
  - Chiave: `sicurezza-quotidiana`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Sicurezza dei Pagamenti**
  - Chiave: `sicurezza-pagamenti`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Privacy e Normative**
  - Chiave: `privacy-normative`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

- **Sicurezza Online e Social Network**
  - Chiave: `sicurezza-online-social-network`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_7.csv` *(csv da creare)*

- **Nuove Minacce Digitali**
  - Chiave: `nuove-minacce-digitali`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Cybersecurity_Non_solo_antivirus_e_password/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_8.csv` *(csv da creare)*

---

### 🌐 Area Reti e Internet

**Stato:** disattivato

- **Le fondamenta delle reti**
  - Chiave: `fondamenta-reti`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Il protocollo TCP/IP**
  - Chiave: `tcp-ip`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **DNS: la rubrica di Internet**
  - Chiave: `dns`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **Router, Switch e dispositivi di rete**
  - Chiave: `router-switch-dispositivi`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Wi-Fi e reti wireless**
  - Chiave: `wifi-reti-wireless`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Cloud Networking**
  - Chiave: `cloud-networking`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

- **VPN e comunicazioni sicure**
  - Chiave: `vpn`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_7.csv` *(csv da creare)*

- **Troubleshooting delle reti**
  - Chiave: `troubleshooting-reti`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Reti_e_Internet/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_8.csv` *(csv da creare)*

---

### 🦠 Area Malware e Minacce Informatiche

**Stato:** disattivato

- **Malware e Minacce Informatiche**
  - Chiave: `malware-e-minacce-informatiche`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Malware_e_Minacce_Informatiche/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

---

### 🤖 Area Intelligenza Artificiale

**Stato:** disattivato

- **Cos'è l'AI**
  - Chiave: `cos-e-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo1/`
  - File:
    - `Flip_Card_Facile_Modulo_1.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_1.csv` *(csv da creare)*

- **Come funziona l'AI**
  - Chiave: `come-funziona-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo2/`
  - File:
    - `Flip_Card_Facile_Modulo_2.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_2.csv` *(csv da creare)*

- **Come funzionano gli LLM**
  - Chiave: `come-funzionano-gli-llm`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo3/`
  - File:
    - `Flip_Card_Facile_Modulo_3.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_3.csv` *(csv da creare)*

- **AI Generativa**
  - Chiave: `ai-generativa`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo4/`
  - File:
    - `Flip_Card_Facile_Modulo_4.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_4.csv` *(csv da creare)*

- **Prompt Engineering**
  - Chiave: `prompt-engineering`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo5/`
  - File:
    - `Flip_Card_Facile_Modulo_5.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_5.csv` *(csv da creare)*

- **Agenti e Automazione**
  - Chiave: `agenti-automazione`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo6/`
  - File:
    - `Flip_Card_Facile_Modulo_6.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_6.csv` *(csv da creare)*

- **Deepfake e Contenuti Sintetici**
  - Chiave: `deepfake-contenuti-sintetici`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo7/`
  - File:
    - `Flip_Card_Facile_Modulo_7.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_7.csv` *(csv da creare)*

- **Provenienza dei Contenuti**
  - Chiave: `provenienza-dei-contenuti`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo8/`
  - File:
    - `Flip_Card_Facile_Modulo_8.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_8.csv` *(csv da creare)*

- **Verificare l'AI**
  - Chiave: `verificare-l-ai`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo9/`
  - File:
    - `Flip_Card_Facile_Modulo_9.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_9.csv` *(csv da creare)*

- **Etica dell'AI**
  - Chiave: `etica-dell-ai`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo10/`
  - File:
    - `Flip_Card_Facile_Modulo_10.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_10.csv` *(csv da creare)*

- **Bias Algoritmici**
  - Chiave: `bias-algoritmici`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo11/`
  - File:
    - `Flip_Card_Facile_Modulo_11.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_11.csv` *(csv da creare)*

- **AI Act**
  - Chiave: `ai-act`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo12/`
  - File:
    - `Flip_Card_Facile_Modulo_12.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_12.csv` *(csv da creare)*

- **Il Futuro dell'AI**
  - Chiave: `futuro-dell-ai`
  - Stato: `disattivato`
  - Path base: `data/Flip_Card/Intelligenza_Artificiale/Modulo13/`
  - File:
    - `Flip_Card_Facile_Modulo_13.csv` *(csv da creare)*
    - `Flip_Card_Medio_Modulo_13.csv` *(csv da creare)*

---

## 2. Resoconto

| Area / Sotto-area | Moduli | File attesi | Creati | Da creare | Stato area |
|---|---|---|---|---|---|
| ECDL — Computer Essentials | 4 | 8 | 8 | 0 | attivo |
| ECDL — Online Essentials | 4 | 8 | 8 | 0 | attivo |
| ECDL — Word | 1 | 2 | 0 | 2 | attivo |
| Cyberbullismo e Sicurezza Online | 6 | 12 | 0 | 12 | disattivato |
| Cybersecurity — Non solo antivirus e password | 8 | 16 | 0 | 16 | disattivato |
| Reti e Internet | 8 | 16 | 0 | 16 | disattivato |
| Malware e Minacce Informatiche | 1 | 2 | 0 | 2 | disattivato |
| Intelligenza Artificiale | 13 | 26 | 0 | 26 | disattivato |
| **Totale** | **45** | **90** | **16** | **74** | — |

- **Moduli totali mappati:** 45
- **File CSV creati:** 16 (Computer Essentials + Online Essentials, 8 moduli)
- **File CSV da creare:** 74
- **File CSV totali attesi:** 90
