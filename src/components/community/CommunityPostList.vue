<script setup lang="ts">
import CommunityPostCard from '@/components/community/CommunityPostCard.vue';
import type { CommunityPost } from '@/types/community';

defineProps<{ posts: CommunityPost[]; likedIds?: ReadonlySet<string>; savedIds?: ReadonlySet<string>; loading?: boolean; hasMore?: boolean }>();
defineEmits<{
  more: [];
  like: [post: CommunityPost];
  save: [post: CommunityPost];
  'save-list': [listId: string];
  vote: [payload: { post: CommunityPost; optionId: string }];
  'clear-vote': [post: CommunityPost];
}>();
</script>

<template>
  <div class="grid gap-3">
    <template v-if="loading && posts.length === 0">
      <div v-for="index in 3" :key="index" class="corner-soft h-52 animate-pulse border border-app-line bg-app-panelSoft" />
    </template>
    <CommunityPostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      :viewer-liked="likedIds?.has(post.id)"
      :viewer-saved="savedIds?.has(post.id)"
      @like="$emit('like', $event)"
      @save="$emit('save', $event)"
      @save-list="$emit('save-list', $event)"
      @vote="$emit('vote', $event)"
      @clear-vote="$emit('clear-vote', $event)"
    />
    <p v-if="!loading && posts.length === 0" class="corner-soft border border-dashed border-app-line p-8 text-center text-sm text-app-muted">아직 게시글이 없어요. 첫 이야기를 남겨보세요.</p>
    <div v-if="hasMore" class="flex justify-center pt-1">
      <button type="button" class="focus-ring corner-soft min-h-10 border border-app-line bg-app-panel px-4 text-sm font-semibold text-[#174a77] disabled:opacity-50" :disabled="loading" @click="$emit('more')">{{ loading ? '불러오는 중…' : '더 보기' }}</button>
    </div>
  </div>
</template>
