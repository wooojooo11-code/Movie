<script setup lang="ts">
import { Clapperboard } from 'lucide-vue-next';

import IconButton from '@/components/common/IconButton.vue';
import type { TrendingMovie } from '@/types/home';

const props = defineProps<{
  movie: TrendingMovie;
}>();

const emit = defineEmits<{
  open: [movie: TrendingMovie];
  trailer: [movie: TrendingMovie];
}>();

let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

const openMovie = () => {
  emit('open', props.movie);
};

const openTrailer = () => {
  emit('trailer', props.movie);
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
    <div class="group relative">
      <button
        type="button"
        class="focus-ring poster-card block w-full overflow-hidden text-left"
        style="touch-action: manipulation"
        :aria-label="`${movie.title} 상세 정보 보기`"
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

      <IconButton
        :icon="Clapperboard"
        class="trailer-hover-action absolute right-2 top-2 z-10 shadow-lg"
        :label="`${movie.title} 예고편 바로 보기`"
        size="sm"
        @pointerdown.stop
        @click.stop="openTrailer"
      />
    </div>
  </article>
</template>

<style scoped>
.trailer-hover-action {
  opacity: 1;
  transform: translateY(0);
}

@media (hover: hover) and (pointer: fine) {
  .trailer-hover-action {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.35rem);
    transition:
      opacity 160ms ease,
      transform 160ms ease;
  }

  .group:hover .trailer-hover-action,
  .group:focus-within .trailer-hover-action {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .trailer-hover-action {
    transition: none;
  }
}
</style>
