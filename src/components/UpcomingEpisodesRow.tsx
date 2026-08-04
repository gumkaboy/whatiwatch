import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";

type UpcomingEpisode = {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string;
};

function formatAirDate(airDate: string) {
  const date = new Date(airDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Завтра";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function UpcomingEpisodesRow({ items }: { items: UpcomingEpisode[] }) {
  if (items.length === 0) {
    return (
      <p className="empty-state">
        Пока нет запланированных серий среди тех сериалов, что вы смотрите.
      </p>
    );
  }

  return (
    <div className="upcoming-episodes-row">
      {items.map((item) => {
        const poster = tmdbImageUrl(item.posterPath, "w200");
        return (
          <Link
            key={item.tmdbId}
            href={`/series/${item.tmdbId}`}
            className="upcoming-episode-card"
          >
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={item.name} className="upcoming-episode-poster" />
            )}
            <div className="upcoming-episode-info">
              <span className="upcoming-episode-name">{item.name}</span>
              <span className="upcoming-episode-episode">
                Сезон {item.seasonNumber} · Серия {item.episodeNumber}
              </span>
              <span className="upcoming-episode-date">{formatAirDate(item.airDate)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
