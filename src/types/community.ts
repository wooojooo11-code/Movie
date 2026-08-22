import type { CommunityPoll } from '@/types/poll';
import type { SituationPresetId } from '@/types/recommendation';
import type { RecommendationRelay } from '@/types/relay';

/** 화면 탭과 DB category 값을 같은 타입으로 관리합니다. */
export type CommunityCategory =
  | 'movie_recommendation'
  | 'list_share'
  | 'movie_poll'
  | 'daily_question';

export type CommunityTab = 'all' | 'saved' | CommunityCategory;
export type CommunitySort = 'latest' | 'popular' | 'comments' | 'saves';

export interface CommunityProfile {
  id: string;
  nickname: string;
  avatarUrl: null | string;
}

export interface CommunityMovieReference {
  /** 앱 카탈로그 영화 ID입니다. 예: movie_42 */
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

export interface CommunityPost {
  id: string;
  userId: string;
  category: CommunityCategory;
  title: string;
  content: string;
  /** 이전 게시글 호환용 첫 번째 관련 영화입니다. */
  movie: null | CommunityMovieReference;
  /** 게시글에 연결한 관련 영화 전체 목록입니다. */
  movies: CommunityMovieReference[];
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
}

export interface CommunityPostDetail extends CommunityPost {
  /** 이전 추천 릴레이 데이터 호환용 필드이며, 현재 화면에는 표시하지 않습니다. */
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
  /** 선택하면 이 댓글은 '다음 영화 추천 댓글'로 표시됩니다. */
  movie: null | CommunityMovieReference;
  createdAt: string;
  updatedAt: string;
  author: CommunityProfile;
}

export interface DailyQuestion {
  id: string;
  question: string;
  activeDate: string;
  situationPresetId: null | SituationPresetId;
  answerCount: number;
  viewerAnswer: null | DailyQuestionAnswer;
}

export interface DailyQuestionAnswer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  movie: null | CommunityMovieReference;
  createdAt: string;
  updatedAt: string;
  author: CommunityProfile;
}

export interface DailyQuestionAnswerInput {
  content: string;
  movie: CommunityMovieReference;
}

export interface CommunityPostDraft {
  category: CommunityCategory;
  title: string;
  content: string;
  movie: null | CommunityMovieReference;
  /** 작성 중 추가한 관련 영화이며 개수 제한은 없습니다. */
  movies: CommunityMovieReference[];
  listId: null | string;
  imageUrl: string;
  hasSpoiler: boolean;
  pollQuestion: string;
  pollOptions: Array<{ optionText: string; movie: null | CommunityMovieReference }>;
}

const cloneMovieReference = (movie: null | CommunityMovieReference) => (movie ? { ...movie } : null);

export const cloneCommunityPostDraft = (draft: CommunityPostDraft): CommunityPostDraft => ({
  ...draft,
  movie: cloneMovieReference(draft.movie),
  movies: draft.movies.map((movie) => ({ ...movie })),
  pollOptions: draft.pollOptions.map((option) => ({ ...option, movie: cloneMovieReference(option.movie) }))
});

export const isCommunityPostDraftSubmittable = (draft: CommunityPostDraft) => {
  if (!draft.title.trim()) return false;
  if (draft.category === 'list_share') return Boolean(draft.listId);
  if (draft.category === 'movie_poll') return draft.pollOptions.filter((option) => option.optionText.trim()).length >= 2;
  return true;
};

export interface CommunityFeedPage {
  posts: CommunityPost[];
  hasMore: boolean;
}

export const COMMUNITY_CATEGORY_LABELS: Record<CommunityCategory, string> = {
  movie_recommendation: '영화 추천',
  list_share: '리스트 공유',
  movie_poll: '영화 투표',
  daily_question: '오늘의 질문'
};

export const COMMUNITY_TABS: Array<{ id: CommunityTab; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'movie_recommendation', label: COMMUNITY_CATEGORY_LABELS.movie_recommendation },
  { id: 'list_share', label: COMMUNITY_CATEGORY_LABELS.list_share },
  { id: 'movie_poll', label: COMMUNITY_CATEGORY_LABELS.movie_poll },
  { id: 'saved', label: '저장한 글' },
  { id: 'daily_question', label: COMMUNITY_CATEGORY_LABELS.daily_question }
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
  movies: [],
  listId: null,
  imageUrl: '',
  hasSpoiler: false,
  pollQuestion: '',
  pollOptions: [
    { optionText: '', movie: null },
    { optionText: '', movie: null }
  ]
});
