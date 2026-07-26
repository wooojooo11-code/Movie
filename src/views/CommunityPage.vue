<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CommunityHeader from '@/components/community/CommunityHeader.vue';
import CommunityPostCard from '@/components/community/CommunityPostCard.vue';
import CommunityPostList from '@/components/community/CommunityPostList.vue';
import CommunitySearchBar from '@/components/community/CommunitySearchBar.vue';
import CommunitySortMenu from '@/components/community/CommunitySortMenu.vue';
import CommunityTabs from '@/components/community/CommunityTabs.vue';
import CreatePostModal from '@/components/community/CreatePostModal.vue';
import DailyQuestionCard from '@/components/community/DailyQuestionCard.vue';
import { castPollVote, clearPollVote, fetchPollOptionCounts } from '@/services/community/pollService';
import {
  createCommunityPost,
  ensureCommunityProfile,
  fetchCommunityFeed,
  fetchDailyQuestion,
  fetchMyShareableLists,
  fetchPopularPosts,
  fetchViewerPostInteractions,
  saveDailyQuestionAnswer,
  toggleCommunityLike,
  toggleCommunitySave
} from '@/services/community/communityService';
import { useListStore } from '@/services/listStore';
import { getMissionProofChoices } from '@/services/community/missionProofService';
import { useRecommendationStore } from '@/services/recommendationStore';
import { useAuthStore } from '@/stores/auth';
import type { CommunityCategory, CommunityListReference, CommunityPost, CommunityPostDraft, CommunitySort, CommunityTab, DailyQuestion } from '@/types/community';

const authStore = useAuthStore();
const listStore = useListStore();
const recommendationStore = useRecommendationStore();
const router = useRouter();
const route = useRoute();

const activeTab = ref<CommunityTab>('all');
const sort = ref<CommunitySort>('latest');
const searchQuery = ref('');
const posts = ref<CommunityPost[]>([]);
const popularPosts = ref<CommunityPost[]>([]);
const dailyQuestion = ref<DailyQuestion | null>(null);
const shareableLists = ref<CommunityListReference[]>([]);
const likedIds = ref(new Set<string>());
const savedIds = ref(new Set<string>());
const hasMore = ref(false);
const loading = ref(false);
const loadingDaily = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const isComposerOpen = ref(false);
let searchTimer: number | undefined;

const viewerId = computed(() => authStore.user?.id ?? null);
const canWrite = computed(() => authStore.isAuthenticated && Boolean(viewerId.value));
const missionChoices = computed(() => getMissionProofChoices(recommendationStore.ratedMoviesHistory.value.map(({ ratingRecord }) => ratingRecord)));

const goToLogin = () => router.push({ name: 'login', query: { redirect: route.fullPath } });

const syncViewerInteractions = async (targetPosts: readonly CommunityPost[]) => {
  const interactions = await fetchViewerPostInteractions(targetPosts.map((post) => post.id), viewerId.value);
  likedIds.value = new Set([...likedIds.value, ...interactions.liked]);
  savedIds.value = new Set([...savedIds.value, ...interactions.saved]);
};

const loadDailyQuestion = async () => {
  loadingDaily.value = true;
  try { dailyQuestion.value = await fetchDailyQuestion(viewerId.value); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : '오늘의 질문을 불러오지 못했습니다.'; }
  finally { loadingDaily.value = false; }
};

