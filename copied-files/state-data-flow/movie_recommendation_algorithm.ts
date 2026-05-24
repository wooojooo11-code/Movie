export type SwipeStatus = 'not_seen' | 'dislike' | 'like';

export type ReviewTag =
  | '액션'
  | '배우들의 연기력'
  | '탄탄한 스토리'
  | '눈이 즐거운 영상미'
  | '감동적인 음악'
  | '여운 있는 결말'
  | '영상미'
  | '연출'
  | '세계관'
  | 'OST'
  | '캐릭터 매력'
  | '유머'
  | '몰입감'
  | '긴장감'
  | '반전'
  | '빠른전개'
  | '캐릭터'
  | '유쾌함'
  | '감동'
  | '여운'
  | '성장'
  | '모험';

export interface Movie {
  id: string;
  title: string;
  genres: string[];
  tags: string[];
  characters: string[];
}

export interface MovieList {
  id: string;
  title: string;
  movieIds: string[];
}

export interface RatingInput {
  movieId: string;
  userId: string;
  status: SwipeStatus;
  rating: number | null;
  reviewTags: ReviewTag[];
  favoriteCharacter: string | null;
  answeredAt: string;
}

export interface UserPreferenceProfile {
  userId: string;
  genreScores: Record<string, number>;
  tagScores: Record<string, number>;
  reviewTagScores: Record<string, number>;
  characterScores: Record<string, number>;
  totalRatings: number;
}

export const RATING_WEIGHT_MAP: Record<number, number> = {
  0.5: -3,
  1.0: -3,
  1.5: -2,
  2.0: -2,
  2.5: -1,
  3.0: 0,
  3.5: 1,
  4.0: 2,
  4.5: 3,
  5.0: 4
};

const LIKE_BASE_WEIGHT = 3;
const DISLIKE_BASE_WEIGHT = -2;
const REVIEW_TAG_WEIGHT = 2;
const CHARACTER_WEIGHT = 1;

const REVIEW_TAG_MATCH_MAP: Record<ReviewTag, string[]> = {
  액션: ['액션'],
  '배우들의 연기력': ['배우들의 연기력'],
  '탄탄한 스토리': ['탄탄한 스토리'],
  '눈이 즐거운 영상미': ['눈이 즐거운 영상미', '영상미', '연출'],
  '감동적인 음악': ['감동적인 음악', 'OST'],
  '여운 있는 결말': ['여운 있는 결말', '여운'],
  영상미: ['영상미', '눈이 즐거운 영상미', '연출'],
  연출: ['연출', '영상미', '눈이 즐거운 영상미'],
  세계관: ['세계관', '모험'],
  OST: ['OST', '감동적인 음악'],
  '캐릭터 매력': ['캐릭터 매력', '캐릭터'],
  유머: ['유머', '유쾌함'],
  몰입감: ['몰입감', '긴장감', '빠른전개'],
  긴장감: ['긴장감', '몰입감'],
  반전: ['반전'],
  빠른전개: ['빠른전개', '몰입감'],
  캐릭터: ['캐릭터', '캐릭터 매력'],
  유쾌함: ['유쾌함', '유머'],
  감동: ['감동', '감동적인 음악'],
  여운: ['여운', '여운 있는 결말'],
  성장: ['성장'],
  모험: ['모험', '세계관']
};

export function createEmptyUserPreferenceProfile(userId: string): UserPreferenceProfile {
  return {
    userId,
    genreScores: {},
    tagScores: {},
    reviewTagScores: {},
    characterScores: {},
    totalRatings: 0
  };
}

function addScore(map: Record<string, number>, key: string, delta: number): void {
  map[key] = (map[key] ?? 0) + delta;
}

function getRatingWeight(rating: number | null): number {
  if (rating == null) {
    return 0;
  }

  return RATING_WEIGHT_MAP[rating] ?? 0;
}

export function applyRatingToProfile(
  profile: UserPreferenceProfile,
  movie: Movie,
  input: RatingInput
): UserPreferenceProfile {
  const nextProfile: UserPreferenceProfile = {
    ...profile,
    genreScores: { ...profile.genreScores },
    tagScores: { ...profile.tagScores },
    reviewTagScores: { ...profile.reviewTagScores },
    characterScores: { ...profile.characterScores },
    totalRatings: profile.totalRatings + 1
  };

  if (input.status === 'not_seen') {
    return nextProfile;
  }

  if (input.status === 'dislike') {
    for (const genre of movie.genres) {
      addScore(nextProfile.genreScores, genre, DISLIKE_BASE_WEIGHT);
    }

    for (const tag of movie.tags) {
      addScore(nextProfile.tagScores, tag, -1);
    }

    return nextProfile;
  }

  const ratingWeight = getRatingWeight(input.rating);
  const totalLikeWeight = LIKE_BASE_WEIGHT + ratingWeight;

  for (const genre of movie.genres) {
    addScore(nextProfile.genreScores, genre, totalLikeWeight);
  }

  for (const tag of movie.tags) {
    addScore(nextProfile.tagScores, tag, Math.max(1, Math.floor(totalLikeWeight / 2)));
  }

  for (const reviewTag of input.reviewTags) {
    addScore(nextProfile.reviewTagScores, reviewTag, REVIEW_TAG_WEIGHT);
  }

  if (input.favoriteCharacter) {
    addScore(nextProfile.characterScores, input.favoriteCharacter, CHARACTER_WEIGHT);
  }

  return nextProfile;
}

