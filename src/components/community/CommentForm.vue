<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import MovieSearchInput from '@/components/community/MovieSearchInput.vue';
import type { CommunityMovieReference } from '@/types/community';

const props = defineProps<{ isAuthenticated: boolean; submitting?: boolean; submissionId?: number }>();
const emit = defineEmits<{ submit: [payload: { content: string; movie: null | CommunityMovieReference }]; login: [] }>();
const content = ref('');
const selectedMovie = ref<null | CommunityMovieReference>(null);
const isRecommendationOpen = ref(false);

// 일반 댓글과 영화 추천 모두 실제로 작성한 문장이 있어야 등록합니다.
// 영화만 선택했을 때 임시 문구가 댓글로 저장되는 일을 막습니다.
const canSubmit = computed(() => Boolean(content.value.trim()) && !props.submitting);

const toggleRecommendation = () => {
  if (isRecommendationOpen.value) selectedMovie.value = null;
  isRecommendationOpen.value = !isRecommendationOpen.value;
};

const resetDraft = () => {
  content.value = '';
  selectedMovie.value = null;
  isRecommendationOpen.value = false;
};

// 부모 화면이 저장 성공을 알렸을 때만 입력값을 비웁니다.
// 실패한 경우에는 작성 중이던 댓글과 추천 이유를 그대로 남깁니다.
watch(() => props.submissionId, (submissionId, previousId) => {
  if (submissionId && submissionId !== previousId) resetDraft();
});

const submit = () => {
  if (!props.isAuthenticated) { emit('login'); return; }
  if (!canSubmit.value) return;
  emit('submit', {
    content: content.value.trim(),
    movie: selectedMovie.value ? { ...selectedMovie.value } : null
  });
};
</script>

<template>
  <form class="corner-soft border border-app-line bg-app-panel p-3" @submit.prevent="submit">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-semibold text-[#15171c]">댓글 작성</p>
      <button
        type="button"
        class="focus-ring text-xs font-semibold text-[#174a77] underline underline-offset-2"
        @click="toggleRecommendation"
      >
        {{ isRecommendationOpen ? '추천 닫기' : '다음 영화 추천 추가' }}
      </button>
    </div>

    <div v-if="isRecommendationOpen" class="mt-3 border-t border-app-line pt-3">
      <MovieSearchInput label="다음 영화 추천" placeholder="추천할 영화 제목을 2글자 이상 입력" @select="selectedMovie = $event" />
      <div v-if="selectedMovie" class="mt-2 flex items-center gap-2 border border-app-line bg-app-panelSoft p-2">
        <img :src="selectedMovie.posterPath ?? '/app-icon.svg'" :alt="`${selectedMovie.title} 포스터`" class="h-10 w-7 border border-app-line object-cover" />
        <span class="min-w-0 flex-1 truncate text-xs font-semibold text-[#174a77]">{{ selectedMovie.title }}</span>
        <button type="button" class="focus-ring corner-soft border border-app-line px-2 py-1 text-xs text-app-muted" @click="selectedMovie = null">추천 취소</button>
      </div>
    </div>
    <div class="mt-3 flex gap-2">
      <label class="sr-only" for="community-comment">{{ selectedMovie ? '추천 이유' : '댓글 내용' }}</label>
      <input id="community-comment" v-model="content" maxlength="1000" class="focus-ring corner-soft min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" :placeholder="selectedMovie ? '추천 이유를 남겨주세요' : '댓글을 남겨보세요'" />
      <button type="submit" class="focus-ring corner-soft shrink-0 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:opacity-50" :disabled="!canSubmit">{{ selectedMovie ? '추천 등록' : '댓글 등록' }}</button>
    </div>
  </form>
</template>
