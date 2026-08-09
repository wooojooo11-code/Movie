<script setup lang="ts">
import { computed, ref } from 'vue';

import RatingActions from '@/components/rating/RatingActions.vue';
import { getYouTubeEmbedUrl, loadMovieTrailer } from '@/services/movieTrailer';
import { getWatchProviderLinks } from '@/services/watchProviderLinks';
import type { RatingMovie, RatingSelection } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    movie: RatingMovie;
    interactive?: boolean;
    primaryLayout?: boolean;
    size?: 'compact' | 'default' | 'detail';
    showTrailer?: boolean;
  }>(),
  {
    interactive: true,
    primaryLayout: false,
    size: 'default',
    showTrailer: false
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
const isTrailerDialogOpen = ref(false);
const isTrailerLoading = ref(false);
const trailerLoadFailed = ref(false);
const trailerName = ref<null | string>(null);
const trailerYouTubeKey = ref<null | string>(null);

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
const trailerSearchLink = computed(() => {
  const query = `${props.movie.title} ${props.movie.releaseYear} 공식 예고편`;

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
});

const trailerEmbedUrl = computed(() =>
  trailerYouTubeKey.value ? getYouTubeEmbedUrl(trailerYouTubeKey.value) : null
);

const openTrailer = async () => {
  isTrailerDialogOpen.value = true;
  trailerLoadFailed.value = false;

  if (trailerYouTubeKey.value || isTrailerLoading.value) {
    return;
  }

  isTrailerLoading.value = true;

  try {
    const trailer = await loadMovieTrailer(props.movie.tmdbMovieId);
    trailerYouTubeKey.value = trailer.key;
    trailerName.value = trailer.name;
  } catch {
    trailerLoadFailed.value = true;
  } finally {
    isTrailerLoading.value = false;
  }
};

const closeTrailer = () => {
  isTrailerDialogOpen.value = false;
};

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
    <div v-if="primaryLayout" class="bg-app-panel p-4 sm:p-5">
      <div class="flex flex-col gap-4 sm:grid sm:grid-cols-[7rem_minmax(0,1fr)_9rem] sm:grid-rows-[auto_auto] sm:gap-x-4 sm:gap-y-3">
        <div class="flex items-center justify-center bg-app-poster sm:col-start-1 sm:row-start-1">
          <img
            :src="movie.posterUrl"
            :alt="movie.posterAlt"
            class="h-[228px] w-full object-contain sm:h-[164px]"
            loading="lazy"
          />
        </div>

        <button
          v-if="showTrailer"
          type="button"
          :aria-label="`${movie.title} 예고편 앱에서 재생하기`"
          class="focus-ring corner-soft group relative aspect-video overflow-hidden border border-app-line bg-[#15171c] sm:col-start-1 sm:row-start-2"
          @click.stop="openTrailer"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @pointercancel.stop
        >
          <img
            :src="movie.posterUrl"
            alt=""
            aria-hidden="true"
            class="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-sm transition duration-200 group-hover:scale-100"
            loading="lazy"
          />
          <span class="absolute inset-0 bg-black/30"></span>
          <span class="relative flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center text-white">
            <span class="grid size-8 place-items-center rounded-full border border-white/80 bg-black/35 text-sm">▶</span>
            <span class="text-xs font-semibold">예고편 보기</span>
            <span class="text-[10px] text-white/75">앱에서 재생</span>
          </span>
        </button>

        <div class="min-w-0 border-t border-app-line pt-4 sm:col-start-2 sm:row-start-1 sm:border-t-0 sm:pt-0">
          <p
            class="corner-pill mb-3 inline-flex border border-app-line bg-app-panelSoft px-3 py-1.5 text-xs font-bold text-[#15171c]"
          >
            {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
          </p>
          <h1 class="text-[28px] font-semibold leading-tight text-[#15171c] sm:text-[30px]">
            {{ movie.title }}
          </h1>
          <p class="mt-3 text-sm font-medium text-app-muted">
            {{ movie.tags.join(' · ') }}
          </p>
        </div>

        <RatingActions
          layout="two-rows"
          class="hidden sm:grid sm:col-start-3 sm:row-start-1 sm:self-start"
          @decide="emitDecision"
        />

        <div class="border-t border-app-line pt-3 sm:col-start-2 sm:col-span-2 sm:row-start-2">
          <p v-if="overviewText" class="line-clamp-3 text-sm leading-6 text-[#3d424a]">
            {{ overviewText }}
          </p>

          <div class="mt-3 border-t border-app-line pt-3">
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
    </div>

    <div v-else class="flex flex-col bg-app-panel" :class="containerClassName">
      <div
        class="bg-app-poster"
        :class="showTrailer ? 'grid grid-cols-2 items-center gap-3' : 'flex items-center justify-center'"
      >
        <div class="flex items-center justify-center">
          <img
            :src="movie.posterUrl"
            :alt="movie.posterAlt"
            class="w-full object-contain"
            :class="posterClassName"
            loading="lazy"
          />
        </div>

        <button
          v-if="showTrailer"
          type="button"
          :aria-label="`${movie.title} 예고편 앱에서 재생하기`"
          class="focus-ring corner-soft group relative aspect-video self-center overflow-hidden border border-app-line bg-[#15171c]"
          @click.stop="openTrailer"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @pointercancel.stop
        >
          <img
            :src="movie.posterUrl"
            alt=""
            aria-hidden="true"
            class="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-sm transition duration-200 group-hover:scale-100"
            loading="lazy"
          />
          <span class="absolute inset-0 bg-black/30"></span>
          <span class="relative flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center text-white">
            <span class="grid size-8 place-items-center rounded-full border border-white/80 bg-black/35 text-sm">▶</span>
            <span class="text-xs font-semibold">예고편 보기</span>
            <span class="text-[10px] text-white/75">앱에서 재생</span>
          </span>
        </button>
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

  <Teleport to="body">
    <div
      v-if="isTrailerDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="closeTrailer"
    >
      <section
        class="corner-hard w-full max-w-3xl overflow-hidden border border-app-line bg-app-panel shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="`${movie.title} 예고편`"
      >
        <div class="flex items-center justify-between gap-4 border-b border-app-line px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-[#15171c]">{{ movie.title }} 예고편</p>
            <p v-if="trailerName" class="mt-0.5 truncate text-xs text-app-muted">{{ trailerName }}</p>
          </div>
          <button
            type="button"
            class="focus-ring corner-soft inline-flex size-9 shrink-0 items-center justify-center border border-app-line text-lg text-[#15171c]"
            aria-label="예고편 닫기"
            @click="closeTrailer"
          >
            ×
          </button>
        </div>

        <div class="aspect-video bg-black">
          <div v-if="isTrailerLoading" class="grid h-full place-items-center text-sm text-white">
            예고편을 불러오는 중…
          </div>
          <iframe
            v-else-if="trailerEmbedUrl"
            :src="trailerEmbedUrl"
            :title="`${movie.title} 예고편`"
            class="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
          <div v-else class="flex h-full flex-col items-center justify-center gap-3 px-5 text-center text-sm text-white">
            <p>{{ trailerLoadFailed ? '앱에서 재생할 예고편을 찾지 못했어요.' : '예고편을 준비하고 있어요.' }}</p>
            <a
              v-if="trailerLoadFailed"
              :href="trailerSearchLink"
              target="_blank"
              rel="noreferrer"
              class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-white/60 px-4 text-xs font-semibold"
            >
              YouTube에서 찾기
            </a>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
