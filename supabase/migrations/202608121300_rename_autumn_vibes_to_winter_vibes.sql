-- 앞으로 남은 일일 질문의 가을 감성 프리셋을 겨울 감성으로 교체합니다.
UPDATE public.daily_questions
SET
  situation_preset_id = 'winter_vibes',
  question = '겨울 감성을 가장 잘 담은 영화는?'
WHERE active_date >= CURRENT_DATE
  AND situation_preset_id = 'autumn_vibes';
