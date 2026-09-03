# Aree e Moduli

Questo file è l'**unica fonte ufficiale e vincolante** per identificare Aree, Moduli, nomi ufficiali, Chiavi tecniche, Path base, naming dei file JSON e stato dei moduli di PixelProf.

> **Nota generale:** `Path base` indica la cartella comune a tutti i file del modulo. Ogni file deve essere caricato direttamente in questa cartella; il nome del file costituisce l'ultima parte del relativo path.

---

## 1. Stato Sintetico delle Aree

Vista rapida dello stato di ciascuna Area, utile per un controllo immediato prima di consultare il dettaglio.

- **Area ECDL** → `attiva` — Computer Essentials e Online Essentials: JSON realizzati e caricati. Word Processing, Spreadsheet e Presentation: moduli e chiavi definiti, JSON da realizzare.
- **Area Cyberbullismo e Sicurezza Online** → `attiva` — contenuti presenti, JSON da realizzare.
- **Area Cybersecurity — Non solo antivirus e password** → `attiva` — JSON realizzati e caricati.
- **Area Reti e Internet** → `attiva` — JSON realizzati e caricati.
- **Area Malware e Minacce Informatiche** → `attiva` — JSON realizzati e caricati.
- **Area Intelligenza Artificiale** → `attiva` — contenuti presenti, JSON da realizzare.

---

## 2. Elenco Aree

### 🖥️ Area ECDL
**Descrizione:** Acquisire le competenze fondamentali per utilizzare computer, applicazioni e servizi digitali.
**Stato:** attiva
**Nota:** Computer Essentials e Online Essentials — JSON realizzati e caricati. Word Processing, Spreadsheet e Presentation — sotto-aree di nuova introduzione, JSON da realizzare.

### 🛡️ Area Cyberbullismo e Sicurezza Online
**Descrizione:** Riconoscere i rischi nelle relazioni digitali e imparare a proteggersi e agire responsabilmente online.
**Stato:** attiva
**Nota:** contenuti presenti, JSON da realizzare.

### 👤 Area Cybersecurity — Non solo antivirus e password
**Descrizione:** Sviluppare consapevolezza e competenze per proteggere identità, account, dati e attività digitali.
**Stato:** attiva
**Nota:** JSON realizzati e caricati.

### 🌐 Area Reti e Internet
**Descrizione:** Comprendere come funzionano Internet, le reti e le tecnologie che permettono ai dispositivi di comunicare.
**Stato:** attiva
**Nota:** contenuti presenti, JSON realizzati e caricati.

### 🦠 Area Malware e Minacce Informatiche
**Descrizione:** Conoscere le principali minacce informatiche, comprenderne il funzionamento e imparare a prevenirle.
**Stato:** attiva
**Nota:** contenuti presenti, JSON realizzati e caricati.

### 🤖 Area Intelligenza Artificiale
**Descrizione:** Comprendere i concetti fondamentali dell'intelligenza artificiale, il funzionamento dei principali sistemi AI e il loro utilizzo consapevole, sicuro e responsabile.
**Stato:** attiva
**Nota:** contenuti presenti, JSON da realizzare.

---

## 3. Moduli per Area

### 🖥️ Area ECDL

**Stato:** attiva

#### Computer Essentials

```text
data/
└── Minigiochi/
    └── ECDL/
        └── Computer_Essentials/
            ├── modulo1/
            │   ├── abbina_fondamenti-digitali.json
            │   ├── completa_la_frase_fondamenti-digitali.json
            │   ├── quiz_fondamenti-digitali.json
            │   ├── speedquiz_fondamenti-digitali.json
            │   └── vero_o_falso_fondamenti-digitali.json
            ├── modulo2/
            │   ├── abbina_cpu-architettura.json
            │   ├── completa_la_frase_cpu-architettura.json
            │   ├── quiz_cpu-architettura.json
            │   ├── speedquiz_cpu-architettura.json
            │   └── vero_o_falso_cpu-architettura.json
            ├── modulo3/
            │   ├── abbina_memorie.json
            │   ├── completa_la_frase_memorie.json
            │   ├── quiz_memorie.json
            │   ├── speedquiz_memorie.json
            │   └── vero_o_falso_memorie.json
            └── modulo4/
                ├── abbina_software.json
                ├── completa_la_frase_software.json
                ├── quiz_software.json
                ├── speedquiz_software.json
                └── vero_o_falso_software.json
```

- **Fondamenti digitali**
  - Chiave: `fondamenti-digitali`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Computer_Essentials/modulo1/`
  - File: `abbina_fondamenti-digitali.json`, `completa_la_frase_fondamenti-digitali.json`, `quiz_fondamenti-digitali.json`, `speedquiz_fondamenti-digitali.json`, `vero_o_falso_fondamenti-digitali.json`

- **CPU e architettura**
  - Chiave: `cpu-architettura`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Computer_Essentials/modulo2/`
  - File: `abbina_cpu-architettura.json`, `completa_la_frase_cpu-architettura.json`, `quiz_cpu-architettura.json`, `speedquiz_cpu-architettura.json`, `vero_o_falso_cpu-architettura.json`

