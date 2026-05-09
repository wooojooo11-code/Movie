<script setup lang="ts">
import { computed, ref } from 'vue';

import MovieRankCard from '@/components/home/MovieRankCard.vue';
import type { TrendingMovie } from '@/types/home';

defineProps<{
  movies: TrendingMovie[];
}>();

const scroller = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const startScrollLeft = ref(0);

const dragCursorClass = computed(() => (isDragging.value ? 'cursor-grabbing' : 'cursor-grab'));

const scrollByCard = (direction: -1 | 1) => {
  const target = scroller.value;

  if (!target) {
    return;
  }

  const cardWidth = target.querySelector('article')?.clientWidth ?? 156;
  target.scrollBy({
    left: direction * (cardWidth + 16),
    behavior: 'smooth'
  });
};

const onPointerDown = (event: PointerEvent) => {
  const target = scroller.value;

  if (!target) {
    return;
  }

  isDragging.value = true;
  startX.value = event.clientX;
  startScrollLeft.value = target.scrollLeft;
  target.setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value || !scroller.value) {
    return;
  }

  scroller.value.scrollLeft = startScrollLeft.value - (event.clientX - startX.value);
};

const stopDragging = (event: PointerEvent) => {
  if (!isDragging.value) {
    return;
  }

  isDragging.value = false;
  scroller.value?.releasePointerCapture(event.pointerId);
};
</script>

<template>
  <section id="trending-movies" aria-labelledby="trending-movies-title">
    <div class="mb-4 flex items-end justify-between gap-4">
      <h2 id="trending-movies-title" class="text-lg font-extrabold text-white">
        현재 인기 영화 순위
      </h2>

      <div class="flex shrink-0 gap-2">
        <button
          type="button"
          class="focus-ring grid size-9 place-items-center rounded-full border border-app-line bg-white/5 text-lg font-bold text-white"
          aria-label="이전 영화 보기"
          @click="scrollByCard(-1)"
        >
          ‹
        </button>
        <button
          type="button"
          class="focus-ring grid size-9 place-items-center rounded-full border border-app-line bg-white/5 text-lg font-bold text-white"
          aria-label="다음 영화 보기"
          @click="scrollByCard(1)"
        >
          ›
        </button>
      </div>
    </div>

    <div
      ref="scroller"
      class="scrollbar-hide -mx-4 flex touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-1 select-none"
      :class="dragCursorClass"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="stopDragging"
      @pointercancel="stopDragging"
      @pointerleave="stopDragging"
    >
      <MovieRankCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </div>
  </section>
</template>
