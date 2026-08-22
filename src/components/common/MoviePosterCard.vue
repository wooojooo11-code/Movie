<script setup lang="ts">
import { Check, Heart, Play } from 'lucide-vue-next';

import IconButton from '@/components/common/IconButton.vue';

export type PosterMovie = {
  id: string;
  posterAlt: string;
  posterUrl: string;
  title: string;
};

const props = withDefaults(
  defineProps<{
    movie: PosterMovie;
    rank?: number | null;
    rating?: boolean;
    saved?: boolean;
    saving?: boolean;
    score?: number | null;
    size?: 'compact' | 'shelf';
  }>(),
  {
    rank: null,
    rating: false,
    saved: false,
    saving: false,
    score: null,
    size: 'shelf'
  }
);

const emit = defineEmits<{
  open: [];
  rate: [];
  save: [];
  trailer: [];
}>();
</script>

<template>
  <article class="group relative min-w-0" :class="props.size === 'compact' ? 'w-full' : 'w-32 shrink-0 sm:w-40'">
    <button
      type="button"
      class="focus-ring poster-card poster-hover-card block w-full text-left"
      :aria-label="`${props.movie.title} 상세 정보 보기`"
      @click="emit('open')"
    >
      <div class="relative aspect-[2/3] overflow-hidden bg-app-poster">
        <img
          :src="props.movie.posterUrl"
          :alt="props.movie.posterAlt"
          class="poster-hover-image h-full w-full object-cover"
          loading="lazy"
        />
        <span v-if="props.rank !== null" class="poster-badge left-2 top-2">{{ props.rank }}</span>
        <span v-if="props.score !== null" class="poster-badge bottom-2 left-2">{{ Math.round(props.score) }}%</span>
      </div>
    </button>

    <div class="px-0.5" :class="props.size === 'compact' ? 'pt-1.5' : 'pt-2'">
      <h3
        class="line-clamp-1 font-semibold text-[#173a5e]"
        :class="props.size === 'compact' ? 'text-[11px] leading-4 sm:text-xs' : 'text-sm'"
      >
        {{ props.movie.title }}
      </h3>
      <p v-if="props.score !== null && props.size !== 'compact'" class="mt-0.5 text-[11px] text-app-muted">
        취향 일치도 {{ Math.round(props.score) }}%
      </p>
    </div>

    <div class="pointer-events-none absolute inset-x-2 top-2 hidden justify-between gap-1 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 sm:flex">
      <IconButton :icon="Play" label="예고편 재생" size="sm" @click.stop="emit('trailer')" />
      <div class="flex gap-1">
        <IconButton :icon="Heart" :active="props.saved" :disabled="props.saving" :class="props.saved ? 'heart-saved' : ''" :label="props.saved ? '보관함에서 제거' : '보관함에 저장'" size="sm" @click.stop="emit('save')" />
        <IconButton :icon="Check" :disabled="props.rating" label="좋아요로 바로 평가하고 새 추천 받기" size="sm" @click.stop="emit('rate')" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.heart-saved {
  animation: heart-pop 320ms ease-out;
}

@keyframes heart-pop {
  0% { transform: scale(0.8); }
  55% { transform: scale(1.22); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .heart-saved { animation: none; }
}
</style>
