const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getAuthHeaders(): HeadersInit {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_API_READ_ACCESS_TOKEN не задан. Добавь его в .env (см. https://www.themoviedb.org/settings/api)."
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    accept: "application/json",
  };
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("language", "ru-RU");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  // данные TMDb (описания, даты выхода, постеры) не меняются поминутно —
  // короткий общий кэш вместо no-store резко сокращает задержку страниц
  const res = await fetch(url, { headers: getAuthHeaders(), next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`TMDb API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export interface TmdbSeriesSummary {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string | null;
  overview: string;
}

export interface TmdbSeriesSearchResult {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbSeriesSummary[];
}

export interface TmdbSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface TmdbSeriesDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  last_air_date: string | null;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  status: string;
  seasons: TmdbSeason[];
  networks: { id: number; name: string; logo_path: string | null }[];
}

export function searchSeries(query: string, page = 1) {
  return tmdbFetch<TmdbSeriesSearchResult>("/search/tv", { query, page: String(page) });
}

export interface PopularSeriesPage {
  items: { tmdbId: number; name: string; posterPath: string | null; year: string | null }[];
  hasMore: boolean;
}

// жанры TMDb, которые не хотим видеть в "Популярном": детское, ток-шоу,
// новости, реалити, документалистика, мыльные оперы
const EXCLUDED_GENRE_IDS = [10762, 10767, 10763, 10764, 99, 10766];

// "популярное, но не кринж" — сортировка по популярности с порогом рейтинга
// и минимальным числом голосов (иначе один сериал с одним голосом 10/10 мог бы попасть в топ)
export async function getPopularWellRatedSeries(page = 1): Promise<PopularSeriesPage> {
  const data = await tmdbFetch<TmdbSeriesSearchResult>("/discover/tv", {
    sort_by: "popularity.desc",
    "vote_average.gte": "7",
    "vote_count.gte": "200",
    without_genres: EXCLUDED_GENRE_IDS.join(","),
    page: String(page),
  });

  const items = data.results.map((s) => ({
    tmdbId: s.id,
    name: s.name,
    posterPath: s.poster_path,
    year: s.first_air_date ? s.first_air_date.slice(0, 4) : null,
  }));

  return { items, hasMore: page < data.total_pages };
}

export function getSeriesDetails(tmdbId: number) {
  return tmdbFetch<TmdbSeriesDetails>(`/tv/${tmdbId}`);
}

interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
}

interface TmdbVideosResult {
  results: TmdbVideo[];
}

function pickTrailer(videos: TmdbVideo[]): TmdbVideo | undefined {
  const isRu = (v: TmdbVideo) => v.iso_639_1 === "ru";
  const isEn = (v: TmdbVideo) => v.iso_639_1 === "en";

  return (
    videos.find((v) => v.type === "Trailer" && v.official && isRu(v)) ??
    videos.find((v) => v.type === "Trailer" && isRu(v)) ??
    videos.find((v) => v.type === "Teaser" && isRu(v)) ??
    videos.find((v) => v.type === "Trailer" && v.official && isEn(v)) ??
    videos.find((v) => v.type === "Trailer" && isEn(v)) ??
    videos.find((v) => v.type === "Teaser" && isEn(v))
  );
}

export async function getSeriesTrailerKey(tmdbId: number): Promise<string | null> {
  const params = { language: "en-US", include_video_language: "ru,en,null" };

  const seasonData = await tmdbFetch<TmdbVideosResult>(
    `/tv/${tmdbId}/season/1/videos`,
    params
  ).catch(() => ({ results: [] }) as TmdbVideosResult);

  const seasonVideos = seasonData.results.filter((v) => v.site === "YouTube");
  const seasonTrailer = pickTrailer(seasonVideos);
  if (seasonTrailer) return seasonTrailer.key;

  const seriesData = await tmdbFetch<TmdbVideosResult>(`/tv/${tmdbId}/videos`, params);
  const seriesVideos = seriesData.results.filter((v) => v.site === "YouTube");
  const seriesTrailer = pickTrailer(seriesVideos);

  return seriesTrailer?.key ?? null;
}

export interface WatchProvider {
  providerId: number;
  providerName: string;
  logoPath: string;
}

interface TmdbWatchProviderRaw {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface TmdbWatchProvidersResult {
  results: Record<
    string,
    {
      flatrate?: TmdbWatchProviderRaw[];
      free?: TmdbWatchProviderRaw[];
      ads?: TmdbWatchProviderRaw[];
      rent?: TmdbWatchProviderRaw[];
      buy?: TmdbWatchProviderRaw[];
    }
  >;
}

export interface WatchProvidersResult {
  providers: WatchProvider[];
  watchPageUrl: string | null;
}

export async function getWatchProviders(tmdbId: number): Promise<WatchProvidersResult> {
  const data = await tmdbFetch<TmdbWatchProvidersResult & { results: Record<string, { link?: string }> }>(
    `/tv/${tmdbId}/watch/providers`
  );
  const ru = data.results?.RU;
  if (!ru) return { providers: [], watchPageUrl: null };

  const all = [
    ...(ru.flatrate ?? []),
    ...(ru.free ?? []),
    ...(ru.ads ?? []),
    ...(ru.rent ?? []),
    ...(ru.buy ?? []),
  ];

  const byId = new Map<number, WatchProvider>();
  for (const p of all) {
    if (!byId.has(p.provider_id)) {
      byId.set(p.provider_id, {
        providerId: p.provider_id,
        providerName: p.provider_name,
        logoPath: p.logo_path,
      });
    }
  }
  return { providers: Array.from(byId.values()), watchPageUrl: ru.link ?? null };
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  still_path: string | null;
  runtime: number | null;
  air_date: string | null;
}

interface TmdbSeasonDetails {
  season_number: number;
  episodes: TmdbEpisode[];
}

export async function getSeasonEpisodes(tmdbId: number, seasonNumber: number) {
  const data = await tmdbFetch<TmdbSeasonDetails>(`/tv/${tmdbId}/season/${seasonNumber}`);
  return data.episodes;
}

export async function getAiredEpisodeCount(tmdbId: number): Promise<number> {
  const series = await getSeriesDetails(tmdbId);
  const seasonNumbers = series.seasons.map((s) => s.season_number).filter((n) => n > 0);
  const now = new Date();

  const episodesArrays = await Promise.all(
    seasonNumbers.map((n) => getSeasonEpisodes(tmdbId, n).catch(() => []))
  );

  return episodesArrays
    .flat()
    .filter((ep) => ep.air_date && new Date(ep.air_date) <= now).length;
}

interface TmdbExternalIds {
  imdb_id: string | null;
}

export async function getSeriesExternalIds(tmdbId: number) {
  return tmdbFetch<TmdbExternalIds>(`/tv/${tmdbId}/external_ids`);
}

export interface TmdbBackdrop {
  file_path: string;
}

interface TmdbImagesResult {
  backdrops: TmdbBackdrop[];
}

export async function getSeriesBackdrops(tmdbId: number) {
  const data = await tmdbFetch<TmdbImagesResult>(`/tv/${tmdbId}/images`, {
    include_image_language: "en,ru,null",
  });
  return data.backdrops.slice(0, 12);
}

export function tmdbImageUrl(
  path: string | null,
  size: "w92" | "w200" | "w300" | "w342" | "w500" | "original" = "w342"
) {
  if (!path) return null;
  // грузим через собственный прокси-роут (/api/tmdb-image), а не напрямую с
  // image.tmdb.org — у части пользователей этот CDN заблокирован на уровне
  // сети/провайдера, а у нашего сервера обычный доступ в интернет
  return `/api/tmdb-image?size=${size}&path=${encodeURIComponent(path)}`;
}

const SERIES_STATUS_LABELS: Record<string, string> = {
  "Returning Series": "Продолжается",
  Ended: "Завершён",
  Canceled: "Отменён",
  "In Production": "В производстве",
  Planned: "Запланирован",
  Pilot: "Пилот",
};

export function seriesStatusLabel(status: string) {
  return SERIES_STATUS_LABELS[status] ?? status;
}

const GENRE_NAME_OVERRIDES: Record<number, string> = {
  10765: "Sci-Fi", // TMDb: "Sci-Fi & Fantasy" / "НФ и Фэнтези"
};

export function genreLabel(genre: { id: number; name: string }) {
  return GENRE_NAME_OVERRIDES[genre.id] ?? genre.name;
}
