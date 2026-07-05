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
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.36)"
    @click.self="$emit('close')"
  >
    <section
      class="corner-hard mx-auto w-full max-w-[23rem] border border-app-line px-4 py-4"
      style="background-color: rgba(255, 255, 255, 0.96)"
    >
      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-44 w-[7.25rem] shrink-0 object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs text-app-muted">인기 영화</p>
              <h3 class="mt-1 text-lg font-semibold leading-snug text-[#15171c]">
                {{ movie.title }}
              </h3>
              <p class="mt-1 text-sm text-app-muted">평점 {{ movie.rating.toFixed(1) }}</p>
            </div>

            <button
              type="button"
              class="focus-ring corner-soft border border-app-line bg-app-panelSoft px-3 py-2 text-xs text-[#15171c]"
              @click="$emit('close')"
            >
              닫기
            </button>
          </div>

          <dl class="mt-4 grid gap-3 text-sm">
            <div>
              <dt class="text-app-muted">장르</dt>
              <dd class="mt-1 leading-5 text-[#15171c]">
                {{ movie.genres.join(' · ') }}
              </dd>
            </div>
            <div>
              <dt class="text-app-muted">출연진</dt>
              <dd class="mt-1 leading-5 text-[#15171c]">
                {{ movie.cast.join(', ') }}
              </dd>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt class="text-app-muted">순위</dt>
              <dd class="text-[#15171c]">#{{ movie.rank }}</dd>
              <dt class="text-app-muted">관객</dt>
              <dd class="text-[#15171c]">{{ movie.audienceLabel }}</dd>
              <dt class="text-app-muted">기준</dt>
              <dd class="text-[#15171c]">{{ movie.sourceLabel }}</dd>
            </div>
          </dl>

        </div>
      </div>

      <div v-if="movie.similarMovies.length > 0" class="mt-5 border-t border-app-line pt-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold text-[#15171c]">비슷한 영화</h4>
          <p class="text-[11px] text-app-muted">함께 보기 좋아요.</p>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <article v-for="similarMovie in movie.similarMovies" :key="similarMovie.id" class="min-w-0">
            <img
              :src="similarMovie.posterUrl"
              :alt="similarMovie.posterAlt"
              class="corner-soft aspect-[4/5] w-full border border-app-line object-cover"
              loading="lazy"
            />
            <p class="mt-2 line-clamp-2 text-[12px] leading-4 text-[#15171c]">
              {{ similarMovie.title }}
            </p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
