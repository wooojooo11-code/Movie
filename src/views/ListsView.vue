<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import LibraryMovieCard from '@/components/library/LibraryMovieCard.vue';
import ListComposerCard from '@/components/lists/ListComposerCard.vue';
import SharedListCard from '@/components/lists/SharedListCard.vue';
import UserListCard from '@/components/lists/UserListCard.vue';
import {
  searchLibraryMovies,
  type LibraryMovieSearchResult,
  type LibraryMovieSearchSort
} from '@/services/libraryMovieSearch';
import { useLibraryStore } from '@/services/libraryStore';
import { useListStore } from '@/services/listStore';
import { checkTitlesForEvent } from '@/services/titleService';
import type { ResolvedLibraryMovieRecord } from '@/types/library';
import type { CatalogMovie } from '@/types/recommendation';

const libraryStore = useLibraryStore();
const listStore = useListStore();
const isComposerOpen = ref(false);
const librarySearchQuery = ref('');
const librarySearchResults = ref<LibraryMovieSearchResult[]>([]);
const librarySearchSortOption = ref<LibraryMovieSearchSort>('title');
const selectedLibraryMovie = ref<null | CatalogMovie>(null);
const isLibraryMovieCardEditorOpen = ref(false);
const libraryRating = ref<null | number>(null);
const libraryReviewText = ref('');
const isSearchingLibraryMovies = ref(false);
let librarySearchRequestId = 0;

const librarySearchSortOptions: ReadonlyArray<{ label: string; value: LibraryMovieSearchSort }> = [
  { label: '배우순', value: 'actor' },
  { label: '감독순', value: 'director' },
  { label: '제목순', value: 'title' },
  { label: '최신순', value: 'latest' },
  { label: '평점순', value: 'rating' }
];

const LIST_SORT_STORAGE_KEY = 'movielist:lists-sort-option';
const listSortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '날짜순', value: 'date' },
  { label: '이름순', value: 'name' },
  { label: '평점수', value: 'rating_count' },
  { label: '저장수', value: 'save_count' }
] as const;

type ListSortOption = (typeof listSortOptions)[number]['value'];

const isListSortOption = (value: string): value is ListSortOption =>
  listSortOptions.some((option) => option.value === value);

const getInitialListSortOption = (): ListSortOption => {
  if (typeof window === 'undefined') {
    return 'latest';
  }

  const saved = window.localStorage.getItem(LIST_SORT_STORAGE_KEY);
  return saved && isListSortOption(saved) ? saved : 'latest';
};

const listSortOption = ref<ListSortOption>(getInitialListSortOption());

if (typeof window !== 'undefined') {
  watch(listSortOption, (value) => {
    window.localStorage.setItem(LIST_SORT_STORAGE_KEY, value);
  });
}

const compareText = (left: string, right: string) => left.localeCompare(right, 'ko-KR');
const getTimeValue = (value: string) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const sortLists = <T extends { title: string }>(
  lists: readonly T[],
  option: ListSortOption,
  controls: {
    getRatingCount: (list: T) => number;
    getSaveCount: (list: T) => number;
    getUpdatedAt: (list: T) => string;
  }
) =>
  [...lists].sort((left, right) => {
    const leftUpdatedAt = getTimeValue(controls.getUpdatedAt(left));
    const rightUpdatedAt = getTimeValue(controls.getUpdatedAt(right));

    if (option === 'latest') {
      return rightUpdatedAt - leftUpdatedAt || compareText(left.title, right.title);
    }

    if (option === 'date') {
      return leftUpdatedAt - rightUpdatedAt || compareText(left.title, right.title);
    }

    if (option === 'name') {
      return compareText(left.title, right.title) || rightUpdatedAt - leftUpdatedAt;
    }

    if (option === 'rating_count') {
      return (
        controls.getRatingCount(right) - controls.getRatingCount(left) ||
        rightUpdatedAt - leftUpdatedAt ||
        compareText(left.title, right.title)
      );
    }

    return (
      controls.getSaveCount(right) - controls.getSaveCount(left) ||
      rightUpdatedAt - leftUpdatedAt ||
      compareText(left.title, right.title)
    );
  });

