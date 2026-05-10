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
    class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section
      class="rounded-[24px] border border-app-line bg-[radial-gradient(circle_at_top_right,rgba(125,123,255,0.35),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(255,93,143,0.24),transparent_28%),linear-gradient(180deg,#161a24,#10131b)] p-[22px]"
    >
      <p class="text-sm font-bold text-app-accent">
        {{ ratedMoviesHistory.length }}개 저장됨
      </p>
      <h1 class="mt-2 text-[28px] font-extrabold leading-tight text-white">내가 평가한 영화</h1>
      <p class="mt-3 text-sm leading-6 text-[#c8d1df]">
        지금까지 남긴 취향분석 기록을 한 번에 다시 볼 수 있어요.
      </p>
    </section>

    <section
      v-if="ratedMoviesHistory.length === 0"
      class="rounded-[24px] border border-app-line bg-app-panel p-5"
    >
      <p class="text-sm font-bold text-app-accent">아직 저장된 기록이 없어요.</p>
      <h2 class="mt-2 text-xl font-extrabold text-white">영화 몇 편만 골라도 바로 채워져요.</h2>
      <RouterLink
        to="/rating"
        class="app-gradient focus-ring mt-5 inline-flex min-h-12 items-center justify-center rounded-[16px] px-4 text-sm font-extrabold text-white"
      >
        취향분석 하러 가기
      </RouterLink>
    </section>

    <template v-else>
      <section class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-extrabold text-white">보기 방식</h2>
          <p class="mt-1 text-sm text-app-muted">원하는 형태로 바로 바꿔서 볼 수 있어요.</p>
        </div>

        <div class="inline-flex rounded-[14px] border border-app-line bg-white/[0.04] p-1">
          <button
            type="button"
            class="focus-ring rounded-[10px] px-3 py-2 text-sm font-bold transition"
            :class="viewMode === 'list' ? 'bg-white text-app-bg' : 'text-app-muted'"
            @click="viewMode = 'list'"
          >
            목록형
          </button>
          <button
            type="button"
            class="focus-ring rounded-[10px] px-3 py-2 text-sm font-bold transition"
            :class="viewMode === 'grid' ? 'bg-white text-app-bg' : 'text-app-muted'"
            @click="viewMode = 'grid'"
          >
            그리드형
          </button>
        </div>
      </section>

      <section
        :class="
          viewMode === 'grid'
            ? 'grid grid-cols-2 gap-3'
            : 'grid gap-3'
        "
      >
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
