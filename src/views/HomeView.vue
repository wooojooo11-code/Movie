<script setup lang="ts">
import { ChevronLeft, ChevronRight, Clapperboard, RefreshCw } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import MoviePosterCard from '@/components/common/MoviePosterCard.vue';
import HeroCTA from '@/components/home/HeroCTA.vue';
import TrendingMovies from '@/components/home/TrendingMovies.vue';
import RecommendationMovieSheet from '@/components/recommendations/RecommendationMovieSheet.vue';
import { trendingMovies } from '@/data/home';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { loadKobisBoxOfficeMovies } from '@/services/kobisBoxOffice';
import { useLibraryStore } from '@/services/libraryStore';
import { createRatingInput } from '@/services/ratingInput';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { NegativeRatingInput, PositiveRatingInput } from '@/types/rating';
import type { RatingFeedbackPayload, RecommendedCatalogMovie, StoredRatingRecord } from '@/types/recommendation';

const recommendationStore = useRecommendationStore();
const libraryStore = useLibraryStore();
const movies = ref(trendingMovies);
const isBoxOfficeLoading = ref(false);
const isSavingRating = ref(false);
const boxOfficeStatus = ref('KOBIS 최신 집계 정보를 불러오는 중입니다.');
const selectedMovie = ref<null | RecommendedCatalogMovie>(null);
const isSelectedTrailerOpen = ref(false);
const unexpectedMovies = ref<RecommendedCatalogMovie[]>([]);
const unexpectedMovieScroller = ref<HTMLElement | null>(null);
const quickRatingMovieIds = ref(new Set<string>());
const canScrollUnexpectedPrevious = ref(false);
const canScrollUnexpectedNext = ref(false);
let unexpectedMovieOffset = 0;
let unexpectedSnapshotUserId = '';
const UNEXPECTED_MOVIE_BATCH_SIZE = 10;

const hasTasteProfile = computed(() => recommendationStore.state.profile.totalRatings > 0);
const recommendations = computed(() => recommendationStore.contextAwareRecommendedMovies.value);
const featuredMovie = computed(() => (hasTasteProfile.value ? recommendations.value[0] ?? null : null));
const preferredGenres = computed(() =>
  Object.entries(recommendationStore.state.profile.genreScores)
    .filter(([, score]) => score > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([genre]) => genre)
);
const unexpectedMovieCandidates = computed(() => {
  const preferredGenreSet = new Set(preferredGenres.value);

  if (preferredGenreSet.size === 0) {
    return [];
  }

  const genreAffinity = (movie: RecommendedCatalogMovie) =>
    movie.genres.reduce((total, genre) => total + (recommendationStore.state.profile.genreScores[genre] ?? 0), 0);
  const preferredGenreOverlap = (movie: RecommendedCatalogMovie) =>
    movie.genres.filter((genre) => preferredGenreSet.has(genre)).length;

  return [...recommendationStore.favoritePeopleRecommendationPool.value]
    .filter(
      (movie) =>
        movie.id !== featuredMovie.value?.id &&
        movie.genres.length > 0
    )
    .sort((left, right) => {
      const preferredGenreDistance = preferredGenreOverlap(left) - preferredGenreOverlap(right);

      if (preferredGenreDistance !== 0) {
        return preferredGenreDistance;
      }

      const genreDistance = genreAffinity(left) - genreAffinity(right);

      if (genreDistance !== 0) {
        return genreDistance;
      }

      return (right.voteAverage ?? 0) - (left.voteAverage ?? 0);
    });
});
const selectedRatingRecord = computed(() => {
  if (!selectedMovie.value) return null;
  const record = recommendationStore.getStoredRatingRecord(selectedMovie.value.id);
  return record
    ? { ...record, input: { ...record.input, reviewTags: [...record.input.reviewTags], favoriteCharacters: [...record.input.favoriteCharacters] } }
    : null;
});

const openMovie = (movie: RecommendedCatalogMovie, startWithTrailer = false) => {
  selectedMovie.value = movie;
  isSelectedTrailerOpen.value = startWithTrailer;
};

const closeMovie = () => {
  selectedMovie.value = null;
  isSelectedTrailerOpen.value = false;
};

const updateQuickRatingMovieIds = (movieId: string, active: boolean) => {
  const nextIds = new Set(quickRatingMovieIds.value);
  active ? nextIds.add(movieId) : nextIds.delete(movieId);
  quickRatingMovieIds.value = nextIds;
};

const isUnexpectedMovieRated = (movieId: string) =>
  Boolean(recommendationStore.getStoredRatingRecord(movieId));

const quickRateMovie = async (movie: RecommendedCatalogMovie) => {
  if (quickRatingMovieIds.value.has(movie.id) || isUnexpectedMovieRated(movie.id)) return;

  updateQuickRatingMovieIds(movie.id, true);
  try {
    await recommendationStore.submitSwipeRating(
      movie,
      createRatingInput(recommendationStore.state.userId, movie.id, 'like'),
      { rawDecision: 'like', rawDirection: 'right', detailCompleted: true }
    );
  } finally {
    updateQuickRatingMovieIds(movie.id, false);
  }
};

