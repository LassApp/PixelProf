/* ==================================================
   app.js — PixelProf v5.0.7
   App bootstrap: auth flow, login, logout, set-password,
   module filter, wizard, director panel, and splash/init.
   v5.0.0 M5: _deleteClassroomRest legge credenziali da
   window.__SB (impostato da supabase_client.js) —
   nessuna stringa hardcoded in questo file.
   v5.0.7 FIX: _afterLogin() (ramo pendingId, ingresso aula
     dopo location.reload per cambio aula) ora attende
     _applyModuleFilter(pendingId) PRIMA di chiamare
     _enterCourseDirect(pendingId). Stesso bug gemello di
     enterCourse() in courses.js: due setTimeout indipendenti
     facevano disegnare la UI prima che il fetch Supabase
     della whitelist moduli fosse completo.
================================================== */

/* ==================================================
   APP STATE v3.1.2
================================================== */
const appState = {
  teacher:   null,
  classroom: null,
};

/* ==================================================
   LOGIN / LOGOUT
================================================== */
async function doLogin(){
  const email = sh('login-email')?.value.trim() ?? '';
  const pwd   = sh('login-pwd')?.value ?? '';
  if(!email || !pwd){ _showLoginError('Inserisci email e password.'); return; }
  const btn = sh('login-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin .8s linear infinite"></i> Accesso...';
  const res = await window.Auth.login(email, pwd);
  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-login"></i> Accedi';
  if(!res.ok){ _showLoginError(res.error || 'Credenziali non valide.'); return; }
  sh('login-error').classList.remove('visible');
  await _afterLogin();
}

function _showLoginError(msg){
  const el = sh('login-error');
  if(el){ el.textContent = msg; el.classList.add('visible'); }
}

async function _afterLogin(){
  appState.teacher = window.Auth.getProfile();
  const isDir = window.Auth.isDirector();

  // Badge topbar screen-courses
  const nameEl    = sh('cs-teacher-name');
  const dirBadge  = sh('cs-director-badge');
  if(nameEl)    nameEl.textContent = appState.teacher?.name || window.Auth.getName();
  if(dirBadge)  dirBadge.classList.toggle('hidden', !isDir);
  // Badge ruolo docente nella screen-courses (visibile solo ai non-direttori)
  const teacherRoleBadge = sh('cs-teacher-role-badge');
  if(teacherRoleBadge) teacherRoleBadge.classList.toggle('hidden', isDir);
  if(teacherRoleBadge) teacherRoleBadge.style.display = isDir ? 'none' : 'inline-flex';

  // Badge ruolo+nome nella topbar dell'app (sempre visibile quando si è in gioco)
  const tbBadge   = sh('tb-user-badge');
  const tbRole    = sh('tb-user-role-pill');
  const tbName    = sh('tb-user-name');
  if(tbBadge){ tbBadge.style.display='flex'; }
  if(tbRole){
    if(isDir){ tbRole.textContent='👑 Dir'; tbRole.style.background='rgba(255,215,0,.12)'; tbRole.style.borderColor='rgba(255,215,0,.3)'; tbRole.style.color='#ffd700'; }
    else     { tbRole.textContent='📖 Doc'; tbRole.style.background='rgba(0,207,255,.1)'; tbRole.style.borderColor='rgba(0,207,255,.25)'; tbRole.style.color='#00cfff'; }
  }
  if(tbName) tbName.textContent = appState.teacher?.name || window.Auth.getName();

  // Il form "Crea aula" e' solo per il direttore
  const addForm = sh('cs-add-form-wrap');
  if(addForm) addForm.classList.toggle('teacher-mode', !isDir);

  sh('screen-login').classList.add('hidden');
  const cs = sh('screen-courses');
  cs.classList.remove('hidden');
  cs.classList.add('entering');
  setTimeout(()=>cs.classList.remove('entering'), 400);

  await _reloadCourses();

  // v3.2.2: se c'è un'aula pending da sessionStorage (cambio aula con reload),
  // entra direttamente senza passare dalla griglia
  try{
    const pendingId = sessionStorage.getItem('pp_pending_course');
    if(pendingId){
      sessionStorage.removeItem('pp_pending_course');
      const courses = loadCourses();
      const course  = courses.find(c=>c.id===pendingId);
      if(course){
        appState.classroom = course;
        // Piccolo delay per permettere alla griglia di renderizzarsi,
        // poi attende la risposta Supabase (getEnabledModules) PRIMA di
        // mostrare l'aula con _enterCourseDirect.
        // v5.0.7 FIX: in precedenza i due setTimeout erano indipendenti —
        // _enterCourseDirect (80ms) disegnava step-mod con tutti i moduli
        // visibili, e _applyModuleFilter (200ms) arrivava 120ms troppo tardi
        // senza che nessuno richiamasse un secondo render. Risultato: la
        // whitelist Supabase non veniva mai applicata su questo percorso
        // (cambio aula con reload pagina).
        setTimeout(async ()=>{
          await _applyModuleFilter(pendingId);
          _enterCourseDirect(pendingId);
        }, 80);
        return;
      }
    }
  }catch(e){}
}

/* Carica le aule dal cloud e aggiorna la griglia.
   v3.2.0: carica anche i docenti per ogni aula (display nelle card).
   - Il direttore vede TUTTE le aule.
   - Un docente vede SOLO le aule a cui e' assegnato.
   La RPC get_teacher_classrooms filtra gia' lato DB. */
async function _reloadCourses(){
  const teacherId = window.Auth?.getUserId();
  if(!teacherId || !window.DB){ renderCoursesGrid(); return; }
  try{
    const list = await window.DB.loadClassrooms(teacherId);
    const enriched = (list||[]).map(c => {
      if(!c._teachers && c.teachers){
        c._teachers = Array.isArray(c.teachers) ? c.teachers : [];
      }
      if(!c._teachers) c._teachers = [];
      return c;
    });
    localStorage.setItem('pp5_courses', JSON.stringify(enriched));
    invalidateCoursesCache(); // M4: il cloud ha scritto su localStorage — invalida la cache
    console.log('[PixelProf] _reloadCourses: caricate', enriched.length, 'aule');
  }catch(e){
    console.warn('[PixelProf] _reloadCourses fallback localStorage:', e);
  }
  renderCoursesGrid();
}

async function doLogout(){
  const _execLogout = async () => { resetSessionState(); await _performLogout(); };
  if(isGameActive()){
    ppConfirm(_execLogout);
    return;
  }
  const t=sh('pp-dialog-title'), s=sh('pp-dialog-sub'), y=sh('pp-dialog-yes');
  const _prevT=t?.textContent, _prevS=s?.textContent, _prevY=y?.textContent;
  const _prevYes=sh('pp-dialog-yes')?.onclick, _prevNo=sh('pp-dialog-no')?.onclick;
  if(t) t.textContent='Esci da PixelProf?';
  if(s) s.textContent='Verrai disconnesso e dovrai accedere nuovamente.';
  if(y) y.textContent='Sì, esci';
  sh('pp-dialog-yes').onclick = function(){
    sh('pp-dialog-overlay').classList.add('hidden');
    sh('pp-dialog-yes').onclick = _prevYes;
    sh('pp-dialog-no').onclick  = _prevNo;
    if(t) t.textContent=_prevT; if(s) s.textContent=_prevS; if(y) y.textContent=_prevY;
    _execLogout();
  };
  sh('pp-dialog-no').onclick = function(){
    sh('pp-dialog-overlay').classList.add('hidden');
    sh('pp-dialog-yes').onclick = _prevYes;
    sh('pp-dialog-no').onclick  = _prevNo;
    if(t) t.textContent=_prevT; if(s) s.textContent=_prevS; if(y) y.textContent=_prevY;
    _setDialogCopy('exit');
    closeHubMenu(); // Bug fix: chiude Hub quando si annulla il logout
  };
  closeHubMenu(); // Bug fix: chiude Hub prima di aprire il dialog
  sh('pp-dialog-overlay').classList.remove('hidden');
}

async function _performLogout(){
  appState.teacher   = null;
  appState.classroom = null;
  activeCourseId     = null;
  db                 = makeEmptyDb();
  window._activeModuleKeys = null; // reset filtro moduli aula
  // Chiude Hub se aperto
  if(typeof closeHubMenu === 'function') closeHubMenu();
  const badge = sh('tb-course-badge');
  if(badge) badge.style.display = 'none';
  sh('screen-courses').classList.add('hidden');
  document.querySelector('.app').style.display = 'none';
  sh('screen-login').classList.remove('hidden');
  if(sh('login-email'))  sh('login-email').value = '';
  if(sh('login-pwd'))    sh('login-pwd').value   = '';
  if(sh('login-error'))  sh('login-error').classList.remove('visible');
  if(window.Auth) await window.Auth.logout();
}

/* ==================================================
   FILTRO MODULI — applica i moduli abilitati per l'aula
   keys=null => tutti visibili; keys=[] => nessuno
================================================== */
/**
 * _applyModuleFilter — v5.0.6
 *
 * Carica i moduli abilitati per l'aula dal cloud (async),
 * li salva in window._activeModuleKeys come fonte di verità,
 * poi chiama _renderModuleFilter() (sincrona) per aggiornare il DOM.
 *
 * Separare fetch e render permette a goStep('mod') di richiamare
 * _renderModuleFilter() ogni volta senza fare una nuova chiamata
 * di rete — risolvendo il bug dei moduli che riapparivano al
 * ritorno in home dopo una partita.
 *
 * SEMANTICA keys:
 *   null       → nessuna whitelist configurata → tutti i moduli visibili
 *   []         → whitelist vuota configurata   → tutti i moduli visibili (edge case)
 *   ['CE','WP'] → mostra solo CE e WP
 */
async function _applyModuleFilter(classroomId){
  if(!window.DB){ _renderModuleFilter(); return; }
  let keys = null;
  try{
    keys = await window.DB.getEnabledModules(classroomId);
  }catch(e){
    console.warn('[PixelProf] _applyModuleFilter: getEnabledModules fallito, mostro tutto', e);
  }
  // Salva i moduli abilitati come fonte di verità per l'aula corrente.
  // null e [] sono semanticamente equivalenti: nessun filtro.
  window._activeModuleKeys = (keys && keys.length > 0) ? keys : null;
  _renderModuleFilter();
}

/**
 * _renderModuleFilter — sincrona, zero rete.
 *
 * Legge window._activeModuleKeys e aggiorna la visibilità
 * delle card modulo nel DOM. Viene chiamata da:
 *   • _applyModuleFilter (dopo il fetch)
 *   • goStep('mod') (ad ogni ritorno alla home)
 *
 * In questo modo il filtro è sempre corretto indipendentemente
 * dal percorso di navigazione, senza fare una nuova chiamata
 * Supabase ad ogni pressione del tasto Home o fine partita.
 */
function _renderModuleFilter(){
  const keys = window._activeModuleKeys || null;
  const ALL = ['CE','OE','MIX','WP','SS'];
  ALL.forEach(k=>{
    const card = shq('mc-'+k); // shq: silenzioso se #mc-SS non esiste
    if(!card) return;
    const show = !keys || keys.includes(k);
    card.style.display = show ? '' : 'none';
  });
}
// Esposta su window per essere raggiungibile da goStep() in game-engine-state.js
// (file caricato prima di app.js, non può referenziare funzioni locali di questo file)
window._renderModuleFilter = _renderModuleFilter;

/* ==================================================
   WIZARD NUOVA AULA — v3.1.2
================================================== */
const _cw = {
  step:       1,
  name:       '',
  icon:       '🏫',
  mods:       [],
  teachers:   [],
  pendingMods:[],
};

function openCourseWizard(){
  if(!window.Auth?.isDirector()){
    alert('Solo il direttore puo\' creare nuove aule.');
    return;
  }
  const prefilledName = (sh('cs-course-inp')?.value || '').trim();
  _cw.step=1; _cw.name=prefilledName; _cw.icon='🏫'; _cw.mods=[]; _cw.teachers=[];
  const inp = sh('cw-name-inp');
  if(inp) inp.value = prefilledName;
  const ig = sh('cw-icon-grid');
  if(ig) ig.innerHTML = COURSE_ICONS.map(ic=>
    `<button class="icp-btn${_cw.icon===ic?' selected':''}" onclick="_cwPickIcon('${escAttr(ic)}')">${ic}</button>`
  ).join('');
  // Reset tutti i campi Step 1
  ['cw-start-date','cw-end-date','cw-time-start','cw-time-end'].forEach(id=>{
    const el=sh(id); if(el){el.value='';el.style.borderColor='';el.style.boxShadow='';}
  });
  const dew=document.getElementById('cw-date-err-wrap');if(dew){dew.textContent='';dew.style.display='none';}
  const tew=document.getElementById('cw-time-err');if(tew){tew.textContent='';tew.style.display='none';}
  const _fb = sh('cw-invite-fb'); if(_fb) _fb.textContent='';
  const _ei = sh('cw-invite-email'); if(_ei) _ei.value='';
  const _ni = sh('cw-invite-name'); if(_ni) _ni.value='';
  _cwGoStep(1);
  sh('course-wizard-overlay').classList.remove('hidden');
  setTimeout(()=>{ if(inp){ inp.focus(); inp.selectionStart=inp.selectionEnd=inp.value.length; } }, 100);
}

function closeCourseWizard(){
  sh('course-wizard-overlay').classList.add('hidden');
}

function _cwPickIcon(ic){
  _cw.icon=ic;
  document.querySelectorAll('#cw-icon-grid .icp-btn').forEach(b=>b.classList.toggle('selected', b.textContent.trim()===ic));
}

function _cwGoStep(n){
  _cw.step=n;
  [1,2,3].forEach(i=>{
    sh('cw-step-'+i)?.classList.toggle('active', i===n);
    const dot=sh('cw-dot-'+i);
    if(dot){ dot.classList.toggle('done', i<n); dot.classList.toggle('active', i===n); }
  });
  if(n===2) _cwInitModStep();
  if(n===3) _cwInitTeacherStep();
}

function _cwShowFieldError(inpEl, msg, errContainerId){
  if(inpEl){ inpEl.style.borderColor='#ff6b6b'; inpEl.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)'; }
  const cont=document.getElementById(errContainerId);
  if(cont){ cont.textContent='✗ '+msg; cont.style.display='block'; }
  setTimeout(()=>{
    if(inpEl){ inpEl.style.borderColor=''; inpEl.style.boxShadow=''; }
    if(cont){ cont.textContent=''; cont.style.display='none'; }
  },3500);
}

function cwStep(n){
  if(n===2){
    const name=(sh('cw-name-inp')?.value||'').trim();
    if(!name){ sh('cw-name-inp')?.focus(); sh('cw-name-inp')?.classList.add('error'); return; }
    const existing=loadCourses().find(c=>c.name.trim().toLowerCase()===name.toLowerCase());
    if(existing){
      const inp=sh('cw-name-inp');
      if(inp){ inp.classList.add('error'); inp.style.borderColor='#ff6b6b'; }
      let errEl=document.getElementById('cw-name-err');
      if(!errEl){ errEl=document.createElement('div'); errEl.id='cw-name-err'; errEl.style.cssText='font-size:11px;color:#ff6b6b;margin-top:4px;font-family:Share Tech Mono,monospace'; inp?.parentNode?.appendChild(errEl); }
      errEl.textContent='✗ Impossibile creare l\'aula: esiste già un\'aula con questo nome.';
      setTimeout(()=>{ if(errEl)errEl.textContent=''; if(inp){inp.classList.remove('error');inp.style.borderColor='';} },3500);
      return;
    }

    // ── Date obbligatorie ──
    const startVal=(sh('cw-start-date')?.value||'').trim();
    const endVal  =(sh('cw-end-date')?.value  ||'').trim();
    const errWrap = document.getElementById('cw-date-err-wrap');
    const _clearDateErr=()=>{
      ['cw-start-date','cw-end-date'].forEach(id=>{
        const el=sh(id); if(el){el.style.borderColor='';el.style.boxShadow='';}
      });
      if(errWrap){errWrap.textContent='';errWrap.style.display='none';}
    };
    if(!startVal){
      const el=sh('cw-start-date');
      if(el){el.style.borderColor='#ff6b6b';el.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)';el.focus();}
      if(errWrap){errWrap.textContent='✗ La data di inizio è obbligatoria.';errWrap.style.display='block';}
      setTimeout(_clearDateErr,3500); return;
    }
    if(!endVal){
      const el=sh('cw-end-date');
      if(el){el.style.borderColor='#ff6b6b';el.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)';el.focus();}
      if(errWrap){errWrap.textContent='✗ La data di fine è obbligatoria.';errWrap.style.display='block';}
      setTimeout(_clearDateErr,3500); return;
    }
    if(endVal < startVal){
      const el=sh('cw-end-date');
      if(el){el.style.borderColor='#ff6b6b';el.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)';el.focus();}
      if(errWrap){errWrap.textContent='✗ La data di fine non può essere precedente alla data di inizio.';errWrap.style.display='block';}
      setTimeout(_clearDateErr,3500); return;
    }

    // ── Fascia oraria obbligatoria (2 picker) ──
    const tStart=(sh('cw-time-start')?.value||'').trim();
    const tEnd  =(sh('cw-time-end')?.value  ||'').trim();
    const tErr=document.getElementById('cw-time-err');
    const _clearTimeErr=()=>{
      ['cw-time-start','cw-time-end'].forEach(id=>{
        const el=sh(id); if(el){el.style.borderColor='';el.style.boxShadow='';}
      });
      if(tErr){tErr.textContent='';tErr.style.display='none';}
    };
    if(!tStart){
      const el=sh('cw-time-start');
      if(el){el.style.borderColor='#ff6b6b';el.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)';el.focus();}
      if(tErr){tErr.textContent='✗ Inserisci l\'orario di inizio.';tErr.style.display='block';}
      setTimeout(_clearTimeErr,3500); return;
    }
    if(!tEnd){
      const el=sh('cw-time-end');
      if(el){el.style.borderColor='#ff6b6b';el.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)';el.focus();}
      if(tErr){tErr.textContent='✗ Inserisci l\'orario di fine.';tErr.style.display='block';}
      setTimeout(_clearTimeErr,3500); return;
    }
    if(tEnd <= tStart){
      const el=sh('cw-time-end');
      if(el){el.style.borderColor='#ff6b6b';el.style.boxShadow='0 0 0 3px rgba(255,60,80,.15)';el.focus();}
      if(tErr){tErr.textContent='✗ L\'orario di fine deve essere successivo all\'inizio.';tErr.style.display='block';}
      setTimeout(_clearTimeErr,3500); return;
    }

    // tutto ok — pulisce errori residui
    _clearDateErr(); _clearTimeErr();
    sh('cw-name-inp')?.classList.remove('error');
    sh('cw-name-inp')?.style && (sh('cw-name-inp').style.borderColor='');
    const errEl=document.getElementById('cw-name-err'); if(errEl)errEl.textContent='';
    _cw.name=name;
  }
  if(n===3){
    if(_cw.mods.length===0){ alert('Seleziona almeno un modulo.'); return; }
  }
  _cwGoStep(n);
}

function _cwInitModStep(){
  document.querySelectorAll('#cw-mod-grid .cw-mod-btn').forEach(btn=>{
    const mod=btn.dataset.mod;
    btn.classList.toggle('active', _cw.mods.includes(mod));
  });
  _cwUpdateModNext();
}

function cwToggleMod(btn){
  const mod = btn.dataset.mod;
  const idx = _cw.mods.indexOf(mod);
  if(idx>=0) _cw.mods.splice(idx,1);
  else _cw.mods.push(mod);
  btn.classList.toggle('active', _cw.mods.includes(mod));
  _cwUpdateModNext();
}

function _cwUpdateModNext(){
  const next = sh('cw-next-2');
  if(next) next.disabled = _cw.mods.length===0;
}

async function _cwInitTeacherStep(){
  const sel = sh('cw-teacher-select');
  if(sel){
    const prevVal = sel.value;
    sel.innerHTML='<option value="">— Seleziona docente —</option>';
    try{
      const teachers = await window.Auth.listTeachers();
      (teachers||[]).forEach(t=>{
        const o=document.createElement('option');
        o.value=t.id; o.textContent=t.name||t.id;
        sel.appendChild(o);
      });
    }catch(e){}
    if(prevVal) sel.value = prevVal;
  }
  _cwRenderTeachers();
}

function _cwRenderTeachers(){
  const el = sh('cw-teacher-list');
  const banner = document.getElementById('cw-teacher-required-banner');
  const createBtn = sh('cw-btn-create');
  if(!el) return;
  if(!_cw.teachers.length){
    el.innerHTML='';
    if(banner) banner.style.display='flex';
    if(createBtn) createBtn.disabled=true;
    return;
  }
  if(banner) banner.style.display='none';
  if(createBtn) createBtn.disabled=false;
  el.innerHTML = _cw.teachers.map((t,i)=>`
    <div class="cw-teacher-row">
      <div><div class="ct-name">${escHtml(t.name)}</div><div class="ct-email">${escHtml(t.id)}</div></div>
      <button onclick="_cwRemoveTeacher(${i})">Rimuovi</button>
    </div>`).join('');
}

function _cwRemoveTeacher(i){
  _cw.teachers.splice(i,1);
  _cwRenderTeachers();
}

function cwAddTeacher(){
  const sel=sh('cw-teacher-select');
  if(!sel||!sel.value) return;
  const id=sel.value;
  const name=sel.options[sel.selectedIndex].text;
  if(_cw.teachers.find(t=>t.id===id)) return;
  _cw.teachers.push({id,name});
  sel.value='';
  _cwRenderTeachers();
}

async function cwInviteTeacher(){
  const emailInp = sh('cw-invite-email');
  const nameInp  = sh('cw-invite-name');
  const email = (emailInp?.value||'').trim();
  const name  = (nameInp?.value||'').trim();
  const fb    = sh('cw-invite-fb');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!email || !emailRe.test(email)){
    if(fb){ fb.style.color='#ff6b6b'; fb.textContent='Inserisci un indirizzo email valido (es. docente@scuola.it)'; }
    emailInp?.focus();
    return;
  }
  if(fb){ fb.style.color='rgba(255,255,255,.4)'; fb.textContent='⏳ Invio in corso...'; }
  try{
    const res = await window.Auth.inviteTeacher(email, name||email);
    if(res.ok){
      if(fb){ fb.style.color='#00ff96'; fb.textContent='✓ Invito inviato a ' + email; }
      const newTeacher = { id: res.user_id || res.userId || email, name: name||email };
      if(!_cw.teachers.find(t=>t.id===newTeacher.id)){
        _cw.teachers.push(newTeacher);
      }
      _cwRenderTeachers();
      const sel = sh('cw-teacher-select');
      if(sel && res.user_id){
        const existing = sel.querySelector(`option[value="${CSS.escape(res.user_id)}"]`);
        if(!existing){
          const opt = document.createElement('option');
          opt.value       = res.user_id;
          opt.textContent = name||email;
          sel.appendChild(opt);
        }
        sel.value = res.user_id;
      }
    } else {
      if(fb){ fb.style.color='#ff6b6b'; fb.textContent='✗ Errore: '+(res.error||'sconosciuto'); }
    }
  }catch(e){
    if(fb){ fb.style.color='#ff6b6b'; fb.textContent='✗ Errore di rete. Riprova.'; }
  }
}

