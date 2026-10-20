/* =========================================================
   Service Worker — تطبيق الأمانات
   ========================================================= */
const CACHE_NAME = 'amanat-v3.4';

const ASSETS = [
  '/Amanat-v3/',
  '/Amanat-v3/index.html',
  '/Amanat-v3/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap'
];

/* ---- التثبيت: تخزين الملفات الأساسية ---- */
self.addEventListener('install', (e) => {
  console.log('🔧 تثبيت Service Worker...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(err => console.log('⚠️ بعض الملفات فشل تخزينها:', err)))
      .then(() => self.skipWaiting())
  );
});

/* ---- التنشيط: حذف الكاشات القديمة ---- */
self.addEventListener('activate', (e) => {
  console.log('✅ تنشيط Service Worker');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('🗑️ حذف كاش قديم:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ---- الجلب: من الكاش أولاً، ثم الشبكة ---- */
self.addEventListener('fetch', (e) => {
  // تجاهل الطلبات غير GET
  if (e.request.method !== 'GET') return;

  // تجاهل طلبات Chrome extension
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request)
        .then(response => {
          // احفظ نسخة من الردود الناجحة
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          // عند انقطاع الإنترنت → أعد index.html للصفحات
          if (e.request.mode === 'navigate') {
            return caches.match('/Amanat-v3/index.html');
          }
        });
    })
  );
});
