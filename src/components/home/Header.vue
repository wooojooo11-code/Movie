<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect, type WatchHandle } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const tasteAnalysisTo = ref('/rating');
let stopTasteAnalysisPathSync: null | WatchHandle = null;

onMounted(() => {
  void (async () => {
    const { useRecommendationStore } = await import('@/services/recommendationStore');
    const recommendationStore = useRecommendationStore();

    stopTasteAnalysisPathSync = watchEffect(() => {
      tasteAnalysisTo.value = recommendationStore.resumeTasteAnalysisPath.value;
    });
  })();
});

onUnmounted(() => {
  stopTasteAnalysisPathSync?.();
});

const signOut = async () => {
  try {
    await authStore.signOut();
    await router.replace('/');
  } catch {
    // store message is shown below when needed
  }
};
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-app-line bg-app-surface">
    <div class="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-3 sm:max-w-xl">
      <div class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="focus-ring corner-soft flex min-w-0 items-center gap-3">
          <span
            class="corner-soft grid size-8 shrink-0 place-items-center border border-app-line bg-app-panelSoft text-sm font-bold text-white"
          >
            M
          </span>
          <span class="truncate text-base font-semibold text-white">Moodie</span>
        </RouterLink>

        <div class="flex items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <RouterLink
              :to="{ name: 'profile', params: { userId: authStore.user?.id } }"
              class="corner-soft max-w-[8.5rem] truncate border border-app-line bg-app-panel px-3 py-2 text-sm text-white"
            >
              {{ authStore.displayName }}
            </RouterLink>
            <button
              type="button"
              class="focus-ring corner-soft border border-[#e5a2a2] bg-[#fff0f0] px-3 py-2 text-sm font-medium text-[#a13c3c] transition-colors hover:bg-[#ffe4e4]"
              @click="signOut"
            >
              로그아웃
            </button>
          </template>

          <template v-else>
            <RouterLink
              to="/login"
              class="focus-ring corner-soft border border-[#8bb6d9] bg-[#e7f3fc] px-3 py-2 text-sm font-medium text-[#174a77] transition-colors hover:bg-[#dcecff]"
            >
              로그인
            </RouterLink>
            <RouterLink
              :to="{ name: 'login', query: { mode: 'signup' } }"
              class="focus-ring corner-soft border border-app-accent bg-app-accent px-3 py-2 text-sm font-medium text-white"
            >
              회원가입
            </RouterLink>
          </template>
        </div>
      </div>

      <p
        v-if="authStore.errorMessage"
        class="corner-hard border border-app-line bg-app-panel px-3 py-2 text-xs text-app-muted"
      >
        {{ authStore.errorMessage }}
      </p>

      <nav aria-label="주요 메뉴" class="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
        <RouterLink
          to="/"
          class="focus-ring corner-pill border border-transparent px-3 py-1.5 text-app-muted transition-colors"
          active-class="!border-[#356e9f] !bg-[#dcecff] !font-bold !text-[#174a77]"
        >
          홈
        </RouterLink>
        <RouterLink
          :to="tasteAnalysisTo"
          class="focus-ring corner-pill border border-transparent px-3 py-1.5 text-app-muted transition-colors"
          active-class="!border-[#356e9f] !bg-[#dcecff] !font-bold !text-[#174a77]"
        >
          취향분석
        </RouterLink>
        <RouterLink
          to="/recommendations"
          class="focus-ring corner-pill border border-transparent px-3 py-1.5 text-app-muted transition-colors"
          active-class="!border-[#356e9f] !bg-[#dcecff] !font-bold !text-[#174a77]"
        >
          추천
        </RouterLink>
        <RouterLink
          to="/lists"
          class="focus-ring corner-pill border border-transparent px-3 py-1.5 text-app-muted transition-colors"
          active-class="!border-[#356e9f] !bg-[#dcecff] !font-bold !text-[#174a77]"
        >
          리스트
        </RouterLink>
        <RouterLink
          to="/community"
          class="focus-ring corner-pill border border-transparent px-3 py-1.5 text-app-muted transition-colors"
          active-class="!border-[#356e9f] !bg-[#dcecff] !font-bold !text-[#174a77]"
        >
          커뮤니티
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
