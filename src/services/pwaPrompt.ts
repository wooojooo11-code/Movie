import { computed, readonly, ref } from 'vue';

type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
const isSupported = ref(false);

let isInitialized = false;

const detectStandaloneMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const navigatorStandalone = Boolean(
    (navigator as Navigator & { standalone?: boolean }).standalone
  );

  return displayModeStandalone || navigatorStandalone;
};

const updateInstalledState = () => {
  isInstalled.value = detectStandaloneMode();

  if (isInstalled.value) {
    deferredPrompt.value = null;
  }
};

const initialize = () => {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  isInitialized = true;
  isSupported.value = 'serviceWorker' in navigator;
  updateInstalledState();

  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    deferredPrompt.value = event as BeforeInstallPromptEvent;
    updateInstalledState();
  };

  const onAppInstalled = () => {
    deferredPrompt.value = null;
    isInstalled.value = true;
  };

  const onDisplayModeChange = () => {
    updateInstalledState();
  };

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  window.addEventListener('appinstalled', onAppInstalled);

  const displayModeQuery = window.matchMedia('(display-mode: standalone)');
  if (typeof displayModeQuery.addEventListener === 'function') {
    displayModeQuery.addEventListener('change', onDisplayModeChange);
  } else if (typeof displayModeQuery.addListener === 'function') {
    displayModeQuery.addListener(onDisplayModeChange);
  }
};

const promptInstall = async () => {
  if (!deferredPrompt.value) {
    return false;
  }

  const promptEvent = deferredPrompt.value;
  await promptEvent.prompt();

  const choice = await promptEvent.userChoice.catch(() => null);

  if (choice?.outcome === 'accepted') {
    deferredPrompt.value = null;
    isInstalled.value = true;
    return true;
  }

  return false;
};

const isInstallable = computed(
  () => isSupported.value && !isInstalled.value && Boolean(deferredPrompt.value)
);

export const usePwaPrompt = () => ({
  deferredPrompt: readonly(deferredPrompt),
  initialize,
  isInstallable,
  isInstalled: readonly(isInstalled),
  isSupported: readonly(isSupported),
  promptInstall
});
