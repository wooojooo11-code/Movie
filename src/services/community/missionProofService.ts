import { buildMissionBingo, defaultMissionBingoBoardId } from '@/services/missionBingo';
import type { StoredRatingRecord } from '@/types/recommendation';

/**
 * 현재 미션은 기존 빙고 계산 결과를 사용합니다.
 * 나중에 미션 테이블이 생기면 이 함수만 원격 조회로 교체하면 됩니다.
 */
export const getMissionProofChoices = (ratings: readonly StoredRatingRecord[]) =>
  buildMissionBingo(ratings, defaultMissionBingoBoardId).missions.map((mission) => ({
    id: mission.id,
    name: mission.label,
    isCompleted: mission.progress >= mission.target,
    badgeLabel: mission.progress >= mission.target ? 'MISSION COMPLETE' : 'MISSION TRY'
  }));
