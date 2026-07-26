const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });

// TMDB 토큰은 이 서버 함수에서만 사용합니다. 브라우저로 전달하지 않습니다.
export default async (request) => {
  const query = new URL(request.url).searchParams.get('query')?.trim() ?? '';
  const token = process.env.TMDB_BEARER_TOKEN?.trim();

  if (!query) return json([]);
  if (!token) return json({ message: 'TMDB 설정이 필요합니다.' }, 503);

  const url = new URL(`${TMDB_API_BASE_URL}/search/movie`);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'ko-KR');
  url.searchParams.set('region', 'KR');
  url.searchParams.set('include_adult', 'false');

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
    if (!response.ok) return json({ message: 'TMDB 영화 검색에 실패했습니다.' }, response.status);
    const payload = await response.json();
    const movies = Array.isArray(payload.results) ? payload.results : [];
    return json(
      movies
        .filter((movie) => Number.isInteger(movie?.id) && typeof movie?.title === 'string' && movie.title.trim())
        .slice(0, 8)
        .map((movie) => ({
          id: movie.id,
          title: movie.title.trim(),
          posterPath: typeof movie.poster_path === 'string' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
          releaseYear: typeof movie.release_date === 'string' && /^\d{4}/.test(movie.release_date) ? Number(movie.release_date.slice(0, 4)) : null
        }))
    );
  } catch {
    return json({ message: 'TMDB 영화 검색 중 네트워크 오류가 발생했습니다.' }, 502);
  }
};
