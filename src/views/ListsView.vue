<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import LibraryMovieCard from '@/components/library/LibraryMovieCard.vue';
import ListComposerCard from '@/components/lists/ListComposerCard.vue';
import PreviewHubPanel from '@/components/lists/PreviewHubPanel.vue';
import SharedListCard from '@/components/lists/SharedListCard.vue';
import UserListCard from '@/components/lists/UserListCard.vue';
import { useLibraryStore } from '@/services/libraryStore';
import { useListStore } from '@/services/listStore';
import { checkTitlesForEvent } from '@/services/titleService';

const libraryStore = useLibraryStore();
const listStore = useListStore();
const isComposerOpen = ref(false);

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

const searchListCards = computed(() =>
  listStore.state.listResults.map((result) => ({
    ...result,
    movieTitles: listStore
      .resolveMoviePreviews(result.list.movieIds)
      .slice(0, 3)
      .map((movie) => movie.title)
  }))
);

const screeningMovies = computed(() => libraryStore.savedMovies.value.map((item) => item.movie));

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
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6">
    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
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
          @remove="libraryStore.removeMovie"
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

      <PreviewHubPanel :movies="screeningMovies" />
    </div>
  </main>

  <div
    v-if="isComposerOpen"
    class="fixed inset-0 z-40 flex items-center bg-black px-4 py-4"
    @click.self="closeComposer"
  >
    <section
      class="corner-hard mx-auto flex max-h-[84dvh] w-full max-w-xl flex-col overflow-hidden border border-app-line bg-app-panel sm:max-h-[calc(100dvh-2rem)]"
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
