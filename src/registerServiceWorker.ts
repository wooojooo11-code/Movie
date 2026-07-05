import { registerSW } from 'virtual:pwa-register';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    const updateServiceWorker = registerSW({
      immediate: true,
      onNeedRefresh() {
        void updateServiceWorker(true);
      },
      onRegisterError(error) {
        console.error('[PWA] Service worker registration failed.', error);
      }
    });
  } else {
    void (async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
      }
    })();
  }
}
