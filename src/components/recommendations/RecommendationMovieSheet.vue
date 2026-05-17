<script setup lang="ts">
import { computed } from 'vue';

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
  <div class="fixed inset-0 z-40 flex items-end bg-black/70 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section
      class="mx-auto w-full max-w-[18.5rem] rounded-[18px] border border-app-line bg-app-panel p-3 shadow-2xl shadow-black/40"
    >
      <div class="mx-auto mb-2 h-1 w-8 rounded-full bg-white/10" />

      <div class="flex items-start gap-2.5">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-24 w-16 shrink-0 rounded-[10px] object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-[15px] font-extrabold leading-5 text-white">
            {{ movie.title }}
          </h3>
          <p class="mt-1 line-clamp-1 text-[11px] font-medium text-app-muted">
            {{ movie.genres.join(' · ') }}
          </p>

          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in visibleTags"
              :key="tag"
              class="rounded-full bg-white/5 px-1.5 py-1 text-[10px] font-bold text-[#dfe6f2]"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              class="focus-ring inline-flex min-h-9 items-center justify-center rounded-[9px] border border-app-line bg-white/5 px-3 text-[10px] font-bold text-white"
              @click="$emit('close')"
            >
              닫기
            </button>
            <button
              type="button"
              class="app-gradient focus-ring inline-flex min-h-9 items-center justify-center rounded-[9px] px-3 text-[10px] font-bold text-white"
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
