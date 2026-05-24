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
        state.notice = '가입 확인 메일을 보냈어요. 이메일 인증 뒤 로그인해 주세요.';
        setMode('login');
        return;
      }

      void router.replace(result.redirectPath);
      return;
    }

    await authStore.signIn(state.email.trim(), state.password.trim());
    void router.replace(resolveRedirectPath());
  } catch {
    // store message is shown below
  }
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section class="border border-app-line bg-app-panel px-5 py-5">
      <h1 class="text-[27px] font-semibold leading-tight text-white">{{ pageTitle }}</h1>
      <p class="mt-2 text-sm text-app-muted">
        취향분석 기록과 추천을 계정에 이어서 담아둘 수 있어요.
      </p>
    </section>

    <section class="border border-app-line bg-app-panel px-5 py-5">
      <div class="grid grid-cols-2 border border-app-line bg-app-panelSoft">
        <button
          type="button"
          class="focus-ring min-h-10 text-sm"
          :class="!isSignupMode ? 'bg-app-accent text-white' : 'text-app-muted'"
          @click="setMode('login')"
        >
          로그인
        </button>
        <button
          type="button"
          class="focus-ring min-h-10 text-sm"
          :class="isSignupMode ? 'bg-app-accent text-white' : 'text-app-muted'"
          @click="setMode('signup')"
        >
          회원가입
        </button>
      </div>

      <form class="mt-5 grid gap-4" @submit.prevent="submit">
        <div class="grid gap-2">
          <label class="text-sm font-medium text-app-muted" for="auth-email">이메일</label>
          <input
            id="auth-email"
            v-model.trim="state.email"
            type="email"
            autocomplete="email"
            class="focus-ring h-12 border border-app-line bg-app-panelSoft px-4 text-sm text-white placeholder:text-app-muted"
            placeholder="you@example.com"
          />
        </div>

        <div v-if="isSignupMode" class="grid gap-2">
          <label class="text-sm font-medium text-app-muted" for="auth-nickname">닉네임</label>
          <input
            id="auth-nickname"
            v-model.trim="state.nickname"
            type="text"
            autocomplete="nickname"
            class="focus-ring h-12 border border-app-line bg-app-panelSoft px-4 text-sm text-white placeholder:text-app-muted"
            placeholder="무비메이트"
          />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium text-app-muted" for="auth-password">비밀번호</label>
          <input
            id="auth-password"
            v-model.trim="state.password"
            type="password"
            autocomplete="current-password"
            class="focus-ring h-12 border border-app-line bg-app-panelSoft px-4 text-sm text-white placeholder:text-app-muted"
            placeholder="6자 이상 입력"
          />
        </div>

        <p
          v-if="!authStore.isConfigured"
          class="border border-app-line bg-app-panelSoft px-4 py-3 text-sm text-app-muted"
        >
          Supabase URL과 anon key가 아직 설정되지 않았어요. `.env.local`에
          `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 넣어 주세요.
        </p>
        <p
          v-else-if="authStore.errorMessage || state.notice"
          class="border border-app-line bg-app-panelSoft px-4 py-3 text-sm text-app-muted"
        >
          {{ authStore.errorMessage || state.notice }}
        </p>

        <button
          type="submit"
          class="focus-ring min-h-11 border border-app-accent bg-app-accent px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canSubmit || authStore.isSubmitting"
        >
          {{ authStore.isSubmitting ? '처리 중' : submitLabel }}
        </button>
      </form>
    </section>
  </main>
</template>
