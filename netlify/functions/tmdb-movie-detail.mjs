const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=900' }
  });

export default async (request) => {
  const rawId = new URL(request.url).searchParams.get('id');
  const movieId = Number(rawId);
  const token = process.env.TMDB_BEARER_TOKEN?.trim();

  if (!Number.isInteger(movieId) || movieId <= 0) return json({ message: '올바른 영화 ID가 필요합니다.' }, 400);
  if (!token) return json({ message: 'TMDB 설정이 필요합니다.' }, 503);

  const url = new URL(`${TMDB_API_BASE_URL}/movie/${movieId}`);
  url.searchParams.set('language', 'ko-KR');

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
    if (!response.ok) return json({ message: 'TMDB 영화 정보를 찾지 못했습니다.' }, response.status);
    const movie = await response.json();
    return json({
      id: movie.id,
      title: typeof movie.title === 'string' ? movie.title : movie.original_title,
      posterPath: typeof movie.poster_path === 'string' ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      backdropPath: typeof movie.backdrop_path === 'string' ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
      releaseYear: typeof movie.release_date === 'string' && /^\d{4}/.test(movie.release_date) ? Number(movie.release_date.slice(0, 4)) : null,
      overview: typeof movie.overview === 'string' ? movie.overview : '',
      genres: Array.isArray(movie.genres) ? movie.genres.map((genre) => genre?.name).filter((name) => typeof name === 'string') : [],
      runtimeMinutes: Number.isInteger(movie.runtime) ? movie.runtime : null
    });
  } catch {
    return json({ message: 'TMDB 영화 정보를 불러오는 중 오류가 발생했습니다.' }, 502);
  }
};
