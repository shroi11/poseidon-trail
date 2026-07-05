const CACHE = 'ptrail-app-v5';
const BADGE_NAMES = [
  'poseidon', 'zeus', 'athena', 'hermes', 'apollo', 'artemis', 'hera', 'ares',
  'hephaestus', 'aphrodite', 'demeter', 'dionysus',
  'odysseus', 'achilles', 'theseus', 'hercules', 'perseus', 'asclepius',
  'guest', 'pantheon'
];
const ASSETS = [
  './',
  'index.html',
  'css/app.css',
  'js/data.js',
  'js/pack-corfu.js',
  'js/pack-road.js',
  'js/app.js',
  'manifest.json',
  'icons/icon-180.png',
  'icons/icon-512.png',
  ...BADGE_NAMES.map(n => 'assets/badges/badge-' + n + '.svg')
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Only clear our own old app caches. The Phase 0 spike ('ptrail-spike-*') and
// future content-pack caches share this origin and must survive app updates.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k.startsWith('ptrail-app-') && k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// Cache-first. iOS needs range-request handling for audio served from cache.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.headers.has('range')) {
    e.respondWith(handleRange(req));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit =>
      hit ||
      (req.mode === 'navigate'
        ? caches.match('index.html').then(page => page || fetch(req))
        : fetch(req))
    )
  );
});

async function handleRange(req) {
  const hit = await caches.match(req.url, { ignoreSearch: true });
  if (!hit) return fetch(req);
  const buf = await hit.arrayBuffer();
  const range = req.headers.get('range');
  const m = /bytes=(\d+)-(\d*)/.exec(range);
  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes'
    }
  });
}
