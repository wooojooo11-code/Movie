<script setup lang="ts">
import type { ProfileTitle } from '@/types/profile';

defineProps<{
  isOwner: boolean;
  titles: readonly Pick<ProfileTitle, 'description' | 'icon' | 'id' | 'name'>[];
}>();

defineEmits<{ open: [] }>();
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-5 sm:p-6" aria-labelledby="title-showcase-title">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">TITLE</p>
        <h2 id="title-showcase-title" class="mt-1 text-lg font-bold text-[#15171c]">프로필 칭호</h2>
      </div>
      <button
        type="button"
        class="focus-ring corner-soft min-h-9 border border-app-line bg-app-panelSoft px-3 text-xs font-semibold text-[#34465b]"
        @click="$emit('open')"
      >
        전체 칭호 보기
      </button>
    </div>

    <div v-if="titles.length" class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="title in titles"
        :key="title.id"
        class="corner-pill inline-flex max-w-full items-center gap-1.5 border border-[#ead39a] bg-[#fff9e9] px-3 py-1.5 text-sm font-semibold text-[#6f5515]"
      >
        <span aria-hidden="true">{{ title.icon }}</span>
        <span class="truncate">{{ title.name }}</span>
      </span>
    </div>
    <div v-else class="mt-4">
      <p class="text-sm leading-relaxed text-app-muted">영화 활동을 시작하고 첫 번째 칭호를 획득해보세요.</p>
      <RouterLink
        v-if="isOwner"
        to="/rating"
        class="focus-ring corner-soft mt-3 inline-flex min-h-9 items-center justify-center border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white"
      >
        영화 기록 시작하기
      </RouterLink>
    </div>
  </section>
</template>
