const CACHE_NAME = 'woander-v3';
const PRECACHE_URLS = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept build assets — Vite gives them content-hashed filenames
  // so they're safe to cache by the browser's HTTP cache. Intercepting them
  // here risks serving stale chunks from a previous deploy.
  if (url.pathname.startsWith('/assets/')) {
    return;
  }

  // For navigation requests (HTML pages), use network-first so the latest
  // index.html is always fetched. Fall back to cache only when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // For other same-origin GET requests, cache-first with network fallback.
  if (request.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Woander!',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Destinations',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Woander', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#destinations')
    );
  }
});
