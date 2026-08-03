import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SeriesCard } from "@/components/SeriesCard";
import { LibraryStats } from "@/components/LibraryStats";
import { WatchStatus } from "@/generated/prisma/client";
import { getAiredEpisodeCount } from "@/lib/tmdb";

const FILTERS: { value: WatchStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "WATCHING", label: "Смотрю" },
  { value: "PLANNED", label: "Хочу посмотреть" },
  { value: "COMPLETED", label: "Просмотрено" },
];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = (status as WatchStatus | "ALL" | undefined) ?? "WATCHING";

  const session = await auth();
  const userId = Number(session!.user.id);

  const [entries, watchedAgg, seriesInProgressCount, watchedByTmdbId] = await Promise.all([
    prisma.series.findMany({
      where: activeFilter === "ALL" ? { userId } : { userId, status: activeFilter },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.watchedEpisode.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { runtime: true },
    }),
    prisma.series.count({
      where: { userId, status: { in: ["WATCHING", "COMPLETED"] } },
    }),
    prisma.watchedEpisode.groupBy({
      by: ["tmdbId"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const watchedCountByTmdbId = new Map(watchedByTmdbId.map((row) => [row.tmdbId, row._count._all]));

  // локальный прототип для оценки вёрстки — прогресс-бар/бейдж пока
  // считаются "на лету" через TMDb, для продакшна на большую библиотеку
  // это нужно будет кэшировать в БД, а не дёргать TMDb на каждый рендер
  const airedCounts = await Promise.all(
    entries.map((entry) => getAiredEpisodeCount(entry.tmdbId).catch(() => null))
  );
  const airedCountByTmdbId = new Map(entries.map((entry, i) => [entry.tmdbId, airedCounts[i]]));

  const episodesCount = watchedAgg._count._all;
  const totalMinutes = watchedAgg._sum.runtime ?? 0;
  const hours = Math.round(totalMinutes / 60);
  const days = Math.round(hours / 24);

  return (
    <div>
      <h1>Моя библиотека</h1>

      <LibraryStats
        seriesCount={seriesInProgressCount}
        episodesCount={episodesCount}
        hours={hours}
        days={days}
      />

      <div className="library-filters">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/library?status=${f.value}`}
            className="library-filter"
            data-active={activeFilter === f.value}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="empty-state">Пока пусто. Найдите сериал через поиск и добавьте его.</p>
      )}

      {entries.length > 0 && (
        <div className="series-grid">
          {entries.map((entry) => (
            <SeriesCard
              key={entry.tmdbId}
              tmdbId={entry.tmdbId}
              name={entry.name || "Без названия"}
              posterPath={entry.posterPath}
              year={entry.year}
              status={entry.status}
              watchedCount={watchedCountByTmdbId.get(entry.tmdbId) ?? 0}
              totalEpisodes={airedCountByTmdbId.get(entry.tmdbId) ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
