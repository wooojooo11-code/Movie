# Movie

## KOBIS 일별 박스오피스

홈의 인기 영화는 배포 환경에서 KOBIS 일별 박스오피스 API를 호출합니다. KOBIS에서 발급한 API 키를 Netlify 환경 변수 `KOBIS_API_KEY`에 설정하세요. 포스터는 제목과 개봉일을 함께 확인하기 위해 같은 환경 변수의 `TMDB_BEARER_TOKEN`으로 조회합니다. 두 키 모두 `netlify/functions/kobis-boxoffice.mjs`에서만 사용되며 브라우저 번들에는 포함되지 않습니다.

상세 평가의 예고편은 TMDB 영상 정보를 통해 YouTube 플레이어로 앱 안에서 재생합니다. Netlify 환경 변수 `TMDB_BEARER_TOKEN`을 설정하세요. 이 토큰은 `netlify/functions/tmdb-trailer.mjs`에서만 사용되며 브라우저 번들에는 포함되지 않습니다.

KOBIS는 일간 집계 데이터를 제공하므로 화면에는 최신 완료 일자의 순위가 표시됩니다. 키가 없거나 API 요청이 실패하면 기존 연간 순위를 안전하게 유지합니다.
