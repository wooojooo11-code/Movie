<script setup lang="ts">
import { computed } from 'vue';

import { usePwaPrompt } from '@/services/pwaPrompt';
import { useRecommendationStore } from '@/services/recommendationStore';

const recommendationStore = useRecommendationStore();
const pwaPrompt = usePwaPrompt();

const hasMoreTasteAnalysis = computed(() => recommendationStore.hasAdditionalTasteAnalysisMovies.value);

const primaryButtonTo = computed(() => {
  if (recommendationStore.shouldResumeTasteAnalysis.value) {
    return '/rating';
  }

  if (recommendationStore.state.profile.totalRatings > 0 && hasMoreTasteAnalysis.value) {
    return '/rating?mode=more';
  }

  return '/rating';
});

const primaryButtonLabel = computed(() => {
  if (recommendationStore.shouldResumeTasteAnalysis.value) {
    return '이어서 하기';
  }

  if (recommendationStore.state.profile.totalRatings > 0 && hasMoreTasteAnalysis.value) {
    return '더 하기';
  }

  return '시작하기';
});

const installApp = async () => {
  await pwaPrompt.promptInstall();
};
</script>

<template>
  <section aria-labelledby="home-cta-title" class="pt-1">
    <div class="border border-app-line bg-app-panel px-5 py-5">
      <h1 id="home-cta-title" class="text-[26px] font-semibold leading-tight text-white">
        10개만 평가하면 추천 시작
      </h1>
      <div class="mt-5 flex flex-wrap gap-2">
        <RouterLink
          :to="primaryButtonTo"
          class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-medium text-white"
        >
          {{ primaryButtonLabel }}
        </RouterLink>

        <button
          v-if="pwaPrompt.isInstallable"
          type="button"
          class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm text-white"
          @click="installApp"
        >
          앱으로 설치
        </button>
      </div>
    </div>
  </section>
</template>
