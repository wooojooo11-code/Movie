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
    // The store already holds a user-facing error message.
  }
};
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-app-line bg-app-surface/80 backdrop-blur-xl">
    <div class="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-4 sm:max-w-xl">
      <div class="flex items-center justify-between gap-5">
        <RouterLink to="/" class="focus-ring flex min-w-0 items-center gap-3 rounded-xl">
          <span
            class="app-gradient grid size-[38px] shrink-0 place-items-center rounded-xl text-base font-black text-white"
            aria-hidden="true"
          >
            M
          </span>
          <span class="truncate text-xl font-extrabold">MovieList</span>
        </RouterLink>

        <div class="flex items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <span
              class="max-w-[9rem] truncate rounded-[14px] border border-app-line bg-white/[0.04] px-3 py-[11px] text-sm font-bold text-white"
            >
              {{ authStore.displayName }}
            </span>
            <button
              type="button"
              class="focus-ring rounded-[14px] border border-app-line bg-white/5 px-4 py-[11px] text-sm font-bold text-white"
              @click="signOut"
            >
              로그아웃
            </button>
          </template>

          <template v-else>
            <RouterLink
              to="/login"
              class="focus-ring rounded-[14px] border border-app-line bg-white/5 px-4 py-[11px] text-sm font-bold text-white"
            >
              로그인
            </RouterLink>
            <RouterLink
              :to="{ name: 'login', query: { mode: 'signup' } }"
              class="app-gradient focus-ring rounded-[14px] px-4 py-[11px] text-sm font-bold text-white"
            >
              회원가입
            </RouterLink>
          </template>
        </div>
      </div>

      <p
        v-if="authStore.errorMessage"
        class="rounded-[14px] border border-app-line bg-white/[0.03] px-3 py-2 text-xs text-app-muted"
      >
        {{ authStore.errorMessage }}
      </p>

      <nav aria-label="주요 메뉴" class="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <RouterLink
          to="/"
          class="focus-ring rounded-full px-3.5 py-2 text-sm font-bold text-[#c7cfdd] hover:bg-white/10 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          홈
        </RouterLink>
        <RouterLink
          to="/rating"
          class="focus-ring rounded-full px-3.5 py-2 text-sm font-bold text-[#c7cfdd] hover:bg-white/10 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          취향분석
        </RouterLink>
        <RouterLink
          to="/recommendations"
          class="focus-ring rounded-full px-3.5 py-2 text-sm font-bold text-[#c7cfdd] hover:bg-white/10 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          추천
        </RouterLink>
        <RouterLink
          to="/history"
          class="focus-ring rounded-full px-3.5 py-2 text-sm font-bold text-[#c7cfdd] hover:bg-white/10 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          평가기록
        </RouterLink>
        <RouterLink
          to="/lists"
          class="focus-ring rounded-full px-3.5 py-2 text-sm font-bold text-[#c7cfdd] hover:bg-white/10 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          리스트
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
