const CACHE = "blitzwort-v2";
const ASSETS = ["./", "./index.html", "./apple-touch-icon.png", "./icon-512.png", "./manifest.json", "./words/de-sprite.mp3", "./words/de-sprite.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    // cache: "no-store" forces a real network round-trip instead of letting
    // the browser silently reuse an HTTP-cached copy of this exact URL —
    // without it, "network-first" can still serve stale content on every
    // load, which is what happened here.
    fetch(e.request, { cache: "no-store" })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
