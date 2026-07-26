<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ isAuthenticated: boolean; submitting?: boolean }>();
const emit = defineEmits<{ submit: [content: string]; login: [] }>();
const content = ref('');
const submit = () => {
  if (!props.isAuthenticated) { emit('login'); return; }
  if (!content.value.trim() || props.submitting) return;
  emit('submit', content.value);
  content.value = '';
};
</script>

<template>
  <form class="flex gap-2" @submit.prevent="submit">
    <label class="sr-only" for="community-comment">댓글</label>
    <input id="community-comment" v-model="content" maxlength="1000" class="focus-ring corner-soft min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="댓글을 남겨보세요" />
    <button type="submit" class="focus-ring corner-soft shrink-0 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:opacity-50" :disabled="!content.trim() || submitting">등록</button>
  </form>
</template>
