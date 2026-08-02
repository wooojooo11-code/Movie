<script setup lang="ts">
import { computed } from 'vue';

import MoviePoll from '@/components/community/MoviePoll.vue';
import SharedMovieListCard from '@/components/community/SharedMovieListCard.vue';
import SpoilerCover from '@/components/community/SpoilerCover.vue';
import { COMMUNITY_CATEGORY_LABELS, type CommunityPost } from '@/types/community';

const props = withDefaults(defineProps<{
  post: CommunityPost;
  viewerLiked?: boolean;
  viewerSaved?: boolean;
  savedListIds?: ReadonlySet<string>;
  savingSave?: boolean;
  compact?: boolean;
  showActions?: boolean;
}>(), { viewerLiked: false, viewerSaved: false, savingSave: false, compact: false, showActions: true });

const emit = defineEmits<{
  like: [post: CommunityPost];
  save: [post: CommunityPost];
  'save-list': [listId: string];
  vote: [payload: { post: CommunityPost; optionId: string }];
  'clear-vote': [post: CommunityPost];
}>();

const relativeTime = computed(() => {
  const difference = Date.now() - new Date(props.post.createdAt).getTime();
  const minutes = Math.max(0, Math.floor(difference / 60_000));
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1440)}일 전`;
});

// 새 다중 연결 데이터와 이전 단일 연결 게시글을 모두 표시합니다.
const relatedMovies = computed(() =>
  props.post.movies.length > 0 ? props.post.movies : props.post.movie ? [props.post.movie] : []
);
</script>

<template>
  <article class="corner-soft border border-app-line bg-app-panel p-4">
    <div class="flex items-start gap-3">
      <img v-if="post.author.avatarUrl" :src="post.author.avatarUrl" :alt="`${post.author.nickname} 프로필`" class="size-9 shrink-0 rounded-full border border-app-line object-cover" />
      <span v-else class="grid size-9 shrink-0 place-items-center rounded-full border border-app-accent bg-[#dcecff] text-xs font-bold text-[#174a77]" aria-hidden="true">{{ post.author.nickname.slice(0, 1) }}</span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <RouterLink :to="{ name: 'profile', params: { userId: post.author.id } }" class="focus-ring text-sm font-semibold text-[#15171c] hover:text-[#174a77]">{{ post.author.nickname }}</RouterLink>
          <span class="text-xs text-app-muted">{{ relativeTime }}</span>
        </div>
        <span class="corner-pill mt-1 inline-flex border border-[#bed3e8] bg-[#eef6ff] px-2 py-1 text-[10px] font-semibold text-[#174a77]">{{ COMMUNITY_CATEGORY_LABELS[post.category] }}</span>
      </div>
    </div>

    <RouterLink :to="`/community/${post.id}`" class="focus-ring mt-3 block">
      <h2 class="text-base font-semibold leading-6 text-[#15171c]">{{ post.title }}</h2>
      <SpoilerCover :has-spoiler="post.hasSpoiler" preview>
        <p class="mt-2 line-clamp-3 text-sm leading-6 text-app-muted">{{ post.content }}</p>
        <img v-if="post.imageUrl" :src="post.imageUrl" alt="게시글 대표 이미지" class="mt-3 max-h-72 w-full border border-app-line object-cover" loading="lazy" />
      </SpoilerCover>
      <p class="mt-2 text-xs font-medium text-[#174a77]">더보기</p>
    </RouterLink>

    <div v-if="relatedMovies.length" class="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto border-y border-app-line px-4 py-3" aria-label="관련 영화">
      <RouterLink v-for="movie in relatedMovies" :key="movie.id" :to="`/movies/${movie.id}`" class="focus-ring w-24 shrink-0 text-left">
        <img :src="movie.posterPath ?? '/app-icon.svg'" :alt="`${movie.title} 포스터`" class="h-32 w-24 border border-app-line object-cover" loading="lazy" />
        <span class="mt-1 block truncate text-xs font-semibold text-[#174a77]">{{ movie.title }}</span>
      </RouterLink>
    </div>

    <SharedMovieListCard v-if="post.list" class="mt-3" :list="post.list" :saved="savedListIds?.has(post.list.id)" @save="$emit('save-list', $event)" />
    <MoviePoll v-if="post.poll" class="mt-3" :poll="post.poll" @vote="$emit('vote', { post, optionId: $event })" @clear="$emit('clear-vote', post)" />
    <div v-if="showActions" class="mt-4 flex flex-wrap items-center gap-2 border-t border-app-line pt-3">
      <button type="button" class="focus-ring corner-soft inline-flex min-h-9 items-center justify-center gap-1.5 border px-3 py-2 text-xs font-semibold transition-colors active:scale-[0.98]" :class="viewerLiked ? 'border-[#174a77] bg-[#e5f1fc] text-[#174a77]' : 'border-app-line bg-app-bg text-app-muted hover:border-[#8bb7df] hover:text-[#174a77]'" :aria-label="`좋아요 ${post.likeCount}개`" @click="$emit('like', post)"><span aria-hidden="true" class="text-base leading-none">{{ viewerLiked ? '♥' : '♡' }}</span><span>{{ post.likeCount }}</span></button>
      <RouterLink :to="`/community/${post.id}#comments`" class="focus-ring corner-soft inline-flex min-h-9 items-center justify-center gap-1.5 border border-app-line bg-app-bg px-3 py-2 text-xs font-semibold text-app-muted transition-colors hover:border-[#8bb7df] hover:text-[#174a77] active:scale-[0.98]" :aria-label="`댓글 ${post.commentCount}개`"><span aria-hidden="true" class="text-sm leading-none">💬</span><span>{{ post.commentCount }}</span></RouterLink>
      <button type="button" class="focus-ring corner-soft ml-auto inline-flex min-h-9 items-center justify-center border px-3 py-2 text-xs font-semibold transition-colors active:scale-[0.98] disabled:cursor-wait disabled:opacity-60" :class="viewerSaved ? 'border-[#174a77] bg-[#e5f1fc] text-[#174a77]' : 'border-app-line bg-app-bg text-app-muted hover:border-[#8bb7df] hover:text-[#174a77]'" :disabled="savingSave" @click="$emit('save', post)">저장 {{ post.saveCount }}</button>
    </div>
  </article>
</template>
