import type { ReviewTag, SwipeStatus } from '@/services/movie_recommendation_algorithm';
import type { CatalogMovie } from '@/types/recommendation';

export type RatingDecision = SwipeStatus;

export type RatingMovie = CatalogMovie;

export interface CharacterChoice {
  name: string;
  actorName: string | null;
}

export interface PositiveRatingInput {
  stars: number;
  reviewTags: ReviewTag[];
  favoriteCharacter: string | null;
  reviewText: string;
  questionText: string;
}

export interface NegativeRatingInput {
  stars: number | null;
  reviewTags: ReviewTag[];
  favoriteCharacter: string | null;
  reviewText: string;
}

export interface RatingResult {
  movieId: string;
  decision: SwipeStatus;
  feedback?: PositiveRatingInput;
}

export interface UserRatingStatus {
  userId: string;
  ratingCount: number;
}
