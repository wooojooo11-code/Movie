<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import RatedMovieHistoryCard from '@/components/history/RatedMovieHistoryCard.vue';
import { useRecommendationStore } from '@/services/recommendationStore';

type HistoryViewMode = 'grid' | 'list';

const HISTORY_VIEW_MODE_STORAGE_KEY = 'movielist:rated-history-view-mode';

const recommendationStore = useRecommendationStore();
const ratedMoviesHistory = computed(() => recommendationStore.ratedMoviesHistory.value);
const historySearchQuery = ref('');
const normalizeHistorySearchValue = (value: string) =>
  value.toLocaleLowerCase('ko-KR').replace(/\s+/g, '');

const normalizedHistorySearchQuery = computed(() =>
  normalizeHistorySearchValue(historySearchQuery.value.trim())
);

const filteredRatedMoviesHistory = computed(() => {
  const query = normalizedHistorySearchQuery.value;

  if (!query) {
    return ratedMoviesHistory.value;
  }

  return ratedMoviesHistory.value.filter(({ movie, ratingRecord }) => {
    const haystack = [
      movie.title,
      String(movie.releaseYear),
      movie.overview,
      ...movie.genres,
      ...movie.tags,
      ...movie.characters,
      ...ratingRecord.input.reviewTags,
      ...ratingRecord.input.favoriteCharacters,
      ratingRecord.reviewText,
      ratingRecord.questionText
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ');

    return normalizeHistorySearchValue(haystack).includes(query);
  });
});

const hasActiveSearch = computed(() => normalizedHistorySearchQuery.value.length > 0);
const historyCountLabel = computed(() =>
  hasActiveSearch.value
    ? `${filteredRatedMoviesHistory.value.length}편 찾음`
    : `${ratedMoviesHistory.value.length}편`
);

const readStoredViewMode = (): HistoryViewMode => {
  if (typeof window === 'undefined') {
    return 'list';
  }

  const saved = window.localStorage.getItem(HISTORY_VIEW_MODE_STORAGE_KEY);
  return saved === 'grid' ? 'grid' : 'list';
};

const viewMode = ref<HistoryViewMode>(readStoredViewMode());
const viewModeDescription = computed(() =>
  viewMode.value === 'grid'
    ? '이미지 중심 · 직관적인 구경 및 탐색'
    : '텍스트 중심 · 정확한 정보 읽기 및 선택'
);

watch(
  viewMode,
  (mode) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(HISTORY_VIEW_MODE_STORAGE_KEY, mode);
  },
  { immediate: true }
);
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section class="corner-hard border border-app-line bg-app-panel px-5 py-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm text-app-muted">평가한 영화를 검색해서 바로 수정할 수 있어요.</p>
        </div>
        <span class="text-sm font-medium text-white">{{ historyCountLabel }}</span>
      </div>

      <div v-if="ratedMoviesHistory.length > 0" class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="block flex-1">
          <span class="sr-only">평가기록 검색</span>
          <input
            v-model="historySearchQuery"
            type="search"
            placeholder="영화 제목, 장르, 메모로 검색"
            class="focus-ring h-12 w-full border border-app-line bg-app-panelSoft px-4 text-sm text-white placeholder:text-app-muted"
          />
        </label>

        <div class="flex items-center justify-between gap-3 sm:justify-end">
          <span class="text-xs font-medium text-app-muted">보기 방식</span>
          <div class="corner-pill inline-flex border border-app-line bg-app-panelSoft">
            <button
              type="button"
              class="focus-ring corner-pill px-3 py-1.5 text-sm"
              :class="viewMode === 'list' ? 'bg-app-accent text-white' : 'text-app-muted'"
              @click="viewMode = 'list'"
            >
              목록형
            </button>
            <button
              type="button"
              class="focus-ring corner-pill px-3 py-1.5 text-sm"
              :class="viewMode === 'grid' ? 'bg-app-accent text-white' : 'text-app-muted'"
              @click="viewMode = 'grid'"
            >
              그리드형
            </button>
          </div>
        </div>
      </div>

      <p v-if="ratedMoviesHistory.length > 0" class="mt-3 text-xs font-medium text-app-muted">
        {{ viewModeDescription }}
      </p>

      <p v-if="ratedMoviesHistory.length > 0 && hasActiveSearch" class="mt-2 text-xs text-app-muted">
        {{ `전체 ${ratedMoviesHistory.length}편 중 ${filteredRatedMoviesHistory.length}편이 보여요.` }}
      </p>
    </section>

    <section
      v-if="ratedMoviesHistory.length === 0"
      class="corner-hard border border-app-line bg-app-panel px-5 py-5"
    >
      <p class="text-sm font-medium text-app-accent">아직 평가한 영화가 없어요.</p>
      <p class="mt-2 text-sm leading-6 text-app-muted">몇 편만 고르면 여기서 다시 꺼내볼 수 있어요.</p>
      <RouterLink
        to="/rating"
        class="focus-ring corner-soft mt-5 inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-medium text-white"
      >
        취향분석 하러 가기
      </RouterLink>
    </section>

    <template v-else>
      <p
        v-if="filteredRatedMoviesHistory.length === 0"
        class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-5 text-sm leading-6 text-app-muted"
      >
        검색 결과가 없어요. 영화 제목, 장르, 메모를 다시 확인해 보세요.
      </p>

      <section
        v-else
        :class="viewMode === 'grid' ? 'grid grid-cols-2 items-start gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6' : 'grid gap-3'"
      >
        <RatedMovieHistoryCard
          v-for="(entry, index) in filteredRatedMoviesHistory"
          :key="entry.movie.id"
          :entry="entry"
          :index="index"
          :view-mode="viewMode"
        />
      </section>
    </template>
  </main>
</template>
