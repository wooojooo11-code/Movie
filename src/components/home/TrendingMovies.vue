<script setup lang="ts">
import { computed, ref } from 'vue';

import MovieRankCard from '@/components/home/MovieRankCard.vue';
import TrendingMovieSheet from '@/components/home/TrendingMovieSheet.vue';
import type { TrendingMovie } from '@/types/home';

defineProps<{
  movies: TrendingMovie[];
}>();

const scroller = ref<HTMLElement | null>(null);
const selectedMovie = ref<TrendingMovie | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const startScrollLeft = ref(0);
const activePointerId = ref<number | null>(null);

const dragCursorClass = computed(() => (isDragging.value ? 'cursor-grabbing' : 'cursor-grab'));

const scrollByCard = (direction: -1 | 1) => {
  const target = scroller.value;

  if (!target) {
    return;
  }

  const cardWidth = target.querySelector('button')?.clientWidth ?? 150;
  target.scrollBy({
    left: direction * (cardWidth + 14),
    behavior: 'smooth'
  });
};

const onPointerDown = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') {
    return;
  }

  const target = scroller.value;

  if (!target) {
    return;
  }

  isDragging.value = true;
  activePointerId.value = event.pointerId;
  startX.value = event.clientX;
  startScrollLeft.value = target.scrollLeft;
  target.setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value || !scroller.value || activePointerId.value !== event.pointerId) {
    return;
  }

  scroller.value.scrollLeft = startScrollLeft.value - (event.clientX - startX.value);
};

const stopDragging = (event: PointerEvent) => {
  if (!isDragging.value || activePointerId.value !== event.pointerId) {
    return;
  }

  isDragging.value = false;
  activePointerId.value = null;
  scroller.value?.releasePointerCapture(event.pointerId);
};

const openMovie = (movie: TrendingMovie) => {
  selectedMovie.value = movie;
};

const closeMovie = () => {
  selectedMovie.value = null;
};
</script>

<template>
  <section id="trending-movies" aria-labelledby="trending-movies-title">
    <div class="mb-3 flex items-end justify-between gap-4">
      <h2 id="trending-movies-title" class="text-lg font-semibold text-[#15171c]">인기 영화</h2>

      <div class="flex shrink-0 gap-2">
        <button
          type="button"
          class="focus-ring grid size-8 place-items-center border border-app-line bg-app-panel text-sm text-[#15171c]"
          aria-label="이전 영화 보기"
          @click="scrollByCard(-1)"
        >
          &lt;
        </button>
        <button
          type="button"
          class="focus-ring grid size-8 place-items-center border border-app-line bg-app-panel text-sm text-[#15171c]"
          aria-label="다음 영화 보기"
          @click="scrollByCard(1)"
        >
          &gt;
        </button>
      </div>
    </div>

    <div
      ref="scroller"
      class="scrollbar-hide -mx-4 flex touch-pan-x snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1 select-none"
      :class="dragCursorClass"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="stopDragging"
      @pointercancel="stopDragging"
      @pointerleave="stopDragging"
    >
      <MovieRankCard v-for="movie in movies" :key="movie.id" :movie="movie" @open="openMovie" />
    </div>

    <TrendingMovieSheet v-if="selectedMovie" :movie="selectedMovie" @close="closeMovie" />
  </section>
</template>
