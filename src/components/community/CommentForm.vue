<script setup lang="ts">
import { computed, ref } from 'vue';

import MovieSearchInput from '@/components/community/MovieSearchInput.vue';
import type { CommunityMovieReference } from '@/types/community';

const props = defineProps<{ isAuthenticated: boolean; submitting?: boolean }>();
const emit = defineEmits<{ submit: [payload: { content: string; movie: null | CommunityMovieReference }]; login: [] }>();
const content = ref('');
const selectedMovie = ref<null | CommunityMovieReference>(null);
const canSubmit = computed(() => Boolean(content.value.trim() || selectedMovie.value) && !props.submitting);

const submit = () => {
  if (!props.isAuthenticated) { emit('login'); return; }
  if (!canSubmit.value) return;
  // 영화만 골라도 짧은 기본 문구를 저장해 댓글의 필수 내용 규칙을 만족시킵니다.
  emit('submit', {
    content: content.value.trim() || '다음 영화로 추천합니다.',
    movie: selectedMovie.value ? { ...selectedMovie.value } : null
  });
  content.value = '';
  selectedMovie.value = null;
};
</script>

<template>
  <form class="corner-soft border border-app-line bg-app-panel p-3" @submit.prevent="submit">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-semibold text-[#15171c]">댓글</p>
      <span v-if="selectedMovie" class="text-xs font-semibold text-[#174a77]">다음 영화 추천</span>
    </div>
    <div class="mt-3">
      <MovieSearchInput label="다음 영화 추천 (선택)" placeholder="추천할 영화 제목을 2글자 이상 입력" @select="selectedMovie = $event" />
      <div v-if="selectedMovie" class="mt-2 flex items-center gap-2 border border-app-line bg-app-panelSoft p-2">
        <img :src="selectedMovie.posterPath ?? '/app-icon.svg'" :alt="`${selectedMovie.title} 포스터`" class="h-10 w-7 border border-app-line object-cover" />
        <span class="min-w-0 flex-1 truncate text-xs font-semibold text-[#174a77]">{{ selectedMovie.title }}</span>
        <button type="button" class="focus-ring corner-soft border border-app-line px-2 py-1 text-xs text-app-muted" @click="selectedMovie = null">추천 취소</button>
      </div>
    </div>
    <div class="mt-3 flex gap-2">
      <label class="sr-only" for="community-comment">댓글 또는 추천 이유</label>
      <input id="community-comment" v-model="content" maxlength="1000" class="focus-ring corner-soft min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" :placeholder="selectedMovie ? '왜 다음 영화로 추천하나요? (선택)' : '댓글을 남겨보세요'" />
      <button type="submit" class="focus-ring corner-soft shrink-0 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:opacity-50" :disabled="!canSubmit">{{ selectedMovie ? '추천' : '등록' }}</button>
    </div>
  </form>
</template>