async function cwCreateClassroom(){
  const btn = sh('cw-btn-create');
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="ti ti-loader-2" style="animation:spin .8s linear infinite"></i> Creazione...'; }
  const teacherId = window.Auth?.getUserId();
  if(!teacherId || !window.DB){
    if(btn){ btn.disabled=false; btn.innerHTML='<i class="ti ti-check"></i> Crea aula'; }
    alert('Errore: sessione non valida.'); return;
  }

  // Docente obbligatorio — double-check lato JS
  if(!_cw.teachers.length){
    if(btn){ btn.disabled=true; btn.innerHTML='<i class="ti ti-check"></i> Crea aula'; }
    const banner=document.getElementById('cw-teacher-required-banner');
    if(banner){banner.style.display='flex';banner.style.animation='none';void banner.offsetWidth;banner.style.animation='';}
    return;
  }

  const courses  = loadCourses();
  const colorIdx = courses.length % COLOR_PALETTE.length;
  const startDate = sh('cw-start-date')?.value || null;
  const endDate   = sh('cw-end-date')?.value   || null;
  // Compone timeSlot dai 2 picker HH:MM – HH:MM
  const tStart=(sh('cw-time-start')?.value||'').trim();
  const tEnd  =(sh('cw-time-end')?.value  ||'').trim();
  const timeSlot = (tStart && tEnd) ? (tStart + ' – ' + tEnd) : null;

  const res = await window.DB.createClassroom(teacherId, {
    name:     _cw.name,
    icon:     _cw.icon,
    colorIdx,
    bgIdx:    colorIdx,
    startDate,
    endDate,
    timeSlot,
  });
  if(!res.ok){
    console.error('[PixelProf] createClassroom:', res.error);
    if(btn){ btn.disabled=false; btn.innerHTML='<i class="ti ti-check"></i> Crea aula'; }
    alert('Errore creazione aula: '+res.error); return;
  }
  const classroomId = res.course?.id || res.id;
  if(_cw.mods.length > 0){
    await window.DB.setEnabledModules(classroomId, _cw.mods).catch(e=>console.warn('[PixelProf] setEnabledModules:', e));
  }
  for(const t of _cw.teachers){
    await window.DB.assignTeacherToClassroom(classroomId, t.id).catch(e=>console.warn('[PixelProf] assignTeacher:', e));
  }
  closeCourseWizard();
  await _reloadCourses();
  setTimeout(()=>{
    const card=document.querySelector('[data-course-id="'+classroomId+'"]');
    if(card){ card.style.boxShadow='0 0 0 2px #00ffc8'; setTimeout(()=>card.style.boxShadow='',1400); }
  }, 120);
}