const sortedMyLists = computed(() =>
  sortLists(listStore.myLists.value, listSortOption.value, {
    getUpdatedAt: (list) => list.updatedAt,
    getRatingCount: (list) => list.ratingCount,
    getSaveCount: (list) => list.saveCount
  })
);

const sortedSharedLists = computed(() =>
  sortLists(listStore.sharedLists.value, listSortOption.value, {
    getUpdatedAt: (list) => list.updatedAt,
    getRatingCount: (list) => list.ratingCount + (list.viewerRating !== null ? 1 : 0),
    getSaveCount: (list) => list.displaySaveCount
  })
);

const similarTasteRecommendedLists = computed(() => listStore.similarTasteRecommendedLists.value);

const searchListCards = computed(() =>
  listStore.state.listResults.map((result) => ({
    ...result,
    movieTitles: listStore
      .resolveMoviePreviews(result.list.movieIds)
      .slice(0, 3)
      .map((movie) => movie.title)
  }))
);

const openCreateComposer = () => {
  listStore.resetDraft();
  listStore.resetMovieSearchState();
  isComposerOpen.value = true;
};

const openEditComposer = (listId: string) => {
  listStore.editUserList(listId);
  listStore.resetMovieSearchState();
  isComposerOpen.value = true;
};

const closeComposer = () => {
  listStore.resetDraft();
  listStore.resetMovieSearchState();
  isComposerOpen.value = false;
};

const handleSaveDraft = async () => {
  const didSave = await listStore.saveDraft();

  if (didSave) {
    isComposerOpen.value = false;
    void checkTitlesForEvent('list');
  }
};

const handleResetDraft = () => {
  listStore.resetDraft();
};

const handleListSearchInput = (event: Event) => {
  void listStore.updateListSearchQuery((event.target as HTMLInputElement).value);
};

const librarySearchMatchLabel = (result: LibraryMovieSearchResult) =>
  result.matchedOn
    .map((match) => ({ actor: '배우', director: '감독', title: '영화 제목' })[match])
    .join(' · ');

const resetLibraryMovieEditor = () => {
  selectedLibraryMovie.value = null;
  isLibraryMovieCardEditorOpen.value = false;
  libraryRating.value = null;
  libraryReviewText.value = '';
};

const selectLibrarySearchResult = (result: LibraryMovieSearchResult) => {
  selectedLibraryMovie.value = result.movie;
  isLibraryMovieCardEditorOpen.value = false;
  const savedRecord = libraryStore.savedMovies.value.find((item) => item.movieId === result.movie.id);
  libraryRating.value = savedRecord?.rating ?? null;
  libraryReviewText.value = savedRecord?.reviewText ?? '';
};

const editLibraryMovie = (item: ResolvedLibraryMovieRecord) => {
  selectedLibraryMovie.value = item.movie;
  isLibraryMovieCardEditorOpen.value = true;
  libraryRating.value = item.rating;
  libraryReviewText.value = item.reviewText;
};

const saveLibraryMovie = async () => {
  const movie = selectedLibraryMovie.value;

  if (!movie) {
    return;
  }

  await libraryStore.saveMovieWithDetails(movie.id, {
    rating: libraryRating.value,
    reviewText: libraryReviewText.value
  });
  librarySearchQuery.value = '';
  librarySearchResults.value = [];
  resetLibraryMovieEditor();
};

watch([librarySearchQuery, librarySearchSortOption], async ([query, sort]) => {
  const requestId = ++librarySearchRequestId;
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    librarySearchResults.value = [];
    isSearchingLibraryMovies.value = false;
    return;
  }

  isSearchingLibraryMovies.value = true;

  try {
    const results = await searchLibraryMovies(trimmedQuery, { sort });

    if (requestId === librarySearchRequestId) {
      librarySearchResults.value = results;
    }
  } catch {
    if (requestId === librarySearchRequestId) {
      librarySearchResults.value = [];
    }
  } finally {
    if (requestId === librarySearchRequestId) {
      isSearchingLibraryMovies.value = false;
    }
  }
});

