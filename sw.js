// Define un nombre y versión para la caché de la aplicación
const CACHE_NAME = 'inventario-moni-hector-v1';

// Lista de archivos esenciales para que la aplicación funcione sin conexión
const urlsToCache = [
  './', // La página principal
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Evento 'install': se dispara cuando el Service Worker se instala por primera vez.
self.addEventListener('install', event => {
  // Espera hasta que la promesa se resuelva
  event.waitUntil(
    // Abre la caché con el nombre que definimos
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        // Agrega todos los archivos de nuestra lista a la caché
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': se dispara cada vez que la página solicita un recurso (una imagen, un script, etc.)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Busca el recurso en la caché
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en la caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no está en la caché, lo solicita a la red
        return fetch(event.request);
      }
    )
  );
});
