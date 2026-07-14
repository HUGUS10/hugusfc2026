const CACHE_NAME = 'hugusfc-v1';
const ASSETS = [
  '/',
  '/css/style.css', '/css/header.css', '/css/hero.css', '/css/cards.css',
  '/css/forms.css', '/css/footer.css', '/css/admin.css',
  '/css/responsive.css', '/css/animations.css',
  '/js/app.js', '/js/auth.js', '/js/menu.js', '/js/noticias.js',
  '/js/partidos.js', '/js/tienda.js', '/js/carrito.js', '/js/checkout.js',
  '/js/perfil.js', '/js/admin.js', '/js/animations.js',
  '/imag/logo.png', '/imag/bandera_oficial.png',
  '/imag/camiseta.png', '/imag/bandera.png'
];

self.addEventListener('install', e => {
  e.waitUntil(clients.claim());
  caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});