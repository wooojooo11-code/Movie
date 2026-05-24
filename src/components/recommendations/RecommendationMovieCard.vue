<script setup lang="ts">
import type { RecommendedCatalogMovie } from '@/types/recommendation';

withDefaults(
  defineProps<{
    movie: RecommendedCatalogMovie;
    size?: 'grid' | 'compact';
  }>(),
  {
    size: 'grid'
  }
);

defineEmits<{
  open: [movie: RecommendedCatalogMovie];
}>();
</script>

<template>
  <button
    type="button"
    class="focus-ring poster-hover-card group block w-full overflow-hidden rounded-xl border border-app-line bg-app-panel text-left"
    :aria-label="`${movie.title} 정보 보기`"
    @click="$emit('open', movie)"
  >
    <img
      :src="movie.posterUrl"
      :alt="movie.posterAlt"
      class="poster-hover-image aspect-[4/5] w-full object-cover transition duration-200 group-active:scale-[0.985]"
      loading="lazy"
    />
  </button>
</template>
