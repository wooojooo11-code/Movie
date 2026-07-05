<script setup lang="ts">
import { computed } from 'vue';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import { getWatchProviderLinks } from '@/services/watchProviderLinks';
import type { RatedCatalogMovieRecord } from '@/types/recommendation';
import { NO_FAVORITE_CHARACTER } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    entry: RatedCatalogMovieRecord;
    viewMode?: 'grid' | 'list';
    index?: number;
  }>(),
  {
    viewMode: 'list',
    index: 0
  }
);

const decisionLabels = {
  like: '재밌음',
  dislike: '별로',
  not_seen: '안 봄',
  not_interested: '관심 없음'
} as const;

const decisionClassNames = {
  like: 'border-app-accent bg-app-accent text-white',
  dislike: 'border-app-line bg-app-panelSoft text-white',
  not_seen: 'border-app-line bg-app-panelSoft text-app-muted',
  not_interested: 'border-app-line bg-app-panelSoft text-app-muted'
} as const;

const isGridMode = computed(() => props.viewMode === 'grid');
const isStaggeredGridCard = computed(() => isGridMode.value && props.index % 2 === 1);

const decisionLabel = computed(
  () => decisionLabels[props.entry.ratingRecord.rawDecision] ?? props.entry.ratingRecord.rawDecision
);
const decisionClassName = computed(
  () => decisionClassNames[props.entry.ratingRecord.rawDecision] ?? decisionClassNames.dislike
);
const characterLabel = computed(() =>
  props.entry.ratingRecord.rawDecision === 'like' ? '좋아한 인물' : '아쉬웠던 인물'
);

