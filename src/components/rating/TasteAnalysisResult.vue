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
    badgeClassName: string;
    description: string;
    items: TasteAnalysisRanking[];
    key: 'genres' | 'actors' | 'directors';
    number: string;
    trackClassName: string;
    title: string;
  }>
>(() => [
  {
    key: 'genres',
    number: '01',
    title: '선호 장르',
    description: '좋아요 평가와 별점을 반영한 비중',
    items: result.value.genres,
    accentClassName: 'bg-[#6155e8]',
    badgeClassName: 'border-[#d9d5ff] bg-[#f1efff] text-[#4b3fc4]',
    trackClassName: 'bg-[#eeecff]'
  },
  {
    key: 'actors',
    number: '02',
    title: '선호 배우',
    description: '좋아한 영화에서 선택한 배우 기준',
    items: result.value.actors,
    accentClassName: 'bg-[#e46b55]',
    badgeClassName: 'border-[#ffd7cf] bg-[#fff1ee] text-[#bd4c39]',
    trackClassName: 'bg-[#ffebe6]'
  },
  {
    key: 'directors',
    number: '03',
    title: '선호 감독',
    description: '좋아한 영화의 감독과 별점 기준',
    items: result.value.directors,
    accentClassName: 'bg-[#258b82]',
    badgeClassName: 'border-[#c6eee8] bg-[#eafaf7] text-[#167167]',
    trackClassName: 'bg-[#e0f6f1]'
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

    <div v-if="hasInsights" class="mt-5 grid gap-3 sm:grid-cols-3">
      <section
        v-for="group in graphGroups"
        :key="group.key"
        class="corner-soft border border-app-line bg-app-panelSoft p-3.5"
        :aria-labelledby="`${group.key}-graph-title`"
      >
        <div class="flex items-start gap-2.5">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full border text-[10px] font-bold"
            :class="group.badgeClassName"
            aria-hidden="true"
          >
            {{ group.number }}
          </span>
          <div class="min-w-0">
            <h3 :id="`${group.key}-graph-title`" class="text-sm font-semibold text-[#15171c]">
              {{ group.title }}
            </h3>
            <p class="mt-0.5 text-[10px] leading-4 text-app-muted">{{ group.description }}</p>
          </div>
        </div>

        <ol v-if="group.items.length > 0" class="mt-4 grid gap-3.5">
          <li v-for="(item, index) in group.items" :key="item.name">
            <div class="flex items-center justify-between gap-3 text-xs">
              <div class="flex min-w-0 items-center gap-2">
                <span class="w-3 shrink-0 text-[10px] font-bold text-app-muted">{{ index + 1 }}</span>
                <span class="truncate font-semibold text-[#15171c]">{{ item.name }}</span>
              </div>
              <span class="shrink-0 font-semibold text-[#15171c]">{{ item.percentage }}%</span>
            </div>
            <div class="mt-2 flex items-center gap-2.5">
              <div
                class="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full"
                :class="group.trackClassName"
                role="progressbar"
                :aria-label="`${group.title} ${item.name}`"
                :aria-valuetext="`${item.count}편, 선호 점수 비중 ${item.percentage}%`"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="item.percentage"
              >
                <div
                  class="h-full rounded-full transition-[width] duration-500 ease-out"
                  :class="group.accentClassName"
                  :style="{ width: `${item.percentage}%` }"
                />
              </div>
              <span class="w-8 shrink-0 text-right text-[10px] font-medium text-app-muted">{{ item.count }}편</span>
            </div>
          </li>
        </ol>
        <p v-else class="mt-4 text-xs leading-5 text-app-muted">
          더 많은 선택이 쌓이면 이 항목도 보여드릴게요.
        </p>
      </section>
    </div>
  </section>
</template>
