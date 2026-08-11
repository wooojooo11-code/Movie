import type {
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
      { value: 'no_thoughts', label: '아무 생각 없음' },
      { value: 'laugh', label: '웃고 싶어서' },
      { value: 'action', label: '액션' },
      { value: 'mystery_twist', label: '추리·반전' },
      { value: 'visuals', label: '영상미' },
      { value: 'new_world', label: '새로운 세계관' },
      { value: 'true_story', label: '실화' }
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
  no_thoughts: { genreIds: [35, 16], tags: ['유쾌함', '유머'] },
  laugh: { genreIds: [35], tags: ['유쾌함', '유머'] },
  action: { genreIds: [28, 12], tags: ['액션', '빠른전개', '몰입감'] },
  mystery_twist: { genreIds: [53, 9648, 80], tags: ['반전', '긴장감', '탄탄한 스토리'] },
  visuals: { tags: ['영상미', '연출', '세계관'] },
  new_world: { genreIds: [878, 14, 12], tags: ['세계관', '영상미', '몰입감'] },
  true_story: {
    contextTags: ['true_story']
  }
};

export const manualSituationRule = (selection: SituationSelection): SituationRule => {
  const selectedRules = [
    selection.mood ? moodRules[selection.mood] : undefined,
    selection.weather ? weatherRules[selection.weather] : undefined,
    selection.specialDay ? specialDayRules[selection.specialDay] : undefined,
    ...(selection.reason ?? []).map((reason) => reasonRules[reason])
  ];

  return {
    genreIds: selectedRules.flatMap((rule) => rule?.genreIds ?? []),
    tags: selectedRules.flatMap((rule) => rule?.tags ?? []),
    contextTags: selectedRules.flatMap((rule) => rule?.contextTags ?? []),
    textIncludes: selectedRules.flatMap((rule) => rule?.textIncludes ?? [])
  };
};

export const situationPresets: SituationPreset[] = [
  { id: 'after_breakup', label: '헤어지고 난 첫 주', rule: { tags: ['감동', '여운', 'OST'] } },
  {
    id: 'offline_rest',
    label: '인스타·숏츠 끄고 쉬고 싶은 날',
    rule: { genreIds: [16, 18], tags: ['영상미', '감성적인 음악', '여운'] }
  },
  {
    id: 'before_travel',
    label: '여행 가기 전 기분 내기',
    rule: { contextTags: ['travel'], genreIds: [12, 35], tags: ['영상미', '유쾌함'] }
  },
  { id: 'cleaning', label: '청소하면서', rule: { genreIds: [35, 16], tags: ['유쾌함', 'OST'] } },
  {
    id: 'before_confession',
    label: '고백하기 전',
    rule: { genreIds: [10749], tags: ['감성적인 음악', '성장', '감동'] }
  },
  {
    id: 'winter_vibes',
    label: '겨울 감성',
    rule: { contextTags: ['winter'], genreIds: [10749, 18], tags: ['감성적인 음악', '영상미', '여운'] }
  },
  {
    id: 'sunday_night',
    label: '일요일 밤',
    rule: { genreIds: [16, 18], tags: ['감동', '여운', '유쾌함'] }
  }
];

export interface SituationDailyQuestion {
  question: string;
  situationId: SituationPresetId;
}

// 커뮤니티의 오늘의 질문도 추천 상황과 같은 맥락을 사용합니다.
// 시작일에는 이별 직후의 상황부터 보여 주고, 이후에는 매일 다음 상황으로 넘어갑니다.
export const situationDailyQuestions: readonly SituationDailyQuestion[] = [
  { situationId: 'after_breakup', question: '헤어지고 난 첫 주에 보고 싶은 영화는?' },
  { situationId: 'offline_rest', question: '인터넷 없이 쉬고 싶은 날, 곁에 두고 싶은 영화는?' },
  { situationId: 'sunset', question: '해 질 무렵 가장 먼저 떠오르는 영화는?' },
  { situationId: 'after_reading', question: '책을 덮은 뒤 여운처럼 이어 보고 싶은 영화는?' },
  { situationId: 'before_travel', question: '여행을 떠나기 전 설렘을 더해 줄 영화는?' },
  { situationId: 'cleaning', question: '청소하는 날 틀어 두기 좋은 영화는?' },
  { situationId: 'before_confession', question: '고백하기 전 용기가 필요할 때 보고 싶은 영화는?' },
  { situationId: 'winter_vibes', question: '겨울 감성을 가장 잘 담은 영화는?' },
  { situationId: 'sunday_night', question: '일요일 밤을 다정하게 마무리해 줄 영화는?' }
];

