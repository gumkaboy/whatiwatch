"use client";

import { useState, useTransition } from "react";
import { SeriesCard } from "@/components/SeriesCard";
import { loadMorePopular } from "@/app/popular/actions";

type Item = { tmdbId: number; name: string; posterPath: string | null; year: string | null };

export function PopularGrid({
  initialItems,
  initialHasMore,
}: {
  initialItems: Item[];
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    const nextPage = page + 1;
    startTransition(async () => {
      const next = await loadMorePopular(nextPage);
      setItems((prev) => [...prev, ...next.items]);
      setHasMore(next.hasMore);
      setPage(nextPage);
    });
  }

  return (
    <>
      <div className="series-grid">
        {items.map((series) => (
          <SeriesCard
            key={series.tmdbId}
            tmdbId={series.tmdbId}
            name={series.name}
            posterPath={series.posterPath}
            year={series.year}
          />
        ))}
      </div>

      {hasMore && (
        <div className="popular-load-more">
          <button type="button" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "Загрузка…" : "Загрузить ещё"}
          </button>
        </div>
      )}
    </>
  );
}
