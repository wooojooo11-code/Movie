-- 영화 커뮤니티 기능의 모든 공개 데이터와 사용자 상호작용을 정의합니다.
-- 이 마이그레이션은 기존 auth.users와 user_lists 테이블을 그대로 사용합니다.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 리스트 공유 카드에 설명을 표시할 수 있도록 기존 리스트에 설명 필드를 추가합니다.
alter table public.user_lists
  add column if not exists description text not null default '';

-- 공개 리스트 카드는 로그인하지 않은 커뮤니티 방문자도 읽을 수 있어야 합니다.
drop policy if exists "Authenticated users can read own or shared user lists" on public.user_lists;
drop policy if exists "Users can read own user lists" on public.user_lists;
create policy "Public can read shared user lists or own lists"
on public.user_lists for select to public
using (is_private = false or auth.uid() = user_id);

create table if not exists public.community_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '영화 친구' check (char_length(trim(nickname)) between 1 and 40),
  avatar_url text null check (avatar_url is null or avatar_url ~* '^https://'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('movie_recommendation', 'list_share', 'mission_proof', 'movie_poll', 'daily_question')),
  title text not null check (char_length(trim(title)) between 1 and 140),
  content text not null default '' check (char_length(content) <= 5000),
  movie_id text null,
  movie_title text null,
  movie_poster_path text null,
  list_id text null references public.user_lists (id) on delete set null,
  image_url text null check (image_url is null or image_url ~* '^https://'),
  has_spoiler boolean not null default false,
  author_name text not null default '영화 친구',
  author_avatar_url text null,
  like_count integer not null default 0 check (like_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  save_count integer not null default 0 check (save_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint community_likes_post_user_unique unique (post_id, user_id)
);

create table if not exists public.community_saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint community_saves_post_user_unique unique (post_id, user_id)
);

create table if not exists public.community_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint community_follows_user_unique unique (follower_id, following_id),
  constraint community_follows_not_self check (follower_id <> following_id)
);

create table if not exists public.community_polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.community_posts (id) on delete cascade,
  question text not null check (char_length(trim(question)) between 1 and 140),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.community_polls (id) on delete cascade,
  option_text text not null check (char_length(trim(option_text)) between 1 and 120),
  movie_id text null,
  movie_title text null,
  movie_poster_path text null,
  vote_count integer not null default 0 check (vote_count >= 0),
  position integer not null check (position >= 1),
  constraint community_poll_options_position_unique unique (poll_id, position)
);

create table if not exists public.community_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.community_polls (id) on delete cascade,
  option_id uuid not null references public.community_poll_options (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint community_poll_votes_poll_user_unique unique (poll_id, user_id)
);

create table if not exists public.recommendation_relays (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  parent_relay_id uuid null references public.recommendation_relays (id) on delete cascade,
  movie_id text not null,
  movie_title text not null,
  movie_poster_path text null,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null default '' check (char_length(reason) <= 300),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_mission_proofs (
  post_id uuid primary key references public.community_posts (id) on delete cascade,
  mission_id text null,
  mission_name text not null,
  movie_id text null,
  movie_title text null,
  movie_poster_path text null,
  reflection text not null default '' check (char_length(reflection) <= 1000),
  image_url text null check (image_url is null or image_url ~* '^https://'),
  completed_at date not null default current_date,
  badge_label text not null default 'MISSION COMPLETE',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(trim(question)) between 1 and 200),
  active_date date not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_question_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.daily_questions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_question_answers_question_user_unique unique (question_id, user_id)
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null default 'inappropriate' check (char_length(trim(reason)) between 1 and 500),
  created_at timestamptz not null default timezone('utc', now()),
  constraint community_reports_post_user_unique unique (post_id, reporter_id)
);

-- 현재 날짜 전후의 질문을 미리 생성합니다. 질문은 날짜를 기준으로 순환합니다.
insert into public.daily_questions (question, active_date)
select
  (array[
    '가장 기억에 남는 반전 영화는?',
    '비 오는 날 보고 싶은 영화는?',
    '마지막으로 울면서 본 영화는?',
    '친구에게 꼭 추천하고 싶은 영화는?'
  ])[1 + ((extract(doy from day)::integer - 1) % 4)],
  day::date
