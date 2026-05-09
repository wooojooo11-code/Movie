<script setup lang="ts">
import { computed } from 'vue';

import type { TrendingMovie } from '@/types/home';

const props = defineProps<{
  movie: TrendingMovie;
}>();

const formatRating = (rating: number) => rating.toFixed(1);

const posterStyle = computed(() => ({
  backgroundImage: `linear-gradient(160deg, rgba(43,49,64,0.88), rgba(25,29,40,0.94) 65%), url(${props.movie.posterUrl})`
}));
</script>

<template>
  <article
    class="w-[156px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-app-line bg-app-panel sm:w-[174px]"
  >
    <div
      class="relative flex aspect-[4/5] items-end overflow-hidden bg-app-poster bg-cover bg-center p-[18px]"
      :style="posterStyle"
      role="img"
      :aria-label="movie.posterAlt"
    >
      <span
        class="absolute left-3.5 top-3.5 rounded-full border border-white/10 bg-app-surface/70 px-2.5 py-1.5 text-xs font-bold text-white"
      >
        #{{ movie.rank }}
      </span>
      <h3 class="max-w-[85%] text-[22px] font-extrabold leading-tight text-white">
        {{ movie.title }}
      </h3>
    </div>

    <div class="px-4 pb-[18px] pt-4">
      <p class="truncate text-sm font-medium text-app-muted">
        {{ movie.genre }} · 평점 {{ formatRating(movie.averageRating) }}
      </p>
    </div>
  </article>
</template>
