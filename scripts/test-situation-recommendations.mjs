import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import jitiPackage from 'jiti';

const jiti = jitiPackage(import.meta.url, {
  alias: { '@': resolve('src') },
  interopDefault: true,
  moduleCache: false
});
const { rankSituationMovies } = await jiti.import('../src/services/situationRecommendation.ts');
const {
  isCompleteSituationSelection,
  situationOptionGroups,
  situationPresets
} = await jiti.import('../src/data/situations.ts');
const { catalogMovies } = await jiti.import('../src/data/catalog.ts');

const manualSelection = {
  mood: 'tense',
  companion: 'friend',
  weather: 'cloudy',
  viewingTime: 'under_90',
  specialDay: 'halloween',
  reason: ['focus']
};

const movie = (id, overrides = {}) => ({
  id,
  tmdbMovieId: Number(id.replace(/\D/g, '')) || 1,
  title: id,
  genres: ['드라마'],
  genreIds: [18],
  tags: ['탄탄한 스토리'],
  characters: [],
  contextTags: [],
  overview: '',
  releaseYear: 2020,
  runtimeMinutes: 120,
  collectionId: null,
  collectionName: null,
  voteAverage: 7,
  voteCount: 500,
  posterUrl: '',
  posterAlt: '',
  watchProvidersKr: null,
  recommendationScore: 0,
  ...overrides
});

assert.equal(situationOptionGroups.length, 6, 'six direct situation groups are available');
assert.deepEqual(
  situationOptionGroups.map((group) => group.options.length),
  [7, 6, 8, 5, 11, 12],
  'every requested direct-selection option is present'
);
assert.equal(situationPresets.length, 13, 'all supported recommendation presets are available');
assert.equal(isCompleteSituationSelection(manualSelection), true, 'complete direct selection is accepted');
assert.equal(isCompleteSituationSelection({ mood: 'tense' }), true, 'a single direct selection is accepted');
assert.equal(
  isCompleteSituationSelection({ reason: ['focus', 'action'] }),
  true,
  'two reasons can be selected together'
);
assert.equal(
  isCompleteSituationSelection({ reason: ['focus', 'action', 'visuals'] }),
  false,
  'more than two reasons are rejected'
);

const singleSelectionCandidates = [movie('single-selection-a'), movie('single-selection-b')];
assert.equal(
  rankSituationMovies({
    activeSituation: { kind: 'manual', selection: { mood: 'tense' } },
    catalogMovies: singleSelectionCandidates,
    hasTasteProfile: false,
    impressions: [],
    likedMovieIds: [],
    movies: singleSelectionCandidates
  }).length,
  singleSelectionCandidates.length,
  'a single direct selection returns recommendations'
);

const timeCandidates = [
  movie('short', { runtimeMinutes: 90 }),
  movie('medium', { runtimeMinutes: 120 }),
  movie('long', { runtimeMinutes: 135 })
];

const trueStoryCandidates = [
  movie('true-story', { contextTags: ['true_story'], recommendationScore: 1 }),
  movie('drama-but-not-true', { genreIds: [18, 36], recommendationScore: 99 }),
  movie('tagged-but-not-true', { tags: ['감동', '성장', '탄탄한 스토리'], recommendationScore: 98 })
];
const trueStoryResults = rankSituationMovies({
  activeSituation: { kind: 'manual', selection: { reason: ['true_story'] } },
  catalogMovies: trueStoryCandidates,
  hasTasteProfile: true,
  impressions: [],
  likedMovieIds: [],
  movies: trueStoryCandidates
});
assert.deepEqual(
  trueStoryResults.map((entry) => entry.id),
  ['true-story'],
  'true-story reason only returns movies marked as based on true events'
);
const rankForTime = (viewingTime) =>
  rankSituationMovies({
    activeSituation: { kind: 'manual', selection: { ...manualSelection, viewingTime } },
    catalogMovies: timeCandidates,
    hasTasteProfile: false,
    impressions: [],
    likedMovieIds: [],
    movies: timeCandidates
  }).map((entry) => entry.id);

assert.deepEqual(rankForTime('under_90'), ['short'], '90-minute boundary is inclusive');
assert.deepEqual(rankForTime('around_120'), ['medium'], 'two-hour range uses 91–134 minutes');
assert.deepEqual(rankForTime('over_135'), ['long'], '135-minute boundary is inclusive');
assert.deepEqual(
  rankForTime('any'),
  ['short', 'medium', 'long'],
  'no time preference keeps every runtime candidate'
);

