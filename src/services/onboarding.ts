import type { UserRatingStatus } from '@/types/rating';

export const getPostSignupRedirectPath = (status: UserRatingStatus) => {
  return '/';
};

export const shouldStartRatingFlow = (status: UserRatingStatus) => status.ratingCount === 0;
