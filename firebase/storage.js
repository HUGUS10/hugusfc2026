/* ══════════════════════════════════════════
   Firebase Storage — Las imágenes se sirven
   estáticamente desde la carpeta /imag/
   ═════════════════════════════════════════ */
const FirebaseStorage = {
  getURL(path) {
    return window.location.origin + '/imag/' + path;
  },

  getLogoURL() {
    return window.location.origin + '/imag/logo.png';
  },

  getEscudoURL() {
    return window.location.origin + '/imag/bandera_oficial.png';
  }
};

if (typeof module !== 'undefined') module.exports = FirebaseStorage;