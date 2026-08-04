import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";
import { formatUpcomingDate } from "@/lib/formatDate";

type Premiere = {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  firstAirDate: string;
};

export function PremieresRow({ items }: { items: Premiere[] }) {
  if (items.length === 0) {
    return <p className="empty-state">В ближайшие пару недель премьер не намечается.</p>;
  }

  return (
    <div className="upcoming-episodes-row">
      {items.map((item) => {
        const poster = tmdbImageUrl(item.posterPath, "w200");
        return (
          <Link key={item.tmdbId} href={`/series/${item.tmdbId}`} className="premiere-card">
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={item.name} className="premiere-poster" />
            )}
            <div className="premiere-info">
              <span className="premiere-name">{item.name}</span>
              <span className="premiere-date">{formatUpcomingDate(item.firstAirDate)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
