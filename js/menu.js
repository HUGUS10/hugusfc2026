/* ══════════════════════════════════════════
   Menu.js — Mobile menu
   ═════════════════════════════════════════ */
function toggleMobile() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobMenu');
  if (h) h.classList.toggle('active');
  if (m) m.classList.toggle('open');
}

function closeMobile() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobMenu');
  if (h) h.classList.remove('active');
  if (m) m.classList.remove('open');
}