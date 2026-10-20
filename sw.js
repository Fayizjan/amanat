const CACHE_NAME = 'amanat-cache-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل وتنظيف الكاش القديم (إذا وجد)
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
    })
  );
  self.clients.claim();
});

// جلب الملفات (استخدام الكاش إذا كان متاحاً أو جلبها من الشبكة)
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات غير GET (مثل POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // إذا كان الملف موجوداً في الكاش، استخدمه
      }
      return fetch(event.request).then((response) => {
        // إذا كانت الاستجابة غير صالحة، ارجعها كما هي
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // احفظ نسخة في الكاش لاستخدامها لاحقاً
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});