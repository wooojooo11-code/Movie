<script setup lang="ts">
import type { ProfileTitle } from '@/types/profile';

defineProps<{ title: null | ProfileTitle }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="title" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="새 칭호 획득">
    <section class="w-full max-w-md rounded-2xl border border-[#ead39a] bg-[#fffdf6] p-6 text-center sm:max-w-[800px]">
      <span aria-hidden="true" class="mx-auto grid size-16 place-items-center rounded-full border border-[#ead39a] bg-[#fff4cf] text-3xl">{{ title.icon }}</span>
      <p class="mt-4 text-sm font-semibold text-[#7b621d]">새로운 칭호를 획득했어요!</p>
      <h2 class="mt-1 text-2xl font-bold text-[#3e3315]">{{ title.name }}</h2>
      <p class="mt-3 text-sm leading-relaxed text-[#6f6242]">{{ title.description }}</p>
      <button type="button" class="focus-ring corner-soft mt-6 min-h-10 border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white" @click="$emit('close')">확인</button>
    </section>
  </div>
</template>
