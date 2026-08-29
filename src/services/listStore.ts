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
  SimilarTasteListSignal,
  UserMovieListRecord
} from '@/types/lists';
import type { CatalogMovie } from '@/types/recommendation';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const createEmptyDraft = (): DraftUserList => ({
  description: '',
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

const hasDuplicateMovieIds = (movieIds: readonly string[]) => new Set(movieIds).size !== movieIds.length;

const getMovieIdsSignature = (movieIds: readonly string[]) => [...new Set(movieIds)].sort().join('|');

const areMovieIdsEqual = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && left.every((movieId, index) => movieId === right[index]);

type ShareRuleCandidate = Pick<SharedMovieListRecord | UserMovieListRecord, 'id' | 'movieIds'>;

const hasDuplicateListSignature = (
  listId: null | string,
  movieIds: readonly string[],
  candidates: readonly ShareRuleCandidate[]
) => {
  const signature = getMovieIdsSignature(movieIds);

  if (!signature) {
    return false;
  }

  return candidates.some(
    (candidate) =>
      candidate.id !== listId && getMovieIdsSignature(candidate.movieIds) === signature
  );
};

const getShareRestrictionReason = ({
  listId,
  movieIds,
  sharedLists,
  userLists
}: {
  listId: null | string;
  movieIds: readonly string[];
  sharedLists: readonly SharedMovieListRecord[];
  userLists: readonly UserMovieListRecord[];
}) => {
  if (hasDuplicateMovieIds(movieIds)) {
    return '같은 영화가 두 번 들어간 리스트는 공유할 수 없어요.';
  }

  if (hasDuplicateListSignature(listId, movieIds, userLists)) {
    return '중복된 리스트는 공유할 수 없어요.';
  }

  if (hasDuplicateListSignature(listId, movieIds, sharedLists)) {
    return '이미 같은 리스트가 있어서 공유할 수 없어요.';
  }

  return null;
};

const applyUserListShareRules = (
  userLists: readonly UserMovieListRecord[],
  sharedLists: readonly SharedMovieListRecord[]
) =>
  userLists.map((list) => ({
    ...list,
    isPrivate:
      list.isPrivate ||
      Boolean(
        getShareRestrictionReason({
          listId: list.id,
          movieIds: list.movieIds,
          sharedLists,
          userLists
        })
      )
  }));

const normalizeSharedCatalog = (lists: readonly SharedMovieListRecord[]) =>
  lists.filter((list) => !hasDuplicateMovieIds(list.movieIds));

const normalizeSnapshot = (userId: string, snapshot: ListsStateSnapshot | null): ListsStateSnapshot => {
  if (!snapshot) {
    return {
      userId,
      userLists: [],
      interactions: [],
      movieSnapshots: []
    };
  }

  return {
    userId,
    userLists: (snapshot.userLists ?? []).map((list) => ({
      ...list,
      description: list.description ?? '',
      isPrivate: hasDuplicateMovieIds(list.movieIds) ? true : list.isPrivate,
      sourceListId: list.sourceListId ?? null
    })),
    interactions: snapshot.interactions ?? [],
    movieSnapshots: snapshot.movieSnapshots ?? []
  };
};

const syncImportedUserListsWithSharedCatalog = (
  userLists: readonly UserMovieListRecord[],
  sharedLists: readonly SharedMovieListRecord[]
) => {
  const sharedListMap = new Map(sharedLists.map((list) => [list.id, list]));
  let didChange = false;

  const nextUserLists = userLists.map((list) => {
    if (!list.sourceListId) {
      return list;
    }

    const sourceList = sharedListMap.get(list.sourceListId);

    if (!sourceList) {
      return list;
    }

    if (list.title === sourceList.title && areMovieIdsEqual(list.movieIds, sourceList.movieIds)) {
      return list;
    }

    didChange = true;

    return {
      ...list,
      title: sourceList.title,
      movieIds: [...sourceList.movieIds]
    };
  });

  return {
    didChange,
    userLists: nextUserLists
  };
};

const initialSnapshot = normalizeSnapshot(FALLBACK_USER_ID, localListRepository.load(FALLBACK_USER_ID));

const state = reactive({
  userId: initialSnapshot.userId,
  ownerName: '나',
  userLists: initialSnapshot.userLists,
  sharedCatalog: [] as SharedMovieListRecord[],
  interactions: initialSnapshot.interactions,
  movieSnapshots: Object.fromEntries(
    (initialSnapshot.movieSnapshots ?? []).map((movie) => [movie.id, movie])
  ) as Record<string, SearchableCatalogMovie>,
  draft: createEmptyDraft(),
  movieSearchQuery: '',
  listSearchQuery: '',
  movieResults: [] as MovieSearchResult[],
  listResults: [] as ListSearchResult[],
  isSearchingMovies: false,
  isSearchingLists: false
});

const applyCurrentUserShareRules = () => {
  state.userLists = applyUserListShareRules(state.userLists, state.sharedCatalog);
};

const buildSnapshot = (): ListsStateSnapshot => ({
  userId: state.userId,
  userLists: state.userLists,
  interactions: state.interactions,
  movieSnapshots: Object.values(state.movieSnapshots)
});

const getSnapshotFingerprint = (snapshot: ListsStateSnapshot = buildSnapshot()) =>
  JSON.stringify(snapshot);

const persistSnapshotLocally = () => {
  localListRepository.save(buildSnapshot());
};

const syncImportedListsFromSharedCatalog = () => {
  const { didChange, userLists } = syncImportedUserListsWithSharedCatalog(
    state.userLists,
    state.sharedCatalog
  );

  if (didChange) {
    state.userLists = userLists;
  }

  return didChange;
};

const REMOTE_SAVE_FAILURE_MESSAGE = '리스트 변경 내용을 Supabase에 저장하지 못했어요.';

const remoteSyncErrorMessage = ref('');
const remoteSyncStatus = ref<RemoteSyncStatus>('idle');
const similarTasteListSignals = ref<SimilarTasteListSignal[]>([]);

let latestMovieSearchToken = 0;
let latestListSearchToken = 0;
let remoteSaveChain: Promise<boolean> = Promise.resolve(true);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const applySnapshot = (
  snapshot: ListsStateSnapshot,
  options: { preserveMovieSnapshots?: boolean } = {}
) => {
  latestMovieSearchToken += 1;
  latestListSearchToken += 1;
  state.userId = snapshot.userId;
  state.userLists = snapshot.userLists;
  state.interactions = snapshot.interactions;
  const nextMovieSnapshots = Object.fromEntries(
    (snapshot.movieSnapshots ?? []).map((movie) => [movie.id, movie])
  ) as Record<string, SearchableCatalogMovie>;
  state.movieSnapshots = options.preserveMovieSnapshots
    ? { ...state.movieSnapshots, ...nextMovieSnapshots }
    : nextMovieSnapshots;
  state.draft = createEmptyDraft();
  state.movieSearchQuery = '';
  state.listSearchQuery = '';
  state.movieResults = [];
  state.listResults = [];
  state.isSearchingMovies = false;
  state.isSearchingLists = false;
};

const runRemoteTask = async (
  task: () => Promise<void>,
  fallbackMessage = REMOTE_SAVE_FAILURE_MESSAGE
) => {
  remoteSyncStatus.value = 'syncing';

  try {
    await task();
    remoteSyncStatus.value = 'success';
    return true;
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value = getErrorMessage(error, fallbackMessage);
    console.error('[listStore] Supabase list sync failed.', error);
    return false;
  }
};

const enqueueRemoteTask = (
  task: () => Promise<void>,
  fallbackMessage = REMOTE_SAVE_FAILURE_MESSAGE
) => {
  remoteSaveChain = remoteSaveChain.then(
    () => runRemoteTask(task, fallbackMessage),
    () => runRemoteTask(task, fallbackMessage)
  );

  return remoteSaveChain;
};

const refreshSimilarTasteListRecommendations = async () => {
  const userId = state.userId;

  try {
    const signals = await remoteListRepository.loadSimilarTasteListSignals(userId);

    if (state.userId === userId) {
      similarTasteListSignals.value = signals;
    }
  } catch (error) {
    if (state.userId === userId) {
      similarTasteListSignals.value = [];
    }

    console.warn('[listStore] Similar-taste list recommendations are unavailable.', error);
  }
};

const searchCatalog = (query: string) =>
  mockListSearchService.search(query, {
    movies: searchableMovies,
    userLists: state.userLists,
    sharedLists: state.sharedCatalog
  });

const refreshMovieSearchResults = async () => {
  const trimmedQuery = state.movieSearchQuery.trim();
  const searchToken = ++latestMovieSearchToken;

  if (!trimmedQuery) {
    state.movieResults = [];
    state.isSearchingMovies = false;
    return;
  }

  state.isSearchingMovies = true;
  const results = await searchCatalog(trimmedQuery);

  if (searchToken !== latestMovieSearchToken) {
    return;
  }

  state.movieResults = results.movies;
  state.isSearchingMovies = false;
};

const refreshListSearchResults = async () => {
  const trimmedQuery = state.listSearchQuery.trim();
  const searchToken = ++latestListSearchToken;

  if (!trimmedQuery) {
    state.listResults = [];
    state.isSearchingLists = false;
    return;
  }

  state.isSearchingLists = true;
  const results = await searchCatalog(trimmedQuery);

  if (searchToken !== latestListSearchToken) {
    return;
  }

  state.listResults = results.lists;
  state.isSearchingLists = false;
};

const persistState = async () => {
  syncImportedListsFromSharedCatalog();
  applyCurrentUserShareRules();

  const snapshot = buildSnapshot();
  const savedSnapshotFingerprint = getSnapshotFingerprint(snapshot);

  localListRepository.save(snapshot);
  remoteSyncErrorMessage.value = '';

  let didSyncRemotely = await enqueueRemoteTask(
    () => remoteListRepository.save(snapshot),
    '리스트 변경 내용을 Supabase에 저장하지 못했어요.'
  );

  if (state.userId !== FALLBACK_USER_ID && didSyncRemotely) {
    state.sharedCatalog = normalizeSharedCatalog(await remoteListRepository.loadSharedLists(state.userId));
    syncImportedListsFromSharedCatalog();
    applyCurrentUserShareRules();
    persistSnapshotLocally();

    if (getSnapshotFingerprint() !== savedSnapshotFingerprint) {
      didSyncRemotely = await enqueueRemoteTask(() => remoteListRepository.save(buildSnapshot()));
    }
  }

  return didSyncRemotely;
};

const resolveMoviePreviews = (movieIds: readonly string[]) =>
  movieIds
    .map((movieId) => movieMap[movieId] ?? state.movieSnapshots[movieId])
    .filter((movie): movie is SearchableCatalogMovie => Boolean(movie));

const registerMovieSnapshot = (movie: CatalogMovie) => {
  if (movieMap[movie.id]) {
    return;
  }

  const existing = state.movieSnapshots[movie.id];
  state.movieSnapshots = {
    ...state.movieSnapshots,
    [movie.id]: {
      ...movie,
      characters: [...movie.characters],
      director: existing?.director ?? '감독 미상',
      cast: existing?.cast ?? []
    }
  };
  persistSnapshotLocally();
};

const getInteraction = (listId: string): ListInteractionRecord | undefined =>
  state.interactions.find((interaction) => interaction.listId === listId);

const resetDraft = () => {
  state.draft = createEmptyDraft();
};

const resetMovieSearchState = () => {
  latestMovieSearchToken += 1;
  state.movieSearchQuery = '';
  state.movieResults = [];
  state.isSearchingMovies = false;
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
  const nextIsPrivate =
    (overrides?.isPrivate ?? false) ||
    Boolean(
      getShareRestrictionReason({
        listId: null,
        movieIds: list.movieIds,
        sharedLists: state.sharedCatalog,
        userLists: state.userLists
      })
    );

  return {
    id: `user_list_${Date.now()}`,
    ownerId: state.userId,
    ownerName: state.ownerName,
    description: '',
    title: list.title,
    movieIds: [...list.movieIds],
    saveCount: overrides?.saveCount ?? 0,
    averageRating: overrides?.averageRating ?? 0,
    ratingCount: overrides?.ratingCount ?? 0,
    isPrivate: nextIsPrivate,
    createdAt: overrides?.createdAt ?? now,
    sourceListId: list.id,
    updatedAt: overrides?.updatedAt ?? now
  };
};

const selectedDraftMovies = computed(() => resolveMoviePreviews(state.draft.movieIds));
const canSaveDraft = computed(
  () => state.draft.title.trim().length > 0 && state.draft.movieIds.length > 0
);
const draftShareRestrictionReason = computed(() =>
  getShareRestrictionReason({
    listId: state.draft.id,
    movieIds: state.draft.movieIds,
    sharedLists: state.sharedCatalog,
    userLists: state.userLists
  })
);
const canShareDraft = computed(() => !draftShareRestrictionReason.value);

const syncDraftPrivacyWithShareRule = () => {
  if (draftShareRestrictionReason.value) {
    state.draft.isPrivate = true;
  }
};

const myLists = computed<ResolvedUserListCard[]>(() => {
  // 저장한 공개 리스트는 복사본 대신 원본 ID를 그대로 참조해 내 리스트에 보여줍니다.
  const ownedLists = state.userLists.filter((list) => !list.sourceListId);
  const savedReferences: UserMovieListRecord[] = state.sharedCatalog
    .filter((list) => list.ownerId !== state.userId && getInteraction(list.id)?.saved)
    .map((list) => ({
      id: list.id,
      ownerId: list.ownerId,
      ownerName: list.ownerName,
      description: list.description,
      title: list.title,
      movieIds: [...list.movieIds],
      saveCount: list.saveCount,
      averageRating: list.averageRating,
      ratingCount: list.ratingCount,
      isPrivate: false,
      sourceListId: list.id,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt
    }));

  return [...ownedLists, ...savedReferences]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .map((list) => ({
      ...list,
      moviePreviews: resolveMoviePreviews(list.movieIds)
    }));
});

// 가져온 공개 리스트는 원본의 읽기 전용 참조이므로 영화 추가 대상에서 제외한다.
const editableLists = computed<ResolvedUserListCard[]>(() =>
  state.userLists
    .filter((list) => !list.sourceListId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .map((list) => ({ ...list, moviePreviews: resolveMoviePreviews(list.movieIds) }))
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
      displayAverageRating: ratingCount > 0 ? ratingTotal / ratingCount : 0,
      viewerSaved,
      viewerRating
    };
  })
);

