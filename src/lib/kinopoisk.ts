const BASE_URL = "https://kinopoiskapiunofficial.tech";

function getHeaders(apiKey: string): HeadersInit {
  return { "X-API-KEY": apiKey, accept: "application/json" };
}

interface KpSearchFilm {
  filmId: number;
}

interface KpSearchResult {
  films: KpSearchFilm[];
}

interface KpFilmDetails {
  kinopoiskId: number;
  imdbId: string | null;
  ratingKinopoisk: number | null;
}

export interface KinopoiskRating {
  rating: number;
  kinopoiskId: number;
}

export async function getKinopoiskRating(
  title: string,
  imdbId: string
): Promise<KinopoiskRating | null> {
  const apiKey = process.env.KINOPOISK_API_KEY;
  if (!apiKey) return null;

  const searchUrl = new URL(`${BASE_URL}/api/v2.1/films/search-by-keyword`);
  searchUrl.searchParams.set("keyword", title);

  const searchRes = await fetch(searchUrl, { headers: getHeaders(apiKey), cache: "no-store" });
  if (!searchRes.ok) return null;
  const searchData = (await searchRes.json()) as KpSearchResult;

  for (const candidate of searchData.films.slice(0, 5)) {
    const detailsRes = await fetch(`${BASE_URL}/api/v2.2/films/${candidate.filmId}`, {
      headers: getHeaders(apiKey),
      cache: "no-store",
    });
    if (!detailsRes.ok) continue;
    const details = (await detailsRes.json()) as KpFilmDetails;

    if (details.imdbId === imdbId && details.ratingKinopoisk != null) {
      return { rating: details.ratingKinopoisk, kinopoiskId: details.kinopoiskId };
    }
  }

  return null;
}