/* ==================================================
   HELPER: custom confirm dialog per eliminazione aula
================================================== */
function _showDeleteClassroomConfirm(id, name, onConfirm){
  const t=sh('pp-dialog-title');
  const s=sh('pp-dialog-sub');
  const y=sh('pp-dialog-yes');
  if(t) t.textContent='Eliminare l\'aula?';
  if(s) s.innerHTML=`L\'azione è <strong>irreversibile</strong>. Eliminando <em>${escHtml(name)}</em> si eliminano per sempre tutti i dati collegati (giocatori, classifiche, progressi, sessioni). Procedere?`;
  if(y) y.textContent='Sì, elimina definitivamente';
  const prevYes=sh('pp-dialog-yes').onclick;
  const prevNo =sh('pp-dialog-no').onclick;
  sh('pp-dialog-yes').onclick=function(){
    sh('pp-dialog-overlay').classList.add('hidden');
    sh('pp-dialog-yes').onclick=prevYes;
    sh('pp-dialog-no').onclick=prevNo;
    onConfirm();
  };
  sh('pp-dialog-no').onclick=function(){
    sh('pp-dialog-overlay').classList.add('hidden');
    sh('pp-dialog-yes').onclick=prevYes;
    sh('pp-dialog-no').onclick=prevNo;
    _setDialogCopy('exit');
  };
  sh('pp-dialog-overlay').classList.remove('hidden');
}

