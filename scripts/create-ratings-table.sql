create table if not exists public.ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  status text not null check (status in ('not_seen', 'dislike', 'like')),
  rating numeric(2,1),
  review_tags text[] not null default '{}',
  favorite_character text,
  answered_at timestamptz not null default timezone('utc', now()),
  raw_decision text check (raw_decision in ('not_seen', 'dislike', 'like', 'not_interested')),
  detail_completed boolean not null default false,
  review_text text not null default '',
  question_text text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, movie_id)
);

create or replace function public.set_ratings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists ratings_set_updated_at on public.ratings;

create trigger ratings_set_updated_at
before update on public.ratings
for each row
execute function public.set_ratings_updated_at();

alter table public.ratings enable row level security;

drop policy if exists "Users can read own ratings" on public.ratings;
create policy "Users can read own ratings"
on public.ratings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own ratings" on public.ratings;
create policy "Users can insert own ratings"
on public.ratings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own ratings" on public.ratings;
create policy "Users can update own ratings"
on public.ratings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own ratings" on public.ratings;
create policy "Users can delete own ratings"
on public.ratings
for delete
to authenticated
using (auth.uid() = user_id);
