import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD) {
  registerSW({
    immediate: true
  });
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => registrations.forEach((registration) => registration.unregister()))
    .catch(() => {
      // Development should keep rendering even if a stale service worker cannot be removed.
    });
}
