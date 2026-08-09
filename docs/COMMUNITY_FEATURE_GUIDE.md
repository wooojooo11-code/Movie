# 영화 커뮤니티 기능 안내

## 미션 인증 기능 제거

커뮤니티에서는 미션 인증 탭, 작성 항목, 카드, 상세 표시를 더 이상 제공하지 않습니다.

- `202608021000_remove_community_mission_proof.sql`을 실행하면 새 미션 인증 글은 작성할 수 없고, 기존 미션 인증 글은 목록과 상세 화면에서 보이지 않습니다.
- `community_mission_proofs` 테이블과 이전 데이터는 삭제하지 않습니다. 필요하면 나중에 별도 백업·정리 작업을 할 수 있습니다.

## Supabase 적용 순서

Supabase Dashboard의 SQL Editor에서 아래 파일을 순서대로 각각 실행합니다.

1. `supabase/migrations/202607261600_create_community_schema.sql`
2. `supabase/migrations/202607261700_allow_unlimited_poll_options.sql`
3. `supabase/migrations/202607261800_use_app_catalog_movie_ids.sql`
4. `supabase/migrations/202607271000_seed_30_day_daily_questions.sql`
5. `supabase/migrations/202607281000_add_unlimited_related_post_movies.sql`
6. `supabase/migrations/202607281100_add_comment_movie_recommendations.sql`
7. `supabase/migrations/202608021000_remove_community_mission_proof.sql`
8. `supabase/migrations/202608090900_ensure_multiple_related_movies.sql`

브라우저 환경에는 기존 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`만 설정되어 있으면 됩니다. 키 값은 코드에 넣지 않습니다.

## 주요 경로

- `/community`: 오늘의 질문, 인기·최신 게시글, 검색·정렬·탭
- `/community/:postId`: 게시글 상세, 댓글, 투표
- `/movies/:movieId`: 앱 카탈로그 기반 영화 상세

## 관련 영화 연결

관련 영화는 앱의 `src/data/catalog.ts` 영화 데이터와 연결합니다. 영화 검색 결과를 선택할 때마다 게시글에 추가되며, 개수 제한은 없습니다. 같은 영화는 한 번만 연결됩니다.

- 첫 번째 영화는 이전 게시글 검색·정렬 호환을 위해 `community_posts.movie_*` 열에도 저장됩니다.
- 전체 연결 목록은 `community_post_movies` 테이블에 순서대로 저장됩니다.
- 기존 단일 영화 게시글은 새 SQL을 실행할 때 첫 번째 관련 영화로 자동 이관됩니다.
- 여러 편의 관련 영화가 하나만 저장되는 경우에는 8번 SQL을 실행하세요. 앱은 등록 직후 모든 선택 영화를 다시 확인해 저장합니다.

## 다음 영화 추천 댓글

게시글 상세의 댓글 작성 영역에서 영화를 선택하면, 해당 댓글은 `다음 영화 추천` 카드와 추천 이유를 함께 표시합니다. 일반 댓글은 영화 선택 없이 기존처럼 작성할 수 있습니다.

- 추천 영화 정보는 `community_comments.movie_*` 열에 저장됩니다.
- 별도의 추천 릴레이 섹션은 만들지 않습니다.
- 이 기능을 사용하려면 6번 SQL을 실행해야 합니다.

## 데이터 접근

- 게시글과 댓글은 누구나 읽을 수 있습니다.
- 로그인한 사용자만 게시글·댓글·투표를 작성할 수 있습니다.
- 관련 영화 연결은 본인 게시글에만 직접 변경할 수 있고, 새 게시글 작성은 `create_community_post` RPC가 함께 처리합니다.
- 오늘의 질문은 한국 시간 날짜 기준으로 30개 질문을 순서대로 표시하고 31일째부터 반복합니다.
