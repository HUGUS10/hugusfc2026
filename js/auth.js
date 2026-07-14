/* ══════════════════════════════════════════
   Auth.js — Login, Registro, Logout
   ═════════════════════════════════════════ */

async function checkAuth() {
  const token = localStorage.getItem('hugusfc_token');
  if (!token) return;
  try {
    const data = await api('/api/auth/check');
    if (data.authenticated) showLoggedIn(data.user);
    else localStorage.removeItem('hugusfc_token');
  } catch(e) { localStorage.removeItem('hugusfc_token'); }
}

function showLoggedIn(user) {
  const btnAcceder = document.getElementById('btnAcceder');
  const mobAcceder = document.getElementById('mobAcceder');
  const container = document.getElementById('userMenuContainer');
  const avatar = document.getElementById('userAvatarBtn');
  const adminLink = document.getElementById('adminLink');

  if (btnAcceder) btnAcceder.style.display = 'none';
  if (mobAcceder) mobAcceder.style.display = 'none';
  if (container) container.style.display = 'block';
  if (avatar) avatar.textContent = user.nombre.charAt(0).toUpperCase();
  if (adminLink && user.rol === 'admin') adminLink.style.display = 'flex';

  // Actualizar perfil page si existe
  const perfilNombre = document.getElementById('perfilNombre');
  if (perfilNombre) perfilNombre.textContent = user.nombre;
  const perfilEmail = document.getElementById('perfilEmail');
  if (perfilEmail) perfilEmail.textContent = user.email;
  const perfilAvatar = document.getElementById('perfilAvatar');
  if (perfilAvatar) perfilAvatar.textContent = user.nombre.charAt(0).toUpperCase();
  const perfilRol = document.getElementById('perfilRol');
  if (perfilRol) perfilRol.textContent = user.rol === 'admin' ? 'Administrador' : 'Miembro';
}

function openAuth() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('active');
}

function closeAuth() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (tab==='login'&&i===0)||(tab==='register'&&i===1));
  });
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
  if (registerForm) registerForm.style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  let valid = true;

  const emailErr = document.getElementById('loginEmailError');
  const passErr = document.getElementById('loginPassError');

  if (!email.includes('@')) {
    if (emailErr) { emailErr.textContent = 'Correo no válido'; emailErr.classList.add('show'); }
    valid = false;
  } else if (emailErr) emailErr.classList.remove('show');

  if (pass.length < 6) {
    if (passErr) { passErr.textContent = 'Mínimo 6 caracteres'; passErr.classList.add('show'); }
    valid = false;
  } else if (passErr) passErr.classList.remove('show');

  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span>'; }

  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    localStorage.setItem('hugusfc_token', data.token);
    closeAuth();
    showLoggedIn(data.user);
    showToast('success', 'Bienvenido, ' + data.user.nombre.split(' ')[0]);
    // Redirigir si estamos en login.html
    if (window.location.pathname.includes('login')) window.location.href = '/';
  } catch(e) { showToast('error', e.message); }
  finally { if (btn) { btn.disabled = false; btn.textContent = 'Acceder'; } }
}

async function handleRegister(e) {
  e.preventDefault();
  const nombre = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPassConfirm').value;
  let valid = true;

  const emailErr = document.getElementById('regEmailError');
  const passErr = document.getElementById('regPassError');

  if (!email.includes('@')) {
    if (emailErr) { emailErr.textContent = 'Correo no válido'; emailErr.classList.add('show'); }
    valid = false;
  } else if (emailErr) emailErr.classList.remove('show');

  if (pass !== pass2) {
    if (passErr) { passErr.textContent = 'Las contraseñas no coinciden'; passErr.classList.add('show'); }
    valid = false;
  } else if (passErr) passErr.classList.remove('show');

  if (!valid) return;

  const btn = document.getElementById('regBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span>'; }

  try {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password: pass })
    });
    const loginData = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    localStorage.setItem('hugusfc_token', loginData.token);
    closeAuth();
    showLoggedIn(loginData.user);
    showToast('success', 'Bienvenido, ' + nombre.split(' ')[0]);
    if (window.location.pathname.includes('registro')) window.location.href = '/';
  } catch(e) {
    if (e.message.includes('registrado') && emailErr) {
      emailErr.textContent = e.message; emailErr.classList.add('show');
    } else showToast('error', e.message);
  }
  finally { if (btn) { btn.disabled = false; btn.textContent = 'Crear Cuenta'; } }
}

async function handleLogout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch(e) {}
  localStorage.removeItem('hugusfc_token');
  const btnAcceder = document.getElementById('btnAcceder');
  const mobAcceder = document.getElementById('mobAcceder');
  const container = document.getElementById('userMenuContainer');
  const adminLink = document.getElementById('adminLink');
  if (btnAcceder) btnAcceder.style.display = 'inline-flex';
  if (mobAcceder) mobAcceder.style.display = 'block';
  if (container) container.style.display = 'none';
  if (adminLink) adminLink.style.display = 'none';
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.remove('active');
  showToast('info', 'Sesión cerrada');
  if (window.location.pathname.includes('perfil') || window.location.pathname.includes('admin')) {
    window.location.href = '/';
  }
}

function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('active');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu-container')) {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('active');
  }
});

// Init en páginas con auth forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
});