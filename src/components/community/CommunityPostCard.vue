<script setup lang="ts">
import { computed } from 'vue';

import MoviePoll from '@/components/community/MoviePoll.vue';
import SharedMovieListCard from '@/components/community/SharedMovieListCard.vue';
import SpoilerCover from '@/components/community/SpoilerCover.vue';
import { COMMUNITY_CATEGORY_LABELS, type CommunityPost } from '@/types/community';

const props = withDefaults(
  defineProps<{
    post: CommunityPost;
    viewerLiked?: boolean;
    viewerSaved?: boolean;
    savedListIds?: ReadonlySet<string>;
    savingSave?: boolean;
    compact?: boolean;
    showActions?: boolean;
  }>(),
  { viewerLiked: false, viewerSaved: false, savingSave: false, compact: false, showActions: true }
);

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

const relatedMovies = computed(() =>
  props.post.movies.length > 0 ? props.post.movies : props.post.movie ? [props.post.movie] : []
);
const previewImage = computed(() => props.post.imageUrl ?? relatedMovies.value[0]?.posterPath ?? null);
</script>

<template>
  <article v-if="compact" class="w-28 shrink-0">
    <RouterLink :to="`/community/${post.id}`" class="focus-ring block">
      <div class="relative aspect-square overflow-hidden border border-app-line bg-app-panelSoft">
        <img
          v-if="previewImage"
          :src="previewImage"
          :alt="post.title"
          class="size-full object-cover"
          loading="lazy"
        />
        <div v-else class="flex size-full flex-col justify-between bg-[#eef6ff] p-3">
          <span class="text-[10px] font-bold tracking-[0.12em] text-[#174a77]">TALK</span>
          <span class="line-clamp-3 text-xs font-bold leading-5 text-[#15171c]">{{ post.title }}</span>
        </div>
        <span class="absolute inset-x-0 bottom-0 bg-[#15171c] px-2 py-1.5 text-[10px] font-semibold text-white/90">
          {{ COMMUNITY_CATEGORY_LABELS[post.category] }}
        </span>
      </div>
      <div class="mt-2 flex min-w-0 items-center gap-2">
        <img
          v-if="post.author.avatarUrl"
          :src="post.author.avatarUrl"
          :alt="`${post.author.nickname} 프로필`"
          class="size-5 shrink-0 rounded-full border border-app-line object-cover"
        />
        <span v-else class="grid size-5 shrink-0 place-items-center rounded-full border border-app-accent bg-[#eef6ff] text-[9px] font-bold text-[#174a77]" aria-hidden="true">
          {{ post.author.nickname.slice(0, 1) }}
        </span>
        <span class="truncate text-[11px] font-semibold text-[#15171c]">{{ post.author.nickname }}</span>
      </div>
    </RouterLink>
  </article>

  <article v-else class="corner-soft overflow-hidden border border-app-line bg-app-panel">
    <header class="flex items-center gap-3 px-4 py-3">
      <img
        v-if="post.author.avatarUrl"
        :src="post.author.avatarUrl"
        :alt="`${post.author.nickname} 프로필`"
        class="size-10 shrink-0 rounded-full border-2 border-[#bed3e8] object-cover"
      />
      <span v-else class="grid size-10 shrink-0 place-items-center rounded-full border-2 border-app-accent bg-[#eef6ff] text-sm font-bold text-[#174a77]" aria-hidden="true">
        {{ post.author.nickname.slice(0, 1) }}
      </span>
      <div class="min-w-0 flex-1">
        <RouterLink :to="{ name: 'profile', params: { userId: post.author.id } }" class="focus-ring block truncate text-sm font-bold text-[#15171c] hover:text-[#174a77]">
          {{ post.author.nickname }}
        </RouterLink>
        <p class="mt-0.5 text-xs text-app-muted">{{ COMMUNITY_CATEGORY_LABELS[post.category] }} · {{ relativeTime }}</p>
      </div>
      <RouterLink
        :to="`/community/${post.id}`"
        class="focus-ring grid size-8 place-items-center text-lg font-bold leading-none text-app-muted hover:text-[#15171c]"
        :aria-label="`${post.title} 자세히 보기`"
      >
        ···
      </RouterLink>
    </header>

    <SpoilerCover :has-spoiler="post.hasSpoiler" preview>
      <img
        v-if="post.imageUrl"
        :src="post.imageUrl"
        :alt="`${post.title} 이미지`"
        class="max-h-[32rem] w-full border-y border-app-line object-cover"
        loading="lazy"
      />
    </SpoilerCover>

    <section v-if="relatedMovies.length" class="scrollbar-hide flex gap-2 overflow-x-auto border-b border-app-line px-4 py-3" aria-label="관련 영화">
      <RouterLink
        v-for="movie in relatedMovies"
        :key="movie.id"
        :to="`/movies/${movie.id}`"
        class="focus-ring flex w-36 shrink-0 items-center gap-2 text-left"
      >
        <img
          :src="movie.posterPath ?? '/app-icon.svg'"
          :alt="`${movie.title} 포스터`"
          class="h-12 w-8 shrink-0 border border-app-line object-cover"
          loading="lazy"
        />
        <span class="min-w-0">
          <span class="block truncate text-xs font-semibold text-[#15171c]">{{ movie.title }}</span>
          <span v-if="movie.releaseYear" class="mt-0.5 block text-[10px] text-app-muted">{{ movie.releaseYear }}</span>
        </span>
      </RouterLink>
    </section>

    <div class="px-4 py-3">
      <SharedMovieListCard v-if="post.list" :list="post.list" :saved="savedListIds?.has(post.list.id)" @save="emit('save-list', $event)" />
      <MoviePoll v-if="post.poll" :class="post.list ? 'mt-3' : ''" :poll="post.poll" @vote="emit('vote', { post, optionId: $event })" @clear="emit('clear-vote', post)" />

      <div v-if="showActions" class="flex items-center gap-1" :class="post.list || post.poll ? 'mt-3' : ''">
        <button
          type="button"
          class="focus-ring grid size-10 place-items-center rounded-full transition-colors active:scale-95"
          :class="viewerLiked ? 'text-[#d9534f]' : 'text-[#15171c]'"
          :aria-label="`좋아요 ${post.likeCount}개`"
          @click="emit('like', post)"
        >
          <svg class="size-6" viewBox="0 0 24 24" :fill="viewerLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
        </button>
        <RouterLink
          :to="`/community/${post.id}#comments`"
          class="focus-ring grid size-10 place-items-center rounded-full text-[#15171c] transition-colors active:scale-95"
          :aria-label="`댓글 ${post.commentCount}개`"
        >
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M21 11.5a8 8 0 0 1-8.5 8 8.8 8.8 0 0 1-4-.9L3 20l1.5-4.3A7.8 7.8 0 0 1 4 12a8 8 0 0 1 8.5-8A8 8 0 0 1 21 11.5Z" />
          </svg>
        </RouterLink>
        <RouterLink
          :to="`/community/${post.id}`"
          class="focus-ring grid size-10 place-items-center rounded-full text-[#15171c] transition-colors active:scale-95"
          aria-label="게시글 공유 화면 보기"
        >
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="m21 3-8 18-3.5-7.5L2 10l19-7Z" />
            <path d="m9.5 13.5 4-4" />
          </svg>
        </RouterLink>
        <button
          type="button"
          class="focus-ring ml-auto grid size-10 place-items-center rounded-full transition-colors active:scale-95 disabled:cursor-wait disabled:opacity-60"
          :class="viewerSaved ? 'text-[#174a77]' : 'text-[#15171c]'"
          :aria-label="`저장 ${post.saveCount}개`"
          :disabled="savingSave"
          @click="emit('save', post)"
        >
          <svg class="size-6" viewBox="0 0 24 24" :fill="viewerSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M6 3.8A1.8 1.8 0 0 1 7.8 2h8.4A1.8 1.8 0 0 1 18 3.8V22l-6-3.7L6 22V3.8Z" />
          </svg>
        </button>
      </div>

      <p v-if="showActions && post.likeCount" class="mt-1 text-sm font-bold text-[#15171c]">좋아요 {{ post.likeCount }}개</p>
      <RouterLink :to="`/community/${post.id}`" class="focus-ring mt-2 block">
        <h2 class="text-sm font-bold leading-6 text-[#15171c]">{{ post.title }}</h2>
        <SpoilerCover :has-spoiler="post.hasSpoiler" preview>
          <p v-if="post.content" class="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-app-muted">{{ post.content }}</p>
        </SpoilerCover>
      </RouterLink>
      <RouterLink v-if="post.commentCount" :to="`/community/${post.id}#comments`" class="focus-ring mt-2 inline-flex text-xs text-app-muted hover:text-[#174a77]">
        댓글 {{ post.commentCount }}개 모두 보기
      </RouterLink>
      <p class="mt-2 text-[10px] font-medium tracking-wide text-app-muted">{{ relativeTime }}</p>
    </div>
  </article>
</template>
