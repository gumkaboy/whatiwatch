import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PosterCarouselRow } from "@/components/PosterCarouselRow";
import { getPopularSeriesFromTrakt } from "@/lib/trakt";
import { getSeriesDetails, getSeasonEpisodes } from "@/lib/tmdb";

async function hasUnwatchedAiredEpisodes(tmdbId: number, watchedCount: number) {
  try {
    const series = await getSeriesDetails(tmdbId);
    const seasonNumbers = series.seasons.map((s) => s.season_number).filter((n) => n > 0);
    const now = new Date();

    let airedCount = 0;
    for (const seasonNumber of seasonNumbers) {
      const episodes = await getSeasonEpisodes(tmdbId, seasonNumber);
      for (const ep of episodes) {
        if (ep.air_date && new Date(ep.air_date) <= now) airedCount++;
      }
    }

    return watchedCount < airedCount;
  } catch {
    // TMDb недоступен — не выкидываем сериал из подборки из-за временной ошибки
    return false;
  }
}

export default async function HomeDashboardPage() {
  const session = await auth();
  const userId = Number(session!.user.id);

  const [lastWatchedBySeries, popularPage] = await Promise.all([
    prisma.watchedEpisode.groupBy({
      by: ["tmdbId"],
      where: { userId },
      _max: { watchedAt: true },
      _count: { _all: true },
      orderBy: { _max: { watchedAt: "desc" } },
    }),
    getPopularSeriesFromTrakt(),
  ]);
  const popular = popularPage.items;

  const tmdbIds = lastWatchedBySeries.map((row) => row.tmdbId);
  const watchedCountByTmdbId = new Map(
    lastWatchedBySeries.map((row) => [row.tmdbId, row._count._all])
  );

  const seriesEntries =
    tmdbIds.length > 0
      ? await prisma.series.findMany({
          where: { userId, tmdbId: { in: tmdbIds } },
        })
      : [];

  const seriesByTmdbId = new Map(seriesEntries.map((s) => [s.tmdbId, s]));

  // сохраняем порядок по дате последнего просмотра
  const candidates = tmdbIds
    .map((tmdbId) => seriesByTmdbId.get(tmdbId))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
    .filter((s) => s.status !== "DROPPED");

  // для "просмотрено" статус мог устареть — проверяем, не вышли ли новые серии
  const includeFlags = await Promise.all(
    candidates.map((s) =>
      s.status === "COMPLETED"
        ? hasUnwatchedAiredEpisodes(s.tmdbId, watchedCountByTmdbId.get(s.tmdbId) ?? 0)
        : Promise.resolve(true)
    )
  );

  const continueWatching = candidates
    .filter((_, i) => includeFlags[i])
    .map((s) => ({ tmdbId: s.tmdbId, name: s.name || "Без названия", posterPath: s.posterPath }));

  return (
    <div className="home-page">
      <form className="home-search" action="/search">
        <input type="text" name="q" placeholder="Найти сериал..." />
        <button type="submit" aria-label="Искать">
          🔍
        </button>
      </form>

      <section className="home-section">
        <h2 className="home-section-title">
          <Link href="/library?status=WATCHING">
            Продолжить просмотр <span className="home-section-title-arrow">&gt;</span>
          </Link>
        </h2>
        <PosterCarouselRow
          items={continueWatching}
          emptyMessage="Пока нечего продолжить — начните смотреть что-то из библиотеки."
          storageKey="continue-watching"
        />
      </section>

      <section className="home-section">
        <h2 className="home-section-title">
          <Link href="/popular">
            Популярное <span className="home-section-title-arrow">&gt;</span>
          </Link>
        </h2>
        <PosterCarouselRow
          items={popular}
          emptyMessage="Подборка временно недоступна."
          storageKey="popular"
        />
      </section>
    </div>
  );
}
