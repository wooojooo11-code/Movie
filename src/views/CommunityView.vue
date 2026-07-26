<script setup lang="ts">
import { computed, ref } from 'vue';

type Category = '전체' | '자유' | '리뷰' | '질문' | '스포일러';

type CommunityPost = {
  id: number;
  category: Exclude<Category, '전체'>;
  title: string;
  body: string;
  author: string;
  postedAt: string;
  comments: number;
  likes: number;
};

const categories: Category[] = ['전체', '자유', '리뷰', '질문', '스포일러'];
const activeCategory = ref<Category>('전체');
const draft = ref('');
const expandedPostId = ref<number | null>(null);
const likedPostIds = ref<number[]>([]);
const posts = ref<CommunityPost[]>([
  {
    id: 1,
    category: '리뷰',
    title: '이번 주말, 극장에서 본 영화 중 가장 좋았던 작품은?',
    body: '저는 사운드와 화면이 특히 인상적이었어요. 다른 분들이 고른 영화와 이유도 궁금합니다.',
    author: '필름로그',
    postedAt: '12분 전',
    comments: 18,
    likes: 42
  },
  {
    id: 2,
    category: '질문',
    title: '혼자 보기 좋은 영화관 좌석 추천 부탁드려요',
    body: '조용히 몰입해서 볼 수 있는 좌석 위치가 있을까요? 자주 가는 분들의 팁을 듣고 싶어요.',
    author: '주말관객',
    postedAt: '35분 전',
    comments: 9,
    likes: 16
  },
  {
    id: 3,
    category: '자유',
    title: '영화 보기 전에는 팝콘파, 보고 난 뒤에는 커피파',
    body: '저는 엔딩 크레딧까지 보고 근처 카페에서 한참 이야기하는 시간이 제일 좋아요.',
    author: '무비데이',
    postedAt: '1시간 전',
    comments: 24,
    likes: 31
  },
  {
    id: 4,
    category: '스포일러',
    title: '[스포일러] 어제 본 영화의 마지막 장면, 어떻게 해석하셨나요?',
    body: '제목에 스포일러가 포함된 글이에요. 아직 영화를 보지 않았다면 다음에 다시 이야기해요.',
    author: '엔딩콜렉터',
    postedAt: '2시간 전',
    comments: 37,
    likes: 28
  }
]);

const visiblePosts = computed(() =>
  activeCategory.value === '전체' ? posts.value : posts.value.filter((post) => post.category === activeCategory.value)
);

const draftLength = computed(() => draft.value.trim().length);

const publishPost = () => {
  const body = draft.value.trim();

  if (!body) {
    return;
  }

  posts.value.unshift({
    id: Date.now(),
    category: activeCategory.value === '전체' ? '자유' : activeCategory.value,
    title: body.length > 34 ? `${body.slice(0, 34)}…` : body,
    body,
    author: '나',
    postedAt: '방금 전',
    comments: 0,
    likes: 0
  });
  activeCategory.value = '전체';
  draft.value = '';
};

const toggleLike = (post: CommunityPost) => {
  const liked = likedPostIds.value.includes(post.id);

  likedPostIds.value = liked
    ? likedPostIds.value.filter((id) => id !== post.id)
    : [...likedPostIds.value, post.id];
  post.likes += liked ? -1 : 1;
};

const togglePost = (postId: number) => {
  expandedPostId.value = expandedPostId.value === postId ? null : postId;
};
</script>

