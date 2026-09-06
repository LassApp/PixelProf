/* ==================================================
   PROFILE PANEL — v8.25.0
   File dedicato (separato da app.js) per il tasto profilo unico in
   topbar (icona + anello colorato per ruolo/genere) e il pannello
   laterale che apre: nome, ruolo, Ultimo accesso, Ultima aula
   collegata, poi Esci e "Rivedi il tour guidato".

   SOSTITUISCE il vecchio #tb-user-badge (ruolo-pill + nome + pulsante
   esci sempre visibili in topbar) — vedi index.html.

   Colori riusati 1:1 dalla scheda docente esistente (pixelprof.css
   .tdc-gender-icon.g-uomo/.g-donna), nessun nuovo colore introdotto:
     uomo      → ring #1e90ff / testo #5eb0ff
     donna     → ring #ff4d6d / testo #ff8fa3
     direttore → #ffd700 (invariato, stesso oro del badge "👑 Dir")
     default   → #00cfff (nessun genere impostato — stesso ciano già
                 usato per il ruolo "📖 Doc" prima di questa modifica)

   Dipendenze globali attese (definite altrove nel bundle — vedi
   tools/build.js BUNDLE_FILES, questo file va DOPO app.js/courses.js/
   onboarding.js): sh(), ppConfirmBox(), doLogout(), loadCourses(),
   resetSessionState(), setCoursesScreenMode(), openDirectorDashboard(),
   OnboardingTour, window.Auth.
================================================== */

const ProfilePanel = (function () {

  const ROLE_STYLE = {
    direttore: { ring: '#ffd700', text: '#ffd700', bg: 'rgba(255,215,0,.12)',  icon: 'ti-crown'         },
    uomo:      { ring: '#1e90ff', text: '#5eb0ff', bg: 'rgba(30,144,255,.12)', icon: 'ti-gender-male'   },
    donna:     { ring: '#ff4d6d', text: '#ff8fa3', bg: 'rgba(255,77,109,.12)', icon: 'ti-gender-female' },
    default:   { ring: '#00cfff', text: '#00cfff', bg: 'rgba(0,207,255,.1)',   icon: 'ti-user'          }
  };

  let _isDir = false;

  function _styleFor(isDir, genere) {
    if (isDir) return ROLE_STYLE.direttore;
    if (genere === 'uomo')  return ROLE_STYLE.uomo;
    if (genere === 'donna') return ROLE_STYLE.donna;
    return ROLE_STYLE.default;
  }

  function _formatLastAccess(iso) {
    if (!iso) return 'Primo accesso';
    try {
      const d = new Date(iso);
      const now = new Date();
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const sameDay = (a, b) => a.toDateString() === b.toDateString();
      const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      if (sameDay(d, now)) return 'Oggi · ' + time;
      if (sameDay(d, y))   return 'Ieri · ' + time;
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) + ' · ' + time;
    } catch (e) { return '—'; }
  }

  function _lastClassroomName(id) {
    if (!id) return '—';
    try {
      const courses = (typeof loadCourses === 'function') ? loadCourses() : [];
      const c = courses.find(c => c.id === id);
      return c ? c.name : '—';
    } catch (e) { return '—'; }
  }

  /** Chiamata da app.js _afterLogin() al posto del vecchio blocco
   *  tbBadge/tbRole/tbName — popola TUTTE le istanze del tasto
   *  profilo (v8.25.1: presente su ogni schermata, non solo nel
   *  gioco) e il contenuto del pannello, condiviso e unico. */
  function render(profile, isDir) {
    _isDir = !!isDir;
    const st = _styleFor(_isDir, profile && profile.genere);

    document.querySelectorAll('.tb-profile-btn').forEach(btn => {
      btn.style.setProperty('--profile-ring', st.ring);
      btn.style.setProperty('--profile-bg', st.bg);
      btn.classList.add('visible');
    });
    document.querySelectorAll('.tb-profile-icon').forEach(icon => {
      icon.className = 'ti ' + st.icon + ' tb-profile-icon';
    });

    const name = (profile && profile.name) || (window.Auth && window.Auth.getName && window.Auth.getName()) || '—';

    const panelName = sh('pp-profile-name');
    if (panelName) panelName.textContent = name;

    const avatar = sh('pp-profile-avatar');
    if (avatar) {
      avatar.style.setProperty('--profile-ring', st.ring);
      avatar.style.setProperty('--profile-bg', st.bg);
      avatar.innerHTML = '<i class="ti ' + st.icon + '"></i>';
    }

    const rolePill = sh('pp-profile-role');
    if (rolePill) {
      rolePill.textContent = _isDir ? '👑 Direttore' : '📖 Docente';
      rolePill.style.setProperty('--profile-ring', st.ring);
    }

    const lastAccess = sh('pp-profile-last-access');
    if (lastAccess) lastAccess.textContent = _formatLastAccess(profile && profile.last_login_at);

    const lastClass = sh('pp-profile-last-classroom');
    if (lastClass) lastClass.textContent = _lastClassroomName(profile && profile.last_classroom_id);
  }

  function _setTopbarShift(open) {
    document.querySelectorAll('.topbar, .cs-topbar').forEach(tb => tb.classList.toggle('pp-open', open));
  }

  function toggle() {
    const panel = sh('profile-panel');
    const backdrop = sh('profile-panel-backdrop');
    if (!panel || !backdrop) return;
    const open = panel.classList.toggle('open');
    backdrop.classList.toggle('open', open);
    _setTopbarShift(open);
    if (typeof closeHubMenu === 'function') closeHubMenu();
  }

  function close() {
    const panel = sh('profile-panel');
    const backdrop = sh('profile-panel-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    _setTopbarShift(false);
  }

  /** "Rivedi il tour guidato" — riazzera lo stato del tour e riporta
   *  l'utente alla schermata iniziale del proprio ruolo (Dashboard per
   *  il Direttore, scelta aula per il Docente), esattamente come al
   *  primo accesso. Il tasto profilo vive solo nella topbar di gioco,
   *  quindi questa azione esce sempre dall'aula corrente — per questo
   *  chiede sempre conferma, con un solo dialogo (niente doppie
   *  conferme sommate a quelle già esistenti per il cambio aula). */
  async function restartTour() {
    close();
    const msg = _isDir
      ? 'Il tour guidato ripartirà dall\u2019inizio e tornerai alla Dashboard Direttore.'
      : 'Il tour guidato ripartirà dall\u2019inizio e uscirai da questa aula per tornare alla scelta delle aule.';
    const ok = await ppConfirmBox(msg, {
      title: 'Rivedere il tour guidato?',
      icon: '🧭',
      yesLabel: 'Sì, rivedi il tour',
      noLabel: 'Annulla'
    });
    if (!ok) return;

    if (typeof resetSessionState === 'function') resetSessionState();
    if (typeof OnboardingTour !== 'undefined') OnboardingTour.reset();

    if (_isDir) {
      if (typeof openDirectorDashboard === 'function') openDirectorDashboard();
      return;
    }

    if (typeof setCoursesScreenMode === 'function') setCoursesScreenMode('select');
    const appEl = document.querySelector('.app');
    if (appEl) appEl.style.display = 'none';
    const cs = sh('screen-courses');
    if (cs) {
      cs.classList.remove('hidden');
      cs.classList.add('entering');
      setTimeout(() => cs.classList.remove('entering'), 400);
    }
    if (typeof OnboardingTour !== 'undefined') {
      setTimeout(() => OnboardingTour.showCoursesSelectStep(), 500);
    }
  }

  return { render, toggle, close, restartTour };
})();
window.ProfilePanel = ProfilePanel;
