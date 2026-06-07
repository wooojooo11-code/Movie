import { computed, reactive, readonly, ref } from 'vue';

import { catalogMovies } from '@/data/catalog';
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
  SharedMovieListRecord,
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
  cast: movieCreditsById[movie.id]?.cast ?? [],
  characters: movieCreditsById[movie.id]?.characters ?? movie.characters
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
  ownerName: '나',
  userLists: initialSnapshot.userLists,
  sharedCatalog: [] as SharedMovieListRecord[],
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

const refreshSearchResults = async () => {
  const trimmedQuery = state.searchQuery.trim();
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
    sharedLists: state.sharedCatalog
  });

  if (searchToken !== latestSearchToken) {
    return;
  }

  state.movieResults = results.movies;
  state.listResults = results.lists;
  state.isSearching = false;
};

const persistState = async () => {
  const snapshot: ListsStateSnapshot = {
    userId: state.userId,
    userLists: state.userLists,
    interactions: state.interactions
  };

  localListRepository.save(snapshot);
  remoteSyncErrorMessage.value = '';

  await enqueueRemoteTask(
    () => remoteListRepository.save(snapshot),
    '리스트 변경 내용을 Supabase에 저장하지 못했어요.'
  );

  if (state.userId !== FALLBACK_USER_ID) {
    state.sharedCatalog = await remoteListRepository.loadSharedLists(state.userId);
  }
};

const resolveMoviePreviews = (movieIds: readonly string[]) =>
  movieIds.map((movieId) => movieMap[movieId]).filter((movie): movie is SearchableCatalogMovie => Boolean(movie));

const getInteraction = (listId: string): ListInteractionRecord | undefined =>
  state.interactions.find((interaction) => interaction.listId === listId);

const resetDraft = () => {
  state.draft = createEmptyDraft();
};

const resetSearchState = () => {
  state.searchQuery = '';
  state.movieResults = [];
  state.listResults = [];
  state.isSearching = false;
};

type ImportableList = {
  id: string;
  title: string;
  movieIds: readonly string[];
};

const createImportedUserList = (
  list: ImportableList,
  overrides?: Partial<Pick<UserMovieListRecord, 'averageRating' | 'createdAt' | 'isPrivate' | 'ratingCount' | 'saveCount' | 'updatedAt'>>
): UserMovieListRecord => {
  const now = new Date().toISOString();

  return {
    id: `user_list_${Date.now()}`,
    ownerId: state.userId,
    ownerName: state.ownerName,
    title: list.title,
    movieIds: [...list.movieIds],
    saveCount: overrides?.saveCount ?? 1,
    averageRating: overrides?.averageRating ?? 0,
    ratingCount: overrides?.ratingCount ?? 0,
    isPrivate: overrides?.isPrivate ?? false,
    createdAt: overrides?.createdAt ?? now,
    sourceListId: list.id,
    updatedAt: overrides?.updatedAt ?? now
  };
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
      moviePreviews: resolveMoviePreviews(list.movieIds)
    }))
);

const sharedLists = computed<ResolvedSharedListCard[]>(() =>
  state.sharedCatalog.map((list) => {
    const interaction = getInteraction(list.id);
    const viewerSaved = interaction?.saved ?? false;
    const viewerRating = interaction?.personalRating ?? null;
    const ratingTotal = list.averageRating * list.ratingCount + (viewerRating ?? 0);
    const ratingCount = list.ratingCount + (viewerRating ? 1 : 0);

    return {
      ...list,
      moviePreviews: resolveMoviePreviews(list.movieIds),
      displaySaveCount: list.saveCount + (viewerSaved ? 1 : 0),
      displayAverageRating: ratingCount > 0 ? ratingTotal / ratingCount : 0,
      viewerSaved,
      viewerRating
    };
  })
);

