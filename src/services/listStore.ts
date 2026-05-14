import { computed, reactive, readonly, ref } from 'vue';

import { catalogMovies } from '@/data/catalog';
import { mockSharedLists } from '@/data/lists';
import { movieCreditsById } from '@/data/movieCredits';
import { localListRepository, remoteListRepository } from '@/services/listRepository';
import { mockListSearchService } from '@/services/listSearchService';
import type {
  DraftUserList,
  ListInteractionRecord,
  ListSearchResult,
  ListsStateSnapshot,
  MovieSearchResult,
  ResolvedSharedListCard,
  ResolvedUserListCard,
  SearchableCatalogMovie,
  UserMovieListRecord
} from '@/types/lists';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const createEmptyDraft = (): DraftUserList => ({
  id: null,
  title: '',
  isPrivate: false,
  movieIds: []
});

const searchableMovies = catalogMovies.map((movie) => ({
  ...movie,
  director: movieCreditsById[movie.id]?.director ?? '감독 미상',
  cast: movieCreditsById[movie.id]?.cast ?? []
})) as SearchableCatalogMovie[];

const movieMap = Object.fromEntries(searchableMovies.map((movie) => [movie.id, movie])) as Record<
  string,
  SearchableCatalogMovie
>;

const normalizeSnapshot = (userId: string, snapshot: ListsStateSnapshot | null): ListsStateSnapshot => {
  if (!snapshot) {
    return {
      userId,
      userLists: [],
      interactions: []
    };
  }

  return {
    userId,
    userLists: (snapshot.userLists ?? []).map((list) => ({
      ...list,
      sourceListId: list.sourceListId ?? null
    })),
    interactions: snapshot.interactions ?? []
  };
};

const initialSnapshot = normalizeSnapshot(FALLBACK_USER_ID, localListRepository.load(FALLBACK_USER_ID));

const state = reactive({
  userId: initialSnapshot.userId,
  userLists: initialSnapshot.userLists,
  interactions: initialSnapshot.interactions,
  draft: createEmptyDraft(),
  searchQuery: '',
  movieResults: [] as MovieSearchResult[],
  listResults: [] as ListSearchResult[],
  isSearching: false
});

const remoteSyncErrorMessage = ref('');
const remoteSyncStatus = ref<RemoteSyncStatus>('idle');

let latestSearchToken = 0;
let remoteSaveChain: Promise<void> = Promise.resolve();

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const applySnapshot = (snapshot: ListsStateSnapshot) => {
  state.userId = snapshot.userId;
  state.userLists = snapshot.userLists;
  state.interactions = snapshot.interactions;
  state.draft = createEmptyDraft();
  state.searchQuery = '';
  state.movieResults = [];
  state.listResults = [];
  state.isSearching = false;
};

const runRemoteTask = async (task: () => Promise<void>, fallbackMessage: string) => {
  remoteSyncStatus.value = 'syncing';

  try {
    await task();
    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value = getErrorMessage(error, fallbackMessage);
    console.error('[listStore] Supabase list sync failed.', error);
  }
};

const enqueueRemoteTask = (task: () => Promise<void>, fallbackMessage: string) => {
  remoteSaveChain = remoteSaveChain
    .catch(() => {
      // Previous failures already updated the error state.
    })
    .then(() => runRemoteTask(task, fallbackMessage));

  return remoteSaveChain;
};

const persistState = () => {
  const snapshot: ListsStateSnapshot = {
    userId: state.userId,
    userLists: state.userLists,
    interactions: state.interactions
  };

  localListRepository.save(snapshot);
  remoteSyncErrorMessage.value = '';

  return enqueueRemoteTask(
    () => remoteListRepository.save(snapshot),
    '리스트 변경 내용을 Supabase에 저장하지 못했어요.'
  );
};

const resolveMoviePreviews = (movieIds: readonly string[]) =>
  movieIds.map((movieId) => movieMap[movieId]).filter((movie): movie is SearchableCatalogMovie => Boolean(movie));

const getInteraction = (listId: string): ListInteractionRecord | undefined =>
  state.interactions.find((interaction) => interaction.listId === listId);

