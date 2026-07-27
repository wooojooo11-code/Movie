<script setup lang="ts">
import TitleProgressCard from '@/components/profile/TitleProgressCard.vue';
import type { ProfileTitle } from '@/types/profile';

defineProps<{
  isOwner: boolean;
  open: boolean;
  titles: readonly ProfileTitle[];
}>();

defineEmits<{
  close: [];
  'set-featured': [titleId: string];
  'toggle-displayed': [titleId: string];
}>();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="칭호 보관함">
    <section class="mx-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-app-line bg-app-surface p-5 sm:max-w-xl sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">TITLE COLLECTION</p>
          <h2 class="mt-1 text-xl font-bold text-[#15171c]">칭호 보관함</h2>
        </div>
        <button type="button" class="focus-ring corner-soft size-10 border border-app-line bg-app-panelSoft text-lg text-[#34465b]" aria-label="닫기" @click="$emit('close')">×</button>
      </div>
      <div class="mt-5 space-y-3">
        <TitleProgressCard
          v-for="title in titles"
          :key="title.id"
          :title="title"
          :is-owner="isOwner"
          @set-featured="$emit('set-featured', $event)"
          @toggle-displayed="$emit('toggle-displayed', $event)"
        />
      </div>
    </section>
  </div>
</template>
