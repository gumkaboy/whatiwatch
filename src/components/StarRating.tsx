"use client";

import { useState } from "react";
import { setRating } from "@/app/actions";

export function StarRating({
  tmdbId,
  name,
  posterPath,
  year,
  initialRating,
  className,
}: {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  year: string | null;
  initialRating: number | null;
  className?: string;
}) {
  const [rating, setRatingState] = useState(initialRating ?? 0);
  const [hover, setHover] = useState<number | null>(null);

  function handleClick(n: number) {
    const newRating = rating === n ? null : n;
    const prev = rating;
    setRatingState(newRating ?? 0);

    setRating(tmdbId, name, posterPath, year, newRating).catch(() => {
      setRatingState(prev);
    });
  }

  const displayValue = hover ?? rating;

  return (
    <div className={`star-rating ${className ?? ""}`} onMouseLeave={() => setHover(null)}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const fillPercent = Math.max(0, Math.min(1, displayValue - (n - 1))) * 100;
        return (
          <span key={n} className="star-slot">
            <span className="star-bg">★</span>
            <span className="star-fill-wrap" style={{ height: `${fillPercent}%` }}>
              <span className="star-fill">★</span>
            </span>
            <button
              type="button"
              className="star-hit star-hit-bottom"
              onMouseEnter={() => setHover(n - 0.5)}
              onClick={() => handleClick(n - 0.5)}
              aria-label={`Оценить на ${n - 0.5} из 10`}
            />
            <button
              type="button"
              className="star-hit star-hit-top"
              onMouseEnter={() => setHover(n)}
              onClick={() => handleClick(n)}
              aria-label={`Оценить на ${n} из 10`}
            />
          </span>
        );
      })}
    </div>
  );
}
