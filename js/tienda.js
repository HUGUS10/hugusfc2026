/* ══════════════════════════════════════════
   Tienda.js — Productos
   ═════════════════════════════════════════ */
let carrito = JSON.parse(localStorage.getItem('hugusfc_carrito') || '[]');

async function loadTienda() {
  const grid = document.getElementById('tiendaGrid');
  if (!grid) return;
  try {
    const productos = await api('/api/productos');
    if (!productos.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--grey);font-family:var(--font-ui);letter-spacing:.15em">Próximamente productos disponibles en la tienda oficial.</div>';
      return;
    }
    grid.innerHTML = productos.map(p => `
      <div class="producto-card reveal">
        <div class="producto-img-placeholder"><i class="fas fa-tshirt"></i></div>
        <div class="producto-body">
          <div class="producto-cat">${p.categoria||'Oficial'}</div>
          <div class="producto-nombre">${p.nombre}</div>
          <div class="producto-precio">$${Number(p.precio).toFixed(2)} MXN</div>
          <div class="producto-desc">${p.descripcion||''}</div>
          <button class="btn-p btn-sm producto-btn" onclick="agregarAlCarrito('${p.id}','${p.nombre.replace(/'/g,"\\'")}',${p.precio})"><i class="fas fa-cart-plus"></i> Agregar</button>
        </div>
      </div>`).join('');
    observeReveals();
  } catch(e) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--grey)">Error al cargar productos.</div>';
  }
}

function agregarAlCarrito(id, nombre, precio) {
  const existente = carrito.find(i => i.id === id);
  if (existente) { existente.qty++; }
  else { carrito.push({ id, nombre, precio, qty: 1 }); }
  localStorage.setItem('hugusfc_carrito', JSON.stringify(carrito));
  showToast('success', 'Agregado al carrito');
  updateCarritoCount();
}

function updateCarritoCount() {
  const count = carrito.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.carrito-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function getCarritoTotal() {
  return carrito.reduce((sum, i) => sum + (i.precio * i.qty), 0);
}