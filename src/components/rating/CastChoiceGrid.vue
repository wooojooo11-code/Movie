<script setup lang="ts">
import { UserRound } from 'lucide-vue-next';
import { ref, watch } from 'vue';

import { loadCharacterChoicesWithPhotos } from '@/services/tmdbMovieCast';
import type { CharacterChoice } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    compact?: boolean;
    selectedCharacters: string[];
    tmdbMovieId?: null | number;
  }>(),
  {
    compact: false,
    tmdbMovieId: null
  }
);

const emit = defineEmits<{
  toggle: [characterName: string];
}>();

const displayedCharacters = ref<CharacterChoice[]>([]);
let loadGeneration = 0;

watch(
  () => [props.tmdbMovieId, props.characters] as const,
  async ([tmdbMovieId, characters]) => {
    const generation = ++loadGeneration;
    displayedCharacters.value = characters.map((character) => ({ ...character }));

    if (!tmdbMovieId || characters.length === 0) return;

    try {
      const choicesWithPhotos = await loadCharacterChoicesWithPhotos(tmdbMovieId, characters);
      if (generation === loadGeneration) displayedCharacters.value = choicesWithPhotos;
    } catch (error) {
      console.warn('[CastChoiceGrid] Actor photos could not be loaded.', error);
    }
  },
  { immediate: true }
);

const isSelected = (characterName: string) => props.selectedCharacters.includes(characterName);

const hideBrokenImage = (event: Event) => {
  const image = event.currentTarget;
  if (image instanceof HTMLImageElement) image.hidden = true;
};
</script>

<template>
  <div class="grid gap-2 sm:grid-cols-2">
    <button
      v-for="character in displayedCharacters"
      :key="`${character.actorName ?? 'unknown'}-${character.name}`"
      type="button"
      class="focus-ring corner-soft flex items-center gap-2.5 border text-left transition-[background-color,border-color,color,transform] active:scale-[0.98]"
      :class="[
        props.compact
          ? 'w-full max-w-[14rem] justify-self-start px-2 py-1.5 text-[11px] leading-tight sm:max-w-none sm:px-2.5 sm:py-2.5 sm:text-sm sm:leading-normal'
          : 'w-full px-2.5 py-2.5 text-sm',
        isSelected(character.name)
          ? 'border-app-accent bg-app-accent text-white'
          : 'border-app-line bg-app-panelSoft text-[#15171c]'
      ]"
      :aria-pressed="isSelected(character.name)"
      @click="emit('toggle', character.name)"
    >
      <span
        class="relative grid shrink-0 place-items-center overflow-hidden rounded-full border"
        :class="[
          props.compact ? 'size-9 sm:size-12' : 'size-12',
          isSelected(character.name)
            ? 'border-white/50 bg-white/15 text-white'
            : 'border-app-line bg-white text-app-muted'
        ]"
        aria-hidden="true"
      >
        <UserRound :size="props.compact ? 17 : 21" :stroke-width="1.7" />
        <img
          v-if="character.actorPhotoUrl"
          :src="character.actorPhotoUrl"
          :alt="`${character.actorName ?? character.name} 배우 사진`"
          class="absolute inset-0 size-full object-cover"
          loading="lazy"
          @error="hideBrokenImage"
        />
      </span>

      <span class="min-w-0 flex-1">
        <span class="block truncate font-semibold">
          {{ character.actorName ?? '배우 정보 없음' }}
        </span>
        <span
          class="mt-0.5 block truncate"
          :class="[
            props.compact ? 'text-[10px] sm:text-xs' : 'text-xs',
            isSelected(character.name) ? 'text-white/80' : 'text-app-muted'
          ]"
        >
          {{ character.name }} 역
        </span>
      </span>
    </button>
  </div>
</template>
