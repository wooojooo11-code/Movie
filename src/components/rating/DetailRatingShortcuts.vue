<script setup lang="ts">
import { onMounted, onScopeDispose } from 'vue';

const props = defineProps<{ stars: number | null; canSkip: boolean }>();
const emit = defineEmits<{
  rate: [value: number];
  submit: [];
  skip: [];
}>();

const handleKeydown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="slider"], [role="tablist"]'))) return;
  if (document.querySelector('[role="dialog"], [aria-modal="true"]')) return;
  // 포커스된 버튼의 Enter는 해당 버튼의 기본 동작을 유지합니다.
  if (event.key === 'Enter' && target instanceof HTMLElement && target.closest('button, a')) return;
  const numericRating = /^[1-5]$/.test(event.key) ? Number(event.key) : null;
  const isSkip = event.key.toLowerCase() === 'n' && props.canSkip;
  if (numericRating === null && !['ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key) && !isSkip) return;
  event.preventDefault();
  if (event.repeat) return;
  if (numericRating !== null) emit('rate', numericRating);
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    emit('rate', Math.min(5, Math.max(0.5, (props.stars ?? 0) + (event.key === 'ArrowRight' ? 0.5 : -0.5))));
  } else if (isSkip) emit('skip');
  else emit('submit');
};
onMounted(() => window.addEventListener('keydown', handleKeydown));
onScopeDispose(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-app-muted" aria-label="상세평가 단축키">
    <span class="inline-flex items-center gap-1"><kbd>1–5</kbd> 별점</span>
    <span class="inline-flex items-center gap-1"><kbd>←</kbd><kbd>→</kbd> 0.5점 조절</span>
  </div>
</template>

<style scoped>
kbd {
  display: inline-flex;
  min-width: 1.75rem;
  min-height: 1.75rem;
  align-items: center;
  justify-content: center;
  padding: 0 0.4rem;
  border: 1px solid #cbd5e1;
  border-bottom-width: 3px;
  border-radius: 0.375rem;
  background: #fff;
  color: #173a5e;
  font: inherit;
  font-weight: 600;
}
</style>
