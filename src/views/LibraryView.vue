<script setup lang="ts">
import LibraryMovieCard from '@/components/library/LibraryMovieCard.vue';
import { useLibraryStore } from '@/services/libraryStore';

const libraryStore = useLibraryStore();
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section class="corner-hard border border-app-line bg-app-panel px-5 py-5">
      <p class="text-sm text-app-muted">
        보고 싶거나 다시 꺼내 보고 싶은 영화를 모아둘 수 있어요.
      </p>
    </section>

    <section class="grid gap-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">보관한 영화</h2>
        </div>
        <span class="text-xs font-bold text-app-muted">{{ libraryStore.savedMovies.value.length }}편</span>
      </div>

      <div
        v-if="libraryStore.savedMovies.value.length === 0"
        class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-6 text-sm text-app-muted"
      >
        아직 보관한 영화가 없어요.
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
