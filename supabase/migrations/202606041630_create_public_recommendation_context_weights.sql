create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.recommendation_context_weights (
  context_key text not null
    check (context_key in ('normal', 'after_exam', 'bed_time', 'with_friends', 'after_academy')),
  genre_id integer not null,
  weight numeric(4, 2) not null check (weight >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (context_key, genre_id)
);

create index if not exists recommendation_context_weights_context_key_idx
on public.recommendation_context_weights (context_key);

drop trigger if exists set_recommendation_context_weights_updated_at on public.recommendation_context_weights;
create trigger set_recommendation_context_weights_updated_at
before update on public.recommendation_context_weights
for each row
execute function public.set_updated_at();

alter table public.recommendation_context_weights enable row level security;

drop policy if exists "Anyone can read recommendation context weights" on public.recommendation_context_weights;
create policy "Anyone can read recommendation context weights"
on public.recommendation_context_weights
for select
to anon, authenticated
using (true);

insert into public.recommendation_context_weights (context_key, genre_id, weight)
values
  ('normal', 28, 1.00),
  ('normal', 35, 1.00),
  ('normal', 53, 1.00),
  ('normal', 878, 1.00),
  ('normal', 9648, 1.00),
  ('normal', 10749, 1.00),

  ('bed_time', 28, 0.20),
  ('bed_time', 35, 1.00),
  ('bed_time', 53, 1.60),
  ('bed_time', 878, 0.50),
  ('bed_time', 9648, 1.60),
  ('bed_time', 10749, 2.00),

  ('after_academy', 28, 1.50),
  ('after_academy', 35, 2.00),
  ('after_academy', 53, 0.10),
  ('after_academy', 878, 0.60),
  ('after_academy', 9648, 0.10),
  ('after_academy', 10749, 1.20),

  ('after_exam', 28, 1.80),
  ('after_exam', 35, 1.50),
  ('after_exam', 53, 0.80),
  ('after_exam', 878, 1.50),
  ('after_exam', 9648, 0.80),
  ('after_exam', 10749, 0.50),

  ('with_friends', 28, 1.30),
  ('with_friends', 35, 2.00),
  ('with_friends', 53, 1.80),
  ('with_friends', 878, 0.80),
  ('with_friends', 9648, 1.80),
  ('with_friends', 10749, 0.30)
on conflict (context_key, genre_id) do update
set
  weight = excluded.weight,
  updated_at = timezone('utc', now());
