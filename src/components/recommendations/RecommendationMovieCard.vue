<script setup lang="ts">
import { computed } from 'vue';

import MoviePosterCard from '@/components/common/MoviePosterCard.vue';
import type { RecommendedCatalogMovie } from '@/types/recommendation';

defineEmits<{
  open: [movie: RecommendedCatalogMovie];
  rate: [movie: RecommendedCatalogMovie];
  save: [movie: RecommendedCatalogMovie];
  trailer: [movie: RecommendedCatalogMovie];
}>();

const props = withDefaults(
  defineProps<{
    movie: RecommendedCatalogMovie;
    rating?: boolean;
    saved?: boolean;
    saving?: boolean;
    size?: 'grid' | 'compact';
  }>(),
  { rating: false, saved: false, saving: false, size: 'grid' }
);

const factors = computed(() => {
  const breakdown = props.movie.recommendationScoreBreakdown;
  const maximums = props.movie.recommendationScoreMaximums;

  if (!breakdown || !maximums) return [];

  return [
    { label: '취향', value: breakdown.personalPreference, maximum: maximums.personalPreference },
    { label: '비슷한 이용자', value: breakdown.similarUser, maximum: maximums.similarUser },
    { label: '상황', value: breakdown.situation, maximum: maximums.situation },
    { label: 'TMDB 품질', value: breakdown.tmdbQuality, maximum: maximums.tmdbQuality },
    { label: '새로움', value: breakdown.novelty, maximum: maximums.novelty },
    { label: '배우·감독', value: breakdown.people, maximum: maximums.people }
  ].filter((factor) => factor.maximum > 0);
});
</script>

<template>
  <div class="min-w-0">
    <MoviePosterCard
      :movie="movie"
      :rating="rating"
      :saved="saved"
      :saving="saving"
      :score="movie.recommendationScore"
      :size="size === 'compact' ? 'compact' : 'shelf'"
      @open="$emit('open', movie)"
      @rate="$emit('rate', movie)"
      @save="$emit('save', movie)"
      @trailer="$emit('trailer', movie)"
    />

    <button v-if="size === 'grid' && factors.length" type="button" class="focus-ring mt-2 grid w-full gap-1.5 px-0.5 text-left" :aria-label="`${movie.title} 추천 점수 상세 보기`" @click="$emit('open', movie)">
      <div v-for="factor in factors" :key="factor.label" class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 text-[10px]">
        <span class="truncate text-app-muted">{{ factor.label }}</span>
        <span class="h-1 overflow-hidden rounded-full bg-app-panelSoft"><span class="block h-full rounded-full bg-app-accent" :style="{ width: `${Math.round((factor.value / factor.maximum) * 100)}%` }" /></span>
      </div>
    </button>
  </div>
</template>
