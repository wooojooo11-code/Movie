import type { CommunityMovieReference, CommunityProfile } from '@/types/community';

export interface RecommendationRelay {
  id: string;
  postId: string;
  parentRelayId: null | string;
  movie: CommunityMovieReference;
  author: CommunityProfile;
  reason: string;
  createdAt: string;
}