const upsertInteraction = (listId: string, next: Partial<ListInteractionRecord>) => {
  const nextInteractions = [...state.interactions];
  const existingIndex = nextInteractions.findIndex((interaction) => interaction.listId === listId);
  const current = existingIndex >= 0 ? nextInteractions[existingIndex] : undefined;

  const updated: ListInteractionRecord = {
    listId,
    saved: next.saved ?? current?.saved ?? false,
    personalRating:
      next.personalRating !== undefined ? next.personalRating : (current?.personalRating ?? null)
  };

  if (existingIndex >= 0) {
    nextInteractions.splice(existingIndex, 1, updated);
  } else {
    nextInteractions.push(updated);
  }

  state.interactions = nextInteractions;
  void persistState();
};

const resetDraft = () => {
  state.draft = createEmptyDraft();
};

const selectedDraftMovies = computed(() => resolveMoviePreviews(state.draft.movieIds));
const canSaveDraft = computed(
  () => state.draft.title.trim().length > 0 && state.draft.movieIds.length > 0
);

const myLists = computed<ResolvedUserListCard[]>(() =>
  [...state.userLists]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .map((list) => ({
      ...list,
      moviePreviews: resolveMoviePreviews(list.movieIds).slice(0, 4)
    }))
);

const sharedLists = computed<ResolvedSharedListCard[]>(() =>
  mockSharedLists.map((list) => {
    const interaction = getInteraction(list.id);
    const viewerSaved = interaction?.saved ?? false;
    const viewerRating = interaction?.personalRating ?? null;
    const ratingTotal = list.averageRating * list.ratingCount + (viewerRating ?? 0);
    const ratingCount = list.ratingCount + (viewerRating ? 1 : 0);

    return {
      ...list,
      moviePreviews: resolveMoviePreviews(list.movieIds).slice(0, 3),
      displaySaveCount: list.saveCount + (viewerSaved ? 1 : 0),
      displayAverageRating: ratingCount > 0 ? ratingTotal / ratingCount : 0,
      viewerSaved,
      viewerRating
    };
  })
);

const updateSearchQuery = async (query: string) => {
  state.searchQuery = query;
  const trimmedQuery = query.trim();
  const searchToken = ++latestSearchToken;

  if (!trimmedQuery) {
    state.movieResults = [];
    state.listResults = [];
    state.isSearching = false;
    return;
  }

  state.isSearching = true;
  const results = await mockListSearchService.search(trimmedQuery, {
    movies: searchableMovies,
    userLists: state.userLists,
    sharedLists: mockSharedLists
  });

  if (searchToken !== latestSearchToken) {
    return;
  }

  state.movieResults = results.movies;
  state.listResults = results.lists;
  state.isSearching = false;
};

const addMovieToDraft = (movieId: string) => {
  if (state.draft.movieIds.includes(movieId)) {
    return;
  }

  state.draft.movieIds = [...state.draft.movieIds, movieId];
};

const removeMovieFromDraft = (movieId: string) => {
  state.draft.movieIds = state.draft.movieIds.filter((id) => id !== movieId);
};

const updateDraftTitle = (title: string) => {
  state.draft.title = title;
};

const toggleDraftPrivacy = () => {
  state.draft.isPrivate = !state.draft.isPrivate;
};

const saveDraft = () => {
  if (!canSaveDraft.value) {
    return false;
  }

  const now = new Date().toISOString();
  const existingIndex = state.userLists.findIndex((list) => list.id === state.draft.id);
  const currentList = existingIndex >= 0 ? state.userLists[existingIndex] : undefined;

  const nextRecord: UserMovieListRecord = {
    id: currentList?.id ?? `user_list_${Date.now()}`,
    ownerId: state.userId,
    ownerName: currentList?.ownerName ?? '나',
    title: state.draft.title.trim(),
    movieIds: [...state.draft.movieIds],
    saveCount: currentList?.saveCount ?? (state.draft.isPrivate ? 0 : 1),
    averageRating: currentList?.averageRating ?? 0,
    ratingCount: currentList?.ratingCount ?? 0,
    isPrivate: state.draft.isPrivate,
    createdAt: currentList?.createdAt ?? now,
    sourceListId: currentList?.sourceListId ?? null,
    updatedAt: now
  };

  const nextLists = [...state.userLists];

  if (existingIndex >= 0) {
    nextLists.splice(existingIndex, 1, nextRecord);
  } else {
    nextLists.unshift(nextRecord);
  }

  state.userLists = nextLists;
  void persistState();
  resetDraft();

  if (state.searchQuery.trim()) {
    void updateSearchQuery(state.searchQuery);
  }

  return true;
};

