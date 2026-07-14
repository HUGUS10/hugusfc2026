/* ══════════════════════════════════════════
   Firebase — Config (migrado a D1)
   Este archivo ya no se usa pero se mantiene
   por compatibilidad con las imports antiguas
   ═════════════════════════════════════════ */
const FirebaseConfig = {
  // Ya no se usa Firebase — todo va por D1 Worker
  // Las funciones de auth.js, database.js y storage.js
  // ahora redirigen a la API del Worker
  API_BASE: window.location.origin,
  DB_NAME: 'hugusfc-db'
};

// Exportar para módulos
if (typeof module !== 'undefined') module.exports = FirebaseConfig;