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
const REVIEW_TEXT_TAG_WEIGHT = 1;
const REVIEW_TEXT_GENRE_WEIGHT = 1;
const REVIEW_TEXT_REVIEW_TAG_WEIGHT = 1;

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

const normalizeReviewText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/gu, '')
    .replace(/[!?,.~"'`()[\]{}:;/-]+/gu, '');

const REVIEW_TEXT_KEYWORD_RULES: Array<{
  genres?: string[];
  needles: string[];
  reviewTags?: ReviewTag[];
  tags?: string[];
}> = [
  {
    needles: ['액션', '전투', '추격', '카체이싱', '시원하다', '박진감', '스릴있다'],
    genres: ['액션'],
    reviewTags: ['액션', '몰입감'],
    tags: ['액션', '몰입감']
  },
  {
    needles: ['연기', '배우', '호연', '연기력', '표정'],
    reviewTags: ['배우들의 연기력'],
    tags: ['배우들의 연기력']
  },
  {
    needles: ['스토리', '서사', '각본', '전개', '구성', '촘촘하다'],
    reviewTags: ['탄탄한 스토리'],
    tags: ['탄탄한 스토리']
  },
  {
    needles: ['영상미', '비주얼', '화면', '색감', '촬영', '미장센', '장면이예쁘다'],
    reviewTags: ['영상미', '연출'],
    tags: ['영상미', '연출']
  },
  {
    needles: ['연출', '연출력', '디테일', '구도', '장면연출'],
    reviewTags: ['연출'],
    tags: ['연출']
  },
  {
    needles: ['음악', 'ost', '사운드', 'bgm', '노래', '테마곡'],
    reviewTags: ['감동적인 음악', 'OST'],
    tags: ['감동적인 음악', 'OST']
  },
  {
    needles: ['결말', '엔딩', '마지막장면', '끝나고도', '엔딩이좋다'],
    reviewTags: ['여운 있는 결말', '여운'],
    tags: ['여운 있는 결말', '여운']
  },
  {
    needles: ['세계관', '설정', '우주', '미래', '시간여행', '디스토피아', '공상과학'],
    genres: ['SF'],
    reviewTags: ['세계관'],
    tags: ['세계관']
  },
  {
    needles: ['캐릭터', '주인공', '매력', '케미', '관계성'],
    reviewTags: ['캐릭터 매력'],
    tags: ['캐릭터 매력', '캐릭터']
  },
  {
    needles: ['웃기다', '웃겼다', '유머', '코미디', '빵터졌다', '재치있다'],
    genres: ['코미디'],
    reviewTags: ['유머', '유쾌함'],
    tags: ['유머', '유쾌함']
  },
  {
    needles: ['몰입', '집중', '빠져든다', '순식간', '시간가는줄몰랐다'],
    reviewTags: ['몰입감'],
    tags: ['몰입감']
  },
  {
    needles: ['긴장', '쫄깃', '손에땀', '불안', '서스펜스'],
    genres: ['스릴러'],
    reviewTags: ['긴장감'],
    tags: ['긴장감']
  },
  {
    needles: ['반전', '예상못', '뒤집힌다', '예측불가', '의외'],
    genres: ['미스터리', '스릴러'],
    reviewTags: ['반전'],
    tags: ['반전']
  },
  {
    needles: ['빠른전개', '템포', '속도감', '전개가빠르다'],
    reviewTags: ['빠른전개'],
    tags: ['빠른전개', '몰입감']
  },
  {
    needles: ['감동', '울컥', '눈물', '먹먹', '뭉클'],
    reviewTags: ['감동'],
    tags: ['감동']
  },
  {
    needles: ['여운', '계속생각난다', '곱씹게된다', '잔상이남는다'],
    reviewTags: ['여운'],
    tags: ['여운']
  },
  {
    needles: ['성장', '성숙', '변화', '자라난다'],
    reviewTags: ['성장'],
    tags: ['성장']
  },
  {
    needles: ['모험', '여정', '여행', '탐험'],
    reviewTags: ['모험'],
    tags: ['모험']
  },
  {
    needles: ['설렌다', '설렘', '로맨스', '사랑', '연애', '케미가좋다'],
    genres: ['로맨스'],
    reviewTags: ['감동', '여운'],
    tags: ['감동', '여운']
  }
];

const extractReviewTextSignals = (reviewText: string) => {
  const normalizedReviewText = normalizeReviewText(reviewText);

  if (!normalizedReviewText) {
    return {
      genres: [] as string[],
      reviewTags: [] as ReviewTag[],
      tags: [] as string[]
    };
  }

  const genres = new Set<string>();
  const tags = new Set<string>();
  const reviewTags = new Set<ReviewTag>();

  for (const rule of REVIEW_TEXT_KEYWORD_RULES) {
    const isMatched = rule.needles.some((needle) =>
      normalizedReviewText.includes(normalizeReviewText(needle))
    );

    if (!isMatched) {
      continue;
    }

    for (const genre of rule.genres ?? []) {
      genres.add(genre);
    }

    for (const tag of rule.tags ?? []) {
      tags.add(tag);
    }

    for (const reviewTag of rule.reviewTags ?? []) {
      reviewTags.add(reviewTag);
    }
  }

  return {
    genres: [...genres],
    reviewTags: [...reviewTags],
    tags: [...tags]
  };
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
  input: RatingInput,
  options?: {
    reviewText?: string;
  }
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

  const reviewTextSignals = extractReviewTextSignals(options?.reviewText ?? '');

  for (const genre of reviewTextSignals.genres) {
    addScore(nextProfile.genreScores, genre, REVIEW_TEXT_GENRE_WEIGHT);
  }

  for (const tag of reviewTextSignals.tags) {
    addScore(nextProfile.tagScores, tag, REVIEW_TEXT_TAG_WEIGHT);
  }

  for (const reviewTag of reviewTextSignals.reviewTags) {
    addScore(nextProfile.reviewTagScores, reviewTag, REVIEW_TEXT_REVIEW_TAG_WEIGHT);
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
