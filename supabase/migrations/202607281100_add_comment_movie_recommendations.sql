-- 별도 추천 릴레이가 아닌 댓글 안에서 다음 영화를 추천할 수 있도록 영화 연결 정보를 추가합니다.
alter table public.community_comments
  add column if not exists movie_id text null,
  add column if not exists movie_title text null,
  add column if not exists movie_poster_path text null;

create index if not exists community_comments_post_movie_idx
  on public.community_comments (post_id, movie_id)
  where movie_id is not null;
