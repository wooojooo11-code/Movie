<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-vue-next';

import IconButton from '@/components/common/IconButton.vue';
import MovieRankCard from '@/components/home/MovieRankCard.vue';
import TrendingMovieSheet from '@/components/home/TrendingMovieSheet.vue';
import type { TrendingMovie } from '@/types/home';

defineProps<{
  movies: TrendingMovie[];
  isLoading?: boolean;
  status?: string;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const scroller = ref<HTMLElement | null>(null);
const selectedMovie = ref<TrendingMovie | null>(null);
const shouldOpenTrailer = ref(false);
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

  isDragging.value = false;
  activePointerId.value = event.pointerId;
  startX.value = event.clientX;
  startScrollLeft.value = target.scrollLeft;
};

const onPointerMove = (event: PointerEvent) => {
  if (!scroller.value || activePointerId.value !== event.pointerId) {
    return;
  }

  const dragDistance = event.clientX - startX.value;

  if (!isDragging.value && Math.abs(dragDistance) < 6) {
    return;
  }

  if (!isDragging.value) {
    isDragging.value = true;
    scroller.value.setPointerCapture(event.pointerId);
  }

  scroller.value.scrollLeft = startScrollLeft.value - dragDistance;
};

const stopDragging = (event: PointerEvent) => {
  if (activePointerId.value !== event.pointerId) {
    return;
  }

  const target = scroller.value;

  if (isDragging.value && target?.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  isDragging.value = false;
  activePointerId.value = null;
};

const openMovie = (movie: TrendingMovie) => {
  shouldOpenTrailer.value = false;
  selectedMovie.value = movie;
};

const openMovieTrailer = (movie: TrendingMovie) => {
  shouldOpenTrailer.value = true;
  selectedMovie.value = movie;
};

const closeMovie = () => {
  selectedMovie.value = null;
  shouldOpenTrailer.value = false;
};
</script>

<template>
  <section id="trending-movies" aria-labelledby="trending-movies-title">
    <div class="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 id="trending-movies-title" class="text-lg font-semibold text-[#15171c]">인기 영화</h2>
        <p v-if="status" class="mt-1 text-[11px] text-app-muted" aria-live="polite">{{ status }}</p>
      </div>

      <div class="flex shrink-0 gap-2">
        <IconButton :icon="RefreshCw" label="KOBIS 인기 영화 새로고침" size="sm" :disabled="isLoading" @click="emit('refresh')" />
        <IconButton :icon="ChevronLeft" label="이전 영화 보기" size="sm" @click="scrollByCard(-1)" />
        <IconButton :icon="ChevronRight" label="다음 영화 보기" size="sm" @click="scrollByCard(1)" />
      </div>
    </div>

    <div
      ref="scroller"
      class="scrollbar-hide flex max-w-full touch-pan-x snap-x snap-mandatory gap-3 overflow-x-auto pb-2 select-none"
      :class="dragCursorClass"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="stopDragging"
      @pointercancel="stopDragging"
      @pointerleave="stopDragging"
    >
      <MovieRankCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        @open="openMovie"
        @trailer="openMovieTrailer"
      />
    </div>

    <TrendingMovieSheet
      v-if="selectedMovie"
      :movie="selectedMovie"
      :initial-trailer-open="shouldOpenTrailer"
      @close="closeMovie"
    />
  </section>
</template>
