import type { CatalogMovie, CatalogMovieList } from '@/types/recommendation';

export type SearchMatchField =
  | 'title'
  | 'director'
  | 'actor'
  | 'genre'
  | 'tag'
  | 'owner'
  | 'movie';

export interface MovieCreditsProfile {
  characters: string[];
  director: string;
  cast: string[];
}

export interface SearchableCatalogMovie extends CatalogMovie, MovieCreditsProfile {}

export interface BaseMovieListRecord extends CatalogMovieList {
  createdAt: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isPrivate: boolean;
  ratingCount: number;
  updatedAt: string;
}

export interface SharedMovieListRecord extends BaseMovieListRecord {
  canBeReshared: false;
}

export interface UserMovieListRecord extends BaseMovieListRecord {
  sourceListId?: string | null;
}

export interface DraftUserList {
  description: string;
  id: string | null;
  title: string;
  isPrivate: boolean;
  movieIds: string[];
}

export interface ListInteractionRecord {
  listId: string;
  saved: boolean;
  personalRating: number | null;
}

export interface SimilarTasteListSignal {
  listId: string;
  sharedLikeCount: number;
  similarityScore: number;
}

export interface ListsStateSnapshot {
  userId: string;
  userLists: UserMovieListRecord[];
  interactions: ListInteractionRecord[];
  /**
   * 홈처럼 런타임에 불러온 영화도 리스트 화면에서 다시 그릴 수 있도록
   * 로컬 저장소에 함께 보관하는 표시용 정보입니다.
   */
  movieSnapshots?: SearchableCatalogMovie[];
}

export interface RemoteListsPayload {
  userLists: UserMovieListRecord[];
  interactions: ListInteractionRecord[];
}

export interface MovieSearchResult {
  type: 'movie';
  movie: SearchableCatalogMovie;
  matchedBy: SearchMatchField[];
}

export interface ListSearchResult {
  type: 'list';
  list: SharedMovieListRecord | UserMovieListRecord;
  source: 'mine' | 'shared';
  matchedBy: SearchMatchField[];
}

export interface ResolvedListSearchCard extends ListSearchResult {
  movieTitles: string[];
}

export interface SearchResultsPayload {
  movies: MovieSearchResult[];
  lists: ListSearchResult[];
}

export interface ResolvedUserListCard extends UserMovieListRecord {
  moviePreviews: SearchableCatalogMovie[];
}

export interface ResolvedSharedListCard extends SharedMovieListRecord {
  moviePreviews: SearchableCatalogMovie[];
  displayAverageRating: number;
  viewerSaved: boolean;
  viewerRating: number | null;
}
