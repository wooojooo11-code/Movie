<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue';

import { supabase, supabaseAuthStorageKey } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const state = reactive({
  hasLiveSession: false,
  hasLocalStorageSession: false,
  hasSessionStorageSession: false,
  hostname: '',
  isLocalRuntime: false,
  lastCheckedAt: ''
});

let refreshIntervalId: null | ReturnType<typeof setInterval> = null;

const refreshStorageState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  state.hostname = window.location.hostname;
  state.isLocalRuntime = ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname);

  if (!supabaseAuthStorageKey) {
    state.hasLocalStorageSession = false;
    state.hasSessionStorageSession = false;
    state.lastCheckedAt = new Date().toLocaleTimeString('ko-KR');
    return;
  }

  state.hasLocalStorageSession = Boolean(window.localStorage.getItem(supabaseAuthStorageKey));
  state.hasSessionStorageSession = Boolean(window.sessionStorage.getItem(supabaseAuthStorageKey));
  state.lastCheckedAt = new Date().toLocaleTimeString('ko-KR');
};

const refreshLiveSessionState = async () => {
  if (!supabase) {
    state.hasLiveSession = false;
    return;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.hasLiveSession = Boolean(session);
};

const refreshAll = async () => {
  await authStore.syncSession();
  await refreshLiveSessionState();
  refreshStorageState();
};

const diagnosis = computed(() => {
  const hasStoredSession = state.hasLocalStorageSession || state.hasSessionStorageSession;

  if (authStore.isAuthenticated && hasStoredSession && state.hasLiveSession) {
    return '정상: UI, 저장소, 실제 Supabase 세션이 모두 로그인 상태예요.';
  }

  if (authStore.isAuthenticated && hasStoredSession && !state.hasLiveSession) {
    return '저장소에는 세션이 있지만 실제 Supabase 세션은 없어요. stale 세션 또는 복구 실패 쪽입니다.';
  }

  if (!authStore.isAuthenticated && !hasStoredSession && !state.hasLiveSession) {
    return '정상: UI, 저장소, 실제 Supabase 세션이 모두 로그아웃 상태예요.';
  }

  if (!authStore.isAuthenticated && hasStoredSession) {
    return '세션은 저장돼 있는데 UI는 로그아웃이에요. 복귀 후 세션 복구/동기화 문제 쪽입니다.';
  }

  if (authStore.isAuthenticated && !hasStoredSession && state.hasLiveSession) {
    return '실제 Supabase 세션은 있는데 저장소에는 안 보여요. 메모리 상태 또는 저장소 반영 문제를 의심할 수 있어요.';
  }

  return 'UI는 로그인인데 저장소 세션이 없어요. 화면 상태가 남아 있거나 세션이 이미 정리된 경우예요.';
});

const uiStateLabel = computed(() => (authStore.isAuthenticated ? '로그인' : '로그아웃'));
const storageStateLabel = computed(() => {
  if (state.hasLocalStorageSession || state.hasSessionStorageSession) {
    return '있음';
  }

  return '없음';
});
const liveSessionLabel = computed(() => (state.hasLiveSession ? '있음' : '없음'));

onMounted(() => {
  refreshStorageState();
  void refreshLiveSessionState();

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', refreshStorageState);
    window.addEventListener('storage', refreshStorageState);
    document.addEventListener('visibilitychange', refreshStorageState);
  }

  refreshIntervalId = setInterval(() => {
    refreshStorageState();
    void refreshLiveSessionState();
  }, 5000);
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', refreshStorageState);
    window.removeEventListener('storage', refreshStorageState);
    document.removeEventListener('visibilitychange', refreshStorageState);
  }

  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
});
</script>

<template>
  <section
    v-if="state.isLocalRuntime"
    class="corner-hard mx-auto mt-3 w-full max-w-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-50 sm:max-w-xl"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="font-bold">세션 진단</p>
        <p class="mt-1 text-xs leading-5 text-amber-100/90">
          UI 상태: {{ uiStateLabel }} · 저장소 세션: {{ storageStateLabel }} · 실제 세션: {{ liveSessionLabel }} · 마지막 확인:
          {{ state.lastCheckedAt }}
        </p>
        <p class="mt-2 text-xs leading-5 text-amber-50/90">
          {{ diagnosis }}
        </p>
      </div>

      <button
        type="button"
        class="focus-ring corner-soft shrink-0 border border-amber-200/30 bg-black/10 px-3 py-2 text-xs font-bold text-amber-50"
        @click="refreshAll"
      >
        다시 확인
      </button>
    </div>
  </section>
</template>
