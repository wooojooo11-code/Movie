import { computed, reactive, readonly, ref } from 'vue';

import { catalogMovies } from '@/data/catalog';
import { localLibraryRepository, remoteLibraryRepository } from '@/services/libraryRepository';
import type { LibraryMovieRecord, LibraryStateSnapshot, ResolvedLibraryMovieRecord } from '@/types/library';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const state = reactive<LibraryStateSnapshot>(
  localLibraryRepository.load(FALLBACK_USER_ID) ?? {
    userId: FALLBACK_USER_ID,
    movies: []
  }
);

const remoteSyncErrorMessage = ref('');
const remoteSyncStatus = ref<RemoteSyncStatus>('idle');

let remoteSaveChain: Promise<void> = Promise.resolve();

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie]));

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const normalizeSnapshot = (userId: string, snapshot: LibraryStateSnapshot | null): LibraryStateSnapshot => ({
  userId,
  movies: snapshot?.movies ?? []
});

const applySnapshot = (snapshot: LibraryStateSnapshot) => {
  state.userId = snapshot.userId;
  state.movies = snapshot.movies;
};

const runRemoteTask = async (task: () => Promise<void>, fallbackMessage: string) => {
  remoteSyncStatus.value = 'syncing';

  try {
    await task();
    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value = getErrorMessage(error, fallbackMessage);
    console.error('[libraryStore] Supabase movie library sync failed.', error);
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

const persistState = async () => {
  const snapshot: LibraryStateSnapshot = {
    userId: state.userId,
    movies: state.movies
  };

  localLibraryRepository.save(snapshot);
  remoteSyncErrorMessage.value = '';

  await enqueueRemoteTask(
    () => remoteLibraryRepository.save(snapshot),
    '보관함 변경 내용을 Supabase에 저장하지 못했어요.'
  );
};

const savedMovieIds = computed(() => state.movies.map((movie) => movie.movieId));
const savedMovieIdSet = computed(() => new Set(savedMovieIds.value));

const savedMovies = computed<ResolvedLibraryMovieRecord[]>(() =>
  [...state.movies]
    .sort((left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime())
    .map((record) => {
      const movie = movieMap[record.movieId];
      return movie ? { ...record, movie } : null;
    })
    .filter((record): record is ResolvedLibraryMovieRecord => Boolean(record))
);

const hasMovie = (movieId: string) => savedMovieIdSet.value.has(movieId);

const saveMovie = async (movieId: string) => {
  if (hasMovie(movieId)) {
    return false;
  }

  const nextRecord: LibraryMovieRecord = {
    movieId,
    savedAt: new Date().toISOString(),
    source: 'want_to_watch'
  };

  state.movies = [nextRecord, ...state.movies];
  await persistState();
  return true;
};

const removeMovie = async (movieId: string) => {
  if (!hasMovie(movieId)) {
    return false;
  }

  state.movies = state.movies.filter((movie) => movie.movieId !== movieId);
  await persistState();
  return true;
};

const toggleMovie = async (movieId: string) => {
  if (hasMovie(movieId)) {
    await removeMovie(movieId);
    return false;
  }

  await saveMovie(movieId);
  return true;
};

const setActiveUser = async (userId: string) => {
  const normalizedUserId = userId || FALLBACK_USER_ID;
  applySnapshot(normalizeSnapshot(normalizedUserId, localLibraryRepository.load(normalizedUserId)));
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const remoteSnapshot = await remoteLibraryRepository.load(normalizedUserId);

    if (remoteSnapshot) {
      applySnapshot(normalizeSnapshot(normalizedUserId, remoteSnapshot));
      localLibraryRepository.save({
        userId: normalizedUserId,
        movies: state.movies
      });
    }

    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value =
      'Supabase에서 보관함을 불러오지 못했어요. 로컬에 저장된 목록으로 이어서 보여드릴게요.';
    console.error('[libraryStore] Failed to load movie library from Supabase.', error);
  }
};

export const libraryStore = {
  state: readonly(state),
  remoteSyncErrorMessage: readonly(remoteSyncErrorMessage),
  remoteSyncStatus: readonly(remoteSyncStatus),
  hasMovie,
  removeMovie,
  saveMovie,
  savedMovieIds,
  savedMovies,
  setActiveUser,
  toggleMovie
};

export const useLibraryStore = () => libraryStore;
