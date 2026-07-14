/* ══════════════════════════════════════════
   Noticias.js — Carga y render de noticias
   ═════════════════════════════════════════ */
async function loadNoticias() {
  const grid = document.getElementById('noticiasGrid');
  if (!grid) return;
  try {
    const noticias = await api('/api/noticias');
    if (!noticias.length) {
      grid.innerHTML = '<div class="noticias-empty">No hay noticias publicadas aún.</div>';
      return;
    }
    grid.innerHTML = noticias.slice(0, 9).map(n => `
      <div class="noticia-card reveal">
        <div class="noticia-img-placeholder"><i class="fas fa-newspaper"></i></div>
        <div class="noticia-body">
          <div class="noticia-cat">${n.categoria}</div>
          <div class="noticia-titulo">${n.titulo}</div>
          <div class="noticia-resumen">${n.resumen}</div>
          <div class="noticia-fecha"><i class="far fa-clock"></i>&nbsp; ${formatDate(n.fecha)}</div>
        </div>
      </div>`).join('');
    observeReveals();
  } catch(e) {
    grid.innerHTML = '<div class="noticias-empty">Error al cargar noticias.</div>';
  }
}

// Admin noticias
async function renderAdminNoticias() {
  const tbody = document.getElementById('adminNoticiasBody');
  if (!tbody) return;
  try {
    const noticias = await api('/api/noticias');
    tbody.innerHTML = noticias.map(n => `
      <tr>
        <td>${n.titulo.substring(0,40)}${n.titulo.length>40?'...':''}</td>
        <td>${n.categoria}</td>
        <td>${formatDate(n.fecha)}</td>
        <td><button class="admin-btn admin-btn-del" onclick="deleteNoticia('${n.id}')"><i class="fas fa-trash"></i></button></td>
      </tr>`).join('');
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:var(--grey)">Error</td></tr>';
  }
}

async function saveNoticia() {
  const titulo = document.getElementById('nf-titulo').value.trim();
  const categoria = document.getElementById('nf-cat').value.trim();
  const fecha = document.getElementById('nf-fecha').value;
  const resumen = document.getElementById('nf-resumen').value.trim();
  if (!titulo||!categoria||!fecha||!resumen) { showToast('error','Completa todos los campos'); return; }
  try {
    await api('/api/admin/noticias', { method:'POST', body:JSON.stringify({titulo,categoria,fecha,resumen}) });
    toggleAdminForm('noticiaForm');
    await renderAdminNoticias();
    await loadNoticias();
    showToast('success','Noticia creada');
  } catch(e) { showToast('error', e.message); }
}

async function deleteNoticia(id) {
  if (!confirm('Eliminar esta noticia?')) return;
  try {
    await api('/api/admin/noticias/'+id, { method:'DELETE' });
    await renderAdminNoticias();
    await loadNoticias();
    showToast('success','Noticia eliminada');
  } catch(e) { showToast('error', e.message); }
}