<script setup lang="ts">
import { computed } from 'vue';

import { hasAdditionalTasteAnalysisMovies } from '@/data/rating';
import { useRecommendationStore } from '@/services/recommendationStore';

const recommendationStore = useRecommendationStore();

const hasMoreTasteAnalysis = computed(() =>
  hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);

const shouldResumeTasteAnalysis = computed(() => recommendationStore.shouldResumeTasteAnalysis.value);

const nextAdditionalBatchLink = computed(() => {
  const batchIndex = recommendationStore.nextAdditionalBatchIndex.value;
  return batchIndex == null ? null : `/rating?mode=more&batch=${batchIndex}`;
});

const primaryButtonTo = computed(() => {
  if (shouldResumeTasteAnalysis.value) {
    return '/rating';
  }

  if (recommendationStore.state.profile.totalRatings > 0 && hasMoreTasteAnalysis.value && nextAdditionalBatchLink.value) {
    return nextAdditionalBatchLink.value;
  }

  return '/rating';
});

const primaryButtonLabel = computed(() => {
  if (shouldResumeTasteAnalysis.value) {
    return '이어서 하기';
  }

  if (recommendationStore.state.profile.totalRatings > 0 && hasMoreTasteAnalysis.value) {
    return '더 하기';
  }

  return '시작하기';
});
</script>

<template>
  <section aria-labelledby="home-cta-title" class="pt-2">
    <div class="rounded-2xl border border-app-line bg-app-panel px-5 py-5 shadow-panel">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">For you</p>
      <h1 id="home-cta-title" class="mt-2 text-[27px] font-bold leading-tight text-white">
        10개만 평가하면 추천 시작
      </h1>
      <p class="mt-2 text-sm text-app-muted">몇 개만 평가하면 취향이 보이기 시작해요.</p>

      <div class="mt-5 flex flex-wrap gap-2.5">
        <RouterLink
          :to="primaryButtonTo"
          class="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg bg-app-accent px-4 text-sm font-semibold text-white"
        >
          {{ primaryButtonLabel }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
