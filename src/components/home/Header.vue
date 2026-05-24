<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const signOut = async () => {
  try {
    await authStore.signOut();
    await router.replace('/');
  } catch {
    // The store already exposes a user-facing message.
  }
};
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-app-line bg-[#0c0e12]">
    <div class="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-3.5 sm:max-w-xl">
      <div class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="focus-ring flex min-w-0 items-center gap-3 rounded-lg">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-lg bg-app-panelSoft text-sm font-black text-white"
            aria-hidden="true"
          >
            M
          </span>
          <span class="truncate text-lg font-bold text-white">MovieList</span>
        </RouterLink>

        <div class="flex items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <span
              class="max-w-[8.75rem] truncate rounded-lg bg-app-panel px-3 py-2 text-sm font-medium text-white/88"
            >
              {{ authStore.displayName }}
            </span>
            <button
              type="button"
              class="focus-ring rounded-lg border border-app-line bg-app-panel px-3 py-2 text-sm font-medium text-white/88"
              @click="signOut"
            >
              로그아웃
            </button>
          </template>

          <template v-else>
            <RouterLink
              to="/login"
              class="focus-ring rounded-lg border border-app-line bg-app-panel px-3 py-2 text-sm font-medium text-white/88"
            >
              로그인
            </RouterLink>
            <RouterLink
              :to="{ name: 'login', query: { mode: 'signup' } }"
              class="focus-ring rounded-lg bg-app-accent px-3 py-2 text-sm font-semibold text-white"
            >
              회원가입
            </RouterLink>
          </template>
        </div>
      </div>

      <p
        v-if="authStore.errorMessage"
        class="rounded-lg border border-app-line bg-app-panel px-3 py-2 text-xs text-app-muted"
      >
        {{ authStore.errorMessage }}
      </p>

      <nav aria-label="주요 메뉴" class="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <RouterLink
          to="/"
          class="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-app-muted transition hover:bg-app-panelSoft hover:text-white"
          active-class="bg-app-panelSoft text-white"
        >
          홈
        </RouterLink>
        <RouterLink
          to="/rating"
          class="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-app-muted transition hover:bg-app-panelSoft hover:text-white"
          active-class="bg-app-panelSoft text-white"
        >
          취향분석
        </RouterLink>
        <RouterLink
          to="/recommendations"
          class="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-app-muted transition hover:bg-app-panelSoft hover:text-white"
          active-class="bg-app-panelSoft text-white"
        >
          추천
        </RouterLink>
        <RouterLink
          to="/history"
          class="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-app-muted transition hover:bg-app-panelSoft hover:text-white"
          active-class="bg-app-panelSoft text-white"
        >
          평가기록
        </RouterLink>
        <RouterLink
          to="/lists"
          class="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-app-muted transition hover:bg-app-panelSoft hover:text-white"
          active-class="bg-app-panelSoft text-white"
        >
          리스트
        </RouterLink>
        <RouterLink
          to="/library"
          class="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-app-muted transition hover:bg-app-panelSoft hover:text-white"
          active-class="bg-app-panelSoft text-white"
        >
          보관함
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
