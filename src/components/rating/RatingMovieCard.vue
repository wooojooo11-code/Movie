<script setup lang="ts">
import { computed, ref } from 'vue';

import type { RatingDecision, RatingMovie } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    movie: RatingMovie;
    interactive?: boolean;
    size?: 'default' | 'detail';
  }>(),
  {
    interactive: true,
    size: 'default'
  }
);

const emit = defineEmits<{
  decide: [decision: RatingDecision | 'not_interested'];
}>();

const startX = ref(0);
const startY = ref(0);
const deltaX = ref(0);
const deltaY = ref(0);
const isDragging = ref(false);

const cardStyle = computed(() => ({
  transform: props.interactive
    ? `translate(${deltaX.value}px, ${deltaY.value}px) rotate(${deltaX.value / 24}deg)`
    : 'translate(0, 0) rotate(0deg)'
}));

const containerClassName = computed(() =>
  props.size === 'detail' ? 'min-h-[320px] p-4' : 'min-h-[420px] p-5'
);

const posterClassName = computed(() =>
  props.size === 'detail' ? 'mb-4 h-[210px]' : 'mb-5 h-[260px]'
);

const titleClassName = computed(() =>
  props.size === 'detail'
    ? 'text-[26px] font-semibold leading-tight text-[#15171c]'
    : 'text-[32px] font-semibold leading-tight text-[#15171c]'
);

const onPointerDown = (event: PointerEvent) => {
  if (!props.interactive) {
    return;
  }

  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  deltaX.value = 0;
  deltaY.value = 0;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent) => {
  if (!props.interactive || !isDragging.value) {
    return;
  }

  deltaX.value = event.clientX - startX.value;
  deltaY.value = event.clientY - startY.value;
};

const resetDrag = () => {
  deltaX.value = 0;
  deltaY.value = 0;
};

const onPointerUp = (event: PointerEvent) => {
  if (!props.interactive || !isDragging.value) {
    return;
  }

  isDragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

  if (deltaY.value < -80 && Math.abs(deltaY.value) > Math.abs(deltaX.value)) {
    emit('decide', 'not_seen');
    resetDrag();
    return;
  }

  if (deltaX.value > 80) {
    emit('decide', 'like');
    resetDrag();
    return;
  }

  if (deltaX.value < -80) {
    emit('decide', 'dislike');
    resetDrag();
    return;
  }

  if (deltaY.value > 80 && Math.abs(deltaY.value) > Math.abs(deltaX.value)) {
    emit('decide', 'not_interested');
    resetDrag();
    return;
  }

  resetDrag();
};
</script>

<template>
  <article
    class="select-none overflow-hidden border border-app-line bg-app-panel transition-transform"
    :class="[
      interactive ? 'touch-none cursor-grab active:cursor-grabbing' : 'cursor-default',
      { 'transition-none': isDragging }
    ]"
    :style="cardStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="flex flex-col bg-app-panel" :class="containerClassName">
      <div class="flex items-center justify-center bg-app-poster">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="w-full object-contain"
          :class="posterClassName"
          loading="lazy"
        />
      </div>

      <div class="w-full border-t border-app-line pt-4">
        <p class="mb-3 inline-flex border border-app-line bg-app-panelSoft px-3 py-1.5 text-xs font-bold text-[#15171c]">
          {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
        </p>
        <h1 :class="titleClassName">
          {{ movie.title }}
        </h1>
        <p class="mt-3 text-sm font-medium text-app-muted">
          {{ movie.tags.join(' · ') }}
        </p>
      </div>
    </div>
  </article>
</template>
