console.log('[compat] Loading latest app entry from stale cached shell.');

const RECOVERY_KEY = 'movielist:stale-shell-recovery-at';
const RECOVERY_COOLDOWN_MS = 10000;

const recoverStaleShell = async (reason) => {
  console.warn('[compat] Recovering stale shell.', reason);

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
  }

  sessionStorage.setItem(RECOVERY_KEY, String(Date.now()));

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete('compat');
  nextUrl.searchParams.set('shellRefresh', String(Date.now()));
  window.location.replace(nextUrl.toString());
};

const lastRecoveryAt = Number(sessionStorage.getItem(RECOVERY_KEY) ?? '0');
const canRecover = !Number.isFinite(lastRecoveryAt) || Date.now() - lastRecoveryAt > RECOVERY_COOLDOWN_MS;

try {
  await import('/src/main.ts');
} catch (error) {
  if (canRecover) {
    await recoverStaleShell(error instanceof Error ? error.message : 'import failed');
  } else {
    console.error('[compat] Failed to recover stale shell.', error);

    const appRoot = document.getElementById('app');
    if (appRoot) {
      appRoot.innerHTML =
        '<div style="padding:24px;color:#111827;font:500 14px/1.6 system-ui,sans-serif;">앱을 새로고침하면 최신 화면으로 바뀝니다.</div>';
    }
  }
}
