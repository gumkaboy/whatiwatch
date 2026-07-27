"use client";

import { useState } from "react";
import { tmdbImageUrl } from "@/lib/tmdb";
import { setSeriesBackground } from "@/app/actions";

export function BackgroundPicker({
  tmdbId,
  backdrops,
  initialBackgroundPath,
}: {
  tmdbId: number;
  backdrops: string[];
  initialBackgroundPath: string | null;
}) {
  const [selected, setSelected] = useState(initialBackgroundPath);

  if (backdrops.length === 0) return null;

  function handleSelect(path: string | null) {
    const prev = selected;
    setSelected(path);

    setSeriesBackground(tmdbId, path).catch(() => {
      setSelected(prev);
    });
  }

  return (
    <div className="background-picker">
      <span className="background-picker-label">Фон страницы</span>
      <div className="background-picker-row">
        {selected && (
          <button
            type="button"
            className="background-thumb background-thumb-clear"
            onClick={() => handleSelect(null)}
            aria-label="Убрать фон"
          >
            ✕
          </button>
        )}
        {backdrops.map((path) => (
          <button
            key={path}
            type="button"
            className="background-thumb"
            data-active={selected === path}
            onClick={() => handleSelect(path)}
            aria-label="Выбрать этот фон"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tmdbImageUrl(path, "w300") ?? ""} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
