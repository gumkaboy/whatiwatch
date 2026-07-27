import { PopularGrid } from "@/components/PopularGrid";
import { getPopularSeriesFromTrakt } from "@/lib/trakt";

export default async function PopularPage() {
  const { items, hasMore } = await getPopularSeriesFromTrakt(100, 1);

  return (
    <div>
      <h1>Популярное</h1>

      {items.length === 0 && <p className="empty-state">Подборка временно недоступна.</p>}

      {items.length > 0 && <PopularGrid initialItems={items} initialHasMore={hasMore} />}
    </div>
  );
}
