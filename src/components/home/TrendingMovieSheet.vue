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
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.72)"
    @click.self="$emit('close')"
  >
    <section
      class="w-full border border-app-line px-4 py-4"
      style="background-color: rgba(17, 19, 24, 0.96)"
    >
      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-32 w-[5.5rem] shrink-0 object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs text-app-muted">인기 영화</p>
              <h3 class="mt-1 text-lg font-semibold leading-snug text-white">
                {{ movie.title }}
              </h3>
            </div>

            <button
              type="button"
              class="focus-ring border border-app-line px-3 py-2 text-xs text-white"
              style="background-color: rgba(21, 23, 28, 0.88)"
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
              <dd class="text-right text-sm text-white">{{ movie.sourceLabel }}</dd>
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
