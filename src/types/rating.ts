import type { ReviewTag, SwipeStatus } from '@/services/movie_recommendation_algorithm';
import type { CatalogMovie } from '@/types/recommendation';

export type RatingDecision = SwipeStatus;
export type RatingDirection = 'up' | 'left' | 'right' | 'down' | 'enter';

export type RatingMovie = CatalogMovie;

export interface RatingSelection {
  decision: RatingDecision | 'not_interested';
  direction: RatingDirection;
}

export const NO_FAVORITE_CHARACTER = '선택안함';
export const MAX_FAVORITE_CAST_CHOICES = 3;

export const normalizeFavoriteCharacters = (
  value: null | readonly string[] | string | undefined
) => {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];

  return [
    ...new Set(
      source
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry && entry !== NO_FAVORITE_CHARACTER)
    )
  ].slice(0, MAX_FAVORITE_CAST_CHOICES);
};

export interface CharacterChoice {
  name: string;
  actorName: string | null;
}

export interface PositiveRatingInput {
  stars: number;
  reviewTags: ReviewTag[];
  favoriteCharacters: string[];
  reviewText: string;
  questionText: string;
}

export interface NegativeRatingInput {
  stars: number | null;
  reviewTags: ReviewTag[];
  favoriteCharacters: string[];
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
