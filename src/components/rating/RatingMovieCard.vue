<script setup lang="ts">
import { computed, ref } from 'vue';

import { getWatchProviderLinks } from '@/services/watchProviderLinks';
import type { RatingMovie, RatingSelection } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    movie: RatingMovie;
    interactive?: boolean;
    size?: 'compact' | 'default' | 'detail';
  }>(),
  {
    interactive: true,
    size: 'default'
  }
);

const emit = defineEmits<{
  decide: [selection: RatingSelection];
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

const containerClassName = computed(() => {
  if (props.size === 'detail') {
    return 'min-h-[320px] p-4';
  }

  if (props.size === 'compact') {
    return 'min-h-[380px] p-4 sm:min-h-[420px] sm:p-5';
  }

  return 'min-h-[420px] p-5';
});

const posterClassName = computed(() => {
  if (props.size === 'detail') {
    return 'mb-4 h-[210px]';
  }

  if (props.size === 'compact') {
    return 'mb-4 h-[228px] sm:mb-5 sm:h-[260px]';
  }

  return 'mb-5 h-[260px]';
});

const titleClassName = computed(() => {
  if (props.size === 'detail') {
    return 'text-[26px] font-semibold leading-tight text-[#15171c]';
  }

  if (props.size === 'compact') {
    return 'text-[28px] font-semibold leading-tight text-[#15171c] sm:text-[32px]';
  }

  return 'text-[32px] font-semibold leading-tight text-[#15171c]';
});
const overviewText = computed(() => props.movie.overview.trim());
const watchAvailability = computed(() => {
  const providers = props.movie.watchProvidersKr;

  if (!providers) {
    return null;
  }

  if (providers.flatrate.length > 0) {
    return {
      label: '스트리밍',
      providerNames: providers.flatrate.map((provider) => provider.providerName)
    };
  }

  if (providers.rent.length > 0) {
    return {
      label: '대여',
      providerNames: providers.rent.map((provider) => provider.providerName)
    };
  }

  if (providers.buy.length > 0) {
    return {
      label: '구매',
      providerNames: providers.buy.map((provider) => provider.providerName)
    };
  }

  return null;
});
const watchAvailabilityText = computed(() => {
  if (!watchAvailability.value) {
    return '';
  }

  return `${watchAvailability.value.label} · ${watchAvailability.value.providerNames.slice(0, 4).join(' · ')}`;
});
const quickWatchLinks = computed(() => getWatchProviderLinks(props.movie).slice(0, 4));
const tmdbWatchLink = computed(() => props.movie.watchProvidersKr?.link ?? null);

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

const emitDecision = (selection: RatingSelection) => {
  emit('decide', selection);
  resetDrag();
};

const onPointerUp = (event: PointerEvent) => {
  if (!props.interactive || !isDragging.value) {
    return;
  }

  isDragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

  if (deltaY.value < -80 && Math.abs(deltaY.value) > Math.abs(deltaX.value)) {
    emitDecision({ decision: 'like', direction: 'up' });
    return;
  }

  if (deltaX.value > 80) {
    emitDecision({ decision: 'like', direction: 'right' });
    return;
  }

  if (deltaX.value < -80) {
    emitDecision({ decision: 'dislike', direction: 'left' });
    return;
  }

  if (deltaY.value > 80 && Math.abs(deltaY.value) > Math.abs(deltaX.value)) {
    emitDecision({ decision: 'not_interested', direction: 'down' });
    return;
  }

  resetDrag();
};
</script>

<template>
  <article
    class="corner-hard select-none overflow-hidden border border-app-line bg-app-panel transition-transform"
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
        <p
          class="corner-pill mb-3 inline-flex border border-app-line bg-app-panelSoft px-3 py-1.5 text-xs font-bold text-[#15171c]"
        >
          {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
        </p>
        <h1 :class="titleClassName">
          {{ movie.title }}
        </h1>
        <p class="mt-3 text-sm font-medium text-app-muted">
          {{ movie.tags.join(' · ') }}
        </p>

        <p v-if="overviewText" class="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#3d424a]">
          {{ overviewText }}
        </p>

        <div class="mt-4 border-t border-app-line pt-3">
          <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-app-muted">OTT</p>
          <p v-if="watchAvailabilityText" class="mt-1 text-xs leading-5 text-[#15171c]">
            {{ watchAvailabilityText }}
          </p>
          <p v-else class="mt-1 text-xs leading-5 text-app-muted">
            현재 확인된 KR OTT 정보가 없어요.
          </p>

          <div v-if="quickWatchLinks.length > 0 || tmdbWatchLink" class="mt-2 flex flex-wrap gap-2">
            <a
              v-for="link in quickWatchLinks"
              :key="link.key"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center px-3 text-[10px] font-medium"
              :class="link.accentClassName"
              @click.stop
              @pointerdown.stop
              @pointerup.stop
            >
              {{ link.buttonLabel }}
            </a>

            <a
              v-if="tmdbWatchLink"
              :href="tmdbWatchLink"
              target="_blank"
              rel="noreferrer"
              class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-[10px] font-medium text-[#15171c]"
              @click.stop
              @pointerdown.stop
              @pointerup.stop
            >
              전체 OTT 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
