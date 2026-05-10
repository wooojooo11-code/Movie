import type {
  Movie,
  MovieList,
  RatingInput,
  ReviewTag,
  SwipeStatus,
  ScoredMovie,
  ScoredMovieList,
  UserPreferenceProfile
} from '@/services/movie_recommendation_algorithm';

export interface CatalogMovie extends Movie {
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

export interface RecommendationStateSnapshot {
  userId: string;
  profile: UserPreferenceProfile;
  ratings: StoredRatingRecord[];
  dismissedRecommendationMovieIds: string[];
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

export interface RecommendedCatalogMovie extends CatalogMovie, ScoredMovie {}

export interface RecommendedCatalogList extends CatalogMovieList, ScoredMovieList {
  moviePreviewTitles: string[];
}