- **Memorie**
  - Chiave: `memorie`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Computer_Essentials/modulo3/`
  - File: `abbina_memorie.json`, `completa_la_frase_memorie.json`, `quiz_memorie.json`, `speedquiz_memorie.json`, `vero_o_falso_memorie.json`

- **Software**
  - Chiave: `software`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Computer_Essentials/modulo4/`
  - File: `abbina_software.json`, `completa_la_frase_software.json`, `quiz_software.json`, `speedquiz_software.json`, `vero_o_falso_software.json`

#### Online Essentials

```text
data/
└── Minigiochi/
    └── ECDL/
        └── Online_Essentials/
            ├── modulo1/
            │   ├── abbina_rete-e-dati.json
            │   ├── completa_la_frase_rete-e-dati.json
            │   ├── quiz_rete-e-dati.json
            │   ├── speedquiz_rete-e-dati.json
            │   └── vero_o_falso_rete-e-dati.json
            ├── modulo2/
            │   ├── abbina_identita-e-comunicazione.json
            │   ├── completa_la_frase_identita-e-comunicazione.json
            │   ├── quiz_identita-e-comunicazione.json
            │   ├── speedquiz_identita-e-comunicazione.json
            │   └── vero_o_falso_identita-e-comunicazione.json
            ├── modulo3/
            │   ├── abbina_navigazione-e-tracciamento.json
            │   ├── completa_la_frase_navigazione-e-tracciamento.json
            │   ├── quiz_navigazione-e-tracciamento.json
            │   ├── speedquiz_navigazione-e-tracciamento.json
            │   └── vero_o_falso_navigazione-e-tracciamento.json
            └── modulo4/
                ├── abbina_sicurezza-e-comportamento-online.json
                ├── completa_la_frase_sicurezza-e-comportamento-online.json
                ├── quiz_sicurezza-e-comportamento-online.json
                ├── speedquiz_sicurezza-e-comportamento-online.json
                └── vero_o_falso_sicurezza-e-comportamento-online.json
```

- **Online Essentials — Modulo 1: La rete e i dati**
  - Chiave: `rete-e-dati`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Online_Essentials/modulo1/`
  - File: `abbina_rete-e-dati.json`, `completa_la_frase_rete-e-dati.json`, `quiz_rete-e-dati.json`, `speedquiz_rete-e-dati.json`, `vero_o_falso_rete-e-dati.json`

- **Online Essentials — Modulo 2: Identità e comunicazione**
  - Chiave: `identita-e-comunicazione`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Online_Essentials/modulo2/`
  - File: `abbina_identita-e-comunicazione.json`, `completa_la_frase_identita-e-comunicazione.json`, `quiz_identita-e-comunicazione.json`, `speedquiz_identita-e-comunicazione.json`, `vero_o_falso_identita-e-comunicazione.json`

- **Online Essentials — Modulo 3: Navigazione e tracciamento**
  - Chiave: `navigazione-e-tracciamento`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Online_Essentials/modulo3/`
  - File: `abbina_navigazione-e-tracciamento.json`, `completa_la_frase_navigazione-e-tracciamento.json`, `quiz_navigazione-e-tracciamento.json`, `speedquiz_navigazione-e-tracciamento.json`, `vero_o_falso_navigazione-e-tracciamento.json`

- **Online Essentials — Modulo 4: Sicurezza e comportamento online**
  - Chiave: `sicurezza-e-comportamento-online`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/ECDL/Online_Essentials/modulo4/`
  - File: `abbina_sicurezza-e-comportamento-online.json`, `completa_la_frase_sicurezza-e-comportamento-online.json`, `quiz_sicurezza-e-comportamento-online.json`, `speedquiz_sicurezza-e-comportamento-online.json`, `vero_o_falso_sicurezza-e-comportamento-online.json`

#### Word Processing

>JSON da realizzare.

```text
data/
└── Minigiochi/
    └── ECDL/
        └── Word_Processing/
            ├── modulo1/
            │   ├── abbina_word-e-ambiente.json
            │   ├── completa_la_frase_word-e-ambiente.json
            │   ├── quiz_word-e-ambiente.json
            │   ├── speedquiz_word-e-ambiente.json
            │   └── vero_o_falso_word-e-ambiente.json
            ├── modulo2/
            │   ├── abbina_scrivere-e-salvare.json
            │   ├── completa_la_frase_scrivere-e-salvare.json
            │   ├── quiz_scrivere-e-salvare.json
            │   ├── speedquiz_scrivere-e-salvare.json
            │   └── vero_o_falso_scrivere-e-salvare.json
            ├── modulo3/
            │   ├── abbina_formattare-il-testo.json
            │   ├── completa_la_frase_formattare-il-testo.json
            │   ├── quiz_formattare-il-testo.json
            │   ├── speedquiz_formattare-il-testo.json
            │   └── vero_o_falso_formattare-il-testo.json
            ├── modulo4/
            │   ├── abbina_elementi-grafici.json
            │   ├── completa_la_frase_elementi-grafici.json
            │   ├── quiz_elementi-grafici.json
            │   ├── speedquiz_elementi-grafici.json
            │   └── vero_o_falso_elementi-grafici.json
            └── modulo5/
                ├── abbina_strutturare-il-documento.json
                ├── completa_la_frase_strutturare-il-documento.json
                ├── quiz_strutturare-il-documento.json
                ├── speedquiz_strutturare-il-documento.json
                └── vero_o_falso_strutturare-il-documento.json
```

