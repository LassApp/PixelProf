/* ==================================================
   act-select.js — PixelProf (redesign card modalità/
   minigiochi + overlay impostazioni, v8.20.0)
   ------------------------------------------------------------------
   File dedicato e isolato (richiesta esplicita: CSS e JS di questo
   nuovo "menu" a parte, per alleggerire index.html) — stessa
   impostazione di js/flip-card.js.

   Contiene SOLO la chiusura del nuovo overlay impostazioni.
   L'APERTURA resta interamente CSS: la regola
   "#setup-overlay-backdrop:has(#setup-panel:not(.hidden))" in
   css/act-select.css reagisce alla stessa classe "hidden" che
   selAct() (game-engine-state.js) già toglie da #setup-panel oggi,
   invariata — quindi non serve nessun hook JS per mostrare il
   pannello, solo per nasconderlo di nuovo (prima non esisteva un
   modo per "chiudere": il pannello spariva solo cambiando
   schermata).

   Vincolo rispettato: selAct(), selNum(), selMode(), addInd(),
   triggerCsvImport(), handleCsvFileSelect(), launch() NON sono
   toccate — zero nuove regole di business, solo mostra/nascondi.
================================================== */

/* Richiamata dalla × in alto a destra del pannello e dal click sul
   velo esterno al box (vedi onclick su #setup-overlay-backdrop in
   index.html). Nasconde di nuovo #setup-panel — la stessa identica
   classe che selAct() toglie per mostrarlo, quindi lo stato interno
   del pannello (numero domande, modalità, giocatori scelti) non
   viene toccato qui: resta quello che era finché non si rientra in
   una card (selAct() lo resetta comunque, invariato — vedi nota in
   fondo al riepilogo di consegna). */
function closeSetupOverlay(){
  const p = sh('setup-panel');
  if(p) p.classList.add('hidden');
}

/* Esc per chiudere: convenzione standard di qualunque overlay
   modale già in app (ppAlert/ppConfirmBox/ppPromptBox, import CSV —
   vedi game-engine-state.js/csv-import.js). Lì il listener viene
   agganciato/rimosso al momento dell'apertura/chiusura perché quelle
   funzioni APRONO l'overlay via JS proprio; qui l'apertura è CSS
   pura (sopra), quindi non c'è un hook JS "all'apertura" a cui
   agganciarsi senza toccare selAct() — un listener permanente con
   controllo di visibilità è la soluzione più semplice che rispetta
   il vincolo "nessuna modifica a selAct()". Costo trascurabile
   (un controllo di classe ad ogni keydown). */
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  const p = sh('setup-panel');
  if(p && !p.classList.contains('hidden')) closeSetupOverlay();
});
