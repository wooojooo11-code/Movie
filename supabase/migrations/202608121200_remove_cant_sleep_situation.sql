-- '잠이 안 옴' 프리셋을 일일 질문 순환에서도 제외합니다.
-- 과거 질문과 답변은 보존하고, 마이그레이션 실행일 이후의 질문만 새 순서로 갱신합니다.
with situation_bank(position, situation_preset_id, question) as (
  values
    (0, 'after_breakup', '헤어지고 난 첫 주에 보고 싶은 영화는?'),
    (1, 'offline_rest', '인터넷 없이 쉬고 싶은 날, 곁에 두고 싶은 영화는?'),
    (2, 'sunset', '해 질 무렵 가장 먼저 떠오르는 영화는?'),
    (3, 'after_reading', '책을 덮은 뒤 여운처럼 이어 보고 싶은 영화는?'),
    (4, 'before_travel', '여행을 떠나기 전 설렘을 더해 줄 영화는?'),
    (5, 'cleaning', '청소하는 날 틀어 두기 좋은 영화는?'),
    (6, 'before_confession', '고백하기 전 용기가 필요할 때 보고 싶은 영화는?'),
    (7, 'winter_vibes', '겨울 감성을 가득 채워 줄 영화는?'),
    (8, 'sunday_night', '일요일 밤을 다정하게 마무리해 줄 영화는?')
)
update public.daily_questions as daily_question
set
  question = situation_bank.question,
  situation_preset_id = situation_bank.situation_preset_id
from situation_bank
where daily_question.active_date >= current_date
  and mod(daily_question.active_date - date '2026-08-09', 9) = situation_bank.position;
