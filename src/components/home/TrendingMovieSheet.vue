<script setup lang="ts">
import type { TrendingMovie } from '@/types/home';

defineProps<{
  movie: TrendingMovie;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end bg-black/70 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section
      class="w-full rounded-[24px] border border-app-line bg-app-panel p-4 shadow-2xl shadow-black/40"
    >
      <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10" />

      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-36 w-[6.5rem] shrink-0 rounded-[18px] object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-bold text-app-accent">현재 인기 영화</p>
              <h3 class="mt-2 text-xl font-extrabold leading-snug text-white">
                {{ movie.title }}
              </h3>
            </div>

            <button
              type="button"
              class="focus-ring inline-flex min-h-9 items-center justify-center rounded-[12px] border border-app-line bg-white/5 px-3 text-xs font-bold text-white"
              @click="$emit('close')"
            >
              닫기
            </button>
          </div>

          <dl class="mt-4 grid gap-2.5 text-sm">
            <div class="flex items-start justify-between gap-4">
              <dt class="shrink-0 font-bold text-app-muted">순위</dt>
              <dd class="text-right font-bold text-white">#{{ movie.rank }}</dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="shrink-0 font-bold text-app-muted">관객 수</dt>
              <dd class="text-right font-bold text-white">{{ movie.audienceLabel }}</dd>
            </div>
            <div class="flex items-start justify-between gap-4">
              <dt class="shrink-0 font-bold text-app-muted">기준</dt>
              <dd class="text-right font-bold leading-5 text-white">{{ movie.sourceLabel }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  </div>
</template>
