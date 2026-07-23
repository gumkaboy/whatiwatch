import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";

const STATUS_LABELS: Record<string, string> = {
  PLANNED: "В планах",
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
}: {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  year: string | null;
  status?: string;
}) {
  const poster = tmdbImageUrl(posterPath, "w342");

  return (
    <Link href={`/series/${tmdbId}`} className="series-card">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={name} className="series-card-poster" />
      ) : (
        <div className="series-card-poster" />
      )}
      <div className="series-card-title">{name}</div>
      {year && <div className="series-card-year">{year}</div>}
      {status && (
        <span className="series-card-status">{STATUS_LABELS[status] ?? status}</span>
      )}
    </Link>
  );
}
