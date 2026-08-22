<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import { DELETE_ACCOUNT_CONFIRMATION } from '@/services/accountService';

const props = defineProps<{
  accountName: string;
  deleting: boolean;
  errorMessage: string;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [confirmation: string];
}>();

const confirmation = ref('');
const confirmationInput = ref<HTMLInputElement | null>(null);
const canDelete = computed(
  () => confirmation.value.trim() === DELETE_ACCOUNT_CONFIRMATION && !props.deleting
);

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    confirmation.value = '';
    await nextTick();
    confirmationInput.value?.focus();
  }
);

const submit = () => {
  if (canDelete.value) emit('confirm', confirmation.value.trim());
};
</script>

<template>
  <div
    v-if="props.open"
    class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-account-title"
  >
    <section class="w-full max-w-md rounded-2xl border border-[#e2a5a0] bg-white p-5 shadow-2xl sm:max-w-[520px] sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-[0.12em] text-[#b42318]">DANGER ZONE</p>
          <h2 id="delete-account-title" class="mt-1 text-xl font-bold text-[#15171c]">회원 탈퇴</h2>
        </div>
        <button
          type="button"
          class="focus-ring corner-soft size-10 shrink-0 border border-app-line bg-app-panelSoft text-lg text-[#34465b] disabled:opacity-50"
          aria-label="회원 탈퇴 창 닫기"
          :disabled="props.deleting"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <p class="mt-4 text-sm leading-6 text-[#5f6570]">
        <strong class="text-[#15171c]">{{ props.accountName || '현재 계정' }}</strong>의 프로필, 평가 기록,
        보관함, 리스트, 커뮤니티 게시물과 업로드한 프로필 사진이 모두 삭제됩니다.
      </p>
      <p class="mt-2 text-sm font-semibold text-[#b42318]">탈퇴한 계정과 데이터는 복구할 수 없습니다.</p>

      <form class="mt-5" @submit.prevent="submit">
        <label for="delete-account-confirmation" class="block text-sm font-semibold text-[#263649]">
          계속하려면 <span class="text-[#b42318]">{{ DELETE_ACCOUNT_CONFIRMATION }}</span>를 입력해 주세요.
        </label>
        <input
          id="delete-account-confirmation"
          ref="confirmationInput"
          v-model="confirmation"
          type="text"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          class="focus-ring corner-soft mt-2 min-h-11 w-full border border-[#d5a09b] bg-white px-3 text-sm text-[#15171c] placeholder:text-[#9298a1]"
          :placeholder="DELETE_ACCOUNT_CONFIRMATION"
          :disabled="props.deleting"
        />

        <p
          v-if="props.errorMessage"
          class="corner-soft mt-3 border border-[#e2a5a0] bg-[#fff6f5] p-3 text-sm text-[#a13c3c]"
          role="alert"
        >
          {{ props.errorMessage }}
        </p>

        <div class="mt-5 flex flex-col-reverse gap-2 border-t border-app-line pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="focus-ring corner-soft min-h-11 border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-[#34465b] disabled:opacity-50"
            :disabled="props.deleting"
            @click="emit('close')"
          >
            취소
          </button>
          <button
            type="submit"
            class="focus-ring corner-soft min-h-11 border border-[#b42318] bg-[#b42318] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="!canDelete"
          >
            {{ props.deleting ? '삭제 중…' : '계정과 데이터 영구 삭제' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
