import { createClient } from 'npm:@supabase/supabase-js@2';

type IncomingMovie = {
  movieId: string;
  tmdbMovieId: number;
};

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

const normalizeMovies = (value: unknown): IncomingMovie[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (movie): movie is Record<string, unknown> =>
        Boolean(movie) && typeof movie === 'object' && !Array.isArray(movie)
    )
    .map((movie) => ({
      movieId: typeof movie.movieId === 'string' ? movie.movieId.trim() : '',
      tmdbMovieId: typeof movie.tmdbMovieId === 'number' ? movie.tmdbMovieId : Number.NaN
    }))
    .filter(
      (movie) =>
        movie.movieId.length > 0 &&
        movie.movieId.length <= 120 &&
        Number.isSafeInteger(movie.tmdbMovieId) &&
        movie.tmdbMovieId > 0
    )
    .slice(0, 50);
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const tmdbToken = Deno.env.get('TMDB_BEARER_TOKEN');
  const authorization = request.headers.get('Authorization') ?? '';

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !tmdbToken) {
    return json({ error: 'Required Edge Function secrets are not configured.' }, 500);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } }
  });
  const {
    data: { user }
  } = await userClient.auth.getUser();

  if (!user) {
    return json({ error: 'Authentication is required.' }, 401);
  }

  let payload: { movies?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const movies = normalizeMovies(payload.movies);
  if (movies.length === 0) {
    return json({ cached: 0 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const rows: Record<string, unknown>[] = [];

  for (const movie of movies) {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.tmdbMovieId}?append_to_response=credits&language=ko-KR`,
      { headers: { Authorization: `Bearer ${tmdbToken}`, accept: 'application/json' } }
    );

    if (!response.ok) {
      continue;
    }

    const detail = (await response.json()) as Record<string, any>;
    const crew = Array.isArray(detail.credits?.crew) ? detail.credits.crew : [];
    const cast = Array.isArray(detail.credits?.cast) ? detail.credits.cast : [];
    const director = crew.find((person: Record<string, unknown>) => person.job === 'Director') ?? null;

    rows.push({
      movie_id: movie.movieId,
      tmdb_movie_id: movie.tmdbMovieId,
      genres: Array.isArray(detail.genres)
        ? detail.genres.map((genre: Record<string, unknown>) => genre.name).filter(Boolean)
        : [],
      director_name: typeof director?.name === 'string' ? director.name : null,
      director_profile_url:
        typeof director?.profile_path === 'string'
          ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
          : null,
      cast_members: cast.slice(0, 5).map((person: Record<string, unknown>) => ({
        name: typeof person.name === 'string' ? person.name : '',
        character: typeof person.character === 'string' ? person.character : '',
        profile_url:
          typeof person.profile_path === 'string'
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : null
      })),
      production_countries: Array.isArray(detail.production_countries)
        ? detail.production_countries.map((country: Record<string, unknown>) => country.name).filter(Boolean)
        : [],
      runtime_minutes: typeof detail.runtime === 'number' ? detail.runtime : null,
      release_year:
        typeof detail.release_date === 'string' && /^\d{4}/.test(detail.release_date)
          ? Number(detail.release_date.slice(0, 4))
          : null,
      vote_average: typeof detail.vote_average === 'number' ? detail.vote_average : null,
      updated_at: new Date().toISOString()
    });
  }

  if (rows.length > 0) {
    const { error } = await adminClient
      .from('profile_movie_metadata')
      .upsert(rows, { onConflict: 'movie_id' });

    if (error) {
      return json({ error: error.message }, 500);
    }
  }

  return json({ cached: rows.length });
});
