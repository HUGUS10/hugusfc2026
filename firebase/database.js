/* ══════════════════════════════════════════
   Firebase Database — Redirigido a D1 API
   ═════════════════════════════════════════ */
const FirebaseDB = {
  async get(collection) {
    const res = await fetch(window.location.origin + '/api/' + collection);
    const data = await res.json();
    return data.results || data;
  },

  async adminCreate(collection, data) {
    const token = localStorage.getItem('hugusfc_token');
    const res = await fetch(window.location.origin + '/api/admin/' + collection, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result;
  },

  async adminDelete(collection, id) {
    const token = localStorage.getItem('hugusfc_token');
    const res = await fetch(window.location.origin + '/api/admin/' + collection + '/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result;
  }
};

if (typeof module !== 'undefined') module.exports = FirebaseDB;