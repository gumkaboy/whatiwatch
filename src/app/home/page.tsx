import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PosterCarouselRow } from "@/components/PosterCarouselRow";
import { getPopularSeriesFromTrakt } from "@/lib/trakt";

export default async function HomeDashboardPage() {
  const session = await auth();
  const userId = Number(session!.user.id);

  const [lastWatchedBySeries, popular] = await Promise.all([
    prisma.watchedEpisode.groupBy({
      by: ["tmdbId"],
      where: { userId },
      _max: { watchedAt: true },
      orderBy: { _max: { watchedAt: "desc" } },
    }),
    getPopularSeriesFromTrakt(),
  ]);

  const tmdbIds = lastWatchedBySeries.map((row) => row.tmdbId);

  const seriesEntries =
    tmdbIds.length > 0
      ? await prisma.series.findMany({
          where: { userId, tmdbId: { in: tmdbIds } },
        })
      : [];

  const seriesByTmdbId = new Map(seriesEntries.map((s) => [s.tmdbId, s]));

  const continueWatching = tmdbIds
    .map((tmdbId) => seriesByTmdbId.get(tmdbId))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
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
          Продолжить просмотр <span className="home-section-title-arrow">&gt;</span>
        </h2>
        <PosterCarouselRow
          items={continueWatching}
          emptyMessage="Пока нечего продолжить — начните смотреть что-то из библиотеки."
        />
      </section>

      <section className="home-section">
        <h2 className="home-section-title">
          Популярное <span className="home-section-title-arrow">&gt;</span>
        </h2>
        <PosterCarouselRow items={popular} emptyMessage="Подборка временно недоступна." />
      </section>
    </div>
  );
}
