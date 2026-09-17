/* =========================================================================
 * PHCN-METRICS · sw.js — Service Worker
 * Cho phép chạy OFFLINE sau lần mở đầu tiên (quan trọng khi dùng trên iPad
 * tại buồng bệnh không có Wi-Fi ổn định).
 * Đổi CACHE khi phát hành phiên bản mới để iPad tự cập nhật.
 * ========================================================================= */
var CACHE = 'phcn-metrics-v16';

var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/scales-core.js',
  './assets/js/scales-neuro.js',
  './assets/js/scales-msk.js',
  './assets/js/scales-cardio.js',
  './assets/js/scales-psych.js',
  './assets/js/scales-labs.js',
  './assets/js/icons.js',
  './assets/js/figures.js',
  './assets/js/store.js',
  './assets/js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u)['catch'](function () { /* bỏ qua file thiếu */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches['delete'](k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Ưu tiên mạng, thất bại thì lấy bản đã lưu — luôn có bản mới nhất khi
   online và vẫn dùng được khi mất mạng. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    })['catch'](function () {
      return caches.match(e.request).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
