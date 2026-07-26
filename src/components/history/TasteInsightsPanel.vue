<script setup lang="ts">
import { computed } from 'vue';

import { getTasteInsights } from '@/services/tasteInsights';
import type { RatedCatalogMovieRecord } from '@/types/recommendation';

const props = defineProps<{
  entries: readonly RatedCatalogMovieRecord[];
}>();

const insights = computed(() => getTasteInsights(props.entries));
const hasActorInsights = computed(() => insights.value.actors.length > 0);
const hasDirectorInsights = computed(() => insights.value.directors.length > 0);

const formatAverageRating = (rating: null | number) =>
  rating == null ? '별점 없음' : `평균 ${rating.toFixed(1)}`;
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4" aria-labelledby="taste-insights-title">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[10px] font-medium tracking-[0.08em] text-app-muted">TASTE INSIGHT</p>
        <h2 id="taste-insights-title" class="mt-1 text-base font-semibold text-white">좋아하는 배우 · 감독</h2>
      </div>
      <p class="max-w-36 text-right text-[10px] leading-4 text-app-muted">
        좋아요 평가와 상세평가를 바탕으로 계산했어요.
      </p>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <section class="corner-soft border border-app-line bg-app-panelSoft p-3" aria-labelledby="favorite-actors-title">
        <h3 id="favorite-actors-title" class="text-xs font-semibold text-white">좋아하는 배우 TOP 3</h3>
        <ol v-if="hasActorInsights" class="mt-2 grid gap-2">
          <li
            v-for="(actor, index) in insights.actors"
            :key="actor.name"
            class="flex min-w-0 items-center gap-2"
          >
            <span class="grid size-5 shrink-0 place-items-center rounded-full border border-app-line text-[10px] text-app-muted">
              {{ index + 1 }}
            </span>
            <span class="min-w-0 flex-1 truncate text-xs font-medium text-white">{{ actor.name }}</span>
            <span class="shrink-0 text-[10px] text-app-muted">
              {{ actor.count }}회 선택 · {{ formatAverageRating(actor.averageRating) }}
            </span>
          </li>
        </ol>
        <p v-else class="mt-2 text-[11px] leading-5 text-app-muted">
          상세평가에서 좋았던 배우나 역할을 고르면 보여드려요.
        </p>
      </section>

      <section class="corner-soft border border-app-line bg-app-panelSoft p-3" aria-labelledby="favorite-directors-title">
        <h3 id="favorite-directors-title" class="text-xs font-semibold text-white">좋아하는 감독 TOP 3</h3>
        <ol v-if="hasDirectorInsights" class="mt-2 grid gap-2">
          <li
            v-for="(director, index) in insights.directors"
            :key="director.name"
            class="flex min-w-0 items-center gap-2"
          >
            <span class="grid size-5 shrink-0 place-items-center rounded-full border border-app-line text-[10px] text-app-muted">
              {{ index + 1 }}
            </span>
            <span class="min-w-0 flex-1 truncate text-xs font-medium text-white">{{ director.name }}</span>
            <span class="shrink-0 text-[10px] text-app-muted">
              좋아요 {{ director.count }}편 · {{ formatAverageRating(director.averageRating) }}
            </span>
          </li>
        </ol>
        <p v-else class="mt-2 text-[11px] leading-5 text-app-muted">
          좋아요로 평가한 영화가 쌓이면 보여드려요.
        </p>
      </section>
    </div>
  </section>
</template>
