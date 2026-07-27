const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const toSearchParams = (parameters = {}) =>
  Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null && value !== '');

export const toTmdbImageUrl = (path, size = 'w500') =>
  typeof path === 'string' && path.startsWith('/') ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;

export const fetchTmdbJson = async (path, token, parameters) => {
  const url = new URL(`${TMDB_API_BASE_URL}${path}`);

  for (const [name, value] of toSearchParams(parameters)) {
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`TMDB returned ${response.status}.`);
  }

  return response.json();
};
