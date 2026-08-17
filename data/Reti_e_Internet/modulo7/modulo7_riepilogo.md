# Modulo 7 — VPN e comunicazioni sicure

**module:** `vpn`
**Fonte:** Modulo7_VPN_e_comunicazioni_sicure.pdf (6 capitoli)

## Elementi generati

| File | Elementi | Note |
|---|---|---|
| `modulo7_abbina.json` | 26 coppie in 6 set | Fondamenti, Tunnel/HTTPS, Tipi di VPN, Uso/limiti, Privacy, Metafore |
| `modulo7_completa_la_frase.json` | 85 | Copertura di tutti e 6 i capitoli |
| `modulo7_quiz.json` | 49 | `type: "quiz"` |
| `modulo7_speedquiz.json` | 49 | Contenuto identico al Quiz (`type: "quiz"`) |
| `modulo7_vero_o_falso.json` | 42 | 24 vero / 18 falso |

**Totale elementi: 251**

## Distribuzione per capitolo (contenuto sorgente)

1. Cos'è una VPN
2. Il tunnel VPN
3. Tipi di VPN (Remote Access, Site-to-Site, Commerciali)
4. Quando usarla
5. VPN e privacy
6. Limiti delle VPN

## Controlli effettuati

- ✅ Fedeltà alla fonte (nessuna informazione esterna al PDF)
- ✅ Personaggio narrativo "Luca" generalizzato/rimosso da tutti gli elementi
- ✅ Nessuna domanda/frase/affermazione duplicata
- ✅ ID progressivi senza duplicati (Quiz, SpeedQuiz, Vero o Falso)
- ✅ `correctIndex` nel range 0–3, opzioni uniche
- ✅ Risposta sempre presente nel `bank` (Completa la frase)
- ✅ `answer` booleano (Vero o Falso)
- ✅ Quiz e SpeedQuiz con contenuto identico, `type: "quiz"`
- ✅ `module: "vpn"` conforme alla mappa ufficiale (sezione 7)
- ✅ `difficulty: "easy"` su tutti gli elementi con questo campo
- ✅ JSON sintatticamente validi

## Nota sullo schema

Per **Abbina** e **Completa la frase** è stato seguito esattamente lo schema già in uso nei file di progetto esistenti (senza campi `id`/`type`/`difficulty` a livello di singolo elemento). Per **Quiz**, **SpeedQuiz** e **Vero o Falso** — non essendo presenti file di riferimento nel progetto per questi tipi — è stata seguita la struttura specificata nel master prompt (sezione 8), con `id`, `module`, `type`, `difficulty` su ogni elemento.
