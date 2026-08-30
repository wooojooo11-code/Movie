<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onScopeDispose, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import IconButton from '@/components/common/IconButton.vue';
import CommunityHeader from '@/components/community/CommunityHeader.vue';
import CommunityPostCard from '@/components/community/CommunityPostCard.vue';
import CommunityPostList from '@/components/community/CommunityPostList.vue';
import CommunitySearchBar from '@/components/community/CommunitySearchBar.vue';
import SavedCommunityPostsCard from '@/components/community/SavedCommunityPostsCard.vue';
import CommunitySortMenu from '@/components/community/CommunitySortMenu.vue';
import CommunityTabs from '@/components/community/CommunityTabs.vue';
import CreatePostModal from '@/components/community/CreatePostModal.vue';
import DailyQuestionCard from '@/components/community/DailyQuestionCard.vue';
import DailyQuestionAnswersModal from '@/components/community/DailyQuestionAnswersModal.vue';
import { catalogMovies } from '@/data/catalog';
import { castPollVote, clearPollVote, fetchPollOptionCounts } from '@/services/community/pollService';
import {
  createCommunityPost,
  ensureCommunityProfile,
  fetchCommunityFeed,
  fetchDailyQuestion,
  fetchDailyQuestionAnswers,
  fetchMyShareableLists,
  fetchPopularPosts,
  fetchRecommendedCommunityPosts,
  fetchSavedCommunityPosts,
  fetchViewedCommunityPostIds,
  fetchViewerPostInteractions,
  saveDailyQuestionAnswer,
  toggleCommunityLike,
  toggleCommunitySave
} from '@/services/community/communityService';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';
import { checkTitlesForEvent } from '@/services/titleService';
import { useAuthStore } from '@/stores/auth';
import {
  COMMUNITY_POST_RECOMMENDATION_REASON_LABELS,
  type CommunityCategory,
  type CommunityListReference,
  type CommunityPost,
  type CommunityPostDraft,
  type CommunityPostRecommendationReason,
  type CommunitySort,
  type CommunityTab,
  type DailyQuestion,
  type DailyQuestionAnswer,
  type DailyQuestionAnswerInput,
  type RecommendedCommunityPost
} from '@/types/community';

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
const recommendedPosts = ref<RecommendedCommunityPost[]>([]);
const dailyQuestion = ref<DailyQuestion | null>(null);
const dailyAnswers = ref<DailyQuestionAnswer[]>([]);
const shareableLists = ref<CommunityListReference[]>([]);
const savedPosts = ref<CommunityPost[]>([]);
const savedPostCount = ref(0);
const likedIds = ref(new Set<string>());
const savedIds = ref(new Set<string>());
const savingSaveIds = ref(new Set<string>());
const loading = ref(false);
const loadingDaily = ref(false);
const submittingDailyAnswer = ref(false);
const dailyAnswerSaved = ref(false);
const loadingSavedPosts = ref(false);
const loadingRecommendedPosts = ref(false);
const loadingDailyAnswers = ref(false);
const dailyAnswerListOpen = ref(false);
const dailyAnswersError = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const composerError = ref('');
const isComposerOpen = ref(false);
const popularPostScroller = ref<HTMLElement | null>(null);
const canScrollPopularPrevious = ref(false);
const canScrollPopularNext = ref(false);
let searchTimer: number | undefined;
let dailyAnswerSavedTimer: number | undefined;
const COMMUNITY_FEED_PAGE_SIZE = 100;

const viewerId = computed(() => authStore.user?.id ?? null);
const canWrite = computed(() => authStore.isAuthenticated && Boolean(viewerId.value));
const catalogMovieById = new Map(
  catalogMovies.flatMap((movie) => [
    [movie.id, movie] as const,
    [String(movie.tmdbMovieId), movie] as const
  ])
);
const collaborativeSignalByMovieId = computed(
  () => new Map(recommendationStore.collaborativeRecommendationSignals.value.map((signal) => [signal.movieId, signal]))
);
const savedListIds = computed(() =>
  new Set(listStore.state.interactions.filter((interaction) => interaction.saved).map((interaction) => interaction.listId))
);
const feedTitle = computed(() => {
  if (activeTab.value === 'saved') return '내가 저장한 글';
  if (activeTab.value === 'my_recommendations') return '내 추천 게시물';
  return '모두의 이야기';
});
const feedEmptyMessage = computed(() => {
  if (activeTab.value !== 'my_recommendations') return undefined;
  return canWrite.value
    ? '아직 작성한 영화 추천글이 없어요. 새 글에서 첫 추천을 남겨보세요.'
    : '로그인하면 내가 작성한 영화 추천글을 모아볼 수 있어요.';
});

