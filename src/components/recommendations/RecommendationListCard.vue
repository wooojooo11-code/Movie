<script setup lang="ts">
import PopularListCard from '@/components/home/PopularListCard.vue';
import type { PopularList } from '@/types/home';
import type { RecommendedCatalogList } from '@/types/recommendation';

defineProps<{
  homeList: PopularList;
  isSaved: boolean;
  list: RecommendedCatalogList;
}>();

defineEmits<{
  open: [];
  openLists: [];
  save: [list: RecommendedCatalogList];
}>();
</script>

<template>
  <article class="grid gap-2">
    <PopularListCard :list="homeList" @open="$emit('open')" />

    <div class="flex flex-wrap gap-2 px-1">
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-8 shrink-0 items-center justify-center border px-2.5 text-xs whitespace-nowrap"
        :class="
          isSaved
            ? 'border-app-accent bg-app-accent text-white'
            : 'border-app-line bg-app-panelSoft text-white'
        "
        @click="$emit('save', list)"
      >
        {{ isSaved ? '저장됨' : '내 리스트에 저장' }}
      </button>
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-8 shrink-0 items-center justify-center border border-app-line bg-app-panelSoft px-2.5 text-xs whitespace-nowrap text-white"
        @click="$emit('openLists')"
      >
        리스트 창으로 가기
      </button>
    </div>
  </article>
</template>
