"use client";

import { useState } from "react";
import type { TmdbEpisode, TmdbSeason } from "@/lib/tmdb";
import { saveTracking, removeTracking } from "@/app/actions";
import { EpisodeRow } from "@/components/EpisodeRow";

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "В планах" },
  { value: "WATCHING", label: "Смотрю" },
  { value: "COMPLETED", label: "Просмотрено" },
  { value: "DROPPED", label: "Брошено" },
];

export function TrackingForm({
  tmdbId,
  name,
  posterPath,
  year,
  seasons,
  episodesBySeasonNumber,
  watchedBySeasonNumber,
  hasTracking,
  createdAt,
  initialStatus,
  initialEpisode,
  initialRating,
}: {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  year: string | null;
  seasons: TmdbSeason[];
  episodesBySeasonNumber: Record<number, TmdbEpisode[]>;
  watchedBySeasonNumber: Record<number, number[]>;
  hasTracking: boolean;
  createdAt: string | null;
  initialStatus: string;
  initialEpisode: number;
  initialRating: number | null;
}) {
  const trackableSeasons = seasons
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  // открываем первый сезон, в котором остались непросмотренные серии
  // (а не старый ручной прогресс — раз есть реальные отметки глазиком, ориентируемся на них)
  const defaultSeason =
    trackableSeasons.find(
      (s) => (watchedBySeasonNumber[s.season_number]?.length ?? 0) < s.episode_count
    )?.season_number ??
    trackableSeasons[trackableSeasons.length - 1]?.season_number ??
    0;

  const [season, setSeason] = useState(defaultSeason);
  const [episode, setEpisode] = useState(initialEpisode);

  const episodeCount =
    trackableSeasons.find((s) => s.season_number === season)?.episode_count ?? 0;

  function handleSeasonChange(newSeason: number) {
    setSeason(newSeason);
    // при смене сезона номер серии из другого сезона не имеет смысла
    if (newSeason !== defaultSeason) {
      setEpisode(0);
    } else {
      setEpisode(initialEpisode);
    }
  }

  return (
    <>
      <div className="season-picker">
        <span className="season-picker-label">Сезоны</span>
        <div className="season-tabs">
          {trackableSeasons.map((s) => (
            <button
              key={s.season_number}
              type="button"
              className="season-tab"
              data-active={season === s.season_number}
              onClick={() => handleSeasonChange(s.season_number)}
            >
              {s.season_number}
            </button>
          ))}
        </div>
      </div>

      <EpisodeRow
        key={season}
        tmdbId={tmdbId}
        seasonNumber={season}
        episodes={episodesBySeasonNumber[season] ?? []}
        watchedEpisodeNumbers={watchedBySeasonNumber[season] ?? []}
        fallbackImagePath={
          trackableSeasons.find((s) => s.season_number === season)?.poster_path ?? posterPath
        }
      />

      <form className="tracking-form" action={saveTracking}>
        <input type="hidden" name="tmdbId" value={tmdbId} />
        <input type="hidden" name="name" value={name} />
        {posterPath && <input type="hidden" name="posterPath" value={posterPath} />}
        {year && <input type="hidden" name="year" value={year} />}
        <input type="hidden" name="currentSeason" value={season} />

        <div className="tracking-form-row">
          <div className="field">
            <label htmlFor="status">Статус</label>
            <select id="status" name="status" defaultValue={initialStatus}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="currentEpisode">Серия</label>
            <select
              id="currentEpisode"
              name="currentEpisode"
              value={Math.min(episode, episodeCount)}
              onChange={(e) => setEpisode(Number(e.target.value))}
              disabled={episodeCount === 0}
            >
              <option value={0}>—</option>
              {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="rating">Моя оценка</label>
            <select id="rating" name="rating" defaultValue={initialRating ?? ""}>
              <option value="">—</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">Сохранить</button>
          {hasTracking && createdAt && (
            <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>В библиотеке с {createdAt}</span>
          )}
        </div>
      </form>

      {hasTracking && (
        <form className="remove-form" action={removeTracking} style={{ marginTop: "0.75rem" }}>
          <input type="hidden" name="tmdbId" value={tmdbId} />
          <button type="submit">Убрать из библиотеки</button>
        </form>
      )}
    </>
  );
}
