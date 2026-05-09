<script setup lang="ts">
import type { RecommendedCatalogList } from '@/types/recommendation';

defineProps<{
  isSaved: boolean;
  list: RecommendedCatalogList;
}>();

defineEmits<{
  openLists: [];
  save: [list: RecommendedCatalogList];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
</script>

<template>
  <article class="rounded-[20px] border border-app-line bg-app-panel px-4 pb-[18px] pt-4">
    <div class="flex items-start justify-between gap-3">
      <h3 class="line-clamp-2 text-base font-bold leading-snug text-white">
        {{ list.title }}
      </h3>
    </div>
    <p class="mt-2 text-sm font-medium text-app-muted">
      저장 {{ formatCount(list.saveCount) }} · 평균 평점 {{ list.averageRating.toFixed(1) }}
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <span
        v-for="title in list.moviePreviewTitles"
        :key="title"
        class="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-[#dfe6f2]"
      >
        {{ title }}
      </span>
    </div>
    <div class="mt-4 flex gap-2">
      <button
        type="button"
        class="focus-ring inline-flex min-h-10 flex-1 items-center justify-center rounded-[14px] border px-4 text-sm font-bold"
        :class="
          isSaved
            ? 'border-app-accent/40 bg-app-accent/10 text-white'
            : 'border-app-line bg-white/5 text-white'
        "
        :disabled="isSaved"
        @click="$emit('save', list)"
      >
        {{ isSaved ? '내 리스트에 저장됨' : '내 리스트에 저장' }}
      </button>
      <button
        type="button"
        class="focus-ring inline-flex min-h-10 items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 text-sm font-bold text-app-muted"
        @click="$emit('openLists')"
      >
        리스트 보기
      </button>
    </div>
  </article>
</template>
