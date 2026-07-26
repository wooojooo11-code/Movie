<script setup lang="ts">
import { computed } from 'vue';

import { catalogMovies } from '@/data/catalog';
import type { CommunityListReference } from '@/types/community';

const props = defineProps<{ list: CommunityListReference; saved?: boolean }>();
defineEmits<{ save: [listId: string] }>();

const posterUrls = computed(() =>
  props.list.movieIds
    .map((movieId) => catalogMovies.find((movie) => movie.id === movieId)?.posterUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 4)
);
</script>

<template>
  <section class="corner-soft border border-app-line bg-app-panelSoft p-3" aria-label="공유된 영화 리스트">
    <div class="flex gap-2" aria-hidden="true">
      <img
        v-for="(posterUrl, index) in posterUrls"
        :key="`${posterUrl}-${index}`"
        :src="posterUrl"
        alt=""
        class="h-16 w-11 border border-app-line object-cover"
        loading="lazy"
      />
      <div v-for="index in Math.max(0, Math.min(4, list.movieIds.length) - posterUrls.length)" :key="`placeholder-${index}`" class="grid h-16 w-11 place-items-center border border-app-line bg-app-poster text-[10px] text-app-muted">MOVIE</div>
    </div>
    <div class="mt-3 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-[#15171c]">{{ list.title }}</p>
        <p v-if="list.description" class="mt-1 line-clamp-2 text-xs leading-4 text-app-muted">{{ list.description }}</p>
        <p class="mt-2 text-xs text-app-muted">영화 {{ list.movieIds.length }}편 · 저장 {{ list.saveCount }}</p>
      </div>
      <button type="button" class="focus-ring corner-soft shrink-0 border border-app-accent px-3 py-2 text-xs font-semibold text-[#174a77] active:scale-[0.98]" @click="$emit('save', list.id)">
        {{ saved ? '저장됨' : '내 보관함에 저장' }}
      </button>
    </div>
  </section>
</template>
