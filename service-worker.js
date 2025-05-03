const CACHE_VERSION = 'v3.0.0';
const OFFLINE_URL = 'offline.html';
const SYNC_TAG = 'invoice-sync';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

// Assets to cache
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon.png',
  '/version.json',
  '/manifest.json',
  '/offline.html'
];

// Cache name with version
const CACHE_NAME = `ktz-invoice-cache-${CACHE_VERSION}`;

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// Background sync for failed network requests
self.addEventListener('sync', event => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncInvoices());
  }
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip version.json to always get latest
  if (event.request.url.includes('version.json')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Handle PDF generation requests
  if (event.request.url.includes('generate-pdf')) {
    event.respondWith(handlePDFRequest(event));
    return;
  }
  
  // Handle regular requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => caches.match(OFFLINE_URL));
      })
  );
});

// Handle PDF generation and caching
async function handlePDFRequest(event) {
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
      return response;
    }
    throw new Error('PDF generation failed');
  } catch (error) {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return new Response('PDF generation failed', { status: 500 });
  }
}

// Background sync for failed invoice sends
async function syncInvoices() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  const failedRequests = keys.filter(key => 
    key.url.includes('mailto:') && 
    key.url.includes('attachment')
  );

  for (const request of failedRequests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Version update check
async function checkVersionUpdate() {
  try {
    const response = await fetch('/version.json', { cache: 'no-store' });
    const data = await response.json();
    
    if (data.version !== CACHE_VERSION) {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'version-update',
          version: data.version
        });
      });
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
}

// Periodic version check
setInterval(checkVersionUpdate, VERSION_CHECK_INTERVAL);

// Message event - handle updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
