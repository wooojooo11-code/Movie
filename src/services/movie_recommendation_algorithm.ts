import { NO_FAVORITE_CHARACTER } from '@/types/rating';

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
  | '모험'
  | '시간 가는 줄 몰랐어요'
  | '여운이 길게 남아요'
  | '스토리가 탄탄하고 짜임새 있어요'
  | '반전의 반전! 전개가 예측불가해요'
  | '명대사가 가슴에 와닿아요'
  | '영상미가 아름답고 색감이 예뻐요'
  | '음악/사운드가 몰입감을 높여요'
  | 'CG/액션 스케일이 압도적이에요'
  | '배우들의 연기력이 미쳤어요'
  | '아무 생각 없이 웃기 좋아요'
  | '심장이 쫄깃하고 긴장감 넘쳐요'
  | '마음이 편안해지고 힐링돼요'
  | '생각할 거리를 던져주는 영화예요'
  | '연인/친구와 데이트용으로 딱이에요'
  | '가족과 함께 보기 좋아요'
  | '혼자 집중해서 보기 좋은 영화예요'
  | 'N차 관람(재관람)하고 싶은 영화예요'
  | '예고편이 다예요'
  | '연기나 CG가 어색해요'
  | '눈가리고 싶을 정도로 잔인해요'
  | '스토리가 루즈하고 지루해요'
  | '결말이 허무하고 개연성 없어요'
  | '억지감동, 뻔한 신파극이에요'
  | '무슨 내용인지 이해불가예요'
  | '소문난 잔치에 먹을 게 없어요'
  | '알바 리뷰에 속은 기분이에요'
  | '내 2시간 돌려내요';

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