const updateSearchQuery = async (query: string) => {
  state.searchQuery = query;
  await refreshSearchResults();
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

const saveDraft = async () => {
  if (!canSaveDraft.value) {
    return false;
  }

  const now = new Date().toISOString();
  const existingIndex = state.userLists.findIndex((list) => list.id === state.draft.id);
  const currentList = existingIndex >= 0 ? state.userLists[existingIndex] : undefined;

  const nextRecord: UserMovieListRecord = {
    id: currentList?.id ?? `user_list_${Date.now()}`,
    ownerId: state.userId,
    ownerName: currentList?.ownerName ?? state.ownerName,
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
  await persistState();
  resetDraft();
  resetSearchState();

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

const deleteUserList = async (listId: string) => {
  state.userLists = state.userLists.filter((list) => list.id !== listId);
  await persistState();

  if (state.draft.id === listId) {
    resetDraft();
  }

  if (state.searchQuery.trim()) {
    await refreshSearchResults();
  }
};

const removeFromMyLists = async (listId: string) => {
  const target = state.userLists.find((list) => list.id === listId);

  if (!target) {
    return;
  }

  if (target.sourceListId) {
    const current = getInteraction(target.sourceListId);
    const nextInteractions = [...state.interactions];
    const existingIndex = nextInteractions.findIndex(
      (interaction) => interaction.listId === target.sourceListId
    );
    const updated: ListInteractionRecord = {
      listId: target.sourceListId,
      saved: false,
      personalRating: current?.personalRating ?? null
    };

    if (existingIndex >= 0) {
      nextInteractions.splice(existingIndex, 1, updated);
    } else {
      nextInteractions.push(updated);
    }

    state.interactions = nextInteractions;
  }

  state.userLists = state.userLists.filter((list) => list.id !== listId);
  await persistState();

  if (state.draft.id === listId) {
    resetDraft();
  }

  if (state.searchQuery.trim()) {
    await refreshSearchResults();
  }
};

const toggleSharedListSave = async (listId: string) => {
  const sourceList = state.sharedCatalog.find((list) => list.id === listId);
  const current = getInteraction(listId);
  const nextInteractions = [...state.interactions];
  const existingIndex = nextInteractions.findIndex((interaction) => interaction.listId === listId);
  const nextSaved = !(current?.saved ?? false);
  const updated: ListInteractionRecord = {
    listId,
    saved: nextSaved,
    personalRating: current?.personalRating ?? null
  };

  if (existingIndex >= 0) {
    nextInteractions.splice(existingIndex, 1, updated);
  } else {
    nextInteractions.push(updated);
  }

  state.interactions = nextInteractions;

  if (sourceList) {
    if (nextSaved) {
      const alreadyImported = state.userLists.some((list) => list.sourceListId === listId);

      if (!alreadyImported) {
        state.userLists = [createImportedUserList(sourceList), ...state.userLists];
      }
    } else {
      state.userLists = state.userLists.filter((list) => list.sourceListId !== listId);

      if (state.draft.id && !state.userLists.some((list) => list.id === state.draft.id)) {
        resetDraft();
      }
    }
  }

  await persistState();

  if (state.searchQuery.trim()) {
    await refreshSearchResults();
  }
};

const setSharedListRating = async (listId: string, rating: null | number) => {
  const current = getInteraction(listId);
  const nextInteractions = [...state.interactions];
  const existingIndex = nextInteractions.findIndex((interaction) => interaction.listId === listId);
  const updated: ListInteractionRecord = {
    listId,
    saved: current?.saved ?? false,
    personalRating: rating
  };

  if (existingIndex >= 0) {
    nextInteractions.splice(existingIndex, 1, updated);
  } else {
    nextInteractions.push(updated);
  }

  state.interactions = nextInteractions;
  await persistState();
};

const hasImportedList = (sourceListId: string) =>
  state.userLists.some((list) => list.sourceListId === sourceListId);

const saveRecommendedList = async (list: { id: string; movieIds: readonly string[]; title: string }) => {
  const existing = state.userLists.find((userList) => userList.sourceListId === list.id);
  const currentInteraction = getInteraction(list.id);
  const nextInteractions = [...state.interactions];
  const existingInteractionIndex = nextInteractions.findIndex(
    (interaction) => interaction.listId === list.id
  );

  if (existing) {
    const updatedInteraction: ListInteractionRecord = {
      listId: list.id,
      saved: false,
      personalRating: currentInteraction?.personalRating ?? null
    };

    if (existingInteractionIndex >= 0) {
      nextInteractions.splice(existingInteractionIndex, 1, updatedInteraction);
    } else {
      nextInteractions.push(updatedInteraction);
    }

    state.interactions = nextInteractions;
    state.userLists = state.userLists.filter((userList) => userList.sourceListId !== list.id);

    if (state.draft.id && !state.userLists.some((userList) => userList.id === state.draft.id)) {
      resetDraft();
    }

    await persistState();

    if (state.searchQuery.trim()) {
      await refreshSearchResults();
    }

    return null;
  }

  const updatedInteraction: ListInteractionRecord = {
    listId: list.id,
    saved: true,
    personalRating: currentInteraction?.personalRating ?? null
  };

  if (existingInteractionIndex >= 0) {
    nextInteractions.splice(existingInteractionIndex, 1, updatedInteraction);
  } else {
    nextInteractions.push(updatedInteraction);
  }

  state.interactions = nextInteractions;

  const nextRecord = createImportedUserList(list);
  state.userLists = [nextRecord, ...state.userLists];
  await persistState();

  if (state.searchQuery.trim()) {
    await refreshSearchResults();
  }

  return nextRecord.id;
};

const setActiveUser = async (userId: string, ownerName = '나') => {
  const normalizedUserId = userId || FALLBACK_USER_ID;
  state.ownerName = ownerName.trim() || '나';
  applySnapshot(normalizeSnapshot(normalizedUserId, localListRepository.load(normalizedUserId)));
  state.sharedCatalog = [];
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const [remoteSnapshot, remoteSharedLists] = await Promise.all([
      remoteListRepository.load(normalizedUserId),
      remoteListRepository.loadSharedLists(normalizedUserId)
    ]);

    if (remoteSnapshot) {
      applySnapshot(normalizeSnapshot(normalizedUserId, remoteSnapshot));
      localListRepository.save({
        userId: normalizedUserId,
        userLists: state.userLists,
        interactions: state.interactions
      });
    }

    state.sharedCatalog = remoteSharedLists;
    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value =
      'Supabase에서 리스트 기록을 불러오지 못했어요. 로컬에 저장된 기록으로 이어서 보여드릴게요.';
    console.error('[listStore] Failed to load lists from Supabase.', error);
  }

  if (state.searchQuery.trim()) {
    await refreshSearchResults();
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
  removeFromMyLists,
  hasImportedList,
  saveRecommendedList,
  toggleSharedListSave,
  setSharedListRating,
  setActiveUser
};

export const useListStore = () => listStore;
