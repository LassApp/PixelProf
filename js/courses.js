/* ==================================================
   courses.js — PixelProf v5.0.7
   Course/classroom system: grid, CRUD, icon picker,
   background/color picker, course menu.
   Cloud sync (DB.updateClassroom, _deleteClassroomRest,
   _reloadCourses, _applyModuleFilter) now embedded
   directly — no override chains from app.js.
   v5.0.7 FIX: enterCourse() (ramo "stessa aula attiva")
     ora attende _applyModuleFilter(id) PRIMA di chiamare
     _enterCourseDirect()/goHome(). In precedenza la UI
     veniva disegnata con il filtro moduli ancora in volo
     verso Supabase — la whitelist arrivava troppo tardi e
     nessuno richiamava un secondo render. Aggiunto lock
     anti-doppio-click (_enterCourseLock) sulla card aula
     durante il fetch, dato che ora c'è un await prima del
     nascondere screen-courses.
   Depends on: game-engine-state.js
================================================== */

const COURSE_ICONS=['🏫','📚','🎓','💡','🧠','⚡','🌐','💻','🔬','📡','🎯','🚀','🧩','📊','🏆','⭐','🔐','🛡️','📋','🧮'];
const COURSE_BG_PRESETS=[
  {label:'Neon Teal',css:'linear-gradient(145deg,#071a18 0%,#0d2a24 55%,#071a18 100%)'},
  {label:'Deep Violet',css:'linear-gradient(145deg,#0e0820 0%,#180d38 55%,#0c0820 100%)'},
  {label:'Electric Blue',css:'linear-gradient(145deg,#081828 0%,#0d2040 55%,#0a1830 100%)'},
  {label:'Crimson',css:'linear-gradient(145deg,#1a0810 0%,#2a0d18 55%,#180610 100%)'},
  {label:'Amber',css:'linear-gradient(145deg,#1a1000 0%,#261800 55%,#181000 100%)'},
  {label:'Ocean',css:'linear-gradient(145deg,#001a22 0%,#002030 55%,#001520 100%)'},
  {label:'Forest',css:'linear-gradient(145deg,#0a1a0c 0%,#102016 55%,#081408 100%)'},
  {label:'Slate',css:'linear-gradient(145deg,#101820 0%,#182030 55%,#101828 100%)'},
];

let _ddCourseId=null; // id del corso a cui appartiene il dropdown aperto

/* ==================================================
   MODALITÀ SCHERMATA AULE — v6.0.0 (Dashboard Direttore)
   _csMode = 'select' (default, invariato) → click sulla card = enterCourse()
   _csMode = 'manage' (da "Gestisci Aule")  → click sulla card = apre il
     pannello direttore (docenti+moduli) della stessa aula, riusando al
     100% dp-overlay/_dpLoadTeachers/_dpLoadTeacherSelect/_dpLoadModules
     già definiti in app.js. Zero duplicazione di logica.
   Il menu "..." (rinomina/icona/colore/elimina) resta invariato e
   funzionante in ENTRAMBE le modalità.
================================================== */
let _csMode='select';
function setCoursesScreenMode(mode){
  _csMode=(mode==='manage')?'manage':'select';
  const badge=document.getElementById('cs-mode-badge');
  if(badge) badge.classList.toggle('hidden', _csMode!=='manage');
}
function _csCardClick(id){
  // v6.0.1 FIX: _csMode è una variabile JS che NON viene resettata da un
  // logout/login nella stessa tab (SPA, nessun reload). Se un Direttore
  // lasciava _csMode='manage' (visitando "Gestisci Aule" senza poi tornare
  // su "Scegli Aula") e poi un Docente faceva login nella stessa tab, il
  // click sulla card apriva il pannello direttore invece di entrare in aula.
  // Guard: la modalità 'manage' è onorata SOLO se l'utente è realmente
  // Direttore — il ruolo è la fonte di verità, non lo stato residuo in RAM.
  if(_csMode==='manage' && window.Auth?.isDirector()){
    _dpClassroomId=id;
    document.getElementById('dp-overlay')?.classList.remove('hidden');
    const fb=document.getElementById('dp-invite-fb'); if(fb) fb.textContent='';
    Promise.all([_dpLoadTeachers(), _dpLoadTeacherSelect(), _dpLoadModules()]);
    return;
  }
  enterCourse(id);
}

