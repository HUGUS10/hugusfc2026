/* ══════════════════════════════════════════
   Carrito.js — Página del carrito
   ═════════════════════════════════════════ */
function renderCarrito() {
  carrito = JSON.parse(localStorage.getItem('hugusfc_carrito') || '[]');
  const itemsEl = document.getElementById('carritoItems');
  const resumenEl = document.getElementById('carritoResumen');
  if (!itemsEl) return;

  if (!carrito.length) {
    itemsEl.innerHTML = '<div class="carrito-empty"><i class="fas fa-shopping-cart"></i>Tu carrito está vacío<br><a href="tienda.html" class="btn-o btn-sm" style="margin-top:16px;display:inline-flex">Ver Tienda</a></div>';
    if (resumenEl) resumenEl.style.display = 'none';
    return;
  }

  if (resumenEl) resumenEl.style.display = 'block';
  itemsEl.innerHTML = carrito.map((item, i) => `
    <div class="carrito-item">
      <div class="carrito-item-img"><i class="fas fa-tshirt" style="color:rgba(201,162,39,.2);font-size:1.5rem"></i></div>
      <div class="carrito-item-info">
        <div class="carrito-item-name">${item.nombre}</div>
        <div class="carrito-item-price">$${Number(item.precio).toFixed(2)}</div>
      </div>
      <div class="carrito-item-qty">
        <button class="carrito-qty-btn" onclick="cambiarQty(${i},-1)">−</button>
        <span class="carrito-qty-num">${item.qty}</span>
        <button class="carrito-qty-btn" onclick="cambiarQty(${i},1)">+</button>
      </div>
      <button class="carrito-item-remove" onclick="removeFromCarrito(${i})"><i class="fas fa-trash"></i></button>
    </div>`).join('');

  // Resumen
  const subtotal = getCarritoTotal();
  const envio = subtotal > 500 ? 0 : 99;
  const total = subtotal + envio;
  if (resumenEl) {
    resumenEl.innerHTML = `
      <div class="carrito-resumen-title">Resumen</div>
      <div class="carrito-resumen-line"><span>Subtotal (${carrito.reduce((s,i)=>s+i.qty,0)} artículos)</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="carrito-resumen-line"><span>Envío</span><span>${envio===0?'GRATIS':'$'+envio.toFixed(2)}</span></div>
      <div class="carrito-resumen-line total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
      <a href="checkout.html" class="btn-p" style="width:100%;margin-top:16px;text-align:center;display:block">Proceder al Pago</a>
      <a href="tienda.html" class="btn-o btn-sm" style="width:100%;margin-top:8px;text-align:center;display:block">Seguir Comprando</a>`;
  }
}

function cambiarQty(index, delta) {
  carrito[index].qty += delta;
  if (carrito[index].qty <= 0) carrito.splice(index, 1);
  localStorage.setItem('hugusfc_carrito', JSON.stringify(carrito));
  renderCarrito();
}

function removeFromCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem('hugusfc_carrito', JSON.stringify(carrito));
  renderCarrito();
  showToast('info', 'Producto eliminado del carrito');
}