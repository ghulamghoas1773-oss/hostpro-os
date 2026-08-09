/* HostPro OS — service worker.
   Caches the app shell so it opens instantly and still opens with no signal.
   It deliberately never touches the workspace API: those are cross-origin
   POSTs to Apps Script, and a stale cached reply would be worse than an
   honest "offline". Data is cached separately by the page itself. */
const CACHE = 'hostpro-os-v2';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-180.png', './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;                                  // never cache a save
  if(req.url.indexOf('script.google.com') > -1) return;             // never cache the workspace
  if(new URL(req.url).origin !== self.location.origin){
    // fonts and the spreadsheet library: use the cache, refresh in the background
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => hit)));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
});
