<script setup lang="ts">
import { computed, reactive, toRaw, watch } from 'vue';

import MovieSearchInput from '@/components/community/MovieSearchInput.vue';
import {
  COMMUNITY_CATEGORY_LABELS,
  cloneCommunityPostDraft,
  createEmptyCommunityPostDraft,
  isCommunityPostDraftSubmittable,
  type CommunityCategory,
  type CommunityListReference,
  type CommunityPostDraft
} from '@/types/community';

const props = defineProps<{
  open: boolean;
  lists: CommunityListReference[];
  missionChoices?: Array<{ id: string; name: string; badgeLabel: string }>;
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

const addPollOption = () => { draft.pollOptions.push({ optionText: '', movie: null }); };
const removePollOption = (index: number) => { if (draft.pollOptions.length > 2) draft.pollOptions.splice(index, 1); };
const selectMission = (event: Event) => {
  const selected = props.missionChoices?.find((mission) => mission.id === (event.target as HTMLSelectElement).value);
  if (selected) {
    draft.mission.id = selected.id;
    draft.mission.name = selected.name;
    draft.mission.badgeLabel = selected.badgeLabel;
  }
};
// reactive 프록시는 그대로 외부로 넘기지 않고 도메인 복사본으로 전환합니다.
const submit = () => { if (canSubmit.value && !props.submitting) emit('submit', cloneCommunityPostDraft(toRaw(draft))); };
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-end bg-black/30 p-0 sm:items-center sm:p-6">
    <section class="corner-hard max-h-[92dvh] w-full overflow-y-auto border border-app-line bg-app-panel p-4 sm:corner-soft sm:mx-auto sm:max-w-xl sm:p-5" role="dialog" aria-modal="true" aria-labelledby="create-post-title">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-app-accent">WRITE</p>
          <h2 id="create-post-title" class="mt-1 text-lg font-semibold text-[#15171c]">게시글 작성</h2>
        </div>
        <button type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-xs text-[#15171c]" @click="$emit('close')">닫기</button>
      </div>

      <p v-if="errorMessage" class="corner-soft mt-4 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]" role="alert">{{ errorMessage }}</p>

      <form class="mt-5 grid gap-4" @submit.prevent="submit">
        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-app-muted">게시글 유형</span>
          <select v-model="draft.category" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]">
            <option v-for="[id, label] in categoryOptions" :key="id" :value="id">{{ label }}</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-app-muted">제목</span>
          <input v-model="draft.title" maxlength="140" required class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="제목을 입력해 주세요" />
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-app-muted">내용</span>
          <textarea v-model="draft.content" rows="5" maxlength="5000" class="focus-ring corner-soft w-full resize-y border border-app-line bg-app-panel px-3 py-2 text-sm leading-5 text-[#15171c]" placeholder="영화 이야기를 자유롭게 적어보세요" />
        </label>

        <div>
          <MovieSearchInput @select="draft.movie = $event" />
          <div v-if="draft.movie" class="mt-2 flex items-center gap-2 text-xs text-[#174a77]">
            <img :src="draft.movie.posterPath ?? '/app-icon.svg'" alt="" class="h-10 w-7 border border-app-line object-cover" />
            <span>{{ draft.movie.title }}</span>
            <button type="button" class="focus-ring ml-auto underline" @click="draft.movie = null">선택 해제</button>
          </div>
        </div>

        <label v-if="draft.category === 'list_share'" class="block">
          <span class="mb-1 block text-xs font-semibold text-app-muted">공유할 리스트</span>
          <select v-model="draft.listId" required class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]">
            <option :value="null" disabled>리스트를 선택하세요</option>
            <option v-for="list in lists" :key="list.id" :value="list.id">{{ list.title }}</option>
          </select>
          <p v-if="!lists.length" class="mt-2 text-xs text-app-muted">공개로 설정된 내 리스트가 없어요.</p>
        </label>

        <template v-if="draft.category === 'movie_poll'">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-app-muted">투표 질문</span>
            <input v-model="draft.pollQuestion" maxlength="140" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="평생 한 편만 볼 수 있다면?" />
          </label>
          <fieldset class="grid gap-2">
            <legend class="text-xs font-semibold text-app-muted">투표 항목 (2개 이상)</legend>
            <!-- 빈 추가 항목은 서버 전송 전에 제외하므로 등록을 막지 않습니다. -->
            <div v-for="(option, index) in draft.pollOptions" :key="index" class="flex gap-2">
              <input v-model="option.optionText" maxlength="120" class="focus-ring corner-soft min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" :placeholder="`항목 ${index + 1}`" />
              <button v-if="draft.pollOptions.length > 2" type="button" class="focus-ring corner-soft border border-app-line px-3 text-xs text-app-muted" @click="removePollOption(index)">삭제</button>
            </div>
            <button type="button" class="focus-ring w-fit text-xs font-semibold text-[#174a77] underline" @click="addPollOption">항목 추가</button>
          </fieldset>
        </template>

        <template v-if="draft.category === 'mission_proof'">
          <label v-if="missionChoices?.length" class="block">
            <span class="mb-1 block text-xs font-semibold text-app-muted">기존 미션에서 선택</span>
            <select class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" @change="selectMission">
              <option value="">직접 입력</option>
              <option v-for="mission in missionChoices" :key="mission.id" :value="mission.id">{{ mission.name }}</option>
            </select>
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-app-muted">완료한 미션 이름</span>
            <input v-model="draft.mission.name" required class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="예: 액션 영화 3편 감상" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-app-muted">짧은 감상</span>
            <textarea v-model="draft.mission.reflection" rows="3" class="focus-ring corner-soft w-full border border-app-line bg-app-panel px-3 py-2 text-sm text-[#15171c]" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-app-muted">완료 날짜</span>
            <input v-model="draft.mission.completedAt" type="date" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" />
          </label>
        </template>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold text-app-muted">대표 이미지 URL (선택)</span>
          <input v-model="draft.imageUrl" type="url" inputmode="url" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="https://" />
        </label>
        <label class="flex items-center gap-2 text-sm text-[#15171c]">
          <input v-model="draft.hasSpoiler" type="checkbox" class="size-4 border-app-line" />
          스포일러가 포함되어 있어요
        </label>
        <!-- 클릭을 직접 처리해 브라우저 기본 검증 때문에 등록 요청이 묻히지 않게 합니다. -->
        <button type="button" class="focus-ring corner-soft min-h-11 border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white disabled:opacity-50" :disabled="!canSubmit || submitting" @click="submit">{{ submitting ? '등록 중…' : '게시글 등록' }}</button>
      </form>
    </section>
  </div>
</template>
