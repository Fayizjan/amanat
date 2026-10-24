const CACHE_NAME = 'amanat-cache-v10'; // تم تغيير الرقم لإجبار المتصفح على التحديث
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/AmanatGuide.html' // أضفنا دليل الاستخدام ليعمل أوفلاين
  // إذا كان لديك ملفات أخرى تريدها أن تعمل أوفلاين، أضفها هنا بنفس الطريقة
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // إجبار المتصفح على استخدام الكاش الجديد فوراً
});

// تفعيل وتنظيف الكاش القديم (إذا وجد)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // حذف الكاشات القديمة
          }
        })
      );
    })
  );
  self.clients.claim(); // السيطرة على الصفحات المفتوحة فوراً
});

// جلب الملفات
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => {
        // صفحة احتياطية في حال فشل كل شيء وانقطاع النت
        return caches.match('/index.html'); 
    })
  );
});