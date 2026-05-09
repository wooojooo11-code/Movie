<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

type AuthMode = 'login' | 'signup';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const state = reactive({
  mode: route.query.mode === 'signup' ? ('signup' as AuthMode) : ('login' as AuthMode),
  email: '',
  password: '',
  nickname: '',
  notice: ''
});

watch(
  () => route.query.mode,
  (nextMode) => {
    state.mode = nextMode === 'signup' ? 'signup' : 'login';
    state.notice = '';
  }
);

const isSignupMode = computed(() => state.mode === 'signup');
const pageTitle = computed(() => (isSignupMode.value ? '회원가입' : '로그인'));
const submitLabel = computed(() => (isSignupMode.value ? '회원가입' : '로그인'));
const canSubmit = computed(
  () =>
    state.email.trim().length > 0 &&
    state.password.trim().length >= 6 &&
    (!isSignupMode.value || state.nickname.trim().length > 0) &&
    authStore.isConfigured
);

const setMode = (mode: AuthMode) => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined;

  void router.replace({
    name: 'login',
    query:
      mode === 'signup'
        ? {
            ...(redirect ? { redirect } : {}),
            mode: 'signup'
          }
        : redirect
          ? { redirect }
          : {}
  });
};

const resolveRedirectPath = () => {
  const redirect = route.query.redirect;

  if (typeof redirect === 'string' && redirect.startsWith('/') && !authStore.shouldStartRatingFlow) {
    return redirect;
  }

  return authStore.getPostLoginPath('/');
};

const submit = async () => {
  state.notice = '';

  try {
    if (isSignupMode.value) {
      const result = await authStore.signUp(
        state.email.trim(),
        state.password.trim(),
        state.nickname.trim()
      );

      if (result.needsEmailConfirmation) {
        state.notice = '가입 확인 메일을 보냈어요. 이메일 인증 후 로그인해 주세요.';
        setMode('login');
        return;
      }

      void router.replace(result.redirectPath);
      return;
    }

    await authStore.signIn(state.email.trim(), state.password.trim());
    void router.replace(resolveRedirectPath());
  } catch {
    // The store already exposes a friendly message to the UI.
  }
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section
      class="rounded-[24px] border border-app-line bg-[radial-gradient(circle_at_top_right,rgba(125,123,255,0.35),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(255,93,143,0.24),transparent_28%),linear-gradient(180deg,#161a24,#10131b)] p-[22px]"
    >
      <p class="text-sm font-bold text-app-accent">MovieList 계정</p>
      <h1 class="mt-2 text-[28px] font-extrabold leading-tight text-white">{{ pageTitle }}</h1>
      <p class="mt-3 text-sm leading-6 text-[#c8d1df]">
        로그인하면 취향분석 기록과 추천 흐름을 계정 기준으로 이어서 쓸 수 있어요.
      </p>
    </section>

    <section class="rounded-[24px] border border-app-line bg-app-panel p-5">
      <div class="grid grid-cols-2 gap-2 rounded-[16px] bg-white/[0.04] p-1">
        <button
          type="button"
          class="focus-ring min-h-11 rounded-[12px] text-sm font-bold"
          :class="
            !isSignupMode
              ? 'app-gradient text-white'
              : 'border border-transparent bg-transparent text-app-muted'
          "
          @click="setMode('login')"
        >
          로그인
        </button>
        <button
          type="button"
          class="focus-ring min-h-11 rounded-[12px] text-sm font-bold"
          :class="
            isSignupMode
              ? 'app-gradient text-white'
              : 'border border-transparent bg-transparent text-app-muted'
          "
          @click="setMode('signup')"
        >
          회원가입
        </button>
      </div>

      <form class="mt-5 grid gap-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <label class="text-sm font-bold text-app-muted" for="auth-email">이메일</label>
          <input
            id="auth-email"
            v-model.trim="state.email"
            type="email"
            autocomplete="email"
            class="focus-ring h-12 rounded-[16px] border border-app-line bg-white/5 px-4 text-sm text-white placeholder:text-app-muted"
            placeholder="you@example.com"
          />
        </div>

        <div v-if="isSignupMode" class="grid gap-2">
          <label class="text-sm font-bold text-app-muted" for="auth-nickname">닉네임</label>
          <input
            id="auth-nickname"
            v-model.trim="state.nickname"
            type="text"
            autocomplete="nickname"
            class="focus-ring h-12 rounded-[16px] border border-app-line bg-white/5 px-4 text-sm text-white placeholder:text-app-muted"
            placeholder="무비러버"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-bold text-app-muted" for="auth-password">비밀번호</label>
          <input
            id="auth-password"
            v-model.trim="state.password"
            type="password"
            autocomplete="current-password"
            class="focus-ring h-12 rounded-[16px] border border-app-line bg-white/5 px-4 text-sm text-white placeholder:text-app-muted"
            placeholder="6자 이상 입력"
          />
        </div>

        <p
          v-if="!authStore.isConfigured"
          class="rounded-[16px] border border-app-line bg-white/[0.03] px-4 py-3 text-sm text-app-muted"
        >
          Supabase URL과 anon key가 아직 설정되지 않았어요. `.env.local`에
          `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 넣어 주세요.
        </p>
        <p
          v-else-if="authStore.errorMessage || state.notice"
          class="rounded-[16px] border border-app-line bg-white/[0.03] px-4 py-3 text-sm text-app-muted"
        >
          {{ authStore.errorMessage || state.notice }}
        </p>

        <button
          type="submit"
          class="app-gradient focus-ring min-h-12 rounded-[16px] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canSubmit || authStore.isSubmitting"
        >
          {{ authStore.isSubmitting ? '처리 중...' : submitLabel }}
        </button>
      </form>
    </section>
  </main>
</template>
