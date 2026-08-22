<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import MoviePosterCard from '@/components/common/MoviePosterCard.vue';
import HeroCTA from '@/components/home/HeroCTA.vue';
import TrendingMovies from '@/components/home/TrendingMovies.vue';
import RecommendationMovieSheet from '@/components/recommendations/RecommendationMovieSheet.vue';
import { Clapperboard } from 'lucide-vue-next';
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
const unexpectedMovies = computed(() => {
  const preferredGenreSet = new Set(preferredGenres.value);

  if (preferredGenreSet.size === 0) {
    return [];
  }

  const genreAffinity = (movie: RecommendedCatalogMovie) =>
    movie.genres.reduce((total, genre) => total + (recommendationStore.state.profile.genreScores[genre] ?? 0), 0);

  return [...recommendationStore.favoritePeopleRecommendationPool.value]
    .filter(
      (movie) =>
        movie.id !== featuredMovie.value?.id &&
        movie.genres.length > 0 &&
        movie.genres.every((genre) => !preferredGenreSet.has(genre))
    )
    .sort((left, right) => {
      const genreDistance = genreAffinity(left) - genreAffinity(right);

      if (genreDistance !== 0) {
        return genreDistance;
      }

      return (right.voteAverage ?? 0) - (left.voteAverage ?? 0);
    })
    .slice(0, 10);
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

const quickRateMovie = (movie: RecommendedCatalogMovie) =>
  recommendationStore.submitSwipeRating(
    movie,
    createRatingInput(recommendationStore.state.userId, movie.id, 'like'),
    { rawDecision: 'like', rawDirection: 'right', detailCompleted: true }
  );

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

onMounted(() => void refreshBoxOffice());
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
          <span class="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">취향 일치 {{ Math.round(featuredMovie.recommendationScore) }}%</span>
          <IconButton class="pointer-events-auto" :icon="Clapperboard" label="오늘의 추천 예고편 보기" @click.stop="openMovie(featuredMovie, true)" />
        </div>
      </div>
    </section>
    <HeroCTA v-else />

    <TrendingMovies :movies="movies" :is-loading="isBoxOfficeLoading" :status="boxOfficeStatus" @refresh="refreshBoxOffice" />

    <section v-if="hasTasteProfile && unexpectedMovies.length" aria-labelledby="unexpected-title">
      <div class="mb-4">
        <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">DISCOVER</p>
        <h2 id="unexpected-title" class="mt-1 text-xl font-bold text-[#173a5e]">의외로 취향에 맞을 영화</h2>
      </div>
      <div class="movie-shelf">
        <MoviePosterCard v-for="movie in unexpectedMovies" :key="movie.id" :movie="movie" :saved="libraryStore.hasMovie(movie.id)" @open="openMovie(movie)" @rate="quickRateMovie(movie)" @save="libraryStore.toggleMovie(movie.id)" @trailer="openMovie(movie, true)" />
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
