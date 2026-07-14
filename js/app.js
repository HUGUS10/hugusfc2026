/* ══════════════════════════════════════════
   App.js — Inicialización principal
   ═════════════════════════════════════════ */
const API = window.location.origin;

async function api(path, options = {}) {
  const token = localStorage.getItem('hugusfc_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch(e) { return dateStr; }
}

function safeJSON(str) {
  if (Array.isArray(str)) return str;
  try { return JSON.parse(str || '[]'); } catch(e) { return []; }
}

// Logo HTML helper — siempre redondo y centrado
function logoImg(src, size, alt) {
  return `<div class="logo-container" style="width:${size}px;height:${size}px">
    <img src="${src}" alt="${alt || 'HUGUS FC'}" 
         onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-family:Bebas Neue;font-size:${Math.floor(size*0.5)}px;color:#C9A227\\'>H</span>'">
  </div>`;
}

function escudoImg(src, size) {
  return `<div class="logo-container" style="width:${size}px;height:${size}px;border-color:rgba(201,162,39,.45)">
    <img src="${src}" alt="Escudo" 
         onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-family:Bebas Neue;font-size:${Math.floor(size*0.45)}px;color:#C9A227\\'>H</span>'">
  </div>`;
}

// Toast
function showToast(type, msg) {
  const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// Scroll reveal
let revealObserver;
function observeReveals() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

// Counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / 1500, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step); else el.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('.st-n[data-count]').forEach(c => obs.observe(c));
}

// Nav scroll
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('solid', window.scrollY > 80);
    nav.classList.toggle('top', window.scrollY <= 80);
  }, { passive: true });
}

// Active link
function updateActiveLink() {
  const sections = ['hero','nosotros','plantilla','calendario','noticias','tabla','galeria'];
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// Preloader
function initPreloader(callback) {
  let pct = 0;
  const fill = document.getElementById('preFill');
  const pctEl = document.getElementById('prePct');
  if (!fill) { callback(); return; }
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct >= 100) {
      pct = 100; clearInterval(iv);
      fill.style.width = '100%'; pctEl.textContent = '100%';
      setTimeout(() => {
        document.getElementById('preloader').classList.add('hide');
        document.body.classList.remove('loading');
        callback();
      }, 500);
    } else {
      fill.style.width = pct + '%';
      pctEl.textContent = Math.floor(pct) + '%';
    }
  }, 120);
}

// Logos por defecto
const LOGO = '/imag/logo.png';
const ESCUDO = '/imag/bandera_oficial.png';
const FALLBACK_LETTER = 'H';