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
  reason: 'focus'
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
  [7, 6, 8, 5, 11, 6],
  'every requested direct-selection option is present'
);
assert.equal(situationPresets.length, 15, 'all recommendation presets are available');
assert.equal(isCompleteSituationSelection(manualSelection), true, 'complete direct selection is accepted');
assert.equal(isCompleteSituationSelection({ mood: 'tense' }), false, 'incomplete direct selection is rejected');

const timeCandidates = [
  movie('short', { runtimeMinutes: 90 }),
  movie('medium', { runtimeMinutes: 120 }),
  movie('long', { runtimeMinutes: 135 })
];
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

const exactCandidates = [
  movie('episode-one', { tmdbMovieId: 1893, recommendationScore: 0 }),
  movie('episode-eight', { tmdbMovieId: 181808, recommendationScore: 99 }),
  movie('episode-nine', { tmdbMovieId: 181812, recommendationScore: 4 }),
  movie('rogue-one', { tmdbMovieId: 330459, recommendationScore: 2 }),
  movie('generic', { tmdbMovieId: 999, genreIds: [878, 28], tags: ['세계관', '액션'] }),
  movie('lego', { tmdbMovieId: 137106, title: '레고 무비', overview: '레고 세계의 모험', genreIds: [16, 12] }),
  movie('lego-batman', {
    tmdbMovieId: 324849,
    title: '레고 배트맨 무비',
    overview: '레고로 만들어진 배트맨의 모험',
    genreIds: [16, 12]
  })
];
const darthResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'darth_vader' },
  catalogMovies: exactCandidates,
  hasTasteProfile: true,
  impressions: [],
  likedMovieIds: [],
  movies: exactCandidates
});
const legoResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'while_building_lego' },
  catalogMovies: exactCandidates,
  hasTasteProfile: false,
  impressions: [],
  likedMovieIds: [],
  movies: exactCandidates
});
assert.deepEqual(
  darthResults.map((entry) => entry.id),
  ['episode-one', 'episode-eight', 'episode-nine', 'rogue-one'],
  'Darth Vader preset returns only the configured Star Wars movies in order'
);
const darthFallbackResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'darth_vader' },
  catalogMovies: exactCandidates,
  hasTasteProfile: false,
  impressions: [],
  likedMovieIds: [],
  movies: []
});
assert.deepEqual(
  darthFallbackResults.map((entry) => entry.id),
  ['episode-one', 'episode-eight', 'episode-nine', 'rogue-one'],
  'fixed Star Wars preset recovers its catalog movies when the regular candidate pool is empty'
);
assert.deepEqual(
  legoResults.map((entry) => entry.id),
  ['lego', 'lego-batman'],
  'LEGO preset returns only official LEGO movies in configured order'
);

assert.equal(
  new Set(catalogMovies.map((entry) => entry.id)).size,
  catalogMovies.length,
  'every catalog movie has a unique ID'
);

const catalogMovieMap = Object.fromEntries(catalogMovies.map((entry) => [entry.id, entry]));
const darthCatalogResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'darth_vader' },
  catalogMovies,
  hasTasteProfile: false,
  impressions: [],
  likedMovieIds: [],
  movies: catalogMovies.map((entry) => ({
    ...catalogMovieMap[entry.id],
    recommendationScore: 0
  }))
});
assert.deepEqual(
  darthCatalogResults.map((entry) => entry.tmdbMovieId),
  [1893, 1894, 1895, 11, 1891, 1892, 140607, 181808, 181812, 330459],
  'Darth Vader preset is preserved after catalog movies are mapped by ID'
);

const weightedResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'autumn_vibes' },
  catalogMovies: exactCandidates,
  hasTasteProfile: true,
  impressions: [{ movieId: 'generic', lastShownAt: new Date().toISOString(), showCount: 1 }],
  likedMovieIds: [],
  movies: exactCandidates
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
      weightedScores.preference * 0.45 +
        weightedScores.situation * 0.35 +
        weightedScores.quality * 0.1 +
        weightedScores.novelty * 0.1
    )
  ),
  'final score keeps preference first with 45/35/10/10 weighting'
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

console.log('Situation recommendation tests passed.');
