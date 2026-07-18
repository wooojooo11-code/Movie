import {
  getSupabaseListInteractionsRelation,
  getSupabaseUserListsRelation,
  isSupabaseConfigured,
  supabaseListInteractionsUserColumn,
  supabaseUserListsUserColumn
} from '@/lib/supabase';
import type {
  ListInteractionRecord,
  ListsStateSnapshot,
  RemoteListsPayload,
  SharedMovieListRecord,
  UserMovieListRecord
} from '@/types/lists';

const STORAGE_PREFIX = 'movielist:user-lists';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

export interface ListRepository {
  clear(userId: string): void;
  load(userId: string): ListsStateSnapshot | null;
  save(snapshot: ListsStateSnapshot): void;
}

interface SupabaseUserListRow {
  average_rating: null | number;
  created_at: null | string;
  id: string;
  is_private: boolean | null;
  movie_ids: null | string[];
  owner_name: null | string;
  rating_count: null | number;
  save_count: null | number;
  source_list_id: null | string;
  title: null | string;
  updated_at: null | string;
  user_id?: string;
  [key: string]: boolean | null | number | string | string[] | undefined;
}

interface SupabaseListInteractionRow {
  created_at?: null | string;
  list_id: string;
  personal_rating: null | number;
  saved: boolean | null;
  updated_at?: null | string;
  user_id?: string;
  [key: string]: boolean | null | number | string | undefined;
}

const isRemoteSyncEnabled = (userId: string) => isSupabaseConfigured && Boolean(userId) && userId !== 'guest-user';

const getRowUserId = (
  row: SupabaseListInteractionRow | SupabaseUserListRow,
  userColumn: string
) => {
  const value = row[userColumn];
  return typeof value === 'string' && value.length > 0 ? value : row.user_id ?? '';
};

const normalizeUserListRow = (row: SupabaseUserListRow): UserMovieListRecord => ({
  id: row.id,
  ownerId: getRowUserId(row, supabaseUserListsUserColumn),
  ownerName: row.owner_name?.trim() || '사용자',
  title: row.title?.trim() || '이름 없는 리스트',
  movieIds: row.movie_ids ?? [],
  saveCount: row.save_count ?? 0,
  averageRating: row.average_rating ?? 0,
  ratingCount: row.rating_count ?? 0,
  isPrivate: row.is_private ?? false,
  createdAt: row.created_at ?? new Date(0).toISOString(),
  sourceListId: row.source_list_id ?? null,
  updatedAt: row.updated_at ?? row.created_at ?? new Date(0).toISOString()
});

const normalizeSharedListRow = (row: SupabaseUserListRow): SharedMovieListRecord => ({
  ...normalizeUserListRow(row),
  canBeReshared: false
});

const resolveCanonicalSharedSourceRow = (
  row: SupabaseUserListRow,
  rowMap: ReadonlyMap<string, SupabaseUserListRow>
) => {
  let currentRow = row;
  const visitedIds = new Set<string>([row.id]);

  while (currentRow.source_list_id) {
    const sourceRow = rowMap.get(currentRow.source_list_id);

    if (!sourceRow || visitedIds.has(sourceRow.id)) {
      break;
    }

    visitedIds.add(sourceRow.id);
    currentRow = sourceRow;
  }

  return currentRow;
};

const normalizeSharedListRows = (rows: readonly SupabaseUserListRow[]) => {
  const rowMap = new Map(rows.map((row) => [row.id, row]));

  return rows.map((row) => {
    const canonicalSourceRow = resolveCanonicalSharedSourceRow(row, rowMap);

    return normalizeSharedListRow({
      ...row,
      movie_ids: canonicalSourceRow.movie_ids,
      title: canonicalSourceRow.title
    });
  });
};

const normalizeInteractionRow = (row: SupabaseListInteractionRow): ListInteractionRecord => ({
  listId: row.list_id,
  saved: row.saved ?? false,
  personalRating: row.personal_rating
});

const serializeUserListRow = (
  userId: string,
  list: UserMovieListRecord
): Record<string, boolean | null | number | string | string[]> => ({
  id: list.id,
  [supabaseUserListsUserColumn]: userId,
  owner_name: list.ownerName,
  title: list.title,
  movie_ids: [...list.movieIds],
  save_count: list.saveCount,
  average_rating: list.averageRating,
  rating_count: list.ratingCount,
  is_private: list.isPrivate,
  source_list_id: list.sourceListId ?? null,
  created_at: list.createdAt,
  updated_at: list.updatedAt
});

const serializeInteractionRow = (
  userId: string,
  interaction: ListInteractionRecord
): Record<string, boolean | null | number | string> => ({
  [supabaseListInteractionsUserColumn]: userId,
  list_id: interaction.listId,
  saved: interaction.saved,
  personal_rating: interaction.personalRating
});

