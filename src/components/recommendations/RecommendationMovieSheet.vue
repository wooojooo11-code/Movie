<script setup lang="ts">
import { computed } from 'vue';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import type { RecommendedCatalogMovie } from '@/types/recommendation';

const props = defineProps<{
  movie: RecommendedCatalogMovie;
}>();

defineEmits<{
  close: [];
  'already-seen': [movieId: string];
}>();

const visibleTags = computed(() => props.movie.tags.slice(0, 3));
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.72)"
    @click.self="$emit('close')"
  >
    <section
      class="mx-auto w-full max-w-[19.3rem] border border-app-line px-4 py-4"
      style="background-color: rgba(17, 19, 24, 0.96)"
    >
      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-20 w-[3.35rem] shrink-0 object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-[15px] font-semibold leading-5 text-white">
            {{ movie.title }}
          </h3>
          <p class="mt-1 line-clamp-1 text-[11px] text-app-muted">
            {{ movie.genres.join(' · ') }}
          </p>

          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in visibleTags"
              :key="tag"
              class="border border-app-line px-1.5 py-1 text-[10px] text-white"
              style="background-color: rgba(21, 23, 28, 0.88)"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-1.5">
            <WatchToggleButton :movie-id="movie.id" size="sm" />
            <button
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center border border-app-line px-3 text-[10px] text-white"
              style="background-color: rgba(21, 23, 28, 0.88)"
              @click="$emit('already-seen', movie.id)"
            >
              이미 봤어요
            </button>
            <button
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center border border-app-line px-3 text-[10px] text-white"
              style="background-color: rgba(21, 23, 28, 0.88)"
              @click="$emit('close')"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
