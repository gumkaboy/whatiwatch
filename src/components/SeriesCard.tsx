import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";

const STATUS_LABELS: Record<string, string> = {
  PLANNED: "Хочу посмотреть",
  WATCHING: "Смотрю",
  COMPLETED: "Просмотрено",
  DROPPED: "Брошено",
};

export function SeriesCard({
  tmdbId,
  name,
  posterPath,
  year,
  status,
  watchedCount,
  totalEpisodes,
}: {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  year: string | null;
  status?: string;
  watchedCount?: number;
  totalEpisodes?: number;
}) {
  const poster = tmdbImageUrl(posterPath, "w342");
  const hasProgress = typeof watchedCount === "number" && typeof totalEpisodes === "number" && totalEpisodes > 0;
  const progressPercent = hasProgress ? Math.min(100, Math.round((watchedCount! / totalEpisodes!) * 100)) : 0;

  return (
    <Link href={`/series/${tmdbId}`} className="series-card">
      <div className="series-card-poster-wrap">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={name} className="series-card-poster" />
        ) : (
          <div className="series-card-poster" />
        )}
        {hasProgress && (
          <>
            <span className="series-card-progress-badge">
              {watchedCount}/{totalEpisodes}
            </span>
            <div className="series-card-progress-track">
              <div
                className="series-card-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        )}
      </div>
      <div className="series-card-title">{name}</div>
      {year && <div className="series-card-year">{year}</div>}
      {status && (
        <span className="series-card-status">{STATUS_LABELS[status] ?? status}</span>
      )}
    </Link>
  );
}
