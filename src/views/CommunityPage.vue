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
import DailyQuestionAnswersModal from '@/components/community/DailyQuestionAnswersModal.vue';
import { castPollVote, clearPollVote, fetchPollOptionCounts } from '@/services/community/pollService';
import {
  createCommunityPost,
  ensureCommunityProfile,
  fetchCommunityFeed,
  fetchDailyQuestion,
  fetchDailyQuestionAnswers,
  fetchMyShareableLists,
  fetchPopularPosts,
  fetchViewerPostInteractions,
  saveDailyQuestionAnswer,
  toggleCommunityLike,
  toggleCommunitySave
} from '@/services/community/communityService';
import { useListStore } from '@/services/listStore';
import { checkTitlesForEvent } from '@/services/titleService';
import { useAuthStore } from '@/stores/auth';
import type { CommunityCategory, CommunityListReference, CommunityPost, CommunityPostDraft, CommunitySort, CommunityTab, DailyQuestion, DailyQuestionAnswer, DailyQuestionAnswerInput } from '@/types/community';

const authStore = useAuthStore();
const listStore = useListStore();
const router = useRouter();
const route = useRoute();

const activeTab = ref<CommunityTab>('all');
const sort = ref<CommunitySort>('latest');
const searchQuery = ref('');
const posts = ref<CommunityPost[]>([]);
const popularPosts = ref<CommunityPost[]>([]);
const dailyQuestion = ref<DailyQuestion | null>(null);
const dailyAnswers = ref<DailyQuestionAnswer[]>([]);
const shareableLists = ref<CommunityListReference[]>([]);
const likedIds = ref(new Set<string>());
const savedIds = ref(new Set<string>());
const savingSaveIds = ref(new Set<string>());
const hasMore = ref(false);
const loading = ref(false);
const loadingDaily = ref(false);
const loadingDailyAnswers = ref(false);
const dailyAnswerListOpen = ref(false);
const dailyAnswersError = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const composerError = ref('');
const isComposerOpen = ref(false);
let searchTimer: number | undefined;

const viewerId = computed(() => authStore.user?.id ?? null);
const canWrite = computed(() => authStore.isAuthenticated && Boolean(viewerId.value));
const savedListIds = computed(() =>
  new Set(listStore.state.interactions.filter((interaction) => interaction.saved).map((interaction) => interaction.listId))
);

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

const openComposer = () => {
  if (!canWrite.value) { goToLogin(); return; }
  composerError.value = '';
  isComposerOpen.value = true;
};
const closeComposer = () => {
  composerError.value = '';
  isComposerOpen.value = false;
};

const submitPost = async (draft: CommunityPostDraft) => {
  if (!viewerId.value) { goToLogin(); return; }
  submitting.value = true;
  composerError.value = '';
  try {
    await ensureCommunityProfile(viewerId.value, authStore.displayName, (authStore.user?.user_metadata.avatar_url as string | undefined) ?? null);
    await createCommunityPost(draft);
    isComposerOpen.value = false;
    await refresh();
  } catch (error) {
    // 모달을 닫지 않고 원인을 바로 보여 주어 사용자가 입력값을 고칠 수 있게 합니다.
    const message = error instanceof Error ? error.message : '게시글 등록에 실패했습니다.';
    composerError.value = message;
    errorMessage.value = message;
  }
  finally { submitting.value = false; }
};

const submitDailyAnswer = async (input: DailyQuestionAnswerInput) => {
  if (!viewerId.value || !dailyQuestion.value) { goToLogin(); return; }
  try {
    await ensureCommunityProfile(viewerId.value, authStore.displayName, (authStore.user?.user_metadata.avatar_url as string | undefined) ?? null);
    await saveDailyQuestionAnswer(dailyQuestion.value.id, viewerId.value, input);
    void checkTitlesForEvent('daily_question');
    await loadDailyQuestion();
    if (dailyAnswerListOpen.value) await loadDailyAnswers();
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : '답변 저장에 실패했습니다.'; }
};

// 답변 목록은 버튼을 눌렀을 때만 불러와 첫 화면의 요청 수를 늘리지 않습니다.
const loadDailyAnswers = async () => {
  if (!dailyQuestion.value) return;
  loadingDailyAnswers.value = true;
  dailyAnswersError.value = '';
  try {
    dailyAnswers.value = await fetchDailyQuestionAnswers(dailyQuestion.value.id, viewerId.value);
  } catch (error) {
    dailyAnswersError.value = error instanceof Error ? error.message : '다른 사람들의 답변을 불러오지 못했습니다.';
  } finally {
    loadingDailyAnswers.value = false;
  }
};

const openDailyAnswers = () => {
  if (!dailyQuestion.value) return;
  dailyAnswerListOpen.value = true;
  void loadDailyAnswers();
};

const withToggledId = (ids: Set<string>, id: string, active: boolean) => {
  const nextIds = new Set(ids);
  active ? nextIds.add(id) : nextIds.delete(id);
  return nextIds;
};

