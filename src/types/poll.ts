import type { CommunityMovieReference } from '@/types/community';

export interface CommunityPollOption {
  id: string;
  pollId: string;
  optionText: string;
  movie: null | CommunityMovieReference;
  voteCount: number;
  position: number;
}

export interface CommunityPoll {
  id: string;
  postId: string;
  question: string;
  options: CommunityPollOption[];
  viewerOptionId: null | string;
}
