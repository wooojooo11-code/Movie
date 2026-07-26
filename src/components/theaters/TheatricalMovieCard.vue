<script setup lang="ts">
import type { TheatricalMovie } from '@/types/theaters';

defineProps<{
  movie: TheatricalMovie;
}>();

defineEmits<{
  book: [movie: TheatricalMovie];
}>();

const formatReleaseDate = (value: string | null) => {
  if (!value) {
    return '개봉일 미정';
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }).format(date);
};
</script>

<template>
  <article class="corner-soft grid grid-cols-[5.25rem_1fr] gap-3 border border-app-line bg-app-panel p-3">
    <img
      v-if="movie.posterUrl"
      :src="movie.posterUrl"
      :alt="`${movie.title} 포스터`"
      class="aspect-[2/3] h-[7.875rem] w-[5.25rem] bg-app-poster object-cover"
      loading="lazy"
    />
    <div
      v-else
      class="grid aspect-[2/3] h-[7.875rem] w-[5.25rem] place-items-center bg-app-poster px-2 text-center text-[11px] leading-4 text-app-muted"
    >
      포스터 준비 중
    </div>

    <div class="flex min-w-0 flex-col">
      <p class="text-xs font-medium text-app-accent">{{ formatReleaseDate(movie.releaseDate) }}</p>
      <h3 class="mt-1 line-clamp-2 text-base font-semibold leading-5 text-[#15171c]">{{ movie.title }}</h3>
      <p v-if="movie.genres.length > 0" class="mt-2 line-clamp-1 text-xs text-app-muted">
        {{ movie.genres.join(' · ') }}
      </p>
      <p v-if="movie.overview" class="mt-2 line-clamp-2 text-xs leading-4 text-[#445267]">
        {{ movie.overview }}
      </p>
      <div class="mt-auto pt-3">
        <button
          type="button"
          class="focus-ring corner-soft inline-flex min-h-9 items-center border border-app-accent bg-app-accent px-3 text-xs font-semibold text-white"
          @click="$emit('book', movie)"
        >
          예매하러 가기
        </button>
      </div>
    </div>
  </article>
</template>
