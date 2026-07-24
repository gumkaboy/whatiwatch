"use client";

import { useState } from "react";
import type { TmdbEpisode, TmdbSeason } from "@/lib/tmdb";
import { removeTracking } from "@/app/actions";
import { EpisodeRow } from "@/components/EpisodeRow";

export function TrackingForm({
  tmdbId,
  posterPath,
  seasons,
  episodesBySeasonNumber,
  watchedBySeasonNumber,
  hasTracking,
  seriesName,
  seriesYear,
  episodeCount,
}: {
  tmdbId: number;
  posterPath: string | null;
  seasons: TmdbSeason[];
  episodesBySeasonNumber: Record<number, TmdbEpisode[]>;
  watchedBySeasonNumber: Record<number, number[]>;
  hasTracking: boolean;
  seriesName: string;
  seriesYear: string | null;
  episodeCount: number;
}) {
  const trackableSeasons = seasons
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  // открываем первый сезон, в котором остались непросмотренные серии
  const defaultSeason =
    trackableSeasons.find(
      (s) => (watchedBySeasonNumber[s.season_number]?.length ?? 0) < s.episode_count
    )?.season_number ??
    trackableSeasons[trackableSeasons.length - 1]?.season_number ??
    0;

  const [season, setSeason] = useState(defaultSeason);

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
              onClick={() => setSeason(s.season_number)}
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
        seriesName={seriesName}
        seriesPosterPath={posterPath}
        seriesYear={seriesYear}
        episodeCount={episodeCount}
      />

      {hasTracking && (
        <form className="remove-form" action={removeTracking} style={{ marginTop: "1.5rem" }}>
          <input type="hidden" name="tmdbId" value={tmdbId} />
          <button type="submit">Убрать из библиотеки</button>
        </form>
      )}
    </>
  );
}
