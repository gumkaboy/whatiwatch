import { notFound } from "next/navigation";
import {
  genreLabel,
  getSeasonEpisodes,
  getSeriesBackdrops,
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
import { StarRating } from "@/components/StarRating";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { SeriesActions } from "@/components/SeriesActions";
import { CommentSection, type CommentItem } from "@/components/CommentSection";

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

  const [series, tracking, trailerKey, externalIds, watchedEpisodes, siteRatingAgg, backdrops, comments] =
    await Promise.all([
      getSeriesDetails(tmdbId).catch(() => null),
      prisma.series.findUnique({ where: { userId_tmdbId: { userId, tmdbId } } }),
      getSeriesTrailerKey(tmdbId).catch(() => null),
      getSeriesExternalIds(tmdbId).catch(() => null),
      prisma.watchedEpisode.findMany({ where: { userId, tmdbId } }),
      prisma.series.aggregate({
        where: { tmdbId, rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      getSeriesBackdrops(tmdbId).catch(() => []),
      prisma.comment.findMany({
        where: { tmdbId },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

  const siteRating = siteRatingAgg._avg.rating;
  const siteRatingCount = siteRatingAgg._count.rating;

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

  const trackableSeasonNumbers = series.seasons
    .map((s) => s.season_number)
    .filter((n) => n > 0);

  const [imdbRating, kinopoiskRating, episodesArrays] = await Promise.all([
    externalIds?.imdb_id
      ? getImdbRating(externalIds.imdb_id).catch(() => null)
      : Promise.resolve(null),
    externalIds?.imdb_id
      ? getKinopoiskRating(series.name, externalIds.imdb_id).catch(() => null)
      : Promise.resolve(null),
    Promise.all(trackableSeasonNumbers.map((n) => getSeasonEpisodes(tmdbId, n).catch(() => []))),
  ]);

  const episodesBySeasonNumber: Record<number, TmdbEpisode[]> = {};
  trackableSeasonNumbers.forEach((n, i) => {
    episodesBySeasonNumber[n] = episodesArrays[i];
  });

  const now = new Date();
  const airedEpisodesAll = trackableSeasonNumbers.flatMap((n) =>
    (episodesBySeasonNumber[n] ?? [])
      .filter((ep) => ep.air_date && new Date(ep.air_date) <= now)
      .map((ep) => ({ seasonNumber: n, episodeNumber: ep.episode_number }))
  );
  const allAiredWatched =
    airedEpisodesAll.length > 0 &&
    airedEpisodesAll.every((e) => watchedBySeasonNumber[e.seasonNumber]?.includes(e.episodeNumber));

  const networkLogo = series.networks[0]?.logo_path
    ? tmdbImageUrl(series.networks[0].logo_path, "w300")
    : null;

  const commentItems: CommentItem[] = comments.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt.toISOString(),
    authorName: `${c.user.firstName} ${c.user.lastName}`.trim(),
    isOwn: c.userId === userId,
  }));

  const poster = tmdbImageUrl(series.poster_path, "w500");
  const initialUserRating = tracking?.rating ?? null;
  const seriesYear = series.first_air_date?.slice(0, 4) ?? null;
  const backgroundUrl = tmdbImageUrl(tracking?.backgroundPath ?? null, "original");

  return (
    <div className="series-page">
      {backgroundUrl && (
        <div
          className="series-backdrop"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}

      <div className="series-detail">
        <div className="series-poster-col">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt={series.name} className="series-detail-poster" />
          ) : (
            <div className="series-detail-poster" />
          )}

          <div className="rating-variant-side">
            <StarRating
              tmdbId={tmdbId}
              name={series.name}
              posterPath={series.poster_path}
              year={seriesYear}
              initialRating={initialUserRating}
              className="star-rating-vertical"
            />
          </div>
        </div>

        <div className="series-content">
          <div className="series-info">
            <div className="series-title-row">
              <h1 className="series-title">{series.name}</h1>
              <SeriesActions
                tmdbId={tmdbId}
                name={series.name}
                posterPath={series.poster_path}
                year={seriesYear}
                initialSaved={!!tracking}
                initialAllWatched={allAiredWatched}
              />
            </div>
            {networkLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={networkLogo}
                alt={series.networks[0].name}
                className="series-network-logo"
              />
            )}
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
            {(imdbRating || kinopoiskRating || siteRatingCount > 0) && (
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
                {siteRatingCount > 0 && siteRating != null && (
                  <span
                    className="rating-item"
                    title={`Оценили: ${siteRatingCount} чел.`}
                  >
                    <span className="rating-logo rating-logo-site">★</span>
                    {siteRating.toFixed(1)}
                    <span className="rating-count">({siteRatingCount})</span>
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
        posterPath={series.poster_path}
        seasons={series.seasons}
        episodesBySeasonNumber={episodesBySeasonNumber}
        watchedBySeasonNumber={watchedBySeasonNumber}
        seriesName={series.name}
        seriesYear={seriesYear}
        episodeCount={airedEpisodesAll.length}
      />

      <BackgroundPicker
        tmdbId={tmdbId}
        backdrops={backdrops.map((b) => b.file_path)}
        initialBackgroundPath={tracking?.backgroundPath ?? null}
      />

      <CommentSection tmdbId={tmdbId} initialComments={commentItems} />
    </div>
  );
}
