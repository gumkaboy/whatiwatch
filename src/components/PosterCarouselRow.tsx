"use client";

import { useEffect, useRef, useState } from "react";
import { PosterTile } from "@/components/PosterTile";

type Item = { tmdbId: number; name: string; posterPath: string | null };

export function PosterCarouselRow({
  items,
  emptyMessage,
  storageKey,
}: {
  items: Item[];
  emptyMessage: string;
  storageKey?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const manualScrollUntilRef = useRef(0);
  const [needsCarousel, setNeedsCarousel] = useState(false);

  const sessionKey = storageKey ? `poster-carousel-scroll:${storageKey}` : null;

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

  // восстанавливаем позицию скролла из прошлого визита на страницу,
  // чтобы лента не начиналась заново с одних и тех же постеров
  useEffect(() => {
    if (!needsCarousel || !sessionKey) return;
    const track = trackRef.current;
    if (!track) return;

    const saved = Number(sessionStorage.getItem(sessionKey));
    if (saved > 0) {
      const half = track.scrollWidth / 2;
      track.scrollLeft = saved % half;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsCarousel]);

  useEffect(() => {
    if (!needsCarousel) return;
    const track = trackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      if (Date.now() < manualScrollUntilRef.current) return;
      track.scrollLeft += 1;
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half) {
        track.scrollLeft -= half;
      }
      if (sessionKey) sessionStorage.setItem(sessionKey, String(track.scrollLeft));
    }, 30);

    return () => clearInterval(interval);
  }, [needsCarousel, sessionKey]);

  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  const displayItems = needsCarousel ? [...items, ...items] : items;

  function scrollByTiles(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;

    const stepMs = 15;
    const steps = 20;
    const distance = direction * 400;
    const perStep = distance / steps;
    manualScrollUntilRef.current = Date.now() + steps * stepMs + 50;

    let i = 0;
    const stepInterval = setInterval(() => {
      i += 1;
      track.scrollLeft += perStep;

      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half) track.scrollLeft -= half;
      if (track.scrollLeft < 0) track.scrollLeft += half;

      if (i >= steps) clearInterval(stepInterval);
    }, stepMs);
  }

  return (
    <div className="poster-carousel-row">
      {needsCarousel && (
        <button
          type="button"
          className="poster-carousel-arrow poster-carousel-arrow-left"
          aria-label="Назад"
          onClick={() => scrollByTiles(-1)}
        >
          ‹
        </button>
      )}

      <div
        className={`poster-carousel-track${needsCarousel ? "" : " poster-carousel-track-static"}`}
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
          className="poster-carousel-arrow poster-carousel-arrow-right"
          aria-label="Вперёд"
          onClick={() => scrollByTiles(1)}
        >
          ›
        </button>
      )}
    </div>
  );
}
