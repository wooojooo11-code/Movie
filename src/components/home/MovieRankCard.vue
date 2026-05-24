<script setup lang="ts">
import type { TrendingMovie } from '@/types/home';

defineProps<{
  movie: TrendingMovie;
}>();

defineEmits<{
  open: [movie: TrendingMovie];
}>();
</script>

<template>
  <button
    type="button"
    class="focus-ring poster-hover-card w-[148px] shrink-0 snap-start overflow-hidden border border-app-line bg-app-panel text-left sm:w-[164px]"
    @click="$emit('open', movie)"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-app-poster">
      <img
        :src="movie.posterUrl"
        :alt="movie.posterAlt"
        class="poster-hover-image h-full w-full object-cover"
        loading="lazy"
      />

      <span class="absolute left-2 top-2 border border-app-line bg-app-surface px-2 py-1 text-[11px] font-medium text-white">
        {{ movie.rank }}
      </span>
    </div>

    <div class="px-3 py-3">
      <h3 class="line-clamp-1 text-sm font-medium text-white">
        {{ movie.title }}
      </h3>
      <p class="mt-1 text-xs text-app-muted">
        {{ movie.audienceLabel }}
      </p>
    </div>
  </button>
</template>