function genCourseId(){return'c_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);}

function addCourse(){
  const inp=sh('cs-course-inp');
  const name=inp.value.trim();
  if(!name)return;
  const courses=loadCourses();
  const colorIdx=courses.length%COLOR_PALETTE.length;
  const iconIdx=courses.length%COURSE_ICONS.length;
  const course={
    id:genCourseId(),
    name,
    icon:COURSE_ICONS[iconIdx],
    colorIdx,
    bgIdx:colorIdx,
    createdAt:Date.now()
  };
  courses.push(course);
  saveCourses(courses);
  inp.value='';
  renderCoursesGrid();
  setTimeout(()=>{
    const card=document.querySelector('[data-course-id="'+course.id+'"]');
    if(card)card.style.boxShadow='0 0 0 2px #00ffc8';
    setTimeout(()=>{if(card)card.style.boxShadow='';},1200);
  },80);
}

function renderCoursesGrid(){
  const grid=sh('cs-grid');if(!grid)return;
  const courses=loadCourses();
  if(!courses.length){
    grid.innerHTML=`<div class="cs-empty" style="grid-column:1/-1">
      <div class="cs-empty-icon">🏫</div>
      <div class="cs-empty-text">Nessuna aula ancora.<br>Crea la prima per iniziare!</div>
    </div>`;
    return;
  }
  const isDir=window.Auth?.isDirector();
  grid.innerHTML=courses.map((c,i)=>{
    const colIdx=(c.colorIdx??i)%COLOR_PALETTE.length;
    const bgIdx =(c.bgIdx   ??i)%COURSE_BG_PRESETS.length;
    const col=COLOR_PALETTE[colIdx];
    const bg =COURSE_BG_PRESETS[bgIdx];
    const fmtDate=d=>{
      if(!d) return null;
      try{
        const dt=new Date(d);
        if(isNaN(dt.getTime())) return d;
        return dt.toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'2-digit'});
      }catch{return d;}
    };
    const startFmt=fmtDate(c.startDate);
    const endFmt  =fmtDate(c.endDate);
    const dateRow = (startFmt||endFmt)
      ? `<div class="course-card-dates"><i class="ti ti-calendar" style="font-size:9px;opacity:.5"></i> ${startFmt||'—'} → ${endFmt||'—'}</div>`
      : `<div class="course-card-meta">Creata il ${new Date(c.createdAt||Date.now()).toLocaleDateString('it-IT',{day:'2-digit',month:'short'})}</div>`;
    const timeRow = c.timeSlot
      ? `<div class="course-card-time"><i class="ti ti-clock" style="font-size:10px;opacity:.5"></i> ${escHtml(c.timeSlot)}</div>`
      : '';
    const teacherChips=(c._teachers||[])
      .filter(t=>t.role!=='director')
      .map(t=>`<span class="course-card-teacher-chip">${escHtml(t.name||'')}</span>`)
      .join('');
    const teachersRow=teacherChips
      ?`<div class="course-card-teachers">${teacherChips}</div>`:'';
    return`<div class="course-card" data-course-id="${escAttr(c.id)}"
      data-colidx="${colIdx}" data-bgidx="${bgIdx}"
      style="
        background:${bg.css};
        border-color:${col.border};
        box-shadow:0 4px 20px ${col.glow};
        animation-delay:${i*0.04}s;
        --card-accent:${col.bar};
        --card-glow:${col.glow};
      "
      onclick="_csCardClick('${escAttr(c.id)}')"
    >
      <div class="course-card-top">
        <span class="course-card-icon">${c.icon}</span>
        <div class="course-card-name">${escHtml(c.name)}</div>
        <button class="course-card-menu" onclick="event.stopPropagation();openCourseMenu('${escAttr(c.id)}',this)" title="Opzioni" aria-label="Opzioni aula" style="position:static;flex-shrink:0">⋯</button>
      </div>
      <div class="course-card-middle">
        ${dateRow}
        ${timeRow}
      </div>
      ${teachersRow}
    </div>`;
  }).join('');
  grid.querySelectorAll('.course-card').forEach(card=>{
    const ci=parseInt(card.dataset.colidx)||0;
    const col=COLOR_PALETTE[ci%COLOR_PALETTE.length];
    const glowBase ='0 4px 20px '+col.glow;
    const glowHover='0 8px 36px '+col.glow+', 0 0 0 1px '+col.border;
    card.addEventListener('mouseenter',()=>{ card.style.boxShadow=glowHover; });
    card.addEventListener('mouseleave',()=>{ card.style.boxShadow=glowBase;  });
  });
}

