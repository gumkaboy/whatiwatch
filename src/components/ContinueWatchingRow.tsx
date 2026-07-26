"use client";

import { useEffect, useRef, useState } from "react";
import { PosterTile } from "@/components/PosterTile";

type Item = { tmdbId: number; name: string; posterPath: string | null };

export function ContinueWatchingRow({ items }: { items: Item[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [needsCarousel, setNeedsCarousel] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const checkOverflow = () => {
      // измеряем ширину одной копии (до дублирования) относительно видимой области
      const singleWidth = needsCarousel ? track.scrollWidth / 2 : track.scrollWidth;
      setNeedsCarousel(singleWidth > track.clientWidth + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    if (!needsCarousel) return;
    const track = trackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      if (pausedRef.current) return;
      track.scrollLeft += 1;
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half) {
        track.scrollLeft -= half;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [needsCarousel]);

  if (items.length === 0) {
    return <p className="empty-state">Пока нечего продолжить — начните смотреть что-то из библиотеки.</p>;
  }

  const displayItems = needsCarousel ? [...items, ...items] : items;

  function scrollByTiles(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 400, behavior: "smooth" });
  }

  return (
    <div
      className="continue-watching-row"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {needsCarousel && (
        <button
          type="button"
          className="continue-watching-arrow continue-watching-arrow-left"
          aria-label="Назад"
          onClick={() => scrollByTiles(-1)}
        >
          ‹
        </button>
      )}

      <div
        className={`continue-watching-track${needsCarousel ? "" : " continue-watching-track-static"}`}
        ref={trackRef}
      >
        {displayItems.map((item, i) => (
          <PosterTile
            key={`${item.tmdbId}-${i}`}
            tmdbId={item.tmdbId}
            name={item.name}
            posterPath={item.posterPath}
            style={{ flex: "0 0 auto" }}
          />
        ))}
      </div>

      {needsCarousel && (
        <button
          type="button"
          className="continue-watching-arrow continue-watching-arrow-right"
          aria-label="Вперёд"
          onClick={() => scrollByTiles(1)}
        >
          ›
        </button>
      )}
    </div>
  );
}
