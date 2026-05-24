<script setup lang="ts">
import LibraryMovieCard from '@/components/library/LibraryMovieCard.vue';
import { useLibraryStore } from '@/services/libraryStore';

const libraryStore = useLibraryStore();
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section class="rounded-[22px] border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">Library</p>
      <h1 class="mt-2 text-[25px] font-semibold leading-tight text-white">보관함</h1>
      <p class="mt-2 text-sm text-app-muted">나중에 보고 싶은 영화를 모아둘 수 있어요.</p>
    </section>

    <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">보고 싶은 영화</h2>
          <p class="mt-1 text-sm text-app-muted">리스트에서 바로 담아둔 영화예요.</p>
        </div>
        <span class="text-xs font-bold text-app-muted">{{ libraryStore.savedMovies.value.length }}편</span>
      </div>

      <div
        v-if="libraryStore.savedMovies.value.length === 0"
        class="rounded-[18px] border border-dashed border-app-line bg-app-panel px-4 py-6 text-sm text-app-muted"
      >
        아직 담아둔 영화가 없어요.
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <LibraryMovieCard
          v-for="item in libraryStore.savedMovies.value"
          :key="item.movieId"
          :item="item"
          @remove="libraryStore.removeMovie"
        />
      </div>
    </section>
  </main>
</template>