- **Modulo 1 — Word e ambiente**
  - Chiave: `word-e-ambiente`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Word_Processing/modulo1/`
  - File: `abbina_word-e-ambiente.json`, `completa_la_frase_word-e-ambiente.json`, `quiz_word-e-ambiente.json`, `speedquiz_word-e-ambiente.json`, `vero_o_falso_word-e-ambiente.json`

- **Modulo 2 — Scrivere e salvare**
  - Chiave: `scrivere-e-salvare`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Word_Processing/modulo2/`
  - File: `abbina_scrivere-e-salvare.json`, `completa_la_frase_scrivere-e-salvare.json`, `quiz_scrivere-e-salvare.json`, `speedquiz_scrivere-e-salvare.json`, `vero_o_falso_scrivere-e-salvare.json`

- **Modulo 3 — Formattare il testo**
  - Chiave: `formattare-il-testo`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Word_Processing/modulo3/`
  - File: `abbina_formattare-il-testo.json`, `completa_la_frase_formattare-il-testo.json`, `quiz_formattare-il-testo.json`, `speedquiz_formattare-il-testo.json`, `vero_o_falso_formattare-il-testo.json`

- **Modulo 4 — Elementi grafici**
  - Chiave: `elementi-grafici`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Word_Processing/modulo4/`
  - File: `abbina_elementi-grafici.json`, `completa_la_frase_elementi-grafici.json`, `quiz_elementi-grafici.json`, `speedquiz_elementi-grafici.json`, `vero_o_falso_elementi-grafici.json`

- **Modulo 5 — Strutturare il documento**
  - Chiave: `strutturare-il-documento`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Word_Processing/modulo5/`
  - File: `abbina_strutturare-il-documento.json`, `completa_la_frase_strutturare-il-documento.json`, `quiz_strutturare-il-documento.json`, `speedquiz_strutturare-il-documento.json`, `vero_o_falso_strutturare-il-documento.json`

#### Spreadsheet

> JSON da realizzare.

```text
data/
└── Minigiochi/
    └── ECDL/
        └── Spreadsheet/
            ├── modulo1/
            │   ├── abbina_excel-e-l-ambiente-di-lavoro.json
            │   ├── completa_la_frase_excel-e-l-ambiente-di-lavoro.json
            │   ├── quiz_excel-e-l-ambiente-di-lavoro.json
            │   ├── speedquiz_excel-e-l-ambiente-di-lavoro.json
            │   └── vero_o_falso_excel-e-l-ambiente-di-lavoro.json
            ├── modulo2/
            │   ├── abbina_inserire-e-gestire-i-dati.json
            │   ├── completa_la_frase_inserire-e-gestire-i-dati.json
            │   ├── quiz_inserire-e-gestire-i-dati.json
            │   ├── speedquiz_inserire-e-gestire-i-dati.json
            │   └── vero_o_falso_inserire-e-gestire-i-dati.json
            ├── modulo3/
            │   ├── abbina_formattare-il-foglio.json
            │   ├── completa_la_frase_formattare-il-foglio.json
            │   ├── quiz_formattare-il-foglio.json
            │   ├── speedquiz_formattare-il-foglio.json
            │   └── vero_o_falso_formattare-il-foglio.json
            ├── modulo4/
            │   ├── abbina_formule-e-calcoli.json
            │   ├── completa_la_frase_formule-e-calcoli.json
            │   ├── quiz_formule-e-calcoli.json
            │   ├── speedquiz_formule-e-calcoli.json
            │   └── vero_o_falso_formule-e-calcoli.json
            └── modulo5/
                ├── abbina_organizzare-e-visualizzare-i-dati.json
                ├── completa_la_frase_organizzare-e-visualizzare-i-dati.json
                ├── quiz_organizzare-e-visualizzare-i-dati.json
                ├── speedquiz_organizzare-e-visualizzare-i-dati.json
                └── vero_o_falso_organizzare-e-visualizzare-i-dati.json
```

- **Modulo 1 — Excel e l'ambiente di lavoro**
  - Chiave: `excel-e-l-ambiente-di-lavoro`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Spreadsheet/modulo1/`
  - File: `abbina_excel-e-l-ambiente-di-lavoro.json`, `completa_la_frase_excel-e-l-ambiente-di-lavoro.json`, `quiz_excel-e-l-ambiente-di-lavoro.json`, `speedquiz_excel-e-l-ambiente-di-lavoro.json`, `vero_o_falso_excel-e-l-ambiente-di-lavoro.json`

- **Modulo 2 — Inserire e gestire i dati**
  - Chiave: `inserire-e-gestire-i-dati`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Spreadsheet/modulo2/`
  - File: `abbina_inserire-e-gestire-i-dati.json`, `completa_la_frase_inserire-e-gestire-i-dati.json`, `quiz_inserire-e-gestire-i-dati.json`, `speedquiz_inserire-e-gestire-i-dati.json`, `vero_o_falso_inserire-e-gestire-i-dati.json`

- **Modulo 3 — Formattare il foglio**
  - Chiave: `formattare-il-foglio`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Spreadsheet/modulo3/`
  - File: `abbina_formattare-il-foglio.json`, `completa_la_frase_formattare-il-foglio.json`, `quiz_formattare-il-foglio.json`, `speedquiz_formattare-il-foglio.json`, `vero_o_falso_formattare-il-foglio.json`

