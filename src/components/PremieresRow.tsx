import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";
import { formatUpcomingDate } from "@/lib/formatDate";

type Premiere = {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  firstAirDate: string;
  overview: string;
  network: string | null;
};

export function PremieresRow({ items }: { items: Premiere[] }) {
  if (items.length === 0) {
    return <p className="empty-state">В ближайшие пару недель премьер не намечается.</p>;
  }

  return (
    <div className="premieres-list">
      {items.map((item) => {
        const poster = tmdbImageUrl(item.posterPath, "w300");
        return (
          <Link key={item.tmdbId} href={`/series/${item.tmdbId}`} className="premiere-card">
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={item.name} className="premiere-poster" />
            )}
            <div className="premiere-body">
              <span className="premiere-name">{item.name}</span>
              <span className="premiere-date">{formatUpcomingDate(item.firstAirDate)}</span>
              {item.network && <span className="premiere-network">{item.network}</span>}
              {item.overview && <p className="premiere-overview">{item.overview}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