const similarTasteRecommendedLists = computed(() => {
  const signalByListId = new Map(
    similarTasteListSignals.value.map((signal) => [signal.listId, signal])
  );

  return sharedLists.value
    .filter((list) => list.ownerId !== state.userId && !list.viewerSaved)
    .map((list) => {
      const signal = signalByListId.get(list.id);

      return signal ? { ...list, ...signal } : null;
    })
    .filter((list): list is ResolvedSharedListCard & SimilarTasteListSignal => Boolean(list))
    .sort(
      (left, right) =>
        right.similarityScore - left.similarityScore ||
        right.sharedLikeCount - left.sharedLikeCount ||
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .slice(0, 6);
});

const updateMovieSearchQuery = async (query: string) => {
  state.movieSearchQuery = query;
  await refreshMovieSearchResults();
};

const updateListSearchQuery = async (query: string) => {
  state.listSearchQuery = query;
  await refreshListSearchResults();
};

const addMovieToDraft = (movie: CatalogMovie | string) => {
  const movieId = typeof movie === 'string' ? movie : movie.id;

  if (typeof movie !== 'string') {
    registerMovieSnapshot(movie);
  }

  if (state.draft.movieIds.includes(movieId)) {
    return;
  }

  state.draft.movieIds = [...state.draft.movieIds, movieId];
  syncDraftPrivacyWithShareRule();
};

const removeMovieFromDraft = (movieId: string) => {
  state.draft.movieIds = state.draft.movieIds.filter((id) => id !== movieId);
  syncDraftPrivacyWithShareRule();
};

const updateDraftTitle = (title: string) => {
  state.draft.title = title;
};

const updateDraftDescription = (description: string) => {
  state.draft.description = description;
};

const toggleDraftPrivacy = () => {
  if (draftShareRestrictionReason.value) {
    state.draft.isPrivate = true;
    return;
  }

  state.draft.isPrivate = !state.draft.isPrivate;
};

const saveDraft = async () => {
  if (!canSaveDraft.value) {
    return false;
  }

  const now = new Date().toISOString();
  const existingIndex = state.userLists.findIndex((list) => list.id === state.draft.id);
  const currentList = existingIndex >= 0 ? state.userLists[existingIndex] : undefined;
  const nextIsPrivate = state.draft.isPrivate || Boolean(draftShareRestrictionReason.value);

  const nextRecord: UserMovieListRecord = {
    id: currentList?.id ?? `user_list_${Date.now()}`,
    ownerId: state.userId,
    ownerName: currentList?.ownerName ?? state.ownerName,
    description: state.draft.description.trim(),
    title: state.draft.title.trim(),
    movieIds: [...state.draft.movieIds],
    saveCount: currentList?.saveCount ?? 0,
    averageRating: currentList?.averageRating ?? 0,
    ratingCount: currentList?.ratingCount ?? 0,
    isPrivate: nextIsPrivate,
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
  resetMovieSearchState();

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
  }

  return true;
};

const addMovieToList = async (listId: string, movie: CatalogMovie | string) => {
  const target = state.userLists.find((list) => list.id === listId && !list.sourceListId);

  if (!target) {
    return 'unavailable' as const;
  }

  const movieId = typeof movie === 'string' ? movie : movie.id;

  if (typeof movie !== 'string') {
    registerMovieSnapshot(movie);
  }

  if (target.movieIds.includes(movieId)) {
    const didSync = await persistState();
    return didSync ? ('exists' as const) : ('sync-error' as const);
  }

  const updatedAt = new Date().toISOString();
  state.userLists = state.userLists.map((list) =>
    list.id === listId
      ? {
          ...list,
          movieIds: [...list.movieIds, movieId],
          updatedAt
        }
      : list
  );
  const didSync = await persistState();

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
  }

  return didSync ? ('added' as const) : ('sync-error' as const);
};