const updateUnexpectedScrollState = () => {
  const scroller = unexpectedMovieScroller.value;
  if (!scroller) return;

  const maximumScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  canScrollUnexpectedPrevious.value = scroller.scrollLeft > 2;
  canScrollUnexpectedNext.value = scroller.scrollLeft < maximumScroll - 2;
};

const scrollUnexpectedMovies = (direction: -1 | 1) => {
  const scroller = unexpectedMovieScroller.value;
  if (!scroller) return;

  const firstCard = scroller.firstElementChild as HTMLElement | null;
  const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
  const distance = (firstCard?.getBoundingClientRect().width ?? scroller.clientWidth) + gap;
  scroller.scrollBy({ left: direction * distance, behavior: 'smooth' });
};

const setUnexpectedMovieBatch = (startIndex: number) => {
  const candidates = unexpectedMovieCandidates.value;
  if (candidates.length === 0) {
    unexpectedMovieOffset = 0;
    unexpectedMovies.value = [];
    return;
  }

  unexpectedMovieOffset = ((startIndex % candidates.length) + candidates.length) % candidates.length;
  const batchSize = Math.min(UNEXPECTED_MOVIE_BATCH_SIZE, candidates.length);
  unexpectedMovies.value = Array.from(
    { length: batchSize },
    (_, index) => candidates[(unexpectedMovieOffset + index) % candidates.length]
  );
};

const refreshUnexpectedMovies = () => {
  const candidates = unexpectedMovieCandidates.value;
  const candidateIndexById = new Map(candidates.map((movie, index) => [movie.id, index]));
  const currentIndexes = unexpectedMovies.value
    .map((movie) => candidateIndexById.get(movie.id))
    .filter((index): index is number => typeof index === 'number');
  const nextStartIndex = currentIndexes.length > 0
    ? Math.max(...currentIndexes) + 1
    : unexpectedMovieOffset + UNEXPECTED_MOVIE_BATCH_SIZE;

  setUnexpectedMovieBatch(nextStartIndex);
};

const refreshBoxOffice = async () => {
  if (isBoxOfficeLoading.value) return;
  isBoxOfficeLoading.value = true;
  try {
    movies.value = await loadKobisBoxOfficeMovies();
    boxOfficeStatus.value = 'KOBIS 전일 박스오피스 기준';
  } catch (error) {
    console.warn('Unable to load the latest KOBIS box office.', error);
    boxOfficeStatus.value = 'KOBIS 최신 집계를 불러오지 못해 연간 순위를 표시합니다.';
  } finally {
    isBoxOfficeLoading.value = false;
  }
};

const saveRating = async (
  input: RatingInput,
  options: { detailCompleted: boolean; feedback: RatingFeedbackPayload; rawDecision: StoredRatingRecord['rawDecision'] }
) => {
  if (!selectedMovie.value || isSavingRating.value) return;
  isSavingRating.value = true;
  try {
    await recommendationStore.submitSwipeRating(selectedMovie.value, input, options);
    closeMovie();
  } finally {
    isSavingRating.value = false;
  }
};

const saveLike = async (feedback: PositiveRatingInput) => {
  if (!selectedMovie.value) return;
  const payload: RatingFeedbackPayload = { rating: feedback.stars, reviewTags: feedback.reviewTags, favoriteCharacters: feedback.favoriteCharacters, reviewText: feedback.reviewText, questionText: feedback.questionText };
  await saveRating({ movieId: selectedMovie.value.id, userId: recommendationStore.state.userId, status: 'like', rating: payload.rating, reviewTags: payload.reviewTags, favoriteCharacters: payload.favoriteCharacters, answeredAt: new Date().toISOString() }, { rawDecision: 'like', detailCompleted: true, feedback: payload });
};

const saveDislike = async (feedback: NegativeRatingInput) => {
  if (!selectedMovie.value) return;
  const payload: RatingFeedbackPayload = { rating: feedback.stars, reviewTags: feedback.reviewTags, favoriteCharacters: feedback.favoriteCharacters, reviewText: feedback.reviewText, questionText: '' };
  await saveRating({ movieId: selectedMovie.value.id, userId: recommendationStore.state.userId, status: 'dislike', rating: payload.rating, reviewTags: payload.reviewTags, favoriteCharacters: payload.favoriteCharacters, answeredAt: new Date().toISOString() }, { rawDecision: 'dislike', detailCompleted: true, feedback: payload });
};

watch(
  [() => recommendationStore.state.userId, unexpectedMovieCandidates],
  ([userId, candidates]) => {
    if (!hasTasteProfile.value || candidates.length === 0) {
      unexpectedSnapshotUserId = userId;
      unexpectedMovies.value = [];
      return;
    }

    if (unexpectedSnapshotUserId !== userId || unexpectedMovies.value.length === 0) {
      unexpectedSnapshotUserId = userId;
      setUnexpectedMovieBatch(0);
    }
  },
  { immediate: true }
);

