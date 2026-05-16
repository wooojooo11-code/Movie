<script setup lang="ts">
import { computed } from 'vue';

import ListComposerCard from '@/components/lists/ListComposerCard.vue';
import SharedListCard from '@/components/lists/SharedListCard.vue';
import UserListCard from '@/components/lists/UserListCard.vue';
import { useListStore } from '@/services/listStore';

const listStore = useListStore();

const searchListCards = computed(() =>
  listStore.state.listResults.map((result) => ({
    ...result,
    movieTitles: listStore
      .resolveMoviePreviews(result.list.movieIds)
      .slice(0, 3)
      .map((movie) => movie.title)
  }))
);
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section
      class="rounded-[24px] border border-app-line bg-[radial-gradient(circle_at_top_right,rgba(125,123,255,0.35),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(255,93,143,0.24),transparent_28%),linear-gradient(180deg,#161a24,#10131b)] p-[22px]"
    >
      <p class="text-sm font-bold text-app-accent">나만의 추천 리스트</p>
      <h1 class="mt-2 text-[28px] font-extrabold leading-tight text-white">리스트 만들기</h1>
      <p class="mt-3 text-sm leading-6 text-[#c8d1df]">
        영화와 리스트를 같이 찾고, 고른 영화로 바로 내 리스트를 채워보세요.
      </p>
    </section>

    <ListComposerCard
      :title="listStore.state.draft.title"
      :is-private="listStore.state.draft.isPrivate"
      :movies="listStore.selectedDraftMovies.value"
      :can-save="listStore.canSaveDraft.value"
      :is-editing="Boolean(listStore.state.draft.id)"
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
      @save="listStore.saveDraft"
      @reset="listStore.resetDraft"
    />

    <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-extrabold text-white">내 리스트</h2>
          <p class="mt-1 text-sm text-app-muted">비공유 리스트도 여기서 관리해요.</p>
        </div>
        <span class="text-xs font-bold text-app-muted">{{ listStore.myLists.value.length }}개</span>
      </div>

      <div v-if="listStore.myLists.value.length > 0" class="grid gap-3">
        <UserListCard
          v-for="list in listStore.myLists.value"
          :key="list.id"
          :list="list"
          @edit="listStore.editUserList"
          @delete="listStore.deleteUserList"
        />
      </div>

      <div
        v-else
        class="rounded-[20px] border border-dashed border-app-line bg-white/[0.03] px-4 py-6 text-sm text-app-muted"
      >
        아직 만든 리스트가 없어요
      </div>
    </section>

    <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-extrabold text-white">공유 리스트</h2>
          <p class="mt-1 text-sm text-app-muted">저장하고 평점도 남길 수 있어요.</p>
        </div>
        <span class="text-xs font-bold text-app-muted">{{ listStore.sharedLists.value.length }}개</span>
      </div>

      <div class="grid gap-3">
        <SharedListCard
          v-for="list in listStore.sharedLists.value"
          :key="list.id"
          :list="list"
          @toggle-save="listStore.toggleSharedListSave"
          @rate="({ listId, rating }) => listStore.setSharedListRating(listId, rating)"
        />
      </div>
    </section>
  </main>
</template>
