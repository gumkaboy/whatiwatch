import { notFound } from "next/navigation";
import {
  genreLabel,
  getSeasonEpisodes,
  getSeriesDetails,
  getSeriesExternalIds,
  getSeriesTrailerKey,
  seriesStatusLabel,
  tmdbImageUrl,
  type TmdbEpisode,
} from "@/lib/tmdb";
import { getImdbRating } from "@/lib/omdb";
import { getKinopoiskRating } from "@/lib/kinopoisk";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TrackingForm } from "@/components/TrackingForm";

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  const session = await auth();
  const userId = Number(session!.user.id);

  const [series, tracking, trailerKey, externalIds, watchedEpisodes] = await Promise.all([
    getSeriesDetails(tmdbId).catch(() => null),
    prisma.series.findUnique({ where: { userId_tmdbId: { userId, tmdbId } } }),
    getSeriesTrailerKey(tmdbId).catch(() => null),
    getSeriesExternalIds(tmdbId).catch(() => null),
    prisma.watchedEpisode.findMany({ where: { userId, tmdbId } }),
  ]);

  if (!series) notFound();

  const watchedBySeasonNumber: Record<number, number[]> = {};
  for (const we of watchedEpisodes) {
    (watchedBySeasonNumber[we.seasonNumber] ??= []).push(we.episodeNumber);
  }
  const watchedCount = watchedEpisodes.length;

  const isOngoing = !["Ended", "Canceled"].includes(series.status);
  const startYear = series.first_air_date?.slice(0, 4);
  const endYear = series.last_air_date?.slice(0, 4);
  const yearRange = isOngoing
    ? `${startYear ?? "—"}–нв`
    : endYear && endYear !== startYear
      ? `${startYear}–${endYear}`
      : (startYear ?? "—");

  const genreText = series.genres.map(genreLabel).join(", ");

  const imdbRating = externalIds?.imdb_id
    ? await getImdbRating(externalIds.imdb_id).catch(() => null)
    : null;

  const kinopoiskRating = externalIds?.imdb_id
    ? await getKinopoiskRating(series.name, externalIds.imdb_id).catch(() => null)
    : null;

  const trackableSeasonNumbers = series.seasons
    .map((s) => s.season_number)
    .filter((n) => n > 0);

  const episodesArrays = await Promise.all(
    trackableSeasonNumbers.map((n) => getSeasonEpisodes(tmdbId, n).catch(() => []))
  );

  const episodesBySeasonNumber: Record<number, TmdbEpisode[]> = {};
  trackableSeasonNumbers.forEach((n, i) => {
    episodesBySeasonNumber[n] = episodesArrays[i];
  });

  const poster = tmdbImageUrl(series.poster_path, "w500");

  return (
    <div className="series-page">
      <div className="series-detail">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={series.name} className="series-detail-poster" />
        ) : (
          <div className="series-detail-poster" />
        )}

        <div className="series-content">
          <div className="series-info">
            <h1 className="series-title">{series.name}</h1>
            <p className="series-meta">
              <span>{yearRange}</span>
              <span className="meta-dot">·</span>
              <span>{genreText}</span>
              <span className="meta-dot">·</span>
              <span>{series.number_of_seasons} сезон(ов)</span>
              <span className="meta-dot">·</span>
              <span>
                {watchedCount}/{series.number_of_episodes} серий
              </span>
            </p>
            {(imdbRating || kinopoiskRating) && (
              <div className="series-rating-badges">
                {imdbRating && (
                  <span className="rating-item">
                    <span className="rating-logo rating-logo-imdb">IMDb</span>
                    {imdbRating.rating.toFixed(1)}
                  </span>
                )}
                {kinopoiskRating && (
                  <span className="rating-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/kp.png" alt="Кинопоиск" className="rating-logo-icon" />
                    {kinopoiskRating.rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
            {series.status && (
              <p className="series-status">{seriesStatusLabel(series.status)}</p>
            )}
            <p className="series-overview">{series.overview || "Описание отсутствует."}</p>
          </div>

          {trailerKey && (
            <div className="series-trailer">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Трейлер"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>

      <TrackingForm
        tmdbId={tmdbId}
        name={series.name}
        posterPath={series.poster_path}
        year={series.first_air_date?.slice(0, 4) ?? null}
        seasons={series.seasons}
        episodesBySeasonNumber={episodesBySeasonNumber}
        watchedBySeasonNumber={watchedBySeasonNumber}
        hasTracking={!!tracking}
        createdAt={tracking?.createdAt.toLocaleDateString("ru-RU") ?? null}
        initialStatus={tracking?.status ?? "PLANNED"}
        initialEpisode={tracking?.currentEpisode ?? 0}
        initialRating={tracking?.rating ?? null}
      />
    </div>
  );
}