onMounted(() => {
  void listStore.refreshSimilarTasteListRecommendations();
});
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6">
    <div class="flex min-w-0 flex-col gap-6">
        <section class="flex flex-wrap items-center justify-end gap-2">
      <label class="min-w-[11rem] flex-1 sm:max-w-xs">
        <span class="sr-only">리스트 검색</span>
        <input
          :value="listStore.state.listSearchQuery"
          type="search"
          placeholder="리스트 검색"
          class="focus-ring min-h-10 w-full border border-app-line bg-app-panelSoft px-3 text-sm text-white placeholder:text-app-muted"
          @input="handleListSearchInput"
        />
      </label>
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-10 shrink-0 items-center justify-center border border-app-accent bg-app-accent px-2.5 text-xs font-medium text-white"
        @click="openCreateComposer"
      >
        리스트 만들기
      </button>

      <label class="flex shrink-0 items-center text-xs font-medium text-app-muted">
        <select
          v-model="listSortOption"
          class="focus-ring min-h-10 w-[5.1rem] border border-app-line bg-app-panelSoft px-2 text-sm text-white"
        >
          <option v-for="option in listSortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
        </section>

        <section v-if="listStore.state.listSearchQuery.trim()" class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">리스트 검색 결과</h2>
          <p v-if="listStore.state.isSearchingLists" class="mt-1 text-xs text-app-muted">검색 중</p>
        </div>
        <span class="text-xs font-medium text-app-muted">{{ searchListCards.length }}개</span>
      </div>

      <div
        v-if="searchListCards.length > 0"
        class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
      >
        <article
          v-for="result in searchListCards"
          :key="`${result.source}-${result.list.id}`"
          class="corner-hard w-[calc(100vw-2rem)] shrink-0 snap-start border border-app-line bg-app-panel p-4 sm:w-[23rem]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="truncate text-base font-semibold text-white">{{ result.list.title }}</h3>
              <p class="mt-2 text-sm text-app-muted">
                {{ result.list.ownerName }} · 평균 {{ result.list.averageRating.toFixed(1) }} · 저장 {{ result.list.saveCount.toLocaleString('ko-KR') }}
              </p>
            </div>
            <span
              class="corner-pill shrink-0 border px-2.5 py-1 text-[11px] font-semibold"
              :class="result.source === 'mine' ? 'border-app-line bg-app-panelSoft text-app-muted' : 'border-app-accent bg-app-accent text-white'"
            >
              {{ result.source === 'mine' ? '내 리스트' : '공유 리스트' }}
            </span>
          </div>
          <div v-if="result.movieTitles.length > 0" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="movieTitle in result.movieTitles"
              :key="`${result.list.id}-${movieTitle}`"
              class="corner-pill border border-app-line bg-app-panelSoft px-2 py-1 text-[11px] font-medium text-app-muted"
            >
              {{ movieTitle }}
            </span>
          </div>
        </article>
      </div>

      <div
        v-else-if="!listStore.state.isSearchingLists"
        class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-6 text-sm text-app-muted"
      >
        일치하는 리스트가 없어요.
      </div>
        </section>

        <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">내 리스트</h2>
        </div>
        <span class="text-xs font-medium text-app-muted">{{ listStore.myLists.value.length }}개</span>
      </div>

      <div
        v-if="listStore.myLists.value.length > 0"
        class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
      >
        <UserListCard
          v-for="list in sortedMyLists"
          :key="list.id"
          class="w-[calc(100vw-2rem)] shrink-0 snap-start sm:w-[23rem]"
          :list="list"
          :saved-movie-ids="libraryStore.savedMovieIds.value"
          @edit="openEditComposer"
          @delete="listStore.deleteUserList"
          @remove-from-my-lists="listStore.removeFromMyLists"
          @toggle-watch="libraryStore.toggleMovie"
        />
      </div>

      <div
        v-else
        class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-6 text-sm text-app-muted"
      >
        아직 만든 리스트가 없어요.
      </div>
        </section>

        <section id="library" class="grid scroll-mt-32 gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">보관함</h2>
        </div>
        <span class="text-xs font-medium text-app-muted">{{ libraryStore.savedMovies.value.length }}개</span>
      </div>

      <section class="corner-hard border border-app-line bg-app-panel p-4 sm:p-5">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">ADD TO LIBRARY</p>
            <h3 class="mt-1 text-base font-semibold text-white">원하는 영화 보관하기</h3>
          </div>
          <p class="text-xs text-app-muted">영화 제목 · 감독 · 배우 검색</p>
        </div>

        <label class="mt-4 block">
          <span class="sr-only">보관할 영화 검색</span>
          <input
            v-model="librarySearchQuery"
            type="search"
            placeholder="영화 제목, 감독 또는 배우를 입력하세요"
            class="focus-ring min-h-12 w-full border border-app-line bg-app-panelSoft px-4 text-sm text-white placeholder:text-app-muted"
          />
        </label>

        <div v-if="librarySearchQuery.trim()" class="mt-3 flex justify-end">
          <label class="flex items-center gap-2">
            <span class="text-xs font-medium text-app-muted">정렬</span>
            <select
              v-model="librarySearchSortOption"
              class="focus-ring min-h-9 border border-app-line bg-app-panelSoft px-2 text-xs font-semibold text-white"
            >
              <option v-for="option in librarySearchSortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <p v-if="isSearchingLibraryMovies" class="mt-3 text-xs text-app-muted">
          영화 정보를 찾고 있어요.
        </p>

        <div v-else-if="librarySearchResults.length > 0" class="mt-3 grid gap-2">
          <article
            v-for="result in librarySearchResults"
            :key="result.movie.id"
            class="corner-soft flex flex-wrap gap-3 border border-app-line bg-app-panelSoft p-3"
          >
            <img
              :src="result.movie.posterUrl"
              :alt="result.movie.posterAlt"
              class="corner-soft h-20 w-14 shrink-0 border border-app-line object-cover"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <h4 class="truncate text-sm font-semibold text-white">{{ result.movie.title }}</h4>
                  <p class="mt-1 text-xs text-app-muted">
                    {{ result.movie.releaseYear }} · {{ result.movie.genres.join(' · ') }}
                  </p>
                </div>
                <span class="corner-pill border border-app-accent/50 bg-app-accent/10 px-2 py-1 text-[10px] font-semibold text-app-accent">
                  {{ librarySearchMatchLabel(result) }} 일치
                </span>
              </div>
              <p v-if="result.director" class="mt-2 truncate text-xs text-app-muted">
                감독 · {{ result.director }}
              </p>
              <p v-if="result.cast.length > 0" class="mt-1 truncate text-xs text-app-muted">
                배우 · {{ result.cast.slice(0, 3).join(' · ') }}
              </p>
              <button
                type="button"
                class="focus-ring corner-soft mt-3 inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panel px-3 text-xs font-semibold text-white"
                @click="selectLibrarySearchResult(result)"
                >
                  {{ libraryStore.hasMovie(result.movie.id) ? '기록 수정' : '보관하기' }}
                </button>
              </div>

              <section
                v-if="selectedLibraryMovie?.id === result.movie.id"
                class="mt-4 basis-full border-t border-app-line pt-4"
              >
                <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">
                  {{ libraryStore.hasMovie(result.movie.id) ? 'EDIT LIBRARY NOTE' : 'NEW LIBRARY NOTE' }}
                </p>

                <div class="mt-3 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
                  <div class="corner-soft border border-app-line bg-app-panel p-3">
                    <p class="text-xs font-semibold text-white">내 별점</p>
                    <HalfStarRating
                      v-model="libraryRating"
                      class="mt-2"
                      size="sm"
                      hint="선택하지 않아도 보관할 수 있어요"
                      aria-label-prefix="보관함 영화 별점"
                    />
                  </div>

                  <label class="block">
                    <span class="mb-2 block text-xs font-semibold text-white">한 줄평</span>
                    <textarea
                      v-model="libraryReviewText"
                      maxlength="160"
                      rows="3"
                      class="focus-ring w-full resize-none border border-app-line bg-app-panel px-3 py-2.5 text-sm leading-6 text-white placeholder:text-app-muted"
                      placeholder="나중의 나에게 남길 한 줄을 적어보세요. (선택)"
                    ></textarea>
                    <span class="mt-1 block text-right text-[11px] text-app-muted">{{ libraryReviewText.length }} / 160</span>
                  </label>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
                    @click="saveLibraryMovie"
                  >
                    {{ libraryStore.hasMovie(result.movie.id) ? '기록 저장하기' : '보관함에 넣기' }}
                  </button>
                  <button
                    type="button"
                    class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panel px-4 text-sm font-medium text-white"
                    @click="resetLibraryMovieEditor"
                  >
                    취소
                  </button>
                </div>
              </section>
          </article>
        </div>

        <p
          v-else-if="librarySearchQuery.trim()"
          class="corner-soft mt-3 border border-dashed border-app-line bg-app-panelSoft px-3 py-4 text-sm text-app-muted"
        >
          제목, 감독, 배우 이름으로 일치하는 영화를 찾지 못했어요.
        </p>
      </section>

      <section
        v-if="selectedLibraryMovie && isLibraryMovieCardEditorOpen"
        class="corner-hard border border-app-accent bg-app-panel p-4 sm:p-5"
      >
        <div class="flex gap-3">
          <img
            :src="selectedLibraryMovie.posterUrl"
            :alt="selectedLibraryMovie.posterAlt"
            class="corner-soft h-28 w-20 shrink-0 border border-app-line object-cover"
            loading="lazy"
          />
          <div class="min-w-0">
            <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">EDIT LIBRARY NOTE</p>
            <h3 class="mt-1 line-clamp-2 text-lg font-semibold text-white">{{ selectedLibraryMovie.title }}</h3>
            <p class="mt-2 text-sm text-app-muted">
              {{ selectedLibraryMovie.releaseYear }} · {{ selectedLibraryMovie.genres.join(' · ') }}
            </p>
          </div>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
          <div class="corner-soft border border-app-line bg-app-panelSoft p-3">
            <p class="text-xs font-semibold text-white">내 별점</p>
            <HalfStarRating
              v-model="libraryRating"
              class="mt-2"
              size="sm"
              hint="선택하지 않아도 보관할 수 있어요"
              aria-label-prefix="보관함 영화 별점"
            />
          </div>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold text-white">한 줄평</span>
            <textarea
              v-model="libraryReviewText"
              maxlength="160"
              rows="3"
              class="focus-ring w-full resize-none border border-app-line bg-app-panelSoft px-3 py-2.5 text-sm leading-6 text-white placeholder:text-app-muted"
              placeholder="나중의 나에게 남길 한 줄을 적어보세요. (선택)"
            ></textarea>
            <span class="mt-1 block text-right text-[11px] text-app-muted">{{ libraryReviewText.length }} / 160</span>
          </label>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
            @click="saveLibraryMovie"
          >
            기록 저장하기
          </button>
          <button
            type="button"
            class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white"
            @click="resetLibraryMovieEditor"
          >
            취소
          </button>
        </div>
      </section>

      <div
        v-if="libraryStore.savedMovies.value.length === 0"
        class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-6 text-sm text-app-muted"
      >
        아직 보관한 영화가 없어요.
      </div>

      <div v-else class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        <LibraryMovieCard
          v-for="item in libraryStore.savedMovies.value"
          :key="item.movieId"
          class="w-36 shrink-0 snap-start sm:w-40"
          :item="item"
          @edit="editLibraryMovie"
          @remove="libraryStore.removeMovie"
        />
      </div>
        </section>

        <section v-if="similarTasteRecommendedLists.length > 0" class="grid gap-3">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">SIMILAR TASTE</p>
              <h2 class="mt-1 text-lg font-semibold text-white">취향이 닮은 사람의 리스트</h2>
              <p class="mt-1 text-sm text-app-muted">
                좋아한 영화가 겹치는 사용자가 만든 공개 리스트예요.
              </p>
            </div>
            <span class="text-xs font-medium text-app-muted">{{ similarTasteRecommendedLists.length }}개</span>
          </div>

          <div class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            <SharedListCard
              v-for="list in similarTasteRecommendedLists"
              :key="list.id"
              class="w-[calc(100vw-2rem)] shrink-0 snap-start sm:w-[23rem]"
              :list="list"
              :saved-movie-ids="libraryStore.savedMovieIds.value"
              @toggle-save="listStore.toggleSharedListSave"
              @toggle-watch="libraryStore.toggleMovie"
              @rate="({ listId, rating }) => listStore.setSharedListRating(listId, rating)"
            />
          </div>
        </section>

        <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">공유 리스트</h2>
        </div>
        <span class="text-xs font-medium text-app-muted">{{ listStore.sharedLists.value.length }}개</span>
      </div>

      <div class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        <SharedListCard
          v-for="list in sortedSharedLists"
          :key="list.id"
          class="w-[calc(100vw-2rem)] shrink-0 snap-start sm:w-[23rem]"
          :list="list"
          :saved-movie-ids="libraryStore.savedMovieIds.value"
          :show-save-button="list.ownerId !== listStore.state.userId"
          @toggle-save="listStore.toggleSharedListSave"
          @toggle-watch="libraryStore.toggleMovie"
          @rate="({ listId, rating }) => listStore.setSharedListRating(listId, rating)"
        />
      </div>
        </section>
    </div>
  </main>

  <div
    v-if="isComposerOpen"
    class="fixed inset-0 z-40 flex items-center bg-black px-4 py-4"
    @click.self="closeComposer"
  >
    <section
        class="corner-hard mx-auto flex max-h-[84dvh] w-full max-w-[800px] flex-col overflow-hidden border border-app-line bg-app-panel sm:max-h-[calc(100dvh-2rem)]"
    >
      <div class="flex items-center justify-between border-b border-app-line px-3 py-2.5 sm:px-5 sm:py-4">
        <div>
          <h2 class="text-base font-semibold text-white sm:text-lg">
            {{ listStore.state.draft.id ? '리스트 수정' : '새 리스트 만들기' }}
          </h2>
        </div>
        <button
          type="button"
          class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-2.5 text-xs text-white sm:min-h-9 sm:px-3 sm:text-sm"
          @click="closeComposer"
        >
          닫기
        </button>
      </div>

      <div class="min-h-0 overflow-y-auto px-3 py-3 sm:px-5 sm:py-5">
        <ListComposerCard
          :description="listStore.state.draft.description"
          :title="listStore.state.draft.title"
          :is-private="listStore.state.draft.isPrivate"
          :can-share="listStore.canShareDraft.value"
          :share-restriction-reason="listStore.draftShareRestrictionReason.value"
          :movies="listStore.selectedDraftMovies.value"
          :can-save="listStore.canSaveDraft.value"
          :is-editing="Boolean(listStore.state.draft.id)"
          :is-framed="false"
          :search-query="listStore.state.movieSearchQuery"
          :is-searching="listStore.state.isSearchingMovies"
          :movie-results="listStore.state.movieResults"
          :selected-movie-ids="listStore.state.draft.movieIds"
          @update:title="listStore.updateDraftTitle"
          @update:description="listStore.updateDraftDescription"
          @update:search-query="listStore.updateMovieSearchQuery"
          @toggle-private="listStore.toggleDraftPrivacy"
          @remove-movie="listStore.removeMovieFromDraft"
          @add-movie="listStore.addMovieToDraft"
          @save="handleSaveDraft"
          @reset="handleResetDraft"
        />
      </div>
    </section>
  </div>
</template>
