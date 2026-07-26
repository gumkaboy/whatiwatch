import { getSeriesDetails } from "@/lib/tmdb";

interface TraktShowSummary {
  title: string;
  year: number | null;
  ids: { tmdb: number | null };
}

async function getPosterForTmdbId(tmdbId: number) {
  try {
    const details = await getSeriesDetails(tmdbId);
    return { name: details.name, posterPath: details.poster_path };
  } catch {
    return null;
  }
}

export async function getPopularSeriesFromTrakt(limit = 20) {
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) {
    console.warn("[trakt] TRAKT_CLIENT_ID не задан — подборка «Популярное» будет пустой.");
    return [];
  }

  const res = await fetch(`https://api.trakt.tv/shows/popular?limit=${limit}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": clientId,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.warn(`[trakt] shows/popular вернул ${res.status}`);
    return [];
  }

  const shows = (await res.json()) as TraktShowSummary[];
  const tmdbIds = shows.map((s) => s.ids.tmdb).filter((id): id is number => id !== null);

  const posters = await Promise.all(tmdbIds.map((tmdbId) => getPosterForTmdbId(tmdbId)));

  return tmdbIds
    .map((tmdbId, i) => {
      const poster = posters[i];
      if (!poster) return null;
      return { tmdbId, name: poster.name, posterPath: poster.posterPath };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
}