<template>
  <main class="mx-auto w-full max-w-md px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl">
    <section aria-labelledby="community-title">
      <p class="text-xs font-semibold text-app-accent">COMMUNITY</p>
      <h1 id="community-title" class="mt-1 text-2xl font-semibold text-[#15171c]">영화 이야기</h1>
      <p class="mt-2 text-sm leading-5 text-app-muted">보고 싶은 영화부터 오래 남은 장면까지, 취향이 비슷한 사람들과 나눠보세요.</p>
    </section>

    <section class="corner-soft mt-6 border border-app-line bg-app-panel p-4" aria-labelledby="community-compose-title">
      <div class="flex items-center justify-between gap-3">
        <h2 id="community-compose-title" class="text-sm font-semibold text-[#15171c]">새 이야기 남기기</h2>
        <span class="text-xs text-app-muted">{{ draftLength }}자</span>
      </div>
      <label class="sr-only" for="community-draft">새 게시글</label>
      <textarea
        id="community-draft"
        v-model="draft"
        rows="3"
        maxlength="300"
        placeholder="오늘 본 영화, 궁금한 점, 함께 나누고 싶은 이야기를 적어보세요."
        class="focus-ring mt-3 w-full resize-none border border-app-line bg-app-panelSoft px-3 py-2.5 text-sm leading-5 text-[#15171c] placeholder:text-app-muted"
        @keydown.meta.enter.prevent="publishPost"
        @keydown.ctrl.enter.prevent="publishPost"
      />
      <div class="mt-3 flex items-center justify-between gap-3">
        <p class="text-xs text-app-muted">스포일러가 있다면 제목에 표시해 주세요.</p>
        <button
          type="button"
          class="focus-ring corner-soft min-h-10 shrink-0 border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!draftLength"
          @click="publishPost"
        >
          등록
        </button>
      </div>
    </section>

    <section class="mt-8" aria-labelledby="community-feed-title">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h2 id="community-feed-title" class="text-lg font-semibold text-[#15171c]">지금 이야기 중</h2>
          <p class="mt-1 text-xs text-app-muted">{{ visiblePosts.length }}개의 글</p>
        </div>
      </div>

      <div class="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="커뮤니티 주제">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          role="tab"
          :aria-selected="activeCategory === category"
          class="focus-ring corner-pill shrink-0 border px-3 py-1.5 text-xs font-medium transition-colors"
          :class="activeCategory === category ? 'border-app-accent bg-[#dcecff] text-[#174a77]' : 'border-app-line bg-app-panel text-app-muted'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="mt-4 grid gap-3">
        <article v-for="post in visiblePosts" :key="post.id" class="corner-soft border border-app-line bg-app-panel p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <span class="corner-pill inline-flex border border-[#bed3e8] bg-[#eef6ff] px-2 py-1 text-[11px] font-semibold text-[#174a77]">
                {{ post.category }}
              </span>
              <h3 class="mt-2 text-base font-semibold leading-6 text-[#15171c]">{{ post.title }}</h3>
            </div>
            <button
              type="button"
              class="focus-ring corner-soft shrink-0 border border-app-line px-2.5 py-1.5 text-xs font-medium text-[#174a77]"
              :aria-expanded="expandedPostId === post.id"
              @click="togglePost(post.id)"
            >
              {{ expandedPostId === post.id ? '접기' : '읽기' }}
            </button>
          </div>

          <p v-if="expandedPostId === post.id" class="mt-3 text-sm leading-6 text-app-muted">{{ post.body }}</p>

          <div class="mt-4 flex items-center justify-between gap-3 border-t border-app-line pt-3 text-xs text-app-muted">
            <p class="truncate">{{ post.author }} · {{ post.postedAt }}</p>
            <div class="flex shrink-0 items-center gap-3">
              <span>댓글 {{ post.comments }}</span>
              <button
                type="button"
                class="focus-ring corner-soft -my-1.5 px-2 py-1.5 font-medium"
                :class="likedPostIds.includes(post.id) ? 'text-[#174a77]' : 'text-app-muted'"
                :aria-pressed="likedPostIds.includes(post.id)"
                :aria-label="`공감 ${post.likes}개`"
                @click="toggleLike(post)"
              >
                공감 {{ post.likes }}
              </button>
            </div>
          </div>
        </article>

        <p v-if="visiblePosts.length === 0" class="corner-soft border border-dashed border-app-line px-4 py-8 text-center text-sm text-app-muted">
          이 주제의 첫 이야기를 남겨보세요.
        </p>
      </div>
    </section>
  </main>
</template>