const editUserList = (listId: string) => {
  const target = state.userLists.find((list) => list.id === listId);

  if (!target) {
    return;
  }

  state.draft = {
    id: target.id,
    title: target.title,
    isPrivate: target.isPrivate,
    movieIds: [...target.movieIds]
  };
};

const deleteUserList = (listId: string) => {
  state.userLists = state.userLists.filter((list) => list.id !== listId);
  void persistState();

  if (state.draft.id === listId) {
    resetDraft();
  }

  if (state.searchQuery.trim()) {
    void updateSearchQuery(state.searchQuery);
  }
};

const toggleSharedListSave = (listId: string) => {
  const current = getInteraction(listId);

  upsertInteraction(listId, {
    saved: !(current?.saved ?? false)
  });
};

const setSharedListRating = (listId: string, rating: null | number) => {
  upsertInteraction(listId, {
    personalRating: rating
  });
};

const hasImportedList = (sourceListId: string) =>
  state.userLists.some((list) => list.sourceListId === sourceListId);

const saveRecommendedList = (list: { id: string; movieIds: readonly string[]; title: string }) => {
  const existing = state.userLists.find((userList) => userList.sourceListId === list.id);

  if (existing) {
    return existing.id;
  }

  const now = new Date().toISOString();
  const nextRecord: UserMovieListRecord = {
    id: `user_list_${Date.now()}`,
    ownerId: state.userId,
    ownerName: '나',
    title: list.title,
    movieIds: [...list.movieIds],
    saveCount: 1,
    averageRating: 0,
    ratingCount: 0,
    isPrivate: false,
    createdAt: now,
    sourceListId: list.id,
    updatedAt: now
  };

  state.userLists = [nextRecord, ...state.userLists];
  void persistState();

  if (state.searchQuery.trim()) {
    void updateSearchQuery(state.searchQuery);
  }

  return nextRecord.id;
};

const setActiveUser = async (userId: string) => {
  const normalizedUserId = userId || FALLBACK_USER_ID;
  applySnapshot(normalizeSnapshot(normalizedUserId, localListRepository.load(normalizedUserId)));
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const remoteSnapshot = await remoteListRepository.load(normalizedUserId);

    if (!remoteSnapshot) {
      return;
    }

    applySnapshot(normalizeSnapshot(normalizedUserId, remoteSnapshot));
    localListRepository.save({
      userId: normalizedUserId,
      userLists: state.userLists,
      interactions: state.interactions
    });
    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value = 'Supabase에서 리스트 기록을 불러오지 못했어요. 로컬에 남은 기록으로 이어서 보여드릴게요.';
    console.error('[listStore] Failed to load lists from Supabase.', error);
  }
};

export const listStore = {
  state: readonly(state),
  searchableMovies,
  selectedDraftMovies,
  canSaveDraft,
  myLists,
  sharedLists,
  remoteSyncErrorMessage: readonly(remoteSyncErrorMessage),
  remoteSyncStatus: readonly(remoteSyncStatus),
  resolveMoviePreviews,
  updateSearchQuery,
  updateDraftTitle,
  toggleDraftPrivacy,
  addMovieToDraft,
  removeMovieFromDraft,
  resetDraft,
  saveDraft,
  editUserList,
  deleteUserList,
  hasImportedList,
  saveRecommendedList,
  toggleSharedListSave,
  setSharedListRating,
  setActiveUser
};

export const useListStore = () => listStore;
