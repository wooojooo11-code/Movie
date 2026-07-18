<script setup lang="ts">
import { computed, type DeepReadonly } from 'vue';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import type {
  MovieSearchResult,
  ResolvedListSearchCard,
  SearchMatchField,
  SearchableCatalogMovie
} from '@/types/lists';

const props = withDefaults(
  defineProps<{
    title: string;
    isPrivate: boolean;
    canShare?: boolean;
    shareRestrictionReason?: null | string;
    movies: readonly DeepReadonly<SearchableCatalogMovie>[];
    canSave: boolean;
    isEditing: boolean;
    searchQuery: string;
    isSearching: boolean;
    movieResults: readonly DeepReadonly<MovieSearchResult>[];
    listResults: readonly DeepReadonly<ResolvedListSearchCard>[];
    selectedMovieIds: readonly string[];
    isFramed?: boolean;
  }>(),
  {
    canShare: true,
    shareRestrictionReason: null,
    isFramed: true
  }
);

const emit = defineEmits<{
  'update:title': [value: string];
  'update:search-query': [value: string];
  'toggle-private': [];
  'remove-movie': [movieId: string];
  'add-movie': [movieId: string];
  save: [];
  reset: [];
}>();

const matchLabelMap: Record<SearchMatchField, string> = {
  title: '제목',
  director: '감독',
  actor: '배우',
  genre: '장르',
  tag: '태그',
  owner: '작성자',
  movie: '포함 영화'
};

const rootClassName = computed(() =>
  props.isFramed ? 'corner-hard border border-app-line bg-app-panel p-4' : ''
);

const handleTitleInput = (event: Event) => {
  emit('update:title', (event.target as HTMLInputElement).value);
};

const handleSearchInput = (event: Event) => {
  emit('update:search-query', (event.target as HTMLInputElement).value);
};

const isMovieSelected = (movieId: string) => props.selectedMovieIds.includes(movieId);
</script>

