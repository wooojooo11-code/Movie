export type TheatricalCollection = 'nowPlaying' | 'upcoming';

export interface TheatricalGenre {
  id: number;
  name: string;
}

export interface TheatricalMovie {
  id: number;
  title: string;
  posterUrl: string | null;
  releaseDate: string | null;
  genres: string[];
  overview: string | null;
}

export interface TheatricalMoviesResponse {
  nowPlaying: TheatricalMovie[];
  upcoming: TheatricalMovie[];
  genres: TheatricalGenre[];
}

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyCinema extends MapCoordinates {
  id: string;
  name: string;
  address: string;
  distanceMeters: number;
  placeUrl: string | null;
}
