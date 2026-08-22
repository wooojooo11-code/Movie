<script setup lang="ts">
import Header from '@/components/home/Header.vue';
import TitleUnlockedModal from '@/components/profile/TitleUnlockedModal.vue';
import { isRouteLoading } from '@/router';
import { useTitleUnlocks } from '@/services/titleUnlockStore';

const titleUnlocks = useTitleUnlocks();
</script>

<template>
  <div class="min-h-dvh bg-app-surface text-[#15171c]">
    <Header />
    <main
      v-if="isRouteLoading"
      class="mx-auto w-full max-w-md px-4 pb-28 pt-8 sm:max-w-[800px]"
      aria-live="polite"
      aria-busy="true"
    >
      <section
        class="flex min-h-[420px] w-full flex-col items-center justify-center rounded-[28px] border border-black/5 bg-white px-6 text-center shadow-sm"
      >
        <span class="route-loading-spinner" aria-hidden="true"></span>
        <p class="mt-5 text-base font-black text-app-ink">화면을 준비하고 있어요</p>
        <p class="mt-2 text-sm font-semibold text-app-muted">영화 정보를 불러오는 중입니다.</p>
      </section>
    </main>
    <RouterView v-else />
    <TitleUnlockedModal :title="titleUnlocks.activeTitle.value" @close="titleUnlocks.dismiss" />
  </div>
</template>

<style scoped>
.route-loading-spinner {
  width: 2.75rem;
  height: 2.75rem;
  border: 4px solid rgb(216 180 254 / 45%);
  border-top-color: #7c3aed;
  border-radius: 9999px;
  animation: route-loading-spin 0.8s linear infinite;
}

@keyframes route-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading-spinner {
    animation: none;
  }
}
</style>
