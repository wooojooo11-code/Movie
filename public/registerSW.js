const cleanup = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
  }
};

export const registerSW = (options = {}) => {
  const { onOfflineReady, onRegistered, onRegisteredSW, onRegisterError } = options;

  const registerPromise = cleanup()
    .then(() => {
      onRegistered?.(undefined);
      onRegisteredSW?.('/sw.js', undefined);
      onOfflineReady?.();
    })
    .catch((error) => {
      onRegisterError?.(error);
    });

  return async () => {
    await registerPromise;
  };
};

void cleanup();
