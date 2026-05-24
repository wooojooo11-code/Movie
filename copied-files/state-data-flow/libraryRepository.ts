import {
  getSupabaseMovieLibraryRelation,
  isSupabaseConfigured,
  supabaseMovieLibraryUserColumn
} from '@/lib/supabase';
import type { LibraryMovieRecord, LibraryStateSnapshot } from '@/types/library';

const STORAGE_PREFIX = 'movielist:movie-library';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

interface SupabaseMovieLibraryRow {
  created_at?: null | string;
  movie_id: string;
  saved_at: null | string;
  source: null | string;
  updated_at?: null | string;
  user_id?: string;
  [key: string]: null | string | undefined;
}

export interface LibraryRepository {
  clear(userId: string): void;
  load(userId: string): LibraryStateSnapshot | null;
  save(snapshot: LibraryStateSnapshot): void;
}

const isRemoteSyncEnabled = (userId: string) =>
  isSupabaseConfigured && Boolean(userId) && userId !== 'guest-user';

const getRowUserId = (row: SupabaseMovieLibraryRow, userColumn: string) => {
  const value = row[userColumn];
  return typeof value === 'string' && value.length > 0 ? value : row.user_id ?? '';
};

const normalizeMovieRow = (row: SupabaseMovieLibraryRow): LibraryMovieRecord => ({
  movieId: row.movie_id,
  savedAt: row.saved_at ?? row.updated_at ?? row.created_at ?? new Date(0).toISOString(),
  source: row.source === 'want_to_watch' ? 'want_to_watch' : 'want_to_watch'
});

const serializeMovieRow = (
  userId: string,
  record: LibraryMovieRecord
): Record<string, string> => ({
  [supabaseMovieLibraryUserColumn]: userId,
  movie_id: record.movieId,
  saved_at: record.savedAt,
  source: record.source
});

export const localLibraryRepository: LibraryRepository = {
  load(userId) {
    if (!isClient()) {
      return null;
    }

    const raw = window.localStorage.getItem(getStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LibraryStateSnapshot;
    } catch {
      return null;
    }
  },
  save(snapshot) {
    if (!isClient()) {
      return;
    }

    window.localStorage.setItem(getStorageKey(snapshot.userId), JSON.stringify(snapshot));
  },
  clear(userId) {
    if (!isClient()) {
      return;
    }

    window.localStorage.removeItem(getStorageKey(userId));
  }
};

export const remoteLibraryRepository = {
  async load(userId: string): Promise<LibraryStateSnapshot | null> {
    if (!isRemoteSyncEnabled(userId)) {
      return null;
    }

    const relation = getSupabaseMovieLibraryRelation() as any;

    if (!relation) {
      return null;
    }

    const { data, error } = await relation
      .select([supabaseMovieLibraryUserColumn, 'movie_id', 'saved_at', 'source', 'created_at', 'updated_at'].join(', '))
      .eq(supabaseMovieLibraryUserColumn, userId)
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      userId,
      movies: ((data ?? []) as unknown as SupabaseMovieLibraryRow[]).map(normalizeMovieRow)
    };
  },
  async save(snapshot: LibraryStateSnapshot): Promise<void> {
    if (!isRemoteSyncEnabled(snapshot.userId)) {
      return;
    }

    const relation = getSupabaseMovieLibraryRelation() as any;

    if (!relation) {
      return;
    }

    const payload = snapshot.movies.map((movie) => serializeMovieRow(snapshot.userId, movie));

    const { error: deleteError } = await relation.delete().eq(supabaseMovieLibraryUserColumn, snapshot.userId);

    if (deleteError) {
      throw deleteError;
    }

    if (payload.length === 0) {
      return;
    }

    const { error: insertError } = await relation.insert(payload);

    if (insertError) {
      throw insertError;
    }
  },
  async clear(userId: string): Promise<void> {
    if (!isRemoteSyncEnabled(userId)) {
      return;
    }

    const relation = getSupabaseMovieLibraryRelation() as any;

    if (!relation) {
      return;
    }

    const { error } = await relation.delete().eq(supabaseMovieLibraryUserColumn, userId);

    if (error) {
      throw error;
    }
  }
};
