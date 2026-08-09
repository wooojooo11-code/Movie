-- 관련 영화를 여러 편 저장하기 위한 테이블을 보장합니다.
-- 기존 게시글과 첫 번째 관련 영화 데이터는 삭제하거나 변경하지 않습니다.
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

-- 기존 단일 관련 영화 게시글도 첫 번째 연결 영화로 보존합니다.
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
