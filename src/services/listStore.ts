import { computed, reactive, readonly } from 'vue';

import { catalogMovies } from '@/data/catalog';
import { mockSharedLists } from '@/data/lists';
import { movieCreditsById } from '@/data/movieCredits';
import { localListRepository } from '@/services/listRepository';
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

let latestSearchToken = 0;

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

const persistState = () => {
  localListRepository.save({
    userId: state.userId,
    userLists: state.userLists,
    interactions: state.interactions
  });
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
  persistState();
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
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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
    ownerName: '나',
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
  persistState();
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
  persistState();

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
  persistState();

  if (state.searchQuery.trim()) {
    void updateSearchQuery(state.searchQuery);
  }

  return nextRecord.id;
};

const setActiveUser = (userId: string) => {
  applySnapshot(normalizeSnapshot(userId || FALLBACK_USER_ID, localListRepository.load(userId || FALLBACK_USER_ID)));
};

export const listStore = {
  state: readonly(state),
  searchableMovies,
  selectedDraftMovies,
  canSaveDraft,
  myLists,
  sharedLists,
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
