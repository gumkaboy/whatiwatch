import { searchSeries } from "@/lib/tmdb";
import { SeriesCard } from "@/components/SeriesCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchSeries(query) : null;

  return (
    <div>
      <h1>Поиск сериалов</h1>
      <form className="search-form" action="/search">
        <input
          type="text"
          name="q"
          placeholder="Название сериала..."
          defaultValue={query}
          autoFocus
        />
        <button type="submit">Искать</button>
      </form>

      {!query && <p className="empty-state">Введите название сериала, чтобы начать поиск.</p>}

      {query && results && results.results.length === 0 && (
        <p className="empty-state">Ничего не найдено по запросу «{query}».</p>
      )}

      {results && results.results.length > 0 && (
        <div className="series-grid">
          {results.results.map((series) => (
            <SeriesCard
              key={series.id}
              tmdbId={series.id}
              name={series.name}
              posterPath={series.poster_path}
              year={series.first_air_date?.slice(0, 4) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
