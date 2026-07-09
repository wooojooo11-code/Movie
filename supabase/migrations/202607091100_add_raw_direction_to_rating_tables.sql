alter table public.ratings
  add column if not exists raw_direction text null;

alter table public.ratings
  drop constraint if exists ratings_raw_direction_check;

alter table public.ratings
  add constraint ratings_raw_direction_check
  check (raw_direction is null or raw_direction in ('up', 'left', 'right', 'down', 'enter'));

alter table public.rating_history
  add column if not exists raw_direction text null;

alter table public.rating_history
  drop constraint if exists rating_history_raw_direction_check;

alter table public.rating_history
  add constraint rating_history_raw_direction_check
  check (raw_direction is null or raw_direction in ('up', 'left', 'right', 'down', 'enter'));
