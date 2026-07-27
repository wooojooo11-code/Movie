import { getProfilesRelation, isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { ProfileEditInput, ProfileOverview, ProfileTitle } from '@/types/profile';

type Row = Record<string, unknown>;

const ensureSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('프로필 기능을 사용하려면 Supabase 환경 변수를 설정해야 합니다.');
  }
};

const asRecord = (value: unknown): Row =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {};
const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const asNullableString = (value: unknown) => (typeof value === 'string' && value ? value : null);
const asNumber = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);
const asBoolean = (value: unknown) => value === true;

const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul';
  } catch {
    return 'Asia/Seoul';
  }
};

const parseTitle = (value: unknown): ProfileTitle => {
  const row = asRecord(value);
  return {
    id: asString(row.id),
    code: asString(row.code),
    name: asNullableString(row.name),
    description: asNullableString(row.description),
    conditionType: asString(row.conditionType),
    conditionTarget: asNullableString(row.conditionTarget),
    conditionValue: typeof row.conditionValue === 'number' ? row.conditionValue : null,
    icon: asString(row.icon, '🎬'),
    isHidden: asBoolean(row.isHidden),
    isEarned: asBoolean(row.isEarned),
    earnedAt: asNullableString(row.earnedAt),
    isDisplayed: asBoolean(row.isDisplayed),
    isFeatured: asBoolean(row.isFeatured),
    progress: asNumber(row.progress)
  };
};

const parseOverview = (value: unknown): ProfileOverview | null => {
  if (!value) return null;

  const root = asRecord(value);
  const profile = asRecord(root.profile);
  if (!asString(profile.id)) return null;
  const taste = asRecord(root.taste);
  const parsePerson = (person: unknown) => {
    const row = asRecord(person);
    return asString(row.name)
      ? { name: asString(row.name), profileUrl: asNullableString(row.profileUrl), count: asNumber(row.count) }
      : null;
  };
  const parseMiniTitle = (title: unknown) => {
    const row = asRecord(title);
    return asString(row.id)
      ? {
          id: asString(row.id),
          name: asNullableString(row.name),
          description: asNullableString(row.description),
          icon: asString(row.icon, '🎬')
        }
      : null;
  };
  const array = (candidate: unknown) => (Array.isArray(candidate) ? candidate : []);

  return {
    profile: {
      id: asString(profile.id),
      nickname: asString(profile.nickname, '영화 친구'),
      avatarUrl: asNullableString(profile.avatarUrl),
      bio: asString(profile.bio),
      createdAt: asString(profile.createdAt),
      updatedAt: asString(profile.updatedAt)
    },
    featuredTitle: parseMiniTitle(root.featuredTitle),
    displayTitles: array(root.displayTitles)
      .map(parseMiniTitle)
      .filter((title): title is NonNullable<typeof title> => Boolean(title)),
    taste: {
      watchedCount: asNumber(taste.watchedCount),
      topGenres: array(taste.topGenres)
        .map((genre) => {
          const row = asRecord(genre);
          return { name: asString(row.name), count: asNumber(row.count), percentage: asNumber(row.percentage) };
        })
        .filter((genre) => Boolean(genre.name)),
      favoriteDirector: parsePerson(taste.favoriteDirector),
      favoriteActor: parsePerson(taste.favoriteActor),
      topKeywords: array(taste.topKeywords)
        .map((keyword) => {
          const row = asRecord(keyword);
          return { name: asString(row.name), count: asNumber(row.count) };
        })
        .filter((keyword) => Boolean(keyword.name))
    }
  };
};

const getFileExtension = (file: File) => {
  const mimeExtension = file.type.split('/')[1]?.toLowerCase();
  if (mimeExtension === 'jpeg') return 'jpg';
  if (mimeExtension && /^[a-z0-9]+$/.test(mimeExtension)) return mimeExtension;
  return 'jpg';
};

export const ensureProfile = async (userId: string, fallbackNickname: string, avatarUrl?: null | string) => {
  ensureSupabase();
  const relation = getProfilesRelation();
  if (!relation) return;
  const { error } = await relation.upsert(
    {
      id: userId,
      nickname: fallbackNickname.trim() || '영화 친구',
      avatar_url: avatarUrl ?? null,
      timezone: getBrowserTimezone()
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) throw error;
};

export const fetchProfileOverview = async (userId: string): Promise<ProfileOverview | null> => {
  ensureSupabase();
  const { data, error } = await supabase!.rpc('get_profile_overview', { p_user_id: userId });
  if (error) throw error;
  return parseOverview(data);
};

export const fetchProfileTitles = async (userId: string): Promise<ProfileTitle[]> => {
  ensureSupabase();
  const { data, error } = await supabase!.rpc('get_profile_titles', { p_user_id: userId });
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(parseTitle);
};

export const uploadProfileAvatar = async (userId: string, file: File) => {
  ensureSupabase();
  if (!file.type.startsWith('image/')) {
    throw new Error('프로필 사진은 이미지 파일만 업로드할 수 있습니다.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('프로필 사진은 5MB 이하만 업로드할 수 있습니다.');
  }

  const filename = `${userId}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;
  const { error } = await supabase!.storage.from('avatars').upload(filename, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false
  });
  if (error) throw error;
  return supabase!.storage.from('avatars').getPublicUrl(filename).data.publicUrl;
};

export const saveProfile = async (userId: string, input: ProfileEditInput) => {
  ensureSupabase();
  const nickname = input.nickname.trim();
  if (!nickname) throw new Error('닉네임을 입력해 주세요.');
  if (nickname.length > 40) throw new Error('닉네임은 40자 이하로 입력해 주세요.');
  if (input.bio.trim().length > 160) throw new Error('영화 소개는 160자 이하로 입력해 주세요.');

  const avatarUrl = input.avatarFile ? await uploadProfileAvatar(userId, input.avatarFile) : undefined;
  const relation = getProfilesRelation();
  if (!relation) throw new Error('프로필 테이블에 연결할 수 없습니다.');
  const { error } = await relation.update({
    nickname,
    bio: input.bio.trim(),
    timezone: getBrowserTimezone(),
    ...(avatarUrl ? { avatar_url: avatarUrl } : {})
  }).eq('id', userId);
  if (error) throw error;
};
