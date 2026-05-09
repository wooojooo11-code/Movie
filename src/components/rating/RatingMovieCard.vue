<script setup lang="ts">
import { computed, ref } from 'vue';

import type { RatingDecision, RatingMovie } from '@/types/rating';

const props = defineProps<{
  movie: RatingMovie;
}>();

const emit = defineEmits<{
  decide: [decision: RatingDecision | 'not_interested'];
}>();

const startX = ref(0);
const startY = ref(0);
const deltaX = ref(0);
const deltaY = ref(0);
const isDragging = ref(false);

const posterStyle = computed(() => ({
  backgroundImage: `linear-gradient(160deg, rgba(43,49,64,0.55), rgba(11,13,18,0.94) 72%), url(${props.movie.posterUrl})`,
  transform: `translate(${deltaX.value}px, ${deltaY.value}px) rotate(${deltaX.value / 24}deg)`
}));

const onPointerDown = (event: PointerEvent) => {
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  deltaX.value = 0;
  deltaY.value = 0;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) {
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
  if (!isDragging.value) {
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
    class="touch-none select-none overflow-hidden rounded-[28px] border border-app-line bg-app-panel shadow-2xl shadow-black/25 transition-transform"
    :class="{ 'transition-none': isDragging }"
    :style="posterStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="flex min-h-[420px] items-end bg-cover bg-center p-6">
      <div>
        <p class="mb-3 inline-flex rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-bold text-white">
          {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
        </p>
        <h1 class="max-w-[85%] text-[32px] font-black leading-tight text-white">
          {{ movie.title }}
        </h1>
        <p class="mt-3 text-sm font-medium text-[#dfe6f2]">{{ movie.tags.join(' · ') }}</p>
      </div>
    </div>
  </article>
</template>
