export const GENRE_OPTIONS = [
  'Drama',
  'Comedy',
  'Dramedy',
  'Romance',
  'Thriller',
  'Mystery',
  'Crime',
  'Sci-Fi',
  'Fantasy',
  'Horror',
  'Animation',
  'Documentary',
  'Historical',
  'Family',
] as const;

export type GenreFilter = (typeof GENRE_OPTIONS)[number];

function normalizedGenres(genres: string[]): Set<string> {
  return new Set(genres.map((genre) => genre.toLowerCase()));
}

export function matchesGenreFilter(genres: string[], selected: GenreFilter[]): boolean {
  if (selected.length === 0) return true;
  const values = normalizedGenres(genres);

  return selected.some((filter) => {
    switch (filter) {
      case 'Comedy':
        return [...values].some((genre) => genre.includes('comedy') || genre === 'sitcom');
      case 'Dramedy':
        return values.has('drama') && [...values].some((genre) => genre.includes('comedy'));
      case 'Romance':
        return [...values].some((genre) => genre.includes('romance') || genre.includes('romantic'));
      case 'Sci-Fi':
        return values.has('science fiction') || values.has('sci-fi');
      case 'Historical':
        return values.has('historical') || values.has('period');
      default:
        return values.has(filter.toLowerCase());
    }
  });
}
