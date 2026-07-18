import type {
  SituationCompanion,
  SituationContextTag,
  SituationMood,
  SituationPresetId,
  SituationReason,
  SituationSelection,
  SituationSpecialDay,
  SituationViewingTime,
  SituationWeather
} from '@/types/recommendation';

export interface SituationRule {
  characterIncludes?: string[];
  contextTags?: SituationContextTag[];
  genreIds?: number[];
  tags?: string[];
  textIncludes?: string[];
  tmdbMovieIds?: number[];
}

export interface SituationPreset {
  id: SituationPresetId;
  label: string;
  rule: SituationRule;
}

export const situationOptionGroups = [
  {
    key: 'mood',
    label: '현재 기분',
    options: [
      { value: 'sad', label: '우울' },
      { value: 'stressed', label: '스트레스' },
      { value: 'comfort', label: '위로' },
      { value: 'okay', label: '나쁘지 않음' },
      { value: 'excited', label: '설렘' },
      { value: 'laugh', label: '웃음' },
      { value: 'tense', label: '긴장감' }
    ]
  },
  {
    key: 'companion',
    label: '누구와',
    options: [
      { value: 'alone', label: '혼자' },
      { value: 'friend', label: '친구' },
      { value: 'partner', label: '연인' },
      { value: 'family', label: '가족' },
      { value: 'parents', label: '부모님' },
      { value: 'siblings', label: '형제자매' }
    ]
  },
  {
    key: 'weather',
    label: '오늘 날씨',
    options: [
      { value: 'rain', label: '비' },
      { value: 'snow', label: '눈' },
      { value: 'cloudy', label: '흐림' },
      { value: 'sunny', label: '맑음' },
      { value: 'hot_summer', label: '무더운 여름' },
      { value: 'cold_winter', label: '추운 겨울' },
      { value: 'cool_autumn', label: '시원한 가을' },
      { value: 'warm_spring', label: '따뜻한 봄' }
    ]
  },
  {
    key: 'viewingTime',
    label: '영화 볼 수 있는 시간',
    options: [
      { value: 'any', label: '상관없음' },
      { value: 'under_90', label: '90분 이하' },
      { value: 'around_120', label: '약 2시간' },
      { value: 'over_135', label: '2시간 15분 이상' },
      { value: 'series', label: '시리즈 이어보기' }
    ]
  },
  {
    key: 'specialDay',
    label: '특별한 날',
    options: [
      { value: 'christmas', label: '크리스마스' },
      { value: 'halloween', label: '할로윈' },
      { value: 'valentines_day', label: '발렌타인데이' },
      { value: 'april_fools', label: '만우절' },
      { value: 'birthday', label: '생일' },
      { value: 'after_exam', label: '시험 끝난 직후' },
      { value: 'closing_ceremony', label: '방학식' },
      { value: 'new_year', label: '새해' },
      { value: 'graduation', label: '졸업식' },
      { value: 'entrance_ceremony', label: '입학식' },
      { value: 'couple_100_days', label: '연인과 100일' }
    ]
  },
  {
    key: 'reason',
    label: '보고 싶은 이유',
    options: [
      { value: 'study_motivation', label: '공부 의욕' },
      { value: 'creativity', label: '창의력' },
      { value: 'focus', label: '집중' },
      { value: 'motivation', label: '동기부여' },
      { value: 'free_time', label: '시간 나서' },
      { value: 'no_thoughts', label: '아무 생각 없음' }
    ]
  }
] as const;

export const moodRules: Record<SituationMood, SituationRule> = {
  sad: { tags: ['감동', '여운', '감성적인 음악'] },
  stressed: { genreIds: [35], tags: ['유쾌함', '유머', '빠른전개'] },
  comfort: { tags: ['감동', '여운', 'OST'] },
  okay: { genreIds: [12, 35, 16], tags: ['유쾌함', '영상미', '탄탄한 스토리'] },
  excited: { genreIds: [10749], tags: ['감성적인 음악', '영상미'] },
  laugh: { genreIds: [35], tags: ['유쾌함', '유머'] },
  tense: { genreIds: [53, 9648, 27], tags: ['긴장감', '몰입감', '반전'] }
};

