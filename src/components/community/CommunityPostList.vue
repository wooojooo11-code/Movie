<script setup lang="ts">
import CommunityPostCard from '@/components/community/CommunityPostCard.vue';
import type { CommunityPost } from '@/types/community';

defineProps<{
  posts: CommunityPost[];
  likedIds?: ReadonlySet<string>;
  savedIds?: ReadonlySet<string>;
  savedListIds?: ReadonlySet<string>;
  savingSaveIds?: ReadonlySet<string>;
  loading?: boolean;
  hasMore?: boolean;
}>();
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
  <div>
    <div v-if="loading && posts.length === 0" class="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
      <div v-for="index in 3" :key="index" class="corner-soft h-80 w-[19rem] shrink-0 animate-pulse border border-app-line bg-app-panelSoft" />
    </div>

    <div v-else-if="posts.length" class="scrollbar-hide flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-2" aria-label="게시글 가로 피드">
      <CommunityPostCard
        v-for="post in posts"
        :key="post.id"
        class="w-[19rem] shrink-0 snap-start"
        :post="post"
        :viewer-liked="likedIds?.has(post.id)"
        :viewer-saved="savedIds?.has(post.id)"
        :saved-list-ids="savedListIds"
        :saving-save="savingSaveIds?.has(post.id)"
        @like="$emit('like', $event)"
        @save="$emit('save', $event)"
        @save-list="$emit('save-list', $event)"
        @vote="$emit('vote', $event)"
        @clear-vote="$emit('clear-vote', $event)"
      />
    </div>

    <p v-else class="corner-soft border border-dashed border-app-line px-5 py-12 text-center text-sm leading-6 text-app-muted">
      아직 게시글이 없어요. 첫 번째 영화 이야기를 남겨보세요.
    </p>

    <div v-if="hasMore" class="flex justify-center pt-5">
      <button
        type="button"
        class="focus-ring corner-pill min-h-10 border border-app-line bg-app-panel px-5 text-sm font-semibold text-[#15171c] disabled:opacity-50"
        :disabled="loading"
        @click="$emit('more')"
      >
        {{ loading ? '불러오는 중' : '게시글 더 보기' }}
      </button>
    </div>
  </div>
</template>