/* ==================================================
   enterCourse — v4.0.6
   Incorpora la logica cloud di app.js (appState,
   location.reload per aula diversa, _applyModuleFilter).
   Nessuna override chain necessaria.
================================================== */
let _enterCourseLock=false;
async function enterCourse(id){
  if(_enterCourseLock)return; // evita doppio ingresso se l'utente clicca 2 volte durante il fetch Supabase
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  if(!course)return;

  // Stessa aula già attiva → entra direttamente senza reload
  if(id===activeCourseId){
    if(window.appState) window.appState.classroom=course;
    _enterCourseLock=true;
    const card=document.querySelector('[data-course-id="'+id+'"]');
    if(card)card.style.opacity='.55';
    try{
      // v5.0.7 FIX: attende la risposta Supabase (getEnabledModules) PRIMA
      // di mostrare l'aula. In precedenza _enterCourseDirect()→goHome() disegnava
      // la UI in modo sincrono mentre _applyModuleFilter girava ancora in background:
      // il filtro arrivava dopo che step-mod era già stato renderizzato, e nessuno
      // richiamava un secondo render — risultato: tutti i moduli visibili o stato
      // dell'aula precedente, indipendentemente dalla whitelist Supabase.
      await _applyModuleFilter(id);
      _enterCourseDirect(id);
    }finally{
      _enterCourseLock=false;
      if(card)card.style.opacity='';
    }
    return;
  }

  // Aula diversa → salva la scelta e ricarica la pagina per stato JS pulito
  try{ sessionStorage.setItem('pp_pending_course',id); }catch(e){}
  location.reload();
}

/* Logica DOM pura dell'ingresso in un'aula (ex corpo di enterCourse). */
function _enterCourseDirect(id){
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  if(!course)return;
  activeCourseId=id;
  db=loadCourseData(id);

  const bgIdx=(course.bgIdx??0)%COURSE_BG_PRESETS.length;
  const bg=COURSE_BG_PRESETS[bgIdx];
  const themeEl=document.getElementById('app-theme-bg');
  if(themeEl){
    themeEl.style.opacity='0';
    setTimeout(()=>{ themeEl.style.background=bg.css; themeEl.style.opacity='0.4'; },200);
  }

  const badge=sh('tb-course-badge');
  const badgeIcon=sh('tb-course-icon');
  const badgeName=sh('tb-course-name');
  if(badge&&badgeIcon&&badgeName){
    badgeIcon.textContent=course.icon;
    badgeName.textContent=course.name;
    badge.style.display='flex';
  }

  sh('screen-courses').classList.add('hidden');
  const app=document.querySelector('.app');
  app.style.display='';
  app.style.opacity='0';
  app.style.transform='scale(.97)';
  requestAnimationFrame(()=>{
    app.style.transition='opacity .35s ease, transform .35s cubic-bezier(.22,1,.36,1)';
    app.style.opacity='1';
    app.style.transform='scale(1)';
    setTimeout(()=>{app.style.transition='';},400);
  });
  closeCourseMenu();
  goHome();
}

/* -- Course dropdown menu -- */
function openCourseMenu(id,triggerEl){
  _ddCourseId=id;
  const dd=sh('course-dropdown');
  dd.classList.remove('hidden');
  const manageItem=sh('cd-manage');
  if(manageItem) manageItem.style.display=window.Auth?.isDirector()?'':'none';
  const rect=triggerEl.getBoundingClientRect();
  dd.style.top=(rect.bottom+6)+'px';
  dd.style.left=Math.min(rect.left, window.innerWidth-180)+'px';
  setTimeout(()=>document.addEventListener('click',closeCourseMenuOutside,{once:true}),10);
}

function _cdManage(){
  const id=_ddCourseId;
  closeCourseMenu();
  if(!id) return;
  _dpClassroomId=id;
  sh('dp-overlay').classList.remove('hidden');
  sh('dp-invite-fb').textContent='';
  Promise.all([_dpLoadTeachers(), _dpLoadTeacherSelect(), _dpLoadModules()]);
}

function closeCourseMenuOutside(e){
  const dd=sh('course-dropdown');
  if(dd&&!dd.contains(e.target))closeCourseMenu();
}
function closeCourseMenu(){sh('course-dropdown').classList.add('hidden');_ddCourseId=null;}