- **Modulo 4 — Formule e calcoli**
  - Chiave: `formule-e-calcoli`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Spreadsheet/modulo4/`
  - File: `abbina_formule-e-calcoli.json`, `completa_la_frase_formule-e-calcoli.json`, `quiz_formule-e-calcoli.json`, `speedquiz_formule-e-calcoli.json`, `vero_o_falso_formule-e-calcoli.json`

- **Modulo 5 — Organizzare e visualizzare i dati**
  - Chiave: `organizzare-e-visualizzare-i-dati`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Spreadsheet/modulo5/`
  - File: `abbina_organizzare-e-visualizzare-i-dati.json`, `completa_la_frase_organizzare-e-visualizzare-i-dati.json`, `quiz_organizzare-e-visualizzare-i-dati.json`, `speedquiz_organizzare-e-visualizzare-i-dati.json`, `vero_o_falso_organizzare-e-visualizzare-i-dati.json`

#### Presentation

> JSON da realizzare.

```text
data/
└── Minigiochi/
    └── ECDL/
        └── Presentation/
            ├── modulo1/
            │   ├── abbina_creare-una-presentazione.json
            │   ├── completa_la_frase_creare-una-presentazione.json
            │   ├── quiz_creare-una-presentazione.json
            │   ├── speedquiz_creare-una-presentazione.json
            │   └── vero_o_falso_creare-una-presentazione.json
            ├── modulo2/
            │   ├── abbina_oggetti-grafici.json
            │   ├── completa_la_frase_oggetti-grafici.json
            │   ├── quiz_oggetti-grafici.json
            │   ├── speedquiz_oggetti-grafici.json
            │   └── vero_o_falso_oggetti-grafici.json
            └── modulo3/
                ├── abbina_preparare-e-presentare.json
                ├── completa_la_frase_preparare-e-presentare.json
                ├── quiz_preparare-e-presentare.json
                ├── speedquiz_preparare-e-presentare.json
                └── vero_o_falso_preparare-e-presentare.json
```

- **Modulo 1 — Creare una presentazione**
  - Chiave: `creare-una-presentazione`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Presentation/modulo1/`
  - File: `abbina_creare-una-presentazione.json`, `completa_la_frase_creare-una-presentazione.json`, `quiz_creare-una-presentazione.json`, `speedquiz_creare-una-presentazione.json`, `vero_o_falso_creare-una-presentazione.json`

- **Modulo 2 — Oggetti grafici**
  - Chiave: `oggetti-grafici`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Presentation/modulo2/`
  - File: `abbina_oggetti-grafici.json`, `completa_la_frase_oggetti-grafici.json`, `quiz_oggetti-grafici.json`, `speedquiz_oggetti-grafici.json`, `vero_o_falso_oggetti-grafici.json`

- **Modulo 3 — Preparare e presentare**
  - Chiave: `preparare-e-presentare`
  - Stato: `attivo` (JSON da realizzare)
  - Path base: `data/Minigiochi/ECDL/Presentation/modulo3/`
  - File: `abbina_preparare-e-presentare.json`, `completa_la_frase_preparare-e-presentare.json`, `quiz_preparare-e-presentare.json`, `speedquiz_preparare-e-presentare.json`, `vero_o_falso_preparare-e-presentare.json`

> Le sotto-aree ECDL attualmente definite sono cinque: **Computer Essentials**, **Online Essentials**, **Word Processing**, **Spreadsheet** e **Presentation**. Computer Essentials e Online Essentials hanno JSON realizzati e caricati. Word Processing, Spreadsheet e Presentation hanno moduli e chiavi definiti ma JSON da realizzare.

---

### 🛡️ Area Cyberbullismo e Sicurezza Online

**Stato:** attiva
**Nota:** contenuti presenti, JSON da realizzare.

- **Identità e reputazione digitale**
  - Chiave: `identita-reputazione-digitale`
  - Stato: `attivo`

- **Cyberbullismo**
  - Chiave: `cyberbullismo`
  - Stato: `attivo`

- **Hate Speech**
  - Chiave: `hate-speech`
  - Stato: `attivo`

- **Sexting e Revenge Porn**
  - Chiave: `sexting-revenge-porn`
  - Stato: `attivo`

- **Grooming**
  - Chiave: `grooming`
  - Stato: `attivo`

- **Cittadinanza Digitale**
  - Chiave: `cittadinanza-digitale`
  - Stato: `attivo`

---

### 👤 Area Cybersecurity — Non solo antivirus e password

**Stato:** attiva
**Nota:** JSON realizzati e caricati.