const answeredAtLabel = computed(() => {
  const answeredAt = new Date(props.entry.ratingRecord.input.answeredAt);

  if (Number.isNaN(answeredAt.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(answeredAt);
});

const starLabel = computed(() => {
  const rating = props.entry.ratingRecord.input.rating;
  return rating == null ? null : `${rating.toFixed(1)}점`;
});

const overviewText = computed(() => props.entry.movie.overview.trim() || null);
const questionText = computed(() => props.entry.ratingRecord.questionText.trim() || null);
const reviewText = computed(() => props.entry.ratingRecord.reviewText.trim() || null);
const favoriteCharacter = computed(() => props.entry.ratingRecord.input.favoriteCharacter?.trim() || null);
const favoriteCharacterDisplay = computed(() => {
  if (favoriteCharacter.value) {
    return favoriteCharacter.value;
  }

  return props.entry.ratingRecord.detailCompleted && props.entry.ratingRecord.rawDecision !== 'not_seen'
    ? NO_FAVORITE_CHARACTER
    : null;
});
const genresLabel = computed(() => props.entry.movie.genres.join(' · '));
const compactMetaLabel = computed(() =>
  [String(props.entry.movie.releaseYear), props.entry.movie.genres[0] ?? null].filter(Boolean).join(' · ')
);

const listMetaItems = computed(() =>
  [
    { label: '개봉', value: String(props.entry.movie.releaseYear) },
    { label: '장르', value: genresLabel.value || null },
    { label: '평가일', value: answeredAtLabel.value }
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))
);

const hasListFeedbackSection = computed(
  () =>
    props.entry.ratingRecord.input.reviewTags.length > 0 ||
    Boolean(favoriteCharacterDisplay.value) ||
    Boolean(reviewText.value) ||
    Boolean(questionText.value)
);

const quickWatchLinks = computed(() => getWatchProviderLinks(props.entry.movie).slice(0, 3));
const tmdbWatchLink = computed(() => props.entry.movie.watchProvidersKr?.link ?? null);
</script>

<template>
  <article
    class="corner-hard border border-app-line bg-app-panel"
    :class="[isGridMode ? 'overflow-hidden p-2.5' : 'px-4 py-4', isStaggeredGridCard ? 'mt-6' : '']"
  >
    <template v-if="isGridMode">
      <div class="relative">
        <img
          :src="entry.movie.posterUrl"
          :alt="entry.movie.posterAlt"
          class="corner-soft aspect-[4/5] w-full border border-app-line object-cover"
          loading="lazy"
        />

        <div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
          <span
            class="corner-pill border px-2 py-1 text-[10px] font-medium shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
            :class="decisionClassName"
          >
            {{ decisionLabel }}
          </span>
          <span
            v-if="starLabel"
              class="corner-pill border border-app-line bg-[#15171c]/90 px-2 py-1 text-[10px] font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
          >
            {{ starLabel }}
          </span>
        </div>
      </div>

      <h2 class="mt-2 line-clamp-2 text-[14px] font-semibold leading-5 text-white">
        {{ entry.movie.title }}
      </h2>
      <p class="mt-1 text-[11px] leading-4 text-app-muted">
        {{ compactMetaLabel }}
      </p>

      <div class="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-1.5">
        <WatchToggleButton :movie-id="entry.movie.id" size="sm" />
        <RouterLink
          :to="`/history/${entry.movie.id}/edit`"
          class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-2 py-1.5 text-[10px] font-medium text-white"
        >
          평가 수정
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4">
        <img
          :src="entry.movie.posterUrl"
          :alt="entry.movie.posterAlt"
          class="corner-soft aspect-[4/5] w-[4.5rem] shrink-0 border border-app-line object-cover"
          loading="lazy"
        />

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="corner-pill border px-2 py-1 text-[10px] font-medium" :class="decisionClassName">
              {{ decisionLabel }}
            </span>
            <span
              v-if="starLabel"
              class="corner-pill border border-app-line bg-app-panelSoft px-2 py-1 text-[10px] font-medium text-white"
            >
              {{ starLabel }}
            </span>
          </div>

          <h2 class="mt-2 text-[15px] font-semibold leading-6 text-white">
            {{ entry.movie.title }}
          </h2>
          <p class="mt-1 text-[12px] text-app-muted">
            {{ compactMetaLabel }}
          </p>
        </div>
      </div>

        <div class="mt-4 grid gap-3">
        <div class="corner-hard grid gap-2 border border-app-line bg-app-panelSoft px-3 py-3">
          <p class="text-[10px] font-medium tracking-[0.08em] text-app-muted">영화 정보</p>
          <dl class="grid gap-2 text-[12px] text-white">
            <div v-for="item in listMetaItems" :key="item.label" class="grid gap-1">
              <dt class="text-[10px] text-app-muted">{{ item.label }}</dt>
              <dd class="leading-5 text-white">{{ item.value }}</dd>
            </div>
          </dl>
          <div v-if="overviewText" class="grid gap-1">
            <p class="text-[10px] text-app-muted">줄거리</p>
            <p class="whitespace-pre-wrap text-[12px] leading-6 text-white">
              {{ overviewText }}
            </p>
          </div>
        </div>

        <div v-if="hasListFeedbackSection" class="corner-hard grid gap-3 border border-app-line bg-app-panelSoft px-3 py-3">
          <p class="text-[10px] font-medium tracking-[0.08em] text-app-muted">내 평가</p>

          <div v-if="questionText" class="grid gap-1">
            <p class="text-[10px] text-app-muted">좋아요 이유</p>
            <p class="whitespace-pre-wrap text-[12px] leading-5 text-white">
              {{ questionText }}
            </p>
          </div>

          <div v-if="entry.ratingRecord.input.reviewTags.length > 0" class="grid gap-1.5">
            <p class="text-[10px] text-app-muted">선택한 감상</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in entry.ratingRecord.input.reviewTags"
                :key="tag"
                class="corner-pill border border-app-line bg-app-panelSoft px-2 py-1 text-[10px] text-white"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-if="favoriteCharacterDisplay" class="grid gap-1">
            <p class="text-[10px] text-app-muted">{{ characterLabel }}</p>
            <p class="text-[12px] leading-5 text-white">
              {{ favoriteCharacterDisplay }}
            </p>
          </div>

          <div v-if="reviewText" class="grid gap-1">
            <p class="text-[10px] text-app-muted">메모</p>
            <p class="whitespace-pre-wrap text-[12px] leading-5 text-white">
              {{ reviewText }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="quickWatchLinks.length > 0 || tmdbWatchLink"
        class="corner-hard mt-4 grid gap-2 border border-app-line bg-app-panelSoft px-3 py-3"
      >
        <p class="text-[10px] font-medium tracking-[0.08em] text-app-muted">OTT 바로가기</p>
        <div class="flex flex-wrap gap-1.5">
          <a
            v-for="link in quickWatchLinks"
            :key="link.key"
            :href="link.href"
            target="_blank"
            rel="noreferrer"
            class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center px-2.5 py-1.5 text-[10px] font-medium"
            :class="link.accentClassName"
          >
            {{ link.buttonLabel }}
          </a>

          <a
            v-if="tmdbWatchLink"
            :href="tmdbWatchLink"
            target="_blank"
            rel="noreferrer"
            class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-2.5 py-1.5 text-[10px] font-medium text-white"
          >
            전체 보기
          </a>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <WatchToggleButton :movie-id="entry.movie.id" size="sm" full-width />
        <RouterLink
          :to="`/history/${entry.movie.id}/edit`"
          class="focus-ring corner-soft inline-flex min-h-8 w-full items-center justify-center border border-app-line bg-app-panelSoft px-2.5 py-1.5 text-[11px] font-medium text-white"
        >
          평가 수정
        </RouterLink>
      </div>
    </template>
  </article>
</template>