<template>
  <section :class="rootClassName">
    <div class="flex items-start justify-between gap-3">
      <button
        type="button"
        class="focus-ring corner-pill border px-3 py-1.5 text-xs font-semibold"
        :class="
          isPrivate
            ? 'border-app-line bg-app-panelSoft text-app-muted'
            : 'border-app-accent bg-app-accent text-white'
        "
        :disabled="Boolean(shareRestrictionReason)"
        @click="emit('toggle-private')"
      >
        {{ isPrivate ? '비공유' : '공유' }}
      </button>
    </div>

    <p v-if="shareRestrictionReason" class="mt-2 text-xs text-app-muted">
      {{ shareRestrictionReason }}
    </p>

    <div class="mt-3 border-t border-app-line pt-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-white">영화 찾기</h3>
        </div>
        <span
          v-if="isSearching"
          class="corner-pill border border-app-line bg-app-panelSoft px-2.5 py-1 text-xs font-semibold text-app-muted"
        >
          찾는 중
        </span>
      </div>

      <label class="mt-3 block">
        <span class="sr-only">영화 또는 리스트 검색</span>
        <input
          :value="searchQuery"
          type="search"
          placeholder="영화, 감독, 배우, 리스트 검색"
          class="focus-ring h-10 w-full border border-app-line bg-app-panelSoft px-3 text-sm text-white placeholder:text-app-muted"
          @input="handleSearchInput"
        />
      </label>

      <div v-if="searchQuery.trim()" class="mt-4 grid gap-4">
        <section class="grid gap-3">
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-sm font-semibold text-white">영화</h4>
            <span class="text-xs font-semibold text-app-muted">{{ movieResults.length }}개</span>
          </div>

          <div v-if="movieResults.length > 0" class="grid gap-3">
            <article
              v-for="result in movieResults"
              :key="result.movie.id"
              class="corner-hard flex items-center gap-3 border border-app-line bg-app-panelSoft p-3"
            >
              <img
                :src="result.movie.posterUrl"
                :alt="result.movie.posterAlt"
                class="h-20 w-14 shrink-0 object-cover"
                loading="lazy"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-white">{{ result.movie.title }}</p>
                <p class="mt-1 truncate text-xs text-app-muted">
                  {{ result.movie.director }} · {{ result.movie.cast.join(', ') }}
                </p>
                <div class="mt-2 flex gap-2">
                  <WatchToggleButton :movie-id="result.movie.id" size="sm" />
                  <button
                    type="button"
                    class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border px-3 text-[11px] font-semibold"
                    :class="
                      isMovieSelected(result.movie.id)
                        ? 'border-app-line bg-app-panel text-app-muted'
                        : 'border-app-accent bg-app-accent text-white'
                    "
                    :disabled="isMovieSelected(result.movie.id)"
                    @click="emit('add-movie', result.movie.id)"
                  >
                    {{ isMovieSelected(result.movie.id) ? '담음' : '담기' }}
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div
            v-else
            class="corner-hard border border-dashed border-app-line bg-app-panelSoft px-4 py-5 text-sm text-app-muted"
          >
            맞는 영화가 없어요.
          </div>
        </section>

        <section class="grid gap-3">
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-sm font-semibold text-white">리스트</h4>
            <span class="text-xs font-semibold text-app-muted">{{ listResults.length }}개</span>
          </div>

          <div v-if="listResults.length > 0" class="grid gap-3">
            <article
              v-for="result in listResults"
              :key="`${result.source}-${result.list.id}`"
              class="corner-hard border border-app-line bg-app-panelSoft p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="text-sm font-semibold text-white">{{ result.list.title }}</h4>
                    <span
                      class="corner-pill border px-2.5 py-1 text-[11px] font-semibold"
                      :class="
                        result.source === 'mine'
                          ? 'border-app-line bg-app-panel text-app-muted'
                          : 'border-app-accent bg-app-accent text-white'
                      "
                    >
                      {{ result.source === 'mine' ? '내 리스트' : '공유 리스트' }}
                    </span>
                  </div>
                  <p class="mt-2 text-xs text-app-muted">
                    {{ result.list.ownerName }} · 평균 {{ result.list.averageRating.toFixed(1) }} · 저장
                    {{ result.list.saveCount.toLocaleString('ko-KR') }}
                  </p>
                </div>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="field in result.matchedBy"
                  :key="`${result.list.id}-${field}`"
                  class="corner-pill border border-app-line bg-app-panel px-2 py-1 text-[11px] font-semibold text-app-muted"
                >
                  {{ matchLabelMap[field] }}
                </span>
                <span
                  v-for="movieTitle in result.movieTitles"
                  :key="`${result.list.id}-${movieTitle}`"
                  class="corner-pill border border-app-line bg-app-panel px-2 py-1 text-[11px] font-semibold text-white"
                >
                  {{ movieTitle }}
                </span>
              </div>
            </article>
          </div>

          <div
            v-else
            class="corner-hard border border-dashed border-app-line bg-app-panelSoft px-4 py-5 text-sm text-app-muted"
          >
            맞는 리스트가 없어요.
          </div>
        </section>
      </div>
    </div>

    <div class="mt-3 border-t border-app-line pt-3">
      <label class="block">
        <span class="mb-2 block text-xs font-semibold text-app-muted">리스트 제목</span>
        <input
          :value="title"
          type="text"
          placeholder="비 오는 날 보기 좋은 영화"
          class="focus-ring h-10 w-full border border-app-line bg-app-panelSoft px-3 text-sm text-white placeholder:text-app-muted"
          @input="handleTitleInput"
        />
      </label>

      <div class="mt-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-semibold text-app-muted">담은 영화 {{ movies.length }}개</span>
          <button
            v-if="isEditing || movies.length > 0 || title"
            type="button"
            class="focus-ring corner-soft border border-app-line bg-app-panelSoft px-3 py-1.5 text-xs font-semibold text-app-muted"
            @click="emit('reset')"
          >
            초기화
          </button>
        </div>

        <div v-if="movies.length > 0" class="mt-3 grid gap-3">
          <article
            v-for="movie in movies"
            :key="movie.id"
            class="corner-hard flex items-center gap-3 border border-app-line bg-app-panelSoft p-3"
          >
            <img
              :src="movie.posterUrl"
              :alt="movie.posterAlt"
              class="h-16 w-12 shrink-0 object-cover"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white">{{ movie.title }}</p>
              <p class="mt-1 truncate text-xs text-app-muted">
                {{ movie.genres.join(' · ') }} · {{ movie.releaseYear }}
              </p>
              <div class="mt-3 flex gap-2">
                <WatchToggleButton :movie-id="movie.id" size="sm" />
                <button
                  type="button"
                  class="focus-ring corner-soft border border-app-line bg-app-panel px-3 py-2 text-[11px] font-semibold text-white"
                  @click="emit('remove-movie', movie.id)"
                >
                  삭제
                </button>
              </div>
            </div>
          </article>
        </div>

        <div
          v-else
          class="corner-hard mt-3 border border-dashed border-app-line bg-app-panelSoft px-3 py-4 text-sm text-app-muted"
        >
          아직 담긴 영화가 없습니다.
        </div>
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 w-[5.75rem] shrink-0 items-center justify-center whitespace-nowrap border border-app-accent bg-app-accent px-2 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canSave"
        @click="emit('save')"
      >
        {{ isEditing ? '수정 저장' : '리스트 저장' }}
      </button>
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 py-2.5 text-sm font-semibold text-white"
        @click="emit('reset')"
      >
        새 리스트
      </button>
    </div>
  </section>
</template>
