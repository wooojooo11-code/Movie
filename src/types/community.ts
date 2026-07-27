import type { CommunityPoll } from '@/types/poll';
import type { RecommendationRelay } from '@/types/relay';

/** 커뮤니티 탭과 DB category 값을 분리해 오타를 방지합니다. */
export type CommunityCategory =
  | 'movie_recommendation'
  | 'list_share'
  | 'mission_proof'
  | 'movie_poll'
  | 'daily_question';

export type CommunityTab = 'all' | CommunityCategory;
export type CommunitySort = 'latest' | 'popular' | 'comments' | 'saves';

export interface CommunityProfile {
  id: string;
  nickname: string;
  avatarUrl: null | string;
}

export interface CommunityMovieReference {
  /** 앱 카탈로그의 영화 ID입니다. 예: movie_42 */
  id: string;
  title: string;
  posterPath: null | string;
  releaseYear?: null | number;
}

export interface CommunityListReference {
  id: string;
  title: string;
  description: string;
  movieIds: string[];
  saveCount: number;
}

export interface MissionProof {
  missionId: null | string;
  missionName: string;
  movie: null | CommunityMovieReference;
  reflection: string;
  imageUrl: null | string;
  completedAt: string;
  badgeLabel: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  category: CommunityCategory;
  title: string;
  content: string;
  movie: null | CommunityMovieReference;
  list: null | CommunityListReference;
  imageUrl: null | string;
  hasSpoiler: boolean;
  author: CommunityProfile;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
  poll?: CommunityPoll;
  missionProof?: MissionProof;
}

export interface CommunityPostDetail extends CommunityPost {
  relays: RecommendationRelay[];
  viewer: {
    hasLiked: boolean;
    hasSaved: boolean;
    isFollowingAuthor: boolean;
  };
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommunityProfile;
}

export interface DailyQuestion {
  id: string;
  question: string;
  activeDate: string;
  answerCount: number;
  viewerAnswer: null | DailyQuestionAnswer;
}

export interface DailyQuestionAnswer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommunityProfile;
}

export interface CommunityPostDraft {
  category: CommunityCategory;
  title: string;
  content: string;
  movie: null | CommunityMovieReference;
  listId: null | string;
  imageUrl: string;
  hasSpoiler: boolean;
  pollQuestion: string;
  pollOptions: Array<{ optionText: string; movie: null | CommunityMovieReference }>;
  mission: {
    id: null | string;
    name: string;
    movie: null | CommunityMovieReference;
    reflection: string;
    imageUrl: string;
    completedAt: string;
    badgeLabel: string;
  };
}

const cloneMovieReference = (movie: CommunityPostDraft['movie']) => (movie ? { ...movie } : null);

export const cloneCommunityPostDraft = (draft: CommunityPostDraft): CommunityPostDraft => ({
  ...draft,
  movie: cloneMovieReference(draft.movie),
  pollOptions: draft.pollOptions.map((option) => ({ ...option, movie: cloneMovieReference(option.movie) })),
  mission: { ...draft.mission, movie: cloneMovieReference(draft.mission.movie) }
});

export const isCommunityPostDraftSubmittable = (draft: CommunityPostDraft) => {
  if (!draft.title.trim()) return false;
  if (draft.category === 'list_share') return Boolean(draft.listId);
  if (draft.category === 'movie_poll') return draft.pollOptions.filter((option) => option.optionText.trim()).length >= 2;
  return draft.category !== 'mission_proof' || Boolean(draft.mission.name.trim());
};

export interface CommunityFeedPage {
  posts: CommunityPost[];
  hasMore: boolean;
}

export const COMMUNITY_CATEGORY_LABELS: Record<CommunityCategory, string> = {
  movie_recommendation: '영화 추천',
  list_share: '리스트 공유',
  mission_proof: '미션 인증',
  movie_poll: '영화 투표',
  daily_question: '오늘의 질문'
};

export const COMMUNITY_TABS: Array<{ id: CommunityTab; label: string }> = [
  { id: 'all', label: '전체' },
  ...Object.entries(COMMUNITY_CATEGORY_LABELS).map(([id, label]) => ({ id: id as CommunityCategory, label }))
];

export const COMMUNITY_SORTS: Array<{ id: CommunitySort; label: string }> = [
  { id: 'latest', label: '최신순' },
  { id: 'popular', label: '인기순' },
  { id: 'comments', label: '댓글 많은 순' },
  { id: 'saves', label: '저장 많은 순' }
];

export const createEmptyCommunityPostDraft = (): CommunityPostDraft => ({
  category: 'movie_recommendation',
  title: '',
  content: '',
  movie: null,
  listId: null,
  imageUrl: '',
  hasSpoiler: false,
  pollQuestion: '',
  pollOptions: [
    { optionText: '', movie: null },
    { optionText: '', movie: null }
  ],
  mission: {
    id: null,
    name: '',
    movie: null,
    reflection: '',
    imageUrl: '',
    completedAt: new Date().toISOString().slice(0, 10),
    badgeLabel: 'MISSION COMPLETE'
  }
});