/* ==================================================
   cdAction — v4.0.6
   Incorpora la propagazione cloud di app.js.
   Nessuna override chain necessaria.
================================================== */
async function cdAction(action){
  const id=_ddCourseId;
  closeCourseMenu();
  if(!id)return;
  const courses=loadCourses();
  const idx=courses.findIndex(c=>c.id===id);
  if(idx<0)return;

  if(action==='rename'){
    const newName=await ppPromptBox('Inserisci il nuovo nome per questa aula.', courses[idx].name, { title:'Rinomina aula', icon:'✏️', maxlength:40 });
    if(!newName)return;
    // Aggiorna localStorage
    courses[idx].name=newName.trim();
    saveCourses(courses);
    renderCoursesGrid();
    // Propaga al cloud se disponibile
    if(window.DB && window.Auth?.getUserId()){
      await window.DB.updateClassroom(id, { name: newName.trim() });
      await _reloadCourses();
    }
  } else if(action==='icon'){
    openIconPicker(id);
  } else if(action==='bg'){
    openBgPicker(id);
  } else if(action==='delete'){
    _showDeleteClassroomConfirm(id, courses[idx].name, async ()=>{
      const delRes=await _deleteClassroomRest(id);
      if(!delRes.ok){
        let errMsg=delRes.error||'errore sconosciuto';
        try{
          const m=errMsg.match(/\{.*\}/s);
          if(m){ const p=JSON.parse(m[0]); if(p.message) errMsg=p.message; }
        }catch(e){}
        await ppAlert('Impossibile eliminare l\'aula.\n\n'+errMsg+'\n\nEsegui la SQL director_delete_classroom nel Supabase SQL Editor.', { title:'Eliminazione non riuscita', icon:'❌' });
        return;
      }
      if(activeCourseId===id){
        activeCourseId=null;
        if(window.appState) window.appState.classroom=null;
        db=makeEmptyDb();
        goCoursesFromApp();
      }
      await _reloadCourses();
    });
  }
}

/* -- Icon picker -- */
let _ipCourseId=null;
function openIconPicker(id){
  _ipCourseId=id;
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  const grid=sh('icp-grid');
  grid.innerHTML=COURSE_ICONS.map(ic=>`<button class="icp-btn${course&&course.icon===ic?' selected':''}" onclick="pickIcon('${escAttr(ic)}')">${ic}</button>`).join('');
  sh('icon-picker-overlay').classList.remove('hidden');
}

/* ==================================================
   pickIcon — v4.0.6
   Incorpora DB.updateClassroom + _reloadCourses di app.js.
================================================== */
async function pickIcon(icon){
  const courses=loadCourses();
  const idx=courses.findIndex(c=>c.id===_ipCourseId);
  if(idx<0)return;
  // Salva l'id prima di closeIconPicker() che azzera _ipCourseId
  const courseId=_ipCourseId;
  courses[idx].icon=icon;
  saveCourses(courses);
  closeIconPicker();
  renderCoursesGrid();
  // Propaga al cloud e poi ricarica (await garantisce che il cloud sia aggiornato
  // prima che _reloadCourses sovrascriva il localStorage con i dati del server)
  if(window.DB && courseId){
    await window.DB.updateClassroom(courseId, { icon }).catch(e=>console.error('[PixelProf] pickIcon cloud error:',e));
    await _reloadCourses();
  }
}
function closeIconPicker(){sh('icon-picker-overlay').classList.add('hidden');_ipCourseId=null;}

/* -- Bg + Color picker v7 con anteprima live -- */

