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
    description: string;
    items: TasteAnalysisRanking[];
    key: 'genres' | 'actors' | 'directors';
    title: string;
  }>
>(() => [
  {
    key: 'genres',
    title: '선호 장르',
    description: '재미있음·관심 있음 선택 기준',
    items: result.value.genres
  },
  {
    key: 'actors',
    title: '선호 배우',
    description: '좋아한 영화의 주요 배우 기준',
    items: result.value.actors
  },
  {
    key: 'directors',
    title: '선호 감독',
    description: '좋아한 영화의 감독 기준',
    items: result.value.directors
  }
]);
</script>

<template>
  <section
    class="corner-hard border border-app-line bg-app-panel px-4 py-5 sm:px-5"
    aria-labelledby="taste-analysis-result-title"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[10px] font-semibold tracking-[0.14em] text-app-accent">TASTE RESULT</p>
        <h2 id="taste-analysis-result-title" class="mt-1 text-xl font-semibold text-[#15171c]">
          나의 영화 취향 그래프
        </h2>
      </div>
      <p class="corner-pill shrink-0 border border-app-line bg-app-panelSoft px-3 py-1.5 text-xs font-semibold text-[#15171c]">
        {{ result.analyzedMovieCount }}편 분석
      </p>
    </div>

    <p v-if="hasInsights" class="mt-3 text-sm leading-6 text-app-muted">
      재미있거나 관심 있다고 고른 {{ result.likedMovieCount }}편의 선택에서 찾은 취향이에요.
    </p>
    <p v-else class="mt-3 text-sm leading-6 text-app-muted">
      재미있음 또는 관심 있음으로 고른 영화가 쌓이면 취향 그래프가 완성돼요.
    </p>

    <div v-if="hasInsights" class="mt-5 grid gap-5 sm:grid-cols-3">
      <section v-for="group in graphGroups" :key="group.key" :aria-labelledby="`${group.key}-graph-title`">
        <div class="flex min-h-11 flex-col justify-end">
          <h3 :id="`${group.key}-graph-title`" class="text-sm font-semibold text-[#15171c]">
            {{ group.title }}
          </h3>
          <p class="mt-1 text-[10px] leading-4 text-app-muted">{{ group.description }}</p>
        </div>

        <ol v-if="group.items.length > 0" class="mt-3 grid gap-3">
          <li v-for="item in group.items" :key="item.name">
            <div class="flex items-center justify-between gap-3 text-xs">
              <span class="min-w-0 truncate font-medium text-[#15171c]">{{ item.name }}</span>
              <span class="shrink-0 text-app-muted">{{ item.count }}편</span>
            </div>
            <div
              class="mt-1.5 h-2 overflow-hidden rounded-full bg-app-panelSoft"
              role="progressbar"
              :aria-label="`${group.title} ${item.name}`"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="item.percentage"
            >
              <div
                class="h-full rounded-full bg-app-accent"
                :style="{ width: `${Math.max(8, item.percentage)}%` }"
              />
            </div>
          </li>
        </ol>
        <p v-else class="mt-3 text-xs leading-5 text-app-muted">
          더 많은 선택이 쌓이면 이 항목도 보여드릴게요.
        </p>
      </section>
    </div>
  </section>
</template>
