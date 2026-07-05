<script setup lang="ts">
import { computed } from 'vue';

import { usePwaPrompt } from '@/services/pwaPrompt';
import { useRecommendationStore } from '@/services/recommendationStore';

const pwaPrompt = usePwaPrompt();
const recommendationStore = useRecommendationStore();

const shouldContinueTasteAnalysis = computed(
  () =>
    recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value !== null ||
    (recommendationStore.state.profile.totalRatings > 0 &&
      recommendationStore.hasAdditionalTasteAnalysisMovies.value)
);
const primaryButtonTo = computed(() =>
  shouldContinueTasteAnalysis.value ? '/rating?mode=more' : '/rating'
);
const primaryButtonLabel = computed(() =>
  recommendationStore.state.profile.totalRatings > 0 ? '취향분석 이어하기' : '취향분석 시작하기'
);

const installApp = async () => {
  await pwaPrompt.promptInstall();
};
</script>

<template>
  <section aria-labelledby="home-cta-title" class="pt-1">
    <div class="corner-hard border border-app-line bg-app-panel px-5 py-5">
      <h1 id="home-cta-title" class="text-[26px] font-semibold leading-tight text-white">
        취향분석을 이어가 보세요
      </h1>

      <div class="mt-5 flex flex-wrap gap-2">
        <RouterLink
          :to="primaryButtonTo"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-medium text-white"
        >
          {{ primaryButtonLabel }}
        </RouterLink>

        <button
          v-if="pwaPrompt.isInstallable"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm text-white"
          @click="installApp"
        >
          앱으로 설치
        </button>
      </div>
    </div>
  </section>
</template>
