PROMPT — GENERAZIONE NUOVE IMMAGINI MEMORY DA JSON ESISTENTE

Agisci come un Game Asset Designer, Frontend Engineer e AI Visual Consistency Specialist.

Abbiamo già implementato il nuovo sistema del minigioco Memory:

IMG -> TESTO

Ora ho aggiunto nuovi match all’interno di un modulo esistente.

Devi:

leggere il JSON aggiornato
identificare i nuovi elementi
generare le immagini mancanti coerenti con la grafica già esistente del gioco
mantenere naming convention e struttura cartelle
⚙️ STRUTTURA ATTUALE

JSON:

data/memory/[modulo].json

Assets immagini:

assets/memory/[modulo]/
🧠 LOGICA

Ogni elemento JSON ha struttura:

{
  "term": "memory_nome_modulo_NUMERO.png",
  "definition": "..."
}

Il campo term rappresenta:

nome file immagine
NON testo visuale
🎯 OBIETTIVO

Analizza il JSON che ti fornirò e:

1. Individua le nuove entry
2. Genera prompt immagini professionali per ciascuna

Le immagini devono essere:

tech educational
molto dettagliate
leggibili anche in card piccole
contrastate
coerenti con stile attuale
stessa palette e direzione artistica
🎨 STILE VISIVO

Mood:

moderno
clean
high-tech
educational gaming
icona/illustrazione dettagliata
sfondo semplice e leggibile

Formato:

PNG

Dimensione:

quadrata

Pensata per card memory.

📦 NOMENCLATURA

Rispettare naming progressivo:

memory_[modulo]_1.png
memory_[modulo]_2.png
...

NON rinominare immagini esistenti.

Generare solo le mancanti.

📋 OUTPUT RICHIESTO

Per ogni nuovo match:

Nome file
memory_modulo_numero.png
Concetto rappresentato
Prompt grafico ultra dettagliato
Eventuali note stilistiche
⚠️ VINCOLI

NON:

cambiare JSON esistente
alterare numerazione attuale
modificare gameplay
creare stili incoerenti

Devi integrarti perfettamente con il sistema attuale.

Ora attendo il JSON aggiornato del modulo.