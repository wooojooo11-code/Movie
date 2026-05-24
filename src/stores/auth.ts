import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';

import {
  getSupabaseRatingsRelation,
  isSupabaseConfigured,
  supabase,
  supabaseAuthStorageKey,
  supabaseRatingsUserColumn
} from '@/lib/supabase';
import { useLibraryStore } from '@/services/libraryStore';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';

let hasLifecycleListeners = false;
let isSigningOut = false;
let sessionSyncIntervalId: null | ReturnType<typeof setInterval> = null;
let sessionSyncPromise: null | Promise<void> = null;
let lastSessionSyncAt = 0;

interface AuthState {
  errorMessage: string;
  isConfigured: boolean;
  isInitialized: boolean;
  isSubmitting: boolean;
  ratingCount: null | number;
  session: null | Session;
  user: null | User;
}

const SESSION_SYNC_THROTTLE_MS = 4000;

const extractAuthMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const getEmailRedirectTo = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/login`;
};

const hasStoredSupabaseSession = () => {
  if (typeof window === 'undefined' || !supabaseAuthStorageKey) {
    return false;
  }

  return Boolean(
    window.localStorage.getItem(supabaseAuthStorageKey) || window.sessionStorage.getItem(supabaseAuthStorageKey)
  );
};

const clearStoredSupabaseSession = () => {
  if (typeof window === 'undefined' || !supabaseAuthStorageKey) {
    return;
  }

  window.localStorage.removeItem(supabaseAuthStorageKey);
  window.sessionStorage.removeItem(supabaseAuthStorageKey);
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    errorMessage: '',
    isConfigured: isSupabaseConfigured,
    isInitialized: false,
    isSubmitting: false,
    ratingCount: null,
    session: null,
    user: null
  }),
  getters: {
    displayName(state) {
      if (!state.user) {
        return '';
      }

      const nickname = state.user.user_metadata.nickname as string | undefined;
      const fullName = state.user.user_metadata.full_name as string | undefined;

      return nickname?.trim() || fullName?.trim() || state.user.email || '';
    },
    isAuthenticated: (state) => Boolean(state.user),
    shouldStartRatingFlow: (state) => state.ratingCount === 0
  },
  actions: {
    async applySignedOutState() {
      clearStoredSupabaseSession();
      await this.applySession(null);
    },
    async initialize() {
      if (this.isInitialized) {
        return;
      }

      if (!supabase) {
        this.isInitialized = true;
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      await this.reconcileResolvedSession(session);

      supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, nextSession: null | Session) => {
        await this.reconcileResolvedSession(nextSession);
      });

      if (typeof window !== 'undefined' && !hasLifecycleListeners) {
        const syncOnResume = () => {
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
          }

          void this.syncSession({ force: true });
        };

        const syncOnInteraction = () => {
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
          }

          void this.syncSession();
        };

        window.addEventListener('focus', syncOnResume);
        window.addEventListener('pageshow', syncOnResume);
        window.addEventListener('popstate', syncOnResume);
        window.addEventListener('online', syncOnResume);
        window.addEventListener('resume', syncOnResume as EventListener);
        window.addEventListener('storage', syncOnResume);
        window.addEventListener('pointerdown', syncOnInteraction, true);
        window.addEventListener('keydown', syncOnInteraction, true);
        document.addEventListener('visibilitychange', syncOnResume);

        hasLifecycleListeners = true;

        if (!sessionSyncIntervalId) {
          sessionSyncIntervalId = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
              return;
            }

            void this.syncSession({ force: true });
          }, 5000);
        }
      }

      this.isInitialized = true;
    },
    async applySession(session: null | Session) {
      const libraryStore = useLibraryStore();
      const recommendationStore = useRecommendationStore();
      const listStore = useListStore();
      const nickname = session?.user?.user_metadata.nickname as string | undefined;
      const fullName = session?.user?.user_metadata.full_name as string | undefined;
      const ownerName = nickname?.trim() || fullName?.trim() || session?.user?.email || '나';

      this.session = session;
      this.user = session?.user ?? null;
      this.errorMessage = '';

      await recommendationStore.setActiveUser(session?.user?.id ?? 'guest-user');
      await listStore.setActiveUser(session?.user?.id ?? 'guest-user', ownerName);
      await libraryStore.setActiveUser(session?.user?.id ?? 'guest-user');

      if (!session?.user || !supabase) {
        this.ratingCount = null;
        return;
      }

      await this.refreshRatingCount();
    },
    async reconcileResolvedSession(session: null | Session) {
      if (isSigningOut) {
        if (!session) {
          clearStoredSupabaseSession();
        }

        return;
      }

      if (!session) {
        const hadStoredSession = hasStoredSupabaseSession();

        clearStoredSupabaseSession();

        if (this.session || this.user || hadStoredSession) {
          await this.applySession(null);
        } else {
          this.session = null;
          this.user = null;
          this.ratingCount = null;
        }

        return;
      }

      await this.applySession(session);
    },
    async syncSession(options?: { force?: boolean }) {
      if (!supabase || isSigningOut) {
        return;
      }

      const force = options?.force ?? false;
      const now = Date.now();

      if (!force && now - lastSessionSyncAt < SESSION_SYNC_THROTTLE_MS) {
        return;
      }

      if (sessionSyncPromise) {
        await sessionSyncPromise;
        return;
      }

      lastSessionSyncAt = now;

      sessionSyncPromise = (async () => {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
          const hadStoredSession = hasStoredSupabaseSession();

          if (hadStoredSession) {
            clearStoredSupabaseSession();
          }

          if (this.session || this.user || hadStoredSession) {
            await this.applySession(null);
          }

          return;
        }

        const currentAccessToken = this.session?.access_token ?? null;
        const nextAccessToken = session.access_token ?? null;
        const currentUserId = this.user?.id ?? null;
        const nextUserId = session.user?.id ?? null;

        if (currentAccessToken !== nextAccessToken || currentUserId !== nextUserId) {
          await this.applySession(session);
          return;
        }

        if (session.user) {
          await this.refreshRatingCount();
        }
      })().finally(() => {
        sessionSyncPromise = null;
      });

      await sessionSyncPromise;
    },
    async refreshRatingCount() {
      if (!supabase || !this.user) {
        this.ratingCount = null;
        return 0;
      }

      const relation = getSupabaseRatingsRelation();

      if (!relation) {
        this.ratingCount = 0;
        return 0;
      }

      const { count, error } = await relation
        .select('movie_id', { count: 'exact', head: true })
        .eq(supabaseRatingsUserColumn, this.user.id);

      if (error) {
        this.errorMessage =
          '평가 수를 확인하지 못했어요. Supabase ratings 테이블과 user_id 컬럼 설정을 확인해 주세요.';
        this.ratingCount = 0;
        return 0;
      }

      this.ratingCount = count ?? 0;
      return this.ratingCount;
    },
    getPostLoginPath(fallbackPath = '/') {
      const recommendationStore = useRecommendationStore();

      if (this.ratingCount === 0 || recommendationStore.shouldResumeTasteAnalysis.value) {
        return '/rating';
      }

      return fallbackPath;
    },
    async signIn(email: string, password: string) {
      if (!supabase) {
        throw new Error('Supabase 환경 변수가 아직 설정되지 않았어요.');
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        await this.reconcileResolvedSession(data.session);
        return this.getPostLoginPath('/');
      } catch (error) {
        this.errorMessage = extractAuthMessage(error, '로그인에 실패했어요.');
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
    async signUp(email: string, password: string, nickname: string) {
      if (!supabase) {
        throw new Error('Supabase 환경 변수가 아직 설정되지 않았어요.');
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname,
              full_name: nickname
            },
            emailRedirectTo: getEmailRedirectTo()
          }
        });

        if (error) {
          throw error;
        }

        await this.reconcileResolvedSession(data.session);

        return {
          needsEmailConfirmation: !data.session,
          redirectPath: data.session ? this.getPostLoginPath('/') : '/login'
        };
      } catch (error) {
        this.errorMessage = extractAuthMessage(error, '회원가입에 실패했어요.');
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
    async signOut() {
      if (!supabase) {
        await this.applySignedOutState();
        return;
      }

      isSigningOut = true;
      this.isSubmitting = true;
      this.errorMessage = '';

      try {
        await this.applySignedOutState();
        const { error } = await supabase.auth.signOut({ scope: 'local' });

        if (error) {
          this.errorMessage = extractAuthMessage(error, '');
        }
      } catch {
        // Some browsers can leave the client in a stale state after returning from another site.
        // We still clear the local auth state so the user is not stuck.
      } finally {
        clearStoredSupabaseSession();
        lastSessionSyncAt = Date.now();
        isSigningOut = false;
        this.isSubmitting = false;
      }
    }
  }
});