const goToLogin = () => router.push({ name: 'login', query: { redirect: route.fullPath } });

const updatePopularScrollState = () => {
  const scroller = popularPostScroller.value;
  if (!scroller) return;

  const maximumScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  canScrollPopularPrevious.value = scroller.scrollLeft > 2;
  canScrollPopularNext.value = scroller.scrollLeft < maximumScroll - 2;
};

const scrollPopularPosts = (direction: -1 | 1) => {
  const scroller = popularPostScroller.value;
  if (!scroller) return;

  const firstCard = scroller.firstElementChild as HTMLElement | null;
  const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
  const distance = (firstCard?.getBoundingClientRect().width ?? scroller.clientWidth) + gap;
  scroller.scrollBy({ left: direction * distance, behavior: 'smooth' });
};

const syncViewerInteractions = async (targetPosts: readonly CommunityPost[]) => {
  const interactions = await fetchViewerPostInteractions(targetPosts.map((post) => post.id), viewerId.value);
  likedIds.value = new Set([...likedIds.value, ...interactions.liked]);
  savedIds.value = new Set([...savedIds.value, ...interactions.saved]);
};

const getPostMovieIds = (post: CommunityPost) =>
  [
    ...post.movies.map((movie) => movie.id),
    ...(post.movie ? [post.movie.id] : []),
    ...(post.list?.movieIds ?? []),
    ...(post.poll?.options.flatMap((option) => (option.movie ? [option.movie.id] : [])) ?? [])
  ].filter((movieId, index, movieIds) => movieId && movieIds.indexOf(movieId) === index);