```text
data/
└── Minigiochi/
    └── Cybersecurity_Non_solo_antivirus_e_password/
        ├── modulo1/
        │   ├── abbina_fondamenti-cybersecurity.json
        │   ├── completa_la_frase_fondamenti-cybersecurity.json
        │   ├── quiz_fondamenti-cybersecurity.json
        │   ├── speedquiz_fondamenti-cybersecurity.json
        │   └── vero_o_falso_fondamenti-cybersecurity.json
        ├── modulo2/
        │   ├── abbina_sicurezza-account.json
        │   ├── completa_la_frase_sicurezza-account.json
        │   ├── quiz_sicurezza-account.json
        │   ├── speedquiz_sicurezza-account.json
        │   └── vero_o_falso_sicurezza-account.json
        ├── modulo3/
        │   ├── abbina_protezione-dati.json
        │   ├── completa_la_frase_protezione-dati.json
        │   ├── quiz_protezione-dati.json
        │   ├── speedquiz_protezione-dati.json
        │   └── vero_o_falso_protezione-dati.json
        ├── modulo4/
        │   ├── abbina_sicurezza_quotidiana.json
        │   ├── completa_la_frase_sicurezza_quotidiana.json
        │   ├── quiz_sicurezza_quotidiana.json
        │   ├── speedquiz_sicurezza_quotidiana.json
        │   └── vero_o_falso_sicurezza_quotidiana.json
        ├── modulo5/
        │   ├── abbina_sicurezza-pagamenti.json
        │   ├── completa_la_frase_sicurezza-pagamenti.json
        │   ├── quiz_sicurezza-pagamenti.json
        │   ├── speedquiz_sicurezza-pagamenti.json
        │   └── vero_o_falso_sicurezza-pagamenti.json
        ├── modulo6/
        │   ├── abbina_privacy-normative.json
        │   ├── completa_la_frase_privacy-normative.json
        │   ├── quiz_privacy-normative.json
        │   ├── speedquiz_privacy-normative.json
        │   └── vero_o_falso_privacy-normative.json
        ├── modulo7/
        │   ├── abbina_sicurezza-online-social-network.json
        │   ├── completa_la_frase_sicurezza-online-social-network.json
        │   ├── quiz_sicurezza-online-social-network.json
        │   ├── speedquiz_sicurezza-online-social-network.json
        │   └── vero_o_falso_sicurezza-online-social-network.json
        └── modulo8/
            ├── abbina_nuove-minacce-digitali.json
            ├── completa_la_frase_nuove-minacce-digitali.json
            ├── quiz_nuove-minacce-digitali.json
            ├── speedquiz_nuove-minacce-digitali.json
            └── vero_o_falso_nuove-minacce-digitali.json
```

- **Fondamenti di Cybersecurity**
  - Chiave: `fondamenti-cybersecurity`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo1/`
  - File: `abbina_fondamenti-cybersecurity.json`, `completa_la_frase_fondamenti-cybersecurity.json`, `quiz_fondamenti-cybersecurity.json`, `speedquiz_fondamenti-cybersecurity.json`, `vero_o_falso_fondamenti-cybersecurity.json`

- **Sicurezza degli Account**
  - Chiave: `sicurezza-account`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo2/`
  - File: `abbina_sicurezza-account.json`, `completa_la_frase_sicurezza-account.json`, `quiz_sicurezza-account.json`, `speedquiz_sicurezza-account.json`, `vero_o_falso_sicurezza-account.json`

- **Protezione dei Dati**
  - Chiave: `protezione-dati`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo3/`
  - File: `abbina_protezione-dati.json`, `completa_la_frase_protezione-dati.json`, `quiz_protezione-dati.json`, `speedquiz_protezione-dati.json`, `vero_o_falso_protezione-dati.json`

- **Sicurezza Quotidiana**
  - Chiave: `sicurezza-quotidiana`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo4/`
  - File: `abbina_sicurezza_quotidiana.json`, `completa_la_frase_sicurezza_quotidiana.json`, `quiz_sicurezza_quotidiana.json`, `speedquiz_sicurezza_quotidiana.json`, `vero_o_falso_sicurezza_quotidiana.json`

- **Sicurezza dei Pagamenti**
  - Chiave: `sicurezza-pagamenti`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo5/`
  - File: `abbina_sicurezza-pagamenti.json`, `completa_la_frase_sicurezza-pagamenti.json`, `quiz_sicurezza-pagamenti.json`, `speedquiz_sicurezza-pagamenti.json`, `vero_o_falso_sicurezza-pagamenti.json`

- **Privacy e Normative**
  - Chiave: `privacy-normative`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo6/`
  - File: `abbina_privacy-normative.json`, `completa_la_frase_privacy-normative.json`, `quiz_privacy-normative.json`, `speedquiz_privacy-normative.json`, `vero_o_falso_privacy-normative.json`

- **Sicurezza Online e Social Network**
  - Chiave: `sicurezza-online-social-network`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo7/`
  - File: `abbina_sicurezza-online-social-network.json`, `completa_la_frase_sicurezza-online-social-network.json`, `quiz_sicurezza-online-social-network.json`, `speedquiz_sicurezza-online-social-network.json`, `vero_o_falso_sicurezza-online-social-network.json`

- **Nuove Minacce Digitali**
  - Chiave: `nuove-minacce-digitali`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Cybersecurity_Non_solo_antivirus_e_password/modulo8/`
  - File: `abbina_nuove-minacce-digitali.json`, `completa_la_frase_nuove-minacce-digitali.json`, `quiz_nuove-minacce-digitali.json`, `speedquiz_nuove-minacce-digitali.json`, `vero_o_falso_nuove-minacce-digitali.json`

---

### 🌐 Area Reti e Internet

**Stato:** attiva
**Nota:** contenuti presenti, JSON realizzati e caricati.

