/* ══════════════════════════════════════════
   Checkout.js
   ═════════════════════════════════════════ */
async function handleCheckout(e) {
  e.preventDefault();
  const nombre = document.getElementById('checkNombre').value.trim();
  const email = document.getElementById('checkEmail').value.trim();
  const direccion = document.getElementById('checkDireccion').value.trim();
  if (!nombre||!email||!direccion) { showToast('error','Completa todos los campos'); return; }

  carrito = JSON.parse(localStorage.getItem('hugusfc_carrito') || '[]');
  if (!carrito.length) { showToast('error','El carrito está vacío'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span> Procesando...'; }

  try {
    const result = await api('/api/carrito/comprar', {
      method: 'POST',
      body: JSON.stringify({ items: carrito, nombre, email, direccion })
    });
    localStorage.removeItem('hugusfc_carrito');
    showToast('success', 'Pedido ' + result.ordenId + ' realizado con éxito');
    setTimeout(() => { window.location.href = 'comunidad.html'; }, 2000);
  } catch(e) { showToast('error', e.message); }
  finally { if (btn) { btn.disabled = false; btn.textContent = 'Confirmar Pedido'; } }
}