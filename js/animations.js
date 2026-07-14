/* ══════════════════════════════════════════
   Animations.js — Inicialización de efectos
   ═════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  observeReveals();
  initCounters();
  updateCarritoCount();

  // Scroll listener para active link
  window.addEventListener('scroll', updateActiveLink, { passive: true });
});