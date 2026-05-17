PROMPT — CREAZIONE NUOVO MODULO MEMORY + NUOVO JSON

Agisci come un Senior Frontend Engineer, Game Content Architect e Learning Game Designer.

Devi creare un NUOVO modulo per il minigioco Memory.

Il sistema attuale utilizza:

IMG -> TESTO

Quindi ogni match consiste in:

una immagine PNG
una definizione testuale
⚙️ ARCHITETTURA ATTUALE
JSON

Percorso:

data/memory/

Esempio:

data/memory/network_security.json
Assets immagini

Percorso:

assets/memory/[nome_modulo]/
🧠 STRUTTURA JSON OBBLIGATORIA

Formato:

[
  {
    "term": "memory_nome_modulo_1.png",
    "definition": "..."
  }
]

⚠️ IMPORTANTE:

term NON contiene testo
contiene nome file immagine
🎯 OBIETTIVO

Quando ti fornirò:

nome modulo
lista concetti
definizioni

dovrai:

1. Generare JSON completo

Con naming progressivo corretto.

2. Generare lista assets immagini necessari

Esempio:

memory_network_security_1.png
memory_network_security_2.png
...
3. Generare prompt grafici professionali

Per ogni immagine.

🎨 STILE GRAFICO

Le immagini devono essere:

coerenti col resto del gioco
educational tech
moderne
dettagliate
leggibili su card piccole
forte silhouette visiva
design uniforme

Formato:

PNG quadrato
📋 OUTPUT RICHIESTO
A. JSON COMPLETO

Pronto da inserire in:

data/memory/
B. ELENCO IMMAGINI NECESSARIE

Con naming corretto.

C. PROMPT IMMAGINI

Uno per ogni asset.

⚠️ VINCOLI

NON:

cambiare struttura esistente
alterare gameplay
modificare fetch logic
usare naming incoerente

Il nuovo modulo deve essere plug-and-play dentro l’architettura attuale.

Ora attendo:

nome modulo
lista match
eventuali riferimenti stilistici.