<script setup lang="ts">
import { computed } from 'vue';

import { usePwaPrompt } from '@/services/pwaPrompt';
import { useRecommendationStore } from '@/services/recommendationStore';

const pwaPrompt = usePwaPrompt();
const recommendationStore = useRecommendationStore();

const primaryButtonTo = computed(() => recommendationStore.resumeTasteAnalysisPath.value);
const primaryButtonLabel = computed(() =>
  recommendationStore.state.profile.totalRatings > 0 ? '취향분석 이어하기' : '취향분석 시작하기'
);

const installApp = async () => {
  await pwaPrompt.promptInstall();
};
</script>

<template>
  <section aria-labelledby="home-cta-title" class="rounded-3xl bg-app-panelSoft px-5 py-6 sm:px-7 sm:py-8">
    <p class="text-xs font-semibold tracking-[0.14em] text-app-accent">MOVIE DISCOVERY</p>
    <h1 id="home-cta-title" class="mt-2 text-[26px] font-bold leading-tight text-[#173a5e]">
      취향분석을 이어가 보세요
    </h1>
    <p class="mt-2 text-sm leading-6 text-app-muted">포스터를 넘기며 남긴 평가로, 오늘 볼 영화를 더 정확하게 찾아드려요.</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <RouterLink
        :to="primaryButtonTo"
        class="focus-ring button-primary inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
      >
        {{ primaryButtonLabel }}
      </RouterLink>

      <button
        v-if="!pwaPrompt.isInstalled && pwaPrompt.isInstallable"
        type="button"
        class="focus-ring button-secondary inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium"
        @click="installApp"
      >
        앱으로 설치
      </button>
    </div>
  </section>
</template>
