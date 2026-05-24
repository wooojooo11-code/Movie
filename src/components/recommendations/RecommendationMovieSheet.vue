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
  <div class="fixed inset-0 z-40 flex items-end bg-black/72 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section class="mx-auto w-full max-w-[18.75rem] rounded-2xl border border-app-line bg-app-panel px-4 py-4 shadow-panel">
      <div class="mx-auto mb-2 h-1 w-8 rounded-full bg-white/10" />

      <div class="flex items-start gap-2.5">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-[5.4rem] w-[3.55rem] shrink-0 rounded-[10px] object-cover"
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
              class="rounded-full bg-app-panelSoft px-1.5 py-1 text-[10px] font-medium text-white/78"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-3 text-[10px] font-medium text-white/88"
              @click="$emit('close')"
            >
              닫기
            </button>
            <WatchToggleButton :movie-id="movie.id" size="sm" />
            <button
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center rounded-lg bg-app-accent px-3 text-[10px] font-semibold text-white"
              @click="$emit('already-seen', movie.id)"
            >
              이미 봄
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
