// Define un nombre y versión para la caché de la aplicación.
// Incrementamos la versión para forzar la actualización en los dispositivos.
const CACHE_NAME = 'inventario-moni-hector-v4';

// Lista de archivos esenciales que componen la "cáscara" de la aplicación.
// Estos son los únicos archivos que se guardarán durante la instalación.
const APP_SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './carrito1.png',
  './carrito2.png'
];

// Evento 'install': se dispara cuando el Service Worker se instala.
// Su única misión es guardar el App Shell en la caché.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Instalando Service Worker y cacheando App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('Fallo al cachear el App Shell:', error);
      })
  );
});

// Evento 'activate': se dispara cuando el nuevo Service Worker se activa.
// Se usa para limpiar las cachés de versiones anteriores y evitar conflictos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Evento 'fetch': se dispara para CADA petición que hace la página.
// Aquí implementamos la estrategia "Network falling back to cache".
self.addEventListener('fetch', event => {
  // Ignoramos las peticiones que no son GET y las de la API de Firestore,
  // ya que Firebase tiene su propio manejo de datos sin conexión.
  if (event.request.method !== 'GET' || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    // 1. Intenta obtener el recurso de la red primero.
    fetch(event.request)
      .then(networkResponse => {
        // Si la petición a la red es exitosa, la guardamos en caché para el futuro
        // y la devolvemos al navegador.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return networkResponse;
      })
      .catch(async () => {
        // 2. Si la red falla (estás sin conexión), busca el recurso en la caché.
        console.log('Fallo de red. Buscando en caché:', event.request.url);
        const cachedResponse = await caches.match(event.request);
        // Si lo encuentra en caché, lo devuelve.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si no está ni en la red ni en la caché, la petición fallará.
      })
  );
});
