// Enhanced Dark Chatbot Builder Pro - Service Worker
// Version: 2.0.0

const CACHE_NAME = 'chatbot-builder-v2.0.0';
const STATIC_CACHE = 'chatbot-static-v2.0.0';
const DYNAMIC_CACHE = 'chatbot-dynamic-v2.0.0';

// Resources to cache for offline use
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './custom.css',
  './manifest.json',
  './favicon.svg',
  './favicon.ico',
  './social-preview.svg',
  './sitemap.xml',
  './robots.txt',
  './icons/icon-72x72.svg',
  './icons/icon-96x96.svg',
  './icons/icon-128x128.svg',
  './icons/icon-144x144.svg',
  './icons/icon-152x152.svg',
  './icons/icon-192x192.svg',
  './icons/icon-384x384.svg',
  './icons/icon-512x512.svg'
];

// External CDN resources to cache dynamically
const CDN_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.quilljs.com/1.3.6/quill.snow.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.quilljs.com/1.3.6/quill.min.js',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(err => {
        console.log('Service Worker: Cache failed', err);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
              console.log('Service Worker: Clearing old cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different request types
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname === '/') {
    // Static assets - cache first
    event.respondWith(cacheFirst(request));
  } else if (CDN_RESOURCES.some(resource => request.url.includes(resource))) {
    // CDN resources - stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.origin === location.origin) {
    // Same origin - cache first
    event.respondWith(cacheFirst(request));
  } else {
    // External resources - network first with cache fallback
    event.respondWith(networkFirst(request));
  }
});

// Cache strategies
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache first failed:', error);
    // Return offline fallback if available
    return getOfflineFallback(request);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback
    return getOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  try {
    const cachedResponse = await caches.match(request);
    const networkResponsePromise = fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    });

    return cachedResponse || networkResponsePromise;
  } catch (error) {
    console.log('Stale while revalidate failed:', error);
    return getOfflineFallback(request);
  }
}

async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // Return cached main page for navigation requests
  if (request.destination === 'document') {
    const cachedPage = await caches.match('./index.html');
    if (cachedPage) {
      return cachedPage;
    }
  }

  // Return offline page or error response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This resource is not available offline',
      url: request.url
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }
  );
}

// Background sync for data persistence
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);

  if (event.tag === 'chatbot-data-sync') {
    event.waitUntil(syncChatbotData());
  }
});

async function syncChatbotData() {
  try {
    // This would sync data with a backend if available
    console.log('Service Worker: Syncing chatbot data');

    // For now, just ensure local storage is intact
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'DATA_SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.log('Service Worker: Data sync failed', error);
  }
}

// Push notifications (for future features)
self.addEventListener('push', event => {
  console.log('Service Worker: Push received', event);

  const options = {
    body: event.data ? event.data.text() : 'Chatbot Builder notification',
    icon: './icons/icon-192x192.png',
    badge: './icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: './icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Chatbot Builder', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./index.html')
    );
  }
});

// Message handling from main app
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_RESOURCE':
        cacheResource(event.data.url);
        break;
    }
  }
});

async function cacheResource(url) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.add(url);
    console.log('Service Worker: Resource cached', url);
  } catch (error) {
    console.log('Service Worker: Failed to cache resource', url, error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync', event.tag);

  if (event.tag === 'chatbot-backup') {
    event.waitUntil(performPeriodicBackup());
  }
});

async function performPeriodicBackup() {
  try {
    console.log('Service Worker: Performing periodic backup');

    // Notify clients to backup data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'PERFORM_BACKUP',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.log('Service Worker: Periodic backup failed', error);
  }
}
