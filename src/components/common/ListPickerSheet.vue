<script setup lang="ts">
import { Check, ListPlus, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import IconButton from '@/components/common/IconButton.vue';
import { useListStore } from '@/services/listStore';
import type { CatalogMovie } from '@/types/recommendation';

const props = defineProps<{
  movie: CatalogMovie;
}>();

const emit = defineEmits<{
  close: [];
}>();

const listStore = useListStore();
const router = useRouter();
const pendingListId = ref<null | string>(null);
const message = ref('');
const lists = computed(() => listStore.editableLists.value);

const add = async (listId: string) => {
  if (pendingListId.value) return;
  pendingListId.value = listId;
  message.value = '';

  try {
    const result = await listStore.addMovieToList(listId, props.movie);
    message.value =
      result === 'added'
        ? '리스트에 추가했어요.'
        : result === 'exists'
          ? '이미 이 리스트에 있어요.'
          : '이 리스트에는 추가할 수 없어요.';
  } finally {
    pendingListId.value = null;
  }
};

const createListWithMovie = async () => {
  listStore.resetDraft();
  listStore.resetMovieSearchState();
  listStore.addMovieToDraft(props.movie);
  emit('close');
  await router.push({
    name: 'lists',
    query: { compose: '1', movieId: props.movie.id }
  });
};
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-end bg-slate-950/35 p-4 pt-10 sm:items-center" @click.self="emit('close')">
    <section class="modal-enter mx-auto w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl sm:max-w-[800px]" aria-label="리스트에 영화 추가">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-app-accent">LISTS</p>
          <h3 class="mt-1 text-lg font-bold text-[#173a5e]">어느 리스트에 담을까요?</h3>
          <p class="mt-1 text-sm text-app-muted">{{ props.movie.title }}</p>
        </div>
        <IconButton :icon="X" label="리스트 선택 닫기" @click="emit('close')" />
      </div>

      <div v-if="lists.length" class="mt-5 grid gap-2">
        <button
          v-for="list in lists"
          :key="list.id"
          type="button"
          class="focus-ring flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-app-line px-4 text-left transition hover:border-app-accent hover:bg-app-panelSoft"
          :disabled="pendingListId !== null"
          @click="add(list.id)"
        >
          <span class="min-w-0"><span class="block truncate text-sm font-semibold text-[#173a5e]">{{ list.title }}</span><span class="mt-1 block text-xs text-app-muted">영화 {{ list.movieIds.length }}편</span></span>
          <Check v-if="list.movieIds.includes(props.movie.id)" :size="18" class="shrink-0 text-app-accent" aria-label="이미 추가됨" />
          <ListPlus v-else :size="18" class="shrink-0 text-app-muted" aria-hidden="true" />
        </button>
      </div>
      <div v-else class="mt-5 rounded-2xl bg-app-panelSoft px-4 py-5">
        <p class="text-sm leading-6 text-app-muted">아직 만든 리스트가 없어요. 이 영화를 담은 새 리스트부터 만들 수 있어요.</p>
        <button type="button" class="button-primary mt-3 min-h-10 rounded-xl px-3 text-sm font-semibold" @click="createListWithMovie">새 리스트 만들기</button>
      </div>
      <p v-if="message" class="mt-3 text-sm font-medium text-app-accent" aria-live="polite">{{ message }}</p>
    </section>
  </div>
</template>
