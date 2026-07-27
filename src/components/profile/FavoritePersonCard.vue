<script setup lang="ts">
import type { ProfileTastePerson } from '@/types/profile';

defineProps<{
  label: string;
  person: null | ProfileTastePerson;
}>();
</script>

<template>
  <article class="corner-soft border border-app-line bg-app-panelSoft p-3">
    <p class="text-xs font-semibold text-app-muted">{{ label }}</p>
    <div v-if="person" class="mt-2 flex items-center gap-3">
      <img
        v-if="person.profileUrl"
        :src="person.profileUrl"
        :alt="`${person.name} 프로필`"
        class="size-10 rounded-full border border-app-line object-cover"
      />
      <span v-else aria-hidden="true" class="grid size-10 place-items-center rounded-full border border-app-line bg-white text-lg">🎞️</span>
      <div class="min-w-0">
        <p class="truncate text-sm font-bold text-[#263649]">{{ person.name }}</p>
        <p class="mt-0.5 text-xs text-app-muted">{{ person.count }}편 감상</p>
      </div>
    </div>
    <p v-else class="mt-2 text-sm text-app-muted">감상 기록이 쌓이면 보여드릴게요.</p>
  </article>
</template>
