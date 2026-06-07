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

export interface CatalogMovie extends Movie {
  genreIds?: number[];
  releaseYear: number;
  posterUrl: string;
  posterAlt: string;
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
  currentContext: MoodContext;
  currentContextUpdatedAt: string;
}

export interface RatingFeedbackPayload {
  rating: number;
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
