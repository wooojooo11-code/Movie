<script setup lang="ts">
import type { CommunityComment } from '@/types/community';

defineProps<{ comments: CommunityComment[]; currentUserId?: null | string; loading?: boolean }>();
defineEmits<{ remove: [commentId: string] }>();
</script>

<template>
  <div class="grid gap-3">
    <p v-if="loading" class="text-sm text-app-muted">댓글을 불러오는 중…</p>
    <p v-else-if="!comments.length" class="corner-soft border border-dashed border-app-line p-4 text-sm text-app-muted">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
    <article v-for="comment in comments" :key="comment.id" class="border-b border-app-line pb-3 last:border-0">
      <div class="flex items-start gap-2">
        <img v-if="comment.author.avatarUrl" :src="comment.author.avatarUrl" :alt="`${comment.author.nickname} 프로필`" class="size-7 rounded-full border border-app-line object-cover" />
        <span v-else class="grid size-7 place-items-center rounded-full border border-app-accent bg-[#dcecff] text-[10px] font-bold text-[#174a77]">{{ comment.author.nickname.slice(0, 1) }}</span>
        <div class="min-w-0 flex-1"><p class="text-xs font-semibold text-[#15171c]">{{ comment.author.nickname }} <span class="ml-1 font-normal text-app-muted">{{ new Date(comment.createdAt).toLocaleDateString('ko-KR') }}</span></p><p class="mt-1 text-sm leading-5 text-app-muted">{{ comment.content }}</p></div>
        <button v-if="comment.userId === currentUserId" type="button" class="focus-ring text-xs text-app-muted underline" @click="$emit('remove', comment.id)">삭제</button>
      </div>
    </article>
  </div>
</template>