export const companionRules: Record<SituationCompanion, SituationRule> = {
  alone: { genreIds: [18, 16], tags: ['여운', '영상미', '감동'] },
  friend: { genreIds: [35, 28, 53], tags: ['유쾌함', '긴장감', '액션'] },
  partner: { genreIds: [10749], tags: ['감성적인 음악', '영상미', '감동'] },
  family: { genreIds: [16, 10751], contextTags: ['family'], tags: ['감동', '유쾌함'] },
  parents: { genreIds: [18, 16], contextTags: ['family'], tags: ['감동', '여운'] },
  siblings: { genreIds: [35, 28, 53], tags: ['유쾌함', '액션', '긴장감'] }
};

export const weatherRules: Record<SituationWeather, SituationRule> = {
  rain: { tags: ['여운', '감성적인 음악'], textIncludes: ['비', 'rain'] },
  snow: { contextTags: ['winter'], tags: ['감동', '여운'] },
  cloudy: { genreIds: [9648, 18], tags: ['여운', '탄탄한 스토리'] },
  sunny: { genreIds: [12, 35], contextTags: ['travel'], tags: ['유쾌함', '영상미'] },
  hot_summer: { contextTags: ['summer'], genreIds: [12, 35], tags: ['유쾌함', '액션'] },
  cold_winter: { contextTags: ['winter', 'family'], tags: ['감동', '여운'] },
  cool_autumn: { genreIds: [10749, 18], tags: ['감성적인 음악', '영상미', '여운'] },
  warm_spring: { contextTags: ['spring'], genreIds: [10749], tags: ['감성적인 음악', '성장'] }
};

export const specialDayRules: Record<SituationSpecialDay, SituationRule> = {
  christmas: { contextTags: ['christmas', 'family'], tags: ['감동', '유쾌함'] },
  halloween: { contextTags: ['halloween'], genreIds: [27, 53], tags: ['긴장감'] },
  valentines_day: { genreIds: [10749], tags: ['감성적인 음악', '감동'] },
  april_fools: { genreIds: [35], tags: ['유머', '유쾌함'] },
  birthday: { contextTags: ['birthday', 'family'], tags: ['감동', '성장'] },
  after_exam: { genreIds: [28, 35, 878], tags: ['액션', '유쾌함', '몰입감'] },
  closing_ceremony: { contextTags: ['school'], genreIds: [35, 16], tags: ['유쾌함', '성장'] },
  new_year: { contextTags: ['new_year', 'family'], tags: ['감동', '성장'] },
  graduation: { contextTags: ['graduation', 'school'], tags: ['성장', '감동'] },
  entrance_ceremony: { contextTags: ['school'], tags: ['성장', '유쾌함'] },
  couple_100_days: { genreIds: [10749], tags: ['감성적인 음악', '여운'] }
};

export const reasonRules: Record<SituationReason, SituationRule> = {
  study_motivation: { tags: ['성장', '탄탄한 스토리', '몰입감'] },
  creativity: { tags: ['영상미', '연출', '세계관'] },
  focus: { genreIds: [53, 9648], tags: ['몰입감', '긴장감', '빠른전개'] },
  motivation: { tags: ['성장', '감동', '몰입감'] },
  free_time: { genreIds: [12, 878], tags: ['몰입감', '세계관'] },
  no_thoughts: { genreIds: [35, 16], tags: ['유쾌함', '유머'] }
};

export const manualSituationRule = (selection: SituationSelection): SituationRule => ({
  genreIds: [
    ...(moodRules[selection.mood].genreIds ?? []),
    ...(companionRules[selection.companion].genreIds ?? []),
    ...(weatherRules[selection.weather].genreIds ?? []),
    ...(specialDayRules[selection.specialDay].genreIds ?? []),
    ...(reasonRules[selection.reason].genreIds ?? [])
  ],
  tags: [
    ...(moodRules[selection.mood].tags ?? []),
    ...(companionRules[selection.companion].tags ?? []),
    ...(weatherRules[selection.weather].tags ?? []),
    ...(specialDayRules[selection.specialDay].tags ?? []),
    ...(reasonRules[selection.reason].tags ?? [])
  ],
  contextTags: [
    ...(companionRules[selection.companion].contextTags ?? []),
    ...(weatherRules[selection.weather].contextTags ?? []),
    ...(specialDayRules[selection.specialDay].contextTags ?? [])
  ],
  textIncludes: [...(weatherRules[selection.weather].textIncludes ?? [])]
});

