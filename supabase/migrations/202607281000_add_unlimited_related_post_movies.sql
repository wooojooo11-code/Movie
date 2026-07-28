-- 게시글 하나에 연결할 수 있는 관련 영화 수를 제한하지 않습니다.
-- 기존 community_posts.movie_* 열은 이전 게시글 및 검색 호환용 첫 번째 영화로 남겨 둡니다.
create table if not exists public.community_post_movies (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  movie_id text not null,
  movie_title text not null check (char_length(trim(movie_title)) between 1 and 300),
  movie_poster_path text null,
  position integer not null check (position >= 1),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, movie_id),
  constraint community_post_movies_post_position_unique unique (post_id, position)
);

create index if not exists community_post_movies_post_position_idx
  on public.community_post_movies (post_id, position);
create index if not exists community_post_movies_movie_title_trgm_idx
  on public.community_post_movies using gin (movie_title gin_trgm_ops);

-- 기존 단일 영화 게시글은 첫 번째 관련 영화로 한 번만 옮깁니다.
insert into public.community_post_movies (post_id, movie_id, movie_title, movie_poster_path, position)
select id, movie_id, movie_title, movie_poster_path, 1
from public.community_posts
where movie_id is not null and movie_title is not null
on conflict (post_id, movie_id) do nothing;

alter table public.community_post_movies enable row level security;

drop policy if exists "Community post movies are public" on public.community_post_movies;
drop policy if exists "Owners create community post movies" on public.community_post_movies;
drop policy if exists "Owners update community post movies" on public.community_post_movies;
drop policy if exists "Owners delete community post movies" on public.community_post_movies;

create policy "Community post movies are public"
on public.community_post_movies for select to public
using (true);

create policy "Owners create community post movies"
on public.community_post_movies for insert to authenticated
with check (
  exists (
    select 1 from public.community_posts
    where id = post_id and user_id = auth.uid()
  )
);

create policy "Owners update community post movies"
on public.community_post_movies for update to authenticated
using (
  exists (
    select 1 from public.community_posts
    where id = post_id and user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.community_posts
    where id = post_id and user_id = auth.uid()
  )
);

create policy "Owners delete community post movies"
on public.community_post_movies for delete to authenticated
using (
  exists (
    select 1 from public.community_posts
    where id = post_id and user_id = auth.uid()
  )
);

-- 게시글, 관련 영화, 투표·미션 데이터를 하나의 RPC 안에서 같이 저장합니다.
create or replace function public.create_community_post(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_post_id uuid;
  v_category text := payload ->> 'category';
  v_list_id text := nullif(payload ->> 'list_id', '');
  v_poll_id uuid;
  v_option jsonb;
  v_option_count integer := 0;
  v_related_movie jsonb;
  v_related_movie_count integer := 0;
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

  -- related_movies 배열에는 상한을 두지 않습니다. 같은 영화만 한 번 저장합니다.
  for v_related_movie in
    select value from jsonb_array_elements(coalesce(payload -> 'related_movies', '[]'::jsonb))
  loop
    if nullif(v_related_movie ->> 'movie_id', '') is not null
      and nullif(v_related_movie ->> 'movie_title', '') is not null then
      v_related_movie_count := v_related_movie_count + 1;
      insert into public.community_post_movies (post_id, movie_id, movie_title, movie_poster_path, position)
      values (
        v_post_id,
        nullif(v_related_movie ->> 'movie_id', ''),
        nullif(v_related_movie ->> 'movie_title', ''),
        nullif(v_related_movie ->> 'movie_poster_path', ''),
        v_related_movie_count
      )
      on conflict (post_id, movie_id) do nothing;
    end if;
  end loop;

  -- 이전 프런트엔드는 movie_*만 보낼 수 있으므로 첫 번째 관련 영화로 보존합니다.
  if v_related_movie_count = 0
    and nullif(payload ->> 'movie_id', '') is not null
    and nullif(payload ->> 'movie_title', '') is not null then
    insert into public.community_post_movies (post_id, movie_id, movie_title, movie_poster_path, position)
    values (
      v_post_id, nullif(payload ->> 'movie_id', ''), nullif(payload ->> 'movie_title', ''),
      nullif(payload ->> 'movie_poster_path', ''), 1
    )
    on conflict (post_id, movie_id) do nothing;
  end if;

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
