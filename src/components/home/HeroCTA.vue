<script setup lang="ts">
import { computed } from 'vue';

import { hasAdditionalTasteAnalysisMovies } from '@/data/rating';
import { useRecommendationStore } from '@/services/recommendationStore';

const recommendationStore = useRecommendationStore();

const hasMoreTasteAnalysis = computed(() =>
  hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);

const shouldResumeTasteAnalysis = computed(() => recommendationStore.shouldResumeTasteAnalysis.value);

const primaryButtonLabel = computed(() => {
  if (shouldResumeTasteAnalysis.value) {
    return '취향분석 이어서 하기';
  }

  if (recommendationStore.state.profile.totalRatings > 0) {
    return '취향분석 보러 가기';
  }

  return '취향분석 하러 가기';
});
</script>

<template>
  <section aria-labelledby="home-cta-title" class="pt-7">
    <div
      class="rounded-[24px] border border-app-line bg-[radial-gradient(circle_at_top_right,rgba(125,123,255,0.35),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(255,93,143,0.24),transparent_28%),linear-gradient(180deg,#161a24,#10131b)] p-[22px]"
    >
      <h1 id="home-cta-title" class="text-[28px] font-extrabold leading-tight text-white">
        추천을 위한 취향분석 시작
      </h1>

      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink
          to="/rating"
          class="app-gradient focus-ring inline-flex min-h-11 items-center justify-center rounded-[14px] px-4 py-[11px] text-sm font-bold text-white"
        >
          {{ primaryButtonLabel }}
        </RouterLink>

        <RouterLink
          v-if="recommendationStore.state.profile.totalRatings > 0 && hasMoreTasteAnalysis"
          to="/rating?mode=more"
          class="focus-ring inline-flex min-h-11 items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 py-[11px] text-sm font-bold text-white"
        >
          취향 더 분석하기
        </RouterLink>
      </div>
    </div>
  </section>
</template>
