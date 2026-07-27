<script setup lang="ts">
import type { ProfileTitle } from '@/types/profile';

const props = defineProps<{
  isOwner: boolean;
  title: ProfileTitle;
}>();

defineEmits<{
  'set-featured': [titleId: string];
  'toggle-displayed': [titleId: string];
}>();

const progressWidth = () => {
  if (!props.title.conditionValue) return 0;
  return Math.min(100, Math.round((props.title.progress / props.title.conditionValue) * 100));
};
</script>

<template>
  <article class="corner-soft border border-app-line bg-app-panel p-4" :class="{ 'opacity-80': title.isHidden && !title.isEarned }">
    <div class="flex items-start gap-3">
      <span class="grid size-10 shrink-0 place-items-center rounded-full border border-app-line bg-app-panelSoft text-lg" aria-hidden="true">
        {{ title.icon }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-bold text-[#263649]">{{ title.name ?? '숨겨진 칭호' }}</h3>
          <span v-if="title.isEarned" class="corner-pill border border-[#9bcda6] bg-[#edf8ef] px-2 py-0.5 text-[11px] font-bold text-[#24623a]">획득</span>
          <span v-else class="corner-pill border border-app-line bg-app-panelSoft px-2 py-0.5 text-[11px] font-bold text-app-muted">진행 중</span>
        </div>
        <p v-if="title.description" class="mt-1 text-sm leading-relaxed text-app-muted">{{ title.description }}</p>
        <p v-else class="mt-1 text-sm text-app-muted">조건을 달성하면 정체가 공개됩니다.</p>

        <template v-if="!title.isEarned && title.conditionValue">
          <div class="mt-3 flex items-center justify-between gap-3 text-xs text-app-muted">
            <span>현재 진행도</span>
            <span class="font-semibold text-[#34465b]">{{ title.progress }}/{{ title.conditionValue }}</span>
          </div>
          <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e9edf1]" aria-hidden="true">
            <div class="h-full rounded-full bg-app-accent" :style="{ width: `${progressWidth()}%` }" />
          </div>
        </template>
        <p v-else-if="title.earnedAt" class="mt-3 text-xs text-app-muted">획득일 {{ new Date(title.earnedAt).toLocaleDateString('ko-KR') }}</p>
      </div>
    </div>

    <div v-if="isOwner && title.isEarned" class="mt-4 flex flex-wrap gap-2 border-t border-app-line pt-3">
      <button
        type="button"
        class="focus-ring corner-soft min-h-9 border px-3 text-xs font-semibold"
        :class="title.isFeatured ? 'border-[#9bcda6] bg-[#edf8ef] text-[#24623a]' : 'border-app-line bg-app-panelSoft text-[#34465b]'"
        @click="$emit('set-featured', title.id)"
      >
        {{ title.isFeatured ? '대표 칭호' : '대표 칭호로 설정' }}
      </button>
      <button
        type="button"
        class="focus-ring corner-soft min-h-9 border px-3 text-xs font-semibold"
        :class="title.isDisplayed ? 'border-[#9bcda6] bg-[#edf8ef] text-[#24623a]' : 'border-app-line bg-app-panelSoft text-[#34465b]'"
        @click="$emit('toggle-displayed', title.id)"
      >
        {{ title.isDisplayed ? '프로필 전시 중' : '프로필에 전시' }}
      </button>
    </div>
  </article>
</template>
