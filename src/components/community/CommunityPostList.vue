<script setup lang="ts">
import { ref } from 'vue';

import CommunityPostCard from '@/components/community/CommunityPostCard.vue';
import type { CommunityPost } from '@/types/community';

defineProps<{
  posts: CommunityPost[];
  likedIds?: ReadonlySet<string>;
  savedIds?: ReadonlySet<string>;
  savedListIds?: ReadonlySet<string>;
  savingSaveIds?: ReadonlySet<string>;
  loading?: boolean;
}>();
defineEmits<{
  like: [post: CommunityPost];
  save: [post: CommunityPost];
  'save-list': [listId: string];
  vote: [payload: { post: CommunityPost; optionId: string }];
  'clear-vote': [post: CommunityPost];
}>();

const postScroller = ref<HTMLElement | null>(null);

// 카드 한 장의 화면 너비만큼 이동해, 항상 게시글 하나만 보이게 합니다.
const scrollPosts = (direction: -1 | 1) => {
  const scroller = postScroller.value;
  if (!scroller) return;
  scroller.scrollBy({ left: direction * scroller.clientWidth, behavior: 'smooth' });
};
</script>

<template>
  <div>
    <div v-if="loading && posts.length === 0" class="corner-soft h-80 w-full animate-pulse border border-app-line bg-app-panelSoft" />

    <template v-else-if="posts.length">
      <div class="relative lg:-mx-6">
        <div ref="postScroller" class="scrollbar-hide flex w-full snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth pb-2 lg:mx-[3.375rem] lg:w-[calc(100%_-_6.75rem)]" aria-label="게시글 가로 피드">
          <CommunityPostCard
            v-for="post in posts"
            :key="post.id"
            class="w-full shrink-0 snap-start"
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

        <button type="button" class="focus-ring absolute left-0 top-[calc(50%_-_110px)] z-10 hidden h-14 w-6 -translate-y-1/2 place-items-center rounded-full border border-app-line bg-app-panel text-2xl font-bold text-[#15171c] shadow-sm transition-colors hover:border-app-accent hover:text-[#174a77] active:scale-95 disabled:cursor-default disabled:opacity-40 lg:grid" :disabled="posts.length < 2" aria-label="이전 게시글" @click="scrollPosts(-1)">←</button>
        <button type="button" class="focus-ring absolute right-0 top-[calc(50%_-_110px)] z-10 hidden h-14 w-6 -translate-y-1/2 place-items-center rounded-full border border-app-line bg-app-panel text-2xl font-bold text-[#15171c] shadow-sm transition-colors hover:border-app-accent hover:text-[#174a77] active:scale-95 disabled:cursor-default disabled:opacity-40 lg:grid" :disabled="posts.length < 2" aria-label="다음 게시글" @click="scrollPosts(1)">→</button>
      </div>
    </template>

    <p v-else class="corner-soft border border-dashed border-app-line px-5 py-12 text-center text-sm leading-6 text-app-muted">
      아직 게시글이 없어요. 첫 번째 영화 이야기를 남겨보세요.
    </p>
  </div>
</template>
