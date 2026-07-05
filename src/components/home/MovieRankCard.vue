<script setup lang="ts">
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
  <article class="corner-hard w-[148px] shrink-0 snap-start border border-app-line bg-app-panel sm:w-[164px]">
    <button
      type="button"
      class="focus-ring corner-hard poster-hover-card block w-full overflow-hidden text-left"
      style="touch-action: manipulation"
      @click.stop="openMovie"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.capture.prevent.stop="onTouchEnd"
    >
      <div class="relative aspect-[4/5] overflow-hidden bg-app-poster">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="poster-hover-image h-full w-full object-cover"
          draggable="false"
          loading="lazy"
        />

        <span
          class="corner-pill absolute left-2 top-2 border border-app-line bg-app-surface px-2 py-1 text-[11px] font-medium text-[#15171c]"
        >
          {{ movie.rank }}
        </span>
      </div>

      <div class="px-3 py-3">
        <h3 class="line-clamp-1 text-sm font-medium text-[#15171c]">
          {{ movie.title }}
        </h3>
        <p class="mt-1 text-xs text-app-muted">
          {{ movie.audienceLabel }}
        </p>
      </div>
    </button>

    <div class="border-t border-app-line p-2">
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-8 w-full items-center justify-center border border-app-line bg-app-panelSoft px-2 text-[11px] font-medium text-[#15171c]"
        style="touch-action: manipulation"
        @click.stop="openMovie"
        @pointerdown.stop.prevent="openMovie"
        @touchend.prevent.stop="openMovie"
      >
        정보 보기
      </button>
    </div>
  </article>
</template>