from generate_series(current_date - 365, current_date + 1095, interval '1 day') as day
on conflict (active_date) do nothing;

create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_category_created_at_idx on public.community_posts (category, created_at desc);
create index if not exists community_posts_popular_idx on public.community_posts (like_count desc, created_at desc);
create index if not exists community_posts_comments_idx on public.community_posts (comment_count desc, created_at desc);
create index if not exists community_posts_saves_idx on public.community_posts (save_count desc, created_at desc);
create index if not exists community_posts_title_trgm_idx on public.community_posts using gin (title gin_trgm_ops);
create index if not exists community_posts_content_trgm_idx on public.community_posts using gin (content gin_trgm_ops);
create index if not exists community_posts_movie_title_trgm_idx on public.community_posts using gin (movie_title gin_trgm_ops);
create index if not exists community_posts_author_name_trgm_idx on public.community_posts using gin (author_name gin_trgm_ops);
create index if not exists community_comments_post_created_at_idx on public.community_comments (post_id, created_at);
create index if not exists community_likes_user_post_idx on public.community_likes (user_id, post_id);
create index if not exists community_saves_user_post_idx on public.community_saves (user_id, post_id);
create index if not exists recommendation_relays_post_created_at_idx on public.recommendation_relays (post_id, created_at);
create index if not exists daily_question_answers_question_idx on public.daily_question_answers (question_id, created_at);

drop trigger if exists set_community_profiles_updated_at on public.community_profiles;
create trigger set_community_profiles_updated_at before update on public.community_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_community_posts_updated_at on public.community_posts;
create trigger set_community_posts_updated_at before update on public.community_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_community_comments_updated_at on public.community_comments;
create trigger set_community_comments_updated_at before update on public.community_comments
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_question_answers_updated_at on public.daily_question_answers;
create trigger set_daily_question_answers_updated_at before update on public.daily_question_answers
for each row execute function public.set_updated_at();

-- 프로필 변경 시 이전 게시글의 표시 이름도 함께 갱신해 검색과 카드 표기를 일관되게 유지합니다.
create or replace function public.sync_community_post_author_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.community_posts
  set author_name = new.nickname, author_avatar_url = new.avatar_url
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_community_post_author_profile_trigger on public.community_profiles;
create trigger sync_community_post_author_profile_trigger after insert or update of nickname, avatar_url on public.community_profiles
for each row execute function public.sync_community_post_author_profile();

create or replace function public.fill_community_post_author_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select nickname, avatar_url into new.author_name, new.author_avatar_url
  from public.community_profiles where id = new.user_id;
  new.author_name := coalesce(new.author_name, '영화 친구');
  return new;
end;
$$;

drop trigger if exists fill_community_post_author_profile_trigger on public.community_posts;
create trigger fill_community_post_author_profile_trigger before insert on public.community_posts
for each row execute function public.fill_community_post_author_profile();