/**
 * _deleteClassroomRest — v3.2.2 / v4.0.6
 *
 * Chiama la RPC director_delete_classroom (SECURITY DEFINER,
 * SET session_replication_role = replica) per bypassare i trigger
 * utente che bloccano il DELETE su classroom_teachers.
 *
 * SQL DA ESEGUIRE NEL SUPABASE SQL EDITOR:
 * ──────────────────────────────────────────
 * CREATE OR REPLACE FUNCTION director_delete_classroom(p_classroom_id uuid)
 * RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
 * BEGIN
 *   SET session_replication_role = replica;
 *   DELETE FROM scores              WHERE classroom_id = p_classroom_id;
 *   DELETE FROM leaderboard_entries WHERE classroom_id = p_classroom_id;
 *   DELETE FROM stats_aggregate     WHERE classroom_id = p_classroom_id;
 *   DELETE FROM classroom_modules   WHERE classroom_id = p_classroom_id;
 *   DELETE FROM classroom_teachers  WHERE classroom_id = p_classroom_id;
 *   DELETE FROM players             WHERE classroom_id = p_classroom_id;
 *   DELETE FROM teams               WHERE classroom_id = p_classroom_id;
 *   DELETE FROM matches             WHERE classroom_id = p_classroom_id;
 *   DELETE FROM classrooms          WHERE id           = p_classroom_id;
 *   SET session_replication_role = DEFAULT;
 * EXCEPTION WHEN OTHERS THEN
 *   SET session_replication_role = DEFAULT;
 *   RAISE;
 * END;
 * $$;
 * GRANT EXECUTE ON FUNCTION director_delete_classroom(uuid) TO authenticated;
 * ──────────────────────────────────────────
 */
