<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import type { RatedCatalogMovieRecord, StoredRatingRecord } from '@/types/recommendation';

const props = defineProps<{
  entries: RatedCatalogMovieRecord[];
}>();

const emit = defineEmits<{
  close: [];
  select: [movieId: string];
}>();

const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
let previousBodyOverflow = '';

const normalizeSearchValue = (value: string) =>
  value.toLocaleLowerCase('ko-KR').replace(/\s+/g, '');

const normalizedSearchQuery = computed(() => normalizeSearchValue(searchQuery.value.trim()));

const filteredEntries = computed(() => {
  const query = normalizedSearchQuery.value;

  if (!query) {
    return props.entries;
  }

  return props.entries.filter(({ movie, ratingRecord }) => {
    const haystack = [
      movie.title,
      String(movie.releaseYear),
      ...movie.genres,
      ...movie.tags,
      ...ratingRecord.input.reviewTags,
      ...ratingRecord.input.favoriteCharacters,
      ratingRecord.reviewText,
      ratingRecord.questionText
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ');

    return normalizeSearchValue(haystack).includes(query);
  });
});

const decisionLabels: Record<StoredRatingRecord['rawDecision'], string> = {
  dislike: '별로',
  like: '재밌음',
  not_interested: '관심 없음',
  not_seen: '안 봄'
};

const getRatingLabel = (record: StoredRatingRecord) =>
  record.input.rating == null
    ? decisionLabels[record.rawDecision]
    : `★ ${record.input.rating.toFixed(1)}`;

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

onMounted(async () => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKeydown);
  await nextTick();
  searchInput.value?.focus();
});

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow;
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex items-center bg-slate-950/45 p-4"
      @click.self="emit('close')"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-history-picker-title"
        class="modal-enter mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-w-[800px]"
      >
        <header class="flex items-start justify-between gap-4 border-b border-app-line px-4 py-4 sm:px-5">
          <div class="min-w-0">
            <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">EDIT RATING</p>
            <h2 id="rating-history-picker-title" class="mt-1 text-xl font-bold text-[#173a5e]">
              수정할 영화 선택
            </h2>
            <p class="mt-1 text-sm text-app-muted">평가한 영화 {{ entries.length }}편</p>
          </div>
          <IconButton :icon="X" label="평가 선택 창 닫기" @click="emit('close')" />
        </header>

        <div class="border-b border-app-line bg-white px-4 py-3 sm:px-5">
          <label class="relative block">
            <span class="sr-only">평가한 영화 검색</span>
            <Search
              :size="18"
              aria-hidden="true"
              class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted"
            />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="search"
              placeholder="영화 제목, 장르로 검색"
              class="focus-ring h-12 w-full rounded-2xl border border-app-line bg-app-panelSoft pl-11 pr-4 text-sm text-[#15171c] placeholder:text-app-muted"
            />
          </label>
          <p class="mt-2 text-right text-xs text-app-muted" aria-live="polite">
            {{ searchQuery.trim() ? `${filteredEntries.length}편 찾음` : '최근 평가순' }}
          </p>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div v-if="filteredEntries.length" class="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5 sm:gap-x-4">
            <button
              v-for="entry in filteredEntries"
              :key="entry.movie.id"
              type="button"
              class="focus-ring group min-w-0 rounded-2xl text-left"
              :aria-label="`${entry.movie.title} 평가 수정하기`"
              @click="emit('select', entry.movie.id)"
            >
              <span class="relative block aspect-[2/3] overflow-hidden rounded-2xl bg-app-poster shadow-sm">
                <img
                  :src="entry.movie.posterUrl"
                  :alt="entry.movie.posterAlt"
                  class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span class="absolute bottom-1.5 left-1.5 rounded-full bg-[#173a5e]/90 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                  {{ getRatingLabel(entry.ratingRecord) }}
                </span>
              </span>
              <span class="mt-2 line-clamp-2 block text-xs font-semibold leading-4 text-[#173a5e]">
                {{ entry.movie.title }}
              </span>
              <span class="mt-0.5 block text-[10px] text-app-muted">{{ entry.movie.releaseYear }}</span>
            </button>
          </div>

          <div
            v-else
            class="rounded-2xl border border-dashed border-app-line bg-app-panelSoft px-4 py-8 text-center"
          >
            <p class="text-sm font-semibold text-[#173a5e]">검색 결과가 없어요.</p>
            <p class="mt-1 text-xs text-app-muted">영화 제목이나 장르를 다시 확인해 보세요.</p>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
