<script setup lang="ts">
import { Edit3, Trash2 } from 'lucide-vue-next';
import { computed } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import type { ResolvedLibraryMovieRecord } from '@/types/library';

const props = defineProps<{
  item: ResolvedLibraryMovieRecord;
}>();

defineEmits<{
  edit: [item: ResolvedLibraryMovieRecord];
  remove: [movieId: string];
}>();

const ratingText = computed(() => (props.item.rating == null ? null : `${props.item.rating.toFixed(1)} / 5.0`));
</script>

<template>
  <article class="group relative">
    <button type="button" class="focus-ring poster-card block w-full overflow-hidden text-left" :aria-label="`${item.movie.title} 보관 기록 수정`" @click="$emit('edit', item)">
      <img :src="item.movie.posterUrl" :alt="item.movie.posterAlt" class="aspect-[2/3] w-full object-cover" loading="lazy" />
    </button>
    <div class="absolute right-2 top-2 flex gap-1 opacity-100 sm:pointer-events-none sm:opacity-0 sm:transition sm:group-hover:pointer-events-auto sm:group-hover:opacity-100">
      <IconButton :icon="Edit3" label="보관 기록 수정" size="sm" @click="$emit('edit', item)" />
      <IconButton :icon="Trash2" label="보관함에서 제거" size="sm" @click="$emit('remove', item.movie.id)" />
    </div>
    <div class="px-0.5 pt-2">
      <h3 class="line-clamp-2 text-sm font-semibold leading-5 text-white">{{ item.movie.title }}</h3>
      <p v-if="ratingText" class="mt-2 text-xs font-semibold text-[#f4c95d]">
        ★ {{ ratingText }}
      </p>
      <p v-if="item.reviewText" class="mt-2 line-clamp-3 text-xs leading-5 text-white/80">
        “{{ item.reviewText }}”
      </p>
    </div>
  </article>
</template>
