<script setup lang="ts">
import { computed, ref } from 'vue';

import RatingActions from '@/components/rating/RatingActions.vue';
import { getYouTubeEmbedUrl, loadMovieTrailer } from '@/services/movieTrailer';
import { getWatchProviderLinks } from '@/services/watchProviderLinks';
import type { RatingDirection, RatingMovie, RatingSelection } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    movie: RatingMovie;
    interactive?: boolean;
    detailLayout?: boolean;
    primaryLayout?: boolean;
    size?: 'compact' | 'default' | 'detail';
    showTrailer?: boolean;
    showWatchOptions?: boolean;
    showPreviousRatingEdit?: boolean;
    previousRating?: null | {
      decision: RatingSelection['decision'];
      direction: null | RatingDirection;
    };
  }>(),
  {
    interactive: true,
    detailLayout: false,
    primaryLayout: false,
    size: 'default',
    showTrailer: false,
    showWatchOptions: true,
    showPreviousRatingEdit: false,
    previousRating: null
  }
);

const emit = defineEmits<{
  decide: [selection: RatingSelection];
  editPreviousRating: [];
}>();

const startX = ref(0);
const startY = ref(0);
const deltaX = ref(0);
const deltaY = ref(0);
const isDragging = ref(false);
const isOverviewDialogOpen = ref(false);
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
const previousRatingPresentation = computed<null | { badgeClassName: string; borderClassName: string; label: string }>(
  () => {
    const previousRating = props.previousRating;

    if (!previousRating) {
      return null;
    }

    if (previousRating.decision === 'like' && previousRating.direction === 'right') {
      return {
        label: '재미있음으로 평가함',
        badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        borderClassName: 'border-emerald-400'
      };
    }

    if (previousRating.decision === 'like') {
      return {
        label: '관심있음으로 평가함',
        badgeClassName: 'border-sky-200 bg-sky-50 text-sky-800',
        borderClassName: 'border-sky-400'
      };
    }

    if (previousRating.decision === 'dislike') {
      return {
        label: '재미없음으로 평가함',
        badgeClassName: 'border-rose-200 bg-rose-50 text-rose-800',
        borderClassName: 'border-rose-400'
      };
    }

    if (previousRating.decision === 'not_interested') {
      return {
        label: '관심없음으로 평가함',
        badgeClassName: 'border-slate-300 bg-slate-100 text-slate-700',
        borderClassName: 'border-slate-400'
      };
    }

    return {
      label: '안 본 영화로 평가함',
      badgeClassName: 'border-violet-200 bg-violet-50 text-violet-800',
      borderClassName: 'border-violet-400'
    };
  }
);
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
    const trailer = await loadMovieTrailer(props.movie.tmdbMovieId, props.movie.trailer);
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

const openOverview = () => {
  isOverviewDialogOpen.value = true;
};

