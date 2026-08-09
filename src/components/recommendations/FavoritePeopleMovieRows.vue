<script setup lang="ts">
import { computed } from 'vue';

import { movieCreditsById } from '@/data/movieCredits';
import { getTasteInsights, type TastePersonRanking } from '@/services/tasteInsights';
import type { RatedCatalogMovieRecord, RecommendedCatalogMovie } from '@/types/recommendation';

const props = defineProps<{
  entries: readonly RatedCatalogMovieRecord[];
  movies: readonly RecommendedCatalogMovie[];
}>();

const emit = defineEmits<{
  open: [movie: RecommendedCatalogMovie];
}>();

type FavoritePersonMovieRow = {
  kind: 'actor' | 'director';
  movies: RecommendedCatalogMovie[];
  person: TastePersonRanking;
};

const ratedMovieIds = computed(() => new Set(props.entries.map((entry) => entry.movie.id)));
const insights = computed(() => getTasteInsights(props.entries));

const getMoviesForPerson = (person: TastePersonRanking, kind: FavoritePersonMovieRow['kind']) =>
  props.movies
    .filter((movie) => !ratedMovieIds.value.has(movie.id))
    .filter((movie) => {
      const credits = movieCreditsById[movie.id];
      return kind === 'actor' ? credits?.cast.includes(person.name) : credits?.director === person.name;
    })
    .slice(0, 5);

const rows = computed<FavoritePersonMovieRow[]>(() => {
  const actor = insights.value.actors[0];
  const director = insights.value.directors[0];

  return [
    actor
      ? {
          kind: 'actor' as const,
          person: actor,
          movies: getMoviesForPerson(actor, 'actor')
        }
      : null,
    director
      ? {
          kind: 'director' as const,
          person: director,
          movies: getMoviesForPerson(director, 'director')
        }
      : null
  ].filter((row): row is FavoritePersonMovieRow => Boolean(row));
});

const rowLabel = (kind: FavoritePersonMovieRow['kind']) => (kind === 'actor' ? '배우' : '감독');
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4 sm:p-5" aria-labelledby="favorite-people-title">
    <div>
      <div>
        <p class="text-[10px] font-semibold tracking-[0.12em] text-app-accent">PICK FOR YOU</p>
        <h2 id="favorite-people-title" class="mt-1 text-lg font-semibold text-white">좋아하는 사람의 영화</h2>
      </div>
    </div>

    <div v-if="rows.length > 0" class="mt-4 grid gap-4">
      <section v-for="row in rows" :key="row.kind" :aria-labelledby="`${row.kind}-movies-title`">
        <div class="mb-2 flex items-center gap-2">
          <span class="corner-pill border border-app-line bg-app-panelSoft px-2 py-1 text-[10px] font-medium text-app-muted">
            {{ rowLabel(row.kind) }}
          </span>
          <h3 :id="`${row.kind}-movies-title`" class="min-w-0 truncate text-sm font-semibold text-white">
            {{ row.person.name }} 작품
          </h3>
          <span class="ml-auto shrink-0 text-[10px] text-app-muted">
            {{ row.kind === 'actor' ? `${row.person.count}회 선택` : `좋아요 ${row.person.count}편` }}
          </span>
        </div>

        <div v-if="row.movies.length > 0" class="grid grid-cols-5 gap-2">
          <button
            v-for="movie in row.movies"
            :key="movie.id"
            type="button"
            class="focus-ring group min-w-0 text-left"
            :aria-label="`${movie.title} 정보 보기`"
            @click="emit('open', movie)"
          >
            <img
              :src="movie.posterUrl"
              :alt="movie.posterAlt"
              class="corner-soft aspect-[2/3] w-full border border-app-line bg-app-poster object-contain transition duration-200 group-hover:-translate-y-0.5"
              loading="lazy"
            />
            <span class="mt-1 block truncate text-[10px] leading-4 text-white">{{ movie.title }}</span>
          </button>
        </div>
        <p v-else class="corner-soft border border-dashed border-app-line px-3 py-3 text-[11px] leading-5 text-app-muted">
          아직 보지 않은 {{ row.person.name }} 작품을 더 찾고 있어요.
        </p>
      </section>
    </div>

    <p v-else class="mt-4 text-xs leading-5 text-app-muted">
      상세평가에서 좋았던 배우나 역할을 고르고, 좋아요 평가를 남기면 맞춤 작품을 보여드려요.
    </p>
  </section>
</template>
