-- 한국 시간 기준 오늘부터 30일 동안 서로 다른 질문을 배정합니다.
-- 31일째부터는 같은 순서로 다시 시작합니다.
with question_bank(position, question) as (
  values
    (0, '오늘 하루를 영화 제목으로 표현한다면?'),
    (1, '가장 많이 울었던 영화는?'),
    (2, '다시 기억을 지우고 보고 싶은 영화는?'),
    (3, '최고의 반전 영화는?'),
    (4, '가장 과소평가됐다고 생각하는 영화는?'),
    (5, '최악의 결말이라고 생각하는 영화는?'),
    (6, '최고의 OST 영화는?'),
    (7, '최고의 악역은?'),
    (8, '가장 현실적인 영화는?'),
    (9, '가장 비현실적인데 재밌는 영화는?'),
    (10, '겨울에 생각나는 영화는?'),
    (11, '여름밤에 보기 좋은 영화는?'),
    (12, '혼자 보기 좋은 영화는?'),
    (13, '가족과 보기 좋은 영화는?'),
    (14, '친구에게 꼭 추천하고 싶은 영화는?'),
    (15, '가장 웃겼던 영화는?'),
    (16, '가장 무서웠던 영화는?'),
    (17, '가장 긴 여운이 남은 영화는?'),
    (18, '인생 영화 한 편만 고른다면?'),
    (19, '가장 예쁜 영상미를 가진 영화는?'),
    (20, '최고의 엔딩은?'),
    (21, '최고의 오프닝은?'),
    (22, '책보다 영화가 더 좋았던 작품은?'),
    (23, '영화관에서 봐야 하는 영화는?'),
    (24, '집에서 보기 좋은 영화는?'),
    (25, '평점보다 훨씬 좋았던 영화는?'),
    (26, '평점은 높은데 재미없었던 영화는?'),
    (27, '올해 본 영화 중 최고는?'),
    (28, '아직 안 본 영화 중 가장 기대되는 작품은?'),
    (29, '오늘 밤 추천받고 싶은 장르는?')
),
today as (
  select timezone('Asia/Seoul', now())::date as active_date
),
schedule as (
  select day::date as active_date, today.active_date as first_date
  from today
  cross join generate_series(today.active_date, today.active_date + 1095, interval '1 day') as day
)
insert into public.daily_questions (question, active_date)
select question_bank.question, schedule.active_date
from schedule
join question_bank on question_bank.position = mod(schedule.active_date - schedule.first_date, 30)
on conflict (active_date) do update
set question = excluded.question;
