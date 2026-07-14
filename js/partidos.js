/* ══════════════════════════════════════════
   Partidos.js — Calendario y Resultados
   ═════════════════════════════════════════ */
let _nextMatchDate = null;

async function loadPartidos() {
  const partidos = await api('/api/partidos');
  const now = new Date();
  const parsed = partidos.map(p => ({
    ...p,
    goles_local: safeJSON(p.goles_local),
    goles_visita: safeJSON(p.goles_visita),
    fechaDate: new Date(p.fecha)
  }));

  const proximos = parsed.filter(p => !p.resultado && p.fechaDate > now).sort((a,b) => a.fechaDate - b.fechaDate);
  const resultados = parsed.filter(p => p.resultado).sort((a,b) => b.fechaDate - a.fechaDate);

  renderCalendario(proximos);
  renderResultados(resultados);
  initCountdown();
}

function renderCalendario(proximos) {
  const mainCard = document.getElementById('mainMatchCard');
  const main = proximos[0];

  if (main) {
    const d = main.fechaDate;
    _nextMatchDate = d;
    mainCard.innerHTML = `
      <div class="match-top">
        <div class="match-comp-badge">${main.competencia}</div>
        <div class="match-teams">
          <div class="team-block">
            ${escudoImg(ESCUDO, 64)}
            <div class="team-name">HUGUS FC</div>
          </div>
          <div class="vs-badge">VS</div>
          <div class="team-block">
            <div class="team-emblem"><span>${main.rival.charAt(0)}</span></div>
            <div class="team-name">${main.rival.toUpperCase()}</div>
          </div>
        </div>
      </div>
      <div class="match-bottom">
        <div class="match-date-big">${d.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        <div class="match-meta">
          <span><i class="far fa-clock"></i> <strong>${d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})} hrs</strong></span>
          <span><i class="fas fa-map-marker-alt"></i> <strong>${main.lugar||'Por confirmar'}</strong></span>
        </div>
        <button class="btn-p" onclick="showToast('info','Recordatorio guardado')"><i class="fas fa-bell"></i>&nbsp; Recordar Partido</button>
      </div>`;
  } else {
    _nextMatchDate = null;
    mainCard.innerHTML = '<div style="padding:40px;text-align:center;color:var(--grey)"><i class="fas fa-calendar-times" style="font-size:2rem;margin-bottom:12px;display:block;color:var(--gold)"></i>No hay partidos programados</div>';
  }

  const sidebar = document.getElementById('nextMatches');
  const others = proximos.slice(1, 5);
  sidebar.innerHTML = others.length ? others.map(p => {
    const d = new Date(p.fecha);
    return `<div class="mini-match">
      <div class="mini-date">${d.toLocaleDateString('es-MX',{day:'numeric',month:'short'})} · ${d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</div>
      <div class="mini-teams"><span class="t home">HUGUS</span><span class="mini-vs">VS</span><span class="t away">${p.rival.substring(0,8).toUpperCase()}</span></div>
    </div>`;
  }).join('') : '<div style="padding:20px;text-align:center;color:var(--grey);grid-column:1/-1">Sin partidos adicionales</div>';
}

function renderResultados(resultados) {
  const grid = document.getElementById('resultadosGrid');
  if (!resultados.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--grey)">No hay resultados registrados.</div>';
    return;
  }
  grid.innerHTML = resultados.map(r => {
    const [gL,gV] = r.resultado.split('-').map(Number);
    const isWin = gL > gV, isDraw = gL === gV;
    const golesHTML = [
      ...r.goles_local.map(g => `<li><span class="gol-minuto">${g.min}'</span><span class="gol-jugador">${g.jug}</span><span class="gol-equipo">HUGUS</span></li>`),
      ...r.goles_visita.map(g => `<li><span class="gol-minuto">${g.min}'</span><span class="gol-jugador">${g.jug}</span><span class="gol-equipo">${r.rival}</span></li>`)
    ].join('');
    return `<div class="resultado-card reveal">
      <div class="resultado-header">
        <div class="resultado-equipo">${escudoImg(ESCUDO,30)}<span class="resultado-nombre">HUGUS</span></div>
        <div class="resultado-marcador"><span class="${isWin?'win':isDraw?'draw':'lose'}">${gL}</span> - <span class="${!isWin&&!isDraw?'win':isDraw?'draw':'lose'}">${gV}</span></div>
        <div class="resultado-equipo" style="justify-content:flex-end"><span class="resultado-nombre">${r.rival.toUpperCase()}</span><div class="resultado-escudo-peq"><span>${r.rival.charAt(0)}</span></div></div>
      </div>
      <div class="resultado-body">
        <div class="resultado-fecha"><i class="far fa-clock"></i> ${formatDate(r.fecha)} · ${r.competencia}</div>
        <ul class="goles-lista">${golesHTML || '<li style="color:var(--grey)">Sin detalle de goles</li>'}</ul>
      </div>
    </div>`;
  }).join('');
  observeReveals();
}

function initCountdown() {
  function update() {
    if (!_nextMatchDate) return;
    let diff = _nextMatchDate - new Date();
    if (diff < 0) diff = 0;
    const el = (id) => document.getElementById(id);
    if (el('cdDays')) el('cdDays').textContent = String(Math.floor(diff/86400000)).padStart(2,'0');
    if (el('cdHours')) el('cdHours').textContent = String(Math.floor((diff%86400000)/3600000)).padStart(2,'0');
    if (el('cdMins')) el('cdMins').textContent = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    if (el('cdSecs')) el('cdSecs').textContent = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  }
  update();
  setInterval(update, 1000);
}

// Admin partidos
async function renderAdminPartidos() {
  const tbody = document.getElementById('adminPartidosBody');
  if (!tbody) return;
  try {
    const partidos = await api('/api/partidos');
    tbody.innerHTML = partidos.map(p => `
      <tr>
        <td>${p.rival}</td><td>${formatDate(p.fecha)}</td><td>${p.lugar||'-'}</td>
        <td>${p.resultado||'<span style="color:var(--grey)">Pendiente</span>'}</td>
        <td><button class="admin-btn admin-btn-del" onclick="deletePartido('${p.id}')"><i class="fas fa-trash"></i></button></td>
      </tr>`).join('');
  } catch(e) { tbody.innerHTML = '<tr><td colspan="5" style="color:var(--grey)">Error</td></tr>'; }
}

async function savePartido() {
  const rival = document.getElementById('pf-rival').value.trim();
  const fecha = document.getElementById('pf-fecha').value;
  const lugar = document.getElementById('pf-lugar').value.trim();
  const competencia = document.getElementById('pf-comp').value.trim();
  if (!rival||!fecha) { showToast('error','Rival y fecha obligatorios'); return; }
  try {
    await api('/api/admin/partidos',{method:'POST',body:JSON.stringify({rival,fecha,lugar,competencia})});
    toggleAdminForm('partidoForm');
    await renderAdminPartidos();
    await loadPartidos();
    showToast('success','Partido creado');
  } catch(e) { showToast('error',e.message); }
}

async function deletePartido(id) {
  if (!confirm('Eliminar este partido?')) return;
  try {
    await api('/api/admin/partidos/'+id,{method:'DELETE'});
    await renderAdminPartidos();
    await loadPartidos();
    showToast('success','Partido eliminado');
  } catch(e) { showToast('error',e.message); }
}