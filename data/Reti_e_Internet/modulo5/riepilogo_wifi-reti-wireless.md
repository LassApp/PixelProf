# Riepilogo Modulo — Wi-Fi e reti wireless

**Chiave modulo:** `wifi-reti-wireless`

## Contenuti generati

| Mini-gioco | File | Elementi |
|---|---|---|
| Quiz | `quiz_wifi-reti-wireless.json` | 53 domande |
| SpeedQuiz | `speedquiz_wifi-reti-wireless.json` | 53 domande (identiche al Quiz) |
| Abbina | `abbina_wifi-reti-wireless.json` | 6 set, 28 coppie termine-definizione |
| Completa la frase | `completa_la_frase_wifi-reti-wireless.json` | 50 frasi |
| Vero o Falso | `vero_o_falso_wifi-reti-wireless.json` | 35 affermazioni (23 vere, 12 false) |

## Capitoli coperti dal PDF sorgente

1. Cos'è il Wi-Fi
2. Standard Wi-Fi
3. Bande di frequenza
4. SSID e accesso
5. Sicurezza Wi-Fi
6. Segnale e interferenze
7. Migliorare il Wi-Fi

## Note sulla generazione

- Tutti i contenuti sono ricavati esclusivamente dal PDF ufficiale del modulo (Modulo 5 – Wi-Fi e reti wireless).
- Il personaggio narrativo "Luca" e i nomi di rete a lui riconducibili (es. Casa_Luca) sono stati rimossi da tutte le domande, generalizzando gli scenari.
- I casi reali documentati inclusi: diffusione del Wi-Fi durante la pandemia di COVID-19, vulnerabilità KRACK del 2017 sul protocollo WPA2, router con SSID/password predefiniti, crescita del mercato Wi-Fi Mesh.
- Difficoltà impostata su `easy` per tutti gli elementi, come da convenzione.
- Validazione eseguita: assenza di duplicati (domande, frasi, affermazioni, termini, definizioni), ID progressivi e univoci, `correctIndex` nel range 0-3, 4 opzioni non duplicate per Quiz/SpeedQuiz, bank da 4 opzioni con risposta corretta inclusa per Completa la frase, round-trip JSON verificato, nessun riferimento al personaggio narrativo.
- Mini-gioco Memory escluso, come da direttiva generale.
