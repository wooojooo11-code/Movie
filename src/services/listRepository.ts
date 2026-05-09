import type { ListsStateSnapshot } from '@/types/lists';

const STORAGE_PREFIX = 'movielist:user-lists';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

export interface ListRepository {
  load(userId: string): ListsStateSnapshot | null;
  save(snapshot: ListsStateSnapshot): void;
}

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
  }
};
