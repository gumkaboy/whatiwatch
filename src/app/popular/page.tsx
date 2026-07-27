import { SeriesCard } from "@/components/SeriesCard";
import { getPopularSeriesFromTrakt } from "@/lib/trakt";

export default async function PopularPage() {
  const popular = await getPopularSeriesFromTrakt(100);

  return (
    <div>
      <h1>Популярное</h1>

      {popular.length === 0 && <p className="empty-state">Подборка временно недоступна.</p>}

      {popular.length > 0 && (
        <div className="series-grid">
          {popular.map((series) => (
            <SeriesCard
              key={series.tmdbId}
              tmdbId={series.tmdbId}
              name={series.name}
              posterPath={series.posterPath}
              year={series.year}
            />
          ))}
        </div>
      )}
    </div>
  );
}
