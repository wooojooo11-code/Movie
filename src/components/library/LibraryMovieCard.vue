<script setup lang="ts">
import type { ResolvedLibraryMovieRecord } from '@/types/library';

defineProps<{
  item: ResolvedLibraryMovieRecord;
}>();

defineEmits<{
  remove: [movieId: string];
}>();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
</script>

<template>
  <article class="rounded-[18px] border border-app-line bg-app-panel p-3">
    <img
      :src="item.movie.posterUrl"
      :alt="item.movie.posterAlt"
      class="aspect-[4/5] w-full rounded-[12px] border border-app-line object-cover"
      loading="lazy"
    />
    <div class="mt-3">
      <h3 class="line-clamp-2 text-sm font-semibold leading-5 text-white">{{ item.movie.title }}</h3>
      <p class="mt-1 text-xs text-app-muted">
        {{ item.movie.releaseYear }} · {{ item.movie.genres.join(' · ') }}
      </p>
      <p class="mt-1 text-[11px] text-app-muted">보관 {{ formatDate(item.savedAt) }}</p>
    </div>
    <button
      type="button"
      class="focus-ring mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-white/88"
      @click="$emit('remove', item.movie.id)"
    >
      보관 해제
    </button>
  </article>
</template>
