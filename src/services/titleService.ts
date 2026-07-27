import { supabase } from '@/lib/supabase';
import { titleUnlockStore } from '@/services/titleUnlockStore';
import type { CatalogMovie } from '@/types/recommendation';
import type { ProfileTitle, TitleCheckEvent } from '@/types/profile';

type AwardRow = Record<string, unknown>;

const asAward = (value: unknown): ProfileTitle | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as AwardRow;
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  return {
    id: row.id,
    code: typeof row.code === 'string' ? row.code : '',
    name: row.name,
    description: typeof row.description === 'string' ? row.description : '',
    conditionType: '',
    conditionTarget: null,
    conditionValue: null,
    icon: typeof row.icon === 'string' ? row.icon : '🎬',
    isHidden: false,
    isEarned: true,
    earnedAt: typeof row.earnedAt === 'string' ? row.earnedAt : null,
    isDisplayed: false,
    isFeatured: false,
    progress: 0
  };
};

export const checkTitlesForEvent = async (eventType: TitleCheckEvent): Promise<ProfileTitle[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.rpc('issue_titles_for_current_user', { p_event_type: eventType });
    if (error) throw error;
    const awarded = (Array.isArray(data) ? data : [])
      .map(asAward)
      .filter((title): title is ProfileTitle => Boolean(title));
    titleUnlockStore.enqueue(awarded);
    return awarded;
  } catch (error) {
    // A title migration/function outage must never block the completed user action that triggered it.
    console.warn('[titleService] Title check skipped.', error);
    return [];
  }
};

export const syncProfileMovieMetadata = async (movies: readonly CatalogMovie[]) => {
  if (!supabase || movies.length === 0) return false;
  try {
    const { error } = await supabase.functions.invoke('sync-profile-movie-metadata', {
      body: {
        movies: movies.map((movie) => ({ movieId: movie.id, tmdbMovieId: movie.tmdbMovieId }))
      }
    });
    if (error) throw error;
    return true;
  } catch (error) {
    // The app can still save ratings while the optional metadata cache refreshes later.
    console.warn('[titleService] TMDB profile metadata sync skipped.', error);
    return false;
  }
};

export const checkTitlesForMovieActivity = async (movies: readonly CatalogMovie[]) => {
  await syncProfileMovieMetadata(movies);
  await checkTitlesForEvent('rating');
  return checkTitlesForEvent('watch');
};

export const recordBingoCompletion = async (boardId: 'cinema' | 'genre' | 'taste') => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.rpc('record_profile_bingo_completion', { p_board_id: boardId });
    if (error) throw error;
    if (data) await checkTitlesForEvent('bingo');
    return Boolean(data);
  } catch (error) {
    console.warn('[titleService] Bingo title verification skipped.', error);
    return false;
  }
};

export const saveTitlePresentation = async (featuredTitleId: null | string, displayTitleIds: readonly string[]) => {
  if (!supabase) throw new Error('Supabase 연결이 필요합니다.');
  const { error } = await supabase.rpc('set_profile_title_presentation', {
    p_featured_title_id: featuredTitleId,
    p_display_title_ids: [...displayTitleIds]
  });
  if (error) throw error;
};
