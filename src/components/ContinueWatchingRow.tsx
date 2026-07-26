"use client";

import { useEffect, useRef } from "react";
import { PosterTile } from "@/components/PosterTile";

type Item = { tmdbId: number; name: string; posterPath: string | null };

export function ContinueWatchingRow({ items }: { items: Item[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const interval = setInterval(() => {
      if (pausedRef.current) return;
      track.scrollLeft += 1;
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half) {
        track.scrollLeft -= half;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return <p className="empty-state">Пока нечего продолжить — начните смотреть что-то из библиотеки.</p>;
  }

  const doubled = [...items, ...items];

  function scrollByTiles(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 400, behavior: "smooth" });
  }

  return (
    <div
      className="continue-watching-row"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <button
        type="button"
        className="continue-watching-arrow continue-watching-arrow-left"
        aria-label="Назад"
        onClick={() => scrollByTiles(-1)}
      >
        ‹
      </button>

      <div className="continue-watching-track" ref={trackRef}>
        {doubled.map((item, i) => (
          <PosterTile
            key={`${item.tmdbId}-${i}`}
            tmdbId={item.tmdbId}
            name={item.name}
            posterPath={item.posterPath}
            style={{ flex: "0 0 auto" }}
          />
        ))}
      </div>

      <button
        type="button"
        className="continue-watching-arrow continue-watching-arrow-right"
        aria-label="Вперёд"
        onClick={() => scrollByTiles(1)}
      >
        ›
      </button>
    </div>
  );
}
