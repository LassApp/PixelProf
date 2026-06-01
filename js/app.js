/* ==================================================
   app.js — PixelProf v4.0.5
   App bootstrap: auth flow, login, logout, set-password,
   module filter, wizard, cloud overrides, director panel,
   and splash/init.
   Depends on: all other modules.
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
        // Piccolo delay per permettere alla griglia di renderizzarsi
        setTimeout(()=> _enterCourse_orig(pendingId), 80);
        // Carica moduli in background
        setTimeout(()=> _applyModuleFilter(pendingId), 200);
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
      // La RPC v3.2.3 restituisce teachers già embedded come array
      // Compatibilità: accetta sia array che assente
      if(!c._teachers && c.teachers){
        c._teachers = Array.isArray(c.teachers) ? c.teachers : [];
      }
      if(!c._teachers) c._teachers = [];
      return c;
    });
    localStorage.setItem('pp5_courses', JSON.stringify(enriched));
    console.log('[PixelProf] _reloadCourses: caricate', enriched.length, 'aule');
  }catch(e){
    console.warn('[PixelProf] _reloadCourses fallback localStorage:', e);
  }
  renderCoursesGrid();
}

async function doLogout(){
  // Conferma sempre, sia durante il gioco sia fuori
  const _execLogout = async () => { resetSessionState(); await _performLogout(); };
  if(isGameActive()){
    ppConfirm(_execLogout);
    return;
  }
  // Fuori dal gioco: dialog custom con copia "logout"
  const t=sh('pp-dialog-title'), s=sh('pp-dialog-sub'), y=sh('pp-dialog-yes');
  const _prevT=t?.textContent, _prevS=s?.textContent, _prevY=y?.textContent;
  const _prevYes=sh('pp-dialog-yes')?.onclick, _prevNo=sh('pp-dialog-no')?.onclick;
  if(t) t.textContent='Esci da PixelProf?';
  if(s) s.textContent='Verrai disconnesso e dovrai accedere nuovamente.';
  if(y) y.textContent='Sì, esci';
  // Override callbacks per questo caso
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
    _setDialogCopy('exit'); // ripristina copia default
  };
  sh('pp-dialog-overlay').classList.remove('hidden');
}

async function _performLogout(){
  appState.teacher   = null;
  appState.classroom = null;
  activeCourseId     = null;
  db                 = makeEmptyDb();
  // Nascondi badge aula
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
async function _applyModuleFilter(classroomId){
  if(!window.DB) return;
  let keys = null;
  try{ keys = await window.DB.getEnabledModules(classroomId); }catch(e){}
  const ALL = ['CE','OE','MIX','WP','SS'];
  ALL.forEach(k=>{
    const card = sh('mc-'+k);
    if(!card) return;
    const show = !keys || keys.length===0 || keys.includes(k);
    card.style.display = show ? '' : 'none';
  });
}

/* ==================================================
   WIZARD NUOVA AULA — v3.1.2
   State locale del wizard
================================================== */
const _cw = {
  step:       1,
  name:       '',
  icon:       '🏫',
  mods:       [],        // chiavi moduli selezionati
  teachers:   [],        // [{id,name}] assegnati
  pendingMods:[],        // buffer per step 2
};

