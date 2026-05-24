<script setup lang="ts">
import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import type { TrendingMovie } from '@/types/home';

defineProps<{
  movie: TrendingMovie;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end bg-black/72 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section class="w-full rounded-2xl border border-app-line bg-app-panel px-4 py-4 shadow-panel">
      <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/10" />

      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-32 w-[5.5rem] shrink-0 rounded-xl object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">Trending</p>
              <h3 class="mt-1.5 text-lg font-semibold leading-snug text-white">
                {{ movie.title }}
              </h3>
            </div>

            <button
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-3 text-xs font-medium text-white/84"
              @click="$emit('close')"
            >
              닫기
            </button>
          </div>

          <dl class="mt-4 grid gap-2 text-sm">
            <div class="flex items-start justify-between gap-4">
              <dt class="text-app-muted">순위</dt>
              <dd class="font-medium text-white">#{{ movie.rank }}</dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-app-muted">관객 수</dt>
              <dd class="text-right font-medium text-white">{{ movie.audienceLabel }}</dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="text-app-muted">기준</dt>
              <dd class="text-right text-sm text-white/88">{{ movie.sourceLabel }}</dd>
            </div>
          </dl>

          <div class="mt-4">
            <WatchToggleButton :movie-id="movie.id" size="md" full-width />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
