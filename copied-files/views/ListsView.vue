<script setup lang="ts">
import { computed, ref } from 'vue';

import ListComposerCard from '@/components/lists/ListComposerCard.vue';
import SharedListCard from '@/components/lists/SharedListCard.vue';
import UserListCard from '@/components/lists/UserListCard.vue';
import { useLibraryStore } from '@/services/libraryStore';
import { useListStore } from '@/services/listStore';

const libraryStore = useLibraryStore();
const listStore = useListStore();
const isComposerOpen = ref(false);

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
  isComposerOpen.value = true;
};

const openEditComposer = (listId: string) => {
  listStore.editUserList(listId);
  isComposerOpen.value = true;
};

const closeComposer = () => {
  listStore.resetDraft();
  isComposerOpen.value = false;
};

const handleSaveDraft = async () => {
  const didSave = await listStore.saveDraft();

  if (didSave) {
    isComposerOpen.value = false;
  }
};

const handleResetDraft = () => {
  listStore.resetDraft();
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section class="rounded-[22px] border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">Lists</p>
      <div class="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[25px] font-semibold leading-tight text-white">리스트 만들기</h1>
          <p class="mt-2 text-sm text-app-muted">
            영화를 모으고, 공유하고, 보고 싶은 영화도 같이 담아둘 수 있어요.
          </p>
        </div>

        <button
          type="button"
          class="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-app-accent px-4 text-sm font-semibold text-white"
          @click="openCreateComposer"
        >
          리스트 만들기
        </button>
      </div>
    </section>

    <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">내 리스트</h2>
          <p class="mt-1 text-sm text-app-muted">비공유 리스트도 여기서 같이 관리해요.</p>
        </div>
        <span class="text-xs font-bold text-app-muted">{{ listStore.myLists.value.length }}개</span>
      </div>

      <div v-if="listStore.myLists.value.length > 0" class="grid gap-3">
        <UserListCard
          v-for="list in listStore.myLists.value"
          :key="list.id"
          :list="list"
          :saved-movie-ids="libraryStore.savedMovieIds.value"
          @edit="openEditComposer"
          @delete="listStore.deleteUserList"
          @toggle-watch="libraryStore.toggleMovie"
        />
      </div>

      <div
        v-else
        class="rounded-[18px] border border-dashed border-app-line bg-app-panel px-4 py-6 text-sm text-app-muted"
      >
        아직 만든 리스트가 없어요.
      </div>
    </section>

    <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">공유 리스트</h2>
          <p class="mt-1 text-sm text-app-muted">저장하고 평점을 남길 수 있어요.</p>
        </div>
        <span class="text-xs font-bold text-app-muted">{{ listStore.sharedLists.value.length }}개</span>
      </div>

      <div class="grid gap-3">
        <SharedListCard
          v-for="list in listStore.sharedLists.value"
          :key="list.id"
          :list="list"
          :saved-movie-ids="libraryStore.savedMovieIds.value"
          :show-save-button="list.ownerId !== listStore.state.userId"
          @toggle-save="listStore.toggleSharedListSave"
          @toggle-watch="libraryStore.toggleMovie"
          @rate="({ listId, rating }) => listStore.setSharedListRating(listId, rating)"
        />
      </div>
    </section>
  </main>

  <div
    v-if="isComposerOpen"
    class="fixed inset-0 z-40 flex items-end bg-black/70 px-4 pb-4 pt-8 sm:items-center"
    @click.self="closeComposer"
  >
    <section
      class="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-[24px] border border-app-line bg-[#101319] shadow-panel"
    >
      <div class="flex items-center justify-between border-b border-app-line px-5 py-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">Composer</p>
          <h2 class="mt-1 text-lg font-semibold text-white">
            {{ listStore.state.draft.id ? '리스트 수정' : '새 리스트 만들기' }}
          </h2>
        </div>
        <button
          type="button"
          class="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg border border-app-line bg-white/5 px-3 text-sm font-medium text-white/88"
          @click="closeComposer"
        >
          닫기
        </button>
      </div>

      <div class="overflow-y-auto px-5 py-5">
        <ListComposerCard
          :title="listStore.state.draft.title"
          :is-private="listStore.state.draft.isPrivate"
          :movies="listStore.selectedDraftMovies.value"
          :can-save="listStore.canSaveDraft.value"
          :is-editing="Boolean(listStore.state.draft.id)"
          :is-framed="false"
          :search-query="listStore.state.searchQuery"
          :is-searching="listStore.state.isSearching"
          :movie-results="listStore.state.movieResults"
          :list-results="searchListCards"
          :selected-movie-ids="listStore.state.draft.movieIds"
          @update:title="listStore.updateDraftTitle"
          @update:search-query="listStore.updateSearchQuery"
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
