-- 오늘의 질문을 추천 상황과 연결하고, 답변으로 선택한 영화를 상황별 추천 신호로 저장합니다.
alter table public.daily_questions
  add column if not exists situation_preset_id text;

alter table public.daily_question_answers
  add column if not exists movie_id text,
  add column if not exists movie_title text,
  add column if not exists movie_poster_path text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_question_answers_movie_reference_check'
  ) then
    alter table public.daily_question_answers
      add constraint daily_question_answers_movie_reference_check
      check (
        (movie_id is null and movie_title is null and movie_poster_path is null)
        or (movie_id is not null and movie_title is not null)
      );
  end if;
end;
$$;

-- 2026-08-09부터 추천 상황의 순서에 맞춰 질문과 상황 ID를 저장합니다.
with situation_bank(position, situation_preset_id, question) as (
  values
    (0, 'after_breakup', '헤어지고 난 첫 주에 보고 싶은 영화는?'),
    (1, 'offline_rest', '인터넷 없이 쉬고 싶은 날, 곁에 두고 싶은 영화는?'),
    (2, 'cant_sleep', '잠 못 드는 밤에도 끝까지 보고 싶은 영화는?'),
    (3, 'sunset', '해 질 무렵 가장 먼저 떠오르는 영화는?'),
    (4, 'after_reading', '책을 덮은 뒤 여운처럼 이어 보고 싶은 영화는?'),
    (5, 'before_travel', '여행을 떠나기 전 설렘을 더해 줄 영화는?'),
    (6, 'monday_school', '월요일 아침, 학교 가기 싫을 때 보고 싶은 영화는?'),
    (7, 'cleaning', '청소하는 날 틀어 두기 좋은 영화는?'),
    (8, 'before_confession', '고백하기 전 용기가 필요할 때 보고 싶은 영화는?'),
    (9, 'autumn_vibes', '가을 감성을 가장 잘 담은 영화는?'),
    (10, 'sunday_night', '일요일 밤을 다정하게 마무리해 줄 영화는?')
)
update public.daily_questions as question
set
  question = situation_bank.question,
  situation_preset_id = situation_bank.situation_preset_id
from situation_bank
where question.active_date >= date '2026-08-09'
  and mod(question.active_date - date '2026-08-09', 11) = situation_bank.position;

create index if not exists daily_questions_situation_preset_idx
  on public.daily_questions (situation_preset_id, active_date desc);

create index if not exists daily_question_answers_situation_movie_idx
  on public.daily_question_answers (question_id, movie_id)
  where movie_id is not null;
