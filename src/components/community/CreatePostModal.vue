<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next';
import { computed, reactive, toRaw, watch } from 'vue';

import MovieSearchInput from '@/components/community/MovieSearchInput.vue';
import {
  COMMUNITY_CATEGORY_LABELS,
  cloneCommunityPostDraft,
  createEmptyCommunityPostDraft,
  isCommunityPostDraftSubmittable,
  type CommunityCategory,
  type CommunityListReference,
  type CommunityMovieReference,
  type CommunityPostDraft
} from '@/types/community';

const props = defineProps<{
  open: boolean;
  lists: CommunityListReference[];
  submitting?: boolean;
  errorMessage?: string;
}>();
const emit = defineEmits<{ close: []; submit: [draft: CommunityPostDraft] }>();
const draft = reactive<CommunityPostDraft>(createEmptyCommunityPostDraft());

watch(() => props.open, (isOpen) => {
  if (isOpen) Object.assign(draft, createEmptyCommunityPostDraft());
});

const categoryOptions = computed(() => Object.entries(COMMUNITY_CATEGORY_LABELS) as Array<[CommunityCategory, string]>);
const canSubmit = computed(() => isCommunityPostDraftSubmittable(draft));

const addRelatedMovie = (movie: CommunityMovieReference) => {
  if (draft.movies.some((selected) => selected.id === movie.id)) return;
  draft.movies.push({ ...movie });
  // 기존 단일 영화 필드는 이전 게시글 검색·수정 코드와의 호환을 위해 첫 번째 영화만 유지합니다.
  draft.movie = draft.movies[0] ?? null;
};
const removeRelatedMovie = (movieId: string) => {
  draft.movies = draft.movies.filter((movie) => movie.id !== movieId);
  draft.movie = draft.movies[0] ?? null;
};
const addPollOption = () => { draft.pollOptions.push({ optionText: '', movie: null }); };
const removePollOption = (index: number) => { if (draft.pollOptions.length > 2) draft.pollOptions.splice(index, 1); };

// Vue 반응형 객체는 그대로 복제할 수 없으므로, 전송 직전에 일반 객체로 변환합니다.
const submit = () => {
  if (canSubmit.value && !props.submitting) emit('submit', cloneCommunityPostDraft(toRaw(draft)));
};
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center bg-black/30 p-4">
    <section class="corner-soft mx-auto max-h-full w-full max-w-md overflow-y-auto border border-app-line bg-app-panel p-4 sm:max-w-[800px] sm:p-5 lg:max-w-[800px]" role="dialog" aria-modal="true" aria-labelledby="create-post-title">
      <div class="flex items-start justify-between gap-4">
        <div><p class="text-xs font-semibold text-app-accent">WRITE</p><h2 id="create-post-title" class="mt-1 text-lg font-semibold text-[#15171c]">게시글 작성</h2></div>
        <button type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-xs text-[#15171c]" @click="$emit('close')">닫기</button>
      </div>
      <p v-if="errorMessage" class="corner-soft mt-4 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]" role="alert">{{ errorMessage }}</p>

      <form class="mt-5 grid gap-4" @submit.prevent="submit">
        <label class="block"><span class="mb-1 block text-xs font-semibold text-app-muted">게시글 유형</span><select v-model="draft.category" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]"><option v-for="[id, label] in categoryOptions" :key="id" :value="id">{{ label }}</option></select></label>
        <label class="block"><span class="mb-1 block text-xs font-semibold text-app-muted">제목</span><input v-model="draft.title" maxlength="140" required class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="제목을 입력해 주세요" /></label>
        <label class="block"><span class="mb-1 block text-xs font-semibold text-app-muted">내용</span><textarea v-model="draft.content" rows="5" maxlength="5000" class="focus-ring corner-soft w-full resize-y border border-app-line bg-app-panel px-3 py-2 text-sm leading-5 text-[#15171c]" placeholder="영화 이야기를 자유롭게 적어보세요" /></label>

        <div>
          <MovieSearchInput @select="addRelatedMovie" />
          <div v-if="draft.movies.length" class="mt-2 max-h-48 overflow-y-auto pr-1">
            <p class="text-xs font-semibold text-[#174a77]">관련 영화 {{ draft.movies.length }}편</p>
            <div class="mt-2 grid gap-2"><div v-for="movie in draft.movies" :key="movie.id" class="flex items-center gap-2 border border-app-line bg-app-panelSoft p-2 text-xs text-[#174a77]"><img :src="movie.posterPath ?? '/app-icon.svg'" :alt="`${movie.title} 포스터`" class="h-10 w-7 border border-app-line object-cover" /><span class="min-w-0 flex-1 truncate">{{ movie.title }}</span><button type="button" class="focus-ring corner-soft border border-app-line px-2 py-1 text-xs text-app-muted" :aria-label="`${movie.title} 삭제`" @click="removeRelatedMovie(movie.id)">삭제</button></div></div>
          </div>
        </div>

        <label v-if="draft.category === 'list_share'" class="block"><span class="mb-1 block text-xs font-semibold text-app-muted">공유할 리스트</span><select v-model="draft.listId" required class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]"><option :value="null" disabled>리스트를 선택해 주세요</option><option v-for="list in lists" :key="list.id" :value="list.id">{{ list.title }}</option></select><p v-if="!lists.length" class="mt-2 text-xs text-app-muted">공개로 설정한 리스트가 없어요.</p></label>

        <template v-if="draft.category === 'movie_poll'">
          <label class="block"><span class="mb-1 block text-xs font-semibold text-app-muted">투표 질문</span><input v-model="draft.pollQuestion" maxlength="140" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="평생 한 편만 볼 수 있다면?" /></label>
          <fieldset class="grid gap-2"><legend class="text-xs font-semibold text-app-muted">투표 항목 (2개 이상)</legend><div v-for="(option, index) in draft.pollOptions" :key="index" class="flex gap-2"><input v-model="option.optionText" maxlength="120" class="focus-ring corner-soft min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" :placeholder="`항목 ${index + 1}`" /><button v-if="draft.pollOptions.length > 2" type="button" class="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-app-line text-app-muted" :aria-label="`투표 항목 ${index + 1} 삭제`" title="투표 항목 삭제" @click="removePollOption(index)"><Minus :size="18" aria-hidden="true" /></button></div><button type="button" class="focus-ring grid size-10 place-items-center rounded-full border border-app-accent bg-app-accent text-white" aria-label="투표 항목 추가" title="투표 항목 추가" @click="addPollOption"><Plus :size="18" aria-hidden="true" /></button></fieldset>
        </template>

        <label class="block"><span class="mb-1 block text-xs font-semibold text-app-muted">대표 이미지 URL (선택)</span><input v-model="draft.imageUrl" type="url" inputmode="url" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="https://" /></label>
        <label class="flex items-center gap-2 text-sm text-[#15171c]"><input v-model="draft.hasSpoiler" type="checkbox" class="size-4 border-app-line" />스포일러가 포함되어 있어요</label>
        <button type="button" class="focus-ring corner-soft min-h-11 border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white disabled:opacity-50" :disabled="!canSubmit || submitting" @click="submit">{{ submitting ? '등록 중…' : '게시글 등록' }}</button>
      </form>
    </section>
  </div>
</template>
