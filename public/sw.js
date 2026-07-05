self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));

      await self.clients.claim();
      await self.registration.unregister();

      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      await Promise.all(
        clients.map((client) => {
          const nextUrl = new URL(client.url);
          nextUrl.searchParams.delete('compat');
          nextUrl.searchParams.set('shellRefresh', String(Date.now()));
          return client.navigate(nextUrl.toString());
        })
      );
    })()
  );
});
