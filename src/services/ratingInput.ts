import type { RatingInput, SwipeStatus } from '@/services/movie_recommendation_algorithm';

type RatingInputDetails = Partial<Pick<RatingInput, 'rating' | 'reviewTags' | 'favoriteCharacters'>>;

/**
 * Builds the normalized rating payload used by every rating surface.
 * Arrays are copied so form state cannot be mutated after submission.
 */
export const createRatingInput = (
  userId: string,
  movieId: string,
  status: SwipeStatus,
  details: RatingInputDetails = {}
): RatingInput => ({
  movieId,
  userId,
  status,
  rating: details.rating ?? null,
  reviewTags: details.reviewTags ? [...details.reviewTags] : [],
  favoriteCharacters: details.favoriteCharacters ? [...details.favoriteCharacters] : [],
  answeredAt: new Date().toISOString()
});
