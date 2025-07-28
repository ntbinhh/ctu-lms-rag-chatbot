// Enhanced Service Worker for PWA
const CACHE_NAME = 'ctu-lms-v2.0.0';
const STATIC_CACHE = 'ctu-lms-static-v2.0.0';
const DYNAMIC_CACHE = 'ctu-lms-dynamic-v2.0.0';

const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/background-cantho.png',
  '/347.png',
];

const API_CACHE_PATTERNS = [
  /\/api\/auth\/me/,
  /\/api\/courses/,
  /\/api\/schedules/,
  /\/api\/facilities/,
  /\/api\/teachers/,
];

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('✅ Static assets cached successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Failed to cache static assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isHTMLRequest(request)) {
    event.respondWith(handleHTMLRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.some(asset => url.pathname.endsWith(asset)) ||
         url.pathname.includes('/static/') ||
         /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/.test(url.pathname);
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Check if request is for HTML
function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Error handling static asset:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy and selective caching
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && shouldCache) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (shouldCache) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📱 Serving cached API response for:', url.pathname);
        return cachedResponse;
      }
    }
    
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'Vui lòng kiểm tra kết nối mạng'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle HTML requests with network-first, fallback to shell
async function handleHTMLRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CTU LMS - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #0c4da2, #1976d2);
              color: white;
              text-align: center;
            }
            .offline-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .retry-btn {
              background: white;
              color: #0c4da2;
              border: none;
              padding: 12px 24px;
              border-radius: 25px;
              font-weight: bold;
              cursor: pointer;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-icon">📡</div>
          <h1>Chế độ Offline</h1>
          <p>Vui lòng kiểm tra kết nối mạng</p>
          <button class="retry-btn" onclick="window.location.reload()">
            Thử lại
          </button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle other dynamic requests
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-schedule') {
    event.waitUntil(syncScheduleData());
  } else if (event.tag === 'background-sync-grades') {
    event.waitUntil(syncGradeData());
  }
});

// Sync schedule data when back online
async function syncScheduleData() {
  try {
    console.log('📅 Syncing schedule data...');
    const pendingRequests = await getStoredRequests('schedule');
    
    for (const request of pendingRequests) {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
    
    await clearStoredRequests('schedule');
    console.log('✅ Schedule sync completed');
  } catch (error) {
    console.error('❌ Schedule sync failed:', error);
  }
}

// Sync grade data when back online
async function syncGradeData() {
  try {
    console.log('📊 Syncing grade data...');
    const pendingRequests = await getStoredRequests('grades');
    
    for (const request of pendingRequests) {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
    
    await clearStoredRequests('grades');
    console.log('✅ Grade sync completed');
  } catch (error) {
    console.error('❌ Grade sync failed:', error);
  }
}

// Helper functions for background sync
async function getStoredRequests(type) {
  const db = await openDB();
  const transaction = db.transaction(['requests'], 'readonly');
  const store = transaction.objectStore('requests');
  const requests = await store.getAll();
  return requests.filter(req => req.type === type);
}

async function clearStoredRequests(type) {
  const db = await openDB();
  const transaction = db.transaction(['requests'], 'readwrite');
  const store = transaction.objectStore('requests');
  const requests = await store.getAll();
  
  for (const request of requests) {
    if (request.type === type) {
      await store.delete(request.id);
    }
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CTU-LMS-SW', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    image: data.image,
    data: data.data,
    actions: data.actions || [
      {
        action: 'view',
        title: 'Xem chi tiết',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Bỏ qua',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now(),
    renotify: true,
    tag: data.tag || 'ctu-lms-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.openWindow(data.url || '/')
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 CTU LMS Service Worker loaded successfully');
