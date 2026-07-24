import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SeriesCard } from "@/components/SeriesCard";
import { WatchStatus } from "@/generated/prisma/client";

const FILTERS: { value: WatchStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "WATCHING", label: "Смотрю" },
  { value: "PLANNED", label: "В планах" },
  { value: "COMPLETED", label: "Просмотрено" },
];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = (status as WatchStatus | undefined) ?? "ALL";

  const session = await auth();
  const userId = Number(session!.user.id);

  const entries = await prisma.series.findMany({
    where: activeFilter === "ALL" ? { userId } : { userId, status: activeFilter },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1>Моя библиотека</h1>

      <div className="library-filters">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/library" : `/library?status=${f.value}`}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
