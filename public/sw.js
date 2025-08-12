// Enhanced service worker for PWA with better caching strategies
const CACHE_NAME = 'shopping-list-v1.1';
const STATIC_CACHE_NAME = 'shopping-list-static-v1.1';
const DYNAMIC_CACHE_NAME = 'shopping-list-dynamic-v1.1';

// Static assets to cache during install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-256.png', 
  '/icons/icon-512.png',
  '/icons/icon-maskable.png'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for API calls  
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for dynamic content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Handle different fetch strategies based on request type
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // App shell (HTML) - Network First with fast cache fallback
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      return await networkFirstWithFastFallback(request);
    }
    
    // JavaScript/CSS - Stale While Revalidate
    if (isAsset(url.pathname)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
    }
    
    // Default to Network First
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('Fetch handler error:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflineFallback();
    }
    
    throw error;
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network First strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Network First with fast cache fallback for app shell
async function networkFirstWithFastFallback(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try network with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(request, { 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
    
  } catch (error) {
    // Fast fallback to cache
    const cached = await cache.match(request) || await cache.match('/');
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Update cache in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // If not cached, wait for network
  return fetchPromise;
}

// Get offline fallback page
async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  return await cache.match('/') || new Response(
    '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.includes('/icons/') || 
         pathname.includes('/manifest.webmanifest') ||
         pathname.includes('.png') ||
         pathname.includes('.ico');
}

function isAsset(pathname) {
  return pathname.includes('.js') || 
         pathname.includes('.css') ||
         pathname.includes('.woff') ||
         pathname.includes('.woff2');
}

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    console.log('Syncing offline data...');
    
    // Notify clients that sync is happening
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_START' });
    });
    
    // Here we would sync any offline database operations
    // This is handled by the app's offline queue system
    
    // Notify clients that sync is complete
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
    
    console.log('Offline data synced successfully');
    
  } catch (error) {
    console.error('Failed to sync offline data:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});