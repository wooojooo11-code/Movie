<script setup lang="ts">
import { computed } from 'vue';

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
  dislike: '재미없음',
  not_seen: '안 봄',
  not_interested: '관심없음'
} as const;

const decisionClassNames = {
  like: 'border-app-accent/30 bg-app-accent/15 text-app-accent',
  dislike: 'border-app-line bg-white/5 text-white',
  not_seen: 'border-app-line bg-white/5 text-app-muted',
  not_interested: 'border-app-line bg-white/5 text-app-muted'
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

  if (rating == null) {
    return null;
  }

  return `${rating.toFixed(1)}점`;
});

const hasDetailedFeedback = computed(
  () =>
    props.entry.ratingRecord.input.reviewTags.length > 0 ||
    Boolean(props.entry.ratingRecord.input.favoriteCharacter) ||
    Boolean(props.entry.ratingRecord.reviewText)
);

const detailPendingMessage = computed(
  () =>
    props.entry.ratingRecord.rawDecision === 'like' && !props.entry.ratingRecord.detailCompleted
);
</script>

<template>
  <article
    class="rounded-[24px] border border-app-line bg-app-panel"
    :class="isGridMode ? 'overflow-hidden p-3' : 'p-4'"
  >
    <div :class="isGridMode ? 'flex flex-col gap-3' : 'flex items-start gap-4'">
      <img
        :src="entry.movie.posterUrl"
        :alt="entry.movie.posterAlt"
        class="rounded-[16px] object-cover"
        :class="isGridMode ? 'aspect-[4/5] w-full' : 'aspect-[4/5] w-24'"
        loading="lazy"
      />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full border px-3 py-1 text-xs font-bold" :class="decisionClassName">
            {{ decisionLabel }}
          </span>
          <span
            v-if="starLabel"
            class="rounded-full border border-app-line bg-white/5 px-3 py-1 text-xs font-bold text-white"
          >
            {{ starLabel }}
          </span>
        </div>

        <h2 class="mt-3 line-clamp-2 text-base font-extrabold text-white">
          {{ entry.movie.title }}
        </h2>
        <p class="mt-1 text-sm text-app-muted">
          {{ entry.movie.releaseYear }} · {{ entry.movie.genres.join(' · ') }}
        </p>
        <p v-if="answeredAtLabel" class="mt-2 text-xs text-app-muted">
          {{ answeredAtLabel }}
        </p>

        <p v-if="detailPendingMessage" class="mt-3 text-sm leading-6 text-app-muted">
          재밌음으로 골랐고, 상세 취향분석은 아직 마치지 않았어요.
        </p>
      </div>
    </div>

    <div v-if="hasDetailedFeedback" class="mt-4 space-y-3 border-t border-white/5 pt-4">
      <div v-if="entry.ratingRecord.input.reviewTags.length > 0">
        <p class="text-xs font-bold uppercase tracking-[0.08em] text-app-muted">좋았던 포인트</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="tag in entry.ratingRecord.input.reviewTags"
            :key="tag"
            class="rounded-full border border-app-line bg-white/5 px-3 py-1.5 text-xs font-bold text-white"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div v-if="entry.ratingRecord.input.favoriteCharacter">
        <p class="text-xs font-bold uppercase tracking-[0.08em] text-app-muted">가장 좋았던 캐릭터</p>
        <p class="mt-2 text-sm text-white">
          {{ entry.ratingRecord.input.favoriteCharacter }}
        </p>
      </div>

      <div v-if="entry.ratingRecord.reviewText">
        <p class="text-xs font-bold uppercase tracking-[0.08em] text-app-muted">한줄 메모</p>
        <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/90">
          {{ entry.ratingRecord.reviewText }}
        </p>
      </div>
    </div>

    <div class="mt-4">
      <RouterLink
        :to="`/history/${entry.movie.id}/edit`"
        class="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 py-[11px] text-sm font-bold text-white"
      >
        평가 변경하기
      </RouterLink>
    </div>
  </article>
</template>
