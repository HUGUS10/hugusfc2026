/* ══════════════════════════════════════════
   Perfil.js
   ═════════════════════════════════════════ */
async function loadPerfil() {
  try {
    const user = await api('/api/auth/check');
    if (!user.authenticated) { window.location.href = 'login.html'; return; }
    showLoggedIn(user.user);
  } catch(e) { window.location.href = 'login.html'; }
}