export const localListRepository: ListRepository = {
  load(userId) {
    if (!isClient()) {
      return null;
    }

    const raw = window.localStorage.getItem(getStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as ListsStateSnapshot;
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

const loadOwnedListsAndInteractions = async (userId: string): Promise<RemoteListsPayload | null> => {
  if (!isRemoteSyncEnabled(userId)) {
    return null;
  }

  const userListsRelation = getSupabaseUserListsRelation() as any;
  const listInteractionsRelation = getSupabaseListInteractionsRelation() as any;

  if (!userListsRelation || !listInteractionsRelation) {
    return null;
  }

  const [{ data: userListsData, error: userListsError }, { data: interactionsData, error: interactionsError }] =
    await Promise.all([
      userListsRelation
        .select(
          [
            'id',
            supabaseUserListsUserColumn,
            'owner_name',
            'title',
            'movie_ids',
            'save_count',
            'average_rating',
            'rating_count',
            'is_private',
            'source_list_id',
            'created_at',
            'updated_at'
          ].join(', ')
        )
        .eq(supabaseUserListsUserColumn, userId)
        .order('updated_at', { ascending: false }),
      listInteractionsRelation
        .select([supabaseListInteractionsUserColumn, 'list_id', 'saved', 'personal_rating'].join(', '))
        .eq(supabaseListInteractionsUserColumn, userId)
    ]);

  if (userListsError) {
    throw userListsError;
  }

  if (interactionsError) {
    throw interactionsError;
  }

  return {
    userLists: ((userListsData ?? []) as unknown as SupabaseUserListRow[]).map(normalizeUserListRow),
    interactions: ((interactionsData ?? []) as unknown as SupabaseListInteractionRow[]).map(
      normalizeInteractionRow
    )
  };
};

export const remoteListRepository = {
  async load(userId: string): Promise<ListsStateSnapshot | null> {
    const payload = await loadOwnedListsAndInteractions(userId);

    if (!payload) {
      return null;
    }

    return {
      userId,
      ...payload
    };
  },
  async loadSharedLists(userId: string): Promise<SharedMovieListRecord[]> {
    if (!isRemoteSyncEnabled(userId)) {
      return [];
    }

    const userListsRelation = getSupabaseUserListsRelation() as any;

    if (!userListsRelation) {
      return [];
    }

    const { data, error } = await userListsRelation
      .select(
        [
          'id',
          supabaseUserListsUserColumn,
          'owner_name',
          'title',
          'movie_ids',
          'save_count',
          'average_rating',
          'rating_count',
          'is_private',
          'source_list_id',
          'created_at',
          'updated_at'
        ].join(', ')
      )
      .eq('is_private', false)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return normalizeSharedListRows((data ?? []) as unknown as SupabaseUserListRow[]);
  },
  async save(snapshot: ListsStateSnapshot): Promise<void> {
    if (!isRemoteSyncEnabled(snapshot.userId)) {
      return;
    }

    const userListsRelation = getSupabaseUserListsRelation() as any;
    const listInteractionsRelation = getSupabaseListInteractionsRelation() as any;

    if (!userListsRelation || !listInteractionsRelation) {
      return;
    }

    const userListPayload = snapshot.userLists.map((list) => serializeUserListRow(snapshot.userId, list));
    const interactionPayload = snapshot.interactions.map((interaction) =>
      serializeInteractionRow(snapshot.userId, interaction)
    );

    const { error: deleteListsError } = await userListsRelation
      .delete()
      .eq(supabaseUserListsUserColumn, snapshot.userId);

    if (deleteListsError) {
      throw deleteListsError;
    }

    const { error: deleteInteractionsError } = await listInteractionsRelation
      .delete()
      .eq(supabaseListInteractionsUserColumn, snapshot.userId);

    if (deleteInteractionsError) {
      throw deleteInteractionsError;
    }

    if (userListPayload.length > 0) {
      const { error: insertListsError } = await userListsRelation.insert(userListPayload);

      if (insertListsError) {
        throw insertListsError;
      }
    }

    if (interactionPayload.length > 0) {
      const { error: insertInteractionsError } = await listInteractionsRelation.insert(interactionPayload);

      if (insertInteractionsError) {
        throw insertInteractionsError;
      }
    }
  },
  async clear(userId: string): Promise<void> {
    if (!isRemoteSyncEnabled(userId)) {
      return;
    }

    const userListsRelation = getSupabaseUserListsRelation() as any;
    const listInteractionsRelation = getSupabaseListInteractionsRelation() as any;

    if (!userListsRelation || !listInteractionsRelation) {
      return;
    }

    const { error: deleteListsError } = await userListsRelation.delete().eq(supabaseUserListsUserColumn, userId);

    if (deleteListsError) {
      throw deleteListsError;
    }

    const { error: deleteInteractionsError } = await listInteractionsRelation
      .delete()
      .eq(supabaseListInteractionsUserColumn, userId);

    if (deleteInteractionsError) {
      throw deleteInteractionsError;
    }
  }
};