const closeOverview = () => {
  isOverviewDialogOpen.value = false;
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
      primaryLayout ? 'absolute inset-0 min-h-0' : '',
      { 'transition-none': isDragging },
      previousRatingPresentation?.borderClassName
    ]"
    :style="cardStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div v-if="detailLayout" class="bg-app-panel">
      <div class="sm:grid sm:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] sm:items-stretch">
        <section class="relative min-h-[21rem] overflow-hidden border-b border-app-line bg-[#11151d] sm:min-h-[33rem] sm:border-b-0 sm:border-r">
          <button
            v-if="showTrailer"
            type="button"
            :aria-label="`${movie.title} 예고편 재생하기`"
            class="focus-ring group absolute inset-0 block h-full w-full overflow-hidden bg-[#11151d] text-left"
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
              class="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-sm transition duration-500 group-hover:scale-100 group-hover:opacity-70"
              loading="lazy"
            />
            <span aria-hidden="true" class="absolute inset-0 bg-[linear-gradient(125deg,rgba(5,8,13,0.93),rgba(7,10,16,0.26)_56%,rgba(5,8,13,0.74))]"></span>
            <span class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white backdrop-blur-sm sm:left-6 sm:top-6">
              <span class="size-1.5 rounded-full bg-[#e45050] shadow-[0_0_10px_rgba(228,80,80,0.9)]"></span>
              OFFICIAL TRAILER
            </span>
            <span class="relative flex h-full flex-col items-center justify-center">
              <span class="grid size-16 place-items-center rounded-full border border-white/75 bg-white/15 shadow-[0_8px_26px_rgba(0,0,0,0.42)] backdrop-blur-sm transition duration-200 group-hover:scale-110 group-hover:bg-white/25 sm:size-[4.5rem]">
                <span class="ml-1 h-0 w-0 border-y-[10px] border-l-[15px] border-y-transparent border-l-white"></span>
              </span>
              <span class="mt-3 text-sm font-semibold text-white sm:text-base">예고편 재생</span>
            </span>
            <span class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-[10px] font-medium text-white/75 sm:inset-x-6 sm:bottom-6">
              <span>상세 평가 전 예고편 보기</span>
              <span class="tracking-[0.15em]">PLAY</span>
            </span>
          </button>

          <div v-else class="flex h-full items-center justify-center bg-app-poster">
            <img :src="movie.posterUrl" :alt="movie.posterAlt" class="h-full w-full object-contain" loading="lazy" />
          </div>
        </section>

        <section class="flex min-w-0 flex-col">
          <div class="flex flex-1 flex-col p-5 sm:p-7">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-app-muted">Detail rating</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="corner-pill inline-flex border border-app-line bg-app-panelSoft px-3 py-1.5 text-xs font-bold text-[#15171c]">
                {{ movie.releaseYear }}
              </span>
              <span
                v-for="genre in movie.genres.slice(0, 2)"
                :key="genre"
                class="corner-pill inline-flex border border-app-line px-3 py-1.5 text-xs font-medium text-app-muted"
              >
                {{ genre }}
              </span>
            </div>
            <h1 class="mt-4 text-[28px] font-semibold leading-tight text-[#15171c] sm:text-[36px]">
              {{ movie.title }}
            </h1>
            <p class="mt-3 text-sm font-medium leading-6 text-app-muted sm:text-[15px]">
              {{ movie.tags.join(' · ') }}
            </p>
            <div class="mt-auto border-t border-app-line pt-4 sm:pt-5">
              <p class="text-xs leading-5 text-[#3d424a]">예고편을 보고, 기억에 남은 감상을 차분히 남겨보세요.</p>
            </div>
          </div>
        </section>
      </div>

      <p v-if="overviewText" class="border-t border-app-line px-5 py-5 text-sm leading-7 text-[#3d424a] sm:px-7 sm:text-[15px]">
        {{ overviewText }}
      </p>
    </div>

    <div
      v-else-if="primaryLayout"
      class="grid h-full min-h-0 grid-cols-[minmax(7rem,0.72fr)_minmax(0,1.28fr)] grid-rows-[minmax(0,1fr)_auto] bg-app-panel sm:grid-cols-[minmax(19rem,0.92fr)_minmax(0,1.08fr)] sm:grid-rows-1"
    >
      <div class="min-h-0 overflow-hidden border-r border-app-line bg-[#10141c]">
        <button
          v-if="showTrailer"
          type="button"
          :aria-label="`${movie.title} 예고편 앱에서 재생하기`"
          class="focus-ring group relative block h-full w-full overflow-hidden bg-[#15171c] text-left"
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
            class="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-md transition duration-500 group-hover:scale-100"
            loading="lazy"
          />
          <span aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-[#07090d]/90 via-[#07090d]/20 to-[#07090d]/45"></span>
          <img
            :src="movie.posterUrl"
            :alt="movie.posterAlt"
            class="relative h-full w-full object-contain px-1 py-8 sm:px-7 sm:py-10"
            loading="lazy"
          />
          <span class="absolute left-2 top-2 inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.14em] text-white sm:left-4 sm:top-4 sm:text-[10px] sm:tracking-[0.18em]">
            <span class="h-1.5 w-1.5 rounded-full bg-[#e45050] shadow-[0_0_10px_rgba(228,80,80,0.9)]"></span>
            TRAILER
          </span>
          <span class="absolute right-2 top-2 text-[9px] font-medium tracking-[0.1em] text-white/70 sm:right-4 sm:top-4 sm:text-[10px] sm:tracking-[0.12em]">
            {{ movie.releaseYear }}
          </span>
          <span class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="grid size-11 place-items-center rounded-full border border-white/70 bg-black/45 shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition duration-200 group-hover:scale-110 group-hover:bg-white/20 sm:size-16">
              <span class="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white sm:ml-1 sm:border-y-[9px] sm:border-l-[14px]"></span>
            </span>
            <span class="mt-2 text-[10px] font-semibold text-white sm:mt-4 sm:text-base">예고편 재생</span>
          </span>
        </button>

        <div v-else class="flex h-full items-center justify-center bg-app-poster">
          <img :src="movie.posterUrl" :alt="movie.posterAlt" class="h-full w-full object-contain" loading="lazy" />
        </div>
      </div>

      <div class="contents sm:flex sm:min-h-0 sm:flex-col sm:p-5">
        <div class="min-h-0 overflow-hidden p-3 sm:p-0">
          <p
            v-if="previousRatingPresentation"
            class="corner-pill mb-2 inline-flex w-fit border px-2 py-1 text-[10px] font-bold sm:mb-3 sm:px-3 sm:py-1.5 sm:text-sm"
            :class="previousRatingPresentation.badgeClassName"
          >
            {{ previousRatingPresentation.label }}
          </p>
          <p
            class="corner-pill mb-2 inline-flex max-w-full truncate border border-app-line bg-app-panelSoft px-2 py-1 text-[10px] font-bold text-[#15171c] sm:mb-3 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
          </p>
          <h1 class="text-xl font-semibold leading-tight text-[#15171c] sm:text-[34px]">
            {{ movie.title }}
          </h1>
          <p class="mt-1.5 text-xs font-medium text-app-muted sm:mt-3 sm:text-base">
            {{ movie.tags.join(' · ') }}
          </p>
          <div v-if="overviewText" class="relative mt-2 sm:mt-4">
            <p class="rating-primary-overview pr-12 text-xs leading-5 text-[#3d424a] sm:pr-14 sm:text-[15px] sm:leading-7">
              {{ overviewText }}
            </p>
            <button
              type="button"
              class="focus-ring corner-pill absolute bottom-0 right-0 inline-flex min-h-6 items-center border border-app-line bg-app-panel px-2 text-[10px] font-bold text-app-accent shadow-[-8px_0_10px_#ffffff] sm:min-h-7 sm:text-xs"
              aria-haspopup="dialog"
              :aria-expanded="isOverviewDialogOpen"
              @click.stop="openOverview"
              @pointercancel.stop
              @pointerdown.stop
              @pointermove.stop
              @pointerup.stop
            >
              더보기
            </button>
          </div>
        </div>

        <div class="col-span-2 grid shrink-0 gap-2 border-t border-app-line bg-app-panel p-2 sm:mt-auto sm:p-0 sm:pt-4">
          <div class="flex items-center justify-between gap-2 px-0.5">
            <p class="text-[10px] font-medium text-app-muted sm:text-xs">밀거나 방향 버튼을 눌러 평가하세요.</p>
          <button
            v-if="showPreviousRatingEdit"
            type="button"
              class="focus-ring corner-soft inline-flex min-h-7 shrink-0 items-center justify-center border border-app-line bg-app-panelSoft px-2 text-[10px] font-medium text-[#15171c] sm:min-h-8 sm:text-xs"
            @click.stop="emit('editPreviousRating')"
            @pointercancel.stop
            @pointerdown.stop
            @pointermove.stop
            @pointerup.stop
          >
              이전 평가 수정
          </button>
        </div>
          <RatingActions compact layout="keyboard" @decide="emitDecision" />
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
          v-if="previousRatingPresentation"
          class="corner-pill mb-3 inline-flex border px-3 py-1.5 text-xs font-bold"
          :class="previousRatingPresentation.badgeClassName"
        >
          {{ previousRatingPresentation.label }}
        </p>
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

        <div v-if="showWatchOptions" class="mt-4 border-t border-app-line pt-3">
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
    <Teleport to="body">
    <div
      v-if="isOverviewDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      @click.self="closeOverview"
      @keydown.esc.stop="closeOverview"
      @keydown.stop
    >
      <section
        class="corner-hard mx-auto flex max-h-[min(80dvh,48rem)] w-full max-w-md flex-col overflow-hidden border border-app-line bg-app-panel shadow-2xl sm:max-w-[800px]"
        role="dialog"
        aria-modal="true"
        :aria-label="`${movie.title} 전체 줄거리`"
      >
        <div class="flex shrink-0 items-center justify-between gap-4 border-b border-app-line px-4 py-3 sm:px-5">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-app-muted">줄거리</p>
            <h2 class="mt-1 truncate text-base font-semibold text-[#15171c] sm:text-xl">{{ movie.title }}</h2>
          </div>
          <button
            type="button"
            class="focus-ring corner-soft inline-flex size-9 shrink-0 items-center justify-center border border-app-line bg-app-panelSoft text-lg text-[#15171c]"
            aria-label="줄거리 닫기"
            @click="closeOverview"
          >
            ×
          </button>
        </div>

        <div class="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <p class="whitespace-pre-wrap text-sm leading-7 text-[#3d424a] sm:text-base sm:leading-8">
            {{ overviewText }}
          </p>
        </div>
      </section>
    </div>
    </Teleport>

    <Teleport to="body">
    <div
      v-if="isTrailerDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="closeTrailer"
    >
      <section
        class="corner-hard w-full max-w-[800px] overflow-hidden border border-app-line bg-app-panel shadow-2xl"
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
  </article>
</template>

<style scoped>
.rating-primary-overview {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

@media (min-width: 640px) {
  .rating-primary-overview {
    -webkit-line-clamp: 5;
  }
}
</style>
