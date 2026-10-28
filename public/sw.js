const C = 'pet-house-v1';
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(C);
    const base = self.registration.scope;
    const r = await fetch(base + 'precache.json', { cache: 'no-store' }).then(r => r.json()).catch(() => []);
    await c.addAll(['', ...r].map(p => base + p));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== C) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(C);
    const url = new URL(req.url); url.search = '';
    // Video range requests: serve from full cached file
    const hit = await c.match(url.href) || (req.mode === 'navigate' ? await c.match(self.registration.scope) : null);
    if (hit) {
      const range = req.headers.get('range');
      if (range && hit.headers.get('content-type')?.startsWith('video')) {
        const buf = await hit.clone().arrayBuffer();
        const m = /bytes=(\d+)-(\d*)/.exec(range); const s = +m[1]; const end = m[2] ? +m[2] : buf.byteLength - 1;
        return new Response(buf.slice(s, end + 1), { status: 206, headers: { 'Content-Type': hit.headers.get('content-type'), 'Content-Range': `bytes ${s}-${end}/${buf.byteLength}`, 'Content-Length': String(end - s + 1), 'Accept-Ranges': 'bytes' } });
      }
      // refresh in background
      fetch(req).then(r => { if (r.ok && r.status === 200) c.put(url.href, r); }).catch(() => {});
      return hit;
    }
    try {
      const r = await fetch(req);
      if (r.ok && r.status === 200) c.put(url.href, r.clone());
      return r;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  })());
});