```text
data/
└── Minigiochi/
    └── Reti_e_Internet/
        ├── modulo1/
        │   ├── abbina_fondamenta-reti.json
        │   ├── completa_la_frase_fondamenta-reti.json
        │   ├── quiz_fondamenta-reti.json
        │   ├── speedquiz_fondamenta-reti.json
        │   └── vero_o_falso_fondamenta-reti.json
        ├── modulo2/
        │   ├── abbina_tcp-ip.json
        │   ├── completa_la_frase_tcp-ip.json
        │   ├── quiz_tcp-ip.json
        │   ├── speedquiz_tcp-ip.json
        │   └── vero_o_falso_tcp-ip.json
        ├── modulo3/
        │   ├── abbina_dns.json
        │   ├── completa_la_frase_dns.json
        │   ├── quiz_dns.json
        │   ├── speedquiz_dns.json
        │   └── vero_o_falso_dns.json
        ├── modulo4/
        │   ├── abbina_router-switch-dispositivi.json
        │   ├── completa_la_frase_router-switch-dispositivi.json
        │   ├── quiz_router-switch-dispositivi.json
        │   ├── speedquiz_router-switch-dispositivi.json
        │   └── vero_o_falso_router-switch-dispositivi.json
        ├── modulo5/
        │   ├── abbina_wifi-reti-wireless.json
        │   ├── completa_la_frase_wifi-reti-wireless.json
        │   ├── quiz_wifi-reti-wireless.json
        │   ├── speedquiz_wifi-reti-wireless.json
        │   └── vero_o_falso_wifi-reti-wireless.json
        ├── modulo6/
        │   ├── abbina_cloud-networking.json
        │   ├── completa_la_frase_cloud-networking.json
        │   ├── quiz_cloud-networking.json
        │   ├── speedquiz_cloud-networking.json
        │   └── vero_o_falso_cloud-networking.json
        ├── modulo7/
        │   ├── abbina_vpn.json
        │   ├── completa_la_frase_vpn.json
        │   ├── quiz_vpn.json
        │   ├── speedquiz_vpn.json
        │   └── vero_o_falso_vpn.json
        └── modulo8/
            ├── abbina_troubleshooting-reti.json
            ├── completa_la_frase_troubleshooting-reti.json
            ├── quiz_troubleshooting-reti.json
            ├── speedquiz_troubleshooting-reti.json
            └── vero_o_falso_troubleshooting-reti.json
```

- **Le fondamenta delle reti**
  - Chiave: `fondamenta-reti`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo1/`
  - File: `abbina_fondamenta-reti.json`, `completa_la_frase_fondamenta-reti.json`, `quiz_fondamenta-reti.json`, `speedquiz_fondamenta-reti.json`, `vero_o_falso_fondamenta-reti.json`

- **Il protocollo TCP/IP**
  - Chiave: `tcp-ip`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo2/`
  - File: `abbina_tcp-ip.json`, `completa_la_frase_tcp-ip.json`, `quiz_tcp-ip.json`, `speedquiz_tcp-ip.json`, `vero_o_falso_tcp-ip.json`

- **DNS: la rubrica di Internet**
  - Chiave: `dns`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo3/`
  - File: `abbina_dns.json`, `completa_la_frase_dns.json`, `quiz_dns.json`, `speedquiz_dns.json`, `vero_o_falso_dns.json`

- **Router, Switch e dispositivi di rete**
  - Chiave: `router-switch-dispositivi`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo4/`
  - File: `abbina_router-switch-dispositivi.json`, `completa_la_frase_router-switch-dispositivi.json`, `quiz_router-switch-dispositivi.json`, `speedquiz_router-switch-dispositivi.json`, `vero_o_falso_router-switch-dispositivi.json`

- **Wi-Fi e reti wireless**
  - Chiave: `wifi-reti-wireless`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo5/`
  - File: `abbina_wifi-reti-wireless.json`, `completa_la_frase_wifi-reti-wireless.json`, `quiz_wifi-reti-wireless.json`, `speedquiz_wifi-reti-wireless.json`, `vero_o_falso_wifi-reti-wireless.json`

- **Cloud Networking**
  - Chiave: `cloud-networking`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo6/`
  - File: `abbina_cloud-networking.json`, `completa_la_frase_cloud-networking.json`, `quiz_cloud-networking.json`, `speedquiz_cloud-networking.json`, `vero_o_falso_cloud-networking.json`

- **VPN e comunicazioni sicure**
  - Chiave: `vpn`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo7/`
  - File: `abbina_vpn.json`, `completa_la_frase_vpn.json`, `quiz_vpn.json`, `speedquiz_vpn.json`, `vero_o_falso_vpn.json`

- **Troubleshooting delle reti**
  - Chiave: `troubleshooting-reti`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Reti_e_Internet/modulo8/`
  - File: `abbina_troubleshooting-reti.json`, `completa_la_frase_troubleshooting-reti.json`, `quiz_troubleshooting-reti.json`, `speedquiz_troubleshooting-reti.json`, `vero_o_falso_troubleshooting-reti.json`

---

### 🦠 Area Malware e Minacce Informatiche

**Stato:** attiva
**Nota:** contenuti presenti, JSON realizzati e caricati.

```text
data/
└── Minigiochi/
    └── Malware_e_Minacce_Informatiche/
        └── modulo1/
            ├── abbina_malware-e-minacce-informatiche.json
            ├── completa_la_frase_malware-e-minacce-informatiche.json
            ├── quiz_malware-e-minacce-informatiche.json
            ├── speedquiz_malware-e-minacce-informatiche.json
            └── vero_o_falso_malware-e-minacce-informatiche.json
```