async function _deleteClassroomRest(classroomId){
  try {
    // Credenziali lette da window.__SB — impostato da supabase_client.js (unica fonte di verità).
    const supabaseUrl = window.__SB?.url || '';
    const supabaseKey = window.__SB?.key || '';

    let jwt = null;
    try {
      const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if(sbKey){
        const stored = JSON.parse(localStorage.getItem(sbKey)||'{}');
        jwt = stored?.access_token || null;
      }
    } catch(e){}
    if(!jwt){
      try{
        for(const k of Object.keys(localStorage)){
          const v = localStorage.getItem(k);
          if(v && v.includes('access_token')){
            const p = JSON.parse(v);
            jwt = p?.access_token || p?.data?.access_token || null;
            if(jwt) break;
          }
        }
      }catch(e){}
    }

    const headers = {
      'Content-Type':  'application/json',
      'apikey':        supabaseKey,
    };
    if(jwt) headers['Authorization'] = 'Bearer ' + jwt;

    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/director_delete_classroom`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_classroom_id: classroomId }),
    });

    if(rpcRes.ok){
      console.log('[PixelProf] delete OK via RPC');
    } else {
      console.warn('[PixelProf] RPC fallita, fallback REST cascade');
      headers['Prefer'] = 'return=minimal';
      const tables = [
        'scores','leaderboard_entries','stats_aggregate',
        'classroom_modules','classroom_teachers',
        'players','teams','matches',
      ];
      for(const table of tables){
        await fetch(
          `${supabaseUrl}/rest/v1/${table}?classroom_id=eq.${encodeURIComponent(classroomId)}`,
          { method: 'DELETE', headers }
        ).catch(()=>{});
      }
      const resCls = await fetch(
        `${supabaseUrl}/rest/v1/classrooms?id=eq.${encodeURIComponent(classroomId)}`,
        { method: 'DELETE', headers }
      );
      if(!rpcRes.ok && !resCls.ok && resCls.status !== 404){
        const body = await rpcRes.text().catch(()=>'');
        return { ok: false, error: `RPC: ${body}` };
      }
    }

    try{
      const local = JSON.parse(localStorage.getItem('pp5_courses')||'[]');
      localStorage.setItem('pp5_courses', JSON.stringify(local.filter(c=>c.id!==classroomId)));
      invalidateCoursesCache(); // M4: localStorage modificato direttamente — invalida la cache
      localStorage.removeItem('pp5_cdata_'+classroomId);
    }catch(e){}

    return { ok: true };
  } catch(err) {
    console.error('[PixelProf] _deleteClassroomRest exception:', err);
    return { ok: false, error: err.message };
  }
}

/* ==================================================
   DIRECTOR PANEL — gestione docenti e moduli per aula
================================================== */
let _dpClassroomId    = null;
let _dpEnabledModules = [];

const ALL_MODULES = [
  { key:'CE',  label:'Computer Essentials' },
  { key:'OE',  label:'Online Essentials'   },
  { key:'MIX', label:'Mix moduli'          },
  { key:'WP',  label:'Word Processing'     },
  { key:'SS',  label:'Spreadsheets'        },
];

async function openDirectorPanel(){
  if(!window.Auth?.isDirector()) return;
  _dpClassroomId = _ddCourseId || activeCourseId;
  if(!_dpClassroomId){ alert('Seleziona prima un\'aula dal menu (tasto ...)'); return; }
  closeCourseMenu();
  sh('dp-overlay').classList.remove('hidden');
  sh('dp-invite-fb').textContent = '';
  await Promise.all([_dpLoadTeachers(), _dpLoadTeacherSelect(), _dpLoadModules()]);
}

function closeDirectorPanel(){
  sh('dp-overlay').classList.add('hidden');
  _dpClassroomId = null;
}

async function _dpLoadTeachers(){
  const list = await window.DB.getClassroomTeachers(_dpClassroomId).catch(()=>[]);
  const el   = sh('dp-teacher-list');
  if(!el) return;
  if(!list || !list.length){
    el.innerHTML='<div style="font-size:12px;color:rgba(255,255,255,.3)">Nessun docente assegnato</div>';
    return;
  }
  el.innerHTML = list.map(t=>`
    <div class="dp-teacher-row">
      <span>${escHtml(t.name||t.id)}</span>
      <button onclick="dpRemoveTeacher('${escAttr(t.id)}')" title="Rimuovi">x</button>
    </div>`).join('');
}

async function _dpLoadTeacherSelect(){
  const teachers = await window.Auth.listTeachers().catch(()=>[]);
  const sel = sh('dp-teacher-select');
  if(!sel) return;
  sel.innerHTML = '<option value="">— Seleziona docente —</option>';
  (teachers||[]).forEach(t=>{
    const opt = document.createElement('option');
    opt.value = t.id; opt.textContent = t.name||t.id;
    sel.appendChild(opt);
  });
}

async function dpAssignTeacher(){
  const sel = sh('dp-teacher-select');
  if(!sel||!sel.value) return;
  await window.DB.assignTeacherToClassroom(_dpClassroomId, sel.value).catch(()=>{});
  sel.value='';
  await _dpLoadTeachers();
  // Aggiorna le card nella griglia con i nuovi docenti
  await _reloadCourses();
}

async function dpRemoveTeacher(teacherId){
  if(!confirm('Rimuovere il docente dall\'aula?')) return;
  await window.DB.removeTeacherFromClassroom(_dpClassroomId, teacherId).catch(()=>{});
  await _dpLoadTeachers();
  // Aggiorna le card nella griglia con i docenti aggiornati
  await _reloadCourses();
}

async function dpInviteTeacher(){
  const email = sh('dp-invite-email')?.value.trim();
  const name  = sh('dp-invite-name')?.value.trim();
  const fb    = sh('dp-invite-fb');
  if(!email){ if(fb){fb.style.color='#ff6b6b';fb.textContent='Inserisci email valida.';} return; }
  if(fb){fb.style.color='rgba(255,255,255,.4)';fb.textContent='Invio...';}
  try{
    const res = await window.Auth.inviteTeacher(email, name||email);
    if(res.ok){
      if(fb){fb.style.color='#00ff96';fb.textContent='Invito inviato a '+email;}
      if(sh('dp-invite-email')) sh('dp-invite-email').value='';
      if(sh('dp-invite-name'))  sh('dp-invite-name').value='';
      await _dpLoadTeacherSelect();
    } else {
      if(fb){fb.style.color='#ff6b6b';fb.textContent='Errore: '+(res.error||'sconosciuto');}
    }
  }catch(e){
    if(fb){fb.style.color='#ff6b6b';fb.textContent='Errore di rete.';}
  }
}

async function _dpLoadModules(){
  const enabled = await window.DB.getEnabledModules(_dpClassroomId).catch(()=>null);
  _dpEnabledModules = enabled ? [...enabled] : [];
  const grid = sh('dp-mod-grid');
  if(!grid) return;
  grid.innerHTML = ALL_MODULES.map(m=>`
    <button class="mod-toggle-btn${_dpEnabledModules.includes(m.key)?' active':''}"
      data-modkey="${escAttr(m.key)}"
      onclick="dpToggleModule('${escAttr(m.key)}',this)">
      ${escHtml(m.label)}
    </button>`).join('');
}

function dpToggleModule(key, btn){
  const idx = _dpEnabledModules.indexOf(key);
  if(idx>=0) _dpEnabledModules.splice(idx,1);
  else _dpEnabledModules.push(key);
  btn.classList.toggle('active', _dpEnabledModules.includes(key));
}

async function dpSaveModules(){
  if(!_dpClassroomId) return;
  const res = await window.DB.setEnabledModules(_dpClassroomId, _dpEnabledModules).catch(e=>({ok:false,error:e.message}));
  if(res && res.ok){
    if(_dpClassroomId === activeCourseId) await _applyModuleFilter(_dpClassroomId);
    closeDirectorPanel();
  } else {
    alert('Errore salvataggio moduli: '+(res?.error||'sconosciuto'));
  }
}

/* ==================================================
   SET PASSWORD SCREEN — v3.1.2
================================================== */
window.__onPasswordRecovery = function() {
  sh('screen-login').classList.add('hidden');
  sh('screen-courses').classList.add('hidden');
  document.querySelector('.app').style.display = 'none';
  const email = window.Auth?.getUser()?.email || '';
  const lbl   = sh('setpwd-email-label');
  if (lbl) lbl.textContent = email;
  sh('screen-setpwd').classList.remove('hidden');
  setTimeout(() => sh('setpwd-new')?.focus(), 120);
};

window.__onPasswordSet = async function() {
  sh('screen-setpwd').classList.add('hidden');
  await _afterLogin();
};

(function() {
  function _attachPwdStrength() {
    const inp = sh('setpwd-new');
    if (!inp) { setTimeout(_attachPwdStrength, 200); return; }
    inp.addEventListener('input', () => _updatePwdStrength(inp.value));
  }
  _attachPwdStrength();
})();

function _updatePwdStrength(pwd) {
  const fill  = sh('setpwd-strength-fill');
  const label = sh('setpwd-strength-label');
  if (!fill || !label) return;
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { pct: '0%',   color: 'transparent', text: '' },
    { pct: '25%',  color: '#ff4d6d',     text: '⚠ Troppo corta' },
    { pct: '50%',  color: '#ffb400',     text: '▲ Debole' },
    { pct: '70%',  color: '#00cfff',     text: '◆ Discreta' },
    { pct: '88%',  color: '#7c6aff',     text: '● Buona' },
    { pct: '100%', color: '#00ffc8',     text: '✓ Ottima' },
  ];
  const lvl = levels[Math.min(score, 5)];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = lvl.color;
}

async function doSetPassword() {
  const newPwd  = sh('setpwd-new')?.value    || '';
  const confirm = sh('setpwd-confirm')?.value || '';
  const errEl   = sh('setpwd-error');
  const btn     = sh('setpwd-submit-btn');
  const showErr = (msg) => {
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  };
  const hideErr = () => {
    if (errEl) errEl.classList.remove('visible');
  };
  const resetBtn = () => {
    btn.disabled  = false;
    btn.innerHTML = '<i class="ti ti-lock-check"></i> Imposta password e accedi';
  };
  hideErr();
  if (newPwd.length < 6) { showErr('La password deve essere di almeno 6 caratteri.'); return; }
  if (newPwd !== confirm) { showErr('Le password non corrispondono.'); return; }
  btn.disabled  = true;
  btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin .8s linear infinite"></i> Salvataggio...';
  const res = await window.Auth.setPassword(newPwd);
  if (!res.ok) {
    resetBtn();
    showErr(res.error || 'Errore durante il salvataggio. Riprova.');
    return;
  }
  hideErr();
  let _entered = false;
  const _enterApp = async () => {
    if (_entered) return;
    _entered = true;
    clearTimeout(_fallback);
    sh('screen-setpwd').classList.add('hidden');
    await _afterLogin();
  };
  const _prevOnPwdSet = window.__onPasswordSet;
  window.__onPasswordSet = async function() {
    window.__onPasswordSet = _prevOnPwdSet;
    await _enterApp();
  };
  const _fallback = setTimeout(async () => {
    window.__onPasswordSet = _prevOnPwdSet;
    try {
      const freshUser = window.Auth?.checkSession
        ? await window.Auth.checkSession()
        : null;
      const isIn = !!freshUser || window.Auth?.isLoggedIn();
      if (isIn) {
        await _enterApp();
      } else {
        resetBtn();
        showErr('Sessione non rilevata. Ricarica la pagina e accedi con email e password.');
      }
    } catch(e) {
      resetBtn();
      showErr('Errore verifica sessione. Ricarica la pagina.');
    }
  }, 3000);
}

/* ==================================================
   HUB MENU — v5.0.6
   Menu compatto che raggruppa Classifica / Progressi / Storico.
   toggleHubMenu apre/chiude il dropdown.
   closeHubMenu viene chiamato da backdrop click e da ogni item.
   setTb patch: tb-home è nascosto nel DOM ma usato da setTb() —
   aggiorniamo tb-hub-btn per riflettere la sezione attiva.
================================================== */
function toggleHubMenu(evt){
  if(evt) evt.stopPropagation();
  const menu = sh('tb-hub-menu');
  const chev = sh('tb-hub-chev');
  const backdrop = sh('tb-hub-backdrop');
  if(!menu) return;
  const isOpen = !menu.classList.contains('hidden');
  if(isOpen){
    closeHubMenu();
  } else {
    menu.classList.remove('hidden');
    if(chev) chev.classList.add('open');
    if(backdrop){ backdrop.style.display='block'; }
    // Bug fix: chiude Hub cliccando fuori — listener una-tantum sul documento
    setTimeout(()=>{
      document.addEventListener('click', _hubOutsideClick, { once: true });
    }, 10);
  }
}

function _hubOutsideClick(e){
  const wrap = document.getElementById('tb-hub-wrap');
  if(wrap && wrap.contains(e.target)) return; // click dentro il menu — non chiudere
  closeHubMenu();
}

function closeHubMenu(){
  const menu = sh('tb-hub-menu');
  const chev = sh('tb-hub-chev');
  const backdrop = sh('tb-hub-backdrop');
  if(menu) menu.classList.add('hidden');
  if(chev) chev.classList.remove('open');
  if(backdrop){ backdrop.style.display='none'; }
}

/* setTb patch v5.0.6:
   tb-home è nascosto (display:none) ma setTb() lo cerca per rimuovere/aggiungere .active.
   Il comportamento legacy rimane invariato — tb-home riceve .active invisibilmente.
   In aggiunta, aggiorniamo .active sugli item Hub visibili. */
(function _patchSetTb(){
  const _HUB_TABS = ['lb','st','hist'];
  const _origSetTb = window.setTb; // non esiste ancora — sarà definita da game-engine-state.js
  // Monkey-patch dopo caricamento (DOMContentLoaded garantisce l'ordine)
  document.addEventListener('DOMContentLoaded', ()=>{
    const _gse_setTb = window.setTb;
    if(typeof _gse_setTb !== 'function') return;
    window.setTb = function(active){
      _gse_setTb(active);
      // Aggiorna .active sugli hub items
      document.querySelectorAll('.tb-hub-item').forEach(el => el.classList.remove('active'));
      if(active && _HUB_TABS.some(t => 'tb-'+t === active)){
        const item = sh(active);
        if(item) item.classList.add('active');
        // Evidenzia il pulsante Hub quando una sua sezione è attiva
        const hubBtn = sh('tb-hub-btn');
        if(hubBtn) hubBtn.classList.add('active');
      } else {
        const hubBtn = sh('tb-hub-btn');
        if(hubBtn) hubBtn.classList.remove('active');
      }
    };
  });
})();

/* ==================================================
   SPLASH + INIT v3.1.2
================================================== */
(function initApp(){
  const app = document.querySelector('.app');
  app.style.display = 'none';
  const splash = sh('screen-splash');

  setTimeout(()=>{
    splash.classList.add('splash-exit');
    setTimeout(async ()=>{
      splash.classList.add('hidden');
      if(window.__appBootstrap) await window.__appBootstrap;

      if(window.Auth && window.Auth.isLoggedIn()){
        if(window.Auth.needsPasswordSetup()){
          const setpwdScreen = sh('screen-setpwd');
          if(setpwdScreen && setpwdScreen.classList.contains('hidden')){
            window.__onPasswordRecovery();
          }
        } else {
          await _afterLogin();
        }
      } else {
        sh('screen-login').classList.remove('hidden');
      }
    }, 500);
  }, 1800);
})();