const loadFeed = async (reset = true) => {
  if (loading.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    const page = await fetchCommunityFeed({ category: activeTab.value, sort: sort.value, query: searchQuery.value, offset: reset ? 0 : posts.value.length, viewerId: viewerId.value });
    posts.value = reset ? page.posts : [...posts.value, ...page.posts];
    hasMore.value = page.hasMore;
    if (reset) { likedIds.value = new Set(); savedIds.value = new Set(); }
    await syncViewerInteractions(page.posts);
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.'; }
  finally { loading.value = false; }
};

const loadSupportingContent = async () => {
  try {
    const [popular, lists] = await Promise.all([
      fetchPopularPosts(viewerId.value),
      viewerId.value ? fetchMyShareableLists(viewerId.value) : Promise.resolve([])
    ]);
    popularPosts.value = popular;
    shareableLists.value = lists;
    await syncViewerInteractions(popular);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '커뮤니티 정보를 불러오지 못했습니다.';
  }
};

const refresh = async () => {
  // 게시글 상호작용 상태를 먼저 초기화한 뒤 인기글 상태를 합쳐 경합을 피합니다.
  await loadFeed(true);
  await Promise.all([loadDailyQuestion(), loadSupportingContent()]);
};

const openComposer = () => { if (!canWrite.value) goToLogin(); else isComposerOpen.value = true; };

const submitPost = async (draft: CommunityPostDraft) => {
  if (!viewerId.value) { goToLogin(); return; }
  submitting.value = true;
  try {
    await ensureCommunityProfile(viewerId.value, authStore.displayName, (authStore.user?.user_metadata.avatar_url as string | undefined) ?? null);
    await createCommunityPost(draft);
    isComposerOpen.value = false;
    await refresh();
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : '게시글 등록에 실패했습니다.'; }
  finally { submitting.value = false; }
};

const submitDailyAnswer = async (content: string) => {
  if (!viewerId.value || !dailyQuestion.value) { goToLogin(); return; }
  try {
    await saveDailyQuestionAnswer(dailyQuestion.value.id, viewerId.value, content);
    await loadDailyQuestion();
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : '답변 저장에 실패했습니다.'; }
};

const toggleLike = async (post: CommunityPost) => {
  if (!viewerId.value) { goToLogin(); return; }
  const wasLiked = likedIds.value.has(post.id);
  const nextLiked = new Set(likedIds.value);
  wasLiked ? nextLiked.delete(post.id) : nextLiked.add(post.id);
  likedIds.value = nextLiked;
  post.likeCount += wasLiked ? -1 : 1;
  try { await toggleCommunityLike(post.id, viewerId.value, wasLiked); }
  catch (error) { likedIds.value = new Set(wasLiked ? [...likedIds.value, post.id] : [...likedIds.value].filter((id) => id !== post.id)); post.likeCount += wasLiked ? 1 : -1; errorMessage.value = '좋아요를 반영하지 못했습니다.'; }
};

const toggleSave = async (post: CommunityPost) => {
  if (!viewerId.value) { goToLogin(); return; }
  const wasSaved = savedIds.value.has(post.id);
  const nextSaved = new Set(savedIds.value);
  wasSaved ? nextSaved.delete(post.id) : nextSaved.add(post.id);
  savedIds.value = nextSaved;
  post.saveCount += wasSaved ? -1 : 1;
  try { await toggleCommunitySave(post.id, viewerId.value, wasSaved); }
  catch { savedIds.value = new Set(wasSaved ? [...savedIds.value, post.id] : [...savedIds.value].filter((id) => id !== post.id)); post.saveCount += wasSaved ? 1 : -1; errorMessage.value = '저장을 반영하지 못했습니다.'; }
};

const updatePollCounts = async (post: CommunityPost) => {
  if (!post.poll) return;
  const counts = await fetchPollOptionCounts(post.poll.id);
  post.poll.options.forEach((option) => { option.voteCount = counts.get(option.id) ?? 0; });
};
const vote = async ({ post, optionId }: { post: CommunityPost; optionId: string }) => {
  if (!viewerId.value || !post.poll) { goToLogin(); return; }
  try { await castPollVote(post.poll.id, optionId, viewerId.value); post.poll.viewerOptionId = optionId; await updatePollCounts(post); }
  catch { errorMessage.value = '투표를 반영하지 못했습니다.'; }
};
const clearVote = async (post: CommunityPost) => {
  if (!viewerId.value || !post.poll) { goToLogin(); return; }
  try { await clearPollVote(post.poll.id, viewerId.value); post.poll.viewerOptionId = null; await updatePollCounts(post); }
  catch { errorMessage.value = '투표 취소에 실패했습니다.'; }
};

// 리스트 저장은 listStore가 원본 ID를 참조하도록 관리합니다.
const saveList = async (listId: string) => {
  if (!viewerId.value) { goToLogin(); return; }
  try { await listStore.toggleSharedListSave(listId); }
  catch { errorMessage.value = '리스트 저장에 실패했습니다.'; }
};

watch([activeTab, sort], () => { void loadFeed(true); });
watch(searchQuery, () => { window.clearTimeout(searchTimer); searchTimer = window.setTimeout(() => { void loadFeed(true); }, 300); });
watch(viewerId, () => { void refresh(); });
onMounted(() => { void refresh(); });
onScopeDispose(() => window.clearTimeout(searchTimer));
</script>

<template>
  <main class="community-surface mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:max-w-xl">
    <CommunityHeader />
    <DailyQuestionCard class="mt-6" :question="dailyQuestion" :is-authenticated="canWrite" :loading="loadingDaily" @submit="submitDailyAnswer" @login="goToLogin" />
    <section class="mt-8" aria-labelledby="popular-posts-title">
      <div class="flex items-end justify-between"><div><p class="text-xs font-semibold text-app-accent">POPULAR</p><h2 id="popular-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">인기 게시글</h2></div></div>
      <div class="mt-4 grid gap-3"><CommunityPostCard v-for="post in popularPosts" :key="post.id" :post="post" :viewer-liked="likedIds.has(post.id)" :viewer-saved="savedIds.has(post.id)" @like="toggleLike" @save="toggleSave" @save-list="saveList" @vote="vote" @clear-vote="clearVote" /></div>
    </section>
    <section class="mt-8" aria-labelledby="latest-posts-title">
      <div class="flex items-end justify-between gap-3"><div><p class="text-xs font-semibold text-app-accent">LATEST</p><h2 id="latest-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">최신 게시글</h2></div><CommunitySortMenu v-model="sort" /></div>
      <div class="mt-4"><CommunitySearchBar v-model="searchQuery" /></div>
      <div class="mt-4"><CommunityTabs v-model="activeTab" /></div>
      <p v-if="errorMessage" class="corner-soft mt-4 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ errorMessage }}</p>
      <div class="mt-4"><CommunityPostList :posts="posts" :liked-ids="likedIds" :saved-ids="savedIds" :loading="loading" :has-more="hasMore" @more="loadFeed(false)" @like="toggleLike" @save="toggleSave" @save-list="saveList" @vote="vote" @clear-vote="clearVote" /></div>
    </section>
    <!-- 고정 버튼도 본문과 같은 최대 폭 안에서 오른쪽에 배치한다. -->
    <div class="pointer-events-none fixed inset-x-0 bottom-5 z-30">
      <div class="mx-auto flex w-full max-w-md justify-end px-4 sm:max-w-xl">
        <button type="button" class="focus-ring pointer-events-auto grid size-14 place-items-center rounded-full border border-app-accent bg-app-accent text-sm font-bold text-white active:scale-95" aria-label="글쓰기" @click="openComposer">글쓰기</button>
      </div>
    </div>
    <CreatePostModal :open="isComposerOpen" :lists="shareableLists" :mission-choices="missionChoices" :submitting="submitting" @close="isComposerOpen = false" @submit="submitPost" />
  </main>
</template>