const hasMeaningfulFavoriteCharacter = (favoriteCharacter: null | string): favoriteCharacter is string =>
  Boolean(favoriteCharacter && favoriteCharacter !== NO_FAVORITE_CHARACTER);

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
  반전: ['반전', '긴장감'],
  빠른전개: ['빠른전개', '몰입감'],
  캐릭터: ['캐릭터', '캐릭터 매력'],
  유쾌함: ['유쾌함', '유머'],
  감동: ['감동', '여운', '감동적인 음악'],
  여운: ['여운', '감동', '여운 있는 결말'],
  성장: ['성장', '탄탄한 스토리'],
  모험: ['모험', '세계관'],
  '시간 가는 줄 몰랐어요': ['몰입감', '빠른전개'],
  '여운이 길게 남아요': ['여운', '감동', '여운 있는 결말'],
  '스토리가 탄탄하고 짜임새 있어요': ['탄탄한 스토리'],
  '반전의 반전! 전개가 예측불가해요': ['반전', '긴장감', '빠른전개'],
  '명대사가 가슴에 와닿아요': ['탄탄한 스토리', '감동', '여운'],
  '영상미가 아름답고 색감이 예뻐요': ['영상미', '연출', '눈이 즐거운 영상미'],
  '음악/사운드가 몰입감을 높여요': ['OST', '감동적인 음악', '몰입감'],
  'CG/액션 스케일이 압도적이에요': ['액션', '세계관'],
  '배우들의 연기력이 미쳤어요': ['배우들의 연기력'],
  '아무 생각 없이 웃기 좋아요': ['유쾌함', '유머', '코미디'],
  '심장이 쫄깃하고 긴장감 넘쳐요': ['긴장감', '몰입감', '미스터리', '스릴러'],
  '마음이 편안해지고 힐링돼요': ['감동', '여운'],
  '생각할 거리를 던져주는 영화예요': ['탄탄한 스토리', '성장'],
  '연인/친구와 데이트용으로 딱이에요': ['로맨스', '유쾌함'],
  '가족과 함께 보기 좋아요': ['감동', '유쾌함'],
  '혼자 집중해서 보기 좋은 영화예요': ['몰입감', '탄탄한 스토리'],
  'N차 관람(재관람)하고 싶은 영화예요': ['캐릭터 매력', '영상미', '여운'],
  '예고편이 다예요': ['탄탄한 스토리', '반전', '캐릭터 매력'],
  '연기나 CG가 어색해요': ['배우들의 연기력', '영상미', '연출', '액션', '세계관'],
  '눈가리고 싶을 정도로 잔인해요': ['공포', '스릴러', '액션', '긴장감'],
  '스토리가 루즈하고 지루해요': ['탄탄한 스토리', '몰입감', '빠른전개'],
  '결말이 허무하고 개연성 없어요': ['탄탄한 스토리', '여운', '감동'],
  '억지감동, 뻔한 신파극이에요': ['감동', '여운', '로맨스'],
  '무슨 내용인지 이해불가예요': ['탄탄한 스토리', '세계관'],
  '소문난 잔치에 먹을 게 없어요': ['탄탄한 스토리', '몰입감', '캐릭터 매력'],
  '알바 리뷰에 속은 기분이에요': ['탄탄한 스토리', '영상미'],
  '내 2시간 돌려내요': ['몰입감', '빠른전개']
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
    needles: ['액션', '전투', '추격', '카체이싱', '시원하다', '박진감', '터진다'],
    genres: ['액션'],
    reviewTags: ['CG/액션 스케일이 압도적이에요'],
    tags: ['액션', '몰입감']
  },
  {
    needles: ['연기', '배우', '출연', '연기력', '표정'],
    reviewTags: ['배우들의 연기력이 미쳤어요'],
    tags: ['배우들의 연기력']
  },
  {
    needles: ['스토리', '서사', '각본', '전개', '구성', '탄탄하다', '짜임새'],
    reviewTags: ['스토리가 탄탄하고 짜임새 있어요'],
    tags: ['탄탄한 스토리']
  },
  {
    needles: ['반전', '예상못', '뒤집힌다', '뜻밖', '예측불가'],
    genres: ['미스터리', '스릴러'],
    reviewTags: ['반전의 반전! 전개가 예측불가해요'],
    tags: ['반전', '긴장감']
  },
  {
    needles: ['명대사', '대사가좋다', '대사가기억난다', '대사가와닿는다'],
    reviewTags: ['명대사가 가슴에 와닿아요'],
    tags: ['탄탄한 스토리', '감동']
  },
  {
    needles: ['영상미', '비주얼', '화면', '색감', '촬영', '미장센', '장면이예쁘다'],
    reviewTags: ['영상미가 아름답고 색감이 예뻐요'],
    tags: ['영상미', '연출']
  },
  {
    needles: ['음악', 'ost', '사운드', 'bgm', '노래', '효과음'],
    reviewTags: ['음악/사운드가 몰입감을 높여요'],
    tags: ['OST', '감동적인 음악']
  },
  {
    needles: ['몰입', '집중', '빠져든다', '순식간', '시간가는줄몰랐다'],
    reviewTags: ['시간 가는 줄 몰랐어요'],
    tags: ['몰입감', '빠른전개']
  },
  {
    needles: ['긴장', '쫄깃', '손에땀', '불안', '스릴'],
    genres: ['스릴러'],
    reviewTags: ['심장이 쫄깃하고 긴장감 넘쳐요'],
    tags: ['긴장감', '몰입감']
  },
  {
    needles: ['웃기다', '웃겼다', '유머', '코미디', '빵터졌다', '유쾌하다'],
    genres: ['코미디'],
    reviewTags: ['아무 생각 없이 웃기 좋아요'],
    tags: ['유쾌함', '유머']
  },
  {
    needles: ['여운', '먹먹', '감동', '힐링', '편안', '잔잔'],
    reviewTags: ['여운이 길게 남아요'],
    tags: ['여운', '감동']
  },
  {
    needles: ['생각할거리', '생각하게', '메시지', '철학', '질문을던진다'],
    reviewTags: ['생각할 거리를 던져주는 영화예요'],
    tags: ['탄탄한 스토리', '성장']
  },
  {
    needles: ['데이트', '연인', '썸', '친구랑보기좋다'],
    genres: ['로맨스'],
    reviewTags: ['연인/친구와 데이트용으로 딱이에요'],
    tags: ['유쾌함']
  },
  {
    needles: ['가족', '부모님', '아이와', '온가족'],
    reviewTags: ['가족과 함께 보기 좋아요'],
    tags: ['감동', '유쾌함']
  },
  {
    needles: ['혼자보기좋다', '혼자집중', '혼영', '집중해서'],
    reviewTags: ['혼자 집중해서 보기 좋은 영화예요'],
    tags: ['몰입감', '탄탄한 스토리']
  },
  {
    needles: ['재관람', 'n차관람', '또보고싶다', '다시보고싶다'],
    reviewTags: ['N차 관람(재관람)하고 싶은 영화예요'],
    tags: ['캐릭터 매력', '여운']
  },
  {
    needles: ['세계관', '설정', '우주', '미래', '시간여행', '공상과학'],
    genres: ['SF'],
    reviewTags: ['CG/액션 스케일이 압도적이에요'],
    tags: ['세계관']
  },
  {
    needles: ['예고편이다', '예고편이다예요', '예고편만', '트레일러가다', '트레일러가전부'],
    reviewTags: ['예고편이 다예요'],
    tags: ['탄탄한 스토리']
  },
  {
    needles: ['어색', '발연기', 'cg티', 'cg가어색', '연기가별로'],
    genres: ['액션', 'SF'],
    reviewTags: ['연기나 CG가 어색해요'],
    tags: ['배우들의 연기력', '영상미']
  },
  {
    needles: ['잔인', '고어', '잔혹', '피범벅'],
    genres: ['공포', '스릴러'],
    reviewTags: ['눈가리고 싶을 정도로 잔인해요'],
    tags: ['긴장감']
  },
  {
    needles: ['지루', '루즈', '루즈하다', '늘어진다'],
    reviewTags: ['스토리가 루즈하고 지루해요'],
    tags: ['탄탄한 스토리', '몰입감', '빠른전개']
  },
  {
    needles: ['개연성없', '허무', '용두사미', '결말별로'],
    reviewTags: ['결말이 허무하고 개연성 없어요'],
    tags: ['탄탄한 스토리', '여운']
  },
  {
    needles: ['억지감동', '신파', '뻔한신파', '뻔하다'],
    genres: ['로맨스', '드라마'],
    reviewTags: ['억지감동, 뻔한 신파극이에요'],
    tags: ['감동', '여운']
  },
  {
    needles: ['이해불가', '난해', '무슨내용', '이해안'],
    reviewTags: ['무슨 내용인지 이해불가예요'],
    tags: ['탄탄한 스토리', '세계관']
  },
  {
    needles: ['소문난잔치', '먹을게없', '빈수레'],
    reviewTags: ['소문난 잔치에 먹을 게 없어요'],
    tags: ['탄탄한 스토리', '몰입감']
  },
  {
    needles: ['알바리뷰', '속은기분', '낚였'],
    reviewTags: ['알바 리뷰에 속은 기분이에요'],
    tags: ['탄탄한 스토리']
  },
  {
    needles: ['돌려내', '시간아깝', '내시간'],
    reviewTags: ['내 2시간 돌려내요'],
    tags: ['몰입감', '빠른전개']
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
    const dislikeRatingWeight = Math.min(0, getRatingWeight(input.rating));
    const totalDislikeWeight = DISLIKE_BASE_WEIGHT + dislikeRatingWeight;
    const dislikeTagWeight = Math.min(-1, Math.ceil(totalDislikeWeight / 2));

    for (const genre of movie.genres) {
      addScore(nextProfile.genreScores, genre, totalDislikeWeight);
    }

    for (const tag of movie.tags) {
      addScore(nextProfile.tagScores, tag, dislikeTagWeight);
    }

    for (const reviewTag of input.reviewTags) {
      addScore(nextProfile.reviewTagScores, reviewTag, -REVIEW_TAG_WEIGHT);
    }

    if (hasMeaningfulFavoriteCharacter(input.favoriteCharacter)) {
      addScore(nextProfile.characterScores, input.favoriteCharacter, -CHARACTER_WEIGHT);
    }

    const reviewTextSignals = extractReviewTextSignals(options?.reviewText ?? '');

    for (const genre of reviewTextSignals.genres) {
      addScore(nextProfile.genreScores, genre, -REVIEW_TEXT_GENRE_WEIGHT);
    }

    for (const tag of reviewTextSignals.tags) {
      addScore(nextProfile.tagScores, tag, -REVIEW_TEXT_TAG_WEIGHT);
    }

    for (const reviewTag of reviewTextSignals.reviewTags) {
      addScore(nextProfile.reviewTagScores, reviewTag, -REVIEW_TEXT_REVIEW_TAG_WEIGHT);
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

  if (hasMeaningfulFavoriteCharacter(input.favoriteCharacter)) {
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
    title: '한밤의 추격전',
    genres: ['액션', '스릴러'],
    tags: ['액션', '긴장감', '빠른전개'],
    characters: ['민재', '지윤', '강형사']
  },
  {
    id: 'movie_2',
    title: '미드나잇 패턴',
    genres: ['추리', '미스터리'],
    tags: ['반전', '탄탄한 스토리', '긴장감'],
    characters: ['서윤', '태형', '선구']
  },
  {
    id: 'movie_3',
    title: '봄날의 편지',
    genres: ['로맨스', '드라마'],
    tags: ['감동적인 음악', '여운', '배우들의 연기력'],
    characters: ['하늘', '예진', '준우']
  },
  {
    id: 'movie_4',
    title: '웃음의 온도',
    genres: ['코미디'],
    tags: ['유쾌함', '빠른전개', '캐릭터'],
    characters: ['승구', '민아', '민재']
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
    reviewTags: ['시간 가는 줄 몰랐어요', 'CG/액션 스케일이 압도적이에요'],
    favoriteCharacter: '민재',
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
