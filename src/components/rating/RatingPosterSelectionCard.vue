<script setup lang="ts">
import type { CatalogMovie } from '@/types/recommendation';

const props = defineProps<{
  canSelectDislike: boolean;
  canSelectLike: boolean;
  movie: CatalogMovie;
  selection: 'dislike' | 'like' | null;
}>();

defineEmits<{
  select: [decision: 'dislike' | 'like'];
}>();

const selectionBadgeLabel = () => {
  if (props.selection === 'like') {
    return '좋아요 선택';
  }

  if (props.selection === 'dislike') {
    return '싫어요 선택';
  }

  return '';
};
</script>

<template>
  <article
    class="corner-hard overflow-hidden border bg-app-panel transition-colors"
    :class="
      selection === 'like'
        ? 'border-app-accent'
        : selection === 'dislike'
          ? 'border-[#c65b5b]'
          : 'border-app-line'
    "
  >
    <div class="relative">
      <img
        :src="movie.posterUrl"
        :alt="movie.posterAlt"
        class="aspect-[4/5] w-full object-cover"
        loading="lazy"
      />
      <span
        v-if="selection"
        class="corner-pill absolute left-2 top-2 inline-flex min-h-8 items-center justify-center px-2 text-xs font-semibold text-white"
        :class="selection === 'like' ? 'bg-app-accent' : 'bg-[#c65b5b]'"
      >
        {{ selectionBadgeLabel() }}
      </span>
    </div>

    <div class="space-y-3 p-3">
      <div>
        <p class="line-clamp-1 text-sm font-semibold text-[#15171c]">{{ movie.title }}</p>
        <p class="mt-1 line-clamp-1 text-xs text-app-muted">
          {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="focus-ring corner-soft min-h-10 border px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            selection === 'like'
              ? 'border-app-accent bg-app-accent text-white'
              : 'border-app-line bg-app-panelSoft text-[#15171c]'
          "
          :disabled="selection !== 'like' && !canSelectLike"
          @click="$emit('select', 'like')"
        >
          좋아요
        </button>

        <button
          type="button"
          class="focus-ring corner-soft min-h-10 border px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            selection === 'dislike'
              ? 'border-[#c65b5b] bg-[#c65b5b] text-white'
              : 'border-app-line bg-app-panelSoft text-[#15171c]'
          "
          :disabled="selection !== 'dislike' && !canSelectDislike"
          @click="$emit('select', 'dislike')"
        >
          싫어요
        </button>
      </div>
    </div>
  </article>
</template>
