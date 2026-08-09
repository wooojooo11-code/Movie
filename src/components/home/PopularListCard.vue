<script setup lang="ts">
import type { PopularList } from '@/types/home';

defineProps<{
  list: PopularList;
}>();

defineEmits<{
  open: [list: PopularList];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatRating = (rating: number) => rating.toFixed(1);
</script>

<template>
  <button
    type="button"
    class="focus-ring corner-hard w-full border border-app-line bg-app-panel px-4 py-4 text-left"
    @click="$emit('open', list)"
  >
    <div class="mb-3 flex flex-nowrap gap-2 overflow-x-auto pb-1">
      <div
        v-for="movie in list.moviePreviews"
        :key="movie.id"
        class="w-12 shrink-0 sm:w-14"
      >
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="corner-soft aspect-[2/3] w-full bg-app-poster object-contain"
          loading="lazy"
        />
        <p class="mt-1 line-clamp-2 text-[10px] font-medium leading-3 text-[#15171c]">
          {{ movie.title }}
        </p>
      </div>
    </div>

    <h3 class="line-clamp-2 text-base font-medium leading-snug text-[#15171c]">
      {{ list.title }}
    </h3>
    <p class="mt-1.5 text-sm text-app-muted">
      평균 {{ formatRating(list.averageRating) }} · 저장 {{ formatCount(list.saveCount) }}
    </p>
  </button>
</template>
