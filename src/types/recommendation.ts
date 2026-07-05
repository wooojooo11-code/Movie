import type {
  Movie,
  MovieList,
  RatingInput,
  ReviewTag,
  ScoredMovie,
  ScoredMovieList,
  SwipeStatus,
  UserPreferenceProfile
} from '@/services/movie_recommendation_algorithm';

export type MoodContext = 'normal' | 'after_exam' | 'bed_time' | 'with_friends' | 'after_academy';
export type RecommendationContextWeights = Record<MoodContext, Record<number, number>>;
export type TasteAnalysisGenre =
  | '액션'
  | '애니메이션'
  | '로맨스'
  | '코미디'
  | '추리'
  | 'SF'

export interface CatalogMovieWatchProvider {
  logoPath: null | string;
  logoUrl: null | string;
  providerId: number;
  providerName: string;
}

export interface CatalogMovieWatchProviders {
  buy: CatalogMovieWatchProvider[];
  flatrate: CatalogMovieWatchProvider[];
  link: null | string;
  region: 'KR';
  rent: CatalogMovieWatchProvider[];
}

export interface CatalogMovie extends Movie {
  genreIds?: number[];
  overview: string;
  releaseYear: number;
  tmdbMovieId: number;
  posterUrl: string;
  posterAlt: string;
  watchProvidersKr: CatalogMovieWatchProviders | null;
}

export interface CatalogMovieList extends MovieList {
  saveCount: number;
  averageRating: number;
}

export interface StoredRatingRecord {
  rawDecision: SwipeStatus | 'not_interested';
  detailCompleted: boolean;
  input: RatingInput;
  reviewText: string;
  questionText: string;
}

export interface AdditionalTasteAnalysisBatch {
  id: string;
  movieIds: string[];
  createdAt: string;
}

export interface RecommendationStateSnapshot {
  userId: string;
  profile: UserPreferenceProfile;
  ratings: StoredRatingRecord[];
  additionalTasteAnalysisBatches: AdditionalTasteAnalysisBatch[];
  dismissedRecommendationMovieIds: string[];
  selectedTasteAnalysisGenres: TasteAnalysisGenre[];
  currentContext: MoodContext;
  currentContextUpdatedAt: string;
}

export interface RatingFeedbackPayload {
  rating: number | null;
  reviewTags: ReviewTag[];
  favoriteCharacter: string | null;
  reviewText: string;
  questionText: string;
}

export interface RatedCatalogMovieRecord {
  movie: CatalogMovie;
  ratingRecord: StoredRatingRecord;
}

export interface RecommendedMoviePreview {
  id: string;
  title: string;
  posterAlt: string;
  posterUrl: string;
}

export interface RecommendedCatalogMovie extends CatalogMovie, ScoredMovie {}

export interface RecommendedCatalogList extends CatalogMovieList, ScoredMovieList {
  moviePreviews: RecommendedMoviePreview[];
  moviePreviewTitles: string[];
}