const buildFallbackRecommendedPosts = (
  candidates: readonly CommunityPost[],
  viewedPostIds: ReadonlySet<string>,
  limit: number
): RecommendedCommunityPost[] => {
  const now = Date.now();

  return candidates
    .flatMap((post): RecommendedCommunityPost[] => {
      if (post.userId === viewerId.value || viewedPostIds.has(post.id)) return [];

      const relatedMovieIds = getPostMovieIds(post);
      if (relatedMovieIds.length === 0) return [];

      const unseenMovieIds = relatedMovieIds.filter((movieId) => {
        const rating = recommendationStore.getStoredRatingRecord(movieId);
        return !rating || rating.rawDecision === 'not_seen';
      });

      let collaborativeScore = 0;
      let genreAffinity = 0;
      for (const movieId of relatedMovieIds) {
        collaborativeScore = Math.max(
          collaborativeScore,
          collaborativeSignalByMovieId.value.get(movieId)?.score ?? 0
        );

        const movie = catalogMovieById.get(movieId);
        if (movie) {
          genreAffinity += movie.genres.reduce(
            (total, genre) => total + Math.max(0, recommendationStore.state.profile.genreScores[genre] ?? 0),
            0
          );
        }
      }

      const hasTasteMatch = collaborativeScore > 0 || genreAffinity > 0;
      const ageInDays = Math.max(0, (now - new Date(post.createdAt).getTime()) / 86_400_000);
      const engagementScore = Math.min(post.likeCount * 1.2 + post.saveCount * 1.8 + post.commentCount, 18);
      const score =
        unseenMovieIds.length * 8 +
        collaborativeScore * 0.55 +
        Math.min(genreAffinity, 24) +
        engagementScore +
        Math.max(0, 14 - ageInDays) * 0.35;
      const reasons: CommunityPostRecommendationReason[] = ['unseen_post'];
      if (unseenMovieIds.length > 0) reasons.push('unseen_movie');
      if (hasTasteMatch) reasons.push('taste_match');

      return [{ post, reasons, score }];
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        new Date(right.post.createdAt).getTime() - new Date(left.post.createdAt).getTime()
    )
    .slice(0, limit);
};

const loadRecommendedPosts = async () => {
  if (!viewerId.value) {
    recommendedPosts.value = [];
    loadingRecommendedPosts.value = false;
    return;
  }

  loadingRecommendedPosts.value = true;
  try {
    let personalizedPosts: RecommendedCommunityPost[] = [];

    try {
      personalizedPosts = await fetchRecommendedCommunityPosts(viewerId.value, 6);
    } catch (error) {
      // 개인화 RPC는 선택 기능입니다. 실패해도 아래의 로컬 취향 추천으로 이어갑니다.
      console.warn('[community] Personalized post recommendations are unavailable.', error);
    }

    if (personalizedPosts.length === 0) {
      const fallbackFeed = await fetchCommunityFeed({
        category: 'all',
        sort: 'popular',
        query: '',
        offset: 0,
        limit: 50,
        viewerId: viewerId.value
      });
      const viewedPostIds = await fetchViewedCommunityPostIds(
        viewerId.value,
        fallbackFeed.posts.map((post) => post.id)
      );
      personalizedPosts = buildFallbackRecommendedPosts(fallbackFeed.posts, viewedPostIds, 6);
    }

    recommendedPosts.value = personalizedPosts;
    await syncViewerInteractions(personalizedPosts.map((recommendation) => recommendation.post));
  } catch (error) {
    recommendedPosts.value = [];
    console.warn('[community] Failed to build recommended posts.', error);
  } finally {
    loadingRecommendedPosts.value = false;
  }
};

const getRecommendationReasonLabels = (recommendation: RecommendedCommunityPost) =>
  recommendation.reasons.map((reason) => COMMUNITY_POST_RECOMMENDATION_REASON_LABELS[reason]);

const loadDailyQuestion = async () => {
  loadingDaily.value = true;
  try { dailyQuestion.value = await fetchDailyQuestion(viewerId.value); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : '오늘의 질문을 불러오지 못했습니다.'; }
  finally { loadingDaily.value = false; }
};

const loadSavedPosts = async () => {
  if (!viewerId.value) {
    savedPosts.value = [];
    savedPostCount.value = 0;
    loadingSavedPosts.value = false;
    return;
  }

  loadingSavedPosts.value = true;
  try {
    const result = await fetchSavedCommunityPosts(viewerId.value, COMMUNITY_FEED_PAGE_SIZE);
    savedPosts.value = result.posts;
    savedPostCount.value = result.totalCount;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '저장한 글을 불러오지 못했습니다.';
  } finally {
    loadingSavedPosts.value = false;
  }
};

const loadFeed = async () => {
  if (activeTab.value === 'saved') {
    posts.value = [];
    loading.value = false;
    return;
  }

  if (activeTab.value === 'my_recommendations' && !viewerId.value) {
    posts.value = [];
    likedIds.value = new Set();
    savedIds.value = new Set();
    loading.value = false;
    return;
  }

  if (loading.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    const allPosts: CommunityPost[] = [];
    let offset = 0;
    let hasNextPage = true;

    // 더 보기 버튼 없이 모든 게시글을 보여 주기 위해, 서버 결과를 끝까지 이어서 가져옵니다.
    while (hasNextPage) {
      const page = await fetchCommunityFeed({
        category: activeTab.value === 'my_recommendations' ? 'movie_recommendation' : activeTab.value,
        authorId: activeTab.value === 'my_recommendations' ? viewerId.value : undefined,
        sort: sort.value,
        query: searchQuery.value,
        offset,
        limit: COMMUNITY_FEED_PAGE_SIZE,
        viewerId: viewerId.value
      });
      allPosts.push(...page.posts);
      offset += page.posts.length;
      hasNextPage = page.hasMore && page.posts.length > 0;
    }

    posts.value = allPosts;
    likedIds.value = new Set();
    savedIds.value = new Set();
    await syncViewerInteractions(allPosts);
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
    await nextTick();
    if (popularPostScroller.value) popularPostScroller.value.scrollLeft = 0;
    updatePopularScrollState();
    await syncViewerInteractions(popular);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '커뮤니티 정보를 불러오지 못했습니다.';
  }
};

const refresh = async () => {
  // 게시글 상호작용 상태를 먼저 초기화한 뒤 인기글 상태를 합쳐 경합을 피합니다.
  await loadFeed();
  await Promise.all([
    loadDailyQuestion(),
    loadSupportingContent(),
    loadRecommendedPosts(),
    loadSavedPosts()
  ]);
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
  if (submittingDailyAnswer.value) return;

  window.clearTimeout(dailyAnswerSavedTimer);
  dailyAnswerSaved.value = false;
  submittingDailyAnswer.value = true;
  errorMessage.value = '';
  try {
    await ensureCommunityProfile(viewerId.value, authStore.displayName, (authStore.user?.user_metadata.avatar_url as string | undefined) ?? null);
    const hadViewerAnswer = Boolean(dailyQuestion.value.viewerAnswer);
    const savedAnswer = await saveDailyQuestionAnswer(dailyQuestion.value.id, viewerId.value, input);
    dailyQuestion.value = {
      ...dailyQuestion.value,
      answerCount: dailyQuestion.value.answerCount + (hadViewerAnswer ? 0 : 1),
      viewerAnswer: savedAnswer
    };
    dailyAnswerSaved.value = true;
    submittingDailyAnswer.value = false;
    dailyAnswerSavedTimer = window.setTimeout(() => {
      dailyAnswerSaved.value = false;
    }, 2400);
    void checkTitlesForEvent('daily_question');
    await loadDailyQuestion();
    if (dailyAnswerListOpen.value) await loadDailyAnswers();
  } catch (error) {
    dailyAnswerSaved.value = false;
    errorMessage.value = error instanceof Error ? error.message : '답변 저장에 실패했습니다.';
  } finally {
    submittingDailyAnswer.value = false;
  }
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
    void loadSavedPosts();
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

watch([activeTab, sort], () => {
  if (activeTab.value === 'saved') {
    void loadSavedPosts();
    return;
  }

  void loadFeed();
});
watch(searchQuery, () => { window.clearTimeout(searchTimer); searchTimer = window.setTimeout(() => { void loadFeed(); }, 300); });
watch(viewerId, () => {
  window.clearTimeout(dailyAnswerSavedTimer);
  dailyAnswerSaved.value = false;
  void refresh();
});
onMounted(() => {
  window.addEventListener('resize', updatePopularScrollState);
  void refresh();
});
onScopeDispose(() => {
  window.clearTimeout(searchTimer);
  window.clearTimeout(dailyAnswerSavedTimer);
  window.removeEventListener('resize', updatePopularScrollState);
});
</script>

<template>
  <main class="community-surface mx-auto w-full max-w-md px-4 pb-16 pt-4 sm:max-w-[800px] lg:max-w-[800px] lg:px-6">
    <CommunityHeader @compose="openComposer" />
    <DailyQuestionCard class="mt-5" :question="dailyQuestion" :is-authenticated="canWrite" :loading="loadingDaily" :viewer-id="viewerId" :submitting="submittingDailyAnswer" :saved="dailyAnswerSaved" @submit="submitDailyAnswer" @login="goToLogin" @view-answers="openDailyAnswers" />
    <section
      v-if="canWrite && (loadingRecommendedPosts || recommendedPosts.length > 0)"
      class="mt-7"
      aria-labelledby="recommended-posts-title"
    >
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-app-accent">FOR YOU</p>
          <h2 id="recommended-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">추천 게시물</h2>
          <p class="mt-1 text-xs leading-5 text-app-muted">처음 보는 글 중 취향과 작성자 반응이 잘 맞는 글을 골랐어요.</p>
        </div>
        <span v-if="recommendedPosts.length > 0" class="shrink-0 text-xs font-medium text-app-muted">
          {{ recommendedPosts.length }}개
        </span>
      </div>

      <div
        v-if="loadingRecommendedPosts && recommendedPosts.length === 0"
        class="scrollbar-hide mt-4 flex gap-3 overflow-hidden"
        aria-label="추천 게시물 불러오는 중"
      >
        <div v-for="index in 3" :key="index" class="h-64 w-44 shrink-0 animate-pulse border border-app-line bg-app-panelSoft" />
      </div>
      <div
        v-else
        class="scrollbar-hide mt-4 flex max-w-full snap-x snap-proximity gap-3 overflow-x-auto scroll-smooth pb-1"
        aria-label="취향 맞춤 추천 게시물"
      >
        <CommunityPostCard
          v-for="recommendation in recommendedPosts"
          :key="recommendation.post.id"
          class="snap-start"
          :post="recommendation.post"
          compact
          :show-actions="false"
          :recommendation-reasons="getRecommendationReasonLabels(recommendation)"
          :viewer-liked="likedIds.has(recommendation.post.id)"
          :viewer-saved="savedIds.has(recommendation.post.id)"
        />
      </div>
    </section>
    <section class="mt-7" aria-labelledby="popular-posts-title">
      <div class="flex items-end justify-between gap-3">
        <div><p class="text-xs font-semibold text-app-accent">HOT TALKS</p><h2 id="popular-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">지금 뜨는 이야기</h2></div>
        <div v-if="canScrollPopularPrevious || canScrollPopularNext" class="flex shrink-0 gap-2" aria-label="인기 게시글 탐색">
          <IconButton :icon="ChevronLeft" label="이전 인기 게시글" size="sm" :disabled="!canScrollPopularPrevious" @click="scrollPopularPosts(-1)" />
          <IconButton :icon="ChevronRight" label="다음 인기 게시글" size="sm" :disabled="!canScrollPopularNext" @click="scrollPopularPosts(1)" />
        </div>
      </div>
      <div ref="popularPostScroller" class="scrollbar-hide mt-4 flex snap-x snap-proximity gap-3 overflow-x-auto scroll-smooth pb-1" aria-label="인기 게시글 가로 목록" @scroll.passive="updatePopularScrollState">
        <CommunityPostCard v-for="post in popularPosts" :key="post.id" class="snap-start" :post="post" compact :show-actions="false" :viewer-liked="likedIds.has(post.id)" :viewer-saved="savedIds.has(post.id)" :saved-list-ids="savedListIds" :saving-save="savingSaveIds.has(post.id)" @like="toggleLike" @save="toggleSave" @save-list="saveList" @vote="vote" @clear-vote="clearVote" />
      </div>
    </section>
    <section class="mt-7" aria-labelledby="latest-posts-title">
      <div class="flex items-end justify-between gap-3"><div><p class="text-xs font-semibold text-app-accent">FEED</p><h2 id="latest-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">{{ feedTitle }}</h2></div><CommunitySortMenu v-if="activeTab !== 'saved'" v-model="sort" /></div>
      <div v-if="activeTab !== 'saved'" class="mt-4"><CommunitySearchBar v-model="searchQuery" /></div>
      <div class="mt-3"><CommunityTabs v-model="activeTab" /></div>
      <p v-if="errorMessage" class="corner-soft mt-4 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ errorMessage }}</p>
      <div class="mt-4">
        <SavedCommunityPostsCard
          v-if="activeTab === 'saved'"
          :posts="savedPosts"
          :total-count="savedPostCount"
          :is-authenticated="canWrite"
          :loading="loadingSavedPosts"
        />
        <CommunityPostList v-else :posts="posts" :liked-ids="likedIds" :saved-ids="savedIds" :saved-list-ids="savedListIds" :saving-save-ids="savingSaveIds" :loading="loading" :empty-message="feedEmptyMessage" @like="toggleLike" @save="toggleSave" @save-list="saveList" @vote="vote" @clear-vote="clearVote" />
      </div>
    </section>
    <CreatePostModal :open="isComposerOpen" :lists="shareableLists" :submitting="submitting" :error-message="composerError" @close="closeComposer" @submit="submitPost" />
    <DailyQuestionAnswersModal :open="dailyAnswerListOpen" :question="dailyQuestion" :answers="dailyAnswers" :loading="loadingDailyAnswers" :error-message="dailyAnswersError" @close="dailyAnswerListOpen = false" />
  </main>
</template>