const SITUATION_DAILY_QUESTION_START_DATE = '2026-08-09';
const toUtcDay = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return Date.UTC(year, month - 1, day) / 86_400_000;
};

export const getSituationDailyQuestion = (activeDate: string): SituationDailyQuestion | null => {
  const startDay = toUtcDay(SITUATION_DAILY_QUESTION_START_DATE);
  const targetDay = toUtcDay(activeDate);

  if (startDay == null || targetDay == null || targetDay < startDay) {
    return null;
  }

  return situationDailyQuestions[(targetDay - startDay) % situationDailyQuestions.length] ?? null;
};

export const getSituationPreset = (presetId: SituationPresetId) =>
  situationPresets.find((preset) => preset.id === presetId) ?? null;

export const getSituationOptionLabel = (
  key: (typeof situationOptionGroups)[number]['key'],
  value: string
) => {
  const group = situationOptionGroups.find((candidate) => candidate.key === key);
  return group?.options.find((option) => option.value === value)?.label ?? value;
};

export const getManualSituationLabels = (selection: SituationSelection) => {
  const selectedValues = [
    ['mood', selection.mood ? [selection.mood] : []],
    ['weather', selection.weather ? [selection.weather] : []],
    ['viewingTime', selection.viewingTime ? [selection.viewingTime] : []],
    ['specialDay', selection.specialDay ? [selection.specialDay] : []],
    ['reason', selection.reason ?? []]
  ] as const;

  return selectedValues.flatMap(([key, values]) =>
    values.map((value) => getSituationOptionLabel(key, value))
  );
};

const manualSituationOptionValues = Object.fromEntries(
  situationOptionGroups.map((group) => [group.key, new Set(group.options.map((option) => option.value))])
) as Record<(typeof situationOptionGroups)[number]['key'], Set<string>>;

export const normalizeSituationSelection = (value: unknown): SituationSelection | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const rawSelection = value as Record<string, unknown>;
  const selection: SituationSelection = {};
  const singleValueKeys = ['mood', 'weather', 'viewingTime', 'specialDay'] as const;

  for (const key of singleValueKeys) {
    const selectedValue = rawSelection[key];

    if (selectedValue == null || selectedValue === '') {
      continue;
    }

    if (typeof selectedValue !== 'string' || !manualSituationOptionValues[key].has(selectedValue)) {
      return null;
    }

    Object.assign(selection, { [key]: selectedValue });
  }

  const rawReasons = rawSelection.reason;
  const reasons = Array.isArray(rawReasons)
    ? rawReasons
    : typeof rawReasons === 'string'
      ? [rawReasons]
      : [];

  if (
    reasons.some(
      (reason) => typeof reason !== 'string' || !manualSituationOptionValues.reason.has(reason)
    ) ||
    new Set(reasons).size !== reasons.length ||
    reasons.length > 2
  ) {
    return null;
  }

  if (reasons.length > 0) {
    selection.reason = reasons as SituationReason[];
  }

  return Object.keys(selection).length > 0 ? selection : null;
};

export const isCompleteSituationSelection = (
  selection: Partial<SituationSelection> | unknown
): selection is SituationSelection => normalizeSituationSelection(selection) !== null;

export const situationViewingTimeLabels: Record<SituationViewingTime, string> = {
  any: '상관없음',
  under_90: '90분 이하',
  around_120: '약 2시간',
  over_135: '2시간 15분 이상',
  series: '시리즈 이어보기'
};
