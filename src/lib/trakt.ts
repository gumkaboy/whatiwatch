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

export interface PopularSeriesPage {
  items: { tmdbId: number; name: string; posterPath: string | null; year: string | null }[];
  hasMore: boolean;
}

export async function getPopularSeriesFromTrakt(
  limit = 20,
  page = 1
): Promise<PopularSeriesPage> {
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) {
    console.warn("[trakt] TRAKT_CLIENT_ID не задан — подборка «Популярное» будет пустой.");
    return { items: [], hasMore: false };
  }

  const res = await fetch(`https://api.trakt.tv/shows/popular?limit=${limit}&page=${page}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": clientId,
      // без реального браузерного User-Agent Cloudflare отдаёт 403 на серверные fetch-запросы
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.warn(`[trakt] shows/popular вернул ${res.status}`);
    return { items: [], hasMore: false };
  }

  const pageCount = Number(res.headers.get("x-pagination-page-count") ?? "1");
  const shows = (await res.json()) as TraktShowSummary[];
  const entries = shows.filter(
    (s): s is TraktShowSummary & { ids: { tmdb: number } } => s.ids.tmdb !== null
  );

  const posters = await Promise.all(entries.map((s) => getPosterForTmdbId(s.ids.tmdb)));

  const items = entries
    .map((s, i) => {
      const poster = posters[i];
      if (!poster) return null;
      return {
        tmdbId: s.ids.tmdb,
        name: poster.name,
        posterPath: poster.posterPath,
        year: s.year !== null ? String(s.year) : null,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return { items, hasMore: page < pageCount };
}