const editUserList = (listId: string) => {
  const target = state.userLists.find((list) => list.id === listId);

  if (!target || target.sourceListId) {
    return;
  }

  state.draft = {
    id: target.id,
    description: target.description ?? '',
    title: target.title,
    isPrivate: target.isPrivate,
    movieIds: [...target.movieIds]
  };
  syncDraftPrivacyWithShareRule();
};

const deleteUserList = async (listId: string) => {
  state.userLists = state.userLists.filter((list) => list.id !== listId);
  await persistState();

  if (state.draft.id === listId) {
    resetDraft();
  }

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
  }
};

const removeFromMyLists = async (listId: string) => {
  const target = state.userLists.find((list) => list.id === listId);

  if (!target) {
    const current = getInteraction(listId);
    if (current?.saved) {
      state.interactions = state.interactions.map((interaction) =>
        interaction.listId === listId ? { ...interaction, saved: false } : interaction
      );
      await persistState();
    }
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

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
  }
};

const toggleSharedListSave = async (listId: string) => {
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

  await persistState();

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
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

const hasImportedList = (sourceListId: string) => Boolean(getInteraction(sourceListId)?.saved);

const saveRecommendedList = async (list: { id: string; movieIds: readonly string[]; title: string }) => {
  const currentInteraction = getInteraction(list.id);
  const nextInteractions = [...state.interactions];
  const existingInteractionIndex = nextInteractions.findIndex(
    (interaction) => interaction.listId === list.id
  );
  const updatedInteraction: ListInteractionRecord = {
    listId: list.id,
    saved: !(currentInteraction?.saved ?? false),
    personalRating: currentInteraction?.personalRating ?? null
  };

  if (existingInteractionIndex >= 0) {
    nextInteractions.splice(existingInteractionIndex, 1, updatedInteraction);
  } else {
    nextInteractions.push(updatedInteraction);
  }

  state.interactions = nextInteractions;
  await persistState();

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
  }

  return updatedInteraction.saved ? list.id : null;
};

