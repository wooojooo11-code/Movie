<script setup lang="ts">
import type { RecommendedCatalogMovie } from '@/types/recommendation';

defineProps<{
  movie: RecommendedCatalogMovie;
}>();

defineEmits<{
  close: [];
  'already-seen': [movieId: string];
}>();
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end bg-black/70 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section class="w-full rounded-[24px] border border-app-line bg-app-panel p-4 shadow-2xl shadow-black/40">
      <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10" />

      <div class="flex items-start gap-4">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-32 w-24 shrink-0 rounded-[16px] object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-extrabold leading-snug text-white">{{ movie.title }}</h3>
          <p class="mt-2 text-sm font-medium text-app-muted">{{ movie.genres.join(' · ') }}</p>
          <p class="mt-2 text-xs font-bold text-app-accent">추천 점수 {{ movie.recommendationScore }}</p>

          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="tag in movie.tags"
              :key="tag"
              class="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-[#dfe6f2]"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="focus-ring min-h-11 rounded-[14px] border border-app-line bg-white/5 px-4 text-sm font-bold text-white"
          @click="$emit('close')"
        >
          닫기
        </button>
        <button
          type="button"
          class="app-gradient focus-ring min-h-11 rounded-[14px] px-4 text-sm font-bold text-white"
          @click="$emit('already-seen', movie.id)"
        >
          이미 봄
        </button>
      </div>
    </section>
  </div>
</template>