create or replace function public.refresh_community_post_count(p_post_id uuid, p_column text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_column = 'like_count' then
    update public.community_posts set like_count = (select count(*) from public.community_likes where post_id = p_post_id) where id = p_post_id;
  elsif p_column = 'save_count' then
    update public.community_posts set save_count = (select count(*) from public.community_saves where post_id = p_post_id) where id = p_post_id;
  elsif p_column = 'comment_count' then
    update public.community_posts set comment_count = (select count(*) from public.community_comments where post_id = p_post_id) where id = p_post_id;
  end if;
end;
$$;

create or replace function public.refresh_community_post_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_column text := tg_argv[0];
  v_post_id uuid;
begin
  v_post_id := case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  perform public.refresh_community_post_count(v_post_id, v_column);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists refresh_community_like_count on public.community_likes;
create trigger refresh_community_like_count after insert or delete on public.community_likes
for each row execute function public.refresh_community_post_count_trigger('like_count');
drop trigger if exists refresh_community_save_count on public.community_saves;
create trigger refresh_community_save_count after insert or delete on public.community_saves
for each row execute function public.refresh_community_post_count_trigger('save_count');
drop trigger if exists refresh_community_comment_count on public.community_comments;
create trigger refresh_community_comment_count after insert or delete on public.community_comments
for each row execute function public.refresh_community_post_count_trigger('comment_count');

create or replace function public.refresh_poll_option_vote_count(p_option_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.community_poll_options
  set vote_count = (select count(*) from public.community_poll_votes where option_id = p_option_id)
  where id = p_option_id;
end;
$$;

create or replace function public.refresh_poll_option_vote_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and old.option_id <> new.option_id then
    perform public.refresh_poll_option_vote_count(old.option_id);
  end if;
  if tg_op = 'DELETE' then
    perform public.refresh_poll_option_vote_count(old.option_id);
    return old;
  end if;
  perform public.refresh_poll_option_vote_count(new.option_id);
  return new;
end;
$$;

drop trigger if exists refresh_community_poll_votes on public.community_poll_votes;
create trigger refresh_community_poll_votes after insert or update or delete on public.community_poll_votes
for each row execute function public.refresh_poll_option_vote_count_trigger();

-- 저장한 리스트 수는 원본 리스트 행에서 계산합니다. 저장자는 원본을 수정할 수 없습니다.
create or replace function public.refresh_user_list_save_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_list_id text;
begin
  v_list_id := case when tg_op = 'DELETE' then old.list_id else new.list_id end;
  update public.user_lists
  set save_count = (select count(*) from public.list_interactions where list_id = v_list_id and saved = true)
  where id = v_list_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists refresh_user_list_save_count on public.list_interactions;
create trigger refresh_user_list_save_count after insert or update or delete on public.list_interactions
for each row execute function public.refresh_user_list_save_count_trigger();

-- 게시글과 부속 데이터(투표/미션 인증)를 한 트랜잭션으로 작성합니다.
create or replace function public.create_community_post(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_post_id uuid;
  v_category text := payload ->> 'category';
  v_list_id text := nullif(payload ->> 'list_id', '');
  v_poll_id uuid;
  v_option jsonb;
  v_option_count integer := 0;
begin
  if auth.uid() is null then raise exception 'LOGIN_REQUIRED'; end if;
  if v_category not in ('movie_recommendation', 'list_share', 'mission_proof', 'movie_poll', 'daily_question') then
    raise exception 'INVALID_CATEGORY';
  end if;
  if v_category = 'list_share' and not exists (
    select 1 from public.user_lists where id = v_list_id and user_id = auth.uid() and is_private = false
  ) then
    raise exception 'SHARED_LIST_REQUIRED';
  end if;

  insert into public.community_posts (
    user_id, category, title, content, movie_id, movie_title, movie_poster_path, list_id, image_url, has_spoiler
  ) values (
    auth.uid(), v_category, trim(payload ->> 'title'), coalesce(payload ->> 'content', ''),
    nullif(payload ->> 'movie_id', ''), nullif(payload ->> 'movie_title', ''),
    nullif(payload ->> 'movie_poster_path', ''), v_list_id, nullif(payload ->> 'image_url', ''),
    coalesce((payload ->> 'has_spoiler')::boolean, false)
  ) returning id into v_post_id;

  if v_category = 'movie_poll' then
    insert into public.community_polls (post_id, question)
    values (v_post_id, trim(coalesce(payload ->> 'poll_question', payload ->> 'title')))
    returning id into v_poll_id;
    for v_option in select value from jsonb_array_elements(coalesce(payload -> 'poll_options', '[]'::jsonb)) loop
      v_option_count := v_option_count + 1;
      insert into public.community_poll_options (poll_id, option_text, movie_id, movie_title, movie_poster_path, position)
      values (
        v_poll_id, trim(v_option ->> 'option_text'), nullif(v_option ->> 'movie_id', ''),
        nullif(v_option ->> 'movie_title', ''), nullif(v_option ->> 'movie_poster_path', ''), v_option_count
      );
    end loop;
    if v_option_count < 2 then raise exception 'POLL_OPTIONS_INVALID'; end if;
  end if;

  if v_category = 'mission_proof' then
    insert into public.community_mission_proofs (
      post_id, mission_id, mission_name, movie_id, movie_title, movie_poster_path, reflection, image_url, completed_at, badge_label
    ) values (
      v_post_id, nullif(payload ->> 'mission_id', ''), coalesce(nullif(payload ->> 'mission_name', ''), '영화 미션'),
      nullif(payload ->> 'mission_movie_id', ''), nullif(payload ->> 'mission_movie_title', ''),
      nullif(payload ->> 'mission_movie_poster_path', ''), coalesce(payload ->> 'mission_reflection', ''),
      nullif(payload ->> 'mission_image_url', ''), coalesce(nullif(payload ->> 'mission_completed_at', '')::date, current_date),
      coalesce(nullif(payload ->> 'mission_badge_label', ''), 'MISSION COMPLETE')
    );
  end if;
  return v_post_id;
end;
$$;

grant execute on function public.create_community_post(jsonb) to authenticated;

alter table public.community_profiles enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
alter table public.community_saves enable row level security;
alter table public.community_follows enable row level security;
alter table public.community_polls enable row level security;
alter table public.community_poll_options enable row level security;
alter table public.community_poll_votes enable row level security;
alter table public.recommendation_relays enable row level security;
alter table public.community_mission_proofs enable row level security;
alter table public.daily_questions enable row level security;
alter table public.daily_question_answers enable row level security;
alter table public.community_reports enable row level security;

create policy "Community profiles are public" on public.community_profiles for select to public using (true);
create policy "Users create own community profile" on public.community_profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own community profile" on public.community_profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Community posts are public" on public.community_posts for select to public using (true);
create policy "Users create own community posts" on public.community_posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own community posts" on public.community_posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own community posts" on public.community_posts for delete to authenticated using (auth.uid() = user_id);
create policy "Community comments are public" on public.community_comments for select to public using (true);
create policy "Users create own comments" on public.community_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own comments" on public.community_comments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own comments" on public.community_comments for delete to authenticated using (auth.uid() = user_id);
create policy "Users read own likes" on public.community_likes for select to authenticated using (auth.uid() = user_id);
create policy "Users create own likes" on public.community_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own likes" on public.community_likes for delete to authenticated using (auth.uid() = user_id);
create policy "Users read own saves" on public.community_saves for select to authenticated using (auth.uid() = user_id);
create policy "Users create own saves" on public.community_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own saves" on public.community_saves for delete to authenticated using (auth.uid() = user_id);
create policy "Users read own follows" on public.community_follows for select to authenticated using (auth.uid() = follower_id);
create policy "Users create own follows" on public.community_follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "Users delete own follows" on public.community_follows for delete to authenticated using (auth.uid() = follower_id);
create policy "Community polls are public" on public.community_polls for select to public using (true);
create policy "Community poll options are public" on public.community_poll_options for select to public using (true);
create policy "Users read own poll votes" on public.community_poll_votes for select to authenticated using (auth.uid() = user_id);
create policy "Users create own poll votes" on public.community_poll_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users change own poll votes" on public.community_poll_votes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own poll votes" on public.community_poll_votes for delete to authenticated using (auth.uid() = user_id);
create policy "Recommendation relays are public" on public.recommendation_relays for select to public using (true);
create policy "Users create own relays" on public.recommendation_relays for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own relays" on public.recommendation_relays for delete to authenticated using (auth.uid() = user_id);
create policy "Mission proofs are public" on public.community_mission_proofs for select to public using (true);
create policy "Owners create mission proofs" on public.community_mission_proofs for insert to authenticated with check (exists (select 1 from public.community_posts where id = post_id and user_id = auth.uid()));
create policy "Owners update mission proofs" on public.community_mission_proofs for update to authenticated using (exists (select 1 from public.community_posts where id = post_id and user_id = auth.uid())) with check (exists (select 1 from public.community_posts where id = post_id and user_id = auth.uid()));
create policy "Daily questions are public" on public.daily_questions for select to public using (true);
create policy "Daily answers are public" on public.daily_question_answers for select to public using (true);
create policy "Users create own daily answers" on public.daily_question_answers for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own daily answers" on public.daily_question_answers for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own daily answers" on public.daily_question_answers for delete to authenticated using (auth.uid() = user_id);
create policy "Users read own reports" on public.community_reports for select to authenticated using (auth.uid() = reporter_id);
create policy "Users create own reports" on public.community_reports for insert to authenticated with check (auth.uid() = reporter_id);
