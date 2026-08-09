<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CommentForm from '@/components/community/CommentForm.vue';
import CommentList from '@/components/community/CommentList.vue';
import MoviePoll from '@/components/community/MoviePoll.vue';
import SharedMovieListCard from '@/components/community/SharedMovieListCard.vue';
import SpoilerCover from '@/components/community/SpoilerCover.vue';
import { createComment, deleteComment, fetchComments } from '@/services/community/commentService';
import {
  deleteCommunityPost,
  ensureCommunityProfile,
  fetchCommunityPost,
  toggleCommunityFollow,
  toggleCommunityLike,
  toggleCommunitySave,
  updateCommunityPost
} from '@/services/community/communityService';
import { castPollVote, clearPollVote, fetchPollOptionCounts } from '@/services/community/pollService';
import { reportCommunityPost } from '@/services/community/reportService';
import { useListStore } from '@/services/listStore';
import { useAuthStore } from '@/stores/auth';
import {
  COMMUNITY_CATEGORY_LABELS,
  type CommunityComment,
  type CommunityMovieReference,
  type CommunityPostDetail
} from '@/types/community';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const listStore = useListStore();
const post = ref<CommunityPostDetail | null>(null);
const comments = ref<CommunityComment[]>([]);
const loading = ref(true);
const commentsLoading = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const editing = ref(false);
const editTitle = ref('');
const editContent = ref('');
const editImageUrl = ref('');
const editHasSpoiler = ref(false);
const savingSave = ref(false);
const commentSubmissionId = ref(0);

const viewerId = computed(() => authStore.user?.id ?? null);
const isOwner = computed(() => post.value?.userId === viewerId.value);
const isAuthenticated = computed(() => authStore.isAuthenticated && Boolean(viewerId.value));
const postId = computed(() => String(route.params.postId));
const savedListIds = computed(() =>
  new Set(listStore.state.interactions.filter((interaction) => interaction.saved).map((interaction) => interaction.listId))
);
const relatedMovies = computed(() => {
  if (!post.value) return [];
  return post.value.movies.length > 0 ? post.value.movies : post.value.movie ? [post.value.movie] : [];
});
const goToLogin = () => router.push({ name: 'login', query: { redirect: route.fullPath } });

const load = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [loadedPost, loadedComments] = await Promise.all([
      fetchCommunityPost(postId.value, viewerId.value),
      fetchComments(postId.value)
    ]);
    post.value = loadedPost;
    comments.value = loadedComments;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

const beginEdit = () => {
  if (!post.value) return;
  editTitle.value = post.value.title;
  editContent.value = post.value.content;
  editImageUrl.value = post.value.imageUrl ?? '';
  editHasSpoiler.value = post.value.hasSpoiler;
  editing.value = true;
};

const saveEdit = async () => {
  if (!post.value || !editTitle.value.trim()) return;
  submitting.value = true;
  try {
    await updateCommunityPost(post.value.id, {
      title: editTitle.value,
      content: editContent.value,
      imageUrl: editImageUrl.value,
      hasSpoiler: editHasSpoiler.value,
      movie: post.value.movie
    });
    editing.value = false;
    await load();
  } catch {
    errorMessage.value = '게시글 수정에 실패했습니다.';
  } finally {
    submitting.value = false;
  }
};

const removePost = async () => {
  if (!post.value || !window.confirm('이 게시글을 삭제할까요?')) return;
  try {
    await deleteCommunityPost(post.value.id);
    await router.replace('/community');
  } catch {
    errorMessage.value = '게시글 삭제에 실패했습니다.';
  }
};

const toggleLike = async () => {
  if (!post.value || !viewerId.value) { goToLogin(); return; }
  const before = post.value.viewer.hasLiked;
  post.value.viewer.hasLiked = !before;
  post.value.likeCount += before ? -1 : 1;
  try {
    await toggleCommunityLike(post.value.id, viewerId.value, before);
  } catch {
    post.value.viewer.hasLiked = before;
    post.value.likeCount += before ? 1 : -1;
    errorMessage.value = '좋아요를 반영하지 못했습니다.';
  }
};

const toggleSave = async () => {
  if (!post.value || !viewerId.value) { goToLogin(); return; }
  if (savingSave.value) return;
  savingSave.value = true;
  try {
    const result = await toggleCommunitySave(post.value.id, viewerId.value);
    post.value.viewer.hasSaved = result.saved;
    post.value.saveCount = Math.max(0, result.saveCount);
  } catch {
    errorMessage.value = '저장을 반영하지 못했습니다.';
  } finally {
    savingSave.value = false;
  }
};

const toggleFollow = async () => {
  if (!post.value || !viewerId.value) { goToLogin(); return; }
  const before = post.value.viewer.isFollowingAuthor;
  post.value.viewer.isFollowingAuthor = !before;
  try {
    await toggleCommunityFollow(post.value.userId, viewerId.value, before);
  } catch {
    post.value.viewer.isFollowingAuthor = before;
    errorMessage.value = '팔로우를 반영하지 못했습니다.';
  }
};

