import type { UserRatingStatus } from '@/types/rating';

export const getPostSignupRedirectPath = (status: UserRatingStatus) => {
  if (status.ratingCount === 0) {
    return '/rating';
  }

  return '/recommendations';
};

export const shouldStartRatingFlow = (status: UserRatingStatus) => status.ratingCount === 0;