watch(
  () => unexpectedMovies.value.map((movie) => movie.id).join('|'),
  () => void nextTick(() => {
    if (unexpectedMovieScroller.value) unexpectedMovieScroller.value.scrollLeft = 0;
    updateUnexpectedScrollState();
  }),
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('resize', updateUnexpectedScrollState);
  updateUnexpectedScrollState();
  void refreshBoxOffice();
});

onBeforeUnmount(() => window.removeEventListener('resize', updateUnexpectedScrollState));
</script>

<template>
  <main id="top" class="mx-auto flex w-full max-w-md flex-col gap-10 px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-[800px]">
    <section v-if="featuredMovie" class="relative overflow-hidden rounded-3xl bg-[#173a5e] px-5 py-6 !text-white shadow-panel sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-7 sm:px-7 sm:py-8">
      <img :src="featuredMovie.posterUrl" alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15 blur-sm" />
      <button
        type="button"
        class="focus-ring absolute inset-0 z-10 cursor-pointer rounded-3xl"
        :aria-label="`${featuredMovie.title} 상세 정보 보기`"
        @click="openMovie(featuredMovie)"
      ></button>
      <img :src="featuredMovie.posterUrl" :alt="featuredMovie.posterAlt" class="pointer-events-none relative z-20 mx-auto aspect-[2/3] w-32 rounded-2xl object-cover shadow-xl sm:mx-0 sm:w-full" loading="lazy" />
      <div class="pointer-events-none relative z-20 mt-5 min-w-0 sm:mt-0 sm:self-center">
        <RouterLink
          to="/rating"
          class="focus-ring pointer-events-auto inline-flex min-h-9 items-center justify-center rounded-xl bg-white/15 px-3 text-xs font-semibold !text-white transition hover:bg-white/25"
          @click.stop
        >
          취향분석 하러가기
        </RouterLink>
        <h1 class="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{{ featuredMovie.title }}</h1>
        <p class="mt-3 text-sm leading-6 text-sky-50/90">{{ featuredMovie.recommendationReasons?.[0] ?? '오늘의 취향에 가장 가까운 영화예요.' }}</p>
        <div class="mt-5 flex items-center gap-3">
          <span class="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">추천 점수 {{ Math.round(featuredMovie.recommendationScore) }}점</span>
          <IconButton class="pointer-events-auto" :icon="Clapperboard" label="오늘의 추천 예고편 보기" @click.stop="openMovie(featuredMovie, true)" />
        </div>
      </div>
    </section>
    <HeroCTA v-else />

    <TrendingMovies :movies="movies" :is-loading="isBoxOfficeLoading" :status="boxOfficeStatus" @refresh="refreshBoxOffice" />

    <section v-if="hasTasteProfile && unexpectedMovies.length" aria-labelledby="unexpected-title">
      <div class="mb-4 flex items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">DISCOVER · {{ unexpectedMovies.length }}편</p>
          <h2 id="unexpected-title" class="mt-1 text-xl font-bold text-[#173a5e]">의외로 취향에 맞을 영화</h2>
        </div>
        <div class="flex shrink-0 gap-2" aria-label="의외로 취향에 맞을 영화 탐색">
          <IconButton :icon="RefreshCw" label="의외로 취향에 맞을 영화 새로고침" size="sm" @click="refreshUnexpectedMovies" />
          <IconButton :icon="ChevronLeft" label="이전 취향 영화 보기" size="sm" :disabled="!canScrollUnexpectedPrevious" @click="scrollUnexpectedMovies(-1)" />
          <IconButton :icon="ChevronRight" label="다음 취향 영화 보기" size="sm" :disabled="!canScrollUnexpectedNext" @click="scrollUnexpectedMovies(1)" />
        </div>
      </div>
      <div ref="unexpectedMovieScroller" class="movie-shelf scroll-smooth" @scroll.passive="updateUnexpectedScrollState">
        <MoviePosterCard v-for="movie in unexpectedMovies" :key="movie.id" :movie="movie" :rating="quickRatingMovieIds.has(movie.id)" :rated="isUnexpectedMovieRated(movie.id)" :saved="libraryStore.hasMovie(movie.id)" @open="openMovie(movie)" @rate="quickRateMovie(movie)" @save="libraryStore.toggleMovie(movie.id)" @trailer="openMovie(movie, true)" />
      </div>
    </section>
  </main>

  <RecommendationMovieSheet
    v-if="selectedMovie"
    :movie="selectedMovie"
    :rating-record="selectedRatingRecord"
    :is-saving-rating="isSavingRating"
    :start-with-trailer="isSelectedTrailerOpen"
    @close="closeMovie"
    @rate-like-submit="saveLike"
    @rate-dislike-submit="saveDislike"
  />
</template>
