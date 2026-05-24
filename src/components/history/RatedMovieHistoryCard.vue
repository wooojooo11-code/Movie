<script setup lang="ts">
import { computed } from 'vue';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import type { RatedCatalogMovieRecord } from '@/types/recommendation';

const props = withDefaults(
  defineProps<{
    entry: RatedCatalogMovieRecord;
    viewMode?: 'grid' | 'list';
  }>(),
  {
    viewMode: 'list'
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
const decisionLabel = computed(
  () => decisionLabels[props.entry.ratingRecord.rawDecision] ?? props.entry.ratingRecord.rawDecision
);
const decisionClassName = computed(
  () => decisionClassNames[props.entry.ratingRecord.rawDecision] ?? decisionClassNames.dislike
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

const hasDetailedFeedback = computed(
  () =>
    props.entry.ratingRecord.input.reviewTags.length > 0 ||
    Boolean(props.entry.ratingRecord.input.favoriteCharacter) ||
    Boolean(props.entry.ratingRecord.reviewText)
);
</script>

<template>
  <article class="border border-app-line bg-app-panel" :class="isGridMode ? 'overflow-hidden p-3' : 'px-3 py-3'">
    <div :class="isGridMode ? 'flex flex-col gap-3' : 'flex items-start gap-3'">
      <img
        :src="entry.movie.posterUrl"
        :alt="entry.movie.posterAlt"
        class="object-cover"
        :class="isGridMode ? 'aspect-[4/5] w-[92%] justify-self-center' : 'aspect-[4/5] w-[2.85rem]'"
        loading="lazy"
      />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="border px-2 py-1 text-[10px] font-medium" :class="decisionClassName">
            {{ decisionLabel }}
          </span>
          <span
            v-if="starLabel"
            class="border border-app-line bg-app-panelSoft px-2 py-1 text-[10px] font-medium text-white"
          >
            {{ starLabel }}
          </span>
        </div>

        <h2 class="mt-2 line-clamp-2 text-[14px] font-semibold leading-5 text-white">
          {{ entry.movie.title }}
        </h2>
        <p class="mt-1 text-[11px] text-app-muted">
          {{ entry.movie.releaseYear }} · {{ entry.movie.genres.join(' · ') }}
        </p>
        <p v-if="answeredAtLabel" class="mt-1 text-[11px] text-app-muted">
          {{ answeredAtLabel }}
        </p>
      </div>
    </div>

    <div v-if="hasDetailedFeedback" class="mt-3 space-y-2 border-t border-app-line pt-3">
      <div v-if="entry.ratingRecord.input.reviewTags.length > 0">
        <p class="text-[10px] text-app-muted">좋았던 포인트</p>
        <div class="mt-1.5 flex flex-wrap gap-1">
          <span
            v-for="tag in entry.ratingRecord.input.reviewTags"
            :key="tag"
            class="border border-app-line bg-app-panelSoft px-2 py-1 text-[10px] text-white"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div v-if="entry.ratingRecord.input.favoriteCharacter">
        <p class="text-[10px] text-app-muted">좋아한 캐릭터</p>
        <p class="mt-1 text-[12px] text-white">
          {{ entry.ratingRecord.input.favoriteCharacter }}
        </p>
      </div>

      <div v-if="entry.ratingRecord.reviewText">
        <p class="text-[10px] text-app-muted">메모</p>
        <p class="mt-1 line-clamp-2 whitespace-pre-wrap text-[12px] leading-4.5 text-white">
          {{ entry.ratingRecord.reviewText }}
        </p>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <WatchToggleButton :movie-id="entry.movie.id" size="sm" full-width />
      <RouterLink
        :to="`/history/${entry.movie.id}/edit`"
        class="focus-ring inline-flex min-h-8 w-full items-center justify-center border border-app-line bg-app-panelSoft px-2.5 py-1.5 text-[11px] font-medium text-white"
      >
        평가 변경하기
      </RouterLink>
    </div>
  </article>
</template>