const COLOR_PALETTE=[
  {label:'Teal',    border:'rgba(0,255,200,.45)',  glow:'rgba(0,255,200,.2)',    bar:'#00ffc8',  dot:'#00ffc8'},
  {label:'Violet',  border:'rgba(124,106,255,.45)',glow:'rgba(124,106,255,.2)',  bar:'#7c6aff',  dot:'#7c6aff'},
  {label:'Blue',    border:'rgba(30,144,255,.45)', glow:'rgba(30,144,255,.2)',   bar:'#1e90ff',  dot:'#1e90ff'},
  {label:'Pink',    border:'rgba(255,77,109,.45)', glow:'rgba(255,77,109,.2)',   bar:'#ff4d6d',  dot:'#ff4d6d'},
  {label:'Amber',   border:'rgba(255,180,0,.45)',  glow:'rgba(255,180,0,.2)',    bar:'#ffb400',  dot:'#ffb400'},
  {label:'Cyan',    border:'rgba(0,207,255,.45)',  glow:'rgba(0,207,255,.2)',    bar:'#00cfff',  dot:'#00cfff'},
  {label:'Green',   border:'rgba(50,220,100,.45)', glow:'rgba(50,220,100,.2)',   bar:'#32dc64',  dot:'#32dc64'},
  {label:'Rose',    border:'rgba(255,100,180,.45)',glow:'rgba(255,100,180,.2)',  bar:'#ff64b4',  dot:'#ff64b4'},
  {label:'Orange',  border:'rgba(255,120,40,.45)', glow:'rgba(255,120,40,.2)',   bar:'#ff7828',  dot:'#ff7828'},
  {label:'White',   border:'rgba(220,230,255,.35)',glow:'rgba(220,230,255,.15)', bar:'#dce6ff',  dot:'#dce6ff'},
  {label:'Gold',    border:'rgba(255,215,0,.45)',  glow:'rgba(255,215,0,.2)',    bar:'#ffd700',  dot:'#ffd700'},
  {label:'Indigo',  border:'rgba(99,102,241,.45)', glow:'rgba(99,102,241,.2)',   bar:'#6366f1',  dot:'#6366f1'},
];

let _bpCourseId=null;
let _cpBgIdx=0;
let _cpColorIdx=0;

function openBgPicker(id){
  _bpCourseId=id;
  const courses=loadCourses();
  const course=courses.find(c=>c.id===id);
  if(!course)return;
  _cpBgIdx   = course.bgIdx    ?? 0;
  _cpColorIdx= course.colorIdx ?? 0;
  _updateColorPickerPreview(course);

  const bgGrid=sh('bgp-grid');
  bgGrid.innerHTML=COURSE_BG_PRESETS.map((bg,i)=>`
    <div class="bg-swatch${_cpBgIdx===i?' selected':''}"
      style="background:${bg.css};position:relative;overflow:hidden"
      title="${bg.label}"
      onclick="cpPickBg(${i})"
    >
      ${_cpBgIdx===i?'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px">✓</div>':''}
    </div>`).join('');

  const colGrid=sh('cp-color-grid');
  colGrid.innerHTML=COLOR_PALETTE.map((c,i)=>{
    const isActive=(_cpColorIdx===i);
    const borderCol=isActive?c.dot:'rgba(255,255,255,.08)';
    const shadowVal=isActive?('0 0 12px '+c.glow):'none';
    const scaleVal =isActive?'scale(1.1)':'scale(1)';
    return`<div
      data-ci="${i}"
      title="${c.label}"
      onclick="cpPickColor(${i})"
      class="cp-col-swatch"
      style="aspect-ratio:1;border-radius:9px;cursor:pointer;background:${c.dot}22;border:2px solid ${borderCol};display:flex;align-items:center;justify-content:center;transition:border-color .18s,box-shadow .18s,transform .18s;box-shadow:${shadowVal};transform:${scaleVal};position:relative"
    ><div style="width:16px;height:16px;border-radius:50%;background:${c.dot};box-shadow:0 0 8px ${c.glow}"></div>${isActive?'<div style="position:absolute;font-size:10px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);pointer-events:none">✓</div>':''}</div>`;
  }).join('');
  colGrid.querySelectorAll('.cp-col-swatch').forEach(el=>{
    const i=parseInt(el.dataset.ci);
    const c=COLOR_PALETTE[i];
    el.addEventListener('mouseenter',()=>{
      if(i!==_cpColorIdx){el.style.borderColor=c.dot;el.style.boxShadow='0 0 8px '+c.glow;el.style.transform='scale(1.05)';}
    });
    el.addEventListener('mouseleave',()=>{
      if(i!==_cpColorIdx){el.style.borderColor='rgba(255,255,255,.08)';el.style.boxShadow='none';el.style.transform='scale(1)';}
    });
  });

  sh('bg-picker-overlay').classList.remove('hidden');
}

