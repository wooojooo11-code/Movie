<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue';

import { searchCommunityMovies } from '@/services/community/movieService';
import type { CommunityMovieReference } from '@/types/community';

const props = withDefaults(defineProps<{ label?: string; placeholder?: string }>(), {
  label: '관련 영화 찾기',
  placeholder: '영화 제목을 2글자 이상 입력'
});
const emit = defineEmits<{ select: [movie: CommunityMovieReference] }>();
const query = ref('');
const results = ref<CommunityMovieReference[]>([]);
const loading = ref(false);
const error = ref('');
let debounceId: number | undefined;

const resetResults = () => { results.value = []; error.value = ''; };

watch(query, (value) => {
  window.clearTimeout(debounceId);
  if (value.trim().length < 2) { resetResults(); return; }
  debounceId = window.setTimeout(async () => {
    loading.value = true;
    error.value = '';
    try {
      results.value = searchCommunityMovies(value);
    } catch {
      error.value = '영화 데이터를 검색하지 못했어요.';
    } finally {
      loading.value = false;
    }
  }, 300);
});

const selectMovie = (movie: CommunityMovieReference) => {
  emit('select', movie);
  query.value = '';
  resetResults();
};

onScopeDispose(() => { window.clearTimeout(debounceId); });
</script>

<template>
  <div class="relative">
    <label class="block">
      <span class="mb-1 block text-xs font-semibold text-app-muted">{{ props.label }}</span>
      <input v-model="query" type="search" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" :placeholder="props.placeholder" />
    </label>
    <p v-if="loading" class="mt-2 text-xs text-app-muted">검색 중…</p>
    <p v-else-if="error" class="mt-2 text-xs text-[#a13c3c]">{{ error }}</p>
    <div v-else-if="results.length" class="corner-soft mt-2 max-h-64 overflow-y-auto border border-app-line bg-app-panel p-1">
      <button v-for="movie in results" :key="movie.id" type="button" class="focus-ring flex w-full items-center gap-3 p-2 text-left hover:bg-app-panelSoft" @click="selectMovie(movie)">
        <img :src="movie.posterPath ?? '/app-icon.svg'" :alt="`${movie.title} 포스터`" class="h-14 w-10 border border-app-line object-cover" />
        <span class="min-w-0"><span class="block truncate text-sm font-semibold text-[#15171c]">{{ movie.title }}</span><span class="mt-1 block text-xs text-app-muted">{{ movie.releaseYear ?? '개봉 연도 정보 없음' }}</span></span>
      </button>
    </div>
  </div>
</template>
