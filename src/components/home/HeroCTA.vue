<script setup lang="ts">
import { computed } from 'vue';

import { hasAdditionalTasteAnalysisMovies } from '@/data/rating';
import { useRecommendationStore } from '@/services/recommendationStore';

const recommendationStore = useRecommendationStore();

const hasMoreTasteAnalysis = computed(() =>
  hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);

const nextAdditionalBatchLink = computed(() => {
  const batchIndex = recommendationStore.nextAdditionalBatchIndex.value;
  return batchIndex == null ? null : `/rating?mode=more&batch=${batchIndex}`;
});

const primaryButtonTo = computed(() => {
  if (recommendationStore.shouldResumeTasteAnalysis.value) {
    return '/rating';
  }

  if (
    recommendationStore.state.profile.totalRatings > 0 &&
    hasMoreTasteAnalysis.value &&
    nextAdditionalBatchLink.value
  ) {
    return nextAdditionalBatchLink.value;
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
</script>

<template>
  <section aria-labelledby="home-cta-title" class="pt-1">
    <div class="border border-app-line bg-app-panel px-5 py-5">
      <h1 id="home-cta-title" class="text-[26px] font-semibold leading-tight text-white">
        10개만 평가하면 추천 시작
      </h1>
      <p class="mt-2 text-sm text-app-muted">몇 개만 평가하면 취향이 보이기 시작해요.</p>

      <div class="mt-5">
        <RouterLink
          :to="primaryButtonTo"
          class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-medium text-white"
        >
          {{ primaryButtonLabel }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