function _updateColorPickerPreview(courseOrNull){
  const bg   = COURSE_BG_PRESETS[_cpBgIdx   % COURSE_BG_PRESETS.length];
  const col  = COLOR_PALETTE    [_cpColorIdx % COLOR_PALETTE.length];
  const preview  = sh('cp-preview');
  const bar      = sh('cp-preview-bar');
  if(!preview||!bar)return;
  preview.style.background  = bg.css;
  preview.style.borderColor = col.border;
  preview.style.boxShadow   = '0 4px 20px '+col.glow;
  bar.style.background      = col.bar;
  if(courseOrNull){
    const icon=sh('cp-preview-icon');
    const name=sh('cp-preview-name');
    const lbl =sh('cp-preview-label');
    if(icon)icon.textContent=courseOrNull.icon||'🏫';
    if(name)name.textContent=courseOrNull.name||'Nome aula';
    if(lbl) lbl.textContent =bg.label+' · '+col.label;
  }else{
    const lbl=sh('cp-preview-label');
    if(lbl)lbl.textContent=bg.label+' · '+col.label;
  }
}

function cpPickBg(i){
  _cpBgIdx=i;
  document.querySelectorAll('#bgp-grid .bg-swatch').forEach((el,idx)=>{
    el.classList.toggle('selected',idx===i);
    el.innerHTML=idx===i?'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px">✓</div>':'';
  });
  _updateColorPickerPreview(null);
  _cpSaveAndUpdateCard();
}

function cpPickColor(i){
  _cpColorIdx=i;
  const col=COLOR_PALETTE[i];
  document.querySelectorAll('#cp-color-grid > div').forEach((el,idx)=>{
    const c=COLOR_PALETTE[idx];
    el.style.borderColor=idx===i?c.dot:'rgba(255,255,255,.08)';
    el.style.boxShadow  =idx===i?'0 0 10px '+c.glow:'none';
    el.onmouseout=function(){
      this.style.borderColor=idx===_cpColorIdx?COLOR_PALETTE[idx].dot:'rgba(255,255,255,.08)';
      this.style.boxShadow  =idx===_cpColorIdx?'0 0 10px '+COLOR_PALETTE[idx].glow:'none';
    };
  });
  _updateColorPickerPreview(null);
  _cpSaveAndUpdateCard();
}

/* ==================================================
   _cpSaveAndUpdateCard — v4.0.6
   Incorpora DB.updateClassroom di app.js.
================================================== */
function _cpSaveAndUpdateCard(){
  const courses=loadCourses();
  const idx=courses.findIndex(c=>c.id===_bpCourseId);
  if(idx<0)return;
  courses[idx].bgIdx   =_cpBgIdx;
  courses[idx].colorIdx=_cpColorIdx;
  saveCourses(courses);

  // Propaga al cloud (fire-and-forget)
  if(window.DB && _bpCourseId){
    window.DB.updateClassroom(_bpCourseId, { colorIdx:_cpColorIdx, bgIdx:_cpBgIdx }).catch(()=>{});
  }

  if(_bpCourseId===activeCourseId){
    const bg=COURSE_BG_PRESETS[_cpBgIdx%COURSE_BG_PRESETS.length];
    const themeEl=document.getElementById('app-theme-bg');
    if(themeEl){themeEl.style.background=bg.css;themeEl.style.opacity='0.4';}
  }

  const card=document.querySelector('[data-course-id="'+_bpCourseId+'"]');
  if(!card)return;

  const col=COLOR_PALETTE[_cpColorIdx%COLOR_PALETTE.length];
  const bg =COURSE_BG_PRESETS[_cpBgIdx%COURSE_BG_PRESETS.length];
  const glowBase ='0 4px 20px '+col.glow;
  const glowHover='0 8px 36px '+col.glow+', 0 0 0 1px '+col.border;

  card.style.background =bg.css;
  card.style.borderColor=col.border;
  card.style.boxShadow  =glowBase;
  card.dataset.colidx   =String(_cpColorIdx);
  card.style.setProperty('--card-accent', col.bar);
  card.style.setProperty('--card-glow',   col.glow);

  const fresh=card.cloneNode(true);
  card.parentNode.replaceChild(fresh,card);
  fresh.style.background =bg.css;
  fresh.style.borderColor=col.border;
  fresh.style.boxShadow  =glowBase;
  fresh.style.setProperty('--card-accent', col.bar);
  fresh.style.setProperty('--card-glow',   col.glow);
  fresh.addEventListener('mouseenter',()=>{ fresh.style.boxShadow=glowHover; });
  fresh.addEventListener('mouseleave',()=>{ fresh.style.boxShadow=glowBase;  });
}

function closeBgPicker(){
  sh('bg-picker-overlay').classList.add('hidden');
  _bpCourseId=null;
}
