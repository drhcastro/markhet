// Define un nombre y versión para la caché de la aplicación
const CACHE_NAME = 'inventario-moni-hector-v2'; // Incrementamos la versión para forzar la actualización

// Lista de archivos esenciales para que la aplicación funcione sin conexión
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './carrito1.png',
  './carrito2.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Evento 'install': se dispara cuando el Service Worker se instala por primera vez.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        // Usamos un array de promesas para manejar las peticiones de terceros
        const cachePromises = urlsToCache.map(urlToCache => {
          // Para las URLs de terceros, hacemos la petición en modo 'no-cors'
          if (urlToCache.startsWith('http')) {
            return cache.add(new Request(urlToCache, { mode: 'no-cors' }));
          }
          // Para los archivos locales, los añadimos normalmente
          return cache.add(urlToCache);
        });
        return Promise.all(cachePromises);
      })
  );
});

// Evento 'activate': se dispara cuando el nuevo Service Worker se activa.
// Se usa para limpiar cachés antiguas.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// Evento 'fetch': se dispara cada vez que la página solicita un recurso.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en la caché, lo devuelve.
        if (response) {
          return response;
        }
        // Si no, lo solicita a la red.
        return fetch(event.request);
      }
    )
  );
});
