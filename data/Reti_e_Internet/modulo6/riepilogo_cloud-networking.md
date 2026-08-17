# Riepilogo Modulo — Cloud Networking

**Chiave modulo:** `cloud-networking`

## Contenuti generati

| Mini-gioco | File | Elementi |
|---|---|---|
| Quiz | `quiz_cloud-networking.json` | 39 domande |
| SpeedQuiz | `speedquiz_cloud-networking.json` | 39 domande (identiche al Quiz) |
| Abbina | `abbina_cloud-networking.json` | 5 set, 25 coppie termine-definizione |
| Completa la frase | `completa_la_frase_cloud-networking.json` | 40 frasi |
| Vero o Falso | `vero_o_falso_cloud-networking.json` | 28 affermazioni (18 vere, 10 false) |

## Capitoli coperti dal PDF sorgente

1. Cos'è il Cloud Networking
2. Data Center
3. Dal dispositivo al cloud
4. CDN, Load Balancing e Scalabilità
5. Google Drive e Netflix

## Note sulla generazione

- Tutti i contenuti sono ricavati esclusivamente dal PDF ufficiale del modulo (Modulo 6 — Cloud Networking).
- Il personaggio narrativo "Luca" è stato rimosso da tutte le domande, generalizzando gli scenari.
- Il modulo ha 5 capitoli (contro i 7 dei moduli precedenti della stessa area), quindi il numero di elementi generati è proporzionalmente inferiore, in coerenza con la ricchezza effettiva del contenuto disponibile.
- I casi reali documentati inclusi: crescita dei servizi cloud durante la pandemia di COVID-19, incendio del Data Center OVHcloud a Strasburgo (2021), interruzione della rete Google Cloud (2022), malfunzionamento della CDN di Fastly (2021), riduzione del bitrate di Netflix (2020).
- Difficoltà impostata su `easy` per tutti gli elementi, come da convenzione.
- Validazione eseguita: assenza di duplicati (domande, frasi, affermazioni, termini, definizioni), ID progressivi e univoci, `correctIndex` nel range 0-3, 4 opzioni non duplicate per Quiz/SpeedQuiz, bank da 4 opzioni con risposta corretta inclusa per Completa la frase, round-trip JSON verificato, nessun riferimento al personaggio narrativo.
- Mini-gioco Memory escluso, come da direttiva generale.
