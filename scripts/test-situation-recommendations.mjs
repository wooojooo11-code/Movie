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
  [6, 6, 8, 4, 11, 6],
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
    likedMovieIds: [],
    movies: timeCandidates
  }).map((entry) => entry.id);

assert.deepEqual(rankForTime('under_90'), ['short'], '90-minute boundary is inclusive');
assert.deepEqual(rankForTime('around_120'), ['medium'], 'two-hour range uses 91–134 minutes');
assert.deepEqual(rankForTime('over_135'), ['long'], '135-minute boundary is inclusive');

const franchiseCandidates = [
  movie('rated-part', { collectionId: 10, collectionName: 'Saga', releaseYear: 2000 }),
  movie('next-part', { collectionId: 10, collectionName: 'Saga', releaseYear: 2002 }),
  movie('single', { collectionId: null })
];
const seriesResults = rankSituationMovies({
  activeSituation: { kind: 'manual', selection: { ...manualSelection, viewingTime: 'series' } },
  catalogMovies: franchiseCandidates,
  hasTasteProfile: true,
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
  movie('lego', { title: '레고 무비', overview: '레고 세계의 모험', genreIds: [16, 12] })
];
const darthResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'darth_vader' },
  catalogMovies: exactCandidates,
  hasTasteProfile: true,
  likedMovieIds: [],
  movies: exactCandidates
});
const legoResults = rankSituationMovies({
  activeSituation: { kind: 'preset', presetId: 'while_building_lego' },
  catalogMovies: exactCandidates,
  hasTasteProfile: false,
  likedMovieIds: [],
  movies: exactCandidates
});
assert.deepEqual(
  darthResults.map((entry) => entry.id),
  ['episode-one', 'episode-eight', 'episode-nine', 'rogue-one'],
  'Darth Vader preset returns only the configured Star Wars movies in order'
);
assert.equal(legoResults[0].id, 'lego', 'LEGO title or overview match has priority');

console.log('Situation recommendation tests passed.');