function openCourseWizard(){
  if(!window.Auth?.isDirector()){
    alert('Solo il direttore puo\' creare nuove aule.');
    return;
  }
  // Legge il testo pre-compilato dall'input esterno (se presente)
  const prefilledName = (sh('cs-course-inp')?.value || '').trim();

  // Reset stato
  _cw.step=1; _cw.name=prefilledName; _cw.icon='🏫'; _cw.mods=[]; _cw.teachers=[];
  const inp = sh('cw-name-inp');
  if(inp) inp.value = prefilledName;

  // Render icone
  const ig = sh('cw-icon-grid');
  if(ig) ig.innerHTML = COURSE_ICONS.map(ic=>
    `<button class="icp-btn${_cw.icon===ic?' selected':''}" onclick="_cwPickIcon('${escAttr(ic)}')">${ic}</button>`
  ).join('');

  // Reset form invito al riavvio del wizard
  const _fb = sh('cw-invite-fb'); if(_fb) _fb.textContent='';
  const _ei = sh('cw-invite-email'); if(_ei) _ei.value='';
  const _ni = sh('cw-invite-name'); if(_ni) _ni.value='';

  _cwGoStep(1);
  sh('course-wizard-overlay').classList.remove('hidden');
  // Focus alla fine del testo precompilato, oppure all'inizio se vuoto
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

// Step nav globale
function cwStep(n){
  if(n===2){
    const name=(sh('cw-name-inp')?.value||'').trim();
    if(!name){ sh('cw-name-inp')?.focus(); sh('cw-name-inp')?.classList.add('error'); return; }
    // Controlla nomi duplicati
    const existing=loadCourses().find(c=>c.name.trim().toLowerCase()===name.toLowerCase());
    if(existing){
      const inp=sh('cw-name-inp');
      if(inp){ inp.classList.add('error'); inp.style.borderColor='#ff6b6b'; }
      // Mostra errore inline sotto l'input
      let errEl=document.getElementById('cw-name-err');
      if(!errEl){ errEl=document.createElement('div'); errEl.id='cw-name-err'; errEl.style.cssText='font-size:11px;color:#ff6b6b;margin-top:4px;font-family:Share Tech Mono,monospace'; inp?.parentNode?.appendChild(errEl); }
      errEl.textContent='✗ Impossibile creare l\'aula: esiste già un\'aula con questo nome.';
      setTimeout(()=>{ if(errEl)errEl.textContent=''; if(inp){inp.classList.remove('error');inp.style.borderColor='';} },3500);
      return;
    }
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

/* --- Step 2: Moduli --- */
function _cwInitModStep(){
  // Ripristina selezione precedente
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

/* --- Step 3: Docenti --- */
async function _cwInitTeacherStep(){
  // Carica lista docenti disponibili nel select
  const sel = sh('cw-teacher-select');
  if(sel){
    // Salva il valore correntemente selezionato per ripristinarlo dopo il reload
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
    // Ripristina la selezione se ancora valida
    if(prevVal) sel.value = prevVal;
  }
  _cwRenderTeachers();
  // NON azzerare email/nome/feedback — l'utente potrebbe stare ancora correggendo
}

function _cwRenderTeachers(){
  const el = sh('cw-teacher-list');
  if(!el) return;
  if(!_cw.teachers.length){
    el.innerHTML='<div style="font-size:12px;color:rgba(255,255,255,.3);margin-bottom:8px">Nessun docente aggiunto ancora (facoltativo)</div>';
    return;
  }
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

  // Validazione email con regex base
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
      // ✓ NON svuotiamo l'email — feedback persistente visibile
      if(fb){ fb.style.color='#00ff96'; fb.textContent='✓ Invito inviato a ' + email; }

      // Aggiunge alla lista locale in attesa
      const newTeacher = { id: res.user_id || res.userId || email, name: name||email };
      if(!_cw.teachers.find(t=>t.id===newTeacher.id)){
        _cw.teachers.push(newTeacher);
      }
      _cwRenderTeachers();

      // Aggiorna il select picker aggiungendo il nuovo docente senza azzerare il form
      const sel = sh('cw-teacher-select');
      if(sel && res.user_id){
        // Rimuovi eventuale duplicato
        const existing = sel.querySelector(`option[value="${CSS.escape(res.user_id)}"]`);
        if(!existing){
          const opt = document.createElement('option');
          opt.value       = res.user_id;
          opt.textContent = name||email;
          sel.appendChild(opt);
        }
        // Auto-seleziona il nuovo docente nel picker
        sel.value = res.user_id;
      }
    } else {
      if(fb){ fb.style.color='#ff6b6b'; fb.textContent='✗ Errore: '+(res.error||'sconosciuto'); }
    }
  }catch(e){
    if(fb){ fb.style.color='#ff6b6b'; fb.textContent='✗ Errore di rete. Riprova.'; }
  }
}

/* --- Creazione finale --- */
async function cwCreateClassroom(){
  const btn = sh('cw-btn-create');
  if(btn){ btn.disabled=true; btn.innerHTML='<i class="ti ti-loader-2" style="animation:spin .8s linear infinite"></i> Creazione...'; }

  const teacherId = window.Auth?.getUserId();
  if(!teacherId || !window.DB){
    if(btn){ btn.disabled=false; btn.innerHTML='<i class="ti ti-check"></i> Crea aula'; }
    alert('Errore: sessione non valida.'); return;
  }

  const courses  = loadCourses();
  const colorIdx = courses.length % COLOR_PALETTE.length;

  // Legge date e fascia oraria dallo step 1
  const startDate = sh('cw-start-date')?.value || null;
  const endDate   = sh('cw-end-date')?.value   || null;
  const timeSlot  = (sh('cw-time-slot')?.value||'').trim() || null;

  // 1. Crea aula su Supabase
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

  // 2. Salva moduli abilitati
  if(_cw.mods.length > 0){
    await window.DB.setEnabledModules(classroomId, _cw.mods).catch(e=>console.warn('[PixelProf] setEnabledModules:', e));
  }

  // 3. Assegna docenti
  for(const t of _cw.teachers){
    await window.DB.assignTeacherToClassroom(classroomId, t.id).catch(e=>console.warn('[PixelProf] assignTeacher:', e));
  }

  // 4. Chiudi wizard e ricarica griglia
  closeCourseWizard();
  await _reloadCourses();

  // Flash sulla card creata
  setTimeout(()=>{
    const card=document.querySelector('[data-course-id="'+classroomId+'"]');
    if(card){ card.style.boxShadow='0 0 0 2px #00ffc8'; setTimeout(()=>card.style.boxShadow='',1400); }
  }, 120);
}

/* Helper: custom confirm dialog per eliminazione aula — v3.2.0 */
function _showDeleteClassroomConfirm(id, name, onConfirm){
  // Riusa il pp-dialog esistente con copia specifica
  const t=sh('pp-dialog-title');
  const s=sh('pp-dialog-sub');
  const y=sh('pp-dialog-yes');
  if(t) t.textContent='Eliminare l\'aula?';
  if(s) s.innerHTML=`L\'azione è <strong>irreversibile</strong>. Eliminando <em>${escHtml(name)}</em> si eliminano per sempre tutti i dati collegati (giocatori, classifiche, progressi, sessioni). Procedere?`;
  if(y) y.textContent='Sì, elimina definitivamente';
  // Override callbacks
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
    // Ripristina copia originale
    _setDialogCopy('exit');
  };
  sh('pp-dialog-overlay').classList.remove('hidden');
}

/* ==================================================
   OVERRIDE enterCourse — salva appState + filtra moduli
   v3.2.2: al cambio aula fa location.reload() con il
   nuovo classroomId nel sessionStorage, così lo stato
   JS è sempre pulito e i players/teams sono sempre
   quelli corretti dell'aula selezionata.
================================================== */
const _enterCourse_orig = enterCourse;
enterCourse = async function(id){
  const courses = loadCourses();
  const course  = courses.find(c=>c.id===id);
  if(!course) return;

  // Stessa aula già attiva → non ricaricare, entra direttamente
  if(id === activeCourseId){
    appState.classroom = course;
    _enterCourse_orig(id);
    await _applyModuleFilter(id);
    return;
  }

  // Aula diversa → salva la scelta e ricarica la pagina per stato JS pulito
  // sessionStorage sopravvive al reload ma non alla chiusura tab
  try{ sessionStorage.setItem('pp_pending_course', id); }catch(e){}
  location.reload();
};

/* ==================================================
   OVERRIDE cdAction — propaga modifiche al cloud
================================================== */
const _cdAction_orig = cdAction;
cdAction = async function(action){
  if(!window.DB || !window.Auth?.getUserId()){ _cdAction_orig(action); return; }
  const id = _ddCourseId;
  closeCourseMenu();
  if(!id) return;
  const courses = loadCourses();
  const idx     = courses.findIndex(c=>c.id===id);
  if(idx<0) return;

  if(action==='rename'){
    const newName = prompt('Nuovo nome aula:', courses[idx].name);
    if(!newName||!newName.trim()) return;
    await window.DB.updateClassroom(id, { name: newName.trim() });
    await _reloadCourses();
  } else if(action==='icon'){
    openIconPicker(id);
  } else if(action==='bg'){
    openBgPicker(id);
  } else if(action==='delete'){
    const courseName = courses[idx].name;
    _showDeleteClassroomConfirm(id, courseName, async ()=>{
      const delRes = await _deleteClassroomRest(id);
      if(!delRes.ok){
        // Estrai il messaggio Postgres dal JSON di errore se presente
        let errMsg = delRes.error || 'errore sconosciuto';
        try{
          const m = errMsg.match(/\{.*\}/s);
          if(m){ const p=JSON.parse(m[0]); if(p.message) errMsg=p.message; }
        }catch(e){}
        alert('❌ Impossibile eliminare l\'aula.\n\n' + errMsg + '\n\nEsegui la SQL director_delete_classroom nel Supabase SQL Editor (vedi istruzioni sotto).');
        return;
      }
      if(activeCourseId===id){ activeCourseId=null; appState.classroom=null; db=makeEmptyDb(); goCoursesFromApp(); }
      await _reloadCourses();
    });
  }
};

/**
 * _deleteClassroomRest — v3.2.2 fix
 *
 * Strategia: chiama la RPC director_delete_classroom che usa
 * SET session_replication_role = replica per bypassare i trigger
 * utente (incluso quello che blocca la rimozione del director).
 * session_replication_role non tocca i system trigger PostgreSQL
 * (RI_ConstraintTrigger) — bypassa solo i trigger BEFORE/AFTER
 * definiti dall'utente, che è esattamente quello che ci blocca.
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
 *
 * @param {string} classroomId
 * @returns {Promise<{ok:boolean, error?:string}>}
 */
async function _deleteClassroomRest(classroomId){
  try {
    const supabaseUrl = 'https://skrgqanqdyrybarinwwr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcmdxYW5xZHlyeWJhcmlud3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODk0MTYsImV4cCI6MjA5NDc2NTQxNn0.0k17FJuqYNWCk2bWwWkYF7-5l5qX3RLXdMsgh9cHrGQ';

    // Leggi JWT da localStorage (Supabase v2 persiste sempre qui)
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

    // Tenta prima via RPC (session_replication_role bypassa trigger utente)
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/director_delete_classroom`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_classroom_id: classroomId }),
    });

    if(rpcRes.ok){
      console.log('[PixelProf] delete OK via RPC');
    } else {
      // RPC non disponibile o errore — fallback REST in cascata
      // (funziona se il trigger sul director non è attivo o l'aula
      //  non ha un director in classroom_teachers)
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

    // Aggiorna cache locale
    try{
      const local = JSON.parse(localStorage.getItem('pp5_courses')||'[]');
      localStorage.setItem('pp5_courses', JSON.stringify(local.filter(c=>c.id!==classroomId)));
      localStorage.removeItem('pp5_cdata_'+classroomId);
    }catch(e){}

    return { ok: true };
  } catch(err) {
    console.error('[PixelProf] _deleteClassroomRest exception:', err);
    return { ok: false, error: err.message };
  }
}

/* ==================================================
   OVERRIDE pickIcon + _cpSaveAndUpdateCard — sync cloud
================================================== */
const _pickIcon_orig = pickIcon;
pickIcon = async function(icon){
  _pickIcon_orig(icon);
  if(window.DB && _ipCourseId){
    await window.DB.updateClassroom(_ipCourseId, { icon }).catch(()=>{});
    await _reloadCourses();
  }
};

const _cpSave_orig = _cpSaveAndUpdateCard;
_cpSaveAndUpdateCard = function(){
  _cpSave_orig();
  if(window.DB && _bpCourseId){
    window.DB.updateClassroom(_bpCourseId, { colorIdx:_cpColorIdx, bgIdx:_cpBgIdx }).catch(()=>{});
  }
};

/* ==================================================
   OVERRIDE saveLbEntry — hook cloud fire-and-forget
================================================== */
const _saveLbEntry_orig = saveLbEntry;
saveLbEntry = function(player, pts, act, mod){
  _saveLbEntry_orig(player, pts, act, mod);
  if(typeof window.hook_saveLbEntry === 'function') window.hook_saveLbEntry(player, pts, act, mod);
};

/* ==================================================
   OVERRIDE saveSessionResult — hook cloud
================================================== */
const _saveSession_orig = saveSessionResult;
saveSessionResult = function(act, mod){
  _saveSession_orig(act, mod);
  if(typeof window.hook_saveSession === 'function'){
    const participants = sMode==='sq' && matchState.teams.length
      ? matchState.teams.map(t=>({name:t.name,color:t.color,score:matchState.scores[t.name]||0,type:'sq'}))
      : players.map(p=>({name:p.name,color:p.color,score:qScores[p.name]||0,type:'ind'}));
    window.hook_saveSession(act, mod, sMode, participants, activeCourseId, qPool.length||null);
  }
};

/* ==================================================
   OVERRIDE ansQ — hook statistiche
================================================== */
setTimeout(()=>{
  const _ansQ_orig = ansQ;
  ansQ = function(idx){
    _ansQ_orig(idx);
    if(typeof window.hook_trackAnswer === 'function' && qAnswerLog.length){
      const last = qAnswerLog[qAnswerLog.length-1];
      const q    = qPool[Math.max(0, qIdx-1)];
      if(q) window.hook_trackAnswer(getQuestionModule(q), last.correct);
    }
  };
}, 0);

/* ==================================================
   OVERRIDE launch — hook ensureParticipants
================================================== */
const _launch_orig = launch;
launch = async function(){
  if(typeof window.hook_ensureParticipants === 'function'){
    if(sMode==='ind' && sIndPlayer){
      window.hook_ensureParticipants([{ name:sIndPlayer, color:COLORS[0], type:'ind' }]);
    } else if(sMode==='sq' && sTeams.length){
      window.hook_ensureParticipants(
        sTeams.filter(t=>t.name.trim()).map((t,i)=>({
          name:t.name.trim(), color:t.color||COLORS[i], type:'sq'
        }))
      );
    }
  }
  return _launch_orig.apply(this, arguments);
};

/* ==================================================
   DIRECTOR PANEL — gestione docenti e moduli per aula
   Accessibile dal pulsante Gestisci nella cs-topbar
   (apre direttamente sul dropdown card o sull'aula attiva)
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
}

async function dpRemoveTeacher(teacherId){
  if(!confirm('Rimuovere il docente dall\'aula?')) return;
  await window.DB.removeTeacherFromClassroom(_dpClassroomId, teacherId).catch(()=>{});
  await _dpLoadTeachers();
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
   Mostrato al docente al primo accesso via magic link.
   Obbligatorio prima di entrare nell'app.
================================================== */

/* Callback registrato in auth.js — chiamato quando Supabase
   emette PASSWORD_RECOVERY o SIGNED_IN con needs_password=true */
window.__onPasswordRecovery = function() {
  // Nasconde tutto tranne lo screen set-password
  sh('screen-login').classList.add('hidden');
  sh('screen-courses').classList.add('hidden');
  document.querySelector('.app').style.display = 'none';

  // Precompila email
  const email = window.Auth?.getUser()?.email || '';
  const lbl   = sh('setpwd-email-label');
  if (lbl) lbl.textContent = email;

  sh('screen-setpwd').classList.remove('hidden');
  setTimeout(() => sh('setpwd-new')?.focus(), 120);
};

/* Callback chiamato da auth.js dopo USER_UPDATED — entra nell'app.
   Il corpo reale viene sovrascritto da doSetPassword() per gestire il timer.
   Questa definizione base copre casi edge (es. refresh pagina dopo password già impostata). */
window.__onPasswordSet = async function() {
  sh('screen-setpwd').classList.add('hidden');
  await _afterLogin();
};

/* Indicatore forza password — agganciato all'input */
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
    { pct: '0%',   color: 'transparent',              text: '' },
    { pct: '25%',  color: '#ff4d6d',                  text: '⚠ Troppo corta' },
    { pct: '50%',  color: '#ffb400',                  text: '▲ Debole' },
    { pct: '70%',  color: '#00cfff',                  text: '◆ Discreta' },
    { pct: '88%',  color: '#7c6aff',                  text: '● Buona' },
    { pct: '100%', color: '#00ffc8',                  text: '✓ Ottima' },
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

  // updateUser() è andato a buon fine.
  // auth.js ha già aggiornato _needsPasswordSetup=false internamente.
  // USER_UPDATED chiamerà __onPasswordSet() → _afterLogin().
  // Fallback: se USER_UPDATED non arriva entro 3s, entriamo comunque.
  hideErr();
  let _entered = false;
  const _enterApp = async () => {
    if (_entered) return;
    _entered = true;
    clearTimeout(_fallback);
    sh('screen-setpwd').classList.add('hidden');
    await _afterLogin();
  };

  // Intercetta __onPasswordSet per cancellare il fallback timer
  const _prevOnPwdSet = window.__onPasswordSet;
  window.__onPasswordSet = async function() {
    window.__onPasswordSet = _prevOnPwdSet;
    await _enterApp();
  };

  // Fallback a 3s — con type=invite USER_UPDATED non sempre scatta.
  // Usiamo checkSession() (getSession dal server) invece di isLoggedIn()
  // (che legge solo lo stato in-memory e può essere stale).
  const _fallback = setTimeout(async () => {
    window.__onPasswordSet = _prevOnPwdSet;
    try {
      const freshUser = window.Auth?.checkSession
        ? await window.Auth.checkSession()
        : null;
      // Considera loggato se checkSession restituisce utente OPPURE isLoggedIn è già true
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
        // v3.2.0: se l'utente è loggato ma deve impostare la password
        // (arrivato tramite magic link / invite prima che lo splash finisse)
        if(window.Auth.needsPasswordSetup()){
          // __onPasswordRecovery potrebbe essere già stato chiamato da onAuthStateChange;
          // lo chiamiamo qui come safety net solo se lo screen non è già visibile.
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