const report = async () => {
  if (!post.value || !viewerId.value) { goToLogin(); return; }
  if (!window.confirm('이 게시글을 신고할까요?')) return;
  try {
    await reportCommunityPost(post.value.id, viewerId.value, 'inappropriate');
    window.alert('신고가 접수되었습니다.');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '신고에 실패했습니다.';
  }
};

const addComment = async (input: { content: string; movie: null | CommunityMovieReference }) => {
  if (!post.value || !viewerId.value) { goToLogin(); return; }
  submitting.value = true;
  try {
    await ensureCommunityProfile(viewerId.value, authStore.displayName, (authStore.user?.user_metadata.avatar_url as string | undefined) ?? null);
    comments.value.unshift(await createComment(post.value.id, viewerId.value, input));
    post.value.commentCount += 1;
    commentSubmissionId.value += 1;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '댓글 등록에 실패했습니다.';
  } finally {
    submitting.value = false;
  }
};

const removeComment = async (commentId: string) => {
  if (!post.value) return;
  try {
    await deleteComment(commentId);
    comments.value = comments.value.filter((comment) => comment.id !== commentId);
    post.value.commentCount = Math.max(0, post.value.commentCount - 1);
  } catch {
    errorMessage.value = '댓글 삭제에 실패했습니다.';
  }
};

const refreshPoll = async () => {
  if (!post.value?.poll) return;
  const counts = await fetchPollOptionCounts(post.value.poll.id);
  post.value.poll.options.forEach((option) => { option.voteCount = counts.get(option.id) ?? 0; });
};
const vote = async (optionId: string) => {
  if (!post.value?.poll || !viewerId.value) { goToLogin(); return; }
  try {
    await castPollVote(post.value.poll.id, optionId, viewerId.value);
    post.value.poll.viewerOptionId = optionId;
    await refreshPoll();
  } catch {
    errorMessage.value = '투표를 반영하지 못했습니다.';
  }
};
const clearVote = async () => {
  if (!post.value?.poll || !viewerId.value) { goToLogin(); return; }
  try {
    await clearPollVote(post.value.poll.id, viewerId.value);
    post.value.poll.viewerOptionId = null;
    await refreshPoll();
  } catch {
    errorMessage.value = '투표 취소에 실패했습니다.';
  }
};
const saveList = async (listId: string) => {
  if (!viewerId.value) { goToLogin(); return; }
  if (savedListIds.value.has(listId)) return;
  try {
    await listStore.toggleSharedListSave(listId);
    void load();
  } catch {
    errorMessage.value = '리스트 저장에 실패했습니다.';
  }
};

watch(postId, () => { void load(); });
onMounted(() => { void load(); });
</script>

