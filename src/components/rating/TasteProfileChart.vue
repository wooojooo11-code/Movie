<script setup lang="ts">
import { computed } from 'vue';

import {
  getTasteAnalysisResult,
  type TasteAnalysisRanking
} from '@/services/tasteAnalysisResult';
import type { RatedCatalogMovieRecord } from '@/types/recommendation';

const props = defineProps<{
  entries: readonly RatedCatalogMovieRecord[];
}>();

const result = computed(() => getTasteAnalysisResult(props.entries));
const hasInsights = computed(() => result.value.likedMovieCount > 0);

const graphGroups = computed<
  Array<{
    accentClassName: string;
    items: TasteAnalysisRanking[];
    key: 'genres' | 'actors' | 'directors';
    title: string;
    trackClassName: string;
  }>
>(() => [
  {
    key: 'genres',
    title: '장르',
    items: result.value.genres.slice(0, 3),
    accentClassName: 'bg-[#6759e8]',
    trackClassName: 'bg-[#ebe9ff]'
  },
  {
    key: 'actors',
    title: '배우',
    items: result.value.actors.slice(0, 3),
    accentClassName: 'bg-[#e36954]',
    trackClassName: 'bg-[#ffebe7]'
  },
  {
    key: 'directors',
    title: '감독',
    items: result.value.directors.slice(0, 3),
    accentClassName: 'bg-[#278a80]',
    trackClassName: 'bg-[#e2f5f1]'
  }
]);

const getBarWidth = (percentage: number) => Math.max(0, Math.min(100, percentage));

const tagCloudItems = computed(() => {
  const tags = result.value.tags;
  const fontSizes = [2, 1.58, 1.4, 1.24, 1.12, 1.02, 0.96, 0.9, 0.84, 0.78, 0.74, 0.7];

  return tags.map((tag, index) => {
    return {
      ...tag,
      colorClassName: [
        'text-[#5a4bd8]',
        'text-[#d15d49]',
        'text-[#1f8178]',
        'text-[#173a5e]'
      ][index % 4],
      fontSize: `${fontSizes[index] ?? 0.7}rem`,
      fontWeight: Math.max(560, 800 - index * 22),
      layoutClassName: `taste-tag-${index + 1}`
    };
  });
});
</script>

<template>
  <section
    class="corner-hard border border-app-line bg-app-panel px-4 py-5 sm:px-5"
    aria-labelledby="taste-profile-chart-title"
  >
    <div class="flex items-center justify-between gap-3">
      <h2 id="taste-profile-chart-title" class="text-lg font-semibold text-[#15171c]">
        내 취향 한눈에
      </h2>
      <span
        class="corner-pill shrink-0 bg-app-panelSoft px-2.5 py-1 text-[11px] font-semibold text-app-muted"
      >
        {{ result.analyzedMovieCount }}편 기준
      </span>
    </div>

    <template v-if="hasInsights">
      <div class="mt-5 grid gap-5 sm:grid-cols-3 sm:gap-4">
        <section
          v-for="group in graphGroups"
          :key="group.key"
          :aria-labelledby="`${group.key}-preference-title`"
        >
          <h3
            :id="`${group.key}-preference-title`"
            class="text-xs font-bold tracking-[0.08em] text-app-muted"
          >
            선호 {{ group.title }}
          </h3>

          <ol v-if="group.items.length" class="mt-3 grid gap-3">
            <li v-for="item in group.items" :key="item.name">
              <div class="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span class="truncate font-semibold text-[#15171c]">{{ item.name }}</span>
                <span class="shrink-0 font-medium text-app-muted">{{ item.percentage }}%</span>
              </div>
              <div
                class="h-2 overflow-hidden rounded-full"
                :class="group.trackClassName"
                role="progressbar"
                :aria-label="`${group.title} ${item.name} 선호도`"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="getBarWidth(item.percentage)"
                :aria-valuetext="`선호 비중 ${item.percentage}%`"
              >
                <div
                  class="h-full rounded-full transition-[width] duration-500 ease-out"
                  :class="group.accentClassName"
                  :style="{ width: `${getBarWidth(item.percentage)}%` }"
                />
              </div>
            </li>
          </ol>

          <p v-else class="mt-3 text-xs leading-5 text-app-muted">조금 더 평가하면 보여드릴게요.</p>
        </section>
      </div>

      <section v-if="tagCloudItems.length" class="mt-6 border-t border-app-line pt-5" aria-labelledby="taste-keyword-title">
        <h3 id="taste-keyword-title" class="text-sm font-semibold text-[#15171c]">좋아하는 키워드</h3>
        <div class="mt-3 rounded-2xl bg-app-panelSoft px-3 py-5 text-center sm:px-5">
          <div class="taste-tag-cloud mx-auto max-w-xs">
            <span
              v-for="tag in tagCloudItems"
              :key="tag.name"
              class="taste-tag inline-flex leading-tight"
              :class="[tag.colorClassName, tag.layoutClassName]"
              :style="{ fontSize: tag.fontSize, fontWeight: tag.fontWeight }"
              :aria-label="`${tag.name}, 선호 비중 ${tag.percentage}%`"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="mt-4 rounded-2xl bg-app-panelSoft px-4 py-7 text-center">
      <p class="text-sm font-semibold text-[#15171c]">좋아한 영화가 쌓이면 취향을 보여드릴게요.</p>
      <p class="mt-1 text-xs leading-5 text-app-muted">영화를 평가할수록 장르와 인물, 키워드가 정확해져요.</p>
    </div>
  </section>
</template>

<style scoped>
.taste-tag-cloud {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: repeat(5, minmax(1.65rem, auto));
  min-height: 9.25rem;
}

.taste-tag {
  align-self: center;
  justify-self: center;
  max-width: 100%;
  white-space: nowrap;
}

.taste-tag-1 {
  grid-column: 3 / 6;
  grid-row: 3;
}

.taste-tag-2 {
  grid-column: 2 / 4;
  grid-row: 2;
}

.taste-tag-3 {
  grid-column: 5 / 7;
  grid-row: 2;
}

.taste-tag-4 {
  grid-column: 2 / 4;
  grid-row: 4;
}

.taste-tag-5 {
  grid-column: 5 / 7;
  grid-row: 4;
}

.taste-tag-6 {
  grid-column: 1 / 3;
  grid-row: 3;
}

.taste-tag-7 {
  grid-column: 6 / 8;
  grid-row: 3;
}

.taste-tag-8 {
  grid-column: 1 / 4;
  grid-row: 1;
}

.taste-tag-9 {
  grid-column: 4 / 8;
  grid-row: 1;
}

.taste-tag-10 {
  grid-column: 1 / 3;
  grid-row: 5;
}

.taste-tag-11 {
  grid-column: 3 / 6;
  grid-row: 5;
}

.taste-tag-12 {
  grid-column: 6 / 8;
  grid-row: 5;
}
</style>
