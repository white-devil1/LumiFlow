const CACHE_NAME = 'lumiflow-v2';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
          if (cachedResponse) {
              return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                      cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
          });
      })
  );
});