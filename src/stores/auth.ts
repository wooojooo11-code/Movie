import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';

import {
  getSupabaseRatingsRelation,
  isSupabaseConfigured,
  supabase,
  supabaseRatingsUserColumn
} from '@/lib/supabase';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';

interface AuthState {
  errorMessage: string;
  isConfigured: boolean;
  isInitialized: boolean;
  isSubmitting: boolean;
  ratingCount: null | number;
  session: null | Session;
  user: null | User;
}

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

      await this.applySession(session);

      supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, nextSession: null | Session) => {
        await this.applySession(nextSession);
      });

      this.isInitialized = true;
    },
    async applySession(session: null | Session) {
      const recommendationStore = useRecommendationStore();
      const listStore = useListStore();

      this.session = session;
      this.user = session?.user ?? null;
      this.errorMessage = '';
      await recommendationStore.setActiveUser(session?.user?.id ?? 'guest-user');
      listStore.setActiveUser(session?.user?.id ?? 'guest-user');

      if (!session?.user || !supabase) {
        this.ratingCount = null;
        return;
      }

      await this.refreshRatingCount();
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
      return this.ratingCount === 0 ? '/rating' : fallbackPath;
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

        await this.applySession(data.session);
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

        await this.applySession(data.session);

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
        await this.applySession(null);
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        await this.applySession(null);
      } catch (error) {
        this.errorMessage = extractAuthMessage(error, '로그아웃에 실패했어요.');
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    }
  }
});