const togglePostInteraction = async (
  post: CommunityPost,
  activeIds: typeof likedIds,
  countField: 'likeCount' | 'saveCount',
  toggle: (postId: string, userId: string, active: boolean) => Promise<boolean>,
  failureMessage: string
) => {
  if (!viewerId.value) { goToLogin(); return; }
  const wasActive = activeIds.value.has(post.id);
  activeIds.value = withToggledId(activeIds.value, post.id, !wasActive);
  post[countField] += wasActive ? -1 : 1;
  try { await toggle(post.id, viewerId.value, wasActive); }
  catch {
    activeIds.value = withToggledId(activeIds.value, post.id, wasActive);
    post[countField] += wasActive ? 1 : -1;
    errorMessage.value = failureMessage;
  }
};

const toggleLike = (post: CommunityPost) =>
  togglePostInteraction(post, likedIds, 'likeCount', toggleCommunityLike, '좋아요를 반영하지 못했습니다.');

const applyPostSaveState = (postId: string, saved: boolean, saveCount: number) => {
  savedIds.value = withToggledId(savedIds.value, postId, saved);

  for (const candidate of [...posts.value, ...popularPosts.value]) {
    if (candidate.id === postId) candidate.saveCount = Math.max(0, saveCount);
  }
};

const toggleSave = async (post: CommunityPost) => {
  if (!viewerId.value) { goToLogin(); return; }
  if (savingSaveIds.value.has(post.id)) return;

  savingSaveIds.value = withToggledId(savingSaveIds.value, post.id, true);
  try {
    const result = await toggleCommunitySave(post.id, viewerId.value);
    applyPostSaveState(post.id, result.saved, result.saveCount);
  } catch {
    errorMessage.value = '저장을 반영하지 못했습니다.';
  } finally {
    savingSaveIds.value = withToggledId(savingSaveIds.value, post.id, false);
  }
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
  if (savedListIds.value.has(listId)) return;
  try {
    await listStore.toggleSharedListSave(listId);
    void refresh();
  }
  catch { errorMessage.value = '리스트 저장에 실패했습니다.'; }
};

watch([activeTab, sort], () => { void loadFeed(true); });
watch(searchQuery, () => { window.clearTimeout(searchTimer); searchTimer = window.setTimeout(() => { void loadFeed(true); }, 300); });
watch(viewerId, () => { void refresh(); });
onMounted(() => { void refresh(); });
onScopeDispose(() => window.clearTimeout(searchTimer));
</script>

<template>
  <main class="community-surface mx-auto w-full max-w-md px-4 pb-16 pt-4 sm:max-w-xl">
    <CommunityHeader @compose="openComposer" />
    <DailyQuestionCard class="mt-5" :question="dailyQuestion" :is-authenticated="canWrite" :loading="loadingDaily" @submit="submitDailyAnswer" @login="goToLogin" @view-answers="openDailyAnswers" />
    <section class="mt-7" aria-labelledby="popular-posts-title">
      <div class="flex items-end justify-between"><div><p class="text-xs font-semibold text-app-accent">HOT TALKS</p><h2 id="popular-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">지금 뜨는 이야기</h2></div></div>
      <div class="scrollbar-hide mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1" aria-label="인기 게시글 가로 목록">
        <CommunityPostCard v-for="post in popularPosts" :key="post.id" class="snap-start" :post="post" compact :show-actions="false" :viewer-liked="likedIds.has(post.id)" :viewer-saved="savedIds.has(post.id)" :saved-list-ids="savedListIds" :saving-save="savingSaveIds.has(post.id)" @like="toggleLike" @save="toggleSave" @save-list="saveList" @vote="vote" @clear-vote="clearVote" />
      </div>
    </section>
    <section class="mt-7" aria-labelledby="latest-posts-title">
      <div class="flex items-end justify-between gap-3"><div><p class="text-xs font-semibold text-app-accent">FEED</p><h2 id="latest-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">모두의 이야기</h2></div><CommunitySortMenu v-model="sort" /></div>
      <div class="mt-4"><CommunitySearchBar v-model="searchQuery" /></div>
      <div class="mt-3"><CommunityTabs v-model="activeTab" /></div>
      <p v-if="errorMessage" class="corner-soft mt-4 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ errorMessage }}</p>
      <div class="mt-4"><CommunityPostList :posts="posts" :liked-ids="likedIds" :saved-ids="savedIds" :saved-list-ids="savedListIds" :saving-save-ids="savingSaveIds" :loading="loading" :has-more="hasMore" @more="loadFeed(false)" @like="toggleLike" @save="toggleSave" @save-list="saveList" @vote="vote" @clear-vote="clearVote" /></div>
    </section>
    <CreatePostModal :open="isComposerOpen" :lists="shareableLists" :submitting="submitting" :error-message="composerError" @close="closeComposer" @submit="submitPost" />
    <DailyQuestionAnswersModal :open="dailyAnswerListOpen" :question="dailyQuestion" :answers="dailyAnswers" :loading="loadingDailyAnswers" :error-message="dailyAnswersError" @close="dailyAnswerListOpen = false" />
  </main>
</template>
