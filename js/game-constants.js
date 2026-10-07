/* ==================================================
   CONSTANTS
================================================== */
// v9: intonati alla palette (prima neon puri) — stesso ruolo (colori
// giocatore/squadra/coriandoli), stessa famiglia già usata altrove.
const COLORS=['#4E7464','#6E7A50','#AB5649','#7A5A38','#54708C'];

/* softColor(c) — SOLO per la visualizzazione (pallini giocatore/squadra in Classifica, Storico,
   Panoramica, setup squadre). Le sessioni già salvate portano i colori della vecchia palette neon
   (es. un verde acqua saturo): il dato salvato NON viene modificato, ma al momento di mostrarlo un colore neon
   viene riportato sulla famiglia earthy equivalente (stesso criterio usato per i CSS). I colori
   già in palette (COLORS) passano invariati. */
function softColor(c){
  if(typeof c!=='string') return c;
  const m=/^#([0-9a-f]{6})$/i.exec(c.trim()); if(!m) return c;
  const n=parseInt(m[1],16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn, v=mx/255, s=mx?d/mx:0;
  if(!((v>=.88&&s>=.38)||(v>=.95&&s>=.3)||(s>=.7&&v>=.6))) return c;
  let h=0;
  if(d){ if(mx===r)h=((g-b)/d)%6; else if(mx===g)h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; if(h<0)h+=360; }
  if(h<20||h>=345) return '#AB5649';   // rosso/rosa → terracotta
  if(h<38)  return '#9C6B3E';          // arancio   → rame
  if(h<70)  return '#B8935A';          // giallo    → miele
  if(h<190) return '#4E7464';          // verde/teal→ sage
  if(h<245) return '#54708C';          // blu       → slate
  if(h<290) return '#746996';          // viola     → viola spento
  return '#9D5875';                    // magenta   → dusty-rose
}

const MOD_LABEL={CE:'Computer Essentials',OE:'Online Essentials',WP:'Word Processor',SS:'Spreadsheets',PP:'Power Point',IT:'IT Security',OC:'Online Collaboration'};
// Etichetta modulo con fallback ad AreasConfig — MOD_LABEL resta la scorciatoia
// rapida per i 3 moduli ECDL storici; per qualsiasi altro modulo (Cybersecurity,
// Cyberbullismo, Reti, Malware, ...) si consulta window.AreasConfig, così le
// nuove aree non richiedono di elencare ogni modulo qui.
function modLabel(key){
  return MOD_LABEL[key] || (window.AreasConfig && window.AreasConfig.getModuleInfo(key)?.label) || key || '';
}
// Colore per-modulo (badge Classifica/Domande difficili, barre Progressi/
// Panoramica Classe). CE/OE/WP mantengono i colori fissi storici già
// usati altrove (.ce-card/.oe-card/.wp-card in pixelprof.css); per
// qualsiasi altro modulo si deriva dal colore della sua Area — stessa
// tripletta di --area-rgb in pixelprof.css, mirrorata qui in esadecimale
// per l'uso lato JS (style inline, non può leggere le CSS custom
// properties di un elemento non ancora nel DOM).
// v9: valori intonati alla palette navy/crema/oliva/fango (prima neon
// puri). Riuso le stesse tinte già stabilite per token/aree dove il
// colore originale corrispondeva alla stessa famiglia (es. #6E7A50
// era già --purple, ora oliva).
const MOD_COLOR_HEX  = { CE:'#7A5A38', OE:'#6E7A50', WP:'#54708C', SS:'#4A6B52', PP:'#9C6B3E', IT:'#AB5649', OC:'#9D5875' };
// Colori d'area "intonati" alla palette navy/crema/oliva/fango (prima erano
// neon puri, mirror esadecimale della tripletta --area-rgb "dark" in
// pixelprof.css — vedi anche l'override chiaro per la versione più scura).
// v9: aggiunta 'intelligenza-artificiale', assente qui ma già presente in
// AreasConfig e in --area-rgb (CSS) — gap pre-esistente, colmato qui.
const AREA_COLOR_HEX = {
  'ecdl': '#4e7464',
  'cyberbullismo-sicurezza-online': '#88673a',
  'cybersecurity': '#54708c',
  'reti-internet': '#746996',
  'malware-minacce': '#ab5649',
  'intelligenza-artificiale': '#9d5875',
};
function modColor(key){
  if(MOD_COLOR_HEX[key]) return MOD_COLOR_HEX[key];
  const area = window.AreasConfig && window.AreasConfig.getAreaForModule(key);
  return (area && AREA_COLOR_HEX[area.key]) || '#8a8fa3';
}
const ACT_LABEL={quiz:'Quiz',speed:'Speed Quiz',match:'Abbina',memory:'Memory',fill:'Completa la frase',truefalse:'Vero o Falso'};
const ACT_ICON={quiz:'🧠',speed:'⚡',match:'🔗',memory:'🃏',fill:'✏️',truefalse:'⚖️'};

const ACT_META={
  quiz:{icon:'🧠',title:'Quiz',sub:'Risposta multipla — scegli quella corretta',heroClass:'hero-quiz',
    bg:`<svg width="100%" height="100%" viewBox="0 0 660 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hq" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0L0 0 0 24" fill="none" stroke="#4E7464" stroke-width=".4" opacity=".25"/></pattern></defs><rect width="660" height="160" fill="url(#hq)"/><circle cx="580" cy="30" r="60" fill="none" stroke="#4E7464" stroke-width=".6" opacity=".15"/><circle cx="80" cy="140" r="50" fill="none" stroke="#4E7464" stroke-width=".5" opacity=".12"/><text x="40" y="55" font-family="monospace" font-size="11" fill="#4E7464" opacity=".18">A. opzione</text><text x="40" y="75" font-family="monospace" font-size="11" fill="#4E7464" opacity=".12">B. scelta</text><rect x="30" y="42" width="7" height="7" rx="1" fill="none" stroke="#4E7464" stroke-width=".8" opacity=".3"/><rect x="30" y="62" width="7" height="7" rx="1" fill="#4E7464" opacity=".25"/></svg>`},
  speed:{icon:'⚡',title:'Speed Quiz',sub:'60 secondi — quante ne riesci a fare?',heroClass:'hero-speed',
    bg:`<svg width="100%" height="100%" viewBox="0 0 660 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hs" width="30" height="30" patternUnits="userSpaceOnUse"><line x1="0" y1="30" x2="30" y2="0" stroke="#7A5A38" stroke-width=".4" opacity=".18"/></pattern></defs><rect width="660" height="160" fill="url(#hs)"/><circle cx="330" cy="80" r="70" fill="none" stroke="#7A5A38" stroke-width=".8" opacity=".15"/><line x1="320" y1="10" x2="300" y2="80" stroke="#7A5A38" stroke-width="1.5" opacity=".3" stroke-linecap="round"/><line x1="300" y1="80" x2="340" y2="70" stroke="#7A5A38" stroke-width="1.5" opacity=".3" stroke-linecap="round"/><line x1="340" y1="70" x2="310" y2="150" stroke="#7A5A38" stroke-width="1.5" opacity=".3" stroke-linecap="round"/><text x="530" y="90" font-family="monospace" font-size="44" fill="#7A5A38" opacity=".08" font-weight="bold">60</text></svg>`},
  match:{icon:'🔗',title:'Abbina',sub:'Collega ogni termine alla sua definizione',heroClass:'hero-match',
    bg:`<svg width="100%" height="100%" viewBox="0 0 660 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hm" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r=".8" fill="#6E7A50" opacity=".25"/></pattern></defs><rect width="660" height="160" fill="url(#hm)"/><rect x="30" y="40" width="120" height="22" rx="5" fill="none" stroke="#6E7A50" stroke-width=".8" opacity=".4"/><rect x="30" y="72" width="120" height="22" rx="5" fill="none" stroke="#6E7A50" stroke-width=".8" opacity=".3"/><rect x="510" y="40" width="120" height="22" rx="5" fill="none" stroke="#8B9968" stroke-width=".8" opacity=".4"/><rect x="510" y="72" width="120" height="22" rx="5" fill="none" stroke="#8B9968" stroke-width=".8" opacity=".3"/><line x1="150" y1="51" x2="510" y2="83" stroke="#6E7A50" stroke-width=".8" opacity=".3" stroke-dasharray="4 3"/><line x1="150" y1="83" x2="510" y2="115" stroke="#8B9968" stroke-width=".8" opacity=".25" stroke-dasharray="4 3"/></svg>`},
  memory:{icon:'🃏',title:'Memory',sub:'Trova le coppie nascoste — allena la memoria',heroClass:'hero-memory',
    bg:`<svg width="100%" height="100%" viewBox="0 0 660 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hmem" width="26" height="26" patternUnits="userSpaceOnUse"><rect x="4" y="4" width="18" height="18" rx="3" fill="none" stroke="#AB5649" stroke-width=".4" opacity=".2"/></pattern></defs><rect width="660" height="160" fill="url(#hmem)"/>${[0,1,2,3,4].map(i=>{const x=30+i*120;return`<rect x="${x}" y="40" width="80" height="80" rx="8" fill="rgba(171,86,73,.05)" stroke="#AB5649" stroke-width=".8" opacity="${i%2===0?.35:.2}"/><text x="${x+40}" y="88" text-anchor="middle" font-size="28" opacity=".12" fill="#AB5649">?</text>`;}).join('')}</svg>`},
  fill:{icon:'✏️',title:'Completa la frase',sub:'Inserisci il termine mancante nel contesto giusto',heroClass:'hero-fill',
    bg:`<svg width="100%" height="100%" viewBox="0 0 660 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hf" width="40" height="16" patternUnits="userSpaceOnUse"><line x1="0" y1="15" x2="40" y2="15" stroke="#54708C" stroke-width=".4" opacity=".2"/></pattern></defs><rect width="660" height="160" fill="url(#hf)"/><rect x="30" y="50" width="180" height="14" rx="3" fill="#54708C" opacity=".07"/><rect x="220" y="50" width="80" height="14" rx="3" fill="none" stroke="#54708C" stroke-width="1" opacity=".4" stroke-dasharray="3 2"/><rect x="310" y="50" width="130" height="14" rx="3" fill="#54708C" opacity=".05"/><rect x="30" y="80" width="240" height="14" rx="3" fill="#54708C" opacity=".06"/><rect x="280" y="80" width="100" height="14" rx="3" fill="none" stroke="#54708C" stroke-width="1" opacity=".3" stroke-dasharray="3 2"/></svg>`},
  truefalse:{icon:'⚖️',title:'Vero o Falso',sub:"Leggi l'affermazione e scegli: vero o falso?",heroClass:'hero-truefalse',
    bg:`<svg width="100%" height="100%" viewBox="0 0 660 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="htf" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r=".8" fill="#7A5A38" opacity=".22"/></pattern></defs><rect width="660" height="160" fill="url(#htf)"/><text x="70" y="100" font-family="monospace" font-size="70" fill="#4A6B52" opacity=".1" font-weight="bold">V</text><text x="540" y="100" font-family="monospace" font-size="70" fill="#AB5649" opacity=".1" font-weight="bold">F</text><line x1="330" y1="30" x2="330" y2="130" stroke="#7A5A38" stroke-width=".6" opacity=".2" stroke-dasharray="4 4"/></svg>`}
};

