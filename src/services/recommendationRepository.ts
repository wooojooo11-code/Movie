import type { RecommendationStateSnapshot } from '@/types/recommendation';

const STORAGE_PREFIX = 'movielist:recommendation-state';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

export interface RecommendationRepository {
  load(userId: string): RecommendationStateSnapshot | null;
  save(snapshot: RecommendationStateSnapshot): void;
  clear(userId: string): void;
}

export const localRecommendationRepository: RecommendationRepository = {
  load(userId) {
    if (!isClient()) {
      return null;
    }

    const raw = window.localStorage.getItem(getStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as RecommendationStateSnapshot;
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