- **Malware e Minacce Informatiche**
  - Chiave: `malware-e-minacce-informatiche`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Malware_e_Minacce_Informatiche/modulo1/`
  - File: `abbina_malware-e-minacce-informatiche.json`, `completa_la_frase_malware-e-minacce-informatiche.json`, `quiz_malware-e-minacce-informatiche.json`, `speedquiz_malware-e-minacce-informatiche.json`, `vero_o_falso_malware-e-minacce-informatiche.json`

---

### 🤖 Area Intelligenza Artificiale

**Stato:** attiva
**Nota:** contenuti presenti, JSON da realizzare.

```text
data/
└── Minigiochi/
    └── Intelligenza_Artificiale/
        ├── modulo1/
        │   ├── abbina_cos-e-l-ai.json
        │   ├── completa_la_frase_cos-e-l-ai.json
        │   ├── quiz_cos-e-l-ai.json
        │   ├── speedquiz_cos-e-l-ai.json
        │   └── vero_o_falso_cos-e-l-ai.json
        ├── modulo2/
        │   ├── abbina_come-funziona-l-ai.json
        │   ├── completa_la_frase_come-funziona-l-ai.json
        │   ├── quiz_come-funziona-l-ai.json
        │   ├── speedquiz_come-funziona-l-ai.json
        │   └── vero_o_falso_come-funziona-l-ai.json
        ├── modulo3/
        │   ├── abbina_come-funzionano-gli-llm.json
        │   ├── completa_la_frase_come-funzionano-gli-llm.json
        │   ├── quiz_come-funzionano-gli-llm.json
        │   ├── speedquiz_come-funzionano-gli-llm.json
        │   └── vero_o_falso_come-funzionano-gli-llm.json
        ├── modulo4/
        │   ├── abbina_ai-generativa.json
        │   ├── completa_la_frase_ai-generativa.json
        │   ├── quiz_ai-generativa.json
        │   ├── speedquiz_ai-generativa.json
        │   └── vero_o_falso_ai-generativa.json
        ├── modulo5/
        │   ├── abbina_prompt-engineering.json
        │   ├── completa_la_frase_prompt-engineering.json
        │   ├── quiz_prompt-engineering.json
        │   ├── speedquiz_prompt-engineering.json
        │   └── vero_o_falso_prompt-engineering.json
        ├── modulo6/
        │   ├── abbina_agenti-automazione.json
        │   ├── completa_la_frase_agenti-automazione.json
        │   ├── quiz_agenti-automazione.json
        │   ├── speedquiz_agenti-automazione.json
        │   └── vero_o_falso_agenti-automazione.json
        ├── modulo7/
        │   ├── abbina_deepfake-contenuti-sintetici.json
        │   ├── completa_la_frase_deepfake-contenuti-sintetici.json
        │   ├── quiz_deepfake-contenuti-sintetici.json
        │   ├── speedquiz_deepfake-contenuti-sintetici.json
        │   └── vero_o_falso_deepfake-contenuti-sintetici.json
        ├── modulo8/
        │   ├── abbina_provenienza-dei-contenuti.json
        │   ├── completa_la_frase_provenienza-dei-contenuti.json
        │   ├── quiz_provenienza-dei-contenuti.json
        │   ├── speedquiz_provenienza-dei-contenuti.json
        │   └── vero_o_falso_provenienza-dei-contenuti.json
        ├── modulo9/
        │   ├── abbina_verificare-l-ai.json
        │   ├── completa_la_frase_verificare-l-ai.json
        │   ├── quiz_verificare-l-ai.json
        │   ├── speedquiz_verificare-l-ai.json
        │   └── vero_o_falso_verificare-l-ai.json
        ├── modulo10/
        │   ├── abbina_etica-dell-ai.json
        │   ├── completa_la_frase_etica-dell-ai.json
        │   ├── quiz_etica-dell-ai.json
        │   ├── speedquiz_etica-dell-ai.json
        │   └── vero_o_falso_etica-dell-ai.json
        ├── modulo11/
        │   ├── abbina_bias-algoritmici.json
        │   ├── completa_la_frase_bias-algoritmici.json
        │   ├── quiz_bias-algoritmici.json
        │   ├── speedquiz_bias-algoritmici.json
        │   └── vero_o_falso_bias-algoritmici.json
        ├── modulo12/
        │   ├── abbina_ai-act.json
        │   ├── completa_la_frase_ai-act.json
        │   ├── quiz_ai-act.json
        │   ├── speedquiz_ai-act.json
        │   └── vero_o_falso_ai-act.json
        └── modulo13/
            ├── abbina_futuro-dell-ai.json
            ├── completa_la_frase_futuro-dell-ai.json
            ├── quiz_futuro-dell-ai.json
            ├── speedquiz_futuro-dell-ai.json
            └── vero_o_falso_futuro-dell-ai.json
```

- **Cos'è l'AI**
  - Chiave: `cos-e-l-ai`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo1/`
  - File: `abbina_cos-e-l-ai.json`, `completa_la_frase_cos-e-l-ai.json`, `quiz_cos-e-l-ai.json`, `speedquiz_cos-e-l-ai.json`, `vero_o_falso_cos-e-l-ai.json`

