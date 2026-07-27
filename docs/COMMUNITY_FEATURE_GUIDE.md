# 영화 커뮤니티 기능 안내

## 적용 순서

1. `supabase/migrations/202607261600_create_community_schema.sql`을 적용합니다.
2. `supabase/migrations/202607261700_allow_unlimited_poll_options.sql`을 적용합니다.
3. `supabase/migrations/202607261800_use_app_catalog_movie_ids.sql`을 적용합니다.
4. `supabase/migrations/202607271000_seed_30_day_daily_questions.sql`을 적용합니다.
5. 브라우저 환경에는 기존 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`만 설정되어 있는지 확인합니다.

## 주요 경로

- `/community`: 오늘의 질문, 인기·최신 게시글, 검색·정렬·탭
- `/community/:postId`: 게시글 상세, 댓글, 투표
- `/movies/:movieId`: 앱 카탈로그를 기반으로 한 영화 상세

## 앱 영화 데이터 연결

커뮤니티의 관련 영화, 미션 인증 영화, 투표 항목 영화, 추천 릴레이 영화는 모두 `src/data/catalog.ts`의 `catalogMovies`를 사용합니다.

- 영화 선택 시 앱 카탈로그의 내부 ID(예: `movie_42`)를 저장합니다.
- 검색은 브라우저에서 카탈로그의 제목·장르·태그를 대상으로 수행합니다.
- 영화 상세 화면도 같은 카탈로그 데이터를 읽으므로, 커뮤니티 기능은 TMDB 검색·상세 API를 호출하지 않습니다.
- 이전 버전에서 저장한 숫자형 영화 ID는 카탈로그 내 기존 식별자와 대조해 읽기만 호환합니다. 새 게시글에는 내부 ID를 사용합니다.

## 데이터 정책

- 게시글과 댓글은 누구나 읽을 수 있고, 로그인한 사용자만 작성할 수 있습니다.
- 좋아요·저장·투표·팔로우는 사용자별 고유 제약으로 중복되지 않습니다.
- 공유 리스트 저장은 `list_interactions`에 원본 `list_id`만 연결합니다.
- 대표 이미지와 미션 인증 이미지는 HTTPS URL만 사용합니다.
- 오늘의 질문은 한국 시간 기준으로 30개 질문을 순서대로 표시하며, 31일째부터 같은 순서로 반복합니다.
