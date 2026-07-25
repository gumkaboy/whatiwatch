"use client";

import { useState } from "react";
import { markAllAiredWatched, toggleLibrarySave } from "@/app/actions";

export function SeriesActions({
  tmdbId,
  name,
  posterPath,
  year,
  initialSaved,
  initialAllWatched,
}: {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  year: string | null;
  initialSaved: boolean;
  initialAllWatched: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [allWatched, setAllWatched] = useState(initialAllWatched);
  const [savePending, setSavePending] = useState(false);
  const [markPending, setMarkPending] = useState(false);

  function handleSave() {
    const prev = saved;
    setSaved(!prev);
    setSavePending(true);

    toggleLibrarySave(tmdbId, name, posterPath, year)
      .then(() => window.location.reload())
      .catch(() => {
        setSaved(prev);
        setSavePending(false);
      });
  }

  function handleMarkAllWatched() {
    const prev = allWatched;
    setAllWatched(!prev);
    setMarkPending(true);

    markAllAiredWatched(tmdbId)
      .then(() => window.location.reload())
      .catch(() => {
        setAllWatched(prev);
        setMarkPending(false);
      });
  }

  return (
    <div className="series-actions">
      <button
        type="button"
        className="series-save-btn"
        data-active={saved}
        disabled={savePending}
        title={saved ? "Убрать из библиотеки" : "Хочу посмотреть"}
        aria-label={saved ? "Убрать из библиотеки" : "Хочу посмотреть"}
        onClick={handleSave}
      >
        <span className="series-save-icon series-save-icon-outline" />
        <span className="series-save-icon series-save-icon-filled" />
      </button>
      <button
        type="button"
        className="series-action-btn"
        data-active={allWatched}
        disabled={markPending}
        title={allWatched ? "Убрать отметку, что сериал просмотрен" : "Отметить сериал как просмотренный"}
        aria-label={allWatched ? "Убрать отметку, что сериал просмотрен" : "Отметить сериал как просмотренный"}
        onClick={handleMarkAllWatched}
      >
        👁
      </button>
    </div>
  );
}
