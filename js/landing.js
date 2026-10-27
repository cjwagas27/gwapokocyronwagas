
  // ── Navbar scroll effect ─────────────────────────────────
  window.addEventListener('scroll', () => {
    document.getElementById('land-nav').classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── Render dorm preview cards ────────────────────────────

  // ── browseOrScroll ──────────────────────────────────────
  // Always goes to search.html (the dorm listing page) for everyone.
  // If not logged in, open sign-in modal first.
  function browseOrScroll(e) {
    if (e) e.preventDefault();
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    if (u && u.name) {
      window.location.href = '/pages/search.html';
    } else {
      openAuthModal('login');
    }
  }

  // ── Auth gate — trigger modal with context ───────────────
  function requireAuth(action, dormName) {
    const intentEl   = document.getElementById('auth-intent');
    const intentText = document.getElementById('auth-intent-text');
    intentEl.style.display = 'flex';
    if (action === 'book') {
      intentText.textContent = `Sign in to book a room at ${dormName}`;
    } else {
      intentText.textContent = `Sign in to send an inquiry to ${dormName}`;
    }
    openAuthModal('login');
  }

  // ── Auth modal open/close ────────────────────────────────
  let pendingRedirect = null;

  function openAuthModal(tab) {
    switchAuthTab(tab || 'login');
    document.getElementById('auth-modal-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    document.getElementById('auth-modal-overlay').classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('auth-intent').style.display = 'none';
  }

  function handleOverlayClick(e) {
    if (e.target === document.getElementById('auth-modal-overlay')) closeAuthModal();
  }

  function switchAuthTab(tab) {
    ['login','register'].forEach(t => {
      document.getElementById(`seg-${t}`).classList.toggle('active', t === tab);
      document.getElementById(`panel-${t}`).classList.toggle('active', t === tab);
    });
  }

  // ── Role select ──────────────────────────────────────────
  let selectedRole = 'student';

  function selectRole(el, role) {
    document.querySelectorAll('.role-tile').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedRole = role;
  }

  // ── Route map ────────────────────────────────────────────
  const roleRoutes = {
    student: '/pages/student-dashboard.html',
    owner:   '/pages/owner-dashboard.html',
    admin:   '/pages/admin-dashboard.html',
  };

  // ── API base URL ────────────────────────────────────────
  // Always use localhost:3000 — open the app via http://localhost:3000/index.html
  const API = 'http://localhost:3000';

  // ── Local auth helpers (used when server is offline) ─────
  function _localUsers() {
    try { return JSON.parse(localStorage.getItem('df_local_users') || '[]'); }
    catch(e) { return []; }
  }
  function _saveUsers(users) {
    localStorage.setItem('df_local_users', JSON.stringify(users));
  }
  function _initials(name) {
    return name.trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2);
  }

  function localLogin(email, pass, btn) {
    const users = _localUsers();
    const u = users.find(u => u.email === email.toLowerCase());
    if (!u) {
      showToast('No account found with that email.', 'error');
    } else if (u.password !== pass) {
      showToast('Incorrect password. Please try again.', 'error');
    } else {
      const userObj = { id: u.id, name: u.name, email: u.email, role: u.role, initials: _initials(u.name) };
      localStorage.setItem('df_role', u.role);
      localStorage.setItem('df_user', JSON.stringify(userObj));
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success', 1200);
      closeAuthModal();
      const dest = roleRoutes[u.role] || roleRoutes.student;
      setTimeout(() => { window.location.href = dest; }, 900);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
  }

  function localRegister(name, email, pass, role, btn) {
    const users = _localUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
      showToast('An account with that email already exists.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      return;
    }
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase(),
      password: pass,
      role: role || 'student',
    };
    users.push(newUser);
    _saveUsers(users);
    ['reg-name','reg-email','reg-pass'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const loginEmailEl = document.getElementById('login-email');
    if (loginEmailEl) loginEmailEl.value = newUser.email;
    showToast(`Account created, ${name.trim().split(' ')[0]}! Please sign in.`, 'success', 2200);
    switchAuthTab('login');
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  }

  // ── Auto-start server helper ─────────────────────────────
  // Pings the server. If it's not up, asks the browser to request a
  // lightweight /ping endpoint which is enough to trigger the Kiro
  // SessionStart hook. Waits up to 8 s for the server to come online.
  async function wakeServer() {
    const PING = `${API}/api/ping`;
    const MAX_WAIT = 8000;   // ms to wait for server to come up
    const INTERVAL  = 800;   // ms between retries

    // Already up?
    try {
      await fetch(PING, { method: 'GET', cache: 'no-store' });
      return true;
    } catch(_) { /* not up yet */ }

    // Wait and keep polling
    const start = Date.now();
    while (Date.now() - start < MAX_WAIT) {
      await new Promise(r => setTimeout(r, INTERVAL));
      try {
        await fetch(PING, { method: 'GET', cache: 'no-store' });
        return true;
      } catch(_) { /* still not up */ }
    }
    return false;
  }

  // ── Login — calls /api/login → saves to DB ───────────────
  async function handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass  = document.getElementById('login-pass').value;

    if (!email || !pass) {
      showToast('Please fill in all fields.', 'error'); return;
    }

    const btn = document.querySelector('#panel-login .btn-send');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

    try {
      const res  = await fetch(`${API}/api/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!data.ok) {
        showToast(data.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
        return;
      }

      // Save session
      localStorage.setItem('df_role', data.user.role);
      localStorage.setItem('df_user', JSON.stringify(data.user));

      showToast(data.message, 'success', 1200);
      closeAuthModal();

      // Redirect based on role
      const dest = roleRoutes[data.user.role] || roleRoutes.student;
      setTimeout(() => { window.location.href = dest; }, 900);
      if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }

    } catch (err) {
      // Server not running — try to wake it then retry once
      console.warn('[login] Server not responding, attempting auto-start…');
      if (btn) { btn.disabled = true; btn.textContent = 'Starting server…'; }
      const woke = await wakeServer();
      if (!woke) {
        showToast('Server could not start. Please run START SERVER.bat manually.', 'error', 6000);
        if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
        return;
      }
      // Retry the login once
      try {
        if (btn) { btn.textContent = 'Signing in…'; }
        const res2  = await fetch(`${API}/api/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password: pass }),
        });
        const data2 = await res2.json();
        if (!data2.ok) {
          showToast(data2.message, 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
          return;
        }
        localStorage.setItem('df_role', data2.user.role);
        localStorage.setItem('df_user', JSON.stringify(data2.user));
        showToast(data2.message, 'success', 1200);
        closeAuthModal();
        const dest = roleRoutes[data2.user.role] || roleRoutes.student;
        setTimeout(() => { window.location.href = dest; }, 900);
        if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
      } catch(err2) {
        showToast('Login failed. Please try again.', 'error', 4000);
        if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
      }
    }
  }

  // ── Register — calls /api/register → saves to DB ─────────
  async function handleRegister() {
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass  = document.getElementById('reg-pass').value;

    if (!name || !email || !pass) {
      showToast('Please fill in all fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error'); return;
    }
    if (pass.length < 6) {
      showToast('Password must be at least 6 characters.', 'error'); return;
    }

    const btn = document.querySelector('#panel-register .btn-send');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

    try {
      const res  = await fetch(`${API}/api/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password: pass, role: selectedRole }),
      });
      const data = await res.json();

      if (!data.ok) {
        showToast(data.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
        return;
      }

      // Clear fields and pre-fill login email
      ['reg-name','reg-email','reg-pass'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const loginEmailEl = document.getElementById('login-email');
      if (loginEmailEl) loginEmailEl.value = data.user.email;

      showToast(`Account created, ${data.user.name}! Please sign in.`, 'success', 2200);
      switchAuthTab('login');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }

    } catch (err) {
      // Server not running — try to wake it then retry once
      console.warn('[register] Server not responding, attempting auto-start…');
      if (btn) { btn.disabled = true; btn.textContent = 'Starting server…'; }
      const woke = await wakeServer();
      if (!woke) {
        showToast('Server could not start. Please run START SERVER.bat manually.', 'error', 6000);
        if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
        return;
      }
      // Retry the register once
      try {
        if (btn) { btn.textContent = 'Creating account…'; }
        const res2  = await fetch(`${API}/api/register`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name, email, password: pass, role: selectedRole }),
        });
        const data2 = await res2.json();
        if (!data2.ok) {
          showToast(data2.message, 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
          return;
        }
        ['reg-name','reg-email','reg-pass'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        const loginEmailEl = document.getElementById('login-email');
        if (loginEmailEl) loginEmailEl.value = data2.user.email;
        showToast(`Account created, ${data2.user.name}! Please sign in.`, 'success', 2200);
        switchAuthTab('login');
        if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      } catch(err2) {
        showToast('Registration failed. Please try again.', 'error', 4000);
        if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
      }
    }
  }

  // ── Contact form ─────────────────────────────────────────
  function sendContact() {
    const name    = document.getElementById('c-name').value.trim();
    const email   = document.getElementById('c-email').value.trim();
    const subject = document.getElementById('c-subject').value.trim();
    const msg     = document.getElementById('c-message').value.trim();
    if (!name || !email || !msg) { showToast('Please fill in required fields.', 'error'); return; }
    showToast('Message sent! We\'ll get back to you within 24 hours.', 'success', 3500);
    ['c-name','c-email','c-subject','c-message'].forEach(id => document.getElementById(id).value = '');
  }

  // ── Keyboard close + Enter-to-next-field ─────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAuthModal();
  });

  // Register form: Enter moves Name → Email → Password → Submit
  document.getElementById('reg-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('reg-email').focus(); }
  });
  document.getElementById('reg-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('reg-pass').focus(); }
  });
  document.getElementById('reg-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleRegister(); }
  });

  // Login form: Enter moves Email → Password → Submit
  document.getElementById('login-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('login-pass').focus(); }
  });
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
  });

  // ── Init ─────────────────────────────────────────────────
  // ── Session-aware nav ────────────────────────────────────
  // If user is already logged in, replace Sign In / Sign Up with
  // a "Go to Dashboard" button — they stay logged in at all times.
  (function applySessionNav() {
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    if (!u || !u.name) return;   // not logged in — show default buttons

    const dashRoutes = {
      student: '/pages/student-dashboard.html',
      owner:   '/pages/owner-dashboard.html',
      admin:   '/pages/admin-dashboard.html',
    };
    const dest     = dashRoutes[u.role] || '/pages/student-dashboard.html';
    const initials = u.initials || u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    const firstName = u.name.split(' ')[0];

    // Replace nav-right with: avatar + first name + Dashboard button
    // Matches the exact same layout/style as Sign In + Sign Up Free
    const navRight = document.getElementById('nav-right');
    if (navRight) {
      navRight.innerHTML = `
        <div style="width:32px;height:32px;border-radius:50%;background:var(--navy-500);
                    color:white;font-weight:700;font-size:0.75rem;display:flex;
                    align-items:center;justify-content:center;flex-shrink:0">${initials}</div>
        <span style="color:rgba(255,255,255,0.85);font-weight:600;font-size:0.875rem">${firstName}</span>
        <button class="btn-nav-solid" onclick="window.location.href='${dest}'">
          Dashboard
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            style="margin-left:5px;vertical-align:middle">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>`;
    }

    // Also swap hero CTA buttons if present
    const heroPrimary = document.querySelector('.hero-actions .btn-hero-primary');
    const heroGhost   = document.querySelector('.hero-actions .btn-hero-ghost');
    if (heroPrimary) {
      heroPrimary.textContent = 'Go to Dashboard';
      heroPrimary.onclick = () => { window.location.href = dest; };
    }
    if (heroGhost) heroGhost.style.display = 'none';
  })();

  // Auto-scroll active nav link on scroll
  const sections = ['hero','how','dorms','features','map','contact'];
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 100;
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
        document.querySelectorAll('.land-nav-link').forEach(l => l.style.color = '');
        const link = document.querySelector(`.land-nav-link[href="#${id}"]`);
        if (link) link.style.color = 'white';
      }
    });
  });
