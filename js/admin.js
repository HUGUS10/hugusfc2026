/* ══════════════════════════════════════════
   Admin.js — Panel de administración
   ═════════════════════════════════════════ */
async function showAdmin() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.remove('active');
  const sec = document.getElementById('adminSection');
  if (!sec) { window.location.href = 'admin.html'; return; }
  sec.classList.toggle('active');
  if (sec.classList.contains('active')) {
    sec.scrollIntoView({ behavior: 'smooth' });
    await refreshDashboard();
    await renderAdminNoticias();
    await renderAdminPartidos();
    await renderAdminPlantilla();
    await renderAdminTabla();
  }
}

function switchAdminPanel(id, el) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  if (el) el.classList.add('active');
  if (id === 'dashboard') refreshDashboard();
}

async function refreshDashboard() {
  try {
    const [n, p, j, t] = await Promise.all([
      api('/api/noticias'), api('/api/partidos'),
      api('/api/jugadores'), api('/api/tabla')
    ]);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('dashNoticias', n.length); set('dashPartidos', p.length);
    set('dashJugadores', j.length); set('dashEquipos', t.length);
  } catch(e) {
    ['dashNoticias','dashPartidos','dashJugadores','dashEquipos'].forEach(id => {
      const el = document.getElementById(id); if (el) el.textContent = '-';
    });
  }
}

function toggleAdminForm(id) {
  const form = document.getElementById(id);
  if (!form) return;
  form.classList.toggle('active');
  if (!form.classList.contains('active')) {
    form.querySelectorAll('input,textarea').forEach(inp => {
      inp.value = inp.type === 'number' ? '0' : '';
    });
  }
}

// Plantilla admin
async function renderAdminPlantilla() {
  const tbody = document.getElementById('adminPlantillaBody');
  if (!tbody) return;
  try {
    const jugadores = await api('/api/jugadores');
    tbody.innerHTML = jugadores.map(j => `
      <tr><td>${j.numero}</td><td>${j.nombre}</td><td>${j.posicion}</td>
      <td><button class="admin-btn admin-btn-del" onclick="deleteJugador('${j.id}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
  } catch(e) { tbody.innerHTML = '<tr><td colspan="4" style="color:var(--grey)">Error</td></tr>'; }
}

async function saveJugador() {
  const nombre = document.getElementById('jf-nombre').value.trim();
  const posicion = document.getElementById('jf-pos').value.trim();
  const numero = parseInt(document.getElementById('jf-num').value);
  const detalle = document.getElementById('jf-detalle').value.trim();
  if (!nombre||!posicion||!numero) { showToast('error','Campos obligatorios faltantes'); return; }
  try {
    await api('/api/admin/jugadores',{method:'POST',body:JSON.stringify({nombre,posicion,numero,detalle})});
    toggleAdminForm('jugadorForm');
    await renderAdminPlantilla(); showToast('success','Jugador agregado');
  } catch(e) { showToast('error',e.message); }
}

async function deleteJugador(id) {
  if (!confirm('Eliminar jugador?')) return;
  try {
    await api('/api/admin/jugadores/'+id,{method:'DELETE'});
    await renderAdminPlantilla(); showToast('success','Jugador eliminado');
  } catch(e) { showToast('error',e.message); }
}

// Tabla admin
async function renderAdminTabla() {
  const tbody = document.getElementById('adminTablaBody');
  if (!tbody) return;
  try {
    const equipos = await api('/api/tabla');
    tbody.innerHTML = equipos.map(t => `
      <tr><td>${t.nombre}</td><td>${t.jj}</td><td>${t.jg}</td><td>${t.je}</td><td>${t.jp}</td>
      <td>${t.gf}</td><td>${t.gc}</td><td>${t.dg>0?'+':''}${t.dg}</td>
      <td><span class="tabla-pts">${t.pts}</span></td>
      <td><button class="admin-btn admin-btn-del" onclick="deleteEquipo('${t.id}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
  } catch(e) { tbody.innerHTML = '<tr><td colspan="10" style="color:var(--grey)">Error</td></tr>'; }
}

async function saveEquipo() {
  const nombre = document.getElementById('tf-nombre').value.trim();
  const inicial = document.getElementById('tf-inicial').value.trim();
  if (!nombre||!inicial) { showToast('error','Nombre e inicial obligatorios'); return; }
  const jg=parseInt(document.getElementById('tf-jg').value)||0;
  const je=parseInt(document.getElementById('tf-je').value)||0;
  const jp=parseInt(document.getElementById('tf-jp').value)||0;
  const gf=parseInt(document.getElementById('tf-gf').value)||0;
  const gc=parseInt(document.getElementById('tf-gc').value)||0;
  try {
    await api('/api/admin/tabla',{method:'POST',body:JSON.stringify({nombre,inicial,jg,je,jp,gf,gc})});
    toggleAdminForm('tablaForm');
    await renderAdminTabla(); showToast('success','Equipo agregado');
  } catch(e) { showToast('error',e.message); }
}

async function deleteEquipo(id) {
  if (!confirm('Eliminar equipo?')) return;
  try {
    await api('/api/admin/tabla/'+id,{method:'DELETE'});
    await renderAdminTabla(); showToast('success','Equipo eliminado');
  } catch(e) { showToast('error',e.message); }
}

// Plantilla admin
let jugadorFotoBase64 = null;

function previewJugadorFoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    jugadorFotoBase64 = e.target.result;
    const preview = document.getElementById('jf-foto-preview');
    preview.src = jugadorFotoBase64;
    preview.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

async function renderAdminPlantilla() {
  const tbody = document.getElementById('adminPlantillaBody');
  if (!tbody) return;
  try {
    const jugadores = await api('/api/jugadores');
    tbody.innerHTML = jugadores.map(j => `
      <tr>
        <td><img src="${j.foto || '/imag/logo.png'}" alt="${j.nombre}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"></td>
        <td>${j.numero}</td><td>${j.nombre}</td><td>${j.posicion}</td>
        <td><button class="admin-btn admin-btn-del" onclick="deleteJugador('${j.id}')"><i class="fas fa-trash"></i></button></td>
      </tr>`).join('');
  } catch(e) { tbody.innerHTML = '<tr><td colspan="5" style="color:var(--grey)">Error</td></tr>'; }
}

async function saveJugador() {
  const nombre = document.getElementById('jf-nombre').value.trim();
  const posicion = document.getElementById('jf-pos').value.trim();
  const numero = parseInt(document.getElementById('jf-num').value);
  const detalle = document.getElementById('jf-detalle').value.trim();
  if (!nombre||!posicion||!numero) { showToast('error','Campos obligatorios faltantes'); return; }
  try {
    await api('/api/admin/jugadores',{method:'POST',body:JSON.stringify({nombre,posicion,numero,detalle,foto:jugadorFotoBase64||''})});
    jugadorFotoBase64 = null;
    document.getElementById('jf-foto-preview').style.display = 'none';
    document.getElementById('jf-foto-file').value = '';
    toggleAdminForm('jugadorForm');
    await renderAdminPlantilla(); showToast('success','Jugador agregado');
  } catch(e) { showToast('error',e.message); }
}

async function deleteJugador(id) {
  if (!confirm('Eliminar jugador?')) return;
  try {
    await api('/api/admin/jugadores/'+id,{method:'DELETE'});
    await renderAdminPlantilla(); showToast('success','Jugador eliminado');
  } catch(e) { showToast('error',e.message); }
}