const setActiveUser = async (userId: string, ownerName = '나') => {
  const normalizedUserId = userId || FALLBACK_USER_ID;
  state.ownerName = ownerName.trim() || '나';
  applySnapshot(normalizeSnapshot(normalizedUserId, localListRepository.load(normalizedUserId)));
  state.sharedCatalog = [];
  similarTasteListSignals.value = [];
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const [remoteSnapshot, remoteSharedLists] = await Promise.all([
      remoteListRepository.load(normalizedUserId),
      remoteListRepository.loadSharedLists(normalizedUserId)
    ]);

    if (remoteSnapshot) {
      applySnapshot(normalizeSnapshot(normalizedUserId, remoteSnapshot), {
        preserveMovieSnapshots: true
      });
    }

    const snapshotFingerprintBeforeSharedSync = getSnapshotFingerprint();
    state.sharedCatalog = normalizeSharedCatalog(remoteSharedLists);
    const didSyncImportedLists = syncImportedListsFromSharedCatalog();
    applyCurrentUserShareRules();
    persistSnapshotLocally();

    if (!didSyncImportedLists && getSnapshotFingerprint() !== snapshotFingerprintBeforeSharedSync) {
      await enqueueRemoteTask(() => remoteListRepository.save(buildSnapshot()));
    }

    if (didSyncImportedLists) {
      await enqueueRemoteTask(
        () => remoteListRepository.save(buildSnapshot()),
        '由ъ뒪??蹂寃??댁슜??Supabase????ν븯吏 紐삵뻽?댁슂.'
      );
    }

    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value =
      'Supabase에서 리스트 기록을 불러오지 못했어요. 로컬에 저장된 기록으로 이어서 보여드릴게요.';
    console.error('[listStore] Failed to load lists from Supabase.', error);
  }

  void refreshSimilarTasteListRecommendations();

  if (state.listSearchQuery.trim()) {
    await refreshListSearchResults();
  }
};

export const listStore = {
  state: readonly(state),
  searchableMovies,
  selectedDraftMovies,
  canSaveDraft,
  canShareDraft,
  draftShareRestrictionReason,
  myLists,
  editableLists,
  sharedLists,
  similarTasteRecommendedLists,
  remoteSyncErrorMessage: readonly(remoteSyncErrorMessage),
  remoteSyncStatus: readonly(remoteSyncStatus),
  resolveMoviePreviews,
  updateMovieSearchQuery,
  updateListSearchQuery,
  updateDraftTitle,
  updateDraftDescription,
  toggleDraftPrivacy,
  addMovieToDraft,
  removeMovieFromDraft,
  resetDraft,
  resetMovieSearchState,
  saveDraft,
  addMovieToList,
  editUserList,
  deleteUserList,
  removeFromMyLists,
  hasImportedList,
  saveRecommendedList,
  toggleSharedListSave,
  setSharedListRating,
  refreshSimilarTasteListRecommendations,
  setActiveUser
};

export const useListStore = () => listStore;
