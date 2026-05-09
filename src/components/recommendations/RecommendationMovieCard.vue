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
    class="focus-ring group block w-full overflow-hidden border border-app-line bg-app-panel text-left"
    :class="size === 'compact' ? 'rounded-[14px]' : 'rounded-[18px]'"
    :aria-label="`${movie.title} 정보 보기`"
    @click="$emit('open', movie)"
  >
    <img
      :src="movie.posterUrl"
      :alt="movie.posterAlt"
      class="aspect-[4/5] w-full object-cover transition duration-200 group-active:scale-[0.98]"
      loading="lazy"
    />
  </button>
</template>
