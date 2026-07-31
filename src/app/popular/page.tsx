import { PopularGrid } from "@/components/PopularGrid";
import { getPopularWellRatedSeries } from "@/lib/tmdb";

export default async function PopularPage() {
  const { items, hasMore } = await getPopularWellRatedSeries(1);

  return (
    <div>
      <h1>Популярное</h1>

      {items.length === 0 && <p className="empty-state">Подборка временно недоступна.</p>}

      {items.length > 0 && <PopularGrid initialItems={items} initialHasMore={hasMore} />}
    </div>
  );
}