export function calculateMovieRecommendationScore(
  movie: Movie,
  profile: UserPreferenceProfile
): number {
  let score = 0;

  for (const genre of movie.genres) {
    score += profile.genreScores[genre] ?? 0;
  }

  for (const tag of movie.tags) {
    score += profile.tagScores[tag] ?? 0;
  }

  for (const reviewTag of Object.keys(profile.reviewTagScores) as ReviewTag[]) {
    const matches = REVIEW_TAG_MATCH_MAP[reviewTag] ?? [reviewTag];

    if (
      matches.some((match) => movie.tags.includes(match)) ||
      matches.some((match) => movie.genres.includes(match))
    ) {
      score += profile.reviewTagScores[reviewTag] ?? 0;
    }
  }

  return score;
}

export interface ScoredMovie extends Movie {
  recommendationScore: number;
}

export function recommendMovies(
  movies: Movie[],
  profile: UserPreferenceProfile,
  options?: { excludeMovieIds?: string[]; limit?: number }
): ScoredMovie[] {
  const excludeIds = new Set(options?.excludeMovieIds ?? []);
  const limit = options?.limit ?? 10;

  return movies
    .filter((movie) => !excludeIds.has(movie.id))
    .map((movie) => ({
      ...movie,
      recommendationScore: calculateMovieRecommendationScore(movie, profile)
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

export function calculateListRecommendationScore(
  list: MovieList,
  movieMap: Record<string, Movie>,
  profile: UserPreferenceProfile
): number {
  const moviesInList = list.movieIds
    .map((movieId) => movieMap[movieId])
    .filter((movie): movie is Movie => Boolean(movie));

  if (moviesInList.length === 0) {
    return 0;
  }

  const totalScore = moviesInList.reduce((sum, movie) => {
    return sum + calculateMovieRecommendationScore(movie, profile);
  }, 0);

  return totalScore / moviesInList.length;
}

export interface ScoredMovieList extends MovieList {
  recommendationScore: number;
}

export function recommendLists(
  lists: MovieList[],
  movies: Movie[],
  profile: UserPreferenceProfile,
  limit = 5
): ScoredMovieList[] {
  const movieMap = Object.fromEntries(movies.map((movie) => [movie.id, movie]));

  return lists
    .map((list) => ({
      ...list,
      recommendationScore: calculateListRecommendationScore(list, movieMap, profile)
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

export const mockMovies: Movie[] = [
  {
    id: 'movie_1',
    title: '도심의 추격자',
    genres: ['액션', '스릴러'],
    tags: ['액션', '긴장감', '빠른전개'],
    characters: ['민준', '지수', '강형사']
  },
  {
    id: 'movie_2',
    title: '미드나잇 퍼즐',
    genres: ['추리', '미스터리'],
    tags: ['반전', '탄탄한 스토리', '긴장감'],
    characters: ['서윤', '도형', '한검사']
  },
  {
    id: 'movie_3',
    title: '봄날의 편지',
    genres: ['로맨스', '드라마'],
    tags: ['감동적인 음악', '여운', '배우들의 연기력'],
    characters: ['하린', '우진', '선우']
  },
  {
    id: 'movie_4',
    title: '웃음의 온도',
    genres: ['코미디'],
    tags: ['유쾌함', '빠른전개', '캐릭터'],
    characters: ['동구', '세아', '민재']
  }
];

export const mockLists: MovieList[] = [
  {
    id: 'list_1',
    title: '반전 있는 영화 모음',
    movieIds: ['movie_2', 'movie_1']
  },
  {
    id: 'list_2',
    title: '비 오는 날 보기 좋은 영화',
    movieIds: ['movie_3']
  }
];

export function exampleUsage() {
  const userId = 'user_1';
  const initialProfile = createEmptyUserPreferenceProfile(userId);

  const rating1: RatingInput = {
    movieId: 'movie_1',
    userId,
    status: 'like',
    rating: 4.5,
    reviewTags: ['액션', '탄탄한 스토리'],
    favoriteCharacter: '민준',
    answeredAt: new Date().toISOString()
  };

  const rating2: RatingInput = {
    movieId: 'movie_3',
    userId,
    status: 'dislike',
    rating: null,
    reviewTags: [],
    favoriteCharacter: null,
    answeredAt: new Date().toISOString()
  };

  const profileAfterRating1 = applyRatingToProfile(initialProfile, mockMovies[0], rating1);
  const finalProfile = applyRatingToProfile(profileAfterRating1, mockMovies[2], rating2);

  const movieRecommendations = recommendMovies(mockMovies, finalProfile, {
    excludeMovieIds: ['movie_1', 'movie_3'],
    limit: 3
  });

  const listRecommendations = recommendLists(mockLists, mockMovies, finalProfile, 3);

  return {
    finalProfile,
    movieRecommendations,
    listRecommendations
  };
}
