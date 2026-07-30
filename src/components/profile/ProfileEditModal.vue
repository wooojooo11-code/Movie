<script setup lang="ts">
import { ref, watch } from 'vue';

import type { ProfileEditInput, ProfileIdentity, ProfileTitle } from '@/types/profile';

const props = defineProps<{
  open: boolean;
  profile: ProfileIdentity;
  titles: readonly ProfileTitle[];
  saving: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: { displayTitleIds: string[]; featuredTitleId: null | string; profile: ProfileEditInput }];
}>();

const nickname = ref('');
const bio = ref('');
const avatarFile = ref<File | null>(null);
const featuredTitleId = ref<null | string>(null);
const displayTitleIds = ref<string[]>([]);
const validationError = ref('');

const syncDraft = () => {
  nickname.value = props.profile.nickname;
  bio.value = props.profile.bio;
  avatarFile.value = null;
  featuredTitleId.value = props.titles.find((title) => title.isFeatured)?.id ?? null;
  displayTitleIds.value = props.titles.filter((title) => title.isDisplayed).map((title) => title.id);
  validationError.value = '';
};

watch(() => props.open, (open) => {
  if (open) syncDraft();
}, { immediate: true });
watch(() => props.profile, () => {
  if (props.open) syncDraft();
});

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  avatarFile.value = input.files?.[0] ?? null;
};

const toggleDisplayed = (titleId: string) => {
  if (displayTitleIds.value.includes(titleId)) {
    displayTitleIds.value = displayTitleIds.value.filter((id) => id !== titleId);
    return;
  }
  if (displayTitleIds.value.length >= 3) {
    validationError.value = '프로필에 전시할 칭호는 최대 3개입니다.';
    return;
  }
  validationError.value = '';
  displayTitleIds.value = [...displayTitleIds.value, titleId];
};

const submit = () => {
  if (!nickname.value.trim()) {
    validationError.value = '닉네임을 입력해 주세요.';
    return;
  }
  emit('save', {
    profile: { nickname: nickname.value, bio: bio.value, avatarFile: avatarFile.value },
    featuredTitleId: featuredTitleId.value,
    displayTitleIds: displayTitleIds.value
  });
};
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="프로필 수정">
    <section class="mx-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-app-line bg-app-surface p-5 sm:max-w-xl sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-xl font-bold text-[#15171c]">프로필 수정</h2>
        <button type="button" class="focus-ring corner-soft size-10 border border-app-line bg-app-panelSoft text-lg text-[#34465b]" aria-label="닫기" :disabled="saving" @click="$emit('close')">×</button>
      </div>
      <form class="mt-5 space-y-5" @submit.prevent="submit">
        <label class="block text-sm font-semibold text-[#263649]">
          프로필 사진
          <input class="mt-2 block w-full text-sm text-app-muted" type="file" accept="image/*" @change="onFileChange" />
          <span class="mt-1 block text-xs font-normal text-app-muted">이미지 파일만 가능하며 최대 5MB입니다.</span>
        </label>
        <label class="block text-sm font-semibold text-[#263649]">
          닉네임
          <input v-model="nickname" maxlength="40" class="focus-ring corner-soft mt-2 min-h-11 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" />
        </label>
        <label class="block text-sm font-semibold text-[#263649]">
          한줄소개
          <textarea v-model="bio" maxlength="160" rows="3" class="focus-ring corner-soft mt-2 w-full border border-app-line bg-app-panel p-3 text-sm leading-relaxed text-[#15171c]" />
        </label>
        <label class="block text-sm font-semibold text-[#263649]">
          대표 칭호
          <select v-model="featuredTitleId" class="focus-ring corner-soft mt-2 min-h-11 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]">
            <option :value="null">설정하지 않음</option>
            <option v-for="title in titles.filter((title) => title.isEarned)" :key="title.id" :value="title.id">{{ title.icon }} {{ title.name }}</option>
          </select>
        </label>
        <fieldset>
          <legend class="text-sm font-semibold text-[#263649]">프로필 전시 칭호 (최대 3개)</legend>
          <div v-if="titles.some((title) => title.isEarned)" class="mt-2 grid gap-2">
            <label v-for="title in titles.filter((title) => title.isEarned)" :key="title.id" class="corner-soft flex items-center gap-3 border border-app-line bg-app-panelSoft p-3 text-sm text-[#34465b]">
              <input type="checkbox" :checked="displayTitleIds.includes(title.id)" @change="toggleDisplayed(title.id)" />
              <span>{{ title.icon }} {{ title.name }}</span>
            </label>
          </div>
          <p v-else class="mt-2 text-sm text-app-muted">획득한 칭호가 아직 없어요.</p>
        </fieldset>
        <p v-if="validationError" class="corner-soft border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ validationError }}</p>
        <div class="flex justify-end gap-2 border-t border-app-line pt-4">
          <button type="button" class="focus-ring corner-soft min-h-10 border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-[#34465b]" :disabled="saving" @click="$emit('close')">취소</button>
          <button type="submit" class="focus-ring corner-soft min-h-10 border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white disabled:opacity-60" :disabled="saving">{{ saving ? '저장 중…' : '저장하기' }}</button>
        </div>
      </form>
    </section>
  </div>
</template>
