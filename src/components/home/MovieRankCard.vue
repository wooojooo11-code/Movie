<script setup lang="ts">
import { Info } from 'lucide-vue-next';

import type { TrendingMovie } from '@/types/home';

const props = defineProps<{
  movie: TrendingMovie;
}>();

const emit = defineEmits<{
  open: [movie: TrendingMovie];
}>();

let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

const openMovie = () => {
  emit('open', props.movie);
};

const onTouchStart = (event: TouchEvent) => {
  const [touch] = event.changedTouches;

  if (!touch) {
    return;
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchMoved = false;
};

const onTouchMove = (event: TouchEvent) => {
  const [touch] = event.changedTouches;

  if (!touch) {
    return;
  }

  if (Math.abs(touch.clientX - touchStartX) >= 10 || Math.abs(touch.clientY - touchStartY) >= 10) {
    touchMoved = true;
  }
};

const onTouchEnd = () => {
  if (!touchMoved) {
    openMovie();
  }
};
</script>

<template>
  <article class="w-32 shrink-0 snap-start sm:w-40">
    <button
      type="button"
      class="focus-ring poster-card block w-full overflow-hidden text-left"
      style="touch-action: manipulation"
      :aria-label="`${movie.title} 제목과 관객 수 보기`"
      @click.stop="openMovie"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.capture.prevent.stop="onTouchEnd"
    >
      <div class="aspect-[2/3] overflow-hidden bg-app-poster">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="poster-hover-image h-full w-full object-cover"
          draggable="false"
          loading="lazy"
        />
      </div>
    </button>

    <button
      type="button"
      class="button-secondary focus-ring corner-soft mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 px-3 text-xs font-semibold"
      :aria-label="`${movie.title} 상세 정보 보기`"
      @pointerdown.stop
      @click.stop="openMovie"
    >
      <Info :size="15" :stroke-width="2" aria-hidden="true" />
      <span>정보 보기</span>
    </button>
  </article>
</template>
