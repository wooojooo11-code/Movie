<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import {
  buildMissionBingo,
  defaultMissionBingoBoardId,
  getNextMissionBingoBoardId,
  isMissionBingoBoardId,
  type MissionBingoBoardId
} from '@/services/missionBingo';
import { useRecommendationStore } from '@/services/recommendationStore';

const recommendationStore = useRecommendationStore();
const props = withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  {
    compact: false
  }
);
const activeBoardId = ref<MissionBingoBoardId>(defaultMissionBingoBoardId);
const hasLoadedStoredBoard = ref(false);
const boardStorageKey = computed(
  () => `moodie:mission-bingo-board:${recommendationStore.state.userId}`
);
const bingo = computed(() =>
  buildMissionBingo(
    recommendationStore.ratedMoviesHistory.value.map(({ ratingRecord }) => ratingRecord),
    activeBoardId.value
  )
);
const canRequestNewBoard = computed(() => bingo.value.completedLineCount > 0);

const getMissionProgress = (progress: number, target: number) => Math.min(progress, target);
const isMissionComplete = (progress: number, target: number) => progress >= target;

const restoreStoredBoard = () => {
  const storedBoardId = window.localStorage.getItem(boardStorageKey.value);
  activeBoardId.value = isMissionBingoBoardId(storedBoardId)
    ? storedBoardId
    : defaultMissionBingoBoardId;
};

const requestNewBoard = () => {
  if (!canRequestNewBoard.value) {
    return;
  }

  activeBoardId.value = getNextMissionBingoBoardId(activeBoardId.value);
};

onMounted(() => {
  restoreStoredBoard();
  hasLoadedStoredBoard.value = true;
});

watch(
  () => recommendationStore.state.userId,
  () => {
    if (hasLoadedStoredBoard.value) {
      restoreStoredBoard();
    }
  }
);

watch(activeBoardId, (boardId) => {
  if (hasLoadedStoredBoard.value) {
    window.localStorage.setItem(boardStorageKey.value, boardId);
  }
});
</script>

<template>
  <section
    aria-labelledby="mission-bingo-title"
    class="corner-hard border border-app-line bg-app-panel"
    :class="props.compact ? 'p-3' : 'p-4 sm:p-5'"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[11px] font-semibold tracking-[0.14em] text-app-accent">MOVIE MISSION</p>
        <h2 id="mission-bingo-title" class="mt-1 text-lg font-semibold text-white">{{ bingo.boardTitle }}</h2>
        <p class="mt-1 text-xs leading-relaxed text-app-muted">
          {{ bingo.boardDescription }} 영화를 평가하면 진행도가 자동으로 채워져요.
        </p>
      </div>
      <div class="corner-soft shrink-0 border border-app-line bg-app-panelSoft px-2.5 py-2 text-right">
        <p class="text-[10px] font-medium text-app-muted">완성 칸</p>
        <p class="mt-0.5 text-sm font-semibold text-white">{{ bingo.completedCellCount }}/9</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-1.5 sm:gap-2" :class="props.compact ? 'mt-3' : 'mt-4'">
      <article
        v-for="(mission, index) in bingo.missions"
        :key="mission.id"
        class="corner-soft relative flex flex-col border"
        :class="[
          props.compact ? 'min-h-20 p-2' : 'min-h-32 p-2.5 sm:min-h-36 sm:p-3',
          isMissionComplete(mission.progress, mission.target)
            ? 'border-app-accent bg-app-accent text-white'
            : 'border-app-line bg-app-panelSoft text-white'
        ]"
      >
        <span
          class="inline-flex w-fit items-center border px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em]"
          :class="[
            props.compact ? 'mb-1' : 'mb-2',
            isMissionComplete(mission.progress, mission.target)
              ? 'border-white/40 bg-white/10 text-white'
              : 'border-app-line text-app-muted'
          ]"
        >
          {{ String(index + 1).padStart(2, '0') }}
        </span>
        <h3 class="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm">{{ mission.label }}</h3>
        <p
          class="line-clamp-2 text-[10px] leading-snug sm:text-[11px]"
          :class="[
            props.compact ? 'mt-0.5' : 'mt-1',
            isMissionComplete(mission.progress, mission.target) ? 'text-white/80' : 'text-app-muted'
          ]"
        >
          {{ mission.description }}
        </p>
        <div class="mt-auto" :class="props.compact ? 'pt-1.5' : 'pt-3'">
          <div
            class="h-1 overflow-hidden"
            :class="isMissionComplete(mission.progress, mission.target) ? 'bg-white/25' : 'bg-app-line'"
          >
            <span
              class="block h-full transition-[width] duration-300"
              :class="isMissionComplete(mission.progress, mission.target) ? 'bg-white' : 'bg-app-accent'"
              :style="{ width: `${(getMissionProgress(mission.progress, mission.target) / mission.target) * 100}%` }"
            />
          </div>
          <p class="text-right text-[10px] font-semibold" :class="props.compact ? 'mt-1' : 'mt-1.5'">
            {{ getMissionProgress(mission.progress, mission.target) }}/{{ mission.target }}
          </p>
        </div>
        <span
          v-if="isMissionComplete(mission.progress, mission.target)"
          class="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full border border-white/50 text-[10px] leading-none"
          aria-label="완료"
        >
          ✓
        </span>
      </article>
    </div>

    <div v-if="canRequestNewBoard" class="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs font-medium text-app-accent">{{ bingo.completedLineCount }}줄 빙고를 완성했어요!</p>
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 items-center justify-center border border-app-accent bg-app-accent px-3 text-xs font-semibold text-white"
        @click="requestNewBoard"
      >
        새 빙고판 받기
      </button>
    </div>
    <p v-else class="mt-3 text-xs text-app-muted">가로·세로·대각선 한 줄을 먼저 완성해 보세요.</p>
  </section>
</template>
