<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import RatedMovieHistoryCard from '@/components/history/RatedMovieHistoryCard.vue';
import { useRecommendationStore } from '@/services/recommendationStore';

type HistoryViewMode = 'grid' | 'list';

const HISTORY_VIEW_MODE_STORAGE_KEY = 'movielist:rated-history-view-mode';

const recommendationStore = useRecommendationStore();
const ratedMoviesHistory = computed(() => recommendationStore.ratedMoviesHistory.value);

const readStoredViewMode = (): HistoryViewMode => {
  if (typeof window === 'undefined') {
    return 'list';
  }

  const saved = window.localStorage.getItem(HISTORY_VIEW_MODE_STORAGE_KEY);
  return saved === 'grid' ? 'grid' : 'list';
};

const viewMode = ref<HistoryViewMode>(readStoredViewMode());

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
    <section class="border border-app-line bg-app-panel px-5 py-5">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-[25px] font-semibold leading-tight text-white">평가기록</h1>
          <p class="mt-2 text-sm text-app-muted">평가한 영화의 평가내용을 고칠수 있어요.</p>
        </div>
        <span class="text-sm font-medium text-white">{{ ratedMoviesHistory.length }}편</span>
      </div>
    </section>

    <section
      v-if="ratedMoviesHistory.length === 0"
      class="border border-app-line bg-app-panel px-5 py-5"
    >
      <p class="text-sm font-medium text-app-accent">아직 평가한 영화가 없어요.</p>
      <p class="mt-2 text-sm leading-6 text-app-muted">몇 편만 고르면 여기서 다시 꺼내볼 수 있어요.</p>
      <RouterLink
        to="/rating"
        class="focus-ring mt-5 inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-medium text-white"
      >
        취향분석 하러 가기
      </RouterLink>
    </section>

    <template v-else>
      <section class="border border-app-line bg-app-panel px-4 py-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-white">보기 방식</h2>
          </div>

          <div class="inline-flex border border-app-line bg-app-panelSoft">
            <button
              type="button"
              class="focus-ring px-3 py-1.5 text-sm"
              :class="viewMode === 'list' ? 'bg-app-accent text-white' : 'text-app-muted'"
              @click="viewMode = 'list'"
            >
              목록형
            </button>
            <button
              type="button"
              class="focus-ring px-3 py-1.5 text-sm"
              :class="viewMode === 'grid' ? 'bg-app-accent text-white' : 'text-app-muted'"
              @click="viewMode = 'grid'"
            >
              그리드형
            </button>
          </div>
        </div>
      </section>

      <section :class="viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid gap-3'">
        <RatedMovieHistoryCard
          v-for="entry in ratedMoviesHistory"
          :key="entry.movie.id"
          :entry="entry"
          :view-mode="viewMode"
        />
      </section>
    </template>
  </main>
</template>
