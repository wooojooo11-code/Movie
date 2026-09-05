<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { nextTick, onMounted, onScopeDispose, ref, watch } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import CommunityPostCard from '@/components/community/CommunityPostCard.vue';
import type { CommunityPost } from '@/types/community';

const props = defineProps<{
  posts: CommunityPost[];
  likedIds?: ReadonlySet<string>;
  savedIds?: ReadonlySet<string>;
  savedListIds?: ReadonlySet<string>;
  savingSaveIds?: ReadonlySet<string>;
  loading?: boolean;
  emptyMessage?: string;
}>();
const emit = defineEmits<{
  like: [post: CommunityPost];
  save: [post: CommunityPost];
  'save-list': [listId: string];
  vote: [payload: { post: CommunityPost; optionId: string }];
  'clear-vote': [post: CommunityPost];
}>();

const postScroller = ref<HTMLElement | null>(null);
const canScrollPrevious = ref(false);
const canScrollNext = ref(false);
const activePostIndex = ref(0);

const updateScrollState = () => {
  const scroller = postScroller.value;
  if (!scroller) return;

  const maximumScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  canScrollPrevious.value = scroller.scrollLeft > 2;
  canScrollNext.value = scroller.scrollLeft < maximumScroll - 2;

  const cards = Array.from(scroller.children) as HTMLElement[];
  const firstCardOffset = cards[0]?.offsetLeft ?? 0;
  activePostIndex.value = cards.reduce((closestIndex, card, index) => {
    const closestPosition = cards[closestIndex].offsetLeft - firstCardOffset;
    const currentPosition = card.offsetLeft - firstCardOffset;
    return Math.abs(currentPosition - scroller.scrollLeft) < Math.abs(closestPosition - scroller.scrollLeft)
      ? index
      : closestIndex;
  }, 0);
};

// 카드 한 장의 화면 너비만큼 이동해, 항상 게시글 하나만 보이게 합니다.
const scrollPosts = (direction: -1 | 1) => {
  const scroller = postScroller.value;
  if (!scroller) return;

  const firstCard = scroller.firstElementChild as HTMLElement | null;
  const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
  const distance = (firstCard?.getBoundingClientRect().width ?? scroller.clientWidth) + gap;
  scroller.scrollBy({ left: direction * distance, behavior: 'smooth' });
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;

  const target = event.target;
  if (target instanceof HTMLElement && (
    target.isContentEditable || target.closest('input, textarea, select, [role="slider"], [role="tablist"], [role="menu"], [role="listbox"]')
  )) return;
  if (document.querySelector('[role="dialog"], [aria-modal="true"]')) return;

  const scroller = postScroller.value;
  if (!scroller || props.loading) return;
  const bounds = scroller.getBoundingClientRect();
  if (bounds.bottom <= 0 || bounds.top >= window.innerHeight || bounds.width === 0) return;

  event.preventDefault();
  if (event.repeat) return;
  updateScrollState();
  const post = props.posts[activePostIndex.value];
  if (!post) return;

  if (event.key === 'ArrowLeft') scrollPosts(-1);
  else if (event.key === 'ArrowRight') scrollPosts(1);
  else if (event.key === 'ArrowUp') {
    if (!props.savingSaveIds?.has(post.id)) emit('save', post);
  } else emit('like', post);
};

watch(
  () => props.posts.map((post) => post.id).join('|'),
  () => void nextTick(() => {
    if (postScroller.value) postScroller.value.scrollLeft = 0;
    updateScrollState();
  }),
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('resize', updateScrollState);
  window.addEventListener('keydown', handleKeydown);
  void nextTick(updateScrollState);
});
onScopeDispose(() => {
  window.removeEventListener('resize', updateScrollState);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div>
    <div v-if="loading && posts.length === 0" class="corner-soft h-80 w-full animate-pulse border border-app-line bg-app-panelSoft" />

    <template v-else-if="posts.length">
      <p class="mb-3 text-xs leading-5 text-app-muted">← 이전 글 · → 다음 글 · ↑ 저장 · ↓ 좋아요</p>
      <div class="relative">
        <div v-if="posts.length > 1" class="mb-3 flex items-center justify-between sm:hidden" aria-label="게시글 탐색">
          <p class="text-xs font-semibold tabular-nums text-app-muted" aria-live="polite">
            {{ activePostIndex + 1 }} / {{ posts.length }}
          </p>
          <div class="flex gap-2">
            <IconButton :icon="ChevronLeft" label="이전 게시글" size="sm" :disabled="!canScrollPrevious" @click="scrollPosts(-1)" />
            <IconButton :icon="ChevronRight" label="다음 게시글" size="sm" :disabled="!canScrollNext" @click="scrollPosts(1)" />
          </div>
        </div>

        <div ref="postScroller" class="scrollbar-hide flex w-full snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth pb-2 lg:mx-[3.375rem] lg:w-[calc(100%_-_6.75rem)]" aria-label="게시글 가로 피드" @scroll.passive="updateScrollState">
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

        <button type="button" class="focus-ring absolute left-0 top-[calc(50%_-_110px)] z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-app-line bg-app-panel text-[#15171c] shadow-sm transition-colors hover:border-app-accent hover:text-[#174a77] active:scale-95 disabled:cursor-default disabled:opacity-40 lg:grid" :disabled="!canScrollPrevious" aria-label="이전 게시글" @click="scrollPosts(-1)">
          <ChevronLeft :size="24" :stroke-width="2" aria-hidden="true" />
        </button>
        <button type="button" class="focus-ring absolute right-0 top-[calc(50%_-_110px)] z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-app-line bg-app-panel text-[#15171c] shadow-sm transition-colors hover:border-app-accent hover:text-[#174a77] active:scale-95 disabled:cursor-default disabled:opacity-40 lg:grid" :disabled="!canScrollNext" aria-label="다음 게시글" @click="scrollPosts(1)">
          <ChevronRight :size="24" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </template>

    <p v-else class="corner-soft border border-dashed border-app-line px-5 py-12 text-center text-sm leading-6 text-app-muted">
      {{ emptyMessage ?? '아직 게시글이 없어요. 첫 번째 영화 이야기를 남겨보세요.' }}
    </p>
  </div>
</template>