export const situationPresets: SituationPreset[] = [
  { id: 'after_breakup', label: '헤어지고 난 첫 주', rule: { tags: ['감동', '여운', 'OST'] } },
  {
    id: 'offline_rest',
    label: '인스타·숏츠 끄고 쉬고 싶은 날',
    rule: { genreIds: [16, 18], tags: ['영상미', '감성적인 음악', '여운'] }
  },
  {
    id: 'cant_sleep',
    label: '잠이 안 옴',
    rule: { genreIds: [9648, 10749], tags: ['여운', '탄탄한 스토리'] }
  },
  {
    id: 'sunset',
    label: '해질무렵',
    rule: { genreIds: [10749, 18], tags: ['감성적인 음악', '영상미', '여운'] }
  },
  {
    id: 'after_reading',
    label: '책 읽고 여운 이어가고 싶을 때',
    rule: { contextTags: ['literary'], genreIds: [18], tags: ['탄탄한 스토리', '여운'] }
  },
  {
    id: 'before_travel',
    label: '여행 가기 전 기분 내기',
    rule: { contextTags: ['travel'], genreIds: [12, 35], tags: ['영상미', '유쾌함'] }
  },
  {
    id: 'monday_school',
    label: '월요일 학교 가기 싫을 때',
    rule: { contextTags: ['school'], genreIds: [35, 16], tags: ['유쾌함', '성장'] }
  },
  { id: 'cleaning', label: '청소하면서', rule: { genreIds: [35, 16], tags: ['유쾌함', 'OST'] } },
  {
    id: 'before_confession',
    label: '고백하기 전',
    rule: { genreIds: [10749], tags: ['감성적인 음악', '성장', '감동'] }
  },
  {
    id: 'autumn_vibes',
    label: '가을 감성',
    rule: { genreIds: [10749, 18], tags: ['감성적인 음악', '영상미', '여운'] }
  },
  {
    id: 'sunday_night',
    label: '일요일 밤',
    rule: { genreIds: [16, 18], tags: ['감동', '여운', '유쾌함'] }
  },
  {
    id: 'solar_eclipse',
    label: '일식',
    rule: { contextTags: ['space'], genreIds: [878], tags: ['세계관', '영상미'] }
  },
  {
    id: 'lunar_eclipse',
    label: '월식',
    rule: { contextTags: ['space'], genreIds: [878], tags: ['세계관', '영상미'] }
  },
  {
    id: 'while_building_lego',
    label: '레고하면서',
    rule: {
      // 카탈로그에 있는 공식 극장판 LEGO 영화만 대상으로 한다.
      tmdbMovieIds: [137106, 324849]
    }
  },
  {
    id: 'darth_vader',
    label: '다스 베이더 보고 싶을 때',
    rule: {
      tmdbMovieIds: [1893, 1894, 1895, 11, 1891, 1892, 140607, 181808, 181812, 330459]
    }
  }
];

export const getSituationPreset = (presetId: SituationPresetId) =>
  situationPresets.find((preset) => preset.id === presetId) ?? null;

export const getSituationOptionLabel = (
  key: (typeof situationOptionGroups)[number]['key'],
  value: string
) => {
  const group = situationOptionGroups.find((candidate) => candidate.key === key);
  return group?.options.find((option) => option.value === value)?.label ?? value;
};

export const getManualSituationLabels = (selection: SituationSelection) =>
  situationOptionGroups.map((group) =>
    getSituationOptionLabel(group.key, selection[group.key as keyof SituationSelection])
  );

export const isCompleteSituationSelection = (
  selection: Partial<SituationSelection>
): selection is SituationSelection =>
  Boolean(
    selection.mood &&
      selection.companion &&
      selection.weather &&
      selection.viewingTime &&
      selection.specialDay &&
      selection.reason
  );

export const situationViewingTimeLabels: Record<SituationViewingTime, string> = {
  any: '상관없음',
  under_90: '90분 이하',
  around_120: '약 2시간',
  over_135: '2시간 15분 이상',
  series: '시리즈 이어보기'
};