const franchiseCandidates = [
  movie('rated-part', { collectionId: 10, collectionName: 'Saga', releaseYear: 2000 }),
  movie('next-part', { collectionId: 10, collectionName: 'Saga', releaseYear: 2002 }),
  movie('single', { collectionId: null })
];
const seriesResults = rankSituationMovies({
  activeSituation: { kind: 'manual', selection: { ...manualSelection, viewingTime: 'series' } },
  catalogMovies: franchiseCandidates,
  hasTasteProfile: true,
  impressions: [],
  likedMovieIds: ['rated-part'],
  movies: franchiseCandidates.filter((entry) => entry.id !== 'rated-part')
});
assert.deepEqual(seriesResults.map((entry) => entry.id), ['next-part'], 'series mode keeps collection sequels');

assert.equal(
  new Set(catalogMovies.map((entry) => entry.id)).size,
  catalogMovies.length,
  'every catalog movie has a unique ID'
);

const weightedCandidates = [
  movie('weighted-romance', { genreIds: [10749], recommendationScore: 99 }),
  movie('weighted-drama', { genreIds: [18], recommendationScore: 60 }),
  movie('weighted-comedy', { genreIds: [35], recommendationScore: 20 })
];
const weightedResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'autumn_vibes' },
  catalogMovies: weightedCandidates,
  hasTasteProfile: true,
  impressions: [{ movieId: 'weighted-comedy', lastShownAt: new Date().toISOString(), showCount: 1 }],
  likedMovieIds: [],
  movies: weightedCandidates
});
const weightedMovie = weightedResults[0];
const weightedScores = weightedMovie.recommendationScoreBreakdown;
assert.ok(weightedScores, 'score breakdown is available');
assert.equal(
  weightedMovie.recommendationScore,
      Math.max(
        0,
        Math.min(
          100,
          weightedScores.preference * 0.36 +
            weightedScores.collaborative * 0.2 +
            weightedScores.situation * 0.28 +
            weightedScores.quality * 0.08 +
            weightedScores.novelty * 0.08
        )
      ),
  'final score keeps the existing score proportions and adds a 20% collaborative signal'
);

const diverseGenreIds = [10749, 18, 35, 53, 878];
const diverseCandidates = diverseGenreIds.flatMap((genreId, genreIndex) =>
  Array.from({ length: 3 }, (_, movieIndex) =>
    movie(`diverse-${genreId}-${movieIndex}`, {
      collectionId: genreIndex * 10 + movieIndex,
      genreIds: [genreId],
      recommendationScore: 100 - genreIndex * 3 - movieIndex
    })
  )
);
const diverseResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'autumn_vibes' },
  catalogMovies: diverseCandidates,
  hasTasteProfile: false,
  impressions: [],
  likedMovieIds: [],
  movies: diverseCandidates
}).slice(0, 10);
const primaryGenreCounts = new Map();

for (const result of diverseResults) {
  const primaryGenreId = result.genreIds[0];
  primaryGenreCounts.set(primaryGenreId, (primaryGenreCounts.get(primaryGenreId) ?? 0) + 1);
}

assert.ok(
  [...primaryGenreCounts.values()].every((count) => count <= 2),
  'the first ten situation recommendations limit each primary genre to two movies when alternatives exist'
);
assert.equal(
  new Set(diverseResults.map((result) => result.collectionId)).size,
  diverseResults.length,
  'the first ten situation recommendations avoid duplicate franchises when alternatives exist'
);

const recentCandidates = Array.from({ length: 11 }, (_, index) =>
  movie(`recent-${index}`, {
    collectionId: index,
    genreIds: [10749],
    recommendationScore: 100 - index
  })
);
const recentResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'autumn_vibes' },
  catalogMovies: recentCandidates,
  hasTasteProfile: false,
  impressions: [{ movieId: 'recent-0', lastShownAt: new Date().toISOString(), showCount: 1 }],
  likedMovieIds: [],
  movies: recentCandidates
}).slice(0, 10);

assert.equal(
  recentResults.some((result) => result.id === 'recent-0'),
  false,
  'a movie shown within the last fourteen days is excluded when enough fresh alternatives exist'
);

const collaborativeCandidates = [
  movie('baseline-taste', { collectionId: 1, recommendationScore: 50 }),
  movie('similar-users-liked', { collectionId: 2, recommendationScore: 50 })
];
const collaborativeResults = rankSituationMovies({
  activeSituation: { kind: 'none' },
  catalogMovies: collaborativeCandidates,
  collaborativeSignals: [
    {
      movieId: 'similar-users-liked',
      score: 3,
      similarUserCount: 1
    }
  ],
  hasTasteProfile: true,
  impressions: [],
  likedMovieIds: [],
  movies: collaborativeCandidates
});

assert.equal(
  collaborativeResults[0].id,
  'similar-users-liked',
  'a movie liked by a similar user is promoted above an equally matched baseline movie'
);
assert.ok(
  collaborativeResults[0].recommendationReasons?.includes(
    '취향이 비슷한 이용자 1명이 이 영화를 재미있게 봤어요.'
  ),
  'the promoted movie explains the privacy-safe collaborative recommendation reason'
);

console.log('Situation recommendation tests passed.');