- **Come funziona l'AI**
  - Chiave: `come-funziona-l-ai`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo2/`
  - File: `abbina_come-funziona-l-ai.json`, `completa_la_frase_come-funziona-l-ai.json`, `quiz_come-funziona-l-ai.json`, `speedquiz_come-funziona-l-ai.json`, `vero_o_falso_come-funziona-l-ai.json`

- **Come funzionano gli LLM**
  - Chiave: `come-funzionano-gli-llm`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo3/`
  - File: `abbina_come-funzionano-gli-llm.json`, `completa_la_frase_come-funzionano-gli-llm.json`, `quiz_come-funzionano-gli-llm.json`, `speedquiz_come-funzionano-gli-llm.json`, `vero_o_falso_come-funzionano-gli-llm.json`

- **AI Generativa**
  - Chiave: `ai-generativa`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo4/`
  - File: `abbina_ai-generativa.json`, `completa_la_frase_ai-generativa.json`, `quiz_ai-generativa.json`, `speedquiz_ai-generativa.json`, `vero_o_falso_ai-generativa.json`

- **Prompt Engineering**
  - Chiave: `prompt-engineering`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo5/`
  - File: `abbina_prompt-engineering.json`, `completa_la_frase_prompt-engineering.json`, `quiz_prompt-engineering.json`, `speedquiz_prompt-engineering.json`, `vero_o_falso_prompt-engineering.json`

- **Agenti e Automazione**
  - Chiave: `agenti-automazione`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo6/`
  - File: `abbina_agenti-automazione.json`, `completa_la_frase_agenti-automazione.json`, `quiz_agenti-automazione.json`, `speedquiz_agenti-automazione.json`, `vero_o_falso_agenti-automazione.json`

- **Deepfake e Contenuti Sintetici**
  - Chiave: `deepfake-contenuti-sintetici`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo7/`
  - File: `abbina_deepfake-contenuti-sintetici.json`, `completa_la_frase_deepfake-contenuti-sintetici.json`, `quiz_deepfake-contenuti-sintetici.json`, `speedquiz_deepfake-contenuti-sintetici.json`, `vero_o_falso_deepfake-contenuti-sintetici.json`

- **Provenienza dei Contenuti**
  - Chiave: `provenienza-dei-contenuti`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo8/`
  - File: `abbina_provenienza-dei-contenuti.json`, `completa_la_frase_provenienza-dei-contenuti.json`, `quiz_provenienza-dei-contenuti.json`, `speedquiz_provenienza-dei-contenuti.json`, `vero_o_falso_provenienza-dei-contenuti.json`

- **Verificare l'AI**
  - Chiave: `verificare-l-ai`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo9/`
  - File: `abbina_verificare-l-ai.json`, `completa_la_frase_verificare-l-ai.json`, `quiz_verificare-l-ai.json`, `speedquiz_verificare-l-ai.json`, `vero_o_falso_verificare-l-ai.json`

- **Etica dell'AI**
  - Chiave: `etica-dell-ai`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo10/`
  - File: `abbina_etica-dell-ai.json`, `completa_la_frase_etica-dell-ai.json`, `quiz_etica-dell-ai.json`, `speedquiz_etica-dell-ai.json`, `vero_o_falso_etica-dell-ai.json`

- **Bias Algoritmici**
  - Chiave: `bias-algoritmici`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo11/`
  - File: `abbina_bias-algoritmici.json`, `completa_la_frase_bias-algoritmici.json`, `quiz_bias-algoritmici.json`, `speedquiz_bias-algoritmici.json`, `vero_o_falso_bias-algoritmici.json`

- **AI Act**
  - Chiave: `ai-act`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo12/`
  - File: `abbina_ai-act.json`, `completa_la_frase_ai-act.json`, `quiz_ai-act.json`, `speedquiz_ai-act.json`, `vero_o_falso_ai-act.json`

- **Il Futuro dell'AI**
  - Chiave: `futuro-dell-ai`
  - Stato: `attivo`
  - Path base: `data/Minigiochi/Intelligenza_Artificiale/modulo13/`
  - File: `abbina_futuro-dell-ai.json`, `completa_la_frase_futuro-dell-ai.json`, `quiz_futuro-dell-ai.json`, `speedquiz_futuro-dell-ai.json`, `vero_o_falso_futuro-dell-ai.json`

---

## 4. Riepilogo

| Area / Sotto-area | Moduli | File attesi | Realizzati | Da realizzare | Stato area |
|---|---|---|---|---|---|
| ECDL — Computer Essentials | 4 | 20 | 20 | 0 | attivo |
| ECDL — Online Essentials | 4 | 20 | 20 | 0 | attivo |
| ECDL — Word Processing | 5 | 25 | 0 | 25 | attivo |
| ECDL — Spreadsheet | 5 | 25 | 0 | 25 | attivo |
| ECDL — Presentation | 3 | 15 | 0 | 15 | attivo |
| Cyberbullismo e Sicurezza Online | 6 | 30 | 0 | 30 | attiva |
| Cybersecurity — Non solo antivirus e password | 8 | 40 | 40 | 0 | attiva |
| Reti e Internet | 8 | 40 | 40 | 0 | attiva |
| Malware e Minacce Informatiche | 1 | 5 | 5 | 0 | attiva |
| Intelligenza Artificiale | 13 | 65 | 0 | 65 | attiva |
| **Totale** | **57** | **285** | **125** | **160** | — |

- **Aree:** 6
- **Sotto-aree ECDL:** 5 (Computer Essentials, Online Essentials, Word Processing, Spreadsheet, Presentation)
- **Moduli totali mappati:** 57
- **File JSON realizzati:** 125
- **File JSON da realizzare:** 160
- **File JSON totali attesi:** 285
