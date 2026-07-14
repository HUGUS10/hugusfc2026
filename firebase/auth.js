/* ══════════════════════════════════════════
   Firebase Auth — Redirigido a D1 API
   ═════════════════════════════════════════ */
const FirebaseAuth = {
  async login(email, password) {
    const res = await fetch(window.location.origin + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('hugusfc_token', data.token);
    return data.user;
  },

  async register(nombre, email, password) {
    const res = await fetch(window.location.origin + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('hugusfc_token', data.token);
    return data.user;
  },

  async logout() {
    const token = localStorage.getItem('hugusfc_token');
    if (token) {
      await fetch(window.location.origin + '/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    }
    localStorage.removeItem('hugusfc_token');
  },

  async checkAuth() {
    const token = localStorage.getItem('hugusfc_token');
    if (!token) return null;
    const res = await fetch(window.location.origin + '/api/auth/check', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    return data.authenticated ? data.user : null;
  },

  getToken() {
    return localStorage.getItem('hugusfc_token');
  }
};

if (typeof module !== 'undefined') module.exports = FirebaseAuth;