# Movie

## KOBIS 일별 박스오피스

홈의 인기 영화는 배포 환경에서 KOBIS 일별 박스오피스 API를 호출합니다. KOBIS에서 발급한 API 키를 Netlify 환경 변수 `KOBIS_API_KEY`에 설정하세요. 이 키는 `netlify/functions/kobis-boxoffice.mjs`에서만 사용되며 브라우저 번들에는 포함되지 않습니다.

상세 평가의 예고편은 TMDB 영상 정보를 통해 YouTube 플레이어로 앱 안에서 재생합니다. Netlify 환경 변수 `TMDB_BEARER_TOKEN`을 설정하세요. 이 토큰은 `netlify/functions/tmdb-trailer.mjs`에서만 사용되며 브라우저 번들에는 포함되지 않습니다.

## 극장 탭

`/theaters`는 TMDB의 한국 기준 현재 상영작·개봉 예정작을 표시합니다. 같은 `TMDB_BEARER_TOKEN`을 Netlify 환경 변수에 설정하면 `netlify/functions/tmdb-theatrical.mjs`가 영화 정보만 정규화해 제공합니다.

근처 영화관 지도에는 카카오 개발자 콘솔의 JavaScript 키를 `VITE_KAKAO_MAP_JAVASCRIPT_KEY`에 설정하고, JavaScript SDK 도메인에 로컬 개발 주소와 배포 도메인을 등록하세요. JavaScript 키는 지도 SDK를 초기화하기 위해 브라우저에 노출되는 공개 키입니다. 위치 정보는 현재 세션의 지도 검색에만 사용하며 저장하지 않습니다.

KOBIS는 일간 집계 데이터를 제공하므로 화면에는 최신 완료 일자의 순위가 표시됩니다. 키가 없거나 API 요청이 실패하면 기존 연간 순위를 안전하게 유지합니다.
