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
    class="focus-ring w-[156px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-app-line bg-app-panel text-left sm:w-[174px]"
    @click="$emit('open', movie)"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-app-poster">
      <img
        :src="movie.posterUrl"
        :alt="movie.posterAlt"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0b0d12]/90 via-[#0b0d12]/25 to-transparent" />

      <span
        class="absolute left-3.5 top-3.5 rounded-full border border-white/10 bg-app-surface/70 px-2.5 py-1.5 text-xs font-bold text-white"
      >
        #{{ movie.rank }}
      </span>

      <div class="absolute inset-x-0 bottom-0 px-[18px] pb-[18px]">
        <h3 class="max-w-[85%] text-[22px] font-extrabold leading-tight text-white">
          {{ movie.title }}
        </h3>
      </div>
    </div>

    <div class="px-4 pb-[18px] pt-4">
      <p class="truncate text-sm font-medium text-app-muted">
        {{ movie.audienceLabel }}
      </p>
      <p class="mt-1 truncate text-xs font-medium text-white/45">
        {{ movie.sourceLabel }}
      </p>
    </div>
  </button>
</template>