<template>
  <main class="community-surface mx-auto w-full max-w-md px-4 pb-24 pt-6 sm:max-w-xl">
    <RouterLink to="/community" class="focus-ring text-sm font-semibold text-[#174a77]">← 커뮤니티</RouterLink>
    <p v-if="loading" class="corner-soft mt-5 h-72 animate-pulse border border-app-line bg-app-panelSoft" />
    <p v-else-if="errorMessage && !post" class="corner-soft mt-5 border border-[#d9a7a7] bg-[#fff6f6] p-4 text-sm text-[#a13c3c]">{{ errorMessage }}</p>

    <template v-else-if="post">
      <article class="corner-soft mt-5 border border-app-line bg-app-panel p-4">
        <div class="flex items-start gap-3">
          <img v-if="post.author.avatarUrl" :src="post.author.avatarUrl" :alt="`${post.author.nickname} 프로필`" class="size-10 rounded-full border border-app-line object-cover" />
          <span v-else class="grid size-10 place-items-center rounded-full border border-app-accent bg-[#dcecff] text-sm font-bold text-[#174a77]">{{ post.author.nickname.slice(0, 1) }}</span>
          <div class="min-w-0 flex-1">
            <RouterLink :to="{ name: 'profile', params: { userId: post.author.id } }" class="focus-ring text-sm font-semibold text-[#15171c] hover:text-[#174a77]">{{ post.author.nickname }}</RouterLink>
            <p class="mt-1 text-xs text-app-muted">{{ new Date(post.createdAt).toLocaleString('ko-KR') }}</p>
            <span class="corner-pill mt-2 inline-flex border border-[#bed3e8] bg-[#eef6ff] px-2 py-1 text-[10px] font-semibold text-[#174a77]">{{ COMMUNITY_CATEGORY_LABELS[post.category] }}</span>
          </div>
        </div>

        <form v-if="editing" class="mt-5 grid gap-3" @submit.prevent="saveEdit">
          <input v-model="editTitle" maxlength="140" class="focus-ring corner-soft h-10 border border-app-line px-3 text-sm text-[#15171c]" />
          <textarea v-model="editContent" rows="8" class="focus-ring corner-soft border border-app-line px-3 py-2 text-sm text-[#15171c]" />
          <input v-model="editImageUrl" type="url" class="focus-ring corner-soft h-10 border border-app-line px-3 text-sm text-[#15171c]" placeholder="대표 이미지 URL" />
          <label class="text-sm text-[#15171c]"><input v-model="editHasSpoiler" type="checkbox" class="mr-2" />스포일러 포함</label>
          <div class="flex gap-2"><button class="focus-ring corner-soft border border-app-accent bg-app-accent px-3 py-2 text-sm font-semibold text-white" :disabled="submitting">저장</button><button type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-sm text-app-muted" @click="editing = false">취소</button></div>
        </form>

        <template v-else>
          <h1 class="mt-5 text-xl font-semibold leading-8 text-[#15171c]">{{ post.title }}</h1>
          <SpoilerCover class="mt-4" :has-spoiler="post.hasSpoiler">
            <p class="whitespace-pre-wrap text-sm leading-7 text-app-muted">{{ post.content }}</p>
            <img v-if="post.imageUrl" :src="post.imageUrl" alt="게시글 대표 이미지" class="mt-4 max-h-[32rem] w-full border border-app-line object-cover" />
          </SpoilerCover>
        </template>

        <section v-if="relatedMovies.length" class="mt-5 border-y border-app-line py-3" aria-labelledby="related-movies-title">
          <h2 id="related-movies-title" class="text-xs font-semibold text-app-muted">관련 영화 {{ relatedMovies.length }}편</h2>
          <div class="scrollbar-hide mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1">
            <RouterLink v-for="movie in relatedMovies" :key="movie.id" :to="`/movies/${movie.id}`" class="focus-ring w-32 shrink-0 snap-start">
              <img :src="movie.posterPath ?? '/app-icon.svg'" :alt="`${movie.title} 포스터`" class="h-44 w-32 border border-app-line object-cover" />
              <span class="mt-2 block whitespace-normal break-keep text-sm font-semibold leading-6 text-[#174a77]">{{ movie.title }}</span>
            </RouterLink>
          </div>
        </section>

        <SharedMovieListCard v-if="post.list" class="mt-4" :list="post.list" :saved="savedListIds.has(post.list.id)" @save="saveList" />
        <MoviePoll v-if="post.poll" class="mt-4" :poll="post.poll" @vote="vote" @clear="clearVote" />
        <div class="mt-5 flex flex-wrap gap-2 border-t border-app-line pt-4">
          <button type="button" class="focus-ring corner-soft inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold" :class="post.viewer.hasLiked ? 'border-app-accent text-[#174a77]' : 'border-app-line text-app-muted'" :aria-label="`좋아요 ${post.likeCount}개`" @click="toggleLike"><span aria-hidden="true" class="text-base leading-none">{{ post.viewer.hasLiked ? '♥' : '♡' }}</span><span>{{ post.likeCount }}</span></button>
          <button type="button" class="focus-ring corner-soft border px-3 py-2 text-xs font-semibold disabled:cursor-wait disabled:opacity-60" :class="post.viewer.hasSaved ? 'border-app-accent text-[#174a77]' : 'border-app-line text-app-muted'" :disabled="savingSave" @click="toggleSave">저장 {{ post.saveCount }}</button>
          <button v-if="!isOwner" type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-xs text-[#174a77]" @click="toggleFollow">{{ post.viewer.isFollowingAuthor ? '팔로우 취소' : '작성자 팔로우' }}</button>
          <button v-if="!isOwner" type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-xs text-app-muted" @click="report">신고</button>
          <button v-if="isOwner" type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-xs text-[#174a77]" @click="beginEdit">수정</button>
          <button v-if="isOwner" type="button" class="focus-ring corner-soft border border-[#d9a7a7] px-3 py-2 text-xs text-[#a13c3c]" @click="removePost">삭제</button>
        </div>
      </article>

      <section id="comments" class="mt-6" aria-labelledby="comments-title">
        <h2 id="comments-title" class="text-lg font-semibold text-[#15171c]" :aria-label="`댓글 ${post.commentCount}개`"><span aria-hidden="true" class="mr-1 text-base">💬</span>{{ post.commentCount }}</h2>
        <CommentForm class="mt-4" :is-authenticated="isAuthenticated" :submitting="submitting" :submission-id="commentSubmissionId" @submit="addComment" @login="goToLogin" />
        <div class="mt-5"><CommentList :comments="comments" :current-user-id="viewerId" :loading="commentsLoading" @remove="removeComment" /></div>
      </section>
      <p v-if="errorMessage" class="corner-soft mt-5 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ errorMessage }}</p>
    </template>
  </main>
</template